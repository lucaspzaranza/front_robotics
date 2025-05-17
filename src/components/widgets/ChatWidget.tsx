'use client';

import { Widget } from './Widget';
import Chat from '../chat';

interface ChatWidgetProps {
  id: string;
  onRemove: (id: string) => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  title?: string;
}

export function ChatWidget({
  id,
  onRemove,
  initialPosition,
  initialSize = { width: 350, height: 400 },
  title = 'Chat',
}: ChatWidgetProps) {
  return (
    <Widget
      id={id}
      title={title}
      onRemove={onRemove}
      initialPosition={initialPosition}
      initialSize={initialSize}
      minWidth={300}
      minHeight={350}
    >
      <div className="h-full flex flex-col">
        <Chat />
      </div>
    </Widget>
  );
} 