'use client';

import ROSLIB from 'roslib';
import RobotConnectionData from '@/interfaces/RobotConnectionData';
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface RobotContextType {
  connection: RobotConnectionData;
  connectionStatus: ConnectionStatus;
  lastError: string | null;
  updateRobot: (newData: Partial<RobotConnectionData>) => void;
  connectToRobot: (ipAddress: string) => Promise<void>;
}

// Default IP - can be configured by the user
const DEFAULT_IP = process.env.NEXT_PUBLIC_ROS_IP ?? '192.168.1.40';
const DEFAULT_PORT = process.env.NEXT_PUBLIC_ROS_PORT ?? '9090';

const createRos = (ipAddress: string = DEFAULT_IP) => {
  const url =
    ipAddress.startsWith('ws') || ipAddress.startsWith('http')
      ? ipAddress
      : `ws://${ipAddress}:${DEFAULT_PORT}`;

  return new ROSLIB.Ros({
    url,
    // Enhanced connection options for better real-time performance
    transportLibrary: 'websocket',
    groovyCompatibility: false,
  });
};

const RobotConnectionContext = createContext<RobotContextType | undefined>(
  undefined
);

export const RobotConnectionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [connection, setRobot] = useState<RobotConnectionData>({
    ros: undefined,
    online: false,
  });
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('idle');
  const [lastError, setLastError] = useState<string | null>(null);

  const updateRobot = (newData: Partial<RobotConnectionData>) => {
    setRobot((prev) => ({ ...prev, ...newData }));
  };

  /**
   * Connects to the robot with the given IP address
   * @param ipAddress The IP address to connect to
   */
  const connectToRobot = async (ipAddress: string): Promise<void> => {
    try {
      setConnectionStatus('connecting');
      setLastError(null);

      const ros = createRos(ipAddress);

      // Create a promise that resolves when connected or rejects on error
      await new Promise<void>((resolve, reject) => {
        const onConnect = () => {
          ros.removeListener('connection', onConnect);
          ros.removeListener('error', onError);
          resolve();
        };

        const onError = (error: any) => {
          ros.removeListener('connection', onConnect);
          ros.removeListener('error', onError);
          reject(error);
        };

        ros.addListener('connection', onConnect);
        ros.addListener('error', onError);

        // Double the timeout from 5000ms to 10000ms
        setTimeout(() => {
          ros.removeListener('connection', onConnect);
          ros.removeListener('error', onError);
          reject(new Error('Connection timeout'));
        }, 10000);
      });

      // Successfully connected
      console.log('Connected to ROS via websocket!');
      updateRobot({ ros, online: true });
      setConnectionStatus('connected');

      // Setup disconnect listener with auto-reconnect
      ros.on('close', () => {
        console.log('Connection closed.');
        updateRobot({ online: false });
        setConnectionStatus('idle');

        // Attempt to reconnect immediately
        console.log('Trying to reconnect...');
        connectToRobot(ipAddress).catch((error) => {
          console.log('Automatic reconnection failed', error);
        });
      });

      // Add keep-alive ping to maintain connection
      const keepAliveInterval = setInterval(() => {
        if (ros && ros.isConnected) {
          // Send a simple service call to keep the connection alive
          try {
            const pingService = new ROSLIB.Service({
              ros: ros,
              name: '/rosapi/get_time',
              serviceType: 'rosapi/GetTime',
            });

            pingService.callService(
              {},
              () => {},
              (error) => {
                console.log('Ping error, connection may be unstable', error);
                // Clear and reinitialize connection if ping fails
                if (ros.isConnected) {
                  ros.close();
                }
              }
            );
          } catch {
            // Ignore errors on ping
          }
        } else {
          clearInterval(keepAliveInterval);
        }
      }, 10000); // Send ping every 10 seconds instead of 30
    } catch (error) {
      console.log('Error connecting to ROS');
      console.error(error);
      updateRobot({ online: false });
      setConnectionStatus('error');
      setLastError(
        error instanceof Error ? error.message : 'Unknown connection error'
      );

      // Add retry logic
      setTimeout(() => {
        if (connectionStatus === 'error') {
          console.log('Trying to reconnect after error...');
          initializeRosConnection();
        }
      }, 5000);

      throw error;
    }
  };

  /**
   * Initialize the ROS connection with the default IP.
   */
  const initializeRosConnection = () => {
    setConnectionStatus('connecting');
    connectToRobot(DEFAULT_IP).catch(() => {
      console.log('Initial connection failed. Please configure the robot IP.');
      setConnectionStatus('error');

      // Add retry loop with exponential backoff
      let retryCount = 0;
      const maxRetries = 3;

      const retryConnection = () => {
        if (retryCount < maxRetries && connectionStatus === 'error') {
          retryCount++;
          const delay = Math.min(2000 * Math.pow(2, retryCount), 30000);

          console.log(
            `Trying to reconnect (${retryCount}/${maxRetries}) in ${
              delay / 1000
            }s...`
          );

          setTimeout(() => {
            if (connectionStatus === 'error') {
              connectToRobot(DEFAULT_IP).catch(() => {
                console.log(`Reconnection failed ${retryCount}/${maxRetries}`);
                retryConnection();
              });
            }
          }, delay);
        }
      };

      retryConnection();
    });
  };

  useEffect(() => {
    initializeRosConnection();
  }, []);

  return (
    <RobotConnectionContext.Provider
      value={{
        connection,
        connectionStatus,
        lastError,
        updateRobot,
        connectToRobot,
      }}
    >
      {children}
    </RobotConnectionContext.Provider>
  );
};

export const useRobotConnection = () => {
  const context = useContext(RobotConnectionContext);
  if (!context) {
    throw new Error(
      'useRobotConnection must be used within a RobotConnectionProvider'
    );
  }
  return context;
};
