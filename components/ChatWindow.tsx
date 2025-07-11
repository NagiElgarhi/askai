
import React, { useRef, useEffect } from 'react';
import { Message as MessageType } from '../types';
import Message from './Message';
import { BotIcon } from './icons';

interface ChatWindowProps {
  messages: MessageType[];
  isLoading: boolean;
}

const TypingIndicator = () => (
    <div className="flex items-start gap-4 my-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white">
            <BotIcon className="w-6 h-6" />
        </div>
        <div className="relative max-w-xl p-4 rounded-lg shadow-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-br-none">
            <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></span>
            </div>
        </div>
    </div>
);


const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {messages.map((msg, index) => (
        <Message key={index} message={msg} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;
