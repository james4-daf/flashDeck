// convex/userProgress.ts
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

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

// Record a flashcard attempt (simplified SRS)
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

    const getNextReviewDate = (reviewCount: number, wasCorrect: boolean) => {
      if (!wasCorrect) return Date.now(); // Review immediately if wrong
      const days = Math.pow(2, reviewCount); // 1, 2, 4, 8, 16 days...
      return Date.now() + days * 24 * 60 * 60 * 1000;
    };

    if (existing) {
      // Update existing progress
      const newReviewCount = args.isCorrect ? existing.reviewCount + 1 : 0;
      const nextReviewDate = getNextReviewDate(newReviewCount, args.isCorrect);

      return await ctx.db.patch(existing._id, {
        nextReviewDate,
        reviewCount: newReviewCount,
        lastCorrect: args.isCorrect,
      });
    } else {
      // Create new progress entry
      const nextReviewDate = getNextReviewDate(0, args.isCorrect);

      return await ctx.db.insert('userProgress', {
        userId: args.userId,
        flashcardId: args.flashcardId,
        nextReviewDate,
        reviewCount: args.isCorrect ? 1 : 0,
        lastCorrect: args.isCorrect,
      });
    }
  },
});
