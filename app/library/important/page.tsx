'use client';

import { AppHeader } from '@/components/AppHeader';
import { LibraryFlashcard } from '@/components/LibraryFlashcard';
import { StudySession } from '@/components/StudySession';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ImportantListPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isStudying, setIsStudying] = useState(false);

  // Fetch important flashcards
  const importantFlashcards = useQuery(
    api.flashcards.getImportantFlashcards,
    user?.id ? { userId: user.id } : 'skip',
  );

  // Fetch all user progress to get important status
  const userProgress = useQuery(api.userProgress.getAllUserProgress, {
    userId: user?.id || '',
  });

  const markImportant = useMutation(api.userProgress.markImportant);

  const handleStartStudying = () => {
    setIsStudying(true);
  };

  const handleCompleteStudying = () => {
    setIsStudying(false);
  };

  const handleToggleImportant = async (
    flashcardId: any, // Id<'flashcards'> type from Convex
    currentImportant: boolean,
  ) => {
    if (!user?.id) return;

    try {
      await markImportant({
        userId: user.id,
        flashcardId: flashcardId,
        important: !currentImportant,
      });
    } catch (error: any) {
      // Check if it's the free limit error
      if (error?.message?.includes('FREE_LIMIT_REACHED')) {
        alert('You have reached your free important cards limit (5 cards). Upgrade to Premium to mark unlimited cards as important!');
      } else {
        console.error('Error toggling important status:', error);
        alert('Failed to update important status. Please try again.');
      }
    }
  };

  if (isStudying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AppHeader />
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end items-center h-12">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="hidden sm:inline text-sm text-slate-600">
                  📌 Studying Important Cards
                </span>
                <Button
                  variant="outline"
                  onClick={handleCompleteStudying}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  Exit Study Session
                </Button>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <StudySession
            userId={user?.id || ''}
            onComplete={handleCompleteStudying}
            studyMode="important"
          />
        </main>
      </div>
    );
  }

  if (!importantFlashcards || !userProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading important flashcards...</p>
          </div>
        </main>
      </div>
    );
  }

  // Map progress by flashcardId for quick lookup
  const progressMap = new Map(userProgress.map((p) => [p.flashcardId, p]));

  // Progress stats
  const total = importantFlashcards.length;
  const completed = importantFlashcards.filter((card) => {
    const progress = progressMap.get(card._id);
    return (
      progress &&
      progress.reviewCount > 0 &&
      progress.nextReviewDate > Date.now()
    );
  }).length;
  const due = total - completed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            📌 Important Cards
          </h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  Important Flashcards
                  <span className="ml-2 text-xs sm:text-sm font-normal text-slate-500">
                    ({total} cards)
                  </span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-slate-600 mt-2">
                  Manage your important flashcards. Click on any flashcard to view details, or unmark it as important.
                </p>
              </div>
              {total > 0 && (
                <Button
                  onClick={handleStartStudying}
                  className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                >
                  📌 Study Important
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-4 sm:gap-8 text-xs sm:text-sm text-slate-700">
              <div>
                <span className="font-bold text-base sm:text-lg">{total}</span>{' '}
                total
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-blue-600">
                  {due}
                </span>{' '}
                due
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-green-600">
                  {completed}
                </span>{' '}
                completed
              </div>
            </div>

            {importantFlashcards.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm sm:text-base mb-4">
                  You haven't marked any flashcards as important yet.
                </p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Mark flashcards as important while studying to add them to this list.
                </p>
              </div>
            ) : (
              <Accordion>
                {importantFlashcards.map((card) => {
                  const progress = progressMap.get(card._id);
                  const isCompleted =
                    progress &&
                    progress.reviewCount > 0 &&
                    progress.nextReviewDate > Date.now();
                  const isImportant = progress?.important || false;

                  return (
                    <LibraryFlashcard
                      key={card._id}
                      flashcard={card}
                      showProgress={true}
                      progressInfo={{
                        reviewCount: progress?.reviewCount || 0,
                        isCompleted: !!isCompleted,
                        nextReviewDate: progress?.nextReviewDate,
                      }}
                      showImportantToggle={true}
                      isImportant={isImportant}
                      onToggleImportant={() => handleToggleImportant(card._id, isImportant)}
                    />
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

