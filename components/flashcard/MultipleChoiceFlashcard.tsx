'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConvexFlashcard, FlashcardOption } from '@/lib/types';
import { useEffect, useState } from 'react';

interface MultipleChoiceFlashcardProps {
  flashcard: ConvexFlashcard;
  options: FlashcardOption[];
  onAnswer: (
    isCorrect: boolean,
    response: Record<string, unknown>,
    timeSpent: number,
  ) => void;
}

export function MultipleChoiceFlashcard({
  flashcard,
  options,
  onAnswer,
}: MultipleChoiceFlashcardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [pending, setPending] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<FlashcardOption[]>([]);

  // Fisher-Yates shuffle algorithm for options
  const shuffleOptions = (options: FlashcardOption[]): FlashcardOption[] => {
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Reset state when flashcard changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setPending(false);
    if (options.length > 0) {
      setShuffledOptions(shuffleOptions(options));
    }
  }, [flashcard._id, options]);

  const handleSelectAnswer = (optionId: string) => {
    if (showResult || pending) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || pending) return;

    setPending(true);
    const selectedOption = shuffledOptions.find(
      (opt) => opt.id === selectedAnswer,
    );
    const isCorrect = selectedOption?.is_correct || false;

    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    setShowResult(true);
    onAnswer(isCorrect, { selectedAnswer }, timeSpent);
  };

  const handleNextCard = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setPending(false);
  };

  const getOptionStyle = (optionId: string) => {
    const option = shuffledOptions.find((opt) => opt.id === optionId);
    const isSelected = selectedAnswer === optionId;

    if (!showResult) {
      return isSelected
        ? 'bg-blue-100 border-blue-300 text-blue-900'
        : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50';
    }

    // Show results
    if (option?.is_correct) {
      return 'bg-green-100 border-green-300 text-green-900';
    } else if (isSelected && !option?.is_correct) {
      return 'bg-red-100 border-red-300 text-red-900';
    } else {
      return 'bg-slate-100 border-slate-200 text-slate-600';
    }
  };

  if (shuffledOptions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <p className="text-slate-600">Loading options...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">{flashcard.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {shuffledOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectAnswer(option.id)}
              disabled={showResult || pending}
              className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${getOptionStyle(
                option.id,
              )}`}
            >
              <span className="font-medium">{option.option_text}</span>
              {showResult && option.is_correct && (
                <span className="ml-2 text-green-600">✓</span>
              )}
              {showResult &&
                selectedAnswer === option.id &&
                !option.is_correct && (
                  <span className="ml-2 text-red-600">✗</span>
                )}
            </button>
          ))}
        </div>

        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer || pending}
            className="w-full"
          >
            {pending ? 'Submitting...' : 'Submit Answer'}
          </Button>
        ) : (
          <div className="flex justify-end">
            <Button onClick={handleNextCard} className="w-32">
              Next Card
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
