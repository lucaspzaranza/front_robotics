'use client';

import { useState } from 'react';
import { Widget } from './Widget';
import { Play, Pause, Video, Camera } from 'lucide-react';
import { useRobotConnection } from '@/contexts/RobotConnectionContext';
import RosCameraImg from '../ros-camera-img';

interface CameraWidgetProps {
  id: string;
  onRemove: (id: string) => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  initialTopic?: string;
}

export function CameraWidget({
  id,
  onRemove,
  initialPosition,
  initialSize = { width: 400, height: 350 },
  initialTopic = 'compressed_camera',
}: CameraWidgetProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [topic, setTopic] = useState(initialTopic);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [tempTopic, setTempTopic] = useState(topic);
  const { connection } = useRobotConnection();

  // Function to handle topic changes
  const handleTopicChange = () => {
    setTopic(tempTopic);
    setIsEditingTopic(false);
  };

  return (
    <Widget
      id={id}
      title="Camera Feed"
      onRemove={onRemove}
      initialPosition={initialPosition}
      initialSize={initialSize}
      minWidth={320}
      minHeight={300}
    >
      <div className="h-full flex flex-col">
        {/* Topic subscription input */}
        <div className="mb-2 flex items-center text-sm">
          <div className="flex-1 flex items-center">
            <Camera className="w-4 h-4 mr-1 text-gray-500" />
            {isEditingTopic ? (
              <div className="flex-1 flex">
                <input
                  type="text"
                  value={tempTopic}
                  onChange={(e) => setTempTopic(e.target.value)}
                  className="flex-1 bg-gray-100 dark:bg-botbot-darker px-2 py-1 rounded text-sm border border-gray-300 dark:border-botbot-dark"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTopicChange();
                    if (e.key === 'Escape') {
                      setTempTopic(topic);
                      setIsEditingTopic(false);
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={handleTopicChange}
                  className="ml-1 px-2 py-1 bg-gray-200 dark:bg-botbot-dark rounded text-xs"
                >
                  Save
                </button>
              </div>
            ) : (
              <div 
                className="flex-1 cursor-pointer px-2 py-1 rounded bg-gray-100 dark:bg-botbot-darker hover:bg-gray-200 dark:hover:bg-botbot-dark text-sm truncate"
                onClick={() => {
                  setIsEditingTopic(true);
                  setTempTopic(topic);
                }}
                title={`ROS Topic: ${topic}`}
              >
                {topic}
              </div>
            )}
          </div>
        </div>
        
        {/* Camera feed area */}
        <div className="flex-1 bg-black rounded-md overflow-hidden">
          {connection.online && isPlaying ? (
            <div className="w-full h-full">
              <RosCameraImg topicName={topic} />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="flex flex-col items-center justify-center">
                <Video className="w-16 h-16 mb-2" />
                <p>{!connection.online ? "Robot offline" : "Stream paused"}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="mt-2 flex justify-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-full bg-gray-200 dark:bg-botbot-darker hover:bg-gray-300 dark:hover:bg-botbot-dark transition"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-gray-700 dark:text-white" />
            ) : (
              <Play className="w-5 h-5 text-gray-700 dark:text-white" />
            )}
          </button>
        </div>
      </div>
    </Widget>
  );
} 