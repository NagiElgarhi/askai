
import { GoogleGenAI, Content, GenerateContentResponse } from "@google/genai";
import { Message } from '../types';

const buildChatSystemInstruction = (knowledgeBaseContent: string): string => {
  return `أنت مساعد ذكي ومتخصص في الإجابة على استفسارات الأطباء الأعضاء في نقابة أطباء القاهرة.
مهمتك هي تحليل المعلومات المقدمة لك بدقة والإجابة بشكل احترافي وموجز.
استخدم فقط المعلومات الموجودة في "قاعدة المعرفة" المقدمة لك. إذا لم تكن الإجابة موجودة في السياق، أجب بـ "المعلومات المطلوبة غير متوفرة في قاعدة المعرفة الحالية."
تحدث دائمًا باللغة العربية الفصحى.

--- بداية قاعدة المعرفة ---
${knowledgeBaseContent || 'لم يتم تقديم أي معلومات في قاعدة المعرفة.'}
--- نهاية قاعدة المعرفة ---
`;
};

export const generateChatResponseStream = (
    apiKey: string,
    history: Message[],
    newMessage: string,
    knowledgeBaseContent: string
) => {
    if (!apiKey) {
      throw new Error("API key is required.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const contents: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    return ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: buildChatSystemInstruction(knowledgeBaseContent),
        }
    });
};

export const analyzeDocument = async (apiKey: string, documentText: string): Promise<string> => {
    if (!apiKey) {
      throw new Error("API key is required.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: documentText,
        config: {
            systemInstruction: `أنت وكيل متخصص في تحليل المستندات. مهمتك هي قراءة النص التالي، وفهمه بعمق، ثم إنشاء ملخص شامل ومنظم له. 
            يجب أن يكون الملخص بمثابة "قاعدة معرفة" يمكن لروبوت محادثة استخدامها لاحقًا للإجابة على الأسئلة. 
            ركز على استخراج الحقائق الرئيسية والبيانات المهمة والسياسات والإجراءات. تجاهل أي محتوى غير ضروري أو ترويجي.
            يجب أن يكون الناتج باللغة العربية.`
        }
    });
    return response.text;
};
