'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConvexFlashcard } from '@/lib/types';
import { useEffect, useState } from 'react';

interface FillBlankFlashcardProps {
  flashcard: ConvexFlashcard;
  onAnswer: (isCorrect: boolean) => void;
}

export function FillBlankFlashcard({
  flashcard,
  onAnswer,
}: FillBlankFlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setShowAnswer(false);
    setAnswered(false);
  }, [flashcard._id]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = (isCorrect: boolean) => {
    onAnswer(isCorrect);
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
                className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                disabled={answered}
              >
                Incorrect
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={answered}
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
