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
    tech: v.optional(v.string()),
    lists: v.optional(v.array(v.string())),
    category: v.string(), // just a string, not separate table
    options: v.optional(v.array(v.string())), // for multiple choice options
  }),

  // User progress - Anki-style SRS
  userProgress: defineTable({
    userId: v.string(), // This will be the Clerk user ID
    flashcardId: v.id('flashcards'),

    // Anki-style card state (optional for migration compatibility)
    state: v.optional(
      v.union(
        v.literal('new'), // Never studied
        v.literal('learning'), // In learning phase (1min → 10min)
        v.literal('review'), // Graduated to review phase
        v.literal('relearning'), // Failed review, back to learning
      ),
    ),

    // Learning progress (optional for migration compatibility)
    currentStep: v.optional(v.number()), // Current step in learning/relearning sequence
    nextReviewDate: v.number(), // timestamp
    reviewCount: v.number(), // How many times successfully reviewed
    lastCorrect: v.boolean(),

    // Anki-style ease factor (optional for future enhancement)
    easeFactor: v.optional(v.number()), // 1.3 to 2.5, default 2.5
  })
    .index('by_user', ['userId'])
    .index('by_user_and_card', ['userId', 'flashcardId'])
    .index('by_due_date', ['nextReviewDate'])
    .index('by_state', ['state']),
});
