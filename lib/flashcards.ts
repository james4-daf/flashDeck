import { supabase } from './supabase';
import type { Flashcard, UserFlashcardAttempt } from './types';

// Local type for flashcards with attempts
// This matches the shape returned by Supabase for this query
interface FlashcardWithAttempts extends Flashcard {
  attempts?: UserFlashcardAttempt[];
}

// Fetch due flashcards for a user
export const getDueFlashcards = async () => {
  const { data, error } = await supabase
    .from('flashcards')
    .select(
      `
      *,
      category:flashcard_categories(name, color, icon),
      type:flashcard_types(name, component_name),
      options:flashcard_options(*),
      attempts:user_flashcard_attempts!user_flashcard_attempts_flashcard_id_fkey(
        id, user_id, next_review_at, is_correct, interval, ease_factor, review_count
      )
    `,
    )
    .eq('is_active', true);

  if (error) throw error;

  const now = new Date();
  // Only return cards that are due (next_review_at <= now) or never attempted
  const dueFlashcards = (data as FlashcardWithAttempts[]).filter(
    (flashcard) => {
      if (!flashcard.attempts || flashcard.attempts.length === 0) return true;
      // Only one attempt per user/card, so use first
      const attempt = flashcard.attempts[0];
      return new Date(attempt.next_review_at) <= now;
    },
  );

  // Remove attempts property before returning (optional, for cleaner UI props)
  return dueFlashcards.map(({ attempts: _attempts, ...rest }) => rest);
};

// Fetch user's flashcard attempts
export const getUserAttempts = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_flashcard_attempts')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

// Record a flashcard attempt
export const recordAttempt = async (
  userId: string,
  flashcardId: string,
  isCorrect: boolean,
  response: unknown,
  timeSpentSeconds: number,
) => {
  // Get existing attempt or create new one
  const { data: existingAttempt } = await supabase
    .from('user_flashcard_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('flashcard_id', flashcardId)
    .single();

  if (existingAttempt) {
    // Update existing attempt with SRS algorithm
    const newEaseFactor = calculateNewEaseFactor(
      existingAttempt.ease_factor,
      isCorrect,
    );
    const newInterval = calculateNewInterval(
      existingAttempt.interval,
      newEaseFactor,
      isCorrect,
    );
    // Clamp interval again for safety
    const safeInterval = Math.max(1, Math.min(newInterval, 365));
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + safeInterval);

    const { data, error } = await supabase
      .from('user_flashcard_attempts')
      .update({
        ease_factor: newEaseFactor,
        interval: safeInterval,
        next_review_at: nextReviewAt.toISOString(),
        review_count: existingAttempt.review_count + 1,
        last_response: response,
        is_correct: isCorrect,
        time_spent_seconds: timeSpentSeconds,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingAttempt.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new attempt
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + (isCorrect ? 1 : 0));

    const { data, error } = await supabase
      .from('user_flashcard_attempts')
      .insert({
        user_id: userId,
        flashcard_id: flashcardId,
        ease_factor: 2.5,
        interval: isCorrect ? 1 : 0,
        next_review_at: nextReviewAt.toISOString(),
        review_count: 1,
        last_response: response,
        is_correct: isCorrect,
        time_spent_seconds: timeSpentSeconds,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// SRS Algorithm Functions (Anki-style)
const calculateNewEaseFactor = (
  currentEaseFactor: number,
  isCorrect: boolean,
): number => {
  if (isCorrect) {
    return Math.max(1.3, currentEaseFactor + 0.1);
  } else {
    return Math.max(1.3, currentEaseFactor - 0.2);
  }
};

const calculateNewInterval = (
  currentInterval: number,
  easeFactor: number,
  isCorrect: boolean,
): number => {
  if (!isCorrect) {
    return 0; // Review again today
  }

  if (currentInterval === 0) {
    return 1; // First correct answer: review tomorrow
  }

  if (currentInterval === 1) {
    return 6; // Second correct answer: review in 6 days
  }

  // Defensive: ensure numbers are valid
  if (!Number.isFinite(currentInterval) || !Number.isFinite(easeFactor))
    return 1;
  const interval = Math.round(currentInterval * easeFactor);
  // Clamp to a reasonable max (e.g., 365 days)
  return Math.max(1, Math.min(interval, 365));
};

// Get user stats
export const getUserStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_flashcard_attempts')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  const totalAttempts = data.length;
  const correctAttempts = data.filter((a) => a.is_correct).length;
  const accuracy =
    totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

  const dueToday = data.filter((a) => {
    const nextReview = new Date(a.next_review_at);
    const today = new Date();
    return nextReview <= today;
  }).length;

  return {
    totalAttempts,
    correctAttempts,
    accuracy: Math.round(accuracy),
    dueToday,
  };
};
