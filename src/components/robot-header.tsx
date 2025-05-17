'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import NavMenu from './nav-menu';
import { useHeader } from '../contexts/HeaderContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Bot, Battery, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useRobotConnection } from '../contexts/RobotConnectionContext';
import useRobotBatteryState from '@/hooks/ros/useRobotBatteryState';
import RobotConnectionPopup from './robot-connection-popup';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RobotHeader() {
  const { theme } = useTheme();
  const { connection, connectionStatus, lastError } = useRobotConnection();
  const { navMenuCollapsed } = useHeader();
  const batteryState = useRobotBatteryState();
  const { t } = useLanguage();
  
  // Easter egg states
  const [_clickCount, setClickCount] = useState(0);
  const [clickTimes, setClickTimes] = useState<number[]>([]);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Connection popup state
  const [showConnectionPopup, setShowConnectionPopup] = useState(false);
  
  // Connection status animation
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [connectionStatusMessage, setConnectionStatusMessage] = useState('');
  const [isConnectionError, setIsConnectionError] = useState(false);

  // Monitor connection status changes
  useEffect(() => {
    // When connection status changes, show a status indicator
    if (connectionStatus === 'connected') {
      setConnectionStatusMessage('Conectado ao robô BotBot R1');
      setIsConnectionError(false);
      setShowConnectionStatus(true);
    } else if (connectionStatus === 'error') {
      setConnectionStatusMessage(lastError || 'Falha na conexão com o robô');
      setIsConnectionError(true);
      setShowConnectionStatus(true);
    } else if (connectionStatus === 'connecting') {
      setConnectionStatusMessage('Conectando ao robô...');
      setIsConnectionError(false);
      setShowConnectionStatus(true);
    }
    
    // Hide after 3 seconds if not connecting
    if (connectionStatus !== 'connecting') {
      const timer = setTimeout(() => {
        setShowConnectionStatus(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [connectionStatus, lastError, connection.online]);

  // Prevent default behavior on logo
  useEffect(() => {
    const logoElement = document.getElementById('logo-easter-egg');
    if (logoElement) {
      const preventEvent = (e: Event) => {
        e.preventDefault();
      };
      
      logoElement.addEventListener('mousedown', preventEvent);
      logoElement.addEventListener('focus', preventEvent);
      
      return () => {
        logoElement.removeEventListener('mousedown', preventEvent);
        logoElement.removeEventListener('focus', preventEvent);
      };
    }
  }, []);

  const navMenuClassses = `w-full flex flex-row items-center justify-end ${
    navMenuCollapsed ? '' : 'justify-center'
  }`;

  const imgPath = `/botbot-logo${theme === 'dark' ? '-white' : ''}.png`;

  // Easter egg click handler
  const handleLogoClick = useCallback(() => {
    const currentTime = Date.now();
    const newClickTimes = [...clickTimes, currentTime].filter(
      time => currentTime - time < 10000 // Only keep clicks within last 10 seconds
    );
    
    setClickTimes(newClickTimes);
    setClickCount(newClickTimes.length);

    if (newClickTimes.length >= 5) {
      setShowEasterEgg(true);
      setClickTimes([]);
      setClickCount(0);
      
      // Hide the easter egg after 4 seconds
      setTimeout(() => {
        setShowEasterEgg(false);
      }, 4000);
    }
  }, [clickTimes]);

  // Open connection popup
  const openConnectionPopup = () => {
    setShowConnectionPopup(true);
  };

  // Calculate battery percentage
  const batteryPercentage = connection.online ? Math.round(batteryState.percentage * 100) : 0;

  // Get connection icon based on status
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-5 w-5 text-green-600 dark:text-green-500" />;
      case 'connecting':
        return <Loader2 className="h-5 w-5 text-purple-600 dark:text-purple-400 animate-spin" />;
      case 'error':
      case 'idle':
      default:
        return <WifiOff className="h-5 w-5 text-red-500" />;
    }
  };

  // Get connection status text
  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return t('robotHeader', 'connected');
      case 'connecting':
        return t('robotHeader', 'connecting');
      case 'error':
      case 'idle':
      default:
        return t('robotHeader', 'disconnected');
    }
  };

  // Get connection text color
  const getConnectionTextClass = () => {
    switch (connectionStatus) {
      case 'connected':
        return '';
      case 'connecting':
        return 'text-purple-600 dark:text-purple-400';
      case 'error':
      case 'idle':
      default:
        return 'text-red-500';
    }
  };

  return (
    <>
      <header className="px-6 py-0 text-center flex flex-row items-center justify-between">
        <div className="flex px-3 py-0 flex-col items-start justify-center">
          <div className="flex flex-row items-center">
            <div 
              className="w-10 h-10 rounded-full bg-[#821db7] dark:bg-botbot-dark flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={openConnectionPopup}
              title={t('robotHeader', 'connectionTitle')}
            >
              <Bot className="w-5 h-5" />
            </div>
            <span 
              className={`heading-text text-start mx-2 whitespace-nowrap cursor-pointer hover:underline ${getConnectionTextClass()}`}
              onClick={openConnectionPopup}
            >
              {getConnectionText()}
            </span>
            
            {/* Connection indicator */}
            <div 
              onClick={openConnectionPopup}
              className="cursor-pointer"
              title={t('robotHeader', 'connectionTitle')}
            >
              {getConnectionIcon()}
            </div>
          </div>

          {/* Battery bar - only show when connected */}
          {connection.online && (
            <div className="flex items-center ml-12 mt-1">
              <Battery className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-1" />
              <div className="h-2 w-24 bg-gray-200 dark:bg-botbot-dark/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 dark:bg-purple-400 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${batteryPercentage}%` }}
                />
              </div>
              <span className="text-xs ml-1 text-gray-600 dark:text-botbot-accent">{batteryPercentage}%</span>
            </div>
          )}
        </div>
        <div className="w-full flex flex-row items-center justify-between">
          <div className={navMenuClassses}>
            <NavMenu />
          </div>
          <div 
            id="logo-easter-egg"
            onClick={handleLogoClick}
            className="outline-none select-none"
            style={{ 
              touchAction: 'manipulation', 
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none'
            }}
          >
            <Image
              src={imgPath}
              alt="Avatar"
              width={125}
              height={34}
              style={{ 
                width: '125px', 
                height: '34px', 
                outline: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
              priority
              draggable={false}
              className="outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none"
            />
          </div>
        </div>

        {/* Connection Popup */}
        <RobotConnectionPopup 
          isOpen={showConnectionPopup} 
          onClose={() => setShowConnectionPopup(false)} 
        />
        
        {/* Easter egg animation */}
        {showEasterEgg && (
          <>
            <div className="fixed inset-0 pointer-events-none z-50">
              {/* Psychedelic background effect */}
              <div className="absolute inset-0 animate-psychedelic opacity-70" />
              
              {/* Color overlay that changes colors */}
              <div className="absolute inset-0 mix-blend-overlay bg-gradient-radial from-purple-500 to-transparent animate-pulse" />
              <div className="absolute inset-0 mix-blend-color-dodge bg-gradient-conic from-yellow-500 via-pink-500 to-blue-500 animate-spin" style={{ animationDuration: '3s' }} />
              
              {/* Center elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div 
                    className="absolute animate-emoji1 text-9xl"
                    style={{ 
                      filter: 'drop-shadow(0 0 8px rgba(255,0,255,0.5))',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    ❤️
                  </div>
                  <div 
                    className="absolute animate-emoji2 text-9xl" 
                    style={{ 
                      filter: 'drop-shadow(0 0 8px rgba(0,200,255,0.5))',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    🤖
                  </div>
                  <div 
                    className="absolute animate-emoji3 text-9xl" 
                    style={{ 
                      filter: 'drop-shadow(0 0 8px rgba(255,255,0,0.5))',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    🇧🇷
                  </div>
                </div>
              </div>
              
              {/* Signature */}
              <div 
                className="fixed bottom-6 left-0 right-0 text-center text-lg font-bold" 
                style={{ 
                  color: '#FF0000',
                  fontFamily: 'cursive, Arial, sans-serif',
                  textShadow: '0 0 5px rgba(255,0,0,0.3), 0 0 10px rgba(255,255,255,0.5)',
                  opacity: 0,
                  animation: 'fadeIn 1s ease-in forwards 0.5s'
                }}
              >
                Criado no Brasil com Amor
              </div>
            </div>
          </>
        )}
      </header>

      {/* Animated connection status message */}
      {showConnectionStatus && (
        <div className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 py-2 px-4 rounded-full z-50 flex items-center ${
          isConnectionError ? 'bg-red-500 text-white' : 'bg-green-100 dark:bg-botbot-dark text-gray-800 dark:text-white'
        } shadow-lg transition-all duration-300 ease-in-out`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnectionError ? 'bg-white animate-pulse' : 'bg-green-500'
          }`}></div>
          <span className="text-sm whitespace-nowrap">{connectionStatusMessage}</span>
        </div>
      )}
    </>
  );
}