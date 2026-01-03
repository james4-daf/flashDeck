'use client';

import { AppHeader } from '@/components/AppHeader';
import { LibraryFlashcard } from '@/components/LibraryFlashcard';
import { StudySession } from '@/components/StudySession';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import Link from 'next/link';
import { useState } from 'react';

interface TechLibraryContentProps {
  tech: string;
  flashcards: Doc<'flashcards'>[];
}

// Define the 5 beginner JavaScript categories
const JAVASCRIPT_BEGINNER_CATEGORIES = [
  'Variables, Data Types & Operators',
  'Functions & Scope Basics',
  'Arrays & Objects Fundamentals',
  'Control Flow & Loops',
  'DOM Manipulation Basics',
];

export function TechLibraryContent({
  tech,
  flashcards,
}: TechLibraryContentProps) {
  const { user } = useUser();
  const [isStudying, setIsStudying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get flashcards grouped by category for JavaScript beginner
  const groupedFlashcards = useQuery(
    api.flashcards.getFlashcardsByTechGroupedByCategory,
    tech.toLowerCase() === 'javascript' ? { tech: 'Javascript beginner' } : 'skip',
  );

  const isJavaScriptBeginner = tech.toLowerCase() === 'javascript' && groupedFlashcards !== undefined;

  const handleStartStudying = () => {
    setIsStudying(true);
  };

  const handleStartCategoryStudying = (category: string) => {
    setSelectedCategory(category);
    setIsStudying(true);
  };

  const handleCompleteStudying = () => {
    setIsStudying(false);
    setSelectedCategory(null);
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
                  📚 Studying {selectedCategory || tech}
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
          {selectedCategory ? (
            <StudySession
              userId={user?.id || ''}
              onComplete={handleCompleteStudying}
              studyMode="category"
              categoryName={selectedCategory}
            />
          ) : (
            <StudySession
              userId={user?.id || ''}
              onComplete={handleCompleteStudying}
              studyMode="topic"
              topicName={tech}
            />
          )}
        </main>
      </div>
    );
  }

  // Show categories/topics view for JavaScript beginner
  if (isJavaScriptBeginner && groupedFlashcards) {
    return (
      <>
        <AppHeader />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              JavaScript Beginner Topics
            </h1>
          </div>

          <p className="text-slate-600 text-sm sm:text-base">
            Explore JavaScript fundamentals organized by topic. Each topic contains flashcards to help you master the concepts.
          </p>

          {/* Categories/Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {JAVASCRIPT_BEGINNER_CATEGORIES.map((category) => {
              const categoryData = groupedFlashcards[category];
              const cardCount = categoryData?.count || 0;

              return (
                <Link
                  key={category}
                  href={`/library/category/${encodeURIComponent(category)}`}
                  className="group"
                >
                  <Card className="w-full hover:shadow-lg transition-all duration-200 border-slate-200 group-hover:border-blue-300 group-hover:scale-[1.02] cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl group-hover:text-blue-600 transition-colors">
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-slate-500 text-sm sm:text-base">
                          {cardCount} {cardCount === 1 ? 'flashcard' : 'flashcards'}
                        </div>
                        {cardCount > 0 && (
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              handleStartCategoryStudying(category);
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                          >
                            Study
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Show all flashcards if any exist */}
          {flashcards.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  All {tech} Flashcards
                  <span className="ml-2 text-xs sm:text-sm font-normal text-slate-500">
                    ({flashcards.length} cards)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion>
                  {flashcards.map((card) => (
                    <LibraryFlashcard
                      key={card._id}
                      flashcard={card}
                      showProgress={false}
                    />
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </main>
      </>
    );
  }

  // Default view for other techs
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
              {flashcards.length > 0 && (
                <Button
                  onClick={handleStartStudying}
                  className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                >
                  📚 Study {tech}
                </Button>
              )}
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
