import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

const EMPTY_DOC = JSON.stringify({
  type: 'doc',
  content: [{ type: 'paragraph' }],
});

const MAX_CONTENT_CHARS = 900_000;

export const listForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query('userNotes')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    notes.sort((a, b) => b.updatedAt - a.updatedAt);

    return notes.map((n) => ({
      _id: n._id,
      title: n.title,
      updatedAt: n.updatedAt,
      _creationTime: n._creationTime,
    }));
  },
});

export const get = query({
  args: {
    noteId: v.id('userNotes'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== args.userId) {
      return null;
    }
    return note;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<'userNotes'>> => {
    const now = Date.now();
    return await ctx.db.insert('userNotes', {
      userId: args.userId,
      title: args.title?.trim() || 'Untitled note',
      contentJson: EMPTY_DOC,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    noteId: v.id('userNotes'),
    userId: v.string(),
    title: v.optional(v.string()),
    contentJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== args.userId) {
      throw new Error('Note not found');
    }

    const updates: {
      title?: string;
      contentJson?: string;
      updatedAt: number;
    } = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      updates.title = args.title.trim() || 'Untitled note';
    }
    if (args.contentJson !== undefined) {
      if (args.contentJson.length > MAX_CONTENT_CHARS) {
        throw new Error('Note is too large');
      }
      updates.contentJson = args.contentJson;
    }

    await ctx.db.patch(args.noteId, updates);
  },
});

export const remove = mutation({
  args: {
    noteId: v.id('userNotes'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== args.userId) {
      throw new Error('Note not found');
    }
    await ctx.db.delete(args.noteId);
  },
});
