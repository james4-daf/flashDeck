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

// Helper function to calculate next review date
const calculateNextReviewDate = (intervalHours: number): Date => {
  const nextReviewAt = new Date();
  nextReviewAt.setHours(nextReviewAt.getHours() + intervalHours);
  return nextReviewAt;
};

// Record a flashcard attempt
export const recordAttempt = async (
  userId: string,
  flashcardId: string,
  isCorrect: boolean,
  response: unknown,
  timeSpentSeconds: number,
) => {
  // Check if user is authenticated
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Session error:', sessionError);
    throw new Error('Authentication session error: ' + sessionError.message);
  }

  if (!session?.user) {
    console.error('No authenticated user found');
    throw new Error('User not authenticated');
  }

  if (session.user.id !== userId) {
    console.error('User ID mismatch:', {
      sessionUserId: session.user.id,
      providedUserId: userId,
    });
    throw new Error('User ID mismatch');
  }

  try {
    // Get existing attempt or create new one
    const { data: existingAttempt, error: fetchError } = await supabase
      .from('user_flashcard_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('flashcard_id', flashcardId)
      .single();

    // Handle fetch errors (except for "no rows returned" which is expected for new cards)
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing attempt:', fetchError);
      throw fetchError;
    }

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

      const nextReviewAt = calculateNextReviewDate(newInterval);

      const { data, error } = await supabase
        .from('user_flashcard_attempts')
        .update({
          ease_factor: newEaseFactor,
          interval: newInterval,
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

      if (error) {
        console.error('Error updating attempt:', error);
        throw error;
      }
      return data;
    } else {
      // Create new attempt
      const initialInterval = isCorrect ? 4 : 0; // 4 hours if correct, 0 hours (now) if wrong
      const nextReviewAt = calculateNextReviewDate(initialInterval);

      const { data, error } = await supabase
        .from('user_flashcard_attempts')
        .insert({
          user_id: userId,
          flashcard_id: flashcardId,
          ease_factor: 2.5,
          interval: initialInterval,
          next_review_at: nextReviewAt.toISOString(),
          review_count: 1,
          last_response: response,
          is_correct: isCorrect,
          time_spent_seconds: timeSpentSeconds,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating attempt:', error);
        throw error;
      }
      return data;
    }
  } catch (error) {
    console.error('recordAttempt caught error:', error);
    throw error;
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
    return 0; // Review again now
  }

  if (currentInterval === 0) {
    return 4; // First correct answer: review in 4 hours
  }

  if (currentInterval === 4) {
    return 24; // Second correct answer: review in 24 hours (1 day)
  }

  if (currentInterval === 24) {
    return 48; // Third correct answer: review in 48 hours (2 days)
  }

  if (currentInterval === 48) {
    return 96; // Fourth correct answer: review in 96 hours (4 days)
  }

  // For intervals >= 96 hours (4 days), use ease factor multiplication
  // Defensive: ensure numbers are valid
  if (!Number.isFinite(currentInterval) || !Number.isFinite(easeFactor))
    return 24;
  const interval = Math.round(currentInterval * easeFactor);
  // Clamp to a reasonable max (e.g., 504 hours = 21 days = 3 weeks)
  return Math.max(24, Math.min(interval, 504));
};

// Get user stats
export const getUserStats = async (userId: string) => {
  // Get user attempts
  const { data: attempts, error: attemptsError } = await supabase
    .from('user_flashcard_attempts')
    .select('*')
    .eq('user_id', userId);

  if (attemptsError) throw attemptsError;

  // Get total flashcard count
  const { data: allFlashcards, error: flashcardsError } = await supabase
    .from('flashcards')
    .select('id')
    .eq('is_active', true);

  if (flashcardsError) throw flashcardsError;

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.is_correct).length;
  const accuracy =
    totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

  // Get unique flashcards attempted
  const uniqueFlashcardsAttempted = new Set(attempts.map((a) => a.flashcard_id))
    .size;
  const totalFlashcards = allFlashcards.length;

  const dueToday = attempts.filter((a) => {
    const nextReview = new Date(a.next_review_at);
    const today = new Date();
    return nextReview <= today;
  }).length;

  return {
    totalAttempts,
    correctAttempts,
    accuracy: Math.round(accuracy),
    dueToday,
    cardsAttempted: uniqueFlashcardsAttempted,
    totalFlashcards,
  };
};
