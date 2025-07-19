// convex/flashcards.ts
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Get all active flashcards (for testing)
export const getAllFlashcards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('flashcards').collect();
  },
});

// Get flashcards by category
export const getFlashcardsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('flashcards')
      .filter((q) => q.and(q.eq(q.field('category'), args.category)))
      .collect();
  },
});

// Create a flashcard (for adding test data)
export const createFlashcard = mutation({
  args: {
    question: v.string(),
    answer: v.union(v.string(), v.array(v.string())),
    type: v.union(
      v.literal('basic'),
      v.literal('multiple_choice'),
      v.literal('true_false'),
    ),
    category: v.string(),
    options: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('flashcards', {
      question: args.question,
      answer: args.answer,
      type: args.type,
      category: args.category,
      options: args.options,
    });
  },
});
