// convex/topics.ts
import { v } from 'convex/values';
import { api } from './_generated/api';
import { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

// Get all topics
export const getAllTopics = query({
  args: {},
  handler: async (ctx) => {
    const topics = await ctx.db.query('topics').collect();
    return topics.sort((a, b) => a.order - b.order);
  },
});

// Get free topics only
export const getFreeTopics = query({
  args: {},
  handler: async (ctx) => {
    const topics = await ctx.db
      .query('topics')
      .withIndex('by_premium', (q) => q.eq('isPremium', false))
      .collect();
    return topics.sort((a, b) => a.order - b.order);
  },
});

// Get premium topics only
export const getPremiumTopics = query({
  args: {},
  handler: async (ctx) => {
    const topics = await ctx.db
      .query('topics')
      .withIndex('by_premium', (q) => q.eq('isPremium', true))
      .collect();
    return topics.sort((a, b) => a.order - b.order);
  },
});

// Get topic by slug
export const getTopicBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('topics')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
  },
});

// Get topics user can access based on subscription
export const getTopicsForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<Doc<'topics'>[]> => {
    // Check subscription status
    const userIsPremium = await ctx.runQuery(api.subscriptions.isPremium, {
      userId: args.userId,
    });

    if (userIsPremium) {
      // Premium users get all topics
      return await ctx.runQuery(api.topics.getAllTopics, {});
    } else {
      // Free users get only free topics
      return await ctx.runQuery(api.topics.getFreeTopics, {});
    }
  },
});

// Create a topic
export const createTopic = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    isPremium: v.boolean(),
    tech: v.optional(v.string()),
    cardCount: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if topic with same slug already exists
    const existing = await ctx.db
      .query('topics')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();

    if (existing) {
      throw new Error(`Topic with slug "${args.slug}" already exists`);
    }

    // Get max order if not provided
    let order = args.order;
    if (order === undefined) {
      const allTopics = await ctx.db.query('topics').collect();
      const maxOrder = allTopics.reduce(
        (max, topic) => Math.max(max, topic.order),
        -1,
      );
      order = maxOrder + 1;
    }

    return await ctx.db.insert('topics', {
      name: args.name,
      slug: args.slug,
      description: args.description,
      isPremium: args.isPremium,
      tech: args.tech,
      cardCount: args.cardCount ?? 0,
      order: order,
    });
  },
});

// Update topic
export const updateTopic = mutation({
  args: {
    topicId: v.id('topics'),
    updates: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
      description: v.optional(v.string()),
      isPremium: v.optional(v.boolean()),
      tech: v.optional(v.string()),
      cardCount: v.optional(v.number()),
      order: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId);
    if (!topic) {
      throw new Error('Topic not found');
    }

    // If slug is being updated, check for conflicts
    if (args.updates.slug && args.updates.slug !== topic.slug) {
      const existing = await ctx.db
        .query('topics')
        .withIndex('by_slug', (q) => q.eq('slug', args.updates.slug!))
        .first();

      if (existing && existing._id !== args.topicId) {
        throw new Error(`Topic with slug "${args.updates.slug}" already exists`);
      }
    }

    const updates: any = {};
    if (args.updates.name !== undefined) updates.name = args.updates.name;
    if (args.updates.slug !== undefined) updates.slug = args.updates.slug;
    if (args.updates.description !== undefined)
      updates.description = args.updates.description;
    if (args.updates.isPremium !== undefined)
      updates.isPremium = args.updates.isPremium;
    if (args.updates.tech !== undefined) updates.tech = args.updates.tech;
    if (args.updates.cardCount !== undefined)
      updates.cardCount = args.updates.cardCount;
    if (args.updates.order !== undefined) updates.order = args.updates.order;

    return await ctx.db.patch(args.topicId, updates);
  },
});

// Link flashcard to topic
export const linkFlashcardToTopic = mutation({
  args: {
    flashcardId: v.id('flashcards'),
    topicId: v.id('topics'),
  },
  handler: async (ctx, args) => {
    // Verify topic exists
    const topic = await ctx.db.get(args.topicId);
    if (!topic) {
      throw new Error('Topic not found');
    }

    // Update flashcard
    await ctx.db.patch(args.flashcardId, {
      topicId: args.topicId,
    });

    // Update topic card count
    const flashcards = await ctx.db
      .query('flashcards')
      .filter((q) => q.eq(q.field('topicId'), args.topicId))
      .collect();

    await ctx.db.patch(args.topicId, {
      cardCount: flashcards.length,
    });
  },
});

