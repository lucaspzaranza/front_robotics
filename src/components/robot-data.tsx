'use client';

import Container from '@/ui/container';
import Image from 'next/image';
import SeparatorLine from './ui/separator-line';
import FillGauge from './fill-gauge';
import { MenuActionType } from '../types/RobotActionTypes';
import useMenuActions from '@/hooks/useMenuActions';
import { vector3ToString } from '@/utils/ros/roslib-utils';
import useRobotVelocity from '@/hooks/ros/useRobotVelocity';
import useRobotBatteryState from '@/hooks/ros/useRobotBatteryState';
import useRobotSpeed from '@/hooks/ros/useRobotSpeed';
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Info } from 'lucide-react';
import useRobotStatus from '@/hooks/ros/useRobotStatus';
import { RobotStatus } from '@/types/RobotStatus';

export default function RobotData() {
  const isDevEnv = process.env.NODE_ENV === 'development';
  const menuActions = useMenuActions();
  const { t } = useLanguage();

  const actions: MenuActionType[] = [
    menuActions.expandContainer,
    menuActions.menu,
  ];

  const velocity = useRobotVelocity();
  const _robotVel = vector3ToString(velocity.linear, {
    useX: true,
    useY: true,
  });
  const _robotAngleVel = vector3ToString(velocity.angular, {
    useY: true,
    useZ: true,
  });

  const battery = useRobotBatteryState();
  const { robotStatus } = useRobotStatus();
  const { speed, maxSpeed } = useRobotSpeed();

  const gaugeContainerClasses =
    'flex-1 min-w-[45%] max-w-full p-1 md:p-2 outline outline-1 outline-gray-200 dark:outline-black rounded-default-border flex flex-col items-center justify-center min-h-[100px]';

  const upperDataRowClasses = 'flex flex-row justify-between mb-1 md:mb-2';
  const midDataRowClasses = 'flex flex-row justify-between mt-1 md:mt-2';

  const robotModes = 'robotModes';
  const modeStates: Record<RobotStatus, string> = {
    idle: t(robotModes, 'idle'),
    balanceStand: t(robotModes, 'balanceStand'),
    pose: t(robotModes, 'pose'),
    locomotion: t(robotModes, 'locomotion'),
    lieDown: t(robotModes, 'lieDown'),
    jointLock: t(robotModes, 'jointLock'),
    damping: t(robotModes, 'damping'),
    sit: t(robotModes, 'sit'),
    emergency: t(robotModes, 'emergency'),
    obstacleAvoidance: t(robotModes, 'obstacleAvoidance'),
  };

  useEffect(() => {
    // console.log('render robot-data.tsx');
  }, [velocity, battery, speed]);

  return (
    <Container
      title={
        <div className="flex items-center">
          <Info className="mr-2 w-5 h-5" />
          <span>{t('robotData', 'title')}</span>
        </div>
      }
      actions={actions}
      className="h-full"
      customContentClasses="w-full h-min flex flex-col justify-between overflow-auto hide-scrollbar pt-1"
    >
      <div className={upperDataRowClasses}>
        <span>{t('robotData', 'robotState')}</span>
        <span>
          {modeStates[robotStatus]} ({isDevEnv && robotStatus})
        </span>
      </div>
      <SeparatorLine color="bg-gray-200 dark:bg-black" />
      <div className={midDataRowClasses}>
        <span>{t('robotData', 'errorStatus')}</span>
        <Image
          src={`status-error/normal.svg`}
          alt={t('robotData', 'errorStatus')}
          width={20}
          height={20}
          style={{ width: '20px', height: '20px' }}
        />
      </div>

      {isDevEnv && (
        <div>
          <SeparatorLine color="bg-gray-200 dark:bg-black mt-2" />
          <div className={midDataRowClasses}>
            <span>Velocidade:</span> {_robotVel}
          </div>

          <SeparatorLine color="bg-gray-200 dark:bg-black mt-2" />
          <div className={midDataRowClasses}>
            <span>Rotação:</span> {_robotAngleVel}
          </div>
        </div>
      )}

      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full flex flex-row flex-wrap justify-between gap-2 mt-2">
          <div className={gaugeContainerClasses}>
            <FillGauge
              valueProp={battery.percentage * 100}
              unit="%"
              label={t('robotData', 'battery')}
              showPercentage
            />
          </div>

          <div className={gaugeContainerClasses}>
            <FillGauge
              minValue={0}
              maxValue={maxSpeed}
              valueProp={speed}
              label={t('robotData', 'speed')}
              unit="m/s"
              gradientColors={['green', 'yellow', 'orange', 'red']}
              backgroundColor="#DDDDDD"
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
