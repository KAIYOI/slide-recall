import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to view your study library.' }, { status: 401 });
  const decks = await prisma.studyDeck.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, filename: true, title: true, summary: true, createdAt: true,
      studySets: { orderBy: { version: 'desc' }, select: { id: true, title: true, version: true, flashcards: true, questions: true, createdAt: true } },
      reviews: { select: { correct: true, total: true, completedAt: true } },
    },
  });
  return NextResponse.json({ decks });
}
