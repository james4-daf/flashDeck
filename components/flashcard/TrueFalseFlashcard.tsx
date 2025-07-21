'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConvexFlashcard } from '@/lib/types';
import { playAnswerSound } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface TrueFalseFlashcardProps {
  flashcard: ConvexFlashcard;
  onAnswer: (isCorrect: boolean) => void;
  showingResult?: boolean;
}

export function TrueFalseFlashcard({
  flashcard,
  onAnswer,
  showingResult = false,
}: TrueFalseFlashcardProps) {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setIsCorrect(null);
  }, [flashcard._id]);

  const handleAnswer = (userAnswer: boolean) => {
    if (showingResult) return;
    const correctAnswer =
      typeof flashcard.answer === 'string'
        ? flashcard.answer.toLowerCase() === 'true'
        : Boolean(flashcard.answer);
    const correct = userAnswer === correctAnswer;
    setIsCorrect(correct);
    playAnswerSound(correct);
    onAnswer(correct);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">{flashcard.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showingResult && (
          <div className="flex gap-4">
            <Button
              onClick={() => handleAnswer(true)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              True
            </Button>
            <Button
              onClick={() => handleAnswer(false)}
              variant="outline"
              className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            >
              False
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
