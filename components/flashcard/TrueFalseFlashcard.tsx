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
  cardStateInfo?: {
    label: string;
    shortLabel?: string;
    color: string;
    icon: string;
  };
}

export function TrueFalseFlashcard({
  flashcard,
  onAnswer,
  showingResult = false,
  cardStateInfo,
}: TrueFalseFlashcardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [flashcard._id]);

  const handleAnswer = (userAnswer: boolean) => {
    if (showingResult) return;
    const correctAnswer =
      typeof flashcard.answer === 'string'
        ? flashcard.answer.toLowerCase() === 'true'
        : Boolean(flashcard.answer);
    const correct = userAnswer === correctAnswer;
    setSelectedAnswer(userAnswer);
    playAnswerSound(correct);
    onAnswer(correct);
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
        {!showingResult && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={() => handleAnswer(true)}
              className={`flex-1 transition-all duration-200 py-3 sm:py-4 text-base sm:text-lg ${
                selectedAnswer === true
                  ? 'bg-green-500 text-white scale-105'
                  : selectedAnswer === false
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : 'bg-green-600 hover:bg-green-700'
              }`}
              disabled={showingResult}
            >
              {selectedAnswer === true ? '✓ True' : 'True'}
            </Button>
            <Button
              onClick={() => handleAnswer(false)}
              variant="outline"
              className={`flex-1 transition-all duration-200 py-3 sm:py-4 text-base sm:text-lg ${
                selectedAnswer === false
                  ? 'bg-red-500 text-white border-red-500 scale-105'
                  : selectedAnswer === true
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
              }`}
              disabled={showingResult}
            >
              {selectedAnswer === false ? '✗ False' : 'False'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
