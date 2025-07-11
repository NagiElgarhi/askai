import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import { Message } from '../types';
import { generateChatResponseStream } from '../services/geminiService';

interface UserPageProps {
    apiKey: string;
    knowledgeBaseContent: string;
    userLang: string;
}

const getInitialMessage = (lang: string): Message => {
  if (lang.toLowerCase().startsWith('ar')) {
    return {
      role: 'model',
      content: 'مرحباً بكم في مساعد نقابة أطباء القاهرة. كيف يمكنني مساعدتكم اليوم؟',
    };
  }
  return {
    role: 'model',
    content: 'Welcome to the AI Assistant for the Cairo Medical Syndicate. How can I help you today?',
  };
};

const UserPage: React.FC<UserPageProps> = ({ apiKey, knowledgeBaseContent, userLang }) => {
  const [messages, setMessages] = useState<Message[]>([
    getInitialMessage(userLang),
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendMessage = async (input: string) => {
    const isArabic = userLang.toLowerCase().startsWith('ar');

    if (!apiKey) {
        const errorMsg = isArabic
            ? 'من فضلك أدخل مفتاح API الخاص بك في الشريط العلوي للمتابعة.'
            : 'Please enter your API key in the header first to continue.';
        setMessages(prev => [...prev,
            { role: 'user', content: input },
            { role: 'model', content: errorMsg }
        ]);
        return;
    }

    if (!knowledgeBaseContent) {
        const errorMsg = isArabic
            ? 'لم يتم تكوين قاعدة المعرفة بعد. يرجى الطلب من المسؤول زيارة صفحة الإدارة وتقديم المستندات اللازمة.'
            : 'The knowledge base has not been configured yet. Please ask an administrator to visit the management page and provide the necessary documents.';
        setMessages(prev => [...prev,
            { role: 'user', content: input },
            { role: 'model', content: errorMsg }
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
        const rawErrorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        let finalErrorMessage: string;

        if (rawErrorMessage.includes("API key")) {
            finalErrorMessage = isArabic
                ? 'مفتاح API غير صالح أو به مشكلة. يرجى التحقق منه.'
                : 'The API key is invalid or has an issue. Please check it.';
        } else {
            finalErrorMessage = isArabic
                ? 'عذراً، حدث خطأ أثناء معالجة طلبك.'
                : 'Sorry, an error occurred while processing your request.';
        }
        
        newMessages[responseMessageId] = { 
            role: 'model', 
            content: finalErrorMessage,
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