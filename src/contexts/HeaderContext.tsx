'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface HeaderTypeContextData {
  navMenuCollapsed: boolean;
  mapPopupOpen: boolean;
  chatPopupOpen: boolean;
  joystickEnabled: boolean;
  updateNavMenuCollapsed: (newValue: boolean) => void;
  setMapPopupOpen: (newValue: boolean) => void;
  setChatPopupOpen: (newValue: boolean) => void;
  setJoystickEnabled: (newValue: boolean) => void;
}

const HeaderContext = createContext<HeaderTypeContextData | undefined>(
  undefined
);

export const HeaderProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [navMenuCollapsed, setNavMenuCollapsed] = useState<boolean>(false);
  const [mapPopupOpen, setMapPopupOpen] = useState<boolean>(false);
  const [chatPopupOpen, setChatPopupOpen] = useState<boolean>(false);
  const [joystickEnabled, setJoystickEnabled] = useState<boolean>(false);

  const updateNavMenuCollapsed = (newValue: boolean) => {
    setNavMenuCollapsed(newValue);
  };

  return (
    <HeaderContext.Provider
      value={{
        navMenuCollapsed,
        mapPopupOpen,
        chatPopupOpen,
        joystickEnabled,
        updateNavMenuCollapsed,
        setMapPopupOpen,
        setChatPopupOpen,
        setJoystickEnabled,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader deve ser usado dentro de um HeaderProvider');
  }
  return context;
};
