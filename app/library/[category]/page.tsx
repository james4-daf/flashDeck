'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CategoryPage() {
  const { user } = useUser();
  const params = useParams();
  const categoryName = decodeURIComponent(params.category as string);

  const flashcards = useQuery(api.flashcards.getFlashcardsByCategory, {
    category: categoryName,
  });

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
              <Link href="/library">
                <Button variant="outline" className="text-sm">
                  ← Library
                </Button>
              </Link>
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
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">{getCategoryIcon(categoryName)}</div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                {categoryName}
              </h2>
              <p className="text-slate-600">
                {flashcards?.length || 0} flashcard
                {flashcards?.length === 1 ? '' : 's'} in this category
              </p>
            </div>
          </div>

          {/* Breadcrumb */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/library"
                  className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-blue-600"
                >
                  <svg
                    className="w-3 h-3 mr-2.5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                  </svg>
                  Library
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 text-slate-400 mx-1"
                    aria-hidden="true"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-slate-500">
                    {categoryName}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {flashcards ? (
          flashcards.length > 0 ? (
            <div className="space-y-6">
              {/* Category Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Category Overview
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
                      {new Set(flashcards.map((card) => card.type)).size}
                    </p>
                    <p className="text-sm text-slate-600">Card Types</p>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center gap-1 mb-2">
                      {Array.from(
                        new Set(flashcards.map((card) => card.type)),
                      ).map((type) => (
                        <span
                          key={type}
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(type)}`}
                        >
                          {formatTypeName(type)}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-slate-600">Available Types</p>
                  </div>
                </div>
              </div>

              {/* Flashcard Grid */}
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-6">
                  All Cards
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {flashcards.map((card) => (
                    <Card
                      key={card._id}
                      className="hover:shadow-md transition-shadow border-slate-200 h-full"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                            {card.category}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(card.type)}`}
                          >
                            {formatTypeName(card.type)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <p className="font-medium text-slate-900 mb-3 line-clamp-3 flex-1">
                          {card.question}
                        </p>
                        <div className="text-xs text-slate-500 mt-auto">
                          {typeof card.answer === 'string'
                            ? `Answer: ${card.answer.substring(0, 50)}${card.answer.length > 50 ? '...' : ''}`
                            : `${card.answer.length} option${card.answer.length === 1 ? '' : 's'}`}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mb-4">
                  <div className="text-4xl mb-4">
                    {getCategoryIcon(categoryName)}
                  </div>
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
                  No flashcards in "{categoryName}"
                </h3>
                <p className="text-slate-600 mb-4">
                  This category doesn't have any flashcards yet.
                </p>
                <Link href="/library">
                  <Button>Back to Library</Button>
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
