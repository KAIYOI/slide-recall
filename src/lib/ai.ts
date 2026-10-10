import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import type { StudySet } from './types';
const generatedSchema = z.object({ title: z.string(), summary: z.string(), flashcards: z.array(z.object({ question: z.string(), answer: z.string(), topic: z.string().optional() })).min(3).max(20), questions: z.array(z.object({ question: z.string(), answer: z.string(), hint: z.string(), topic: z.string().optional() })).min(3).max(12) });
export async function generateStudySet(text: string, filename: string): Promise<StudySet> {
  if (!process.env.GEMINI_API_KEY) throw new Error('Gemini is not configured. Add GEMINI_API_KEY to your environment.');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const result = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    contents: `Turn these study materials into a concise study set. Return 6-12 useful flashcards and 4-8 active recall questions. Keep answers accurate and grounded only in the material. For each recall question include a short hint. Source filename: ${filename}\n\nMATERIAL:\n${text.slice(0, 80_000)}`,
    config: { responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, flashcards: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING }, topic: { type: Type.STRING } }, required: ['question', 'answer'] } }, questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING }, hint: { type: Type.STRING }, topic: { type: Type.STRING } }, required: ['question', 'answer', 'hint'] } } }, required: ['title', 'summary', 'flashcards', 'questions'] } }
  });
  return generatedSchema.parse(JSON.parse(result.text ?? '{}'));
}
