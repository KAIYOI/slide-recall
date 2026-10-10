import type { StudySet } from './types';
export const demoStudySet: StudySet = {
  title: 'The science of better learning',
  summary: 'A quick introduction to active recall, spaced repetition, and how memory gets stronger with practice.',
  flashcards: [
    { topic: 'Memory', question: 'What is active recall?', answer: 'Actively retrieving information from memory instead of rereading it. The effort of recalling strengthens the memory pathway.' },
    { topic: 'Learning', question: 'Why does spaced repetition work?', answer: 'Reviewing at increasing intervals catches information just as it begins to fade, reinforcing long-term retention efficiently.' },
    { topic: 'Focus', question: 'What is the testing effect?', answer: 'The finding that taking a test can improve later memory more than spending the same time studying the material again.' },
    { topic: 'Practice', question: 'How can you make a good flashcard?', answer: 'Keep it focused on one idea, ask a clear question, and make yourself retrieve the answer rather than recognize it.' },
  ],
  questions: [
    { topic: 'Memory', question: 'Explain active recall in your own words.', answer: 'Active recall means deliberately retrieving information from memory, which strengthens learning more than passive review.', hint: 'Think about what you do with your memory, rather than what you do with the page.' },
    { topic: 'Learning', question: 'Why might spaced repetition improve long-term retention?', answer: 'It schedules practice at intervals that reinforce a memory as it starts to fade, making learning more durable.', hint: 'Consider how the timing of reviews changes the effort of retrieval.' },
    { topic: 'Practice', question: 'Name one feature of an effective flashcard.', answer: 'An effective flashcard tests one clearly defined idea and requires retrieval rather than simple recognition.', hint: 'Think about how much information should fit on one card.' },
  ],
};
