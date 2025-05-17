'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useROS2Simulator } from '@/utils/ros/ros2-simulator-provider';
import { BatteryState, CPUUsage } from '@/utils/ros/ros2-simulation';
import { Temperature } from '@/interfaces/ros/Temperature';

export function useDemoNotifications() {
  const { dispatch } = useNotifications();
  const simulator = useROS2Simulator();

  useEffect(() => {
    if (!simulator) return;

    // Subscribe to battery state
    const batterySubscription = simulator.subscribe(
      '/battery_state',
      (message: BatteryState) => {
        if (message.percentage <= 20) {
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              title: 'Low Battery Warning',
              message: `Robot battery level is at ${message.percentage.toFixed(
                1
              )}%. Please dock for charging.`,
              type: 'warning',
            },
          });
        }
      }
    );

    // Subscribe to CPU usage
    const cpuSubscription = simulator.subscribe(
      '/system/cpu_usage',
      (message: CPUUsage) => {
        if (message.cpu_percent > 90) {
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              title: 'High CPU Usage',
              message: `System CPU usage is at ${message.cpu_percent.toFixed(
                1
              )}%. Consider reducing workload.`,
              type: 'error',
            },
          });
        }
      }
    );

    // Subscribe to motor temperature
    const tempSubscription = simulator.subscribe(
      '/motor/temperature',
      (message: Temperature) => {
        if (message.temperature > 50) {
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              title: 'High Motor Temperature',
              message: `Motor temperature is at ${message.temperature.toFixed(
                1
              )}°C. Check cooling system.`,
              type: 'warning',
            },
          });
        }
      }
    );

    // Add some initial demo notifications
    const demoNotifications = [
      {
        title: 'Navigation Goal Reached',
        message:
          'Robot has successfully reached waypoint B-12 in Warehouse Zone 3',
        type: 'success' as const,
      },
      {
        title: 'New Map Available',
        message: 'Updated warehouse map has been uploaded to the robot',
        type: 'info' as const,
      },
      {
        title: 'Obstacle Detected',
        message: 'Static obstacle detected in path. Replanning route...',
        type: 'warning' as const,
      },
      {
        title: 'System Update',
        message:
          'ROS2 system update v2.5.3 is available. Schedule installation?',
        type: 'info' as const,
      },
    ];

    // Add demo notifications with delays
    demoNotifications.forEach((notification, index) => {
      setTimeout(() => {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: notification,
        });
      }, index * 1000); // Add each notification 1 second apart
    });

    // Cleanup subscriptions
    return () => {
      batterySubscription.unsubscribe();
      cpuSubscription.unsubscribe();
      tempSubscription.unsubscribe();
    };
  }, [simulator, dispatch]);
}
