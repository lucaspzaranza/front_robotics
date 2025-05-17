'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Vector2 } from 'three';
import { StickType } from '@/types/StickType';

interface GamepadHandler {
  onGamepadUpdate: (options: {
    stick: StickType;
    vector?: Vector2;
    turn?: number;
  }) => void;
  onGamepadDisconnected?: () => void;
}

const DEADZONE = 0.1; // Ignore small stick movements

export default function useGamepadInput({ onGamepadUpdate, onGamepadDisconnected }: GamepadHandler) {
  const requestRef = useRef<number | undefined>(undefined);
  const gamepadsRef = useRef<Map<number, Gamepad>>(new Map());
  const prevGamepadCountRef = useRef(0);
  // Track the state of both sticks separately
  const leftStickStateRef = useRef<Vector2>(new Vector2(0, 0));
  const rightStickTurnRef = useRef<number>(0);
  
  // Memoize callback to avoid dependency changes
  const handleGamepadDisconnected = useCallback(() => {
    if (onGamepadDisconnected) {
      onGamepadDisconnected();
    }
  }, [onGamepadDisconnected]);
  
  // Handle gamepad connection
  useEffect(() => {
    const handleGamepadConnected = (event: GamepadEvent) => {
      console.log(`Gamepad connected: ${event.gamepad.id}`);
      gamepadsRef.current.set(event.gamepad.index, event.gamepad);
    };

    const handleDisconnect = (event: GamepadEvent) => {
      console.log(`Gamepad disconnected: ${event.gamepad.id}`);
      gamepadsRef.current.delete(event.gamepad.index);
      
      // Call disconnection callback
      handleGamepadDisconnected();
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      
      // Ensure we cancel the animation frame when unmounting
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [handleGamepadDisconnected]);

  // Apply deadzone to joystick values
  const applyDeadzone = (value: number): number => {
    return Math.abs(value) < DEADZONE ? 0 : value;
  };

  // Main gamepad polling loop
  useEffect(() => {
    const updateGamepadState = () => {
      // Get fresh gamepad data
      const gamepads = navigator.getGamepads();
      let hasActiveGamepad = false;
      let leftStickUpdated = false;
      let rightStickUpdated = false;
      
      if (gamepads) {
        for (const gamepad of gamepads) {
          if (!gamepad) continue;
          
          hasActiveGamepad = true;
          // Store updated gamepad data
          gamepadsRef.current.set(gamepad.index, gamepad);
          
          // Left stick controls movement (axes 0 and 1)
          const leftX = applyDeadzone(gamepad.axes[0]);
          const leftY = applyDeadzone(gamepad.axes[1]);
          
          if (leftX !== 0 || leftY !== 0) {
            // Update left stick state
            leftStickStateRef.current.set(-leftY, leftX);
            leftStickUpdated = true;
          } else if (prevGamepadCountRef.current > 0) {
            // If stick was previously active but now centered, reset its state
            leftStickStateRef.current.set(0, 0);
            leftStickUpdated = true;
          }
          
          // Right stick controls rotation (axes 2 and 3)
          const rightX = applyDeadzone(gamepad.axes[2]);
          
          if (rightX !== 0) {
            // Update right stick state
            rightStickTurnRef.current = rightX;
            rightStickUpdated = true;
          } else if (prevGamepadCountRef.current > 0) {
            // If stick was previously active but now centered, reset its state
            rightStickTurnRef.current = 0;
            rightStickUpdated = true;
          }
          
          // If either stick was updated, send both states together
          if (leftStickUpdated || rightStickUpdated) {
            // Send left stick update with current right stick value
            onGamepadUpdate({
              stick: 'left',
              vector: leftStickStateRef.current,
              turn: rightStickTurnRef.current
            });
            
            // Send right stick update with current left stick value
            onGamepadUpdate({
              stick: 'right',
              vector: leftStickStateRef.current,
              turn: rightStickTurnRef.current
            });
          }
        }
      }
      
      // Update gamepad count for next frame
      prevGamepadCountRef.current = hasActiveGamepad ? 1 : 0;
      
      // Continue the loop
      requestRef.current = requestAnimationFrame(updateGamepadState);
    };
    
    // Start the gamepad polling loop
    requestRef.current = requestAnimationFrame(updateGamepadState);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [onGamepadUpdate]);

  // Utility function to check if gamepads are connected
  const hasConnectedGamepads = (): boolean => {
    return gamepadsRef.current.size > 0;
  };

  return {
    connectedGamepads: gamepadsRef.current,
    hasConnectedGamepads
  };
} 