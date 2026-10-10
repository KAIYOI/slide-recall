export type Flashcard = { question: string; answer: string; topic?: string };
export type RecallQuestion = { question: string; answer: string; hint: string; topic?: string };
export type StudySet = { title: string; summary: string; flashcards: Flashcard[]; questions: RecallQuestion[] };
