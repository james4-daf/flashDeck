import type { Id } from '@/convex/_generated/dataModel';

// Convex Flashcard Types
export interface ConvexFlashcard {
  _id: Id<'flashcards'>;
  _creationTime: number;
  question: string;
  answer: string | string[];
  type:
    | 'basic'
    | 'multiple_choice'
    | 'true_false'
    | 'fill_blank'
    | 'code_snippet';
  category: string;
  tech?: string;
  options?: string[];
  lists?: string[];
}

export interface ConvexUserProgress {
  _id: Id<'userProgress'>;
  _creationTime: number;
  userId: string;
  flashcardId: Id<'flashcards'>;

  // Anki-style card state (optional for migration compatibility)
  state?: 'new' | 'learning' | 'review' | 'relearning';
  currentStep?: number;
  nextReviewDate: number;
  reviewCount: number;
  lastCorrect: boolean;
  easeFactor?: number; // Optional ease factor (1.3-2.5)
  important?: boolean; // Optional important flag
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

// Deck types
export interface ConvexDeck {
  _id: Id<'decks'>;
  _creationTime: number;
  name: string;
  description?: string;
  isPublic: boolean;
  createdBy: string;
  upvoteCount: number;
  cardCount: number;
}
