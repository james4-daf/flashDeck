'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { UpgradeModal } from '@/components/UpgradeModal';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { ConvexFlashcard } from '@/lib/types';
import { pulseAnimation } from '@/lib/animations';
import { useMutation, useQuery } from 'convex/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { BasicFlashcard } from './flashcard/BasicFlashcard';
import { CodeSnippetFlashcard } from './flashcard/CodeSnippetFlashcard';
import { FillBlankFlashcard } from './flashcard/FillBlankFlashcard';
import { MultipleChoiceFlashcard } from './flashcard/MultipleChoiceFlashcard';
import { TrueFalseFlashcard } from './flashcard/TrueFalseFlashcard';

interface StudySessionProps {
  userId: string;
  onComplete: () => void;
  studyMode?: 'normal' | 'important' | 'list' | 'topic' | 'deck';
  listName?: string;
  topicName?: string;
  deckId?: string;
}

export function StudySession({
  userId,
  onComplete,
  studyMode = 'normal',
  listName,
  topicName,
  deckId,
}: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const [answered, setAnswered] = useState(false);
  const [, setLastCorrect] = useState<boolean | null>(null);
  const [answerHistory, setAnswerHistory] = useState<
    { card: ConvexFlashcard; isCorrect: boolean }[]
  >([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Use Convex queries and mutations - now with session filtering
  const dueFlashcards = useQuery(
    api.flashcards.getDueFlashcardsWithSessionFilter,
    { userId },
  );
  const importantFlashcards = useQuery(api.flashcards.getImportantFlashcards, {
    userId,
  });

  // Debug the list query parameters
  const listQueryArgs =
    studyMode === 'list' && listName ? { list: listName, userId } : 'skip';

  const listFlashcards = useQuery(
    api.flashcards.getFlashcardsByListForStudying,
    listQueryArgs,
  );

  // Topic study query parameters
  const topicQueryArgs =
    studyMode === 'topic' && topicName ? { tech: topicName, userId } : 'skip';

  const topicFlashcards = useQuery(
    api.flashcards.getFlashcardsByTechForStudying,
    topicQueryArgs,
  );

  // Deck study query parameters
  const deckQueryArgs =
    studyMode === 'deck' && deckId
      ? { deckId: deckId as Id<'decks'>, userId }
      : 'skip';

  const deckFlashcards = useQuery(
    api.decks.getDeckFlashcardsForStudying,
    deckQueryArgs,
  );
  const recordAttempt = useMutation(api.userProgress.recordAttempt);
  const recordSessionAttempt = useMutation(
    api.sessionAttempts.recordSessionAttempt,
  );
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

  // Track the current study mode to detect changes
  const prevStudyModeRef = useRef<{
    mode: string;
    list: string | undefined;
    topic: string | undefined;
    deck: string | undefined;
  }>({
    mode: studyMode,
    list: listName,
    topic: topicName,
    deck: deckId,
  });

  useEffect(() => {
    // Check if study mode, list, topic, or deck has changed
    const hasModeChanged =
      prevStudyModeRef.current.mode !== studyMode ||
      prevStudyModeRef.current.list !== listName ||
      prevStudyModeRef.current.topic !== topicName ||
      prevStudyModeRef.current.deck !== deckId;

    if (hasModeChanged) {
      // Reset session state when mode changes
      setShuffledCards([]);
      setCardsLocked(false);
      setCurrentIndex(0);
      setSessionStats({ correct: 0, incorrect: 0, total: 0 });
      setAnswered(false);
      setLastCorrect(null);
      setAnswerHistory([]);
      setShowSummary(false);

      // Update the ref
      prevStudyModeRef.current = {
        mode: studyMode,
        list: listName,
        topic: topicName,
        deck: deckId,
      };
      // Don't return early - continue to process cards if data is available
    }

    // Choose the appropriate flashcards based on study mode
    let flashcards;
    if (studyMode === 'important') {
      flashcards = importantFlashcards;
    } else if (studyMode === 'list') {
      // Only process if we have data from the query
      if (listFlashcards !== undefined) {
        // Extract just the flashcard data from the list query result
        flashcards = listFlashcards.map((item) => ({
          _id: item._id,
          _creationTime: item._creationTime,
          question: item.question,
          answer: item.answer,
          type: item.type,
          category: item.category,
          tech: item.tech,
          options: item.options,
          lists: item.lists,
        }));
      } else {
        // Still loading, don't process yet
        flashcards = undefined;
      }
    } else if (studyMode === 'topic') {
      // Only process if we have data from the query
      if (topicFlashcards !== undefined) {
        // Extract just the flashcard data from the topic query result
        flashcards = topicFlashcards.map((item) => ({
          _id: item._id,
          _creationTime: item._creationTime,
          question: item.question,
          answer: item.answer,
          type: item.type,
          category: item.category,
          tech: item.tech,
          options: item.options,
          lists: item.lists,
        }));
      } else {
        // Still loading, don't process yet
        flashcards = undefined;
      }
    } else if (studyMode === 'deck') {
      // Only process if we have data from the query
      if (deckFlashcards !== undefined) {
        // Extract just the flashcard data from the deck query result
        flashcards = deckFlashcards.map((item) => ({
          _id: item._id,
          _creationTime: item._creationTime,
          question: item.question,
          answer: item.answer,
          type: item.type,
          category: item.category,
          tech: item.tech,
          options: item.options,
          lists: item.lists,
          deckId: item.deckId,
        }));
      } else {
        // Still loading, don't process yet
        flashcards = undefined;
      }
    } else {
      flashcards = dueFlashcards;
    }

    if (flashcards !== undefined && !cardsLocked) {
      if (flashcards.length > 0) {
        const filtered = flashcards.filter(
          (card) =>
            card !== null &&
            [
              'basic',
              'multiple_choice',
              'true_false',
              'fill_blank',
              'code_snippet',
            ].includes(card.type),
        ) as ConvexFlashcard[];

        const shuffled = shuffleArray(filtered).slice(0, MAX_CARDS); // Limit to 12

        setShuffledCards(shuffled);
        setSessionStats((prev) => ({ ...prev, total: shuffled.length }));
        setCardsLocked(true); // Lock the cards for this session
      } else {
        // No flashcards found, but still lock the session to show empty state
        setShuffledCards([]);
        setSessionStats((prev) => ({ ...prev, total: 0 }));
        setCardsLocked(true);
      }
    }
  }, [
    dueFlashcards,
    importantFlashcards,
    listFlashcards,
    topicFlashcards,
    deckFlashcards,
    studyMode,
    listName,
    topicName,
    deckId,
    cardsLocked,
  ]);

  const handleAnswer = async (isCorrect: boolean) => {
    const currentCard = shuffledCards[currentIndex];
    if (!currentCard) return;

    try {
      // Record both the session attempt AND the progress update
      await Promise.all([
        recordSessionAttempt({
          userId,
          flashcardId: currentCard._id,
          isCorrect,
        }),
        recordAttempt({
          userId,
          flashcardId: currentCard._id,
          isCorrect,
        }),
      ]);

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
      const result = await markImportant({
        userId,
        flashcardId: currentCard._id,
        important,
      });

      // Check if limit was reached (returns error result instead of throwing)
      if (result && 'success' in result && !result.success) {
        if (result.error === 'FREE_LIMIT_REACHED') {
          setShowUpgradeModal(true);
        }
      }
    } catch (error) {
      // Only log unexpected errors
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
        <Card className="w-full max-w-2xl md:max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Session Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4 text-sm md:text-base">
              You&apos;ve completed all flashcards in this session.
            </p>
            <Button
              onClick={onComplete}
              className="w-full md:w-auto py-3 md:py-4 text-base md:text-lg"
            >
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
            <CardTitle className="text-lg sm:text-xl">
              Error Loading Flashcard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4 text-sm sm:text-base">
              There was an issue loading the current flashcard.
            </p>
            <Button
              onClick={onComplete}
              className="w-full py-3 sm:py-4 text-base sm:text-lg"
            >
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
            cardStateInfo={cardStateInfo}
            hadPreviousIncorrect={currentProgress?.lastCorrect === false}
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
            cardStateInfo={cardStateInfo}
            hadPreviousIncorrect={currentProgress?.lastCorrect === false}
          />
        );
      case 'true_false':
        return (
          <TrueFalseFlashcard
            flashcard={flashcard}
            onAnswer={handleAnswer}
            showingResult={answered}
            cardStateInfo={cardStateInfo}
            hadPreviousIncorrect={currentProgress?.lastCorrect === false}
          />
        );
      case 'fill_blank':
        return (
          <FillBlankFlashcard
            flashcard={flashcard}
            onAnswer={handleAnswer}
            showingResult={answered}
            cardStateInfo={cardStateInfo}
            hadPreviousIncorrect={currentProgress?.lastCorrect === false}
          />
        );
      case 'code_snippet':
        return (
          <CodeSnippetFlashcard
            flashcard={flashcard}
            onAnswer={handleAnswer}
            showingResult={answered}
            cardStateInfo={cardStateInfo}
            hadPreviousIncorrect={currentProgress?.lastCorrect === false}
          />
        );
      default:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Unsupported Flashcard Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4 text-sm sm:text-base">
                This flashcard type is not yet supported.
              </p>
              <Button
                onClick={handleNextCard}
                className="w-full py-3 sm:py-4 text-base sm:text-lg"
              >
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
      : studyMode === 'list'
        ? listFlashcards === undefined
        : studyMode === 'topic'
          ? topicFlashcards === undefined
          : dueFlashcards === undefined
  ) {
    return (
      <div className="flex items-center justify-center min-h-64 p-4">
        <div className="w-full max-w-2xl space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardContent>
          </Card>
          <div className="text-center">
            <p className="text-slate-600 text-sm sm:text-base px-4">
              {studyMode === 'list'
                ? `Loading flashcards for ${listName?.replace(/([a-z])([0-9])/g, '$1 $2')}...`
                : studyMode === 'topic'
                  ? `Loading flashcards for ${topicName}...`
                  : 'Loading flashcards...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Only show empty state if we have data but no cards after processing
  if (shuffledCards.length === 0 && cardsLocked) {
    let message = "You don't have any flashcards due for review right now.";
    let title = 'No flashcards available';

    if (studyMode === 'list') {
      title = 'No cards in this list';
      message = `No flashcards found in the "${listName?.replace(/([a-z])([0-9])/g, '$1 $2')}" list that are due for review.`;
    } else if (studyMode === 'important') {
      title = 'No important cards';
      message = "You haven't marked any flashcards as important yet.";
    } else if (studyMode === 'topic') {
      title = 'No cards in this topic';
      message = `No flashcards found for the "${topicName}" topic.`;
    }

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4 text-sm sm:text-base">{message}</p>
          <Button
            onClick={onComplete}
            className="w-full py-3 sm:py-4 text-base sm:text-lg"
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showSummary) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-4 sm:mt-8">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Session Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="font-semibold text-green-700 mb-2 text-sm sm:text-base">
              Correct Answers:
            </p>
            <ul className="mb-4 list-disc list-inside">
              {answerHistory.filter((a) => a.isCorrect).length === 0 && (
                <li className="text-slate-500 text-sm sm:text-base">None</li>
              )}
              {answerHistory
                .filter((a) => a.isCorrect)
                .map((a, i) => (
                  <li key={i} className="text-green-800 text-sm sm:text-base">
                    {a.card.question}
                  </li>
                ))}
            </ul>
            <p className="font-semibold text-red-700 mb-2 text-sm sm:text-base">
              Incorrect Answers:
            </p>
            <ul className="mb-4 list-disc list-inside">
              {answerHistory.filter((a) => !a.isCorrect).length === 0 && (
                <li className="text-slate-500 text-sm sm:text-base">None</li>
              )}
              {answerHistory
                .filter((a) => !a.isCorrect)
                .map((a, i) => (
                  <li key={i} className="text-red-800 text-sm sm:text-base">
                    {a.card.question}
                  </li>
                ))}
            </ul>
          </div>
          <Button
            onClick={onComplete}
            className="w-full py-3 sm:py-4 text-base sm:text-lg"
          >
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
          shortLabel: `Learning ${currentStep + 1}`,
          color: 'text-yellow-600',
          icon: '📚',
        };
      case 'review':
        return {
          label: `Review (${reviewCount} times)`,
          shortLabel: `Review ${reviewCount}`,
          color: 'text-green-600',
          icon: '✅',
        };
      case 'relearning':
        return {
          label: `Relearning (Step ${currentStep + 1})`,
          shortLabel: `Relearning ${currentStep + 1}`,
          color: 'text-orange-600',
          icon: '🔄',
        };
      default:
        return { label: 'Unknown', color: 'text-slate-600', icon: '❓' };
    }
  };

  const cardStateInfo = getCardStateInfo();

  return (
    <div className="relative h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] flex flex-col overflow-hidden">
      {/* Current Flashcard - Fits without scrolling */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col justify-center p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ x: 300, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -300, opacity: 0, scale: 0.9 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {renderFlashcard()}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Next Card Button */}
          {answered && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0 flex flex-col items-center mt-4 md:mt-6"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleNextCard} className="w-full md:w-48 relative overflow-hidden group">
                  <span className="relative z-10">Next Card</span>
                  <motion.span
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress Header - Fixed at Bottom (Mobile only) */}
      <div className="md:hidden flex-shrink-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="flex justify-center py-2">
          <div className="w-full max-w-2xl mx-auto px-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xs font-semibold text-slate-900">
                Study Session
              </h2>
              <motion.p
                key={accuracy}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-xs font-medium text-slate-900"
              >
                {accuracy}% accuracy
              </motion.p>
            </div>
            <motion.div
              animate={answered && sessionStats.correct > 0 ? pulseAnimation : undefined}
            >
              <Progress value={progress} className="w-full h-2" />
            </motion.div>
          </div>
        </div>
      </div>

      {showUpgradeModal && (
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
        />
      )}
    </div>
  );
}
