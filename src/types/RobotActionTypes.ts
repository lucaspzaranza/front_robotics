export interface RobotActionCallbackOptions {
  input?: any;
  request?: any;
  callback: (result: any) => void;
  failedCallback?: (error?: string) => void;
}

export interface ActionType {
  label: string;
  icon: string;
  action: (options?: RobotActionCallbackOptions) => void;
}

export type MenuActionTypeName =
  | 'dashboard'
  | 'chart'
  | 'nav'
  | 'chatMenu'
  | 'chatNew'
  | 'settings'
  | 'dPad'
  | 'fullScreen'
  | 'expandContainer'
  | 'menu'
  | 'myUi';

export interface MenuActionType extends ActionType {
  iconDefaultSize?: number;
}

export type RobotActionTypeName =
  | 'getUp'
  | 'getDown'
  | 'balanceStand'
  | 'jointLock'
  | 'lightOn'
  | 'lightOff'
  | 'antiCollisionOn'
  | 'antiCollisionOff'
  | 'emergencyOn'
  | 'emergencyOff'
  | 'poseOn'
  | 'poseOff'
  | 'hello'
  | 'stopMove'
  | 'sit'
  | 'riseSit'
  | 'stretch'
  | 'dance'
  | 'prompt';

export type ServiceType =
  | 'prompt'
  | 'antiCollision'
  | 'mode'
  | 'light'
  | 'stop'
  | 'light'
  | 'pose';

export interface RobotActionType extends ActionType {
  name: RobotActionTypeName;
}
