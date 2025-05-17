'use client';

import { useEffect, useRef, useState } from 'react';
// import { Maximize, Minimize } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LaserScan } from '@/interfaces/ros/LaserScan';
import URDFLoader, { URDFRobot } from 'urdf-loader';
import useLaserScan from '@/hooks/ros/useLaserScan';
import useJointState from '@/hooks/ros/useJointState';
import useOdometry from '@/hooks/ros/useOdometry';

const showAxis = false;

const createROS3D = () => {
  return {
    Viewer: class {
      scene: THREE.Scene;
      camera: THREE.PerspectiveCamera;
      renderer: THREE.WebGLRenderer;
      controls: OrbitControls;
      robot!: URDFRobot;
      grid: THREE.GridHelper;
      lidarPoints: THREE.Points;
      lidarGeometry: THREE.BufferGeometry;
      robotVelocity: { forward: number; turn: number };
      lastUpdateTime: number;
      pointCloudHistory: Array<{
        positions: number[];
        colors: number[];
        timestamp: number;
      }>;
      decayTime: number;
      cameraOffset: THREE.Vector3;
      followMode: boolean;
      cameraReturnTimeout: NodeJS.Timeout | null;
      lastUserInteraction: number;
      returnDelay: number;

      constructor(options: { divID: string; width: number; height: number }) {
        // Set up Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // Camera follow settings
        this.cameraOffset = new THREE.Vector3(-1.96, 0, 0.98); // 30% closer than before (-2.8, 0, 1.4)
        this.followMode = true;
        this.cameraReturnTimeout = null;
        this.lastUserInteraction = 0;
        this.returnDelay = 1500; // Reduced time to return to follow mode

        // Set up camera
        this.camera = new THREE.PerspectiveCamera(
          75,
          options.width / options.height,
          0.1,
          1000
        );
        // Initial position will be set when robot loads
        this.camera.position.set(-1.96, 0, 0.98); // 30% closer than before
        this.camera.up.set(0, 0, 1);
        this.camera.lookAt(0, 0, 0);

        // Set up renderer
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        document.getElementById(options.divID)?.appendChild(canvas);

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(options.width, options.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Set up controls for camera
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 0.8; // Allow closer zooming
        this.controls.maxDistance = 15; // Allow farther zooming
        this.controls.maxPolarAngle = Math.PI / 1.5; // Prevent going below ground
        this.controls.enableZoom = true;
        this.controls.zoomSpeed = 1.0;
        this.controls.rotateSpeed = 1.0;
        this.controls.panSpeed = 0.8;

        this.controls.mouseButtons = {
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.PAN,
        };
        this.controls.target.set(0, 0, 0);

        // Set up camera return on user interaction
        this.controls.addEventListener('start', () => {
          this.handleUserInteraction();
        });

        // After control ends, schedule camera return
        this.controls.addEventListener('end', () => {
          this.scheduleReturnToFollowMode();
        });

        // Listen for zoom changes to ensure LIDAR visibility
        this.controls.addEventListener('change', () => {
          if (this.lidarPoints) {
            this.lidarPoints.visible = true;
            this.lidarPoints.frustumCulled = false;
          }
        });

        this.controls.update();

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        this.loadURDFRobotModel();

        // Create LIDAR points
        this.lidarGeometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({
          size: 0.1, // Increased point size for better visibility
          vertexColors: true,
          transparent: true,
          opacity: 0.9, // Increased opacity
          sizeAttenuation: true,
          depthWrite: false, // Prevents depth buffer issues
          depthTest: true,
        });
        this.lidarPoints = new THREE.Points(this.lidarGeometry, material);

        // LIDAR rotation matches robot's coordinate system
        // Disable frustum culling to ensure points are always visible
        this.lidarPoints.frustumCulled = false;
        this.lidarPoints.renderOrder = 10; // Render after other objects

        if (showAxis) {
          const lidarAxesHelper = new THREE.AxesHelper(5);
          this.lidarPoints.add(lidarAxesHelper);
        }

        // Add grid
        this.grid = new THREE.GridHelper(10, 20, 0x444444, 0x444444);
        this.grid.position.z = -0.01;

        if (showAxis) {
          const gridAxesHelper = new THREE.AxesHelper(10);
          this.grid.add(gridAxesHelper);
        }

        this.scene.add(this.grid);

        // Initialize robot velocity
        this.robotVelocity = { forward: 0, turn: 0 };
        this.lastUpdateTime = Date.now();
        this.pointCloudHistory = [];
        this.decayTime = 2000; // Reduced decay time for better performance while still showing motion

        // Start animation
        this.animate();
      }

      handleUserInteraction() {
        this.lastUserInteraction = Date.now();
        this.followMode = false;

        // Ensure LIDAR points remain visible during user interaction
        if (this.lidarPoints) {
          this.lidarPoints.visible = true;
          this.lidarPoints.frustumCulled = false;
        }

        // Clear any existing timeout
        if (this.cameraReturnTimeout) {
          clearTimeout(this.cameraReturnTimeout);
          this.cameraReturnTimeout = null;
        }
      }

      scheduleReturnToFollowMode() {
        // Clear existing timeout if there is one
        if (this.cameraReturnTimeout) {
          clearTimeout(this.cameraReturnTimeout);
        }

        // Set new timeout to return to follow mode
        this.cameraReturnTimeout = setTimeout(() => {
          this.followMode = true;
          this.cameraReturnTimeout = null;

          // Animate smooth transition back to follow position
          this.animateReturnToFollowPosition();
        }, this.returnDelay);
      }

      animateReturnToFollowPosition() {
        if (!this.robot) return;

        // Get robot's world position and rotation
        const robotPosition = new THREE.Vector3();
        const robotRotation = new THREE.Quaternion();
        const robotScale = new THREE.Vector3();

        this.robot.matrixWorld.decompose(
          robotPosition,
          robotRotation,
          robotScale
        );

        // Create a rotation matrix that only considers rotation around the Z axis (yaw)
        const yawRotation = new THREE.Quaternion();
        const euler = new THREE.Euler(0, 0, 0, 'XYZ');
        euler.setFromQuaternion(robotRotation, 'XYZ');
        euler.x = 0; // Remove roll
        euler.y = 0; // Remove pitch
        yawRotation.setFromEuler(euler);

        // Calculate the target position for the camera
        const targetOffset = this.cameraOffset
          .clone()
          .applyQuaternion(yawRotation);
        const targetPosition = robotPosition.clone().add(targetOffset);

        // Get current camera position
        const currentPosition = this.camera.position.clone();

        // Calculate the difference
        const delta = targetPosition.clone().sub(currentPosition);

        // Smoothly move the camera toward target position
        this.camera.position.add(delta.multiplyScalar(0.1));

        // Update target to look at the robot
        this.controls.target.copy(robotPosition);
        this.controls.update();
      }

      updateCameraPosition() {
        if (!this.robot || !this.followMode) return;

        // Get robot's world position and rotation
        const robotPosition = new THREE.Vector3();
        const robotRotation = new THREE.Quaternion();
        const robotScale = new THREE.Vector3();

        this.robot.matrixWorld.decompose(
          robotPosition,
          robotRotation,
          robotScale
        );

        // Create a rotation matrix that only considers rotation around the Z axis (yaw)
        // This keeps the camera at a constant height and distance
        const yawRotation = new THREE.Quaternion();
        const euler = new THREE.Euler(0, 0, 0, 'XYZ');
        euler.setFromQuaternion(robotRotation, 'XYZ');
        euler.x = 0; // Remove roll
        euler.y = 0; // Remove pitch
        yawRotation.setFromEuler(euler);

        // Apply only yaw rotation to the offset
        const offsetRotated = this.cameraOffset.clone();
        offsetRotated.applyQuaternion(yawRotation);

        // Set camera position and target
        this.camera.position.copy(robotPosition).add(offsetRotated);
        this.controls.target.copy(robotPosition);

        // Update controls
        this.controls.update();
      }

      setObjectsRotation() {}

      createRobotModel() {
        const robot = new THREE.Group();

        // Base
        const baseGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.4);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x8a2be2 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        robot.add(base);

        // Top
        const topGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.3);
        const topMaterial = new THREE.MeshPhongMaterial({ color: 0xb388ff });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 0.15;
        robot.add(top);

        // LIDAR mount
        const sensorGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
        const sensorMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
        sensor.position.y = 0.25;
        robot.add(sensor);

        return robot;
      }

      loadURDFRobotModel() {
        const loader = new URDFLoader();
        const baseURL = '/robot-models/';

        // Set the base path for mesh loading
        loader.packages = {
          '': baseURL, // Empty string acts as the default package path
        };

        console.log(
          'Loading URDF model from',
          baseURL + 'go2_description.urdf'
        );

        loader.load(
          '/robot-models/go2_description.urdf',
          (robotModel) => {
            console.log('URDF model loaded successfully:', robotModel);

            if (showAxis) {
              const axesHelper = new THREE.AxesHelper(1);
              robotModel.add(axesHelper);
            }

            robotModel.name = 'URDF Robot';
            this.robot = robotModel;

            // Center the robot at origin initially
            this.robot.position.set(0, 0, 0);
            this.robot.rotation.set(0, 0, 0);
            this.robot.updateMatrixWorld(true);

            // Scale robot if needed
            // robotModel.scale.set(0.5, 0.5, 0.5);

            this.scene.add(this.robot);
            this.scene.add(this.lidarPoints);

            // Disable frustum culling for lidar points to keep them visible
            this.lidarPoints.frustumCulled = false;

            // Update grid to match robot orientation
            this.grid.rotation.set(Math.PI / 2, 1, this.robot.rotation.z);

            // Initialize camera position based on robot position
            this.updateCameraPosition();

            // Render the scene after robot is loaded
            this.renderer.render(this.scene, this.camera);
          },
          (progress) => {
            console.log('Loading progress:', progress);
          },
          (error) => {
            console.error('Error loading URDF:', error);
          }
        );
      }

      updateLidarPoints(scan: LaserScan) {
        const positions: number[] = [];
        const colors: number[] = [];
        const intensities: number[] = [];

        // Make sure the robot is loaded before trying to transform points
        if (!this.robot) return;

        // Get robot's world position and rotation
        const robotPosition = new THREE.Vector3();
        const robotRotation = new THREE.Quaternion();
        const robotScale = new THREE.Vector3();

        this.robot.matrixWorld.decompose(
          robotPosition,
          robotRotation,
          robotScale
        );

        // Create transformation matrix for converting from robot local space to world space
        const robotMatrix = new THREE.Matrix4();
        robotMatrix.compose(robotPosition, robotRotation, robotScale);

        scan.ranges.forEach((range, i) => {
          if (range >= scan.range_min && range <= scan.range_max) {
            const angle = scan.angle_min + i * scan.angle_increment;

            // In ROS coordinate system:
            // X is forward, Y is left, Z is up
            // Create point in lidar's local space aligned with the robot's coordinate frame

            const localPoint = new THREE.Vector3(
              range * Math.cos(angle), // Forward direction
              range * Math.sin(angle), // Left/right direction
              0.16 // Z height of LIDAR reduced by 60% (from 0.4)
            );

            // Transform to world space
            const worldPoint = localPoint.clone().applyMatrix4(robotMatrix);

            // Add to positions array
            positions.push(worldPoint.x, worldPoint.y, worldPoint.z);

            // Create color based on distance for better visualization
            const distanceRatio = range / scan.range_max;
            const intensity = scan.intensities[i] / 255;

            // Use vibrant color gradient for better visibility
            const color = new THREE.Color();
            color.setHSL(
              0.6 - distanceRatio * 0.4, // Blue to purple hue range
              0.85, // High saturation for better visibility
              0.5 + distanceRatio * 0.3 // Brighter for closer points
            );

            colors.push(color.r, color.g, color.b);
            intensities.push(intensity);
          }
        });

        // Add current point cloud to history with current timestamp
        this.pointCloudHistory.push({
          positions: [...positions],
          colors: [...colors],
          timestamp: Date.now(),
        });

        // Combine all points from history within decay time
        const allPositions: number[] = [];
        const allColors: number[] = [];
        const currentTime = Date.now();

        // Remove expired point clouds and combine valid ones
        this.pointCloudHistory = this.pointCloudHistory.filter((cloud) => {
          const age = currentTime - cloud.timestamp;
          const isValid = age <= this.decayTime;

          if (isValid) {
            // Apply opacity based on age for fade-out effect
            const opacityFactor = 1 - age / this.decayTime;

            // Add all points from this cloud
            for (let i = 0; i < cloud.positions.length; i += 3) {
              allPositions.push(
                cloud.positions[i],
                cloud.positions[i + 1],
                cloud.positions[i + 2]
              );

              // Apply fading effect by adjusting color brightness
              allColors.push(
                cloud.colors[i] * opacityFactor,
                cloud.colors[i + 1] * opacityFactor,
                cloud.colors[i + 2] * opacityFactor
              );
            }
          }

          return isValid;
        });

        // Update geometry with combined point cloud data
        this.lidarGeometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(allPositions, 3)
        );
        this.lidarGeometry.setAttribute(
          'color',
          new THREE.Float32BufferAttribute(allColors, 3)
        );

        this.lidarGeometry.attributes.position.needsUpdate = true;
        this.lidarGeometry.attributes.color.needsUpdate = true;

        // Ensure points are always visible regardless of camera position
        this.lidarPoints.frustumCulled = false;
        this.lidarPoints.visible = true;
      }

      animate = () => {
        requestAnimationFrame(this.animate);

        // Update robot position based on velocity
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = currentTime;

        if (this.robotVelocity.forward !== 0 || this.robotVelocity.turn !== 0) {
          // Move robot forward/backward
          const moveSpeed = 5; // Units per second
          const turnSpeed = 4; // Radians per second

          // Update position
          const forwardDistance =
            this.robotVelocity.forward * moveSpeed * deltaTime;
          this.robot.position.x +=
            Math.sin(this.robot.rotation.y) * forwardDistance;
          this.robot.position.z +=
            Math.cos(this.robot.rotation.y) * forwardDistance;

          // Update rotation
          this.robot.rotation.y +=
            this.robotVelocity.turn * turnSpeed * deltaTime;
        }

        // Update camera to follow robot if in follow mode
        if (this.followMode) {
          this.updateCameraPosition();
        }

        // Always ensure LIDAR points are visible
        if (this.lidarPoints) {
          this.lidarPoints.visible = true;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      };

      setSize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }

      updateRobotMovement(forward: number, turn: number) {
        this.robotVelocity = { forward, turn };
      }

      dispose() {
        this.controls.dispose();
        this.renderer.dispose();
        const canvas = this.renderer.domElement;
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }
    },
  };
};

