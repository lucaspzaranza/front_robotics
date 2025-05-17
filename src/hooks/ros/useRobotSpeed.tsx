'use client';

import { useState, useEffect, useRef } from 'react';
import { useRobotConnection } from '@/contexts/RobotConnectionContext';
import { ROSTopicFactory } from '@/utils/ros/topics-and-services';
import { SportModeState } from '@/interfaces/ros/SportModeState';
import { formatDecimal } from '@/utils/ros/roslib-utils';

export default function useRobotSpeed(useDummy: boolean = false): {
  speed: number;
  maxSpeed: number;
} {
  const { connection } = useRobotConnection();
  const maxSpeed = 2; // Max speed is 5 m/s for go2

  const [_robotState, setRobotState] = useState<SportModeState | null>(null);
  const speedRef = useRef(0);

  useEffect(() => {
    if (!connection.ros || !connection.online) return;

    const topicFactory: ROSTopicFactory = new ROSTopicFactory(
      connection.ros,
      useDummy
    );

    const sportModeTopic = topicFactory.createAndSubscribeTopic<SportModeState>(
      'sportModeState',
      (msg) => {
        setRobotState(msg);

        // Calculate the total speed from the velocity components
        // velocity array has [vx, vy, vz] components
        if (msg.velocity && msg.velocity.length >= 3) {
          // Calculate the magnitude of the velocity vector (Euclidean norm)
          const vx = msg.velocity[0];
          const vy = msg.velocity[1];
          const vz = msg.velocity[2]; // Usually 0 for ground robots

          // Calculate the magnitude (absolute value) of the velocity
          const totalSpeed = Math.sqrt(vx * vx + vy * vy + vz * vz);
          const formattedSpeed = Number.parseFloat(
            formatDecimal(totalSpeed, 1)
          );
          // console.log(
          //   `speed: ${speedRef.current}, newSpeed: ${formattedSpeed}`
          // );
          speedRef.current = formattedSpeed;
        }
      }
    );

    // Cleanup when unmounting
    return () => {
      sportModeTopic.unsubscribe();
    };
  }, [connection.ros, connection.online, useDummy]);

  return { speed: speedRef.current, maxSpeed };
}
