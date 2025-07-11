
import React, { useState, useEffect } from 'react';
import UserPage from './components/UserPage';
import AdminPage from './components/AdminPage';
import { KeyIcon } from './components/icons';

const App: React.FC = () => {
  const [isAdminView, setIsAdminView] = useState(false);
  const [knowledgeBaseContent, setKnowledgeBaseContent] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsAdminView(params.get('page') === 'admin');

    const savedKnowledge = localStorage.getItem('knowledgeBaseContent');
    if (savedKnowledge) {
      setKnowledgeBaseContent(savedKnowledge);
    }

    const savedApiKey = localStorage.getItem('googleApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    setIsInitialized(true);
  }, []);

  const handleSetKnowledgeBase = (content: string) => {
    localStorage.setItem('knowledgeBaseContent', content);
    setKnowledgeBaseContent(content);
  };
  
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem('googleApiKey', newKey);
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const logoUrl = "images/logo.png";

  return (
    <div className="relative flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      
      {/* Logo positioned outside the header, on the main background */}
      <img 
        src={logoUrl} 
        alt="شعار نقابة أطباء القاهرة" 
        className="absolute top-[15px] left-[15px] h-[150px] w-auto z-10" 
      />

      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 shadow-sm">
        <div className="w-[80%] mx-auto flex items-center justify-between gap-6">
            
            <div className="flex items-center gap-2 flex-shrink-0">
                <KeyIcon className="w-6 h-6 text-gray-400" />
                <input
                  type="password"
                  placeholder="أدخل مفتاح API"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  className="w-48 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                />
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md whitespace-nowrap"
                >
                  الحصول على مفتاح
                </a>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 text-center whitespace-nowrap flex-grow">
                {isAdminView ? 'إدارة قاعدة المعرفة' : 'استعلامات النقابة'}
            </h1>

            {/* Empty div to balance the flex container since logo is removed */}
            <div className="flex-shrink-0 w-[240px]"></div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        {isAdminView ? (
          <AdminPage 
            apiKey={apiKey}
            knowledgeBaseContent={knowledgeBaseContent} 
            setKnowledgeBaseContent={handleSetKnowledgeBase} 
          />
        ) : (
          <UserPage apiKey={apiKey} knowledgeBaseContent={knowledgeBaseContent} />
        )}
      </main>
    </div>
  );
};

export default App;
