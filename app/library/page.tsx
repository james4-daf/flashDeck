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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Flashcard Library
          </h2>
          <p className="text-slate-600">
            Browse all available flashcards in your collection.
          </p>
        </div>

        {flashcards ? (
          flashcards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {flashcards.map((card) => (
                <Card
                  key={card._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-slate-600 uppercase tracking-wide font-medium">
                        {card.category}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {card.type.replace('_', ' ')}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium text-slate-900 mb-3 line-clamp-3">
                      {card.question}
                    </p>
                    <div className="text-xs text-slate-500">
                      {typeof card.answer === 'string'
                        ? `Answer: ${card.answer.substring(0, 50)}${card.answer.length > 50 ? '...' : ''}`
                        : `${card.answer.length} option${card.answer.length === 1 ? '' : 's'}`}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
