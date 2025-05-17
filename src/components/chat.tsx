'use client';

import { ChatMessage } from '@/interfaces/ChatMessage';
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Loader2,
  Mic,
  ArrowRight,
  User,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import InputField from './ui/input-field';
import { useRobotConnection } from '../contexts/RobotConnectionContext';
import RobotOffline from './robot-offline';
import { useLanguage } from '@/contexts/LanguageContext';
import useRobotActions from '@/hooks/ros/useRobotActions';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [_showAudioRecorder, setShowAudioRecorder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollableAreaRef = useRef<HTMLDivElement>(null);
  const msgContainerRef = useRef<HTMLDivElement>(null);
  const [disasbleInput, setDisableInput] = useState(false);
  const { connection } = useRobotConnection();
  const _hasSentFirstHello = useRef(false);
  const { prompt } = useRobotActions();
  const { t } = useLanguage();

  // Just update the input state based on connection
  useEffect(() => {
    setDisableInput(!connection.online);
  }, [connection.online]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    moveChatToBottom();
  }, [messages]);

  const moveChatToBottom = () => {
    if (messagesScrollableAreaRef.current) {
      messagesScrollableAreaRef.current.scrollTo({
        top: messagesScrollableAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const sendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage(''); // Limpa o input após o envio

    callPromptService(content);

    // Simulate message sending delay
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );

      // Show typing indicator
      setIsTyping(true);
    }, 500);
  };

  const _handleAudioMessage = (text: string) => {
    setShowAudioRecorder(false);
    sendMessage(text);
  };

  const callPromptService = (input: string) => {
    prompt.action({
      input,
      callback: (result) => {
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: result.output,
          sender: 'robot',
          timestamp: new Date(),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, response]);
        moveChatToBottom();
      },
      failedCallback: (error?: string) => {
        console.error(error);
        setIsTyping(false);
        setDisableInput(true);
      },
    });
  };

  return (
    <div className="w-full h-full px-px flex flex-col items-center justify-center overflow-auto hide-scrollbar">
      {/* Messages area */}
      {connection.online && (
        <div
          className="w-full h-full overflow-auto space-y-4 pr-2"
          ref={messagesScrollableAreaRef}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              ref={msgContainerRef}
              className={`flex items-start gap-3 ${
                message.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user'
                    ? 'bg-[#821db7] dark:bg-botbot-dark'
                    : 'bg-[#f0d5ff] dark:bg-botbot-darker'
                }`}
              >
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-[#821db7] dark:text-white" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-[#821db7] dark:bg-botbot-dark text-white'
                    : 'bg-[#f0d5ff] dark:bg-botbot-darker'
                }`}
              >
                <p className="body-text">{message.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.sender === 'user' && message.status && (
                    <span className="text-xs">
                      {message.status === 'sending' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : message.status === 'sent' ? (
                        <ChevronRight className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f0d5ff] dark:bg-botbot-dark flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#821db7] dark:text-white" />
              </div>
              <div className="bg-[#f0d5ff] dark:bg-botbot-dark rounded-lg p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#821db7] dark:bg-botbot-accent rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-[#821db7] dark:bg-botbot-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-[#821db7] dark:bg-botbot-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
      {!connection.online && <RobotOffline useBorder={false} />}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (message.trim()) {
            sendMessage(message);
          }
        }}
        className="w-full h-min mt-2 flex flex-row items-end"
      >
        <InputField
          placeholder={t('chat', 'typeMessage')}
          className="mb-1 bg-white dark:bg-botbot-accent/30 text-gray-700"
          value={message}
          name="message"
          disabled={disasbleInput}
          onChange={(e) => setMessage(e.target.value)}
        >
          <div className="w-[6rem] flex flex-row items-center justify-between ml-2">
            <button
              disabled={disasbleInput}
              className="h-full p-3 bg-clear-pink dark:bg-botbot-darker rounded-full hover:bg-action-btn-focus dark:hover:bg-botbot-dark"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={disasbleInput}
              className="max-w-[50px] w-24 h-full p-2 bg-clear-pink dark:bg-botbot-darker rounded-full hover:bg-action-btn-focus dark:hover:bg-botbot-dark flex items-center justify-center"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </InputField>
      </form>
    </div>
  );
}
