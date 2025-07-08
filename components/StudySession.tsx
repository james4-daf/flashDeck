'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getDueFlashcards, recordAttempt } from '@/lib/flashcards';
import type { Flashcard } from '@/lib/types';
import { useEffect, useState } from 'react';
import { BasicFlashcard } from './flashcard/BasicFlashcard';
import { CodeSnippetFlashcard } from './flashcard/CodeSnippetFlashcard';
import { MultipleChoiceFlashcard } from './flashcard/MultipleChoiceFlashcard';

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

  const loadFlashcards = async () => {
    try {
      const dueFlashcards = await getDueFlashcards();
      // Only include supported types
      const filtered = dueFlashcards.filter(
        (f: Flashcard) =>
          f.type?.name && SUPPORTED_TYPES.includes(f.type.name.toLowerCase()),
      );
      setFlashcards(filtered);
      setSessionStats((prev) => ({ ...prev, total: filtered.length }));

      // Debug: Log the options for each flashcard
      console.log(
        'Loaded flashcards:',
        filtered.map((f) => ({
          id: f.id,
          question: f.question,
          type: f.type?.name,
          options: f.options,
        })),
      );
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

      // Move to next flashcard
      setTimeout(() => {
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Session complete
          onComplete();
        }
      }, 500);
    } catch (error) {
      console.error('Error recording attempt:', error);
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
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">{flashcard.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={() =>
                    handleAnswer(
                      flashcard.answer.answer === true,
                      { userAnswer: true },
                      0,
                    )
                  }
                  className="flex-1 cursor-pointer"
                >
                  True
                </Button>
                <Button
                  onClick={() =>
                    handleAnswer(
                      flashcard.answer.answer === false,
                      { userAnswer: false },
                      0,
                    )
                  }
                  className="flex-1 cursor-pointer"
                >
                  False
                </Button>
              </div>
            </CardContent>
          </Card>
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

interface FillBlankFlashcardProps {
  flashcard: Flashcard;
  onAnswer: (
    isCorrect: boolean,
    response: Record<string, unknown>,
    timeSpent: number,
  ) => void;
}

function FillBlankFlashcard({ flashcard, onAnswer }: FillBlankFlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime] = useState(Date.now());

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = (isCorrect: boolean) => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    onAnswer(
      isCorrect,
      { userAnswer: isCorrect ? 'correct' : 'incorrect' },
      timeSpent,
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">{flashcard.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showAnswer ? (
          <Button onClick={handleShowAnswer} className="w-full cursor-pointer">
            Show Answer
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="font-medium text-slate-900">
                {flashcard.answer.answer}
              </p>
              {flashcard.explanation && (
                <p className="text-sm text-slate-600 mt-2">
                  {flashcard.explanation}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => handleAnswer(false)}
                className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 cursor-pointer"
              >
                Incorrect
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
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
