'use client';

import { cn } from '@/utils/cn';
import useRobotActions from '@/hooks/ros/useRobotActions';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { RobotActionType, RobotActionTypeName } from '@/types/RobotActionTypes';
import useRobotStatus from '@/hooks/ros/useRobotStatus';

export default function RobotActionButton({
  action,
  className = '',
  imgSize = 35,
}: {
  action: RobotActionTypeName;
  className?: string;
  imgSize?: number;
}) {
  const [isClicked, setIsClicked] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  const [showErrorFeedback, setShowErrorFeedback] = useState(false);
  const robotActions = useRobotActions();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { robotStatus } = useRobotStatus();

  const isEmergencyAction = action.includes('emergency');
  const feedbackAnimationDuration = 750;

  const handleClick = (btn: RobotActionType) => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 400); // Remove a animação após 400ms

    // Show flash animation when stop button is clicked
    if (action === 'emergencyOn') {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 1500); // Hide flash after 1.5 seconds
    }

    btn.action &&
      btn.action({
        callback: () => {
          console.log(`Ação ${action} executada com sucesso.`);
          setShowSuccessFeedback(true);
          setTimeout(() => {
            setShowSuccessFeedback(false);
          }, feedbackAnimationDuration); // Hide after 0.25 seconds
        },
        failedCallback: (error?: string) => {
          console.error(error);
          setShowErrorFeedback(true);

          if (action === 'emergencyOn') {
            setShowFlash(false);
          }

          setTimeout(() => {
            setShowErrorFeedback(false);
          }, feedbackAnimationDuration);
        },
      });
  };

  const btn = robotActions[action];
  const defaultHoverClass = isEmergencyAction ? '' : 'hover:bg-secondary';
  const defaultRingHoverClass = isEmergencyAction
    ? 'ring-0'
    : 'hover:ring-1 hover:ring-primary focus:ring-1 focus:ring-primary dark:ring-black disabled:ring-0';

  return (
    <>
      {showFlash && (
        <div className="fixed inset-0 pointer-events-none z-50 bg-red-600 animate-redFlash" />
      )}

      <div className="relative">
        {/* {showSuccessFeedback && (
          <CircleCheck
            color="#108a00"
            className="absolute w-10 h-10 right-[90%] mt-8 z-50 animate-slide-up-fade-out"
          />
        )}

        {showErrorFeedback && (
          <CircleX
            color="#cd0404"
            className="absolute w-10 h-10 right-[90%] mt-8 z-50 animate-slide-up-fade-out"
          />
        )} */}

        <button
          ref={btnRef}
          disabled={isEmergencyAction ? false : robotStatus === 'emergency'}
          className={cn(
            `w-32 h-24 bg-pink-lighter text-black rounded-default-border p-4 flex flex-col items-center 
              hover:scale-110 transition-transform focus:bg-action-btn-focus focus: text-sm
              ${
                isClicked ? ' animate-shrinkBounce' : ''
              } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`,
            className,
            defaultRingHoverClass,
            defaultHoverClass
          )}
          onClick={() => {
            handleClick(btn);
          }}
        >
          {showSuccessFeedback && (
            <div className="absolute rounded-default-border inset-0 pointer-events-none z-50 bg-green-500 animate-successActionFeedback" />
          )}

          {showErrorFeedback && (
            <div className="absolute rounded-default-border inset-0 pointer-events-none z-50 bg-red-500 animate-failActionFeedback" />
          )}
          <div className="relative w-auto h-auto">
            {btn?.icon && (
              <Image
                src={`/robot-controls/${btn.icon}`}
                alt={btn.name}
                width={imgSize}
                height={imgSize}
                style={{ width: '35px', height: '35px' }}
              />
            )}
          </div>
          <label className="h-full min-w-[60px] flex flex-col items-center justify-center">
            {btn?.label}
          </label>
        </button>
      </div>
    </>
  );
}
