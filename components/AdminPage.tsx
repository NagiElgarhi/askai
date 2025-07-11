
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeDocument } from '../services/geminiService';
import { UploadIcon, DocumentIcon } from './icons';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import * as mammoth from 'mammoth';

// Set up the PDF worker by providing the URL to the worker script.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs`;

interface AdminPageProps {
    apiKey: string;
    knowledgeBaseContent: string;
    setKnowledgeBaseContent: (content: string) => void;
}

const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
        }
        return text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        return value;
    } else { // txt, md, etc.
        return file.text();
    }
}

const AdminPage: React.FC<AdminPageProps> = ({ apiKey, knowledgeBaseContent, setKnowledgeBaseContent }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!apiKey) {
            setError("Please enter your API key in the header first.");
            return;
        }

        const file = acceptedFiles[0];
        if (!file) return;

        setIsAnalyzing(true);
        setError(null);
        
        try {
            const text = await extractTextFromFile(file);
            const analyzedContent = await analyzeDocument(apiKey, text);
            setKnowledgeBaseContent(analyzedContent);
        } catch (err) {
            console.error("Analysis failed:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to analyze the document. Please try again.";
            setError(errorMessage.includes("API key") ? "The API key is invalid or has an issue." : errorMessage);
        } finally {
            setIsAnalyzing(false);
        }
    }, [apiKey, setKnowledgeBaseContent]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc'], // Note: .doc support might be limited
            'text/plain': ['.txt', '.md'] 
        },
        maxFiles: 1,
        disabled: isAnalyzing
    });

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-100 dark:bg-gray-800">
            <div className="max-w-4xl mx-auto">
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                    Upload a file (PDF, Word, TXT) and the agent will analyze it and convert it into a JSON knowledge base.
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
                        <p className="text-blue-600 font-semibold">Drop the file here...</p>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">Drag & drop a file here, or click to select</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Supported Files: PDF, DOCX, TXT</p>
                </div>
                
                {isAnalyzing && (
                    <div className="mt-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                           <div className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                           <span className="font-semibold">Analyzing document... this may take a moment.</span>
                        </div>
                    </div>
                )}

                {error && <p className="mt-4 text-center text-red-500">{error}</p>}

                {knowledgeBaseContent && !isAnalyzing && (
                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <DocumentIcon className="w-6 h-6 text-green-500" />
                            Extracted Knowledge Base (JSON)
                        </h3>
                        <div dir="ltr" className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                            <pre className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-all">{knowledgeBaseContent}</pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;