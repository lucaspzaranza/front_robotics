'use client';

import Container from '@/ui/container';
import RobotActionButton from '@/ui/robot-action-button';
import { useEffect, useRef, useState } from 'react';
import { Gamepad } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import useRobotStatus from '@/hooks/ros/useRobotStatus';
import useRobotActionsTransitions from '@/hooks/ros/useRobotActionsTransitions';
import { useRobotCustomModeContext } from '@/contexts/RobotCustomModesContext';
import { RobotActionTypeName } from '@/types/RobotActionTypes';
import SeparatorLine from './ui/separator-line';

export default function RobotControls() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [_isWrapped, setIsWrapped] = useState(false);
  const [_itemsPerRow, setItemsPerRow] = useState(0);
  const { t } = useLanguage();
  const { light, statusBeforeEmergency, antiCollision } =
    useRobotCustomModeContext();
  const { robotStatus } = useRobotStatus();
  const robotActions = useRobotActionsTransitions(robotStatus);
  const robotActionsBeforeEmergency = useRobotActionsTransitions(
    statusBeforeEmergency ?? robotStatus
  );
  const [isInEmergencyMode, setEmergencyMode] = useState(false);

  const btnCustomClasses =
    'basis-1/2 md:basis-full hover:dark:bg-botbot-dark/80 dark:bg-botbot-dark focus:dark:bg-botbot-darker';

  const emergencyOnBtnClasses = `basis-full h-fit font-bold p-3 md:p-4 bg-red-500 
    text-white text-md md:text-lg 
    hover:bg-red-600
    focus:bg-red-700`;

  const emergencyOffBtnClasses = `basis-full h-fit font-bold p-3 md:p-4 bg-green-500 
    text-white text-md md:text-lg 
    hover:bg-green-600
    focus:bg-green-700`;

  const containerClasses =
    'w-min max-h-[calc(80vh-83px)] overflow-auto flex flex-col p-1 md:p-2 gap-2';

  useEffect(() => {
    const checkWrapAndCount = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const children = Array.from(container.children) as HTMLElement[];

      if (children.length === 0) return;

      let lastOffsetTop = children[0].offsetTop;
      let itemsInRow = 0;
      let maxItemsInRow = 0;

      children.forEach((child) => {
        if (child.offsetTop !== lastOffsetTop) {
          // New line detected
          maxItemsInRow = Math.max(maxItemsInRow, itemsInRow);
          itemsInRow = 1; // First item in new line
          lastOffsetTop = child.offsetTop;
        } else {
          itemsInRow++; // Count elements in same line
        }
      });

      maxItemsInRow = Math.max(maxItemsInRow, itemsInRow); // Check last line
      setItemsPerRow(maxItemsInRow);

      // If container height is greater than height of a single item, there was a line break
      const hasWrapped = container.clientHeight > children[0].clientHeight;
      setIsWrapped(hasWrapped);
    };

    const observer = new ResizeObserver(checkWrapAndCount);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    checkWrapAndCount(); // Run on first render

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setEmergencyMode(robotStatus === 'emergency');
  }, [robotStatus]);

  const getToggleActionButtons = (
    action: RobotActionTypeName
  ): RobotActionTypeName => {
    if (action.includes('light')) return light ? 'lightOff' : 'lightOn';
    else if (action.includes('Collision'))
      return antiCollision ? 'antiCollisionOff' : 'antiCollisionOn';
    return action;
  };

  return (
    <Container
      title={
        <div className="flex items-center">
          <Gamepad className="mr-2 w-5 h-5" />
          <span>{t('robotControls', 'title')}</span>
        </div>
      }
      className="w-full overflow-hidden"
    >
      <div
        ref={containerRef}
        className="h-full flex flex-col items-center justify-center"
      >
        <div className={containerClasses}>
          {(!isInEmergencyMode
            ? robotActions
            : robotActionsBeforeEmergency
          ).map((action, index) => {
            return (
              <RobotActionButton
                key={index}
                className={btnCustomClasses}
                action={getToggleActionButtons(action)}
              />
            );
          })}
        </div>

        <div className="w-screen h-min flex flex-col gap-4 rounded-b-default-border items-center justify-center">
          <SeparatorLine />
          {isInEmergencyMode && (
            <RobotActionButton
              className={emergencyOffBtnClasses}
              action="emergencyOff"
            />
          )}

          {!isInEmergencyMode && (
            <RobotActionButton
              className={emergencyOnBtnClasses}
              action="emergencyOn"
            />
          )}
        </div>
      </div>

      {/* Para debug no front */}

      {/* <p className="mt-4 text-xl">
        {_isWrapped ? 'Quebrou linha ✅' : 'Sem quebra de linha ❌'}
      </p>
      <p className="mt-2 text-lg">Elementos por linha: {_itemsPerRow}</p> */}
    </Container>
  );
}
