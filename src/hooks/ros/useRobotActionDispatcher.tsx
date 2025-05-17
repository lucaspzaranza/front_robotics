'use client';

import { useRobotConnection } from '@/contexts/RobotConnectionContext';
import { ServiceOptions } from '@/interfaces/ros/ServiceOptions';
import { ROSServiceFactory } from '@/utils/ros/topics-and-services';

export default function useRobotActionDispatcher() {
  const { connection } = useRobotConnection();
  function dispatchAction(options: ServiceOptions) {
    if (!connection.ros || !connection.ros.isConnected) {
      options.failedCallback?.(
        'Não foi possível executar ação por não haver conexão com o ROS.'
      );
      return;
    }
    const serviceFactory = new ROSServiceFactory(connection.ros);

    serviceFactory.callServiceWithCallback(options);
  }
  return dispatchAction;
}
