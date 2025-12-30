'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownContent } from '@/components/MarkdownContent';
import type { ConvexFlashcard } from '@/lib/types';
import { celebrateCorrect, shakeAnimation } from '@/lib/animations';
import { getCategoryGradientOverlay, getCategoryBorderColor } from '@/lib/categoryGradients';
import { playAnswerSound } from '@/lib/utils';
import { motion } from 'framer-motion';
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
  hadPreviousIncorrect?: boolean;
}

export function TrueFalseFlashcard({
  flashcard,
  onAnswer,
  showingResult = false,
  cardStateInfo,
  hadPreviousIncorrect = false,
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
    // Only celebrate if they got it right AND had previously gotten it wrong
    if (correct && hadPreviousIncorrect) {
      celebrateCorrect();
    }
    onAnswer(correct);
  };

  const correctAnswer =
    typeof flashcard.answer === 'string'
      ? flashcard.answer.toLowerCase() === 'true'
      : Boolean(flashcard.answer);
  const isWrong = selectedAnswer !== null && selectedAnswer !== correctAnswer;

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
          {!showingResult && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={() => handleAnswer(true)}
                  className={`w-full transition-all duration-200 py-4 sm:py-5 text-base sm:text-lg font-semibold relative overflow-hidden ${
                    selectedAnswer === true
                      ? 'bg-green-500 text-white'
                      : selectedAnswer === false
                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                        : 'bg-green-600 hover:bg-green-700'
                  }`}
                  disabled={showingResult}
                >
                  <motion.span
                    className="absolute inset-0 bg-white/20"
                    initial={{ scale: 0 }}
                    animate={
                      selectedAnswer === true
                        ? { scale: 1, opacity: [1, 0] }
                        : {}
                    }
                    transition={{ duration: 0.4 }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {selectedAnswer === true && (
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
                    True
                  </span>
                </Button>
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  className={`w-full transition-all duration-200 py-4 sm:py-5 text-base sm:text-lg font-semibold relative overflow-hidden ${
                    selectedAnswer === false
                      ? 'bg-red-500 text-white border-red-500'
                      : selectedAnswer === true
                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                        : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                  }`}
                  disabled={showingResult}
                >
                  <motion.span
                    animate={isWrong ? shakeAnimation : {}}
                    className="relative z-10 flex items-center justify-center gap-2"
                  >
                    {selectedAnswer === false && (
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
                    False
                  </motion.span>
                </Button>
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
