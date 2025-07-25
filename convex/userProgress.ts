// convex/userProgress.ts
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Helper function to get date string in YYYY-MM-DD format
function getDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

// Anki-style learning configuration
const LEARNING_STEPS = [20, 60]; // 20min → 1hr → graduate to review
const RELEARNING_STEPS = [20]; // Failed cards: 20min → back to review
const GRADUATE_INTERVAL = 1; // 1 day when graduating from learning
const DEFAULT_EASE_FACTOR = 2.5; // Default ease factor

// Card states
type CardState = 'new' | 'learning' | 'review' | 'relearning';

// Get user's progress for a specific flashcard
export const getUserProgress = query({
  args: {
    userId: v.string(),
    flashcardId: v.id('flashcards'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('userProgress')
      .withIndex('by_user_and_card', (q) =>
        q.eq('userId', args.userId).eq('flashcardId', args.flashcardId),
      )
      .first();
  },
});

// Record a flashcard attempt (Anki-style SRS)
export const recordAttempt = mutation({
  args: {
    userId: v.string(),
    flashcardId: v.id('flashcards'),
    isCorrect: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('userProgress')
      .withIndex('by_user_and_card', (q) =>
        q.eq('userId', args.userId).eq('flashcardId', args.flashcardId),
      )
      .first();

    const now = Date.now();
    const today = getDateString(now);

    // Update study log for today
    const existingLog = await ctx.db
      .query('studyLog')
      .withIndex('by_user_and_date', (q) =>
        q.eq('userId', args.userId).eq('date', today),
      )
      .first();

    if (existingLog) {
      // Increment existing count
      await ctx.db.patch(existingLog._id, {
        flashcardCount: existingLog.flashcardCount + 1,
      });
    } else {
      // Create new log for today
      await ctx.db.insert('studyLog', {
        userId: args.userId,
        date: today,
        flashcardCount: 1,
      });
    }

    if (existing) {
      // Migrate existing records that don't have Anki-style fields
      const currentState = existing.state || 'review'; // Default existing cards to review state
      const currentStep = existing.currentStep ?? 0;
      const currentEase = existing.easeFactor ?? DEFAULT_EASE_FACTOR;

      // Create a normalized existing record for the calculation
      const normalizedExisting = {
        ...existing,
        state: currentState,
        currentStep,
        easeFactor: currentEase,
      };

      // Update existing progress based on current state
      const newProgress = calculateNextProgress(
        normalizedExisting,
        args.isCorrect,
        now,
      );

      return await ctx.db.patch(existing._id, {
        state: newProgress.state,
        currentStep: newProgress.currentStep,
        nextReviewDate: newProgress.nextReviewDate,
        reviewCount: newProgress.reviewCount,
        lastCorrect: args.isCorrect,
        easeFactor: newProgress.easeFactor,
      });
    } else {
      // New card - always starts in 'learning' state
      const nextReviewDate = args.isCorrect
        ? now + LEARNING_STEPS[0] * 60 * 1000 // 20 minutes
        : now + 20 * 60 * 1000; // 20 minute retry for wrong answers

      return await ctx.db.insert('userProgress', {
        userId: args.userId,
        flashcardId: args.flashcardId,
        state: 'learning',
        currentStep: args.isCorrect ? 0 : 0, // Stay on step 0 if wrong
        nextReviewDate,
        reviewCount: 0,
        lastCorrect: args.isCorrect,
        easeFactor: DEFAULT_EASE_FACTOR,
      });
    }
  },
});

// Calculate next progress state based on current state and answer
function calculateNextProgress(
  current: any,
  isCorrect: boolean,
  now: number,
): {
  state: CardState;
  currentStep: number;
  nextReviewDate: number;
  reviewCount: number;
  easeFactor: number;
} {
  const currentEase = current.easeFactor || DEFAULT_EASE_FACTOR;

  if (!isCorrect) {
    // Wrong answer - handle based on current state
    if (current.state === 'review') {
      // Failed review card - goes to relearning
      return {
        state: 'relearning',
        currentStep: 0,
        nextReviewDate: now + RELEARNING_STEPS[0] * 60 * 1000, // 20 minutes
        reviewCount: current.reviewCount,
        easeFactor: Math.max(1.3, currentEase - 0.2), // Decrease ease factor
      };
    } else {
      // Failed learning/relearning - restart current step
      const steps =
        current.state === 'relearning' ? RELEARNING_STEPS : LEARNING_STEPS;
      const stepIndex = Math.min(current.currentStep, steps.length - 1);

      return {
        state: current.state,
        currentStep: current.currentStep, // Stay on same step
        nextReviewDate: now + steps[stepIndex] * 60 * 1000,
        reviewCount: current.reviewCount,
        easeFactor: currentEase,
      };
    }
  }

  // Correct answer - advance based on current state
  if (current.state === 'learning') {
    const nextStep = current.currentStep + 1;

    if (nextStep >= LEARNING_STEPS.length) {
      // Graduate to review
      return {
        state: 'review',
        currentStep: 0,
        nextReviewDate: now + GRADUATE_INTERVAL * 24 * 60 * 60 * 1000, // 1 day
        reviewCount: 0, // Start at 0 since this is the first review
        easeFactor: currentEase,
      };
    } else {
      // Continue learning
      return {
        state: 'learning',
        currentStep: nextStep,
        nextReviewDate: now + LEARNING_STEPS[nextStep] * 60 * 1000,
        reviewCount: current.reviewCount,
        easeFactor: currentEase,
      };
    }
  } else if (current.state === 'relearning') {
    const nextStep = current.currentStep + 1;

    if (nextStep >= RELEARNING_STEPS.length) {
      // Graduate back to review
      return {
        state: 'review',
        currentStep: 0,
        nextReviewDate: now + GRADUATE_INTERVAL * 24 * 60 * 60 * 1000, // 1 day
        reviewCount: current.reviewCount,
        easeFactor: currentEase,
      };
    } else {
      // Continue relearning
      return {
        state: 'relearning',
        currentStep: nextStep,
        nextReviewDate: now + RELEARNING_STEPS[nextStep] * 60 * 1000,
        reviewCount: current.reviewCount,
        easeFactor: currentEase,
      };
    }
  } else if (current.state === 'review') {
    // Review card - use ease factor and review count
    const interval = Math.max(1, Math.round(current.reviewCount * currentEase));

    return {
      state: 'review',
      currentStep: 0,
      nextReviewDate: now + interval * 24 * 60 * 60 * 1000,
      reviewCount: current.reviewCount + 1,
      easeFactor: Math.min(2.5, currentEase + 0.1), // Increase ease factor slightly
    };
  }

  // Fallback (shouldn't happen)
  return {
    state: current.state,
    currentStep: current.currentStep,
    nextReviewDate: now + 20 * 60 * 1000, // 20 minutes
    reviewCount: current.reviewCount,
    easeFactor: currentEase,
  };
}

// Get all user progress for debugging
export const getAllUserProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userProgress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    // Also get the flashcard data for each progress record
    const progressWithFlashcards = await Promise.all(
      userProgress.map(async (progress) => {
        const flashcard = await ctx.db.get(progress.flashcardId);
        return {
          ...progress,
          flashcard: flashcard
            ? {
                question: flashcard.question,
                type: flashcard.type,
                category: flashcard.category,
              }
            : null,
        };
      }),
    );

    return progressWithFlashcards;
  },
});

