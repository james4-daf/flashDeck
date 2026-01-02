// convex/userPreferences.ts
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Get user preferences (returns null if none exist)
export const getUserPreferences = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const preferences = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    return preferences;
  },
});

// Check if onboarding should be shown (returns true if user hasn't completed onboarding)
export const shouldShowOnboarding = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const preferences = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    // If no preferences exist, show onboarding
    if (!preferences) {
      return true;
    }

    // If preferences exist but onboarding not completed, show it
    return !preferences.hasCompletedOnboarding;
  },
});

// Mark onboarding as complete
export const markOnboardingComplete = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (existing) {
      // Update existing preferences
      await ctx.db.patch(existing._id, {
        hasCompletedOnboarding: true,
        completedOnboardingAt: now,
      });
      return existing._id;
    } else {
      // Create new preferences record
      return await ctx.db.insert('userPreferences', {
        userId: args.userId,
        hasCompletedOnboarding: true,
        completedOnboardingAt: now,
      });
    }
  },
});

// Reset onboarding status to allow replay
export const resetOnboarding = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (existing) {
      // Update existing preferences to reset onboarding
      await ctx.db.patch(existing._id, {
        hasCompletedOnboarding: false,
        completedOnboardingAt: undefined,
      });
      return existing._id;
    } else {
      // Create new preferences record with onboarding not completed
      return await ctx.db.insert('userPreferences', {
        userId: args.userId,
        hasCompletedOnboarding: false,
        completedOnboardingAt: undefined,
      });
    }
  },
});

