'use client';

import { useState, useEffect } from 'react';
import { ROSTopicFactory } from '@/utils/ros/topics-and-services';
import { useRobotConnection } from '@/contexts/RobotConnectionContext';
import { Odometry } from '@/interfaces/ros/Odometry';
import { Pose, Vector3 } from 'roslib';

export default function useOdometry(useDummy: boolean = false): Odometry {
  const { connection } = useRobotConnection();

  const [odometry, setOdometry] = useState<Odometry>({
    header: {
      frame_id: '',
      seq: 0,
      stamp: {
        nanosec: 0,
        sec: 0,
      },
    },
    child_frame_id: '',
    pose: {
      pose: new Pose(),
      covariance: [],
    },
    twist: {
      twist: {
        linear: new Vector3(),
        angular: new Vector3(),
      },
      covariance: [],
    },
  });

  useEffect(() => {
    if (!connection.ros || !connection.online) return;

    const topicFactory: ROSTopicFactory = new ROSTopicFactory(
      connection.ros,
      useDummy
    );
    const odometryTopic = topicFactory.createAndSubscribeTopic<Odometry>(
      'odometry',
      (msg) => {
        setOdometry(msg);
      }
    );

    // Cleanup: desinscreve do tópico quando o componente é desmontado ou a conexão muda
    return () => {
      odometryTopic.unsubscribe();
    };
  }, [connection.ros, connection.online]);

  return odometry;
}
