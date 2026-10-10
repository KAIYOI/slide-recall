# SlideRecall AI

A Next.js App Router application that turns lecture material into flashcards and active recall practice, with a self-study flip-card mode and a browser speech tutor.

## Stack

Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion, Lucide, NextAuth Google OAuth, Gemini (`@google/genai`), PDF/PPTX text extraction, and the Web Speech API.

## Local setup

1. Install Node.js 20+ and create a Google Cloud OAuth client (Web application). For local development, add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
2. Copy `.env.example` to `.env` (Prisma CLI reads `.env`). Set `NEXTAUTH_SECRET` to a unique random value, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GEMINI_API_KEY`. `GEMINI_MODEL` defaults to `gemini-3.8-flash`; override it only with a model available to your Gemini API project. Use `openssl rand -base64 32` to generate the secret.
3. Run `npm install`.
4. Initialize the local SQLite database: `npx prisma migrate dev --name init`.
5. Run `npm run dev`, and open [http://localhost:3000](http://localhost:3000).

Google sign-in is required to enter the app and use document processing and answer evaluation. The `/signin` page provides Google OAuth and redirects successfully signed-in users to the upload screen. The sample study set remains available after signing in. The `/library` page lists saved files, question set versions, and completed review history; it can delete files or generate a new question set from saved source text. SQLite is configured by `DATABASE_URL` (default `file:./dev.db`). If Gemini is not configured, authenticated uploads return a clearly labeled preview study set and the evaluator uses a simple local keyword heuristic; new question set generation requires `GEMINI_API_KEY`.

## Directory structure

```text
src/
  app/
    api/
      auth/[...nextauth]/route.ts  # NextAuth handler
      decks/route.ts               # List signed-in user's saved study files
      decks/[deckId]/route.ts      # Delete file or generate a fresh study set
      process-slide/route.ts       # Authenticated upload, extraction, Gemini synthesis
      evaluate-answer/route.ts    # Authenticated answer evaluation
      reviews/route.ts             # Persist completed sessions
    globals.css
    layout.tsx
    page.tsx
  components/
    Providers.tsx
    SlideRecallApp.tsx              # Upload, mode selection, study, completion UI
  lib/
    ai.ts                           # Gemini structured generation
    auth.ts                         # Google provider and session configuration
    demo-data.ts
    prisma.ts                      # Shared Prisma client
    types.ts
  app/library/page.tsx             # File library, versions and review history
prisma/schema.prisma                # SQLite data model
  types/next-auth.d.ts
```

## API

- `POST /api/process-slide`: multipart `file` (`.pdf`, `.pptx`, `.txt`; 15 MB max); extracts up to 80,000 characters and returns `{ studySet, preview }`.
- `POST /api/evaluate-answer`: JSON `{ question, answer, expected, hint }`; returns `{ result, feedback, hint }` where result is `correct`, `partial`, or `review`.

All routes require a NextAuth session. Extracted document text, study-set versions, and review summaries are stored in SQLite; original file bytes are not retained. Deleting a file removes its study sets and review history. For production, add rate limiting, malware scanning, durable user-owned file storage, observability, and extraction safeguards for untrusted office/PDF content. The browser speech features require a supported browser and mic permission; TTS and STT run client side.

## Implementation notes

- `SlideRecallApp` owns the four-step flow and in-memory study session state.
- `UploadZone` validates supported formats and size, posts multipart data, and reports animated processing stages.
- `FlashcardViewer` uses CSS 3D transforms with motion-driven transitions; mastered state and card position are local.
- `AudioTutor` reads questions with `speechSynthesis`, accepts typing or `SpeechRecognition` dictation, and requests evaluation.
- `CompletionScreen` shows cards reviewed and recall accuracy, with repeat and finish actions.
- `src/lib/ai.ts` validates Gemini JSON using Zod. AI output is treated as untrusted input and validated before returning it.

## Build

Run `npm run build` to compile the production app. OAuth and Gemini integrations require valid credentials for live use.

## Publish on Render

This repository includes a `render.yaml` Blueprint for a single Render web service. It uses a persistent disk for the SQLite database; that requires a paid Render service plan and is intended for a small single-instance launch. Do not scale this SQLite deployment to multiple instances. For a larger public launch, migrate Prisma to PostgreSQL first.

1. Push this project to a GitHub/GitLab repository and create a new Blueprint in Render using that repository. Render will build the Next.js app and mount a persistent disk for SQLite; the Blueprint uses a paid single-instance service.
2. In the service settings, set `NEXTAUTH_URL` to the exact public HTTPS URL Render assigns to the service. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GEMINI_API_KEY` as secret environment variables. Render generates `NEXTAUTH_SECRET` from the Blueprint.
3. In Google Cloud Console, add `https://YOUR-PUBLIC-DOMAIN/api/auth/callback/google` as an authorized redirect URI and add the public domain to the OAuth consent screen's authorized domains. While the OAuth app is in Testing mode, add each tester's Google account.
4. Deploy. The start command applies committed Prisma migrations against the mounted disk before starting Next.js. Confirm the deployment health check passes, then test Google sign-in, upload, a new question set, and deletion.

Never commit `.env.local`, API keys, OAuth secrets, or the SQLite database. If a key has been shared or committed, revoke and replace it before publishing.
