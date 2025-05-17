'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { Grip, X, Maximize, Minimize, Settings } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { cn } from '@/utils/cn';

export interface WidgetProps {
  id: string;
  title: string;
  onRemove: (id: string) => void;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  onSettingsClick?: () => void;
  onStartDrag?: () => void;
  onEndDrag?: () => void;
}

export function Widget({
  id,
  title,
  onRemove,
  children,
  initialPosition = { x: 0, y: 0 },
  initialSize = { width: 300, height: 200 },
  minWidth = 200,
  minHeight = 150,
  onSettingsClick,
  onStartDrag,
  onEndDrag,
}: WidgetProps) {
  const position = useRef(initialPosition);
  const prevPosition = useRef(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevSize, setPrevSize] = useState(initialSize);
  const [containerBounds, setContainerBounds] = useState({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
  });

  const widgetRef = useRef<HTMLDivElement>(null);
  const { updateWidgetPosition, updateWidgetSize } = useDashboard();
  const dragControls = useDragControls();

  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);

  // Get container bounds for drag constraints
  useEffect(() => {
    const updateContainerBounds = () => {
      const container = document.querySelector('[data-dashboard-container]');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setContainerBounds({
        left: 0,
        top: 0,
        right: rect.width,
        bottom: rect.height,
        width: rect.width,
        height: rect.height,
      });
    };

    updateContainerBounds();
    window.addEventListener('resize', updateContainerBounds);

    return () => {
      window.removeEventListener('resize', updateContainerBounds);
    };
  }, []);

  // Update state when initial props change
  useEffect(() => {
    position.current = initialPosition;
  }, [initialPosition]);

  useEffect(() => {
    setSize(initialSize);
  }, [initialSize]);

  const handleMaximize = () => {
    if (!isMaximized) {
      setPrevSize({ ...size });
      prevPosition.current = { x: x.get(), y: y.get() };
      setIsMaximized(true);

      const newSize = {
        width: containerBounds.width - 40,
        height: containerBounds.height - 40,
      };
      const newPosition = { x: 20, y: 20 };

      setSize(newSize);
      x.set(newPosition.x);
      y.set(newPosition.y);
      position.current = newPosition;

      updateWidgetSize(id, newSize);
      updateWidgetPosition(id, newPosition);
    } else {
      setIsMaximized(false);
      setSize(prevSize);
      x.set(prevPosition.current.x);
      y.set(prevPosition.current.y);
      position.current = prevPosition.current;

      updateWidgetSize(id, prevSize);
      updateWidgetPosition(id, prevPosition.current);
    }
  };

  // Function to start drag with the drag controls
  const startDrag = (event: React.PointerEvent) => {
    if (isMaximized) return;
    dragControls.start(event);
    onStartDrag?.();
  };

  const endDrag = () => {
    setIsDragging(false);
    // Update position in context
    updateWidgetPosition(id, position.current);
    onEndDrag?.();
  };

  return (
    <motion.div
      ref={widgetRef}
      drag={!isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragTransition={{ power: 0, timeConstant: 0 }}
      dragConstraints={{
        left: 0,
        top: 0,
        right: Math.max(0, containerBounds.width - size.width),
        bottom: Math.max(0, containerBounds.height - size.height),
      }}
      onDragStart={() => setIsDragging(true)}
      onDrag={(_, info) => {
        position.current = {
          x: x.get(),
          y: y.get(),
        };
      }}
      onDragEnd={endDrag}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: size.width,
        height: size.height,
        touchAction: 'none',
        x,
        y,
        zIndex: isDragging || isResizing ? 50 : 10,
      }}
      className={cn(
        'bg-white dark:bg-botbot-dark rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow',
        isDragging ? ' opacity-60' : ''
      )}
    >
      {/* Widget header */}
      <div
        className="flex items-center justify-between p-2 bg-gray-100 dark:bg-botbot-darker cursor-grab active:cursor-grabbing"
        onPointerDown={startDrag}
        onPointerUp={() => {
          onEndDrag?.();
        }}
      >
        <div className="flex items-center">
          <Grip className="h-4 w-4 mr-2 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-white">
            {title}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          {onSettingsClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSettingsClick();
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleMaximize}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            {isMaximized ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onRemove(id)}
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Widget content */}
      <div className="p-4 h-[calc(100%-2.5rem)] overflow-auto">{children}</div>

      {/* Resize handle (bottom-right corner) */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize"
          onPointerDown={(e) => {
            // Prevent default to avoid text selection during resize
            e.preventDefault();
            setIsResizing(true);

            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = size.width;
            const startHeight = size.height;

            const onMove = (moveEvent: PointerEvent) => {
              const dx = moveEvent.clientX - startX;
              const dy = moveEvent.clientY - startY;

              const newWidth = Math.max(
                minWidth,
                Math.min(
                  startWidth + dx,
                  containerBounds.width - position.current.x
                )
              );
              const newHeight = Math.max(
                minHeight,
                Math.min(
                  startHeight + dy,
                  containerBounds.height - position.current.y
                )
              );

              setSize({ width: newWidth, height: newHeight });
            };

            const onUp = () => {
              document.removeEventListener('pointermove', onMove);
              document.removeEventListener('pointerup', onUp);
              setIsResizing(false);

              // Update size in context
              updateWidgetSize(id, size);
            };

            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
          }}
        >
          <div className="absolute bottom-0 right-0 w-0 h-0 border-8 border-transparent border-b-gray-300 border-r-gray-300 dark:border-b-gray-600 dark:border-r-gray-600" />
        </div>
      )}
    </motion.div>
  );
}
