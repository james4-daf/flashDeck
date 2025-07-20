import type { Id } from '@/convex/_generated/dataModel';

// Convex Flashcard Types
export interface ConvexFlashcard {
  _id: Id<'flashcards'>;
  _creationTime: number;
  question: string;
  answer: string | string[];
  type: 'basic' | 'multiple_choice' | 'true_false';
  category: string;
  options?: string[];
}

export interface ConvexUserProgress {
  _id: Id<'userProgress'>;
  _creationTime: number;
  userId: string;
  flashcardId: Id<'flashcards'>;
  nextReviewDate: number;
  reviewCount: number;
  lastCorrect: boolean;
}

// Simplified option type for flashcard components
export interface FlashcardOption {
  id: string;
  flashcard_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
}

// Answer types for different flashcard components
export interface BasicAnswer {
  answer: string;
}

export interface MultipleChoiceAnswer {
  answer: string; // Single correct option
}

export interface TrueFalseAnswer {
  answer: boolean;
}

export interface FillBlankAnswer {
  answer: string;
}

export interface CodeSnippetAnswer {
  answer: string;
}

// Session statistics
export interface SessionStats {
  correct: number;
  incorrect: number;
  total: number;
}
