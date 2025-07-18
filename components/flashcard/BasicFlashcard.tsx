'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Flashcard } from '@/lib/types';
import { useEffect, useState } from 'react';

interface BasicFlashcardProps {
  flashcard: Flashcard;
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
  }, [flashcard.id]);

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
    setTimeout(() => {
      setAnswered(true);
      setPending(null);
    }, 800);
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
            {!answered ? (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleAnswer(false)}
                  className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 cursor-pointer"
                  disabled={pending !== null}
                >
                  {pending === 'incorrect' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></span>
                      Incorrect
                    </span>
                  ) : (
                    'Incorrect'
                  )}
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
                  disabled={pending !== null}
                >
                  {pending === 'correct' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Correct
                    </span>
                  ) : (
                    'Correct'
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button onClick={() => setShowAnswer(false)} className="w-32">
                  Next Card
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
