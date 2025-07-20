'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConvexFlashcard } from '@/lib/types';
import { useEffect, useState } from 'react';

interface BasicFlashcardProps {
  flashcard: ConvexFlashcard;
  onAnswer: (
    isCorrect: boolean,
    response: Record<string, unknown>,
    timeSpent: number,
  ) => void;
}

export function BasicFlashcard({ flashcard, onAnswer }: BasicFlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime] = useState(Date.now());
  const [pending, setPending] = useState<'correct' | 'incorrect' | null>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setShowAnswer(false);
    setPending(null);
    setAnswered(false);
  }, [flashcard._id]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = (isCorrect: boolean) => {
    setPending(isCorrect ? 'correct' : 'incorrect');
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    onAnswer(
      isCorrect,
      { userAnswer: isCorrect ? 'correct' : 'incorrect' },
      timeSpent,
    );
    setAnswered(true);
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
            disabled={answered}
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
                className={`flex-1 transition-colors ${
                  pending === 'incorrect'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                }`}
                disabled={pending !== null}
              >
                {pending === 'incorrect' ? '✓ Incorrect' : 'Incorrect'}
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                className={`flex-1 transition-colors ${
                  pending === 'correct'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                disabled={pending !== null}
              >
                {pending === 'correct' ? '✓ Correct' : 'Correct'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
