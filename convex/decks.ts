// convex/decks.ts
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { api } from './_generated/api';
import { mutation, query } from './_generated/server';

// Create a new deck
export const createDeck = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args): Promise<string> => {
    // Check subscription limits
    const userIsPremium: boolean = await ctx.runQuery(
      api.subscriptions.isPremium,
      {
        userId: args.createdBy,
      },
    );

    if (!userIsPremium) {
      // Free users: Check deck limit (1 deck max)
      const userDecks = await ctx.db
        .query('decks')
        .withIndex('by_creator', (q) => q.eq('createdBy', args.createdBy))
        .collect();

      if (userDecks.length >= 1) {
        throw new Error(
          'FREE_LIMIT_REACHED: You have reached your free deck limit. Upgrade to Premium to create unlimited decks!',
        );
      }

      // Free users cannot share decks publicly
      if (args.isPublic) {
        throw new Error(
          'FREE_FEATURE_LOCKED: Public deck sharing is a Premium feature. Upgrade to Premium to share your decks!',
        );
      }
    }

    const deckId: Id<'decks'> = await ctx.db.insert('decks', {
      name: args.name,
      description: args.description,
      createdBy: args.createdBy,
      isPublic: args.isPublic,
      upvoteCount: 0,
      cardCount: 0,
      isPremium: userIsPremium ? false : undefined, // Not premium-only, just user's plan
    });
    return deckId;
  },
});

// Update deck (name, description, or public/private status)
export const updateDeck = mutation({
  args: {
    deckId: v.id('decks'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId);
    if (!deck) {
      throw new Error('Deck not found');
    }

    const updates: {
      name?: string;
      description?: string;
      isPublic?: boolean;
    } = {};

    if (args.name !== undefined) {
      updates.name = args.name;
    }
    if (args.description !== undefined) {
      updates.description = args.description;
    }
    if (args.isPublic !== undefined) {
      updates.isPublic = args.isPublic;
    }

    await ctx.db.patch(args.deckId, updates);
  },
});

// Toggle deck public/private status
export const toggleDeckVisibility = mutation({
  args: {
    deckId: v.id('decks'),
    userId: v.string(), // Need userId to check subscription
  },
  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId);
    if (!deck) {
      throw new Error('Deck not found');
    }

    // Check subscription limits
    const userIsPremium: boolean = await ctx.runQuery(
      api.subscriptions.isPremium,
      {
        userId: args.userId,
      },
    );

    if (!userIsPremium && !deck.isPublic) {
      // Free users cannot make decks public
      throw new Error(
        'FREE_FEATURE_LOCKED: Public deck sharing is a Premium feature. Upgrade to Premium to share your decks!',
      );
    }

    await ctx.db.patch(args.deckId, {
      isPublic: !deck.isPublic,
    });
  },
});

// Get all public decks (for community page)
export const getPublicDecks = query({
  args: {
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let decks = await ctx.db
      .query('decks')
      .withIndex('by_public', (q) => q.eq('isPublic', true))
      .collect();

    // Filter by search query if provided
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      decks = decks.filter(
        (deck) =>
          deck.name.toLowerCase().includes(query) ||
          deck.description?.toLowerCase().includes(query),
      );
    }

    // Sort by upvotes (descending)
    decks.sort((a, b) => b.upvoteCount - a.upvoteCount);

    return decks;
  },
});

// Get decks created by a specific user
export const getUserDecks = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const decks = await ctx.db
      .query('decks')
      .withIndex('by_creator', (q) => q.eq('createdBy', args.userId))
      .collect();

    // Sort by creation time (newest first)
    decks.sort((a, b) => b._creationTime - a._creationTime);

    return decks;
  },
});

// Get a single deck by ID
export const getDeck = query({
  args: {
    deckId: v.id('decks'),
  },
  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId);
    if (!deck) {
      return null;
    }

    // Get flashcards in this deck
    const flashcards = await ctx.db
      .query('flashcards')
      .filter((q) => q.eq(q.field('deckId'), args.deckId))
      .collect();

    return {
      ...deck,
      flashcards,
    };
  },
});

// Get flashcards in a deck
export const getDeckFlashcards = query({
  args: {
    deckId: v.id('decks'),
  },
  handler: async (ctx, args) => {
    const flashcards = await ctx.db
      .query('flashcards')
      .filter((q) => q.eq(q.field('deckId'), args.deckId))
      .collect();

    return flashcards;
  },
});

