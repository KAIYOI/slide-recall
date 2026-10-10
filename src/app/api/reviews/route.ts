import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const reviewInput = z.object({ deckId: z.string().min(1), studySetId: z.string().optional(), mode: z.enum(['self', 'tutor']), correct: z.number().int().min(0), total: z.number().int().min(0) });
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to save review progress.' }, { status: 401 });
  try {
    const data = reviewInput.parse(await request.json());
    const ownedDeck = await prisma.studyDeck.findFirst({ where: { id: data.deckId, userId: session.user.id }, select: { id: true } });
    if (!ownedDeck) return NextResponse.json({ error: 'Study file not found.' }, { status: 404 });
    if (data.studySetId) {
      const ownedSet = await prisma.studySet.findFirst({ where: { id: data.studySetId, deckId: data.deckId }, select: { id: true } });
      if (!ownedSet) return NextResponse.json({ error: 'Study set not found for this file.' }, { status: 404 });
    }
    const review = await prisma.review.create({ data });
    return NextResponse.json({ reviewId: review.id });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save review.' }, { status: 400 }); }
}
