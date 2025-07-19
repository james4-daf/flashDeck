'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Flashcard } from '@/lib/types';
import { useState } from 'react';

interface TrueFalseFlashcardProps {
  flashcard: Flashcard;
  onAnswer: (
    isCorrect: boolean,
    response: Record<string, unknown>,
    timeSpent: number,
  ) => void;
}

export function TrueFalseFlashcard({
  flashcard,
  onAnswer,
}: TrueFalseFlashcardProps) {
  const [startTime] = useState(Date.now());

  const handleAnswer = (userAnswer: boolean) => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const isCorrect = flashcard.answer.answer === userAnswer;
    onAnswer(isCorrect, { userAnswer }, timeSpent);
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
            className="flex-1 cursor-pointer"
          >
            True
          </Button>
          <Button
            onClick={() => handleAnswer(false)}
            className="flex-1 cursor-pointer"
          >
            False
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
