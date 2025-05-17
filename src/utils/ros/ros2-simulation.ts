import { JointState } from '@/interfaces/ros/JointState';
import { LaserScan } from '@/interfaces/ros/LaserScan';
import { Temperature } from '@/interfaces/ros/Temperature';
import { EventEmitter } from 'events';

// Define types for our ROS2 messages

export interface Odometry {
  header: {
    stamp: {
      sec: number;
      nanosec: number;
    };
    frame_id: string;
  };
  child_frame_id: string;
  pose: {
    pose: {
      position: {
        x: number;
        y: number;
        z: number;
      };
      orientation: {
        x: number;
        y: number;
        z: number;
        w: number;
      };
    };
    covariance: number[];
  };
  twist: {
    twist: {
      linear: {
        x: number;
        y: number;
        z: number;
      };
      angular: {
        x: number;
        y: number;
        z: number;
      };
    };
    covariance: number[];
  };
}

export interface CameraImage {
  header: {
    stamp: {
      sec: number;
      nanosec: number;
    };
    frame_id: string;
  };
  height: number;
  width: number;
  encoding: string;
  is_bigendian: number;
  step: number;
  data: string; // Base64 encoded image data
}

export interface BatteryState {
  header: {
    stamp: {
      sec: number;
      nanosec: number;
    };
    frame_id: string;
  };
  voltage: number;
  current: number;
  charge: number;
  capacity: number;
  percentage: number;
  temperature: number;
  power_supply_status: number;
  power_supply_health: number;
}

// export interface Temperature {
//   header: {
//     stamp: {
//       sec: number;
//       nanosec: number;
//     };
//     frame_id: string;
//   };
//   temperature: number;
//   variance: number;
// }

export interface CPUUsage {
  header: {
    stamp: {
      sec: number;
      nanosec: number;
    };
    frame_id: string;
  };
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
}

export interface MotorStatus {
  header: {
    stamp: {
      sec: number;
      nanosec: number;
    };
    frame_id: string;
  };
  motor_id: number[];
  rpm: number[];
  current: number[];
  temperature: number[];
  status: number[];
}

// Simulate ROS2 topics
const TOPICS = {
  LASER_SCAN: '/scan',
  ODOMETRY: '/odom',
  CAMERA_FRONT: '/camera/front/image_raw',
  CAMERA_REAR: '/camera/rear/image_raw',
  CAMERA_LEFT: '/camera/left/image_raw',
  CAMERA_RIGHT: '/camera/right/image_raw',
  BATTERY_STATE: '/battery_state',
  MOTOR_TEMPERATURE: '/motor/temperature',
  JOINT_STATES: '/joint_states',
  CPU_USAGE: '/system/cpu_usage',
  MOTOR_STATUS: '/motor/status',
  ENVIRONMENT_TEMPERATURE: '/environment/temperature',
};

// Store historical data for charts
export interface HistoricalData {
  timestamp: number;
  value: number | number[];
}

class ROS2Simulator extends EventEmitter {
  private isConnected = false;
  private simulationInterval: NodeJS.Timeout | null = null;
  private robotId = '';
  private historicalData: Record<string, HistoricalData[]> = {};
  private batteryLevel = 100;
  private batteryDirection = -1;
  private jointPositions = [0, 0, 0, 0, 0, 0];
  private jointVelocities = [0, 0, 0, 0, 0, 0];
  private cpuUsage = 20;
  private memoryUsage = 30;
  private diskUsage = 45;
  private motorTemperatures = [25, 28, 30, 27, 26, 29];
  private environmentTemp = 22;

  constructor() {
    super();
    // Set max listeners to avoid memory leak warnings
    this.setMaxListeners(20);

    // Initialize historical data
    Object.values(TOPICS).forEach((topic) => {
      this.historicalData[topic] = [];
    });
  }

