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
      v.literal('fill_blank'),
      v.literal('code_snippet'),
    ),
    tech: v.optional(v.string()),
    lists: v.optional(v.array(v.string())),
    category: v.string(), // just a string, not separate table
    options: v.optional(v.array(v.string())), // for multiple choice options
    deckId: v.optional(v.id('decks')), // Link to deck if part of a deck
    topicId: v.optional(v.id('topics')), // Link to topic
  })
    .index('by_tech', ['tech'])
    .index('by_category', ['category']),

  // User progress - Anki-style SRS
  userProgress: defineTable({
    userId: v.string(), // This will be the Clerk user ID
    flashcardId: v.id('flashcards'),

    // Anki-style card state (optional for migration compatibility)
    state: v.optional(
      v.union(
        v.literal('new'), // Never studied
        v.literal('learning'), // In learning phase (20min → 1hr)
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
    important: v.optional(v.boolean()), // New field for marking as important
  })
    .index('by_user', ['userId'])
    .index('by_user_and_card', ['userId', 'flashcardId'])
    .index('by_due_date', ['nextReviewDate'])
    .index('by_state', ['state']),

  // Study log for daily/weekly/monthly tracking
  studyLog: defineTable({
    userId: v.string(),
    date: v.string(), // Format: "YYYY-MM-DD" for easy querying
    flashcardCount: v.number(), // Number of flashcards studied on this date
  })
    .index('by_user', ['userId'])
    .index('by_user_and_date', ['userId', 'date'])
    .index('by_date', ['date']),

  // Session attempts tracking to prevent immediate card repetition
  sessionAttempts: defineTable({
    userId: v.string(),
    flashcardId: v.id('flashcards'),
    attemptedAt: v.number(), // timestamp
    isCorrect: v.boolean(),
    sessionId: v.optional(v.string()), // For future analytics
  })
    .index('by_user', ['userId'])
    .index('by_user_and_card', ['userId', 'flashcardId'])
    .index('by_attempted_at', ['attemptedAt']),

  // Decks - user-created collections of flashcards
  decks: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(), // Whether deck is visible in community
    createdBy: v.string(), // User ID who created the deck
    upvoteCount: v.number(), // Cached count of upvotes
    cardCount: v.number(), // Cached count of flashcards in deck
    isPremium: v.optional(v.boolean()), // Whether deck requires premium
  })
    .index('by_creator', ['createdBy'])
    .index('by_public', ['isPublic'])
    .index('by_upvotes', ['upvoteCount']),

  // Deck upvotes - track which users upvoted which decks
  deckUpvotes: defineTable({
    userId: v.string(),
    deckId: v.id('decks'),
  })
    .index('by_user', ['userId'])
    .index('by_deck', ['deckId'])
    .index('by_user_and_deck', ['userId', 'deckId']),

  // Subscriptions - track user subscription status
  subscriptions: defineTable({
    userId: v.string(), // Clerk user ID
    plan: v.union(v.literal('free'), v.literal('premium')),
    status: v.union(
      v.literal('active'),
      v.literal('trial'),
      v.literal('expired'),
      v.literal('cancelled'),
    ),
    billingCycle: v.union(v.literal('monthly'), v.literal('annual'), v.null()),
    trialEndsAt: v.optional(v.number()), // timestamp
    subscriptionEndsAt: v.optional(v.number()), // timestamp
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status'])
    .index('by_stripe_customer', ['stripeCustomerId'])
    .index('by_stripe_subscription', ['stripeSubscriptionId']),

  // Topics - organized collections of flashcards
  topics: defineTable({
    name: v.string(), // e.g., "Beginner React", "Advanced JavaScript"
    slug: v.string(), // URL-friendly identifier
    description: v.optional(v.string()),
    isPremium: v.boolean(), // true for premium topics
    tech: v.optional(v.string()), // for grouping (e.g., "React", "JavaScript")
    cardCount: v.number(), // cached count of flashcards
    order: v.number(), // display order
  })
    .index('by_premium', ['isPremium'])
    .index('by_slug', ['slug']),

  // AI Usage tracking - track AI generation usage per user per month
  aiUsage: defineTable({
    userId: v.string(), // Clerk user ID
    month: v.string(), // Format: "YYYY-MM" (e.g., "2024-01")
    count: v.number(), // Number of AI generations this month
  })
    .index('by_user', ['userId'])
    .index('by_user_and_month', ['userId', 'month']),
});
