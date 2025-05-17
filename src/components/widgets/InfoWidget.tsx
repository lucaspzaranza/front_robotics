'use client';

import { Widget } from './Widget';
import { Info } from 'lucide-react';

interface InfoWidgetProps {
  id: string;
  onRemove: (id: string) => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  title?: string;
  content?: string;
}

export function InfoWidget({
  id,
  onRemove,
  initialPosition,
  initialSize = { width: 300, height: 200 },
  title = 'Information',
  content = 'This is an information widget. You can display important messages or status information here.',
}: InfoWidgetProps) {
  return (
    <Widget
      id={id}
      title={title}
      onRemove={onRemove}
      initialPosition={initialPosition}
      initialSize={initialSize}
      minWidth={200}
      minHeight={150}
    >
      <div className="h-full flex flex-col p-2">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex-1 overflow-auto">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Widget>
  );
} 