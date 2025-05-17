'use client';

import { useState, useEffect, useRef } from 'react';
import { useRobotConnection } from '@/contexts/RobotConnectionContext';
import {
  ROSTopicFactory,
  topicsMessages,
} from '@/utils/ros/topics-and-services';

export interface ChartDataPoint {
  timestamp: number;
  value: number;
}

export default function useChartData(
  topic: keyof typeof topicsMessages,
  refreshTime: number,
  maxPoints: number = 20,
  updateData: boolean
) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const { connection } = useRobotConnection();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateDummyData = () => {
    const now = Date.now();
    let value = 0;

    // Generate different patterns based on the topic
    switch (topic) {
      case 'battery':
        // Battery percentage between 60% and 100%
        value = 60 + Math.random() * 40;
        break;
      case 'temperature':
        // Motor temperature between 30 and 80 degrees
        value = 30 + Math.random() * 50;
        break;
      case 'jointStates':
        // Joint angle between -1 and 1 radians
        value = -1 + Math.random() * 2;
        break;
      case 'robotStatus':
        // Motor speed (RPM) between 0 and 5000
        value = Math.random() * 5000;
        break;
      case 'odometry':
        // Linear velocity between 0 and 2 m/s
        value = Math.random() * 2;
        break;
      case 'laserScan':
        // Distance to nearest obstacle between 0.1 and 10 meters
        value = 0.1 + Math.random() * 9.9;
        break;
      default:
        value = Math.random() * 100;
    }

    setData((prevData) => {
      const newData = [...prevData, { timestamp: now, value }];

      // Keep only the specified number of data points
      if (newData.length > maxPoints) {
        return newData.slice(newData.length - maxPoints);
      }

      return newData;
    });
  };

  const handleRosData = (message: any) => {
    const now = Date.now();
    let value = 0;

    // Extract relevant data based on topic type
    switch (topic) {
      case 'battery':
        value = message.percentage * 100 || message.value || 0;
        break;
      case 'temperature':
        // Average of all motor temperatures
        value = message.data || message.temperature || 0;
        break;
      case 'jointStates':
        // First joint position
        value = message.position?.[0] || 0;
        break;
      case 'robotStatus':
        // First motor RPM
        value = message.rpm?.[0] || 0;
        break;
      case 'odometry':
        // Linear velocity in x direction
        value = message.twist?.twist?.linear?.x || 0;
        break;
      case 'sportModeState':
        value = message.mode;
        break;
      case 'laserScan':
        // Average of range data (simplified)
        if (message.ranges && message.ranges.length > 0) {
          const validRanges = message.ranges.filter(
            (r: number) => r >= message.range_min && r <= message.range_max
          );
          value =
            validRanges.length > 0
              ? validRanges.reduce((sum: number, r: number) => sum + r, 0) /
                validRanges.length
              : 0;
        }
        break;
      default:
        value = 0;
    }

    setData((prevData) => {
      const newData = [...prevData, { timestamp: now, value }];

      if (newData.length > maxPoints) {
        return newData.slice(newData.length - maxPoints);
      }

      return newData;
    });
  };

  useEffect(() => {
    if (!updateData) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let topicSubscription: any = null;

    // If connected to robot, subscribe to real data
    if (connection.online && connection.ros) {
      try {
        // Get the correct topic key for our topics-and-services utility
        const topicFactory = new ROSTopicFactory(connection.ros);
        topicSubscription = topicFactory.createAndSubscribeTopic(
          topic,
          handleRosData
        );
      } catch (error) {
        console.error('Error subscribing to ROS topic:', error);
        // If subscription fails, fall back to dummy data
        intervalRef.current = setInterval(generateDummyData, refreshTime);
      }
    } else {
      // Use dummy data when disconnected
      intervalRef.current = setInterval(generateDummyData, refreshTime);
    }

    // Initial data point
    generateDummyData();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (topicSubscription) {
        topicSubscription.unsubscribe();
      }
    };
  }, [updateData, refreshTime, topic, connection.online, connection.ros]);

  return data;
}
