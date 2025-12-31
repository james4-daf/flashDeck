// convex/aiUsage.ts
import { v } from 'convex/values';
import { api } from './_generated/api';
import { query, mutation } from './_generated/server';

// Free users get 10 AI generations per month
const FREE_MONTHLY_LIMIT = 10;
// Premium users get 1000 AI generations per month (hard limit)
const PREMIUM_MONTHLY_LIMIT = 1000;

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

    // Same check for both free and premium users
    const canUse = usageCount < limit;

    return {
      canUse,
      usageCount,
      limit, // Returns actual limit, not Infinity
    };
  },
});

/**
 * Atomically check limit and increment usage in a single transaction
 * This prevents race conditions where multiple requests could bypass limits
 * Returns whether the increment was successful
 */
export const checkAndIncrementUsage = mutation({
  args: { 
    userId: v.string(), 
    count: v.optional(v.number()) 
  },
  handler: async (ctx, args): Promise<{ 
    success: boolean; 
    usageCount: number; 
    limit: number;
    remaining: number;
  }> => {
    // Check premium status FIRST
    const isPremium = await ctx.runQuery(api.subscriptions.isPremium, {
      userId: args.userId,
    });

    const limit = isPremium ? PREMIUM_MONTHLY_LIMIT : FREE_MONTHLY_LIMIT;
    const month = getCurrentMonth();
    const increment = args.count || 1;

    // Get current usage (atomic read within transaction)
    const existing = await ctx.db
      .query('aiUsage')
      .withIndex('by_user_and_month', (q) =>
        q.eq('userId', args.userId).eq('month', month),
      )
      .first();

    const currentCount = existing?.count || 0;
    const newCount = currentCount + increment;

    // Check limit BEFORE incrementing (atomic check)
    if (newCount > limit) {
      return {
        success: false,
        usageCount: currentCount,
        limit,
        remaining: Math.max(0, limit - currentCount),
      };
    }

    // Atomically increment (or create if doesn't exist)
    if (existing) {
      await ctx.db.patch(existing._id, {
        count: newCount,
      });
    } else {
      await ctx.db.insert('aiUsage', {
        userId: args.userId,
        month,
        count: increment,
      });
    }

    return {
      success: true,
      usageCount: newCount,
      limit,
      remaining: limit - newCount,
    };
  },
});

/**
 * Increment AI usage count for current month
 * NOTE: This is kept for backward compatibility but should use checkAndIncrementUsage instead
 * @deprecated Use checkAndIncrementUsage for atomic limit checking
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
      limit, // Returns actual limit, not Infinity
      isPremium,
      canUse: usageCount < limit, // Same check for both free and premium
      remaining: Math.max(0, limit - usageCount),
    };
  },
});
