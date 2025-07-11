import React from 'react';
import { Message as MessageType } from '../types';
import { BotIcon } from './icons';

interface MessageProps {
  message: MessageType;
}

const SourceLink: React.FC<{ uri: string; title: string; index: number }> = ({ uri, title, index }) => (
    <a
        href={uri}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full px-3 py-1 text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
    >
        <span className="font-bold">{index + 1}.</span> {title || uri}
    </a>
);

const Message: React.FC<MessageProps> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex items-start gap-4 my-4 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
          isModel ? 'bg-blue-500 text-white' : 'bg-white shadow-sm border border-gray-200'
        }`}
      >
        {isModel ? <BotIcon className="w-6 h-6" /> : <img src="/images/logo.png" alt="Syndicate Logo" className="w-full h-full object-contain p-1" />}
      </div>
      <div
        className={`relative max-w-xl p-4 rounded-lg shadow-md ${
          isModel
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
            : 'bg-blue-600 text-white rounded-br-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-xs font-bold mb-2 text-gray-500 dark:text-gray-400">Sources:</h4>
                <div className="flex flex-wrap gap-2">
                    {message.sources.map((source, index) => (
                        <SourceLink key={index} {...source} index={index} />
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Message;