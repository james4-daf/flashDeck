'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import Link from 'next/link';

export default function LibraryPage() {
  const { user } = useUser();
  const flashcards = useQuery(api.flashcards.getAllFlashcards);

  // Group flashcards by category and get category stats
  const categoryStats =
    flashcards?.reduce(
      (stats, card) => {
        const category = card.category;
        if (!stats[category]) {
          stats[category] = {
            name: category,
            totalCards: 0,
            types: new Set(),
          };
        }
        stats[category].totalCards++;
        stats[category].types.add(card.type);
        return stats;
      },
      {} as Record<
        string,
        { name: string; totalCards: number; types: Set<string> }
      >,
    ) || {};

  const categories = Object.values(categoryStats).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, string> = {
      Variables: '📝',
      'React Hooks': '⚛️',
      Arrays: '📊',
      Types: '🔤',
      'JavaScript Basics': '⚡',
      Functions: '🔧',
      Objects: '📦',
      Promises: '⏳',
      DOM: '🌐',
      ES6: '✨',
    };
    return iconMap[categoryName] || '📚';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'multiple_choice':
        return 'bg-green-100 text-green-800';
      case 'true_false':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatTypeName = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-slate-900">FlashDeck</h1>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" className="text-sm">
                  Dashboard
                </Button>
              </Link>
              {user && (
                <span className="text-sm text-slate-600">
                  {user.firstName || user.emailAddresses[0]?.emailAddress}
                </span>
              )}
              <SignOutButton>
                <button className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors text-sm">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Flashcard Library
          </h2>
          <p className="text-slate-600 text-lg">
            Browse your flashcards by category. Click on any category to explore
            the cards.
          </p>
        </div>

        {flashcards ? (
          flashcards.length > 0 ? (
            <div className="space-y-8">
              {/* Overview Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {flashcards.length}
                    </p>
                    <p className="text-sm text-slate-600">Total Cards</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {categories.length}
                    </p>
                    <p className="text-sm text-slate-600">Categories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {new Set(flashcards.map((card) => card.type)).size}
                    </p>
                    <p className="text-sm text-slate-600">Card Types</p>
                  </div>
                </div>
              </div>

              {/* Category Grid */}
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-6">
                  Categories
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={`/library/${encodeURIComponent(category.name)}`}
                      className="group"
                    >
                      <Card className="h-full hover:shadow-lg transition-all duration-200 border-slate-200 group-hover:border-blue-300 group-hover:scale-[1.02]">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="text-3xl">
                              {getCategoryIcon(category.name)}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-slate-900">
                                {category.totalCards}
                              </p>
                              <p className="text-xs text-slate-500">
                                card{category.totalCards === 1 ? '' : 's'}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardTitle className="text-lg mb-3 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </CardTitle>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {Array.from(category.types).map((type) => (
                              <span
                                key={type}
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(type)}`}
                              >
                                {formatTypeName(type)}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-sm text-slate-500">
                            <span>Explore cards</span>
                            <svg
                              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No flashcards found
                </h3>
                <p className="text-slate-600 mb-4">
                  Get started by creating some sample flashcards.
                </p>
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading flashcards...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
