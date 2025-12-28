'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { UpgradeModal } from './UpgradeModal';

interface DeckCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeckCreated?: (deckId: Id<'decks'>) => void;
}

export function DeckCreationDialog({
  open,
  onOpenChange,
  onDeckCreated,
}: DeckCreationDialogProps) {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const createDeck = useMutation(api.decks.createDeck);
  const isPremium = useQuery(
    api.subscriptions.isPremium,
    user?.id ? { userId: user.id } : 'skip',
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setError(null);
    setLoading(true);

    try {
      const deckId = await createDeck({
        name: name.trim(),
        description: description.trim() || undefined,
        createdBy: user.id,
        isPublic,
      });

      // Reset form
      setName('');
      setDescription('');
      setIsPublic(false);
      onOpenChange(false);

      // Callback to handle navigation or other actions
      if (onDeckCreated) {
        onDeckCreated(deckId);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deck';
      setError(errorMessage);

      // If it's a limit error, show upgrade modal
      if (
        errorMessage.includes('FREE_LIMIT_REACHED') ||
        errorMessage.includes('FREE_FEATURE_LOCKED')
      ) {
        setShowUpgradeModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublicToggle = (value: boolean) => {
    if (value && !isPremium) {
      setError(
        'Public deck sharing is a Premium feature. Upgrade to Premium to share your decks!',
      );
      setShowUpgradeModal(true);
      return;
    }
    setIsPublic(value);
    setError(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
            <DialogDescription>
              Create a new flashcard deck to organize your study materials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="deck-name" className="text-sm font-medium">
                Deck Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="deck-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., JavaScript Basics"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="deck-description" className="text-sm font-medium">
                Description (optional)
              </label>
              <textarea
                id="deck-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this deck covers..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Visibility</label>
              <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => handlePublicToggle(false)}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    !isPublic
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  disabled={loading}
                >
                  Private
                </button>
                <button
                  type="button"
                  onClick={() => handlePublicToggle(true)}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    isPublic
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  disabled={loading}
                >
                  Public
                  {!isPremium && (
                    <span className="ml-1 text-xs text-blue-600">(Premium)</span>
                  )}
                </button>
              </div>
              {!isPremium && (
                <p className="text-xs text-slate-500">
                  Free users can create 1 private deck. Upgrade to Premium for
                  unlimited decks and public sharing.
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading ? 'Creating...' : 'Create Deck'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showUpgradeModal && (
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
        />
      )}
    </>
  );
}

