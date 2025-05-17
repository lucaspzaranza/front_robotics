'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Grid, CheckSquare } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';

export function GridLayoutHelper() {
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(4); // 4x4 grid by default
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);
  const { widgets, updateWidgetPosition, updateWidgetSize } = useDashboard();

  // Get container dimensions on mount and when window resizes
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('[data-dashboard-container]');
      if (!container) return;
      
      setContainerDimensions({
        width: container.clientWidth,
        height: container.clientHeight
      });
      
      setPortalContainer(container);
    };

    // Initial update
    updateDimensions();
    
    // Update on resize
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const snapToGrid = () => {
    if (containerDimensions.width === 0 || containerDimensions.height === 0) return;
    
    // Calculate cell size
    const cellWidth = containerDimensions.width / gridSize;
    const cellHeight = containerDimensions.height / gridSize;
    
    // Update each widget position and size to snap to grid
    widgets.forEach(widget => {
      // Calculate nearest grid position
      const gridX = Math.round(widget.position.x / cellWidth) * cellWidth;
      const gridY = Math.round(widget.position.y / cellHeight) * cellHeight;
      
      // Calculate size to be a multiple of grid cells
      const gridWidth = Math.max(1, Math.round(widget.size.width / cellWidth)) * cellWidth;
      const gridHeight = Math.max(1, Math.round(widget.size.height / cellHeight)) * cellHeight;
      
      // Update widget position and size
      updateWidgetPosition(widget.id, { x: gridX, y: gridY });
      updateWidgetSize(widget.id, { width: gridWidth, height: gridHeight });
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center">
        <button
          onClick={toggleGrid}
          className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium ${
            showGrid 
              ? 'bg-primary/10 text-primary dark:bg-botbot-purple/20 dark:text-botbot-accent' 
              : 'bg-gray-200 dark:bg-botbot-dark text-gray-700 dark:text-white'
          } hover:bg-gray-300 dark:hover:bg-botbot-darker focus:outline-none`}
          title="Toggle Grid"
        >
          <Grid className="h-4 w-4 mr-2" />
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>
      </div>

      {showGrid && (
        <>
          <div className="flex items-center space-x-1">
            <label htmlFor="grid-size" className="text-sm text-gray-700 dark:text-gray-300">
              Grid Size:
            </label>
            <select
              id="grid-size"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="bg-white dark:bg-botbot-dark text-gray-700 dark:text-white text-sm rounded-md px-2 py-1 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-botbot-purple"
            >
              {[2, 3, 4, 6, 8, 12].map((size) => (
                <option key={size} value={size}>
                  {size}x{size}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={snapToGrid}
            className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium bg-primary dark:bg-botbot-purple text-white hover:bg-primary/90 dark:hover:bg-botbot-purple/90 focus:outline-none"
            title="Snap to Grid"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Snap to Grid
          </button>
        </>
      )}

      {showGrid && portalContainer && createPortal(
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(130, 29, 183, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(130, 29, 183, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${100 / gridSize}% ${100 / gridSize}%`,
            zIndex: 5,
          }}
        />,
        portalContainer
      )}
    </div>
  );
} 