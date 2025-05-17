'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

const _themes = {
  light: 'light',
  dark: 'dark',
};

interface ThemeContextType {
  theme: keyof typeof _themes;
  setTheme: React.Dispatch<React.SetStateAction<keyof typeof _themes>>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<keyof typeof _themes>('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};
