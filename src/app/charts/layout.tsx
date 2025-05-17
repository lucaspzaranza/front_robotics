'use client';

import { ReactNode } from 'react';
import RobotHeader from '@/components/robot-header';
import { Sidebar } from '@/components/sidebar';
import SeparatorLine from '@/components/ui/separator-line';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { RobotCustomModeProvider } from '@/contexts/RobotCustomModesContext';

export default function ChartsLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-w-screen h-full bg-clear-pink dark:bg-botbot-darkest text-black dark:text-white relative"
      style={{ isolation: 'isolate' }}
    >
      <ThemeProvider>
        <RobotCustomModeProvider>
          <RobotHeader />
          <SeparatorLine />

          <div className="flex flex-row items-stretch justify-between relative z-0 bg-clear-pink">
            <div className="w-full h-full">{children}</div>
            <div className="absolute h-full right-0">
              <Sidebar />
            </div>
          </div>
        </RobotCustomModeProvider>
      </ThemeProvider>
    </div>
  );
}
