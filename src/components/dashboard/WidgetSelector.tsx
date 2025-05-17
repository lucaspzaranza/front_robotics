'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Camera,
  Gauge,
  Box,
  Info,
  Plus,
  Save,
  Download,
  MessageSquare,
  Battery,
  Square,
  Gamepad,
} from 'lucide-react';
import { useDashboard, WidgetType } from '@/contexts/DashboardContext';
import { useLanguage } from '@/contexts/LanguageContext';
import layouts, { LayoutType } from '@/utils/my-ui/layouts';

export function WidgetSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [layoutIsOpen, setLayoutIsOpen] = useState(false);
  const { addWidget, saveLayout, loadLayout, clearWidgets } = useDashboard();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fireSaveFeedback, setFireSaveFeedback] = useState(false);
  const [fireLoadFeedback, setFireLoadFeedback] = useState(false);
  const [loadSuccess, setLoadSuccess] = useState(false);
  const { t } = useLanguage();

  const widgetOptions = [
    {
      type: 'camera' as WidgetType,
      label: 'Camera',
      icon: <Camera className="w-4 h-4 mr-2" />,
    },
    {
      type: 'gauge' as WidgetType,
      label: 'Gauge',
      icon: <Gauge className="w-4 h-4 mr-2" />,
    },
    {
      type: 'sidewaysgauge' as WidgetType,
      label: 'Sideways Gauge',
      icon: <Battery className="w-4 h-4 mr-2" />,
    },
    {
      type: 'visualization3d' as WidgetType,
      label: '3D Visualization',
      icon: <Box className="w-4 h-4 mr-2" />,
    },
    {
      type: 'info' as WidgetType,
      label: 'Information',
      icon: <Info className="w-4 h-4 mr-2" />,
    },
    {
      type: 'chat' as WidgetType,
      label: 'Chat',
      icon: <MessageSquare className="w-4 h-4 mr-2" />,
    },
    {
      type: 'button' as WidgetType,
      label: 'Button',
      icon: <Square className="w-4 h-4 mr-2" />,
    },
    {
      type: 'joystick' as WidgetType,
      label: 'Joystick',
      icon: <Gamepad className="w-4 h-4 mr-2" />,
    },
  ];

  const layoutOptions: LayoutType[] = [
    'Default',
    'Command Input',
    'Information',
    'Image Visualization',
    '3D Visualization',
  ];

  const handleAddWidget = (type: WidgetType) => {
    addWidget(type);
    setIsOpen(false);
  };

  const updateLayout = (layout: string) => {
    clearWidgets();
    setTimeout(() => {
      const selectedLayout = layouts[layout as LayoutType];
      selectedLayout.forEach((widget) => {
        // if (widget.type === 'button') {
        //   console.log(widget);
        // }
        addWidget(widget.type, {
          ...widget,
        });
      });
      setLayoutIsOpen(false);
    }, 5);
  };

  const callSaveLayout = () => {
    const result = saveLayout();
    setFireSaveFeedback(true);

    if (result) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setFireSaveFeedback(false);
      }, 1000);
    } else {
      setSaveSuccess(false);
      setTimeout(() => {
        setFireSaveFeedback(false);
      }, 1000);
    }
  };

  const callLoadLayout = () => {
    clearWidgets();
    setTimeout(() => {
      const result = loadLayout();
      setFireLoadFeedback(true);

      if (result) {
        setLoadSuccess(true);
        setTimeout(() => {
          setLoadSuccess(false);
          setFireLoadFeedback(false);
        }, 1000);
      } else {
        setLoadSuccess(false);
        setTimeout(() => {
          setFireLoadFeedback(false);
        }, 1000);
      }
    }, 5);
  };

  return (
    <div className="relative">
      <div className="flex space-x-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium bg-primary dark:bg-botbot-purple text-white hover:bg-primary/90 dark:hover:bg-botbot-purple/90 focus:outline-none"
        >
          <Plus className="mr-1 h-4 w-4" />
          {t('myUI', 'addWidget')}
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>

        <button
          onClick={() => setLayoutIsOpen(!layoutIsOpen)}
          className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium bg-primary dark:bg-botbot-purple text-white hover:bg-primary/90 dark:hover:bg-botbot-purple/90 focus:outline-none"
        >
          {t('myUI', 'layout')}
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>

        <button
          onClick={callSaveLayout}
          className="relative inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium bg-gray-200 dark:bg-botbot-dark text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-botbot-darker focus:outline-none"
          title="Save Layout"
        >
          {fireSaveFeedback && saveSuccess && (
            <div className="absolute rounded-md inset-0 pointer-events-none z-50 bg-green-500 animate-successActionFeedback" />
          )}

          {fireSaveFeedback && !saveSuccess && (
            <div className="absolute rounded-md inset-0 pointer-events-none z-50 bg-red-500 animate-failActionFeedback" />
          )}
          <Save className="h-4 w-4" />
        </button>

        <button
          onClick={callLoadLayout}
          className="relative inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium bg-gray-200 dark:bg-botbot-dark text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-botbot-darker focus:outline-none"
          title="Load Layout"
        >
          {fireLoadFeedback && loadSuccess && (
            <div className="absolute rounded-md inset-0 pointer-events-none z-50 bg-green-500 animate-successActionFeedback" />
          )}

          {fireLoadFeedback && !loadSuccess && (
            <div className="absolute rounded-md inset-0 pointer-events-none z-50 bg-red-500 animate-failActionFeedback" />
          )}
          <Download className="h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-botbot-dark ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {widgetOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleAddWidget(option.type)}
                className="text-left w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-botbot-darker flex items-center"
                role="menuitem"
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {layoutIsOpen && (
        <div className="absolute top-full left-[11.5rem] mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-botbot-dark ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {layoutOptions.map((option) => (
              <button
                key={option}
                onClick={() => updateLayout(option)}
                className="text-left w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-botbot-darker flex items-center"
                role="menuitem"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
