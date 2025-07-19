'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Flashcard } from '@/lib/types';
import { useState } from 'react';

interface FillBlankFlashcardProps {
  flashcard: Flashcard;
  onAnswer: (
    isCorrect: boolean,
    response: Record<string, unknown>,
    timeSpent: number,
  ) => void;
}

export function FillBlankFlashcard({
  flashcard,
  onAnswer,
}: FillBlankFlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime] = useState(Date.now());

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = (isCorrect: boolean) => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    onAnswer(
      isCorrect,
      { userAnswer: isCorrect ? 'correct' : 'incorrect' },
      timeSpent,
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">{flashcard.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showAnswer ? (
          <Button onClick={handleShowAnswer} className="w-full cursor-pointer">
            Show Answer
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="font-medium text-slate-900">
                {flashcard.answer.answer}
              </p>
              {flashcard.explanation && (
                <p className="text-sm text-slate-600 mt-2">
                  {flashcard.explanation}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => handleAnswer(false)}
                className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 cursor-pointer"
              >
                Incorrect
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
              >
                Correct
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
