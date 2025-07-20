'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { ConvexFlashcard } from '@/lib/types';
import { useMutation, useQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import { BasicFlashcard } from './flashcard/BasicFlashcard';
import { MultipleChoiceFlashcard } from './flashcard/MultipleChoiceFlashcard';
import { TrueFalseFlashcard } from './flashcard/TrueFalseFlashcard';

interface StudySessionProps {
  userId: string;
  onComplete: () => void;
}

export function StudySession({ userId, onComplete }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });

  // Use Convex queries and mutations
  const dueFlashcards = useQuery(api.flashcards.getDueFlashcards, { userId });
  const recordAttempt = useMutation(api.userProgress.recordAttempt);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [shuffledCards, setShuffledCards] = useState<ConvexFlashcard[]>([]);

  useEffect(() => {
    if (dueFlashcards) {
      const filtered = dueFlashcards.filter(
        (card): card is ConvexFlashcard =>
          card !== null &&
          ['basic', 'multiple_choice', 'true_false'].includes(card.type),
      );
      const shuffled = shuffleArray(filtered);
      setShuffledCards(shuffled);
      setSessionStats((prev) => ({ ...prev, total: shuffled.length }));
    }
  }, [dueFlashcards]);

  const handleAnswer = async (
    isCorrect: boolean,
    response: Record<string, unknown>,
    timeSpent: number,
  ) => {
    const currentCard = shuffledCards[currentIndex];
    if (!currentCard) return;

    try {
      await recordAttempt({
        userId,
        flashcardId: currentCard._id,
        isCorrect,
      });

      setSessionStats((prev) => ({
        ...prev,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      }));

      // Move to next card or complete session
      if (currentIndex + 1 >= shuffledCards.length) {
        onComplete();
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error recording attempt:', error);
    }
  };

  const renderFlashcard = () => {
    if (currentIndex >= shuffledCards.length) {
      // We're out of bounds - this shouldn't happen, but if it does, show completion
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Session Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              You've completed all flashcards in this session.
            </p>
            <Button onClick={onComplete} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      );
    }

    const flashcard = shuffledCards[currentIndex];
    if (!flashcard) {
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Error Loading Flashcard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              There was an issue loading the current flashcard.
            </p>
            <Button onClick={onComplete} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      );
    }

    switch (flashcard.type) {
      case 'basic':
        return <BasicFlashcard flashcard={flashcard} onAnswer={handleAnswer} />;
      case 'multiple_choice':
        return (
          <MultipleChoiceFlashcard
            flashcard={flashcard}
            options={
              flashcard.options?.map((option, index) => ({
                id: index.toString(),
                flashcard_id: flashcard._id,
                option_text: option,
                is_correct: Array.isArray(flashcard.answer)
                  ? flashcard.answer.includes(option)
                  : flashcard.answer === option,
                order_index: index,
                created_at: '',
              })) || []
            }
            onAnswer={handleAnswer}
          />
        );
      case 'true_false':
        return (
          <TrueFalseFlashcard flashcard={flashcard} onAnswer={handleAnswer} />
        );
      default:
        return null;
    }
  };

  if (dueFlashcards === undefined) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (shuffledCards.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>No flashcards available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            You don&apos;t have any flashcards due for review right now.
          </p>
          <Button onClick={onComplete}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    );
  }

  // Handle out-of-bounds index for progress display
  const displayIndex = Math.min(currentIndex + 1, shuffledCards.length);
  const progress = (displayIndex / shuffledCards.length) * 100;
  const accuracy =
    sessionStats.total > 0
      ? Math.round((sessionStats.correct / sessionStats.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Study Session
            </h2>
            <p className="text-sm text-slate-600">
              Card {displayIndex} of {shuffledCards.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">
              {accuracy}% Accuracy
            </p>
            <p className="text-xs text-slate-600">
              {sessionStats.correct} correct, {sessionStats.incorrect} incorrect
            </p>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Current Flashcard */}
      {renderFlashcard()}
    </div>
  );
}
