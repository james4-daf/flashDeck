'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConvexFlashcard, FlashcardOption } from '@/lib/types';
import { useEffect, useState } from 'react';

interface MultipleChoiceFlashcardProps {
  flashcard: ConvexFlashcard;
  options: FlashcardOption[];
  onAnswer: (isCorrect: boolean) => void;
}

export function MultipleChoiceFlashcard({
  flashcard,
  options,
  onAnswer,
}: MultipleChoiceFlashcardProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [pending, setPending] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<FlashcardOption[]>([]);

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
    setShowResult(false);
    setPending(false);
    if (options.length > 0) {
      setShuffledOptions(shuffleOptions(options));
    }
  }, [flashcard._id, options]);

  const handleSelectAnswer = (optionId: string) => {
    if (showResult || pending) return;

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
    const isCorrect = isMultipleAnswer
      ? selectedAnswers.length === correctOptionIds.length &&
        selectedAnswers.every((id) => correctOptionIds.includes(id)) &&
        correctOptionIds.every((id) => selectedAnswers.includes(id))
      : correctOptionIds.includes(selectedAnswers[0]);

    setShowResult(true);
    onAnswer(isCorrect);
  };

  const handleNextCard = () => {
    setSelectedAnswers([]);
    setShowResult(false);
    setPending(false);
  };

  const getOptionStyle = (optionId: string) => {
    const option = shuffledOptions.find((opt) => opt.id === optionId);
    const isSelected = selectedAnswers.includes(optionId);

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
        <CardTitle className="text-xl">{flashcard.question}</CardTitle>
        {isMultipleAnswer && !showResult && (
          <p className="text-sm text-slate-600 mt-2">
            Select all correct answers
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {shuffledOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectAnswer(option.id)}
              disabled={showResult || pending}
              className={`w-full p-4 text-left rounded-lg border-2 transition-colors flex items-start ${getOptionStyle(
                option.id,
              )}`}
            >
              {!showResult && getOptionIcon(option.id)}
              <div className="flex-1">
                <span className="font-medium">{option.option_text}</span>
                {showResult && option.is_correct && (
                  <span className="ml-2 text-green-600">✓ Correct</span>
                )}
                {showResult &&
                  selectedAnswers.includes(option.id) &&
                  !option.is_correct && (
                    <span className="ml-2 text-red-600">✗ Incorrect</span>
                  )}
              </div>
            </button>
          ))}
        </div>

        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswers.length === 0 || pending}
            className="w-full"
          >
            {pending ? 'Submitting...' : 'Submit Answer'}
          </Button>
        ) : (
          <div className="text-center pt-4">
            <p className="text-sm text-slate-600 mb-4">
              {isMultipleAnswer
                ? `Correct answers: ${shuffledOptions
                    .filter((opt) => opt.is_correct)
                    .map((opt) => opt.option_text)
                    .join(', ')}`
                : `Correct answer: ${shuffledOptions.find((opt) => opt.is_correct)?.option_text}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
