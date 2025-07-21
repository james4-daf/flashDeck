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
}

export function BasicFlashcard({
  flashcard,
  onAnswer,
  showingResult = false,
}: BasicFlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
