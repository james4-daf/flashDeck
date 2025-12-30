'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownContent } from '@/components/MarkdownContent';
import type { ConvexFlashcard, FlashcardOption } from '@/lib/types';
import { celebrateCorrect, shakeAnimation } from '@/lib/animations';
import { getCategoryGradientOverlay, getCategoryBorderColor } from '@/lib/categoryGradients';
import { playAnswerSound } from '@/lib/utils';
import { motion } from 'framer-motion';
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
  hadPreviousIncorrect?: boolean;
}

export function MultipleChoiceFlashcard({
  flashcard,
  options,
  onAnswer,
  showingResult = false,
  cardStateInfo,
  hadPreviousIncorrect = false,
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

    // Play sound feedback and celebrate
    playAnswerSound(correct);
    // Only celebrate if they got it right AND had previously gotten it wrong
    if (correct && hadPreviousIncorrect) {
      celebrateCorrect();
    }

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card
        className={`w-full relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${getCategoryBorderColor(
          flashcard.category,
        )}`}
      >
        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 ${getCategoryGradientOverlay(
            flashcard.category,
          )} pointer-events-none`}
        />
        <CardHeader className="relative z-10">
          <div className="space-y-3">
            <CardTitle className="text-xl sm:text-2xl font-bold leading-tight text-slate-900">
              <MarkdownContent content={flashcard.question} inline />
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
        <CardContent className="space-y-4 relative z-10">
          <div className="space-y-3">
            {shuffledOptions.map((option, index) => {
              const isSelected = selectedAnswers.includes(option.id);
              const isCorrectOption = option.is_correct;
              const isWrongSelected =
                isSelected && !isCorrectOption && showingResult;

              return (
                <motion.button
                  key={option.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 100,
                    damping: 10,
                  }}
                  whileHover={
                    !showingResult && !pending
                      ? { scale: 1.02, y: -2 }
                      : {}
                  }
                  whileTap={!showingResult && !pending ? { scale: 0.98 } : {}}
                  onClick={() => handleSelectAnswer(option.id)}
                  disabled={showingResult || pending}
                  className={`w-full p-4 sm:p-5 border-2 rounded-xl text-left transition-all duration-200 flex items-start relative overflow-hidden group shadow-sm hover:shadow-md ${getOptionStyle(
                    option.id,
                  )}`}
                >
                  {/* Ripple effect on click */}
                  <motion.span
                    className="absolute inset-0 bg-black/10 rounded-xl"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={
                      isSelected && !showingResult
                        ? { scale: 1, opacity: [0.5, 0] }
                        : {}
                    }
                    transition={{ duration: 0.4 }}
                  />
                  {/* Shake animation for wrong answer */}
                  <motion.div
                    animate={isWrongSelected ? shakeAnimation : {}}
                    className="flex items-start w-full"
                  >
                    {getOptionIcon(option.id)}
                    <span className="text-base sm:text-lg font-medium relative z-10 leading-relaxed">
                      <MarkdownContent content={option.option_text} />
                    </span>
                  </motion.div>
                  {/* Success checkmark animation */}
                  {showingResult && isCorrectOption && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 10,
                        delay: index * 0.1,
                      }}
                      className="ml-auto text-green-600 text-xl"
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {!showingResult && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: shuffledOptions.length * 0.1 + 0.2 }}
            >
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswers.length === 0 || pending}
                className={`w-full transition-all duration-200 py-4 sm:py-5 text-base sm:text-lg font-semibold relative overflow-hidden ${
                  isCorrect === true
                    ? 'bg-green-500 text-white'
                    : isCorrect === false
                      ? 'bg-red-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ scale: 0 }}
                  animate={
                    isCorrect !== null
                      ? { scale: 1, opacity: [1, 0] }
                      : {}
                  }
                  transition={{ duration: 0.4 }}
                />
                <motion.span
                  className="relative z-10 flex items-center justify-center gap-2"
                  animate={
                    isCorrect === false ? shakeAnimation : {}
                  }
                >
                  {isCorrect === true && (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 10,
                      }}
                    >
                      ✓
                    </motion.span>
                  )}
                  {isCorrect === false && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 10,
                      }}
                    >
                      ✗
                    </motion.span>
                  )}
                  {isCorrect === true
                    ? 'Correct!'
                    : isCorrect === false
                      ? 'Incorrect'
                      : 'Submit Answer'}
                </motion.span>
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
