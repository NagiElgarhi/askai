
// Note: This component is not currently used in the application and can be safely removed.
import React from 'react';
import { DocumentIcon, LinkIcon } from './icons';

interface SidebarProps {
  knowledgeText: string;
  setKnowledgeText: (text: string) => void;
  knowledgeUrl: string;
  setKnowledgeUrl: (url: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  knowledgeText,
  setKnowledgeText,
  knowledgeUrl,
  setKnowledgeUrl,
}) => {
  return (
    <div className="w-full lg:w-1/3 xl:w-1/4 p-6 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">قاعدة المعرفة</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          أضف هنا محتوى الملفات أو الروابط التي تريد من المساعد استخدامها في إجاباته.
        </p>
      </div>

      <div className="flex-grow flex flex-col space-y-6">
        <div>
          <label htmlFor="knowledge-text" className="flex items-center space-x-2 rtl:space-x-reverse text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <DocumentIcon className="w-6 h-6 text-blue-500" />
            <span>محتوى المستندات</span>
          </label>
          <textarea
            id="knowledge-text"
            rows={12}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none"
            placeholder="الصق هنا النص من ملفات المعلومات..."
            value={knowledgeText}
            onChange={(e) => setKnowledgeText(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="knowledge-url" className="flex items-center space-x-2 rtl:space-x-reverse text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <LinkIcon className="w-6 h-6 text-green-500" />
            <span>رابط الويب</span>
          </label>
          <input
            id="knowledge-url"
            type="url"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            placeholder="https://example.com/news"
            value={knowledgeUrl}
            onChange={(e) => setKnowledgeUrl(e.target.value)}
          />
           <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            سيستخدم المساعد هذا الرابط للبحث عن معلومات حديثة اذا كان السؤال يتطلب ذلك.
          </p>
        </div>
      </div>
       <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
         مصمم لأطباء نقابة القاهرة
       </div>
    </div>
  );
};

export default Sidebar;
