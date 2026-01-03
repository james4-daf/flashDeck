import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Record a card attempt in the current session
export const recordSessionAttempt = mutation({
  args: {
    userId: v.string(),
    flashcardId: v.id('flashcards'),
    isCorrect: v.boolean(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('sessionAttempts', {
      userId: args.userId,
      flashcardId: args.flashcardId,
      attemptedAt: Date.now(),
      isCorrect: args.isCorrect,
      sessionId: args.sessionId,
    });
  },
});

// Get recently attempted cards (last 20 minutes) to filter from next session
export const getRecentlyAttemptedCards = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const twentyMinutesAgo = Date.now() - 20 * 60 * 1000;

    const recentAttempts = await ctx.db
      .query('sessionAttempts')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.gte(q.field('attemptedAt'), twentyMinutesAgo))
      .collect();

    return recentAttempts.map((attempt) => attempt.flashcardId);
  },
});

// Get session attempts for a specific card (for analytics)
export const getCardSessionHistory = query({
  args: {
    userId: v.string(),
    flashcardId: v.id('flashcards'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('sessionAttempts')
      .withIndex('by_user_and_card', (q) =>
        q.eq('userId', args.userId).eq('flashcardId', args.flashcardId),
      )
      .order('desc')
      .take(10); // Last 10 attempts
  },
});

// Clean up old session attempts (optional - can be called periodically)
export const cleanupOldSessionAttempts = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const oldAttempts = await ctx.db
      .query('sessionAttempts')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.lt(q.field('attemptedAt'), oneWeekAgo))
      .collect();

    // Delete old attempts to keep the table clean
    for (const attempt of oldAttempts) {
      await ctx.db.delete(attempt._id);
    }

    return { deletedCount: oldAttempts.length };
  },
});

// Get attempt history for a category, grouped by date
export const getCategoryAttemptHistory = query({
  args: {
    userId: v.string(),
    category: v.string(),
    days: v.optional(v.number()), // Number of days to look back (default 30)
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get all flashcards in this category
    const categoryFlashcards = await ctx.db
      .query('flashcards')
      .filter((q) => q.eq(q.field('category'), args.category))
      .collect();

    const flashcardIds = new Set(categoryFlashcards.map((card) => card._id));

    if (flashcardIds.size === 0) {
      return [];
    }

    // Get all session attempts for these flashcards by this user
    const allAttempts = await ctx.db
      .query('sessionAttempts')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.gte(q.field('attemptedAt'), startDate))
      .collect();

    // Filter to only attempts for flashcards in this category
    const categoryAttempts = allAttempts.filter((attempt) =>
      flashcardIds.has(attempt.flashcardId),
    );

    // Group by date (YYYY-MM-DD format)
    const dateMap = new Map<string, { correct: number; incorrect: number; total: number }>();

    categoryAttempts.forEach((attempt) => {
      const date = new Date(attempt.attemptedAt).toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, { correct: 0, incorrect: 0, total: 0 });
      }
      const stats = dateMap.get(date)!;
      stats.total += 1;
      if (attempt.isCorrect) {
        stats.correct += 1;
      } else {
        stats.incorrect += 1;
      }
    });

    // Convert to array and sort by date
    const result = Array.from(dateMap.entries())
      .map(([date, stats]) => ({
        date,
        correct: stats.correct,
        incorrect: stats.incorrect,
        total: stats.total,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  },
});
