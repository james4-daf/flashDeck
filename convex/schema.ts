import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Flashcard tables
  flashcards: defineTable({
    question: v.string(),
    answer: v.union(
      v.string(), // for basic and true_false
      v.array(v.string()), // for multiple_choice (can have multiple correct answers)
    ),
    type: v.union(
      v.literal('basic'),
      v.literal('multiple_choice'),
      v.literal('true_false'),
    ),
    category: v.string(), // just a string, not separate table
    options: v.optional(v.array(v.string())), // for multiple choice options
  }),

  // User progress - simplified SRS
  userProgress: defineTable({
    userId: v.string(), // This will be the Clerk user ID
    flashcardId: v.id('flashcards'),
    nextReviewDate: v.number(), // timestamp
    reviewCount: v.number(),
    lastCorrect: v.boolean(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_card', ['userId', 'flashcardId'])
    .index('by_due_date', ['nextReviewDate']),
});
