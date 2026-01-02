// convex/users.ts
import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const upsertFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/users.ts:10',message:'upsertFromClerk mutation called',data:{clerkId:args.clerkId,email:args.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Check if user already exists by Clerk ID
    let existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first();

    // If not found by clerkId, check by email (for migration of old users)
    if (!existing) {
      existing = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', args.email))
        .first();
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/users.ts:18',message:'User lookup result',data:{userExists:!!existing,existingUserId:existing?._id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    if (existing) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/users.ts:21',message:'Updating existing user',data:{userId:existing._id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Update email and clerkId (in case user was missing clerkId from old data)
      await ctx.db.patch(existing._id, {
        email: args.email,
        clerkId: args.clerkId,
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/users.ts:27',message:'User updated successfully',data:{userId:existing._id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return existing._id;
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/users.ts:31',message:'Creating new user',data:{clerkId:args.clerkId,email:args.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Create new user
      const userId = await ctx.db.insert('users', {
        clerkId: args.clerkId,
        email: args.email,
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/users.ts:37',message:'User created successfully',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return userId;
    }
  },
});

// Ensure user exists in users table (uses JWT token to get user info)
// Email can be passed optionally if not in JWT token
export const ensureUserExists = mutation({
  args: {
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user identity from JWT token (works for email/password, OAuth, etc.)
    // See: https://docs.convex.dev/auth/clerk
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Extract user info from JWT token
    // The identity from Clerk JWT should have subject (user ID) regardless of auth method
    const clerkId = identity.subject;

    if (!clerkId) {
      throw new Error('User ID not found in JWT token');
    }

    // Try to get email from JWT token, fallback to passed parameter, or empty string
    const email = 
      (identity as any).email || 
      (identity as any).emailAddresses?.[0]?.emailAddress ||
      (identity as any).emailAddresses?.[0] ||
      args.email ||
      '';

    // Check if user already exists by Clerk ID
    let existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
      .first();

    // If not found by clerkId, check by email (for migration of old users)
    if (!existing && email) {
      existing = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', email))
        .first();
    }

    if (existing) {
      // Update email and clerkId (in case user was missing clerkId from old data)
      await ctx.db.patch(existing._id, {
        email: email || existing.email,
        clerkId: clerkId,
      });
      return existing._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert('users', {
        clerkId: clerkId,
        email: email || '',
      });
      return userId;
    }
  },
});

