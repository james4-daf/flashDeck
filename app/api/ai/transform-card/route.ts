// app/api/ai/transform-card/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { transformFlashcard } from '@/lib/ai/openai';
import { rateLimiters } from '@/lib/rateLimit';
import { logError } from '@/lib/logger';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to use this feature' },
        { status: 401 },
      );
    }

    // Check rate limit
    const rateLimit = rateLimiters.aiGeneration(userId);
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
    const { question, answer, currentType, targetType } = body;

    if (!question || !answer || !currentType || !targetType) {
      return NextResponse.json(
        { error: 'Question, answer, currentType, and targetType are required' },
        { status: 400 },
      );
    }

    // Validate target type
    const validTypes = ['basic', 'multiple_choice', 'true_false', 'fill_blank', 'code_snippet'];
    if (!validTypes.includes(targetType)) {
      return NextResponse.json(
        { error: `Invalid target type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 },
      );
    }

    // ✅ ATOMIC: Reserve a slot BEFORE transforming
    const usageCheck = await convex.mutation(
      api.aiUsage.checkAndIncrementUsage,
      { userId, count: 1 }
    );

    if (!usageCheck.success) {
      return NextResponse.json(
        {
          error: 'AI_GENERATION_LIMIT_REACHED',
          message: `You've reached your monthly limit of ${usageCheck.limit} AI generations.`,
          usageCount: usageCheck.usageCount,
          limit: usageCheck.limit,
          remaining: usageCheck.remaining,
        },
        { status: 403 },
      );
    }

    // Transform flashcard using AI (slot is already reserved)
    const transformed = await transformFlashcard(
      question,
      typeof answer === 'string' ? answer : answer.join(', '),
      currentType,
      targetType as 'basic' | 'multiple_choice' | 'true_false' | 'fill_blank' | 'code_snippet',
    );

    return NextResponse.json({
      success: true,
      flashcard: transformed,
      usage: {
        count: usageCheck.usageCount,
        limit: usageCheck.limit,
        remaining: usageCheck.remaining,
      },
    });
  } catch (error) {
    logError('Error transforming flashcard', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to transform flashcard';
    
    // Handle specific OpenAI errors
    if (errorMessage.includes('OpenAI API error')) {
      return NextResponse.json(
        { error: 'AI_SERVICE_ERROR', message: 'AI service temporarily unavailable. Please try again later.' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: 'TRANSFORMATION_ERROR', message: errorMessage },
      { status: 500 },
    );
  }
}
