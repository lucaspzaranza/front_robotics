'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Add a simple uuid generator
export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type WidgetType =
  | 'camera'
  | 'gauge'
  | 'visualization3d'
  | 'info'
  | 'chat'
  | 'button'
  | 'sidewaysgauge'
  | 'joystick';

export interface Widget {
  id: string;
  type: WidgetType;
  position?: { x: number; y: number };
  size: { width: number; height: number };
  props?: Record<string, any>;
}

interface DashboardContextType {
  widgets: Widget[];
  addWidget: (type: WidgetType, initialProps?: Record<string, any>) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (
    id: string,
    position: { x: number; y: number }
  ) => void;
  updateWidgetSize: (
    id: string,
    size: { width: number; height: number }
  ) => void;
  updateWidgetProps: (id: string, props: Record<string, any>) => void;
  clearWidgets: () => void;
  saveLayout: () => boolean;
  loadLayout: () => boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = 'dashboard-widgets';

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>([]);

  // Load widgets from localStorage on initial render
  useEffect(() => {
    loadSavedWidgets();
  }, []);

  const loadSavedWidgets = () => {
    try {
      const savedWidgets = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedWidgets) {
        setWidgets(JSON.parse(savedWidgets));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load widgets from localStorage', error);
    }

    return false;
  };

  const addWidget = (type: WidgetType, widgetData?: Record<string, any>) => {
    // Generate a random position within the dashboard area
    const randomX = Math.random() * (window.innerWidth - 400);
    const randomY = Math.random() * (window.innerHeight - 400);

    const newWidget: Widget = {
      id: widgetData?.id ?? generateId(), // Use our custom ID generator
      type,
      position: widgetData?.position ?? { x: randomX, y: randomY },
      size: widgetData?.size ?? { width: 400, height: 300 },
      props: widgetData?.props,
    };

    setWidgets((prev) => [...prev, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== id));
  };

  const updateWidgetPosition = (
    id: string,
    position: { x: number; y: number }
  ) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id ? { ...widget, position } : widget
      )
    );
  };

  const updateWidgetSize = (
    id: string,
    size: { width: number; height: number }
  ) => {
    setWidgets((prev) =>
      prev.map((widget) => (widget.id === id ? { ...widget, size } : widget))
    );
  };

  const updateWidgetProps = (id: string, props: Record<string, any>) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id
          ? { ...widget, props: { ...widget.props, ...props } }
          : widget
      )
    );
  };

  const clearWidgets = () => {
    setWidgets([]);
  };

  const saveLayout = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(widgets));
      return true;
    } catch (error) {
      console.error('Failed to save widgets to localStorage', error);
    }
    return false;
  };

  const loadLayout = () => {
    return loadSavedWidgets();
  };

  return (
    <DashboardContext.Provider
      value={{
        widgets,
        addWidget,
        removeWidget,
        updateWidgetPosition,
        updateWidgetSize,
        updateWidgetProps,
        clearWidgets,
        saveLayout,
        loadLayout,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
