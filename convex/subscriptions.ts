// convex/subscriptions.ts
import { v } from 'convex/values';
import { api } from './_generated/api';
import { mutation, query } from './_generated/server';

// Get user's current subscription
export const getUserSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    // If no subscription exists, return default free subscription
    if (!subscription) {
      return {
        userId: args.userId,
        plan: 'free' as const,
        status: 'active' as const,
        billingCycle: null,
        trialEndsAt: undefined,
        subscriptionEndsAt: undefined,
        stripeCustomerId: undefined,
        stripeSubscriptionId: undefined,
        stripePriceId: undefined,
      };
    }

    // Check if subscription is still valid (don't mutate in query, just compute status)
    const now = Date.now();
    if (subscription.status === 'active' || subscription.status === 'trial') {
      // Check if trial has expired
      if (subscription.trialEndsAt && subscription.trialEndsAt < now) {
        return {
          ...subscription,
          status: 'expired' as const,
          plan: 'free' as const,
        };
      }

      // Check if subscription has ended
      if (
        subscription.subscriptionEndsAt &&
        subscription.subscriptionEndsAt < now
      ) {
        return {
          ...subscription,
          status: 'expired' as const,
          plan: 'free' as const,
        };
      }
    }

    return subscription;
  },
});

// Quick check if user has premium
export const isPremium = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<boolean> => {
    const subscription = await ctx.runQuery(
      api.subscriptions.getUserSubscription,
      args,
    );
    const now = Date.now();
    return (
      subscription.plan === 'premium' &&
      (subscription.status === 'active' || subscription.status === 'trial') &&
      (!subscription.subscriptionEndsAt ||
        subscription.subscriptionEndsAt > now) &&
      (!subscription.trialEndsAt || subscription.trialEndsAt > now)
    );
  },
});

// Get detailed subscription status (optimized - no nested query)
export const getSubscriptionStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<{
    userId: string;
    plan: 'free' | 'premium';
    status: 'active' | 'trial' | 'expired' | 'cancelled';
    billingCycle: 'monthly' | 'annual' | null;
    trialEndsAt?: number;
    subscriptionEndsAt?: number;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    isActive: boolean;
    isPremium: boolean;
    daysRemaining: number | null;
    trialDaysRemaining: number | null;
  }> => {
    // Fetch subscription directly (no nested query call)
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    // If no subscription exists, use default free subscription
    if (!subscription) {
      const now = Date.now();
      return {
        userId: args.userId,
        plan: 'free' as const,
        status: 'active' as const,
        billingCycle: null,
        trialEndsAt: undefined,
        subscriptionEndsAt: undefined,
        stripeCustomerId: undefined,
        stripeSubscriptionId: undefined,
        stripePriceId: undefined,
        isActive: false,
        isPremium: false,
        daysRemaining: null,
        trialDaysRemaining: null,
      };
    }

    // Check if subscription is still valid (don't mutate in query, just compute status)
    let sub = subscription;
    const now = Date.now();
    if (sub.status === 'active' || sub.status === 'trial') {
      // Check if trial has expired
      if (sub.trialEndsAt && sub.trialEndsAt < now) {
        sub = {
          ...sub,
          status: 'expired' as const,
          plan: 'free' as const,
        };
      }
      // Check if subscription has ended
      else if (sub.subscriptionEndsAt && sub.subscriptionEndsAt < now) {
        sub = {
          ...sub,
          status: 'expired' as const,
          plan: 'free' as const,
        };
      }
    }

    const isActive =
      sub.plan === 'premium' &&
      (sub.status === 'active' || sub.status === 'trial') &&
      (!sub.subscriptionEndsAt || sub.subscriptionEndsAt > now) &&
      (!sub.trialEndsAt || sub.trialEndsAt > now);

    return {
      ...sub,
      isActive,
      isPremium: isActive,
      daysRemaining: sub.subscriptionEndsAt
        ? Math.ceil((sub.subscriptionEndsAt - now) / (1000 * 60 * 60 * 24))
        : null,
      trialDaysRemaining: sub.trialEndsAt
        ? Math.ceil((sub.trialEndsAt - now) / (1000 * 60 * 60 * 24))
        : null,
    };
  },
});

