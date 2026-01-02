'use client';

import { AppHeader } from '@/components/AppHeader';
import { DocumentUploadDialog } from '@/components/DocumentUploadDialog';
import { FlashcardCreationForm } from '@/components/FlashcardCreationForm';
import { LibraryFlashcard } from '@/components/LibraryFlashcard';
import { StudySession } from '@/components/StudySession';
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { Authenticated, useMutation, useQuery } from 'convex/react';
import { ArrowLeft, BookOpen, Plus, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function DeckDetailPage() {
  return (
    <Authenticated>
      <DeckDetailContent />
    </Authenticated>
  );
}

function DeckDetailContent() {
  const { user } = useUser();
  const params = useParams();
  const deckId = params?.deckId as Id<'decks'>;
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isStudying, setIsStudying] = useState(false);

  const deck = useQuery(api.decks.getDeck, deckId ? { deckId } : 'skip');
  const removeFlashcard = useMutation(api.decks.removeFlashcardFromDeck);

  const handleFlashcardCreated = () => {
    // Refresh will happen automatically via Convex real-time updates
    setShowCreateForm(false);
  };

  const handleRemoveFlashcard = async (
    flashcardId: Id<'flashcards'>,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !confirm(
        'Are you sure you want to remove this flashcard from the deck? This will not delete the flashcard, just remove it from this deck.',
      )
    ) {
      return;
    }

    try {
      await removeFlashcard({ flashcardId });
    } catch (error) {
      console.error('Error removing flashcard:', error);
      alert('Failed to remove flashcard. Please try again.');
    }
  };

  const handleStartStudying = () => {
    setIsStudying(true);
  };

  const handleCompleteStudying = () => {
    setIsStudying(false);
  };

  // Check if user owns this deck
  const isOwner = deck && user?.id && deck.createdBy === user.id;

  if (deck === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading deck...</p>
        </div>
      </div>
    );
  }

  if (deck === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Deck not found
            </h2>
            <Link href="/my-decks">
              <Button variant="outline">Back to My Decks</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Access Denied
            </h2>
            <p className="text-slate-600 mb-4">
              You don&apos;t have permission to view this deck.
            </p>
            <Link href="/my-decks">
              <Button variant="outline">Back to My Decks</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (isStudying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AppHeader />
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end items-center h-12">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="hidden sm:inline text-sm text-slate-600">
                  📚 Studying {deck.name}
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
            studyMode="deck"
            deckId={deckId}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <Link href="/my-decks">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Decks
            </Button>
          </Link>

          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                {deck.name}
              </h2>
              {deck.description && (
                <p className="text-slate-600 text-base sm:text-lg mb-4">
                  {deck.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>
                  {deck.flashcards.length} card
                  {deck.flashcards.length !== 1 ? 's' : ''}
                </span>
                {deck.isPublic && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    Public
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {deck.flashcards.length > 0 && (
                <Button
                  onClick={handleStartStudying}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Study Deck
                </Button>
              )}
              <Button
                onClick={() => setShowUploadDialog(true)}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
              <Button onClick={() => setShowCreateForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Flashcard
              </Button>
            </div>
          </div>
        </div>

        {deck.flashcards.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No flashcards yet
              </h3>
              <p className="text-slate-600 mb-6">
                Add your first flashcard to get started!
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Flashcard
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Flashcards ({deck.flashcards.length})
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {deck.flashcards.map((flashcard) => (
                <div key={flashcard._id} className="relative">
                  <LibraryFlashcard flashcard={flashcard} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4 h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Remove from deck"
                    onClick={(e) => handleRemoveFlashcard(flashcard._id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <FlashcardCreationForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        deckId={deckId}
        onFlashcardCreated={handleFlashcardCreated}
      />
      <DocumentUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        deckId={deckId}
        onFlashcardsCreated={handleFlashcardCreated}
      />
    </div>
  );
}
