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
