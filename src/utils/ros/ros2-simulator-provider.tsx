'use client';

import type React from 'react';

import { createContext, useContext, useEffect, useState } from 'react';
import { ros2Simulator } from './ros2-simulation';
import { useRobotConnection } from '@/contexts/RobotConnectionContext';

const ROS2SimulatorContext = createContext<typeof ros2Simulator | null>(null);

export function useROS2Simulator() {
  const context = useContext(ROS2SimulatorContext);
  if (!context) {
    throw new Error(
      'useROS2Simulator must be used within a ROS2SimulatorProvider'
    );
  }
  return context;
}

export function ROS2SimulatorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);
  const { connection } = useRobotConnection();

  useEffect(() => {
    setIsClient(true);
    
    // Only initialize simulator when not connected to a real robot
    if (!connection.online && !ros2Simulator.isConnectedToRobot()) {
      ros2Simulator.connect('R1-007');
    }
    
    // Disconnect simulator when connected to real robot
    if (connection.online && ros2Simulator.isConnectedToRobot()) {
      ros2Simulator.disconnect();
    }
  }, [connection.online]);

  if (!isClient) {
    return null;
  }

  return (
    <ROS2SimulatorContext.Provider value={ros2Simulator}>
      {children}
    </ROS2SimulatorContext.Provider>
  );
}
