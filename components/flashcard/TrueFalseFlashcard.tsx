'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConvexFlashcard } from '@/lib/types';
import { useEffect, useState } from 'react';

interface TrueFalseFlashcardProps {
  flashcard: ConvexFlashcard;
  onAnswer: (isCorrect: boolean) => void;
}

export function TrueFalseFlashcard({
  flashcard,
  onAnswer,
}: TrueFalseFlashcardProps) {
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setAnswered(false);
  }, [flashcard._id]);

  const handleAnswer = (userAnswer: boolean) => {
    if (answered) return;

    const correctAnswer =
      typeof flashcard.answer === 'string'
        ? flashcard.answer.toLowerCase() === 'true'
        : Boolean(flashcard.answer);
    const isCorrect = userAnswer === correctAnswer;

    onAnswer(isCorrect);
    setAnswered(true);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">{flashcard.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button
            onClick={() => handleAnswer(true)}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={answered}
          >
            True
          </Button>
          <Button
            onClick={() => handleAnswer(false)}
            variant="outline"
            className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            disabled={answered}
          >
            False
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
