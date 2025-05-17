'use client';

import RobotHeader from '@/components/robot-header';
import SeparatorLine from '@/components/ui/separator-line';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function MyUILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-w-screen h-full bg-clear-pink dark:bg-botbot-darkest text-black dark:text-white relative overflow-hidden"
      style={{ isolation: 'isolate' }}
    >
      <ThemeProvider>
        <RobotHeader />
        <SeparatorLine />
        <main className="p-0 relative z-0 h-[calc(100vh-56px)] overflow-hidden">
          {children}
        </main>
      </ThemeProvider>
    </div>
  );
}
