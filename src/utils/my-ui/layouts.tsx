import { generateId, Widget } from '@/contexts/DashboardContext';
import { RobotActionTypeName } from '@/types/RobotActionTypes';

export type LayoutType =
  | 'Default'
  | 'Command Input'
  | 'Information'
  | 'Image Visualization'
  | '3D Visualization';

const layouts: Record<LayoutType, Widget[]> = {
  Default: [
    {
      type: 'info',
      id: generateId(),
      size: { width: 400, height: 250 },
      position: { x: 0, y: 0 },
    },
    {
      type: 'chat',
      id: generateId(),
      size: { width: 400, height: 250 },
      position: { x: 0, y: 260 },
    },
    {
      type: 'camera',
      id: generateId(),
      size: { width: 425, height: 250 },
      position: { x: 400, y: 0 },
    },
    {
      type: 'camera',
      id: generateId(),
      size: { width: 425, height: 250 },
      position: { x: 825, y: 0 },
    },
    {
      type: 'visualization3d',
      id: generateId(),
      size: { width: 850, height: 250 },
      position: { x: 400, y: 260 },
    },
    {
      type: 'button',
      id: generateId(),
      size: { width: 200, height: 150 },
      position: { x: 1290, y: 0 },
      props: {
        buttonAction: 'getDown' as RobotActionTypeName,
      },
    },
    {
      type: 'button',
      id: generateId(),
      size: { width: 200, height: 150 },
      position: { x: 1290, y: 150 },
      props: {
        buttonAction: 'antiCollisionOn' as RobotActionTypeName,
      },
    },
    {
      type: 'button',
      id: generateId(),
      size: { width: 200, height: 150 },
      position: { x: 1290, y: 300 },
      props: {
        buttonAction: 'sit' as RobotActionTypeName,
      },
    },
    {
      type: 'button',
      id: generateId(),
      size: { width: 200, height: 150 },
      position: { x: 1290, y: 450 },
      props: {
        buttonAction: 'lightOn' as RobotActionTypeName,
      },
    },
  ],
  Information: [],
  'Command Input': [],
  '3D Visualization': [],
  'Image Visualization': [],
};

export default layouts;
