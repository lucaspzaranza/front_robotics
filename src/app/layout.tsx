import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import './globals.css';
import { RobotConnectionProvider } from '../contexts/RobotConnectionContext';
import { ROS2SimulatorProvider } from '@/utils/ros/ros2-simulator-provider';
import { NotificationsProvider } from '../contexts/NotificationsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SpeedInsights } from '@vercel/speed-insights/next';
import PopupsContainer from '@/components/popups-container';
import { HeaderProvider } from '@/contexts/HeaderContext';
import { RobotCustomModeProvider } from '@/contexts/RobotCustomModesContext';

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-work-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BotBot R1 - Home',
  description: 'BotBot R1 Command and Control system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${workSans.variable} ${workSans.className} antialiased h-full m-0 p-0`}
      >
        <AuthProvider>
          <NotificationsProvider>
            <LanguageProvider>
              <RobotConnectionProvider>
                <RobotCustomModeProvider>
                  <ROS2SimulatorProvider>
                    <HeaderProvider>
                      {children}
                      <PopupsContainer />
                    </HeaderProvider>
                  </ROS2SimulatorProvider>
                </RobotCustomModeProvider>
              </RobotConnectionProvider>
            </LanguageProvider>
          </NotificationsProvider>
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
