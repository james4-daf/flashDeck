'use client';

import { AppHeader } from '@/components/AppHeader';
import { StudySession } from '@/components/StudySession';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import Link from 'next/link';
import { useState } from 'react';

const TECHS = [
  { name: 'React', slug: 'react' },
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'CSS', slug: 'css' },
];

export default function LibraryPage() {
  const { user } = useUser();
  const [isStudying, setIsStudying] = useState(false);
  const [selectedList, setSelectedList] = useState<string | undefined>(
    undefined,
  );

  const flashcards = useQuery(api.flashcards.getAllFlashcards);
  // Extract unique lists from all flashcards
  const allLists = Array.from(
    new Set((flashcards ?? []).flatMap((card) => card.lists ?? [])),
  );

  const handleStartStudying = (listName: string) => {
    setSelectedList(listName);
    setIsStudying(true);
  };

  const handleCompleteStudying = () => {
    setIsStudying(false);
    setSelectedList(undefined);
  };

  if (isStudying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <StudySession
            userId={user?.id || ''}
            onComplete={handleCompleteStudying}
            studyMode="list"
            listName={selectedList}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Flashcard Library
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Browse your flashcards by technology. Click on any card to explore
            the flashcards for that tech.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:gap-8">
          <Link href="/library/important" className="group">
            <Card className="w-full hover:shadow-lg transition-all duration-200 border-orange-200 group-hover:border-orange-400 group-hover:scale-[1.02] cursor-pointer bg-orange-50">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl group-hover:text-orange-600 transition-colors">
                  📌 Important Cards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-600 text-base sm:text-lg">
                  View and manage your important flashcards
                </div>
              </CardContent>
            </Card>
          </Link>
          {TECHS.map(({ name, slug }) => (
            <Link key={slug} href={`/library/${slug}`} className="group">
              <Card className="w-full hover:shadow-lg transition-all duration-200 border-slate-200 group-hover:border-blue-300 group-hover:scale-[1.02] cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl group-hover:text-blue-600 transition-colors">
                    {name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-500 text-base sm:text-lg">
                    View {name} flashcards
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Study by List Section */}
        {allLists.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
              Study by List
            </h3>
            <div className="flex flex-col gap-3 sm:gap-4">
              {allLists.map((list) => (
                <Card
                  key={list}
                  className="w-full hover:shadow-lg transition-all duration-200"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="capitalize font-medium text-slate-700 text-base sm:text-lg">
                        {list.replace(/([a-z])([0-9])/g, '$1 $2')}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleStartStudying(list)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          Study
                        </Button>
                        <Link href={`/library/list/${list}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm"
                          >
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Learning Guides Section */}
        <div className="mt-8 sm:mt-12">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
            Learning Guides
          </h3>
          <div className="flex flex-col gap-3 sm:gap-4">
            <Link href="/react/usestate" className="group">
              <Card className="w-full hover:shadow-lg transition-all duration-200 border-slate-200 group-hover:border-green-300 group-hover:scale-[1.02] cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl group-hover:text-green-600 transition-colors">
                    React useState Hook - Complete Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-500 text-sm sm:text-base">
                    Learn how to use the useState hook in React with examples
                    and practice flashcards
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
