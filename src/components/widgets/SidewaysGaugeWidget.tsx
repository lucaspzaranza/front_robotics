'use client';

import { Widget } from './Widget';
import { useRef, useState } from 'react';
import useChartData, { ChartDataPoint } from '@/hooks/ros/useChartData';
import { useDashboard } from '@/contexts/DashboardContext';
import { Battery } from 'lucide-react';
import { topicsMessages } from '@/utils/ros/topics-and-services';
import { cn } from '@/utils/cn';

// Expanded list of ROS topics for the gauge (same as GaugeWidget)
const ROS_TOPICS = [
  // Basic robot state
  { label: 'Battery State', value: '/battery_state' },
  { label: 'Motor Temperature', value: '/motor/temperature' },
  { label: 'Joint States', value: '/joint_states' },
  { label: 'CPU Usage', value: '/system/cpu_usage' },
  { label: 'Motor Status', value: '/motor/status' },
  { label: 'Environment Temperature', value: '/environment/temperature' },

  // Sensors
  { label: 'Odometry', value: '/odom' },
  { label: 'Laser Scan', value: '/scan' },
  { label: 'Camera Front', value: '/camera/front/image_raw' },
  { label: 'Camera Rear', value: '/camera/rear/image_raw' },
  { label: 'Camera Left', value: '/camera/left/image_raw' },
  { label: 'Camera Right', value: '/camera/right/image_raw' },

  // Motion data
  { label: 'Cmd Vel Joy', value: '/cmd_vel_joy' },
  { label: 'Cmd Vel Nipple', value: '/cmd_vel_nipple' },

  // Additional sensors
  { label: 'IMU Data', value: '/imu/data' },
  { label: 'IMU Mag', value: '/imu/mag' },
  { label: 'Robot State', value: '/robot_state' },
  { label: 'Joint Command', value: '/joint_command' },
  { label: 'Foot Contact', value: '/foot_contact' },
  { label: 'Force Torque', value: '/force_torque' },
];

// Available units for the gauge (same as GaugeWidget)
const UNITS = [
  { label: 'Percentage', value: '%' },
  { label: 'Temperature', value: '°C' },
  { label: 'Velocity', value: 'm/s' },
  { label: 'Angular', value: 'rad' },
  { label: 'Distance', value: 'm' },
  { label: 'Voltage', value: 'V' },
  { label: 'Current', value: 'A' },
  { label: 'Number', value: '' },
];

interface SidewaysGaugeWidgetProps {
  id: string;
  onRemove: (id: string) => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  title?: string;
  minValue?: number;
  maxValue?: number;
  value?: number;
  unit?: string;
  color?: string;
  topic?: string;
  props?: {
    topic?: string;
    unit?: string;
    minValue?: number;
    maxValue?: number;
    title?: string;
  };
}

