'use client';

import { useEffect, useState } from 'react';
import { ROSTopicFactory } from '@/utils/ros/topics-and-services';
import { useRobotConnection } from '@/contexts/RobotConnectionContext';
import { Image } from '@/interfaces/ros/Image';
import ROSLIB from 'roslib';
import { CameraType } from '@/types/CameraType';

export default function useRobotCamera(
  useDummy: boolean = false,
  cameraType: CameraType,
  customTopic?: string
): Image {
  const { connection } = useRobotConnection();
  const [image, setImage] = useState<Image>({
    header: {
      frame_id: '',
      seq: 0,
      stamp: {
        nanosec: 0,
        sec: 0,
      },
    },
    height: 0,
    width: 0,
    format: '',
    is_bigendian: 0,
    step: 0,
    data: '',
  });

  useEffect(() => {
    if (!connection.ros || !connection.online) return;

    const topicFactory: ROSTopicFactory = new ROSTopicFactory(
      connection.ros,
      useDummy
    );

    let imageTopic: ROSLIB.Topic;

    if (customTopic) {
      // If a custom topic is provided, create a direct subscription
      imageTopic = new ROSLIB.Topic({
        ros: connection.ros,
        name: customTopic.startsWith('/') ? customTopic : `/${customTopic}`,
        messageType: 'sensor_msgs/CompressedImage',
        compression: 'none',
        throttle_rate: 0,
        queue_size: 1,
      });

      imageTopic.subscribe((msg: ROSLIB.Message) => {
        setImage(msg as unknown as Image);
      });
    } else {
      // Use the default camera topic if no custom topic is provided
      imageTopic = topicFactory.createAndSubscribeTopic<Image>(
        cameraType,
        (msg) => {
          setImage(msg);
        }
      );
    }

    // Cleanup: unsubscribe from topic when component unmounts or connection changes
    return () => {
      imageTopic.unsubscribe();
    };
  }, [connection.ros, connection.online, customTopic, useDummy]);

  return image;
}
