'use client';

import type * as React from 'react';
import { LogOut, Settings, User, User2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/utils/cn';
import logout from '@/utils/logout';

interface UserProfilePopupProps {
  children: React.ReactNode;
}

export function UserProfilePopup({ children }: UserProfilePopupProps) {
  const { t } = useLanguage();

  const hoverClasses = 'hover:hover:bg-purple-200 dark:hover:bg-purple-800';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-pink-lighter dark:bg-botbot-darker border-gray-300 dark:border-black"
        side="right"
        align="end"
        alignOffset={8}
        sideOffset={8}
        forceMount
      >
        <div className="flex items-center gap-2 p-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
            <User2 className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col text-black dark:text-botbot-accent">
            <span className="text-sm font-medium">John Doe</span>
            <span className="text-xs text-muted-foreground">
              ID: USR-2024-001
            </span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="text-black dark:text-botbot-accent">
          <DropdownMenuItem className={cn(hoverClasses)}>
            <User className="mr-2 h-4 w-4" />
            <span>{t('userProfile', 'profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className={cn(hoverClasses)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('userProfile', 'settings')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={cn(hoverClasses, 'text-red-600 dark:text-red-400')}
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('userProfile', 'logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
