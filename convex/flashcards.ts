// convex/flashcards.ts
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Get all active flashcards (for testing)
export const getAllFlashcards = query({
  args: {},
  handler: async (ctx) => {
    const cards = await ctx.db.query('flashcards').collect();
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

    return dueFlashcards;
  },
});

// Get important flashcards for a specific user (regardless of due status)
export const getImportantFlashcards = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
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

    // Filter flashcards that are marked as important
    const importantFlashcards = allFlashcards.filter((flashcard) => {
      const progress = progressMap.get(flashcard._id);

      // Include cards that are marked as important
      return progress && progress.important;
    });

    return importantFlashcards;
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
    tech: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('flashcards', {
      question: args.question,
      answer: args.answer,
      type: args.type,
      category: args.category,
      options: args.options,
      tech: args.tech,
    });
  },
});

// Create sample flashcards for testing
export const createSampleFlashcards = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already have flashcards
    const existing = await ctx.db.query('flashcards').collect();
    if (existing.length > 0) {
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
        tech: 'JavaScript',
        lists: ['top100'],
      },
      {
        question: 'What is the purpose of the useState hook in React?',
        answer: 'To add state to functional components',
        type: 'basic' as const,
        category: 'React Hooks',
        tech: 'React',
        lists: ['top100'],
      },
      {
        question:
          'Which method is used to add an element to the end of an array?',
        answer: ['push()'],
        type: 'multiple_choice' as const,
        category: 'Arrays',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        tech: 'JavaScript',
        lists: ['top100'],
      },
      {
        question: 'Which of the following are JavaScript primitive types?',
        answer: ['string', 'number', 'boolean'],
        type: 'multiple_choice' as const,
        category: 'Types',
        options: ['string', 'number', 'boolean', 'array', 'object'],
        tech: 'JavaScript',
        lists: ['top100'],
      },
      {
        question: 'Is JavaScript a compiled language?',
        answer: 'false',
        type: 'true_false' as const,
        category: 'JavaScript Basics',
        tech: 'JavaScript',
        lists: ['essential50'],
      },
    ];

    const createdCards = [];
    for (const card of sampleCards) {
      const id = await ctx.db.insert('flashcards', card);
      createdCards.push(id);
    }

    return { message: 'Sample flashcards created', count: createdCards.length };
  },
});

export const addTechToExistingFlashcards = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('flashcards').collect();
    let updated = 0;
    for (const card of all) {
      if (!card.tech) {
        // You can set a default value, e.g., "JavaScript"
        await ctx.db.patch(card._id, { tech: 'JavaScript' });
        updated++;
      }
    }
    return { updated };
  },
});

export const getFlashcardsByList = query({
  args: { list: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query('flashcards').collect();
    return all.filter((card) => card.lists?.includes(args.list));
  },
});

// Get flashcards by list for a specific user (for studying)
export const getFlashcardsByListForUser = query({
  args: {
    list: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get all flashcards in the list
    const allFlashcards = await ctx.db.query('flashcards').collect();
    const listFlashcards = allFlashcards.filter((card) =>
      card.lists?.includes(args.list),
    );

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
    const dueListFlashcards = listFlashcards.filter((flashcard) => {
      const progress = progressMap.get(flashcard._id);

      if (!progress) {
        // New flashcard that hasn't been studied yet - include it
        return true;
      }

      // Existing flashcard - check if it's due for review
      return progress.nextReviewDate <= now;
    });

    // Return flashcards with their progress data
    return dueListFlashcards.map((flashcard) => {
      const progress = progressMap.get(flashcard._id);
      return {
        ...flashcard,
        progress: progress || null,
      };
    });
  },
});

// Get all flashcards in a list (for studying, regardless of due status)
export const getFlashcardsByListForStudying = query({
  args: {
    list: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all flashcards in the list
    const allFlashcards = await ctx.db.query('flashcards').collect();
    const listFlashcards = allFlashcards.filter((card) =>
      card.lists?.includes(args.list),
    );

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

    // Return ALL flashcards in the list (not just due ones)
    return listFlashcards.map((flashcard) => {
      const progress = progressMap.get(flashcard._id);
      return {
        ...flashcard,
        progress: progress || null,
      };
    });
  },
});
