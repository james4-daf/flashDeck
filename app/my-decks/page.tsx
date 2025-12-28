'use client';

import { AppHeader } from '@/components/AppHeader';
import { DeckCreationDialog } from '@/components/DeckCreationDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { Authenticated, useMutation, useQuery } from 'convex/react';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MyDecksPage() {
  return (
    <Authenticated>
      <MyDecksContent />
    </Authenticated>
  );
}

function MyDecksContent() {
  const { user } = useUser();
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const decks = useQuery(
    api.decks.getUserDecks,
    user?.id ? { userId: user.id } : 'skip',
  );
  const deleteDeck = useMutation(api.decks.deleteDeck);

  const handleDeckCreated = (deckId: Id<'decks'>) => {
    router.push(`/my-decks/${deckId}`);
  };

  const handleDeleteDeck = async (deckId: Id<'decks'>, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !confirm(
        'Are you sure you want to delete this deck? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      await deleteDeck({ deckId });
    } catch (error) {
      console.error('Error deleting deck:', error);
      alert('Failed to delete deck. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              My Decks
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Create and manage your custom flashcard decks.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Deck
          </Button>
        </div>

        {decks === undefined ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your decks...</p>
            </div>
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No decks yet
              </h3>
              <p className="text-slate-600 mb-6">
                Create your first deck to start organizing your flashcards!
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Deck
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {decks.map((deck) => (
              <Card
                key={deck._id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/my-decks/${deck._id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {deck.name}
                      </CardTitle>
                      {deck.description && (
                        <p className="text-slate-600 text-sm line-clamp-2">
                          {deck.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {deck.isPublic && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="View deck"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/my-decks/${deck._id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete deck"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDeck(deck._id, e);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <DeckCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onDeckCreated={handleDeckCreated}
      />
    </div>
  );
}