  connect(robotId: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate connection delay
      setTimeout(() => {
        this.isConnected = true;
        this.robotId = robotId;
        this.emit('connection_status', { connected: true, robotId });

        // Start publishing simulated data
        this.startSimulation();
        resolve(true);
      }, 1000);
    });
  }

  disconnect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.simulationInterval) {
        clearInterval(this.simulationInterval);
        this.simulationInterval = null;
      }

      this.isConnected = false;
      this.robotId = '';
      this.emit('connection_status', { connected: false, robotId: '' });
      resolve(true);
    });
  }

  isConnectedToRobot(): boolean {
    return this.isConnected;
  }

  getCurrentRobotId(): string {
    return this.robotId;
  }

  getHistoricalData(topic: string, limit = 100): HistoricalData[] {
    const data = this.historicalData[topic] || [];
    return data.slice(-limit);
  }

  private startSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    this.simulationInterval = setInterval(() => {
      // Publish laser scan data
      this.publishLaserScan();

      // Publish odometry data
      this.publishOdometry();

      // Publish camera images
      this.publishCameraImages();

      // Publish battery state
      this.publishBatteryState();

      // Publish temperature data
      this.publishTemperatureData();

      // Publish joint states
      this.publishJointStates();

      // Publish CPU usage
      this.publishCPUUsage();

      // Publish motor status
      this.publishMotorStatus();
    }, 100); // 10Hz update rate
  }

  private publishLaserScan() {
    const numPoints = 360;
    const ranges = new Array(numPoints);
    const intensities = new Array(numPoints);

    // Generate simulated laser scan data
    for (let i = 0; i < numPoints; i++) {
      // Create a pattern that looks like the LiDAR visualization in the image
      // with varying distances based on angle
      const angle = i * ((2 * Math.PI) / numPoints);

      // Base range with some noise
      let range = 5.0 + Math.sin(angle * 3) * 2.0 + Math.random() * 0.5;

      // Add some "objects" at specific angles
      if (i > 45 && i < 65) range = 2.0 + Math.random() * 0.3; // Object to the right
      if (i > 120 && i < 150) range = 3.0 + Math.random() * 0.3; // Object ahead-right
      if (i > 180 && i < 200) range = 2.5 + Math.random() * 0.3; // Object ahead-left
      if (i > 270 && i < 300) range = 4.0 + Math.random() * 0.3; // Object to the left

      ranges[i] = range;
      intensities[i] = 100 + Math.random() * 155; // Random intensity values
    }

    const laserScan: LaserScan = {
      header: {
        seq: 0,
        stamp: {
          sec: Math.floor(Date.now() / 1000),
          nanosec: (Date.now() % 1000) * 1000000,
        },
        frame_id: 'base_scan',
      },
      angle_min: 0.0,
      angle_max: 2 * Math.PI,
      angle_increment: (2 * Math.PI) / numPoints,
      time_increment: 0.0,
      scan_time: 0.1,
      range_min: 0.1,
      range_max: 10.0,
      ranges,
      intensities,
    };

    this.emit('topic', { topic: TOPICS.LASER_SCAN, message: laserScan });
  }

  private publishOdometry() {
    // Create simulated odometry data with small random movements
    const now = Date.now();
    const x = Math.sin(now / 5000) * 0.1;
    const y = Math.cos(now / 5000) * 0.1;
    const theta = (now / 10000) % (2 * Math.PI);

    const odometry: Odometry = {
      header: {
        stamp: {
          sec: Math.floor(Date.now() / 1000),
          nanosec: (Date.now() % 1000) * 1000000,
        },
        frame_id: 'odom',
      },
      child_frame_id: 'base_link',
      pose: {
        pose: {
          position: { x, y, z: 0.0 },
          orientation: {
            x: 0.0,
            y: 0.0,
            z: Math.sin(theta / 2),
            w: Math.cos(theta / 2),
          },
        },
        covariance: new Array(36).fill(0),
      },
      twist: {
        twist: {
          linear: { x: 0.1, y: 0.0, z: 0.0 },
          angular: { x: 0.0, y: 0.0, z: 0.01 },
        },
        covariance: new Array(36).fill(0),
      },
    };

    this.emit('topic', { topic: TOPICS.ODOMETRY, message: odometry });
  }

  private publishCameraImages() {
    // In a real implementation, we would generate or fetch actual images
    // For this simulation, we'll just emit placeholder data
    const cameras = [
      'CAMERA_FRONT',
      'CAMERA_REAR',
      'CAMERA_LEFT',
      'CAMERA_RIGHT',
    ];

    cameras.forEach((camera) => {
      const cameraImage: CameraImage = {
        header: {
          stamp: {
            sec: Math.floor(Date.now() / 1000),
            nanosec: (Date.now() % 1000) * 1000000,
          },
          frame_id: `${camera.toLowerCase()}_frame`,
        },
        height: 480,
        width: 640,
        encoding: 'rgb8',
        is_bigendian: 0,
        step: 640 * 3,
        data: '', // In a real implementation, this would be base64 encoded image data
      };

      this.emit('topic', {
        topic: TOPICS[camera as keyof typeof TOPICS],
        message: cameraImage,
      });
    });
  }

  private publishBatteryState() {
    // Simulate battery discharge and charge
    this.batteryLevel += this.batteryDirection * (0.01 + Math.random() * 0.02);

    // Change direction when reaching limits
    if (this.batteryLevel <= 20) {
      this.batteryDirection = 1; // Start charging
    } else if (this.batteryLevel >= 98) {
      this.batteryDirection = -1; // Start discharging
    }

    // Ensure battery level stays within bounds
    this.batteryLevel = Math.max(10, Math.min(100, this.batteryLevel));

    const batteryState: BatteryState = {
      header: {
        stamp: {
          sec: Math.floor(Date.now() / 1000),
          nanosec: (Date.now() % 1000) * 1000000,
        },
        frame_id: 'battery',
      },
      voltage: 12.0 + (Math.random() * 0.5 - 0.25),
      current:
        this.batteryDirection < 0
          ? -2.5 + Math.random() * 0.5
          : 1.5 + Math.random() * 0.3,
      charge: this.batteryLevel * 0.01 * 5000, // 5000 mAh capacity
      capacity: 5000, // 5000 mAh
      percentage: this.batteryLevel,
      temperature: 25 + Math.random() * 5,
      power_supply_status: this.batteryDirection > 0 ? 1 : 2, // 1 = charging, 2 = discharging
      power_supply_health: 1, // 1 = good
    };

    this.emit('topic', { topic: TOPICS.BATTERY_STATE, message: batteryState });

    // Store historical data
    this.historicalData[TOPICS.BATTERY_STATE].push({
      timestamp: Date.now(),
      value: batteryState.percentage,
    });

    // Limit historical data size
    if (this.historicalData[TOPICS.BATTERY_STATE].length > 1000) {
      this.historicalData[TOPICS.BATTERY_STATE].shift();
    }
  }

  private publishTemperatureData() {
    // Simulate motor temperature with some random fluctuation
    for (let i = 0; i < this.motorTemperatures.length; i++) {
      this.motorTemperatures[i] += (Math.random() - 0.5) * 0.2;
      // Keep temperature in reasonable range
      this.motorTemperatures[i] = Math.max(
        20,
        Math.min(60, this.motorTemperatures[i])
      );
    }

    const motorTemperature: Temperature = {
      header: {
        seq: 0,
        stamp: {
          sec: Math.floor(Date.now() / 1000),
          nanosec: (Date.now() % 1000) * 1000000,
        },
        frame_id: 'motor_temperature',
      },
      temperature:
        this.motorTemperatures.reduce((a, b) => a + b, 0) /
        this.motorTemperatures.length,
      variance: 0.1,
    };

    this.emit('topic', {
      topic: TOPICS.MOTOR_TEMPERATURE,
      message: motorTemperature,
    });

    // Store historical data
    this.historicalData[TOPICS.MOTOR_TEMPERATURE].push({
      timestamp: Date.now(),
      value: motorTemperature.temperature,
    });

    // Limit historical data size
    if (this.historicalData[TOPICS.MOTOR_TEMPERATURE].length > 1000) {
      this.historicalData[TOPICS.MOTOR_TEMPERATURE].shift();
    }

    // Environment temperature
    this.environmentTemp += (Math.random() - 0.5) * 0.1;
    this.environmentTemp = Math.max(18, Math.min(30, this.environmentTemp));

    const envTemperature: Temperature = {
      header: {
        seq: 0,
        stamp: {
          sec: Math.floor(Date.now() / 1000),
          nanosec: (Date.now() % 1000) * 1000000,
        },
        frame_id: 'environment_temperature',
      },
      temperature: this.environmentTemp,
      variance: 0.05,
    };

    this.emit('topic', {
      topic: TOPICS.ENVIRONMENT_TEMPERATURE,
      message: envTemperature,
    });

    // Store historical data
    this.historicalData[TOPICS.ENVIRONMENT_TEMPERATURE].push({
      timestamp: Date.now(),
      value: envTemperature.temperature,
    });

    // Limit historical data size
    if (this.historicalData[TOPICS.ENVIRONMENT_TEMPERATURE].length > 1000) {
      this.historicalData[TOPICS.ENVIRONMENT_TEMPERATURE].shift();
    }
  }

  private publishJointStates() {
    // Simulate joint movement
    for (let i = 0; i < this.jointPositions.length; i++) {
      // Update joint position based on velocity
      this.jointPositions[i] += this.jointVelocities[i] * 0.1;

      // Simulate joint movement with sinusoidal pattern
      this.jointVelocities[i] = 0.1 * Math.sin(Date.now() / 1000 + i);

      // Keep joint positions within reasonable range
      this.jointPositions[i] = Math.max(
        -Math.PI,
        Math.min(Math.PI, this.jointPositions[i])
      );
    }

    const jointState: JointState = {
      header: {
        seq: 0,
        stamp: {
          sec: Math.floor(Date.now() / 1000),
          nanosec: (Date.now() % 1000) * 1000000,
        },
        frame_id: 'base_link',
      },
      name: ['joint1', 'joint2', 'joint3', 'joint4', 'joint5', 'joint6'],
      position: [...this.jointPositions],
      velocity: [...this.jointVelocities],
      effort: this.jointPositions.map(() => Math.random() * 10),
    };

    this.emit('topic', { topic: TOPICS.JOINT_STATES, message: jointState });

    // Store historical data
    this.historicalData[TOPICS.JOINT_STATES].push({
      timestamp: Date.now(),
      value: [...this.jointPositions],
    });

    // Limit historical data size
    if (this.historicalData[TOPICS.JOINT_STATES].length > 1000) {
      this.historicalData[TOPICS.JOINT_STATES].shift();
    }
  }

  private publishCPUUsage() {
    // Simulate CPU usage with some random fluctuation
    this.cpuUsage += (Math.random() - 0.5) * 5;
    this.cpuUsage = Math.max(5, Math.min(95, this.cpuUsage));

    this.memoryUsage += (Math.random() - 0.5) * 3;
    this.memoryUsage = Math.max(10, Math.min(90, this.memoryUsage));

    this.diskUsage += (Math.random() - 0.5) * 0.5;
    this.diskUsage = Math.max(20, Math.min(95, this.diskUsage));

    const cpuUsage: CPUUsage = {
      header: {
        stamp: {
          sec: Math.floor(Date.now() / 1000),
          nanosec: (Date.now() % 1000) * 1000000,
        },
        frame_id: 'system',
      },
      cpu_percent: this.cpuUsage,
      memory_percent: this.memoryUsage,
      disk_percent: this.diskUsage,
    };

    this.emit('topic', { topic: TOPICS.CPU_USAGE, message: cpuUsage });

    // Store historical data
    this.historicalData[TOPICS.CPU_USAGE].push({
      timestamp: Date.now(),
      value: [
        cpuUsage.cpu_percent,
        cpuUsage.memory_percent,
        cpuUsage.disk_percent,
      ],
    });

    // Limit historical data size
    if (this.historicalData[TOPICS.CPU_USAGE].length > 1000) {
      this.historicalData[TOPICS.CPU_USAGE].shift();
    }
  }

  private publishMotorStatus() {
    // Simulate motor status
    const motorIds = [1, 2, 3, 4];
    const rpm = motorIds.map(() => 1000 + Math.random() * 500);
    const current = motorIds.map(() => 1.0 + Math.random() * 2.0);
    const temperature = motorIds.map(() => 30 + Math.random() * 20);
    const status = motorIds.map(() => 1); // 1 = OK

    const motorStatus: MotorStatus = {
      header: {
        stamp: {
          sec: Math.floor(Date.now() / 1000),
          nanosec: (Date.now() % 1000) * 1000000,
        },
        frame_id: 'motors',
      },
      motor_id: motorIds,
      rpm,
      current,
      temperature,
      status,
    };

    this.emit('topic', { topic: TOPICS.MOTOR_STATUS, message: motorStatus });

    // Store historical data
    this.historicalData[TOPICS.MOTOR_STATUS].push({
      timestamp: Date.now(),
      value: [...rpm],
    });

    // Limit historical data size
    if (this.historicalData[TOPICS.MOTOR_STATUS].length > 1000) {
      this.historicalData[TOPICS.MOTOR_STATUS].shift();
    }
  }

  // Method to subscribe to a topic
  subscribe(topic: string, callback: (message: any) => void) {
    this.on('topic', (data: { topic: string; message: any }) => {
      if (data.topic === topic) {
        callback(data.message);
      }
    });

    return {
      unsubscribe: () => {
        this.removeListener('topic', callback);
      },
    };
  }
}

// Export a singleton instance
export const ros2Simulator = new ROS2Simulator();

// Export topics for easy access
export const ROS2_TOPICS = TOPICS;
