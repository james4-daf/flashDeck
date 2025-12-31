'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { ConvexFlashcard } from '@/lib/types';

type FlashcardType =
  | 'basic'
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'code_snippet';

interface CardTransformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashcard: ConvexFlashcard;
  deckId?: Id<'decks'>;
  onTransformed?: () => void;
}

export function CardTransformDialog({
  open,
  onOpenChange,
  flashcard,
  deckId,
  onTransformed,
}: CardTransformDialogProps) {
  const { user } = useUser();
  const [targetType, setTargetType] = useState<FlashcardType>('multiple_choice');
  const [transforming, setTransforming] = useState(false);
  const [transformedCard, setTransformedCard] = useState<{
    question: string;
    answer: string | string[];
    type: FlashcardType;
    options?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createFlashcard = useMutation(api.flashcards.createFlashcard);

  const handleTransform = async () => {
    setTransforming(true);
    setError(null);

    try {
      const currentAnswer =
        typeof flashcard.answer === 'string'
          ? flashcard.answer
          : flashcard.answer.join(', ');

      const response = await fetch('/api/ai/transform-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: flashcard.question,
          answer: currentAnswer,
          currentType: flashcard.type,
          targetType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to transform flashcard');
      }

      if (data.success && data.flashcard) {
        setTransformedCard(data.flashcard);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to transform flashcard';
      setError(errorMessage);
    } finally {
      setTransforming(false);
    }
  };

  const handleSave = async () => {
    if (!transformedCard || !user?.id) return;

    setTransforming(true);
    setError(null);

    try {
      if (!deckId) {
        throw new Error('Deck ID is required to save transformed card');
      }

      // Create new flashcard in deck
      await createFlashcard({
        question: transformedCard.question,
        answer: transformedCard.answer,
        type: transformedCard.type,
        category: flashcard.category,
        tech: flashcard.tech,
        options: transformedCard.options,
        deckId,
        userId: user.id,
      });

      // Reset and close
      setTransformedCard(null);
      onOpenChange(false);
      if (onTransformed) {
        onTransformed();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save transformed flashcard';
      setError(errorMessage);
    } finally {
      setTransforming(false);
    }
  };

  const handleClose = () => {
    if (!transforming) {
      setTransformedCard(null);
      setError(null);
      setTargetType('multiple_choice');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transform Flashcard</DialogTitle>
          <DialogDescription>
            Use AI to transform this flashcard into a different format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Card Preview */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Current Card</h4>
            <p className="text-sm text-slate-700 mb-1">
              <span className="font-medium">Type:</span> {flashcard.type}
            </p>
            <p className="text-sm text-slate-700 mb-1">
              <span className="font-medium">Question:</span> {flashcard.question}
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-medium">Answer:</span>{' '}
              {typeof flashcard.answer === 'string'
                ? flashcard.answer
                : flashcard.answer.join(', ')}
            </p>
          </div>

          {/* Target Type Selection */}
          {!transformedCard && (
            <div className="space-y-2">
              <label htmlFor="target-type" className="text-sm font-medium">
                Transform to:
              </label>
              <select
                id="target-type"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as FlashcardType)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                disabled={transforming}
              >
                <option value="basic">Basic (Q&A)</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True/False</option>
                <option value="fill_blank">Fill in the Blank</option>
                <option value="code_snippet">Code Snippet</option>
              </select>
              <Button
                type="button"
                onClick={handleTransform}
                disabled={transforming || targetType === flashcard.type}
                className="w-full gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {transforming ? 'Transforming...' : 'Transform'}
              </Button>
            </div>
          )}

          {/* Transformed Card Preview */}
          {transformedCard && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">Transformed Card</h4>
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <p className="text-sm text-slate-700 mb-1">
                  <span className="font-medium">Type:</span> {transformedCard.type}
                </p>
                <p className="text-sm text-slate-700 mb-1">
                  <span className="font-medium">Question:</span> {transformedCard.question}
                </p>
                {transformedCard.type === 'multiple_choice' && transformedCard.options && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-slate-600">Options:</p>
                    {transformedCard.options.map((opt, idx) => (
                      <p key={idx} className="text-xs text-slate-700 pl-2">
                        {idx + 1}. {opt}
                      </p>
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-700 mt-2">
                  <span className="font-medium">Answer:</span>{' '}
                  {typeof transformedCard.answer === 'string'
                    ? transformedCard.answer
                    : transformedCard.answer.join(', ')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTransformedCard(null)}
                  disabled={transforming}
                >
                  Try Again
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={transforming || !deckId}
                  className="flex-1"
                >
                  {transforming ? 'Saving...' : 'Save as New Card'}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={transforming}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

