'use client';

import { RobotStatus } from '@/types/RobotStatus';
import { robotTransitions } from '@/utils/ros/modeStates';
import { useMemo } from 'react';

export default function useRobotActionsTransitions(currentStatus: RobotStatus) {
  return useMemo(() => robotTransitions[currentStatus] || [], [currentStatus]);
}
