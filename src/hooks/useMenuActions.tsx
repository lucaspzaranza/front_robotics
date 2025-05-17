'use client';

import toggleFullscreen from '@/utils/toggle-fullscreen';
import { useHeader } from '../contexts/HeaderContext';
import { MenuActionType, MenuActionTypeName } from '../types/RobotActionTypes';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

const getDarkModeFolder = () => {
  const { theme } = useTheme();
  return `${theme === 'dark' ? 'white/' : ''}`;
};

export default function useMenuActions(): Record<
  MenuActionTypeName,
  MenuActionType
> {
  const header = useHeader();
  const router = useRouter();

  return {
    expandContainer: {
      label: 'Expandir Container',
      icon: `${getDarkModeFolder()}expand`,
      action: () => alert('Expandir Container'),
    },
    dashboard: {
      label: 'Home',
      icon: `${getDarkModeFolder()}bot-home`,
      action: () => router.push('/robot-home'),
    },
    chart: {
      label: 'Chart',
      icon: `${getDarkModeFolder()}chart`,
      action: () => router.push('/charts'),
    },
    nav: {
      label: 'Nav',
      icon: `${getDarkModeFolder()}map`,
      action: () => header.setMapPopupOpen(!header.mapPopupOpen),
    },
    chatMenu: {
      label: 'Chat',
      icon: `${getDarkModeFolder()}chat`,
      action: () => header.setChatPopupOpen(!header.chatPopupOpen),
    },
    chatNew: {
      label: 'Novo chat com o robô',
      icon: `${getDarkModeFolder()}new-chat`,
      action: () => alert('Novo chat com o robô'),
    },
    settings: {
      label: 'Settings',
      icon: `${getDarkModeFolder()}settings`,
      action: () => alert('Settings'),
    },
    dPad: {
      label: 'D-Pad',
      icon: `${getDarkModeFolder()}dpad`,
      action: () => alert('D-Pad Menu'),
    },
    fullScreen: {
      label: 'Full Screen',
      icon: `${getDarkModeFolder()}expand`,
      action: () => {
        toggleFullscreen();
      },
    },
    menu: {
      label: 'Menu',
      icon: `${getDarkModeFolder()}meatballs-menu`,
      iconDefaultSize: 15,
      action: () => alert('Menu'),
    },
    myUi: {
      label: 'My UI',
      icon: `${getDarkModeFolder()}layout`,
      action: () => router.push('/my-ui'),
    },
  };
}