// Create or update subscription
export const createSubscription = mutation({
  args: {
    userId: v.string(),
    plan: v.union(v.literal('free'), v.literal('premium')),
    status: v.union(
      v.literal('active'),
      v.literal('trial'),
      v.literal('expired'),
      v.literal('cancelled'),
    ),
    billingCycle: v.union(v.literal('monthly'), v.literal('annual'), v.null()),
    trialEndsAt: v.optional(v.number()),
    subscriptionEndsAt: v.optional(v.number()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if subscription already exists
    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (existing) {
      // Update existing subscription
      return await ctx.db.patch(existing._id, {
        plan: args.plan,
        status: args.status,
        billingCycle: args.billingCycle,
        trialEndsAt: args.trialEndsAt,
        subscriptionEndsAt: args.subscriptionEndsAt,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripePriceId: args.stripePriceId,
      });
    } else {
      // Create new subscription
      return await ctx.db.insert('subscriptions', {
        userId: args.userId,
        plan: args.plan,
        status: args.status,
        billingCycle: args.billingCycle,
        trialEndsAt: args.trialEndsAt,
        subscriptionEndsAt: args.subscriptionEndsAt,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripePriceId: args.stripePriceId,
      });
    }
  },
});

// Update subscription details
export const updateSubscription = mutation({
  args: {
    userId: v.string(),
    updates: v.object({
      plan: v.optional(v.union(v.literal('free'), v.literal('premium'))),
      status: v.optional(
        v.union(
          v.literal('active'),
          v.literal('trial'),
          v.literal('expired'),
          v.literal('cancelled'),
        ),
      ),
      billingCycle: v.optional(
        v.union(v.literal('monthly'), v.literal('annual'), v.null()),
      ),
      trialEndsAt: v.optional(v.number()),
      subscriptionEndsAt: v.optional(v.number()),
      stripeCustomerId: v.optional(v.string()),
      stripeSubscriptionId: v.optional(v.string()),
      stripePriceId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const updates: any = {};
    if (args.updates.plan !== undefined) updates.plan = args.updates.plan;
    if (args.updates.status !== undefined) updates.status = args.updates.status;
    if (args.updates.billingCycle !== undefined)
      updates.billingCycle = args.updates.billingCycle;
    if (args.updates.trialEndsAt !== undefined)
      updates.trialEndsAt = args.updates.trialEndsAt;
    if (args.updates.subscriptionEndsAt !== undefined)
      updates.subscriptionEndsAt = args.updates.subscriptionEndsAt;
    if (args.updates.stripeCustomerId !== undefined)
      updates.stripeCustomerId = args.updates.stripeCustomerId;
    if (args.updates.stripeSubscriptionId !== undefined)
      updates.stripeSubscriptionId = args.updates.stripeSubscriptionId;
    if (args.updates.stripePriceId !== undefined)
      updates.stripePriceId = args.updates.stripePriceId;

    return await ctx.db.patch(subscription._id, updates);
  },
});

// Cancel subscription
export const cancelSubscription = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return await ctx.db.patch(subscription._id, {
      status: 'cancelled',
      plan: 'free',
    });
  },
});

// Set trial period
export const setTrial = mutation({
  args: {
    userId: v.string(),
    days: v.number(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    const trialEndsAt = Date.now() + args.days * 24 * 60 * 60 * 1000;

    if (subscription) {
      return await ctx.db.patch(subscription._id, {
        status: 'trial',
        plan: 'premium',
        trialEndsAt,
      });
    } else {
      return await ctx.db.insert('subscriptions', {
        userId: args.userId,
        plan: 'premium',
        status: 'trial',
        billingCycle: null,
        trialEndsAt,
        subscriptionEndsAt: undefined,
        stripeCustomerId: undefined,
        stripeSubscriptionId: undefined,
        stripePriceId: undefined,
      });
    }
  },
});

// Helper: Check if subscription is active
function checkSubscriptionStatus(subscription: any): boolean {
  if (!subscription) return false;
  if (subscription.plan !== 'premium') return false;
  if (subscription.status !== 'active' && subscription.status !== 'trial')
    return false;

  const now = Date.now();
  if (subscription.trialEndsAt && subscription.trialEndsAt < now) return false;
  if (
    subscription.subscriptionEndsAt &&
    subscription.subscriptionEndsAt < now
  )
    return false;

  return true;
}

// Get feature access for user
export const getFeatureAccess = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.runQuery(
      api.subscriptions.getUserSubscription,
      args,
    );
    const isPremiumActive = checkSubscriptionStatus(subscription);

    return {
      isPremium: isPremiumActive,
      maxDecks: isPremiumActive ? Infinity : 1,
      maxCardsPerDeck: isPremiumActive ? Infinity : 12,
      maxCardsPerSession: isPremiumActive ? Infinity : 12,
      maxImportantCards: isPremiumActive ? Infinity : 5,
      canUseCodeSnippets: isPremiumActive,
      canUseFillBlank: isPremiumActive,
      canAccessPremiumTopics: isPremiumActive,
      canShareDecks: isPremiumActive,
      progressHistoryDays: isPremiumActive ? Infinity : 30,
    };
  },
});

