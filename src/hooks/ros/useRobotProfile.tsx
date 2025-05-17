'use client';

import { useState, useEffect } from 'react';
import { useRobotConnection } from '@/contexts/RobotConnectionContext';
import RobotProfileData from '@/interfaces/RobotProfileData';

export default function useRobotProfile(
  _useDummy: boolean = false
): RobotProfileData {
  const { connection } = useRobotConnection();

  const [profile, _setProfile] = useState<RobotProfileData>({
    name: 'R1',
    avatar: 'mmx.jpg',
  });

  useEffect(() => {
    if (!connection.ros || !connection.online) return;

    // const topicFactory: ROSTopicFactory = new ROSTopicFactory(
    //   connection.ros,
    //   useDummy
    // );
    // const velocityTopic = topicFactory.createAndSubscribeTopic<Twist>(
    //   'velocity',
    //   (msg) => {
    //     setVelocity(msg);
    //   }
    // );

    // Cleanup: desinscreve do tópico quando o componente é desmontado ou a conexão muda
    return () => {
      // velocityTopic.unsubscribe();
    };
  }, [connection.ros, connection.online]);

  return profile;
}
