'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConvexFlashcard, FlashcardOption } from '@/lib/types';
import { playAnswerSound } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface MultipleChoiceFlashcardProps {
  flashcard: ConvexFlashcard;
  options: FlashcardOption[];
  onAnswer: (isCorrect: boolean) => void;
  showingResult?: boolean;
  cardStateInfo?: {
    label: string;
    shortLabel?: string;
    color: string;
    icon: string;
  };
}

export function MultipleChoiceFlashcard({
  flashcard,
  options,
  onAnswer,
  showingResult = false,
  cardStateInfo,
}: MultipleChoiceFlashcardProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<FlashcardOption[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Determine if this is a multiple answer question (answer is array with multiple correct options)
  const isMultipleAnswer =
    Array.isArray(flashcard.answer) &&
    shuffledOptions.filter((opt) => opt.is_correct).length > 1;

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
    setSelectedAnswers([]);
    setPending(false);
    setIsCorrect(null);
    if (options.length > 0) {
      setShuffledOptions(shuffleOptions(options));
    }
  }, [flashcard._id, options]);

  const handleSelectAnswer = (optionId: string) => {
    if (showingResult || pending) return;

    if (isMultipleAnswer) {
      // Multiple selection - toggle the option
      setSelectedAnswers((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      );
    } else {
      // Single selection - replace the selection
      setSelectedAnswers([optionId]);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswers.length === 0 || pending) return;

    setPending(true);

    // Get correct option IDs
    const correctOptionIds = shuffledOptions
      .filter((opt) => opt.is_correct)
      .map((opt) => opt.id);

    // Check if answer is correct
    const correct = isMultipleAnswer
      ? selectedAnswers.length === correctOptionIds.length &&
        selectedAnswers.every((id) => correctOptionIds.includes(id)) &&
        correctOptionIds.every((id) => selectedAnswers.includes(id))
      : correctOptionIds.includes(selectedAnswers[0]);

    setIsCorrect(correct);

    // Play sound feedback
    playAnswerSound(correct);

    onAnswer(correct);
  };

  const getOptionStyle = (optionId: string) => {
    const option = shuffledOptions.find((opt) => opt.id === optionId);
    const isSelected = selectedAnswers.includes(optionId);

    if (!showingResult) {
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

  const getOptionIcon = (optionId: string) => {
    const isSelected = selectedAnswers.includes(optionId);

    if (isMultipleAnswer) {
      // Checkbox for multiple choice
      return (
        <div
          className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
            isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
          }`}
        >
          {isSelected && (
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      );
    } else {
      // Radio button for single choice
      return (
        <div
          className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${
            isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
          }`}
        >
          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      );
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
        <div className="space-y-3">
          {shuffledOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectAnswer(option.id)}
              disabled={showingResult || pending}
              className={`w-full p-3 sm:p-4 border-2 rounded-lg text-left transition-colors flex items-start ${getOptionStyle(
                option.id,
              )}`}
            >
              {getOptionIcon(option.id)}
              <span className="text-sm sm:text-base">{option.option_text}</span>
            </button>
          ))}
        </div>

        {!showingResult && (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswers.length === 0 || pending}
            className={`w-full transition-all duration-200 py-3 sm:py-4 text-base sm:text-lg ${
              isCorrect === true
                ? 'bg-green-500 text-white scale-105'
                : isCorrect === false
                  ? 'bg-red-500 text-white scale-105'
                  : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isCorrect === true
              ? '✓ Correct!'
              : isCorrect === false
                ? '✗ Incorrect'
                : 'Submit Answer'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
