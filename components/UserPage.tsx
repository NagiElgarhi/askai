
import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import { Message } from '../types';
import { generateChatResponseStream } from '../services/geminiService';

interface UserPageProps {
    apiKey: string;
    knowledgeBaseContent: string;
}

const UserPage: React.FC<UserPageProps> = ({ apiKey, knowledgeBaseContent }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'مرحباً بكم مع أداة نقابة أطباء القاهرة للرد على إستفساركم',
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendMessage = async (input: string) => {
    if (!apiKey) {
        setMessages(prev => [...prev, 
            { role: 'user', content: input },
            { role: 'model', content: 'الرجاء إدخال مفتاح API في الشريط العلوي أولاً لمتابعة.' }
        ]);
        return;
    }
      
    if (!knowledgeBaseContent) {
        setMessages(prev => [...prev, 
            { role: 'user', content: input },
            { role: 'model', content: 'لم يتم تكوين قاعدة المعرفة بعد. يرجى الطلب من مسؤول النظام زيارة رابط الإدارة وتزويد المساعد بالمستندات اللازمة.' }
        ]);
        return;
    }
      
    setIsLoading(true);
    const updatedMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(updatedMessages);

    let fullResponse = '';
    const responseMessageId = updatedMessages.length;
    
    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    try {
      const stream = await generateChatResponseStream(
        apiKey,
        messages,
        input,
        knowledgeBaseContent
      );
      
      for await (const chunk of stream) {
        if (chunk.text) {
          fullResponse += chunk.text;
        }
        
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[responseMessageId] = { 
                role: 'model', 
                content: fullResponse, 
            };
            return newMessages;
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
       setMessages(prev => {
        const newMessages = [...prev];
        const errorMessage = error instanceof Error ? error.message : "عذراً، حدث خطأ أثناء معالجة طلبك.";
        newMessages[responseMessageId] = { 
            role: 'model', 
            content: errorMessage.includes("API key") ? "مفتاح API غير صالح أو به مشكلة. يرجى التحقق منه." : errorMessage,
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full">
        <ChatWindow messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default UserPage;
