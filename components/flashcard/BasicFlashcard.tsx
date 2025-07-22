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
        <CardTitle className="text-xl">{flashcard.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showAnswer ? (
          <Button
            onClick={handleShowAnswer}
            className="w-full"
            disabled={showingResult}
          >
            Show Answer
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="font-medium text-slate-900">{getCorrectAnswer()}</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => handleAnswer(false)}
                className="flex-1 transition-colors bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                disabled={showingResult}
              >
                Incorrect
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                className="flex-1 transition-colors bg-green-600 hover:bg-green-700 text-white"
                disabled={showingResult}
              >
                Correct
              </Button>
            </div>

            {/* Mark as Important button - shown after incorrect answer */}
            {showImportantButton && onMarkImportant && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Having trouble with this card?
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkImportant(!isImportant)}
                    className={`${
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
