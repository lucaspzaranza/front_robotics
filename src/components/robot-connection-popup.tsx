'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Wifi, WifiOff, AlertCircle, Loader2 } from 'lucide-react';
import { useRobotConnection } from '@/contexts/RobotConnectionContext';
import Popup from './ui/popup';
import Button from './ui/button';
import InputField from './ui/input-field';
import { useLanguage } from '@/contexts/LanguageContext';

// Validation regex for IP address with numbers only, e.g.: 192.168.2.109
const IP_REGEX =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// Validation regex for IP address with websockets and ports,
// e.g.: ws://192.168.2.109:9090 or wss://...
const WEBSOCKET_IP_WITH_PORT_REGEX =
  /^(wss?:\/\/)(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)(?::(?:0|[1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))$/;

// Validation regex for IP address with simple domains, e.g.: http://localhost:3000
const HTTP_URL_REGEX =
  /^(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}(\.[a-z]{2,6})?\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

interface RobotConnectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RobotConnectionPopup({
  isOpen,
  onClose,
}: RobotConnectionPopupProps) {
  const { connection, connectionStatus, lastError, connectToRobot } =
    useRobotConnection();
  const [ipAddress, setIpAddress] = useState('');
  const [isValid, setIsValid] = useState(true);
  const { t } = useLanguage();

  // Extract current IP from connection URL when popup opens
  useEffect(() => {
    if (isOpen && connection.ros) {
      try {
        // @ts-ignore - socket property exists at runtime but not in TypeScript definitions
        const url = connection.ros.socket.url;
        const ipMatch = url.match(/ws:\/\/([^:]+):/);
        if (ipMatch && ipMatch[1]) {
          setIpAddress(ipMatch[1]);
        }
      } catch (error) {
        console.error('Error extracting IP address:', error);
      }
    }
  }, [isOpen, connection.ros]);

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIpAddress(value);
    if (value.startsWith('ws')) {
      setIsValid(WEBSOCKET_IP_WITH_PORT_REGEX.test(value));
    } else if (value.startsWith('http')) {
      setIsValid(HTTP_URL_REGEX.test(value));
    } else {
      setIsValid(IP_REGEX.test(value));
    }
  };

  const handleConnect = async () => {
    if (!isValid) {
      return;
    }

    try {
      // Use the connectToRobot function from context
      await connectToRobot(ipAddress);

      // Close popup after successful connection after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };

  // Get connection status icon
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'connecting':
        return (
          <Loader2 className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin" />
        );
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'idle':
      default:
        return <WifiOff className="w-5 h-5 text-red-500 dark:text-red-400" />;
    }
  };

  // Get connection status text
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return t('connectionPopup', 'statusConnected');
      case 'connecting':
        return t('connectionPopup', 'statusConnecting');
      case 'error':
        return t('connectionPopup', 'statusError');
      case 'idle':
      default:
        return t('connectionPopup', 'statusIdle');
    }
  };

  // Get status text color
  const getStatusTextColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600 dark:text-green-400';
      case 'connecting':
        return 'text-purple-600 dark:text-purple-400';
      case 'error':
      case 'idle':
      default:
        return 'text-red-500 dark:text-red-400';
    }
  };

  // Get button label
  const getButtonLabel = () => {
    switch (connectionStatus) {
      case 'connected':
        return t('connectionPopup', 'buttonReconnect');
      case 'connecting':
        return t('connectionPopup', 'buttonConnecting');
      case 'error':
      case 'idle':
      default:
        return t('connectionPopup', 'buttonConnect');
    }
  };

  // Check if button should be disabled
  const isButtonDisabled = () => {
    return connectionStatus === 'connecting' || !ipAddress || !isValid;
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      className="min-w-[320px] sm:min-w-[400px] max-w-md"
      customContentClasses="p-5"
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Logo */}
        <div className="mb-2">
          <Image
            src={'/botbot-logo.png'}
            alt="BotBot Logo"
            width={120}
            height={34}
            priority
          />
        </div>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t('connectionPopup', 'title')}
        </h2>

        {/* Connection status indicator */}
        <div className="flex items-center justify-center w-full py-2 px-4 rounded-lg bg-gray-100 dark:bg-botbot-darker">
          <div className={`flex items-center ${getStatusTextColor()}`}>
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
          </div>
        </div>

        <div className="w-full space-y-4">
          {/* IP Address input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-botbot-accent mb-1">
              {t('connectionPopup', 'ipAddress')}
            </label>
            <InputField
              value={ipAddress}
              onChange={handleIpChange}
              placeholder="192.168.1.100"
              className={`${!isValid && ipAddress ? 'ring-red-500' : ''}`}
            />

            {!isValid && ipAddress && (
              <p className="mt-1 text-sm text-red-500">
                {t('connectionPopup', 'invalidIp')}
              </p>
            )}

            {isValid && ipAddress && (
              <p className="mt-1 text-sm text-green-500">
                {t('connectionPopup', 'validIp')}
              </p>
            )}
          </div>

          {/* Error message */}
          {connectionStatus === 'error' && lastError && (
            <div className="flex items-center text-sm text-red-500">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="text-sm">{lastError}</span>
            </div>
          )}

          {/* Connect button */}
          <Button
            label={getButtonLabel()}
            onClick={handleConnect}
            colorPalette="default"
            customClasses={`${
              isButtonDisabled() ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          />
        </div>
      </div>
    </Popup>
  );
}
