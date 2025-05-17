import { RobotActionTypeName } from '@/types/RobotActionTypes';
import { RobotStatus } from '@/types/RobotStatus';

export const modeStates: Record<number, RobotStatus> = {
  0: 'idle',
  1: 'balanceStand',
  2: 'pose',
  3: 'locomotion',
  5: 'lieDown',
  6: 'jointLock',
  7: 'damping',
  10: 'sit',
  98: 'obstacleAvoidance',
  99: 'emergency',
};

// Define o tipo para o mapa de transições
export type RobotActionTransitionMap = {
  [key in RobotStatus]?: RobotActionTypeName[];
};

// Lista das ações permitidas em cada estado
export const robotTransitions: RobotActionTransitionMap = {
  idle: [
    'getDown',
    'antiCollisionOn',
    'sit',
    'lightOn',
    'balanceStand',
    'poseOn',
    'jointLock',
  ],
  jointLock: [
    'getDown',
    'balanceStand',
    'hello',
    'sit',
    'dance',
    'lightOn',
    'antiCollisionOn',
  ],
  lieDown: ['getUp', 'lightOn'],
  balanceStand: [
    'getDown',
    'jointLock',
    'poseOn',
    'hello',
    'sit',
    'lightOn',
    'stretch',
    'dance',
  ],
  pose: ['getDown', 'jointLock', 'poseOff', 'lightOn'],
  locomotion: [
    'getDown',
    'jointLock',
    'poseOn',
    'hello',
    'sit',
    'lightOn',
    'stretch',
    'dance',
  ],
  sit: ['getUp', 'getDown', 'lightOn'],
  damping: ['getUp', 'lightOn', 'antiCollisionOn'],
};
