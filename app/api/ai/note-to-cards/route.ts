import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { generateFlashcardsFromText } from '@/lib/ai/openai';
import { logError } from '@/lib/logger';
import { rateLimiters } from '@/lib/rateLimit';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId: authenticatedUserId } = await auth();

    if (!authenticatedUserId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to use this feature',
        },
        { status: 401 },
      );
    }

    const rateLimit = rateLimiters.documentUpload(authenticatedUserId);
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

    const body = (await request.json()) as {
      text?: string;
      maxCards?: number;
    };

    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const maxCards = Math.min(
      20,
      Math.max(1, parseInt(String(body.maxCards ?? 10), 10) || 10),
    );

    if (text.length < 20) {
      return NextResponse.json(
        {
          error: 'INVALID_TEXT',
          message: 'Add at least a few sentences of notes before generating flashcards.',
        },
        { status: 400 },
      );
    }

    const isPremium = await convex.query(api.subscriptions.isPremium, {
      userId: authenticatedUserId,
    });

    if (!isPremium) {
      return NextResponse.json(
        {
          error: 'PREMIUM_FEATURE',
          message:
            'AI flashcards from notes is a Premium feature. Upgrade to Premium to use it!',
        },
        { status: 403 },
      );
    }

    const usageCheck = await convex.mutation(api.aiUsage.checkAndIncrementUsage, {
      userId: authenticatedUserId,
      count: maxCards,
    });

    if (!usageCheck.success) {
      return NextResponse.json(
        {
          error: 'AI_GENERATION_LIMIT_REACHED',
          message: `You don't have enough AI generations remaining. You have ${usageCheck.remaining} remaining, but need ${maxCards} for this request.`,
          usageCount: usageCheck.usageCount,
          limit: usageCheck.limit,
          remaining: usageCheck.remaining,
          requested: maxCards,
        },
        { status: 403 },
      );
    }

    const flashcards = await generateFlashcardsFromText(text, maxCards);

    return NextResponse.json({
      success: true,
      flashcards,
      usage: {
        count: usageCheck.usageCount,
        limit: usageCheck.limit,
        remaining: usageCheck.remaining,
      },
    });
  } catch (error) {
    logError('Error generating flashcards from note text', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate flashcards';

    if (errorMessage.includes('OpenAI API error')) {
      return NextResponse.json(
        {
          error: 'AI_SERVICE_ERROR',
          message: 'AI service temporarily unavailable. Please try again later.',
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: 'PROCESSING_ERROR', message: errorMessage },
      { status: 500 },
    );
  }
}
