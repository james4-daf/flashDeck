'use client';

import { AppHeader } from '@/components/AppHeader';
import { LibraryFlashcard } from '@/components/LibraryFlashcard';
import { StudySession } from '@/components/StudySession';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ListLibraryPage() {
  const params = useParams();
  const list = params?.list as string;
  const { user } = useUser();
  const [isStudying, setIsStudying] = useState(false);

  // Fetch flashcards for this list
  const flashcards = useQuery(api.flashcards.getFlashcardsByList, { list });
  // Fetch all user progress (could be optimized to just these cards)
  const userProgress = useQuery(api.userProgress.getAllUserProgress, {
    userId: user?.id || '',
  });

  const handleStartStudying = () => {
    setIsStudying(true);
  };

  const handleCompleteStudying = () => {
    setIsStudying(false);
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
                  📚 Studying {list.replace(/([a-z])([0-9])/g, '$1 $2')} List
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
            studyMode="list"
            listName={list}
          />
        </main>
      </div>
    );
  }

  if (!flashcards || !userProgress) {
    return <div>Loading...</div>;
  }

  // Map progress by flashcardId for quick lookup
  const progressMap = new Map(userProgress.map((p) => [p.flashcardId, p]));

  // Progress stats
  const total = flashcards.length;
  const completed = flashcards.filter((card) => {
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
            {list.replace(/([a-z])([0-9])/g, '$1 $2')} List
          </h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  Flashcards
                  <span className="ml-2 text-xs sm:text-sm font-normal text-slate-500">
                    ({total} cards)
                  </span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-slate-600 mt-2">
                  Click on any flashcard to practice active recall - try to
                  think of the answer before expanding!
                </p>
              </div>
              <Button
                onClick={handleStartStudying}
                className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
              >
                📚 Study List
              </Button>
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
            <p className="text-slate-700 mb-4 sm:mb-6 text-sm sm:text-base">
              You have completed{' '}
              <span className="font-bold text-green-600">{completed}</span> out
              of <span className="font-bold">{total}</span> cards in this list.
            </p>

            {flashcards.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm sm:text-base">
                  No flashcards in this list yet.
                </p>
              </div>
            ) : (
              <Accordion>
                {flashcards.map((card) => {
                  const progress = progressMap.get(card._id);
                  const isCompleted =
                    progress &&
                    progress.reviewCount > 0 &&
                    progress.nextReviewDate > Date.now();

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