// Get flashcards in a deck for studying (with user progress)
export const getDeckFlashcardsForStudying = query({
  args: {
    deckId: v.id('decks'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all flashcards in the deck
    const deckFlashcards = await ctx.db
      .query('flashcards')
      .filter((q) => q.eq(q.field('deckId'), args.deckId))
      .collect();

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

    // Return ALL flashcards in the deck (not just due ones) with progress
    return deckFlashcards.map((flashcard) => {
      const progress = progressMap.get(flashcard._id);
      return {
        ...flashcard,
        progress: progress || null,
      };
    });
  },
});

// Upvote a deck
export const upvoteDeck = mutation({
  args: {
    deckId: v.id('decks'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already upvoted
    const existingUpvote = await ctx.db
      .query('deckUpvotes')
      .withIndex('by_user_and_deck', (q) =>
        q.eq('userId', args.userId).eq('deckId', args.deckId),
      )
      .first();

    if (existingUpvote) {
      // Already upvoted, remove the upvote
      await ctx.db.delete(existingUpvote._id);

      // Decrement upvote count
      const deck = await ctx.db.get(args.deckId);
      if (deck) {
        await ctx.db.patch(args.deckId, {
          upvoteCount: Math.max(0, deck.upvoteCount - 1),
        });
      }
    } else {
      // Add upvote
      await ctx.db.insert('deckUpvotes', {
        userId: args.userId,
        deckId: args.deckId,
      });

      // Increment upvote count
      const deck = await ctx.db.get(args.deckId);
      if (deck) {
        await ctx.db.patch(args.deckId, {
          upvoteCount: deck.upvoteCount + 1,
        });
      }
    }
  },
});

// Check if user has upvoted a deck
export const hasUserUpvoted = query({
  args: {
    deckId: v.id('decks'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const upvote = await ctx.db
      .query('deckUpvotes')
      .withIndex('by_user_and_deck', (q) =>
        q.eq('userId', args.userId).eq('deckId', args.deckId),
      )
      .first();

    return !!upvote;
  },
});

// Add flashcard to deck
export const addFlashcardToDeck = mutation({
  args: {
    flashcardId: v.id('flashcards'),
    deckId: v.id('decks'),
    userId: v.string(), // Need userId to check subscription
  },
  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId);
    if (!deck) {
      throw new Error('Deck not found');
    }

    // Check subscription limits
    const userIsPremium: boolean = await ctx.runQuery(
      api.subscriptions.isPremium,
      {
        userId: args.userId,
      },
    );

    if (!userIsPremium) {
      // Free users: Check card limit (12 cards max per deck)
      const deckFlashcards = await ctx.db
        .query('flashcards')
        .filter((q) => q.eq(q.field('deckId'), args.deckId))
        .collect();

      if (deckFlashcards.length >= 12) {
        throw new Error(
          'FREE_LIMIT_REACHED: You have reached your free card limit (12 cards per deck). Upgrade to Premium to add unlimited cards!',
        );
      }
    }

    // Update flashcard
    await ctx.db.patch(args.flashcardId, {
      deckId: args.deckId,
    });

    // Update deck card count
    await ctx.db.patch(args.deckId, {
      cardCount: deck.cardCount + 1,
    });
  },
});

// Remove flashcard from deck
export const removeFlashcardFromDeck = mutation({
  args: {
    flashcardId: v.id('flashcards'),
  },
  handler: async (ctx, args) => {
    const flashcard = await ctx.db.get(args.flashcardId);
    if (!flashcard || !flashcard.deckId) {
      return;
    }

    const deckId = flashcard.deckId;

    // Remove deckId from flashcard
    await ctx.db.patch(args.flashcardId, {
      deckId: undefined,
    });

    // Update deck card count
    const deck = await ctx.db.get(deckId);
    if (deck) {
      await ctx.db.patch(deckId, {
        cardCount: Math.max(0, deck.cardCount - 1),
      });
    }
  },
});

// Delete a deck
export const deleteDeck = mutation({
  args: {
    deckId: v.id('decks'),
  },
  handler: async (ctx, args) => {
    // Remove deckId from all flashcards in this deck
    const flashcards = await ctx.db
      .query('flashcards')
      .filter((q) => q.eq(q.field('deckId'), args.deckId))
      .collect();

    for (const flashcard of flashcards) {
      await ctx.db.patch(flashcard._id, {
        deckId: undefined,
      });
    }

    // Delete all upvotes for this deck
    const upvotes = await ctx.db
      .query('deckUpvotes')
      .withIndex('by_deck', (q) => q.eq('deckId', args.deckId))
      .collect();

    for (const upvote of upvotes) {
      await ctx.db.delete(upvote._id);
    }

    // Delete the deck
    await ctx.db.delete(args.deckId);
  },
});

