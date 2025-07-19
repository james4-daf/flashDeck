'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Flashcard, FlashcardOption } from '@/lib/types';
import { useEffect, useState } from 'react';

interface MultipleChoiceFlashcardProps {
  flashcard: Flashcard;
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
  // Determine if this is a multi-select card
  const isMultiSelect =
    flashcard.type?.name?.toLowerCase() === 'multiple_answer';

  // State for single or multiple selection
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
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
    setSelectedAnswers([]);
    setShowResult(false);
    setPending(false);
    // Shuffle options for this flashcard
    setShuffledOptions(shuffleOptions(options));
  }, [flashcard.id, options]);

  // Handle selection
  const handleSelectAnswer = (optionId: string) => {
    if (isMultiSelect) {
      setSelectedAnswers((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      );
    } else {
      setSelectedAnswer(optionId);
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (isMultiSelect) {
      if (selectedAnswers.length === 0) return;
      setPending(true);
      setTimeout(() => {
        setShowResult(true);
        setPending(false);
      }, 800);
    } else {
      if (!selectedAnswer) return;
      setPending(true);
      setTimeout(() => {
        setShowResult(true);
        setPending(false);
      }, 800);
    }
  };

  // Handle next card
  const handleNextCard = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    if (isMultiSelect) {
      const correctOptions = options
        .filter((opt) => opt.is_correct)
        .map((opt) => opt.id);
      const isCorrect =
        selectedAnswers.length === correctOptions.length &&
        selectedAnswers.every((id) => correctOptions.includes(id));
      onAnswer(isCorrect, { selectedOptions: selectedAnswers }, timeSpent);
    } else {
      const correctOption = options.find((opt) => opt.is_correct);
      const isCorrect = selectedAnswer === correctOption?.id;
      onAnswer(isCorrect, { selectedOption: selectedAnswer }, timeSpent);
    }
  };

  // Option styling
  const getOptionStyle = (optionId: string) => {
    if (!showResult) {
      if (isMultiSelect) {
        return selectedAnswers.includes(optionId)
          ? 'bg-blue-100 border-blue-300'
          : 'bg-white hover:bg-slate-50';
      } else {
        return selectedAnswer === optionId
          ? 'bg-blue-100 border-blue-300'
          : 'bg-white hover:bg-slate-50';
      }
    }
    // Show correct/incorrect after submit - use original options for correctness
    const correctOptions = options
      .filter((opt) => opt.is_correct)
      .map((opt) => opt.id);
    if (correctOptions.includes(optionId)) {
      return 'bg-green-100 border-green-300 text-green-800';
    }
    if (
      (isMultiSelect &&
        selectedAnswers.includes(optionId) &&
        !correctOptions.includes(optionId)) ||
      (!isMultiSelect &&
        selectedAnswer === optionId &&
        !correctOptions.includes(optionId))
    ) {
      return 'bg-red-100 border-red-300 text-red-800';
    }
    return 'bg-slate-50 border-slate-200 text-slate-500';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">{flashcard.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {shuffledOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectAnswer(option.id)}
              className={`w-full p-4 text-left border rounded-lg transition-colors ${getOptionStyle(
                option.id,
              )}`}
            >
              {option.option_text}
            </button>
          ))}
        </div>

        {!showResult && (
          <Button
            onClick={handleSubmit}
            disabled={
              isMultiSelect
                ? selectedAnswers.length === 0
                : !selectedAnswer || pending
            }
            className="w-full cursor-pointer"
          >
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>
                Submitting...
              </span>
            ) : (
              'Submit Answer'
            )}
          </Button>
        )}

        {showResult && (
          <div className="p-4 bg-slate-50 rounded-lg border mb-2">
            <p className="text-sm text-slate-600">
              {flashcard.explanation || 'Check your answer above!'}
            </p>
          </div>
        )}

        {showResult && (
          <Button
            onClick={handleNextCard}
            className="w-full cursor-pointer mt-2"
          >
            Next Card
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
