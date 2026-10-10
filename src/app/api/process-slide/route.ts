import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateStudySet } from '@/lib/ai';
import { demoStudySet } from '@/lib/demo-data';
import { prisma } from '@/lib/prisma';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to process a document.' }, { status: 401 });
  try {
    const form = await request.formData(); const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a file to upload.' }, { status: 400 });
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'pptx', 'txt'].includes(ext ?? '')) return NextResponse.json({ error: 'Upload a PDF, PPTX, or TXT file.' }, { status: 400 });
    if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: 'File must be 15 MB or smaller.' }, { status: 413 });
    let text = '';
    if (ext === 'txt') text = await file.text();
    if (ext === 'pdf') { const pdfParse = (await import('pdf-parse')).default; const parsed = await pdfParse(Buffer.from(await file.arrayBuffer())); text = parsed.text; }
    if (ext === 'pptx') {
      // PPTX files are ZIP archives. Read their slide XML directly so extraction
      // doesn't depend on a third-party parser with a fragile runtime interface.
      const { unzipSync, strFromU8 } = await import('fflate');
      const archive = unzipSync(new Uint8Array(await file.arrayBuffer()));
      const slidePaths = Object.keys(archive)
        .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
        .sort((a, b) => Number(a.match(/slide(\d+)/)?.[1]) - Number(b.match(/slide(\d+)/)?.[1]));
      text = slidePaths.map((path) => {
        const xml = strFromU8(archive[path]);
        return [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
          .map((match) => match[1]
            .replaceAll('&amp;', '&')
            .replaceAll('&lt;', '<')
            .replaceAll('&gt;', '>')
            .replaceAll('&quot;', '"')
            .replaceAll('&apos;', "'"))
          .join(' ');
      }).join('\n');
    }
    text = text.trim().slice(0, 80_000);
    if (text.length < 80) return NextResponse.json({ error: 'There is not enough readable text in this file. Try a text-based document.' }, { status: 422 });
    const studySet = process.env.GEMINI_API_KEY ? await generateStudySet(text, file.name) : { ...demoStudySet, title: file.name.replace(/\.[^.]+$/, ''), summary: 'Preview set: configure GEMINI_API_KEY to generate cards from your document.' };
    const title = studySet.title || file.name.replace(/\.[^.]+$/, '');
    const deck = await prisma.studyDeck.create({
      data: {
        userId: session.user.id,
        filename: file.name,
        title,
        summary: studySet.summary,
        sourceText: text,
        studySets: { create: { title, summary: studySet.summary, flashcards: studySet.flashcards, questions: studySet.questions } },
      },
      include: { studySets: { orderBy: { version: 'desc' }, take: 1 } },
    });
    return NextResponse.json({ studySet, deckId: deck.id, preview: !process.env.GEMINI_API_KEY });
  } catch (error) {
    console.error('process-slide failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not process this file.' }, { status: 500 });
  }
}
