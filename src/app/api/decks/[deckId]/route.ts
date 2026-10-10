import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateStudySet } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

type Context = { params: { deckId: string } };
export async function DELETE(_request: Request, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to manage your study library.' }, { status: 401 });
  const result = await prisma.studyDeck.deleteMany({ where: { id: params.deckId, userId: session.user.id } });
  if (!result.count) return NextResponse.json({ error: 'Study file not found.' }, { status: 404 });
  return NextResponse.json({ deleted: true });
}

export async function POST(_request: Request, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to create a review set.' }, { status: 401 });
  try {
    const deck = await prisma.studyDeck.findFirst({ where: { id: params.deckId, userId: session.user.id }, include: { studySets: { orderBy: { version: 'desc' }, take: 1 } } });
    if (!deck) return NextResponse.json({ error: 'Study file not found.' }, { status: 404 });
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'Add GEMINI_API_KEY to generate a new question set.' }, { status: 503 });
    const studySet = await generateStudySet(deck.sourceText, deck.filename);
    const version = (deck.studySets[0]?.version ?? 0) + 1;
    const saved = await prisma.studySet.create({ data: { deckId: deck.id, title: studySet.title, summary: studySet.summary, flashcards: studySet.flashcards, questions: studySet.questions, version } });
    return NextResponse.json({ studySet, studySetId: saved.id, version });
  } catch (error) {
    console.error('regenerate study set failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not generate a new study set.' }, { status: 500 });
  }
}
