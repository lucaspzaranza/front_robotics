'use client';

import { useState, useRef, useEffect } from 'react';
import NavButton from './ui/nav-button';
import Image from 'next/image';
import { useHeader } from '../contexts/HeaderContext';
import { MenuActionType } from '../types/RobotActionTypes';
import useWindowWidth from '@/hooks/useWindowWidth';
import { Joysticks } from './ui/joysticks';
import useMenuActions from '@/hooks/useMenuActions';
import { useTheme } from '@/contexts/ThemeContext';

const defaultPath = '/icons/list-purple.svg';

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const [listIcon, setListIcon] = useState(defaultPath);
  const { theme } = useTheme();
  const { joystickEnabled } = useHeader();
  const menuRef = useRef<HTMLDivElement>(null);
  const collapsibleBreakpoint = 940;

  const { navMenuCollapsed, updateNavMenuCollapsed } = useHeader();

  const desktopNavClasses = navMenuCollapsed ? 'hidden' : ' flex space-x-4';
  const mobileNavClasses = navMenuCollapsed ? '' : 'hidden relative';
  const menuActions = useMenuActions();

  const navButtons: MenuActionType[] = [
    menuActions.dashboard,
    menuActions.chart,
    menuActions.nav,
    menuActions.chatMenu,
    menuActions.myUi,
    menuActions.settings,
  ];

  const width = useWindowWidth();

  useEffect(() => {
    if (theme === 'light') {
      setListIcon(defaultPath);
    } else if (theme === 'dark') {
      setListIcon('/icons/white/list.svg');
    }
  }, [theme]);

  // Atualiza o estado do header conforme a largura da janela do navegador
  useEffect(() => {
    const collapsed = width < collapsibleBreakpoint;
    updateNavMenuCollapsed(collapsed);
    if (!collapsed) setOpen(false);
  }, [width, updateNavMenuCollapsed, collapsibleBreakpoint]);

  // Fecha o menu se clicar fora (válido para a versão mobile)
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="flex flex-row justify-end">
      {/* Versão Desktop: visível a partir do breakpoint sm */}
      <div className={desktopNavClasses}>
        {/* <span>{width}px</span> */}
        {navButtons.map((btn, index) => (
          <NavButton
            key={index}
            name={btn.label}
            icon={btn.icon}
            onClick={btn.action}
            size={btn.iconDefaultSize}
          />
        ))}
      </div>

      {/* Versão Mobile: exibida apenas em telas menores que sm */}
      <div className={mobileNavClasses} ref={menuRef}>
        {/* Botão de hambúrguer */}
        <button
          onClick={() => setOpen(!open)}
          className="p-2 focus:outline-none"
          aria-label="Menu"
        >
          <Image src={listIcon} alt="menu" width={25} height={24} color="red" />
        </button>
        {open && (
          <div className="absolute right-36 mt-2 w-32 bg-white dark:bg-botbot-darker ring-1 ring-gray-200 dark:ring-black shadow-lg rounded-md px-2 py-2 z-50 flex flex-col items-center">
            {navButtons.map((btn, index) => (
              <NavButton
                key={index}
                name={btn.label}
                icon={btn.icon}
                layout="mobile"
                onClick={btn.action}
              />
            ))}
          </div>
        )}
      </div>

      <Joysticks enabled={joystickEnabled} />
    </nav>
  );
}
