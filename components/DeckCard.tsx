'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface DeckCardProps {
  deckId: Id<'decks'>;
  name: string;
  description?: string;
  upvoteCount: number;
  cardCount: number;
  createdBy: string;
  userId?: string;
}

export function DeckCard({
  deckId,
  name,
  description,
  upvoteCount,
  cardCount,
  createdBy,
  userId,
}: DeckCardProps) {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const upvoteDeck = useMutation(api.decks.upvoteDeck);
  const hasUpvoted = useQuery(
    api.decks.hasUserUpvoted,
    userId ? { deckId, userId } : 'skip',
  );

  const handleUpvote = async () => {
    if (!userId || isUpvoting) return;

    setIsUpvoting(true);
    try {
      await upvoteDeck({ deckId, userId });
    } catch (error) {
      console.error('Error upvoting deck:', error);
    } finally {
      setIsUpvoting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link href={`/library/deck/${deckId}`}>
              <CardTitle className="text-xl mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                {name}
              </CardTitle>
            </Link>
            {description && (
              <p className="text-slate-600 text-sm">{description}</p>
            )}
          </div>
          <Button
            variant={hasUpvoted ? 'default' : 'outline'}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              handleUpvote();
            }}
            disabled={!userId || isUpvoting}
            className="flex items-center gap-2 shrink-0"
          >
            <ThumbsUp
              className={`h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`}
            />
            <span>{upvoteCount}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <Link href={`/library/deck/${deckId}`} className="hover:text-blue-600 transition-colors">
            <span>{cardCount} card{cardCount !== 1 ? 's' : ''}</span>
          </Link>
          <span className="truncate ml-2">
            Created by {createdBy.slice(0, 8)}...
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

