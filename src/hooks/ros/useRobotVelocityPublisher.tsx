'use client';

import { useMemo } from 'react';
import { Twist } from '@/interfaces/ros/Twist';
import { ROSTopicFactory } from '@/utils/ros/topics-and-services';
import { useRobotConnection } from '@/contexts/RobotConnectionContext';

export default function useRobotVelocityPublisher(useDummy: boolean = false) {
  const { connection } = useRobotConnection();
  const velocityTopic = useMemo(() => {
    if (!connection.ros || !connection.online) return null;
    const topicFactory: ROSTopicFactory = new ROSTopicFactory(
      connection.ros,
      useDummy
    );

    return topicFactory.createAndSubscribeTopic<Twist>(
      'velocityNipple',
      () => {}
    );
  }, [connection.ros, connection.online, useDummy]);

  const publishVelocity = (newVelocity: Twist) => {
    if (!velocityTopic) {
      // console.warn(
      //   'Conexão ROS não estabelecida ou offline. Não foi possível publicar.'
      // );
      return;
    }
    velocityTopic.publish(newVelocity);
  };

  return publishVelocity;
}