// Seed initial topics (free and premium)
export const seedTopics = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if topics already exist
    const existing = await ctx.db.query('topics').first();
    if (existing) {
      return { message: 'Topics already seeded', count: 0 };
    }

    const freeTopics = [
      {
        name: 'Beginner React',
        slug: 'beginner-react',
        description: 'Learn the fundamentals of React',
        isPremium: false,
        tech: 'React',
        order: 0,
      },
      {
        name: 'Intermediate JavaScript',
        slug: 'intermediate-javascript',
        description: 'Intermediate JavaScript concepts and patterns',
        isPremium: false,
        tech: 'JavaScript',
        order: 1,
      },
      {
        name: 'JavaScript Basics',
        slug: 'javascript-basics',
        description: 'Core JavaScript fundamentals',
        isPremium: false,
        tech: 'JavaScript',
        order: 2,
      },
      {
        name: 'React Hooks Basics',
        slug: 'react-hooks-basics',
        description: 'Introduction to React Hooks',
        isPremium: false,
        tech: 'React',
        order: 3,
      },
      {
        name: 'ES6+ Features',
        slug: 'es6-features',
        description: 'Modern JavaScript features (ES6+)',
        isPremium: false,
        tech: 'JavaScript',
        order: 4,
      },
    ];

    const premiumTopics = [
      {
        name: 'JavaScript Under the Hood',
        slug: 'javascript-under-the-hood',
        description: 'Deep dive into how JavaScript works internally',
        isPremium: true,
        tech: 'JavaScript',
        order: 5,
      },
      {
        name: 'Advanced React Patterns',
        slug: 'advanced-react-patterns',
        description: 'Advanced React patterns and techniques',
        isPremium: true,
        tech: 'React',
        order: 6,
      },
      {
        name: 'React 20 Features',
        slug: 'react-20-features',
        description: 'Latest features in React 20',
        isPremium: true,
        tech: 'React',
        order: 7,
      },
      {
        name: 'Next.js Fundamentals',
        slug: 'nextjs-fundamentals',
        description: 'Learn Next.js from the ground up',
        isPremium: true,
        tech: 'Next.js',
        order: 8,
      },
      {
        name: 'Next.js Advanced',
        slug: 'nextjs-advanced',
        description: 'Advanced Next.js concepts and optimization',
        isPremium: true,
        tech: 'Next.js',
        order: 9,
      },
      {
        name: 'TypeScript Basics',
        slug: 'typescript-basics',
        description: 'Introduction to TypeScript',
        isPremium: true,
        tech: 'TypeScript',
        order: 10,
      },
      {
        name: 'TypeScript Advanced',
        slug: 'typescript-advanced',
        description: 'Advanced TypeScript patterns and types',
        isPremium: true,
        tech: 'TypeScript',
        order: 11,
      },
      {
        name: 'CSS Fundamentals',
        slug: 'css-fundamentals',
        description: 'Core CSS concepts and best practices',
        isPremium: true,
        tech: 'CSS',
        order: 12,
      },
      {
        name: 'Advanced CSS',
        slug: 'advanced-css',
        description: 'Advanced CSS techniques and layouts',
        isPremium: true,
        tech: 'CSS',
        order: 13,
      },
      {
        name: 'Web Performance',
        slug: 'web-performance',
        description: 'Optimizing web application performance',
        isPremium: true,
        tech: 'Performance',
        order: 14,
      },
      {
        name: 'Browser APIs',
        slug: 'browser-apis',
        description: 'Working with browser APIs',
        isPremium: true,
        tech: 'Browser',
        order: 15,
      },
      {
        name: 'Node.js Basics',
        slug: 'nodejs-basics',
        description: 'Introduction to Node.js',
        isPremium: true,
        tech: 'Node.js',
        order: 16,
      },
      {
        name: 'Node.js Advanced',
        slug: 'nodejs-advanced',
        description: 'Advanced Node.js concepts',
        isPremium: true,
        tech: 'Node.js',
        order: 17,
      },
      {
        name: 'Testing (Jest, React Testing Library)',
        slug: 'testing',
        description: 'Testing JavaScript and React applications',
        isPremium: true,
        tech: 'Testing',
        order: 18,
      },
      {
        name: 'State Management (Redux, Zustand)',
        slug: 'state-management',
        description: 'Managing application state',
        isPremium: true,
        tech: 'State Management',
        order: 19,
      },
      {
        name: 'GraphQL',
        slug: 'graphql',
        description: 'GraphQL fundamentals and advanced concepts',
        isPremium: true,
        tech: 'GraphQL',
        order: 20,
      },
      {
        name: 'Web Security',
        slug: 'web-security',
        description: 'Web application security best practices',
        isPremium: true,
        tech: 'Security',
        order: 21,
      },
      {
        name: 'Design Patterns',
        slug: 'design-patterns',
        description: 'JavaScript and React design patterns',
        isPremium: true,
        tech: 'Patterns',
        order: 22,
      },
      {
        name: 'Algorithms & Data Structures',
        slug: 'algorithms-data-structures',
        description: 'Common algorithms and data structures in JavaScript',
        isPremium: true,
        tech: 'Algorithms',
        order: 23,
      },
      {
        name: 'System Design',
        slug: 'system-design',
        description: 'System design principles and patterns',
        isPremium: true,
        tech: 'System Design',
        order: 24,
      },
    ];

    const created = [];
    for (const topic of [...freeTopics, ...premiumTopics]) {
      const id = await ctx.db.insert('topics', {
        ...topic,
        cardCount: 0,
      });
      created.push(id);
    }

    return {
      message: 'Topics seeded successfully',
      count: created.length,
      freeTopics: freeTopics.length,
      premiumTopics: premiumTopics.length,
    };
  },
});

