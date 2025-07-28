'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConvexFlashcard } from '@/lib/types';
import { playAnswerSound } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface FillBlankFlashcardProps {
  flashcard: ConvexFlashcard;
  onAnswer: (isCorrect: boolean) => void;
  showingResult?: boolean;
  cardStateInfo?: {
    label: string;
    shortLabel?: string;
    color: string;
    icon: string;
  };
}

export function FillBlankFlashcard({
  flashcard,
  onAnswer,
  showingResult = false,
  cardStateInfo,
}: FillBlankFlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    setShowAnswer(false);
    setLastAnswerCorrect(null);
  }, [flashcard._id]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = (isCorrect: boolean) => {
    setLastAnswerCorrect(isCorrect);
    playAnswerSound(isCorrect);
    onAnswer(isCorrect);
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
        <div className="space-y-2">
          <CardTitle className="text-lg sm:text-xl">
            {flashcard.question}
          </CardTitle>
          {cardStateInfo && (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${cardStateInfo.color}`}>
                {cardStateInfo.icon}{' '}
                {cardStateInfo.shortLabel || cardStateInfo.label}
              </span>
            </div>
          )}
        </div>
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
                className={`flex-1 transition-all duration-200 ${
                  lastAnswerCorrect === false
                    ? 'bg-red-500 text-white border-red-500 scale-105'
                    : lastAnswerCorrect === true
                      ? 'bg-slate-100 text-slate-400 border-slate-200'
                      : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                }`}
                disabled={showingResult}
              >
                {lastAnswerCorrect === false ? '✗ Incorrect' : 'Incorrect'}
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                className={`flex-1 transition-all duration-200 ${
                  lastAnswerCorrect === true
                    ? 'bg-green-500 text-white scale-105'
                    : lastAnswerCorrect === false
                      ? 'bg-slate-100 text-slate-400 border-slate-200'
                      : 'bg-green-600 hover:bg-green-700'
                }`}
                disabled={showingResult}
              >
                {lastAnswerCorrect === true ? '✓ Correct' : 'Correct'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