export function SidewaysGaugeWidget({
  id,
  onRemove,
  initialPosition,
  initialSize = { width: 400, height: 180 },
  title = 'Sideways Gauge',
  minValue = 0,
  maxValue = 100,
  value = 50,
  unit = '%',
  color = 'hsl(275, 70%, 40%)', // Purple that matches the theme
  topic = '/battery_state',
  props = {},
}: SidewaysGaugeWidgetProps) {
  const { updateWidgetProps } = useDashboard();

  const [updateData, setUpdateData] = useState(true);
  // Use props from dashboard context if available, otherwise use defaults
  const [currentTopic, setCurrentTopic] = useState(props.topic || topic);
  const [currentUnit, setCurrentUnit] = useState(props.unit || unit);
  const [currentMinValue, setCurrentMinValue] = useState(
    props.minValue || minValue
  );
  const [currentMaxValue, setCurrentMaxValue] = useState(
    props.maxValue || maxValue
  );
  const [currentTitle, setCurrentTitle] = useState(props.title || title);
  const [showSettings, setShowSettings] = useState(false);
  const data = useRef<ChartDataPoint[]>([]);

  // Use the hook to get data from ROS
  // const data = useChartData(
  //   currentTopic as keyof typeof topicsMessages,
  //   1000,
  //   20,
  //   updateData
  // );

  data.current = useChartData(
    currentTopic as keyof typeof topicsMessages,
    1000,
    20,
    updateData
  );

  const currentValue =
    data.current.length > 0
      ? data.current[data.current.length - 1].value
      : value;

  // Calculate the percentage for the progress bar
  const percentage =
    ((currentValue - currentMinValue) / (currentMaxValue - currentMinValue)) *
    100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Update dashboard context when settings change
  const updateSettings = (updates: any) => {
    const newProps = {
      ...props,
      ...updates,
    };
    updateWidgetProps(id, newProps);
    return newProps;
  };

  const handleTopicChange = (newTopic: string) => {
    setCurrentTopic(newTopic);
    updateSettings({ topic: newTopic });
  };

  const handleUnitChange = (newUnit: string) => {
    setCurrentUnit(newUnit);
    updateSettings({ unit: newUnit });
  };

  const handleMinValueChange = (newMinValue: number) => {
    setCurrentMinValue(newMinValue);
    updateSettings({ minValue: newMinValue });
  };

  const handleMaxValueChange = (newMaxValue: number) => {
    setCurrentMaxValue(newMaxValue);
    updateSettings({ maxValue: newMaxValue });
  };

  const handleTitleChange = (newTitle: string) => {
    setCurrentTitle(newTitle);
    updateSettings({ title: newTitle });
  };

  // Format the current value for display
  const formattedValue = Number.isInteger(currentValue)
    ? currentValue.toString()
    : currentValue.toFixed(2);

  const handleStartDrag = () => {
    setUpdateData(false);
  };

  const handleEndDrag = () => {
    setUpdateData(true);
  };

  return (
    <Widget
      id={id}
      title={currentTitle}
      onRemove={onRemove}
      initialPosition={initialPosition}
      initialSize={initialSize}
      minWidth={250}
      minHeight={150}
      onSettingsClick={() => setShowSettings(!showSettings)}
      onStartDrag={handleStartDrag}
      onEndDrag={handleEndDrag}
    >
      <div className={cn('h-full flex flex-col justify-between p-2')}>
        {showSettings && (
          <div className="w-full bg-gray-100 dark:bg-botbot-darker rounded-md p-3 mb-4 text-sm overflow-y-auto max-h-[40vh]">
            <div className="mb-3">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Gauge Name
              </label>
              <input
                type="text"
                value={currentTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-botbot-dark dark:border-botbot-darker"
                placeholder="Enter gauge name"
              />
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                ROS Topic
              </label>
              <div className="relative">
                <select
                  value={currentTopic}
                  onChange={(e) => handleTopicChange(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-botbot-dark dark:border-botbot-darker appearance-none text-sm"
                >
                  {ROS_TOPICS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <div className="relative">
                <select
                  value={currentUnit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-botbot-dark dark:border-botbot-darker appearance-none text-sm"
                >
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Min Value
                </label>
                <input
                  type="number"
                  value={currentMinValue}
                  onChange={(e) => handleMinValueChange(Number(e.target.value))}
                  className="w-full p-2 border rounded-md dark:bg-botbot-dark dark:border-botbot-darker"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Max Value
                </label>
                <input
                  type="number"
                  value={currentMaxValue}
                  onChange={(e) => handleMaxValueChange(Number(e.target.value))}
                  className="w-full p-2 border rounded-md dark:bg-botbot-dark dark:border-botbot-darker"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center space-y-4 w-full">
          <div className="flex items-center w-full pt-4">
            <div className="flex-shrink-0 mr-3">
              <Battery className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>

            <div className="flex flex-col w-full space-y-1">
              <div className="flex justify-between text-sm">
                <span>{currentMinValue}</span>
                <span>
                  {formattedValue} {currentUnit}
                </span>
                <span>{currentMaxValue}</span>
              </div>

              <div className="h-5 bg-gray-200 dark:bg-botbot-dark/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 dark:bg-purple-400 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${clampedPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Topic: {currentTopic}
          </div>
        </div>
      </div>
    </Widget>
  );
}
