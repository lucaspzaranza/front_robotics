'use client';

import Container from './ui/container';
import { MenuActionType } from '../types/RobotActionTypes';
import useMenuActions from '@/hooks/useMenuActions';
import Chat from './chat';
import { MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ChatContainer() {
  const menuActions = useMenuActions();
  const { t } = useLanguage();
  const actions: MenuActionType[] = [
    menuActions.chatNew,
    menuActions.expandContainer,
    menuActions.menu,
  ];

  return (
    <Container
      title={
        <div className="flex items-center">
          <MessageSquare className="mr-2 w-5 h-5" />
          <span>{t('chat', 'title')}</span>
        </div>
      }
      className="h-full flex flex-col justify-between mb-0 pb-0"
      customContentClasses="h-full mb-0 pt-1 overflow-auto"
      actions={actions}
    >
      <Chat />
    </Container>
  );
}
