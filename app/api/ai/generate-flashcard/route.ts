// app/api/ai/generate-flashcard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { generateFlashcard } from '@/lib/ai/openai';
import { rateLimiters } from '@/lib/rateLimit';
import { logError } from '@/lib/logger';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId: authenticatedUserId } = await auth();

    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to use this feature' },
        { status: 401 },
      );
    }

    // Check rate limit (per-minute protection)
    const rateLimit = rateLimiters.aiGeneration(authenticatedUserId);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'RATE_LIMITED',
          message: `Too many requests. Please try again in ${rateLimit.resetInSeconds} seconds.`,
          retryAfter: rateLimit.resetInSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetInSeconds),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          },
        },
      );
    }

    const body = await request.json();
    const { topic, context } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    // ✅ ATOMIC: Check limit AND reserve a slot BEFORE generating
    // This prevents race conditions where multiple requests could bypass limits
    const usageCheck = await convex.mutation(
      api.aiUsage.checkAndIncrementUsage,
      { userId: authenticatedUserId, count: 1 }
    );

    if (!usageCheck.success) {
      return NextResponse.json(
        {
          error: 'AI_GENERATION_LIMIT_REACHED',
          message: `You've reached your monthly limit of ${usageCheck.limit} AI generations.${usageCheck.remaining === 0 ? '' : ` You have ${usageCheck.remaining} remaining.`}`,
          usageCount: usageCheck.usageCount,
          limit: usageCheck.limit,
          remaining: usageCheck.remaining,
        },
        { status: 403 },
      );
    }

    // Generate flashcard using AI (slot is already reserved)
    const flashcard = await generateFlashcard(topic.trim(), context?.trim());

    return NextResponse.json({
      success: true,
      flashcard,
      usage: {
        count: usageCheck.usageCount,
        limit: usageCheck.limit,
        remaining: usageCheck.remaining,
      },
    });
  } catch (error) {
    logError('Error generating flashcard', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate flashcard';
    
    // Handle specific OpenAI errors
    if (errorMessage.includes('OpenAI API error')) {
      return NextResponse.json(
        { error: 'AI_SERVICE_ERROR', message: 'AI service temporarily unavailable. Please try again later.' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: 'GENERATION_ERROR', message: errorMessage },
      { status: 500 },
    );
  }
}
