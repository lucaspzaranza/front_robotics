'use client';

import { useEffect, useRef } from 'react';
import { useRobotConnection } from '@/contexts/RobotConnectionContext';
import { BatteryState } from '@/interfaces/ros/BatteryState';
import { ROSTopicFactory } from '@/utils/ros/topics-and-services';
import { useROS2Simulator } from '@/utils/ros/ros2-simulator-provider';
// import ROSLIB from 'roslib';

// Define data source type to track where battery data is coming from
type DataSource = 'none' | 'real' | 'simulated';

export default function useRobotBatteryState(
  _useDummy: boolean = false
): BatteryState {
  const { connection } = useRobotConnection();
  const simulator = useROS2Simulator();
  const batteryTopicRef = useRef<any>(null);
  const simulatorSubscriptionRef = useRef<any>(null);
  const connectionStableRef = useRef<boolean>(false);
  const connectionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dataSourceRef = useRef<DataSource>('none');
  const batteryStateRef = useRef<BatteryState>({
    header: {
      frame_id: '',
      seq: 0,
      stamp: {
        nanosec: 0,
        sec: 0,
      },
    },
    voltage: 0,
    current: 0,
    charge: 0,
    capacity: 0,
    design_capacity: 0,
    percentage: 0, // Initialize with 0, will be updated from ROS2 or simulator
    power_supply_status: 0,
    power_supply_health: 0,
    power_supply_technology: 0,
    present: false,
    cell_voltage: [],
    cell_temperature: [],
    location: '',
    serial_number: '',
  });

  // Wrapper for setting battery state that respects the current data source
  const setBatteryState = (newState: BatteryState, source: DataSource) => {
    // Only update state if the data source matches our current data source
    // or we don't have a data source yet
    if (dataSourceRef.current === 'none' || dataSourceRef.current === source) {
      dataSourceRef.current = source;
      batteryStateRef.current = newState;
    }
  };

  // Clean up function for both real and simulated subscriptions
  const cleanupSubscriptions = () => {
    // Unsubscribe from real ROS2 topic if it exists
    if (batteryTopicRef.current) {
      batteryTopicRef.current.unsubscribe();
      batteryTopicRef.current = null;
    }

    // Unsubscribe from simulator if it exists
    if (simulatorSubscriptionRef.current) {
      simulatorSubscriptionRef.current.unsubscribe();
      simulatorSubscriptionRef.current = null;
    }

    // Clear any pending connection timer
    if (connectionTimerRef.current) {
      clearTimeout(connectionTimerRef.current);
      connectionTimerRef.current = null;
    }
  };

  useEffect(() => {
    // First clean up any existing subscriptions
    cleanupSubscriptions();

    // Add a debounce mechanism to stabilize connection state
    if (connection.ros && connection.online) {
      // When connected to real robot, set a timer to confirm stable connection
      connectionTimerRef.current = setTimeout(() => {
        connectionStableRef.current = true;

        // Reset data source when switching to real data
        dataSourceRef.current = 'real';

        // Connect to real ROS2 when connection is stable
        if (connection.ros) {
          const topicFactory = new ROSTopicFactory(connection.ros, _useDummy);
          const batteryStateTopic =
            topicFactory.createAndSubscribeTopic<BatteryState>(
              'battery',
              (msg) => {
                const currentPercentage =
                  batteryStateRef.current.percentage * 100;
                const newPercentage = msg.percentage * 100;
                if (currentPercentage !== newPercentage) {
                  setBatteryState(msg, 'real');
                  // console.log(
                  //   `current: ${currentPercentage}, new: ${newPercentage}`
                  // );
                }
              }
            );

          // Store the topic reference for cleanup
          batteryTopicRef.current = batteryStateTopic;
        }
      }, 1000); // Wait 1 second to confirm stable connection
    } else if (simulator && !connection.online) {
      // Reset connection stable flag when disconnected
      connectionStableRef.current = false;

      // Reset data source when switching to simulated data
      // Only reset if we were previously using real data
      if (dataSourceRef.current === 'real') {
        dataSourceRef.current = 'none';
      }

      // Only use simulated data when not connected to real robot
      const subscription = simulator.subscribe(
        '/battery_state',
        (message: BatteryState) => {
          setBatteryState(
            {
              ...message,
              // Ensure the percentage is correctly mapped from simulator (usually 0-100) to battery state (0-1)
              percentage: message.percentage / 100,
            },
            'simulated'
          );
        }
      );

      // Store the subscription reference for cleanup
      simulatorSubscriptionRef.current = subscription;
    }

    // Cleanup function on unmount or dependencies change
    return () => {
      cleanupSubscriptions();
      // Reset data source on unmount
      dataSourceRef.current = 'none';
    };
  }, [connection.ros, connection.online, simulator, _useDummy]);

  return batteryStateRef.current;
}
