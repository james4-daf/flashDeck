'use client';

import { AppHeader } from '@/components/AppHeader';
import { LibraryFlashcard } from '@/components/LibraryFlashcard';
import { StudySession } from '@/components/StudySession';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Doc } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

interface TechLibraryContentProps {
  tech: string;
  flashcards: Doc<'flashcards'>[];
}

export function TechLibraryContent({
  tech,
  flashcards,
}: TechLibraryContentProps) {
  const { user } = useUser();
  const [isStudying, setIsStudying] = useState(false);

  const handleStartStudying = () => {
    setIsStudying(true);
  };

  const handleCompleteStudying = () => {
    setIsStudying(false);
  };

  // Show study session if user is studying
  if (isStudying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AppHeader />
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end items-center h-12">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="hidden sm:inline text-sm text-slate-600">
                  📚 Studying {tech} Topic
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
            studyMode="topic"
            topicName={tech}
          />
        </main>
      </div>
    );
  }

  return (
    <>
      <AppHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {tech} Flashcards
          </h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  Flashcard Collection
                  <span className="ml-2 text-xs sm:text-sm font-normal text-slate-500">
                    ({flashcards.length} cards)
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
                📚 Study {tech}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {flashcards.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm sm:text-base">
                  No flashcards for {tech} yet.
                </p>
              </div>
            ) : (
              <Accordion>
                {flashcards.map((card) => (
                  <LibraryFlashcard
                    key={card._id}
                    flashcard={card}
                    showProgress={false}
                  />
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
