'use client';

import { useRef, useEffect } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { CameraWidget } from '../widgets/CameraWidget';
import { GaugeWidget } from '../widgets/GaugeWidget';
import { SidewaysGaugeWidget } from '../widgets/SidewaysGaugeWidget';
import { Visualizer3DWidget } from '../widgets/Visualizer3DWidget';
import { InfoWidget } from '../widgets/InfoWidget';
import { ChatWidget } from '../widgets/ChatWidget';
import { ButtonWidget } from '../widgets/ButtonWidget';
import { JoystickWidget } from '../widgets/JoystickWidget';
import { WidgetSelector } from './WidgetSelector';
import { GridLayoutHelper } from './GridLayoutHelper';
import { useLanguage } from '@/contexts/LanguageContext';

export function Dashboard() {
  const { widgets, removeWidget, updateWidgetPosition } = useDashboard();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // Ensure the dashboard container has correct position for absolute positioning
    if (dashboardRef.current) {
      const computedStyle = window.getComputedStyle(dashboardRef.current);
      if (computedStyle.position === 'static') {
        dashboardRef.current.style.position = 'relative';
      }
    }

    // Set min-height to ensure there's space for widgets
    const updateMinHeight = () => {
      if (dashboardRef.current) {
        dashboardRef.current.style.minHeight = '500px';
      }
    };

    updateMinHeight();
    window.addEventListener('resize', updateMinHeight);

    return () => {
      window.removeEventListener('resize', updateMinHeight);
    };
  }, []);

  const renderWidget = (widget: any) => {
    const { id, type, position, size, props } = widget;
    const widgetProps = {
      id,
      onRemove: removeWidget,
      initialPosition: position,
      initialSize: size,
      props,
    };

    switch (type) {
      case 'camera':
        return <CameraWidget key={id} {...widgetProps} />;
      case 'gauge':
        return <GaugeWidget key={id} {...widgetProps} />;
      case 'sidewaysgauge':
        return <SidewaysGaugeWidget key={id} {...widgetProps} />;
      case 'visualization3d':
        return <Visualizer3DWidget key={id} {...widgetProps} />;
      case 'info':
        return <InfoWidget key={id} {...widgetProps} />;
      case 'chat':
        return <ChatWidget key={id} {...widgetProps} />;
      case 'button':
        return <ButtonWidget key={id} {...widgetProps} />;
      case 'joystick':
        return <JoystickWidget key={id} {...widgetProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col h-full p-2 pb-6">
      <div className="pb-2 border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <WidgetSelector />
        <GridLayoutHelper />
      </div>

      <div
        ref={dashboardRef}
        data-dashboard-container
        className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-botbot-darkest rounded-xl"
        style={{ height: 'calc(100vh - 150px)' }}
      >
        {widgets.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
            <p className="text-2xl mb-4">{t('myUI', 'emptyDashboard')}</p>
            <p className="text-sm">{t('myUI', 'clickAddWidget')}</p>
          </div>
        ) : (
          widgets.map(renderWidget)
        )}
      </div>
    </div>
  );
}
