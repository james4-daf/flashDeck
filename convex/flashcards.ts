// convex/flashcards.ts
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Get all active flashcards (for testing)
export const getAllFlashcards = query({
  args: {},
  handler: async (ctx) => {
    console.log('🔐 getAllFlashcards: Query called');
    const cards = await ctx.db.query('flashcards').collect();
    console.log('🔐 getAllFlashcards: Found', cards.length, 'flashcards');
    return cards;
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

// Get flashcards due for review for a specific user
export const getDueFlashcards = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get all flashcards
    const allFlashcards = await ctx.db.query('flashcards').collect();

    // Get user's progress for all flashcards
    const userProgress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    // Create a map of flashcard progress for quick lookup
    const progressMap = new Map();
    userProgress.forEach((progress) => {
      progressMap.set(progress.flashcardId, progress);
    });

    // Filter flashcards that are due for review or haven't been studied yet
    const dueFlashcards = allFlashcards.filter((flashcard) => {
      const progress = progressMap.get(flashcard._id);

      if (!progress) {
        // New flashcard that hasn't been studied yet - include it
        return true;
      }

      // Existing flashcard - check if it's due for review
      return progress.nextReviewDate <= now;
    });

    console.log(
      '🔐 getDueFlashcards: Found',
      dueFlashcards.length,
      'due flashcards for user',
      args.userId,
    );
    console.log(
      '🔐 getDueFlashcards: Total flashcards:',
      allFlashcards.length,
      'User progress records:',
      userProgress.length,
    );

    return dueFlashcards;
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
    console.log('🔐 createFlashcard: Creating flashcard:', args.question);
    return await ctx.db.insert('flashcards', {
      question: args.question,
      answer: args.answer,
      type: args.type,
      category: args.category,
      options: args.options,
    });
  },
});

// Create sample flashcards for testing
export const createSampleFlashcards = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('🔐 createSampleFlashcards: Creating sample flashcards...');

    // Check if we already have flashcards
    const existing = await ctx.db.query('flashcards').collect();
    if (existing.length > 0) {
      console.log('🔐 createSampleFlashcards: Sample flashcards already exist');
      return {
        message: 'Sample flashcards already exist',
        count: existing.length,
      };
    }

    const sampleCards = [
      {
        question: 'What is the difference between let and var in JavaScript?',
        answer: 'let has block scope while var has function scope',
        type: 'basic' as const,
        category: 'Variables',
      },
      {
        question: 'What is the purpose of the useState hook in React?',
        answer: 'To add state to functional components',
        type: 'basic' as const,
        category: 'React Hooks',
      },
      {
        question:
          'Which method is used to add an element to the end of an array?',
        answer: ['push()'],
        type: 'multiple_choice' as const,
        category: 'Arrays',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
      },
      {
        question: 'Is JavaScript a compiled language?',
        answer: 'false',
        type: 'true_false' as const,
        category: 'JavaScript Basics',
      },
    ];

    const createdCards = [];
    for (const card of sampleCards) {
      const id = await ctx.db.insert('flashcards', card);
      createdCards.push(id);
      console.log('🔐 createSampleFlashcards: Created card:', card.question);
    }

    console.log(
      '🔐 createSampleFlashcards: Created',
      createdCards.length,
      'sample flashcards',
    );
    return { message: 'Sample flashcards created', count: createdCards.length };
  },
});
