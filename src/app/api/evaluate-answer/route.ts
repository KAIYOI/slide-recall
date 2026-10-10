import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
const verdict = z.object({ result: z.enum(['correct', 'partial', 'review']), feedback: z.string(), hint: z.string() });
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Sign in to evaluate an answer.' }, { status: 401 });
  try {
    const body = await request.json();
    const parsed = z.object({ question: z.string().min(1).max(1000), answer: z.string().min(1).max(3000), expected: z.string().min(1).max(3000), hint: z.string().max(500).default('') }).parse(body);
    if (!process.env.GEMINI_API_KEY) {
      const words = parsed.answer.toLowerCase().split(/\W+/).filter((w: string) => w.length > 4);
      const overlap = words.filter((w: string) => parsed.expected.toLowerCase().includes(w)).length;
      const score = overlap / Math.max(words.length, 1);
      const result = score > 0.35 ? 'correct' : score > 0.12 ? 'partial' : 'review';
      return NextResponse.json({ result, feedback: result === 'correct' ? 'Nice work — you recalled the key idea.' : result === 'partial' ? 'You have part of it. Add one more key detail.' : 'Take another look at the core concept.', hint: parsed.hint });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-3.8-flash', contents: `Evaluate the student's response fairly. Accept equivalent wording and focus on the essential ideas. Be concise and encouraging.\nQuestion: ${parsed.question}\nExpected: ${parsed.expected}\nStudent: ${parsed.answer}\nHint: ${parsed.hint}`, config: { responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { result: { type: Type.STRING, enum: ['correct', 'partial', 'review'] }, feedback: { type: Type.STRING }, hint: { type: Type.STRING } }, required: ['result', 'feedback', 'hint'] } } });
    return NextResponse.json(verdict.parse(JSON.parse(response.text ?? '{}')));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not evaluate answer.' }, { status: 400 }); }
}
