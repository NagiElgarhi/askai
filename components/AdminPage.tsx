
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeDocument } from '../services/geminiService';
import { UploadIcon, DocumentIcon } from './icons';

interface AdminPageProps {
    apiKey: string;
    knowledgeBaseContent: string;
    setKnowledgeBaseContent: (content: string) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ apiKey, knowledgeBaseContent, setKnowledgeBaseContent }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!apiKey) {
            setError("الرجاء إدخال مفتاح API في الشريط العلوي أولاً.");
            return;
        }

        const file = acceptedFiles[0];
        if (!file) return;

        setIsAnalyzing(true);
        setError(null);
        // Do not clear knowledge base content until analysis is successful
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const analyzedContent = await analyzeDocument(apiKey, text);
                setKnowledgeBaseContent(analyzedContent);
            } catch (err) {
                console.error("Analysis failed:", err);
                const errorMessage = err instanceof Error ? err.message : "فشل تحليل المستند. الرجاء المحاولة مرة أخرى.";
                setError(errorMessage.includes("API key") ? "مفتاح API غير صالح أو به مشكلة." : errorMessage);
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.onerror = () => {
             console.error("File reading failed");
             setError("فشل قراءة الملف.");
             setIsAnalyzing(false);
        };
        reader.readAsText(file);
    }, [apiKey, setKnowledgeBaseContent]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/*': ['.txt', '.md'] },
        maxFiles: 1,
        disabled: isAnalyzing
    });

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto bg-white dark:bg-gray-800">
            <div className="max-w-4xl mx-auto">
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                    قم برفع ملف نصي (مثل .txt) ليقوم الوكيل بتحليله وتلخيصه. سيتم حفظ الملخص تلقائيًا وسيستخدمه مساعد الاستعلامات في الواجهة الرئيسية للمستخدمين.
                </p>

                <div
                    {...getRootProps()}
                    className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                        ${isAnalyzing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700'}
                        ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600'}`}
                >
                    <input {...getInputProps()} />
                    <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                    {isDragActive ? (
                        <p className="text-blue-600 font-semibold">أفلت الملف هنا...</p>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">اسحب وأفلت الملف هنا، أو انقر للتحديد</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">الملفات النصية فقط (txt, md)</p>
                </div>
                
                {isAnalyzing && (
                    <div className="mt-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                           <div className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                           <span className="font-semibold">جاري تحليل المستند...</span>
                        </div>
                    </div>
                )}

                {error && <p className="mt-4 text-center text-red-500">{error}</p>}

                {knowledgeBaseContent && !isAnalyzing && (
                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <DocumentIcon className="w-6 h-6 text-green-500" />
                            محتوى قاعدة المعرفة (الناتج من التحليل)
                        </h3>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg whitespace-pre-wrap border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                            <p className="text-gray-700 dark:text-gray-200">{knowledgeBaseContent}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
