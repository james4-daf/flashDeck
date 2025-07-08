export interface Flashcard {
  id: string;
  category_id: string;
  type_id: string;
  question: string;
  answer: any; // JSONB - varies by type
  explanation?: string;
  difficulty_level: number;
  tags: string[];
  metadata?: unknown;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data from database queries
  category?: FlashcardCategory;
  type?: FlashcardType;
  options?: FlashcardOption[];
  code_block?: string; // Optional code block for code snippet flashcards
}

export interface FlashcardCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface FlashcardType {
  id: string;
  name: string;
  description?: string;
  component_name: string;
  created_at: string;
}

export interface FlashcardOption {
  id: string;
  flashcard_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
}

export interface UserFlashcardAttempt {
  id: string;
  user_id: string;
  flashcard_id: string;
  set_id?: string;
  ease_factor: number;
  interval: number;
  next_review_at: string;
  review_count: number;
  last_response?: unknown;
  is_correct?: boolean;
  time_spent_seconds?: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email?: string;
  trial_expires_at: string;
  pro: boolean;
  created_at: string;
  updated_at: string;
}

// Flashcard answer types
export interface BasicAnswer {
  answer: string;
}

export interface MultipleChoiceAnswer {
  answer: string; // Single correct option
}

export interface MultipleAnswerAnswer {
  answer: string[]; // Multiple correct options
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

export interface MatchingAnswer {
  answer: Record<string, string>; // key-value pairs
}
