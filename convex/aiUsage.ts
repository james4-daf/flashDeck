// convex/aiUsage.ts
import { v } from 'convex/values';
import { api } from './_generated/api';
import { query, mutation } from './_generated/server';

// Free users get 10 AI generations per month
const FREE_MONTHLY_LIMIT = 10;
// Premium users get unlimited
const PREMIUM_MONTHLY_LIMIT = Infinity;

/**
 * Get current month string in YYYY-MM format
 */
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get AI usage count for current month
 */
export const getUsageCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const month = getCurrentMonth();
    const usage = await ctx.db
      .query('aiUsage')
      .withIndex('by_user_and_month', (q) =>
        q.eq('userId', args.userId).eq('month', month),
      )
      .first();

    return usage?.count || 0;
  },
});

/**
 * Check if user can use AI (hasn't exceeded limit)
 */
export const canUseAI = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<{ canUse: boolean; usageCount: number; limit: number }> => {
    // Check if user is premium
    const isPremium = await ctx.runQuery(api.subscriptions.isPremium, {
      userId: args.userId,
    });

    const limit = isPremium ? PREMIUM_MONTHLY_LIMIT : FREE_MONTHLY_LIMIT;
    const usageCount = await ctx.runQuery(api.aiUsage.getUsageCount, {
      userId: args.userId,
    });

    const canUse = isPremium || usageCount < limit;

    return {
      canUse,
      usageCount,
      limit: isPremium ? Infinity : FREE_MONTHLY_LIMIT,
    };
  },
});

/**
 * Increment AI usage count for current month
 */
export const incrementUsage = mutation({
  args: { userId: v.string(), count: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const month = getCurrentMonth();
    const increment = args.count || 1;

    const existing = await ctx.db
      .query('aiUsage')
      .withIndex('by_user_and_month', (q) =>
        q.eq('userId', args.userId).eq('month', month),
      )
      .first();

    if (existing) {
      // Update existing usage record
      await ctx.db.patch(existing._id, {
        count: existing.count + increment,
      });
      return existing._id;
    } else {
      // Create new usage record
      return await ctx.db.insert('aiUsage', {
        userId: args.userId,
        month,
        count: increment,
      });
    }
  },
});

/**
 * Get usage statistics for a user
 */
export const getUsageStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<{
    usageCount: number;
    limit: number;
    isPremium: boolean;
    canUse: boolean;
    remaining: number;
  }> => {
    const isPremium: boolean = await ctx.runQuery(api.subscriptions.isPremium, {
      userId: args.userId,
    });

    const month = getCurrentMonth();
    const usage = await ctx.db
      .query('aiUsage')
      .withIndex('by_user_and_month', (q) =>
        q.eq('userId', args.userId).eq('month', month),
      )
      .first();

    const usageCount = usage?.count || 0;
    const limit = isPremium ? PREMIUM_MONTHLY_LIMIT : FREE_MONTHLY_LIMIT;

    return {
      usageCount,
      limit: isPremium ? Infinity : limit,
      isPremium,
      canUse: isPremium || usageCount < limit,
      remaining: isPremium ? Infinity : Math.max(0, limit - usageCount),
    };
  },
});

