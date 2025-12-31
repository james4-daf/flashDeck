// app/api/ai/parse-document/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { parseDocument, validateFileSize } from '@/lib/files/parser';
import { generateFlashcardsFromText } from '@/lib/ai/openai';
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

    // Check rate limit (document uploads are more expensive)
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const maxCards = parseInt(formData.get('maxCards') as string || '10', 10);

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Check if user is premium using authenticated userId
    const isPremium = await convex.query(api.subscriptions.isPremium, { userId: authenticatedUserId });

    if (!isPremium) {
      return NextResponse.json(
        {
          error: 'PREMIUM_FEATURE',
          message: 'Document upload is a Premium feature. Upgrade to Premium to upload documents and generate flashcards!',
        },
        { status: 403 },
      );
    }

    // Validate file size (10MB max)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    validateFileSize(buffer, 10);

    // Parse document
    const parsed = await parseDocument(buffer, file.type, file.name);

    if (!parsed.text || parsed.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Document appears to be empty or could not extract text' },
        { status: 400 },
      );
    }

    // Check AI usage limits using authenticated userId
    await convex.query(api.aiUsage.canUseAI, { userId: authenticatedUserId });

    // Generate flashcards from document text
    const flashcards = await generateFlashcardsFromText(parsed.text, maxCards);

    // Increment usage count using authenticated userId
    await convex.mutation(api.aiUsage.incrementUsage, {
      userId: authenticatedUserId,
      count: flashcards.length,
    });

    return NextResponse.json({
      success: true,
      flashcards,
      documentInfo: {
        textLength: parsed.text.length,
        pageCount: parsed.pageCount,
      },
    });
  } catch (error) {
    logError('Error parsing document', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to parse document';

    // Handle specific errors
    if (errorMessage.includes('File size exceeds')) {
      return NextResponse.json(
        { error: 'FILE_TOO_LARGE', message: errorMessage },
        { status: 400 },
      );
    }

    if (errorMessage.includes('Unsupported file type')) {
      return NextResponse.json(
        { error: 'UNSUPPORTED_FILE_TYPE', message: errorMessage },
        { status: 400 },
      );
    }

    if (errorMessage.includes('Failed to parse')) {
      return NextResponse.json(
        { error: 'PARSE_ERROR', message: 'Failed to extract text from document. Please ensure the file is not corrupted.' },
        { status: 400 },
      );
    }

    if (errorMessage.includes('OpenAI API error')) {
      return NextResponse.json(
        { error: 'AI_SERVICE_ERROR', message: 'AI service temporarily unavailable. Please try again later.' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: 'PROCESSING_ERROR', message: errorMessage },
      { status: 500 },
    );
  }
}
