
import { GoogleGenAI, Content, Type } from "@google/genai";
import { Message } from '../types';

const buildChatSystemInstruction = (knowledgeBaseJson: string): string => {
  return `You are an intelligent assistant for the members of the Cairo Medical Syndicate.
Your task is to use the provided JSON knowledge base to answer the user's question.
Search the knowledge base for the question most relevant to the user's query and use its corresponding answer.
If you cannot find an exact answer in the knowledge base, state that "The requested information is not available in the current knowledge base."
**Always respond in the same language as the user's last query.**

--- BEGIN KNOWLEDGE BASE (JSON) ---
${knowledgeBaseJson || '{"qa_pairs": []}'}
--- END KNOWLEDGE BASE (JSON) ---
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

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: documentText,
        config: {
            systemInstruction: `You are an agent specializing in document analysis. Your task is to read the following text and convert it into a structured JSON knowledge base.
            The JSON object must contain a single main property "qa_pairs", which is an array of objects.
            Each object in the array must have two properties: "question" (a potential question a doctor might ask) and "answer" (the detailed answer to that question from the document).
            Extract all important information, facts, policies, and procedures and convert them into these question-answer pairs.`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    qa_pairs: {
                        type: Type.ARRAY,
                        description: "An array of question-and-answer pairs extracted from the document.",
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            question: {
                              type: Type.STRING,
                              description: 'A potential question a user might ask.',
                            },
                            answer: {
                              type: Type.STRING,
                              description: 'The detailed answer to the question from the document content.',
                            },
                          },
                          required: ["question", "answer"],
                        },
                    },
                },
                required: ["qa_pairs"],
            }
        }
    });
    
    // The response.text is already a stringified JSON due to responseMimeType
    // We can parse and stringify to ensure it's well-formed and pretty-printed
    try {
        const json = JSON.parse(response.text);
        return JSON.stringify(json, null, 2);
    } catch {
        // If parsing fails, return the raw text (should be rare)
        return response.text;
    }
};