'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConvexFlashcard } from '@/lib/types';
import { playAnswerSound } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface BasicFlashcardProps {
  flashcard: ConvexFlashcard;
  onAnswer: (isCorrect: boolean) => void;
  showingResult?: boolean;
  onMarkImportant?: (important: boolean) => void;
  showImportantButton?: boolean;
  isImportant?: boolean;
}

export function BasicFlashcard({
  flashcard,
  onAnswer,
  showingResult = false,
  onMarkImportant,
  showImportantButton = false,
  isImportant = false,
}: BasicFlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setShowAnswer(false);
    setIsCorrect(null);
  }, [flashcard._id]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = (isCorrect: boolean) => {
    setIsCorrect(isCorrect);
    playAnswerSound(isCorrect);
    onAnswer(isCorrect);
  };

  const handleMarkImportant = (important: boolean) => {
    onMarkImportant?.(important);
  };

  const getCorrectAnswer = () => {
    if (typeof flashcard.answer === 'string') {
      return flashcard.answer;
    }
    return flashcard.answer.join(', ');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">
          {flashcard.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showAnswer ? (
          <Button
            onClick={handleShowAnswer}
            className="w-full py-3 sm:py-4 text-base sm:text-lg"
            disabled={showingResult}
          >
            Show Answer
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border">
              <p className="font-medium text-slate-900 text-sm sm:text-base">
                {getCorrectAnswer()}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={() => handleAnswer(true)}
                className="flex-1 transition-colors bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 text-base sm:text-lg"
                disabled={showingResult}
              >
                Correct
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAnswer(false)}
                className="flex-1 transition-colors bg-red-50 border-red-200 text-red-700 hover:bg-red-100 py-3 sm:py-4 text-base sm:text-lg"
                disabled={showingResult}
              >
                Incorrect
              </Button>
            </div>

            {/* Mark as Important button - shown after incorrect answer */}
            {showImportantButton && onMarkImportant && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <span className="text-xs sm:text-sm text-slate-600">
                    Having trouble with this card?
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkImportant(!isImportant)}
                    className={`text-xs sm:text-sm ${
                      isImportant
                        ? 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100'
                        : 'border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {isImportant ? '📌 Important' : '📌 Mark as Important'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
