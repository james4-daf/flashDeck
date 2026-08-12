'use client';

import { AppHeader } from '@/components/AppHeader';
import { DeckCard } from '@/components/DeckCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Authenticated, useQuery } from 'convex/react';
import Link from 'next/link';
import { useState } from 'react';

function CommunityContent() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const decks = useQuery(api.decks.getPublicDecks, {
    searchQuery: searchQuery || undefined,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Community Decks
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mb-6">
            Discover and upvote public flashcard decks created by the community.
          </p>

          {/* Search Input */}
          <div className="max-w-md">
            <Input
              type="text"
              placeholder="Search decks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Decks Grid */}
        {decks === undefined ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <Skeleton className="mb-2 h-6 w-2/3" />
                <Skeleton className="mb-4 h-4 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="mt-4 h-9 w-full" />
              </div>
            ))}
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg mb-4">
              {searchQuery
                ? 'No decks found matching your search.'
                : 'No public decks available yet. Be the first to create one!'}
            </p>
            {!searchQuery && (
              <Link href="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {decks.map((deck) => (
              <DeckCard
                key={deck._id}
                deckId={deck._id}
                name={deck.name}
                description={deck.description}
                upvoteCount={deck.upvoteCount}
                cardCount={deck.cardCount}
                createdBy={deck.createdBy}
                userId={user?.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Authenticated>
      <CommunityContent />
    </Authenticated>
  );
}