// Get study counts for daily, weekly, monthly tracking
export const getStudyCounts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const now = new Date();
    const today = getDateString(now.getTime());

    // Calculate date ranges
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    const startOfWeekStr = getDateString(startOfWeek.getTime());

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthStr = getDateString(startOfMonth.getTime());

    // Get all study logs for this user
    const studyLogs = await ctx.db
      .query('studyLog')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    // Calculate counts
    const daily =
      studyLogs.find((log) => log.date === today)?.flashcardCount || 0;

    const weekly = studyLogs
      .filter((log) => log.date >= startOfWeekStr)
      .reduce((sum, log) => sum + log.flashcardCount, 0);

    const monthly = studyLogs
      .filter((log) => log.date >= startOfMonthStr)
      .reduce((sum, log) => sum + log.flashcardCount, 0);

    const total = studyLogs.reduce((sum, log) => sum + log.flashcardCount, 0);

    return {
      daily,
      weekly,
      monthly,
      total,
    };
  },
});

export const markImportant = mutation({
  args: {
    userId: v.string(),
    flashcardId: v.id('flashcards'),
    important: v.boolean(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query('userProgress')
      .withIndex('by_user_and_card', (q) =>
        q.eq('userId', args.userId).eq('flashcardId', args.flashcardId),
      )
      .first();
    if (progress) {
      await ctx.db.patch(progress._id, { important: args.important });
    }
  },
});