const ros3d = createROS3D();

export function Robot3DViewer({
  canvasInitialHeight,
}: {
  canvasInitialHeight?: number;
}) {
  const parentContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const laserScan = useLaserScan();
  const jointState = useJointState();
  const odometry = useOdometry();

  // Resize hook
  useEffect(() => {
    if (!containerRef.current || !parentContainerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = canvasInitialHeight ?? containerRef.current.clientHeight;

    // Create viewer
    const viewer = new ros3d.Viewer({
      divID: 'robot-3d-container',
      width: width,
      height: height,
    });

    viewerRef.current = viewer;

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current && parentContainerRef.current && viewer) {
        const newWidth = containerRef.current.clientWidth;
        const newHeight =
          canvasInitialHeight ?? parentContainerRef.current.clientHeight;
        viewer.setSize(newWidth, newHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      viewerRef.current.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update size when canvasInitialHeight changes
  useEffect(() => {
    if (viewerRef.current && containerRef.current && canvasInitialHeight) {
      const newWidth = containerRef.current.clientWidth;
      viewerRef.current.setSize(newWidth, canvasInitialHeight);
    }
  }, [canvasInitialHeight]);

  // laserScan hook
  useEffect(() => {
    if (viewerRef.current && laserScan) {
      viewerRef.current.updateLidarPoints(laserScan);
    }
  }, [laserScan]);

  // Expose updateLaserScan method to window for custom topics
  useEffect(() => {
    if (viewerRef.current) {
      window.updateLaserScan = (customLaserScan: LaserScan) => {
        if (viewerRef.current) {
          viewerRef.current.updateLidarPoints(customLaserScan);
        }
      };

      // Expose resize method to allow direct resizing from parent components
      window.resizeViewer = (width: number, height: number) => {
        if (viewerRef.current) {
          viewerRef.current.setSize(width, height);
        }
      };
    }

    return () => {
      // Clean up on unmount
      delete window.updateLaserScan;
      delete window.resizeViewer;
    };
  }, []);

  // rigging hook
  useEffect(() => {
    if (viewerRef.current && viewerRef.current.robot && jointState) {
      jointState.name.forEach((jointName, index) => {
        const jointValue = jointState?.position[index];
        // Acessa a junta pelo nome; verifique se os nomes do URDF coincidem com os do tópico
        const joint = viewerRef.current.robot.joints?.[jointName];

        if (joint && typeof joint.setJointValue === 'function') {
          joint.setJointValue(jointValue);
        }
      });
      // Opcional: atualiza a árvore de transformações se necessário
      viewerRef.current.robot.updateMatrixWorld(true);
    }
  }, [jointState]);

  // position & rotation hook
  useEffect(() => {
    if (viewerRef.current && odometry) {
      const { position, orientation } = odometry.pose.pose;

      // Update robot position
      viewerRef.current.robot?.position?.set(
        position.x,
        position.y,
        position.z
      );

      const quaternion = new THREE.Quaternion(
        orientation.x,
        orientation.y,
        orientation.z,
        orientation.w
      );
      const euler = new THREE.Euler().setFromQuaternion(quaternion, 'XYZ');
      viewerRef.current.robot?.rotation.set(euler.x, euler.y, euler.z);

      // Update matrix world to ensure all transformations are applied
      viewerRef.current.robot?.updateMatrixWorld(true);

      // Make the camera follow if in follow mode
      if (viewerRef.current.followMode) {
        viewerRef.current.updateCameraPosition();
      }
    }
  }, [odometry]);

  const _toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      container.classList.add('fullscreen');
    } else {
      container.classList.remove('fullscreen');
    }

    setIsFullscreen(!isFullscreen);

    // Resize viewer after toggling fullscreen
    if (viewerRef.current) {
      // Give browser time to complete the fullscreen transition
      setTimeout(() => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        viewerRef.current.setSize(newWidth, newHeight);

        // Force an update of the camera controls after resize
        viewerRef.current.controls.update();

        // If we're in follow mode, update camera to follow robot
        if (viewerRef.current.followMode && viewerRef.current.robot) {
          viewerRef.current.updateCameraPosition();
        }
      }, 200); // Increased timeout for more reliable resize
    }
  };

  // Add method to update robot movement
  const updateRobotMovement = (forward: number, turn: number) => {
    if (viewerRef.current) {
      viewerRef.current.updateRobotMovement(forward, turn);
    }
  };

  // Expose updateRobotMovement to parent components
  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      // @ts-ignore - Add updateRobotMovement to window for parent components
      window.updateRobotMovement = updateRobotMovement;
    }
    return () => {
      // @ts-ignore - Clean up
      delete window.updateRobotMovement;
    };
  }, [updateRobotMovement]); // Added updateRobotMovement to dependencies

  return (
    <div
      className="relative w-full h-full bg-white dark:bg-botbot-darker"
      ref={parentContainerRef}
    >
      <div
        id="robot-3d-container"
        ref={containerRef}
        className="w-full overflow-hidden rounded-lg border-[1px] border-gray-200 dark:border-black"
      />

      {/* Fullscreen toggle */}
      {/* <div>Width: {windowWidth}px</div>
      <div>Height: {parentContainerRef?.current?.clientHeight}px</div> */}

      {/* <button
        onClick={_toggleFullscreen}
        className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-primary"
      >
        {isFullscreen ? (
          <Minimize className="w-4 h-4" />
        ) : (
          <Maximize className="w-4 h-4" />
        )}
      </button> */}
    </div>
  );
}
