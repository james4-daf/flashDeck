'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/convex/_generated/api';
import type { ConvexFlashcard } from '@/lib/types';
import { useMutation, useQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import { BasicFlashcard } from './flashcard/BasicFlashcard';
import { MultipleChoiceFlashcard } from './flashcard/MultipleChoiceFlashcard';
import { TrueFalseFlashcard } from './flashcard/TrueFalseFlashcard';

interface StudySessionProps {
  userId: string;
  onComplete: () => void;
  studyMode?: 'normal' | 'important';
}

export function StudySession({
  userId,
  onComplete,
  studyMode = 'normal',
}: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [answerHistory, setAnswerHistory] = useState<
    { card: ConvexFlashcard; isCorrect: boolean }[]
  >([]);
  const [showSummary, setShowSummary] = useState(false);

  // Use Convex queries and mutations
  const dueFlashcards = useQuery(api.flashcards.getDueFlashcards, { userId });
  const importantFlashcards = useQuery(api.flashcards.getImportantFlashcards, {
    userId,
  });
  const userProgress = useQuery(api.userProgress.getAllUserProgress, {
    userId,
  });
  const recordAttempt = useMutation(api.userProgress.recordAttempt);
  const markImportant = useMutation(api.userProgress.markImportant);

  // Get current card's progress to show state
  const [shuffledCards, setShuffledCards] = useState<ConvexFlashcard[]>([]);
  const [cardsLocked, setCardsLocked] = useState(false);
  const currentCard = shuffledCards[currentIndex];
  const currentProgress = useQuery(
    api.userProgress.getUserProgress,
    currentCard ? { userId, flashcardId: currentCard._id } : 'skip',
  );

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const MAX_CARDS = 12;

  useEffect(() => {
    // Choose the appropriate flashcards based on study mode
    const flashcards =
      studyMode === 'important' ? importantFlashcards : dueFlashcards;

    if (flashcards && !cardsLocked) {
      const filtered = flashcards.filter(
        (card): card is ConvexFlashcard =>
          card !== null &&
          ['basic', 'multiple_choice', 'true_false'].includes(card.type),
      );

      const shuffled = shuffleArray(filtered).slice(0, MAX_CARDS); // Limit to 12
      setShuffledCards(shuffled);
      setSessionStats((prev) => ({ ...prev, total: shuffled.length }));
      setCardsLocked(true); // Lock the cards for this session
    }
  }, [dueFlashcards, importantFlashcards, cardsLocked, studyMode]);

  const handleAnswer = async (isCorrect: boolean) => {
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

      setAnswerHistory((prev) => [...prev, { card: currentCard, isCorrect }]);

      setAnswered(true);
      setLastCorrect(isCorrect);
      // Do NOT move to next card yet
    } catch (error) {
      console.error('Error recording attempt:', error);
    }
  };

  const handleMarkImportant = async (important: boolean) => {
    const currentCard = shuffledCards[currentIndex];
    if (!currentCard) return;

    try {
      await markImportant({
        userId,
        flashcardId: currentCard._id,
        important,
      });
    } catch (error) {
      console.error('Error marking as important:', error);
    }
  };

  const handleNextCard = () => {
    if (currentIndex + 1 >= shuffledCards.length) {
      setShowSummary(true); // Show summary instead of going to dashboard
    } else {
      setCurrentIndex((prev) => prev + 1);
      setAnswered(false);
      setLastCorrect(null);
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
              You&apos;ve completed all flashcards in this session.
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

    // Determine if we should show the important button
    const shouldShowImportantButton = answered;

    switch (flashcard.type) {
      case 'basic':
        return (
          <BasicFlashcard
            flashcard={flashcard}
            onAnswer={handleAnswer}
            showingResult={answered}
            onMarkImportant={handleMarkImportant}
            showImportantButton={shouldShowImportantButton}
            isImportant={!!currentProgress?.important}
          />
        );
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
                created_at: new Date().toISOString(),
              })) || []
            }
            onAnswer={handleAnswer}
            showingResult={answered}
          />
        );
      case 'true_false':
        return (
          <TrueFalseFlashcard
            flashcard={flashcard}
            onAnswer={handleAnswer}
            showingResult={answered}
          />
        );
      default:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Unsupported Flashcard Type</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                This flashcard type is not yet supported.
              </p>
              <Button onClick={handleNextCard} className="w-full">
                Skip Card
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  if (
    studyMode === 'important'
      ? importantFlashcards === undefined
      : dueFlashcards === undefined
  ) {
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

  if (showSummary) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="font-semibold text-green-700 mb-2">
              Correct Answers:
            </p>
            <ul className="mb-4 list-disc list-inside">
              {answerHistory.filter((a) => a.isCorrect).length === 0 && (
                <li className="text-slate-500">None</li>
              )}
              {answerHistory
                .filter((a) => a.isCorrect)
                .map((a, i) => (
                  <li key={i} className="text-green-800">
                    {a.card.question}
                  </li>
                ))}
            </ul>
            <p className="font-semibold text-red-700 mb-2">
              Incorrect Answers:
            </p>
            <ul className="mb-4 list-disc list-inside">
              {answerHistory.filter((a) => !a.isCorrect).length === 0 && (
                <li className="text-slate-500">None</li>
              )}
              {answerHistory
                .filter((a) => !a.isCorrect)
                .map((a, i) => (
                  <li key={i} className="text-red-800">
                    {a.card.question}
                  </li>
                ))}
            </ul>
          </div>
          <Button onClick={onComplete} className="w-full">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Handle out-of-bounds index for progress display
  const answeredCount = answerHistory.length;
  const progress = (answeredCount / shuffledCards.length) * 100;
  const accuracy =
    answeredCount > 0
      ? Math.round((sessionStats.correct / answeredCount) * 100)
      : 0;

  const getCardStateInfo = () => {
    if (!currentProgress) {
      return { label: 'New', color: 'text-blue-600', icon: '🆕' };
    }

    // Handle migration - existing records might not have state field
    const state = currentProgress.state || 'review';
    const currentStep = currentProgress.currentStep ?? 0;
    const reviewCount = currentProgress.reviewCount || 0;

    switch (state) {
      case 'new':
        return { label: 'New', color: 'text-blue-600', icon: '🆕' };
      case 'learning':
        return {
          label: `Learning (Step ${currentStep + 1})`,
          color: 'text-yellow-600',
          icon: '📚',
        };
      case 'review':
        return {
          label: `Review (${reviewCount} times)`,
          color: 'text-green-600',
          icon: '✅',
        };
      case 'relearning':
        return {
          label: `Relearning (Step ${currentStep + 1})`,
          color: 'text-orange-600',
          icon: '🔄',
        };
      default:
        return { label: 'Unknown', color: 'text-slate-600', icon: '❓' };
    }
  };

  const cardStateInfo = getCardStateInfo();

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Study Session
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium ${cardStateInfo.color}`}>
                {cardStateInfo.icon} {cardStateInfo.label}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">
              {accuracy}% accuracy
            </p>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Current Flashcard */}
      {renderFlashcard()}

      {/* Feedback and Next Card Button */}
      {answered && (
        <div className="flex flex-col items-center mt-4">
          <div
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium mb-4 ${
              lastCorrect
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {lastCorrect ? '✅ Correct!' : '❌ Incorrect'}
          </div>
          <Button onClick={handleNextCard} className="w-48">
            Next Card
          </Button>
        </div>
      )}
    </div>
  );
}
