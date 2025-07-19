'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getDueFlashcards, recordAttempt } from '@/lib/flashcards';
import type { Flashcard } from '@/lib/types';
import { useEffect, useState } from 'react';
import { BasicFlashcard } from './flashcard/BasicFlashcard';
import { CodeSnippetFlashcard } from './flashcard/CodeSnippetFlashcard';
import { FillBlankFlashcard } from './flashcard/FillBlankFlashcard';
import { MultipleChoiceFlashcard } from './flashcard/MultipleChoiceFlashcard';
import { TrueFalseFlashcard } from './flashcard/TrueFalseFlashcard';

interface StudySessionProps {
  userId: string;
  onComplete: () => void;
}

const SUPPORTED_TYPES = [
  'basic',
  'multiple_choice',
  'multiple_answer',
  'true_false',
  'fill_blank',
  'code_snippet',
];

export function StudySession({ userId, onComplete }: StudySessionProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });

  useEffect(() => {
    loadFlashcards();
  }, []);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadFlashcards = async () => {
    try {
      const dueFlashcards = await getDueFlashcards();
      // Only include supported types
      const filtered = dueFlashcards.filter(
        (f: Flashcard) =>
          f.type?.name && SUPPORTED_TYPES.includes(f.type.name.toLowerCase()),
      );

      // Shuffle the flashcards for random order
      const shuffled = shuffleArray(filtered);

      setFlashcards(shuffled);
      setSessionStats((prev) => ({ ...prev, total: shuffled.length }));
    } catch (error) {
      console.error('Error loading flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (
    isCorrect: boolean,
    response: Record<string, unknown>,
    timeSpent: number,
  ) => {
    const currentFlashcard = flashcards[currentIndex];

    try {
      await recordAttempt(
        userId,
        currentFlashcard.id,
        isCorrect,
        response,
        timeSpent,
      );

      setSessionStats((prev) => ({
        ...prev,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      }));

      // Consistent timing for all card types - enough time to see feedback
      setTimeout(() => {
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Session complete
          onComplete();
        }
      }, 1000);
    } catch (error) {
      console.error('Error recording attempt:', {
        error,
        userId,
        flashcardId: currentFlashcard.id,
        isCorrect,
        response,
        timeSpent,
      });
      // Show user-friendly error message
      alert('Failed to record your answer. Please try again.');
    }
  };

  const renderFlashcard = () => {
    if (currentIndex >= flashcards.length) return null;
    const flashcard = flashcards[currentIndex];
    const options = flashcard.options || [];
    const typeName = flashcard.type?.name?.toLowerCase();
    switch (typeName) {
      case 'basic':
        return <BasicFlashcard flashcard={flashcard} onAnswer={handleAnswer} />;
      case 'multiple_choice':
        return (
          <MultipleChoiceFlashcard
            flashcard={flashcard}
            options={options}
            onAnswer={handleAnswer}
          />
        );
      case 'multiple_answer':
        return (
          <MultipleChoiceFlashcard
            flashcard={flashcard}
            options={options}
            onAnswer={handleAnswer}
          />
        );
      case 'true_false':
        return (
          <TrueFalseFlashcard flashcard={flashcard} onAnswer={handleAnswer} />
        );
      case 'fill_blank':
        return (
          <FillBlankFlashcard flashcard={flashcard} onAnswer={handleAnswer} />
        );
      case 'code_snippet':
        return (
          <CodeSnippetFlashcard flashcard={flashcard} onAnswer={handleAnswer} />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
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

  const progress = ((currentIndex + 1) / flashcards.length) * 100;
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
              Card {currentIndex + 1} of {flashcards.length}
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
