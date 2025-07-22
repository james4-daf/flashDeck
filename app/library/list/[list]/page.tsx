'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';

export default function ListLibraryPage() {
  const params = useParams();
  const list = params?.list as string;
  const { user } = useUser();

  // Fetch flashcards for this list
  const flashcards = useQuery(api.flashcards.getFlashcardsByList, { list });
  // Fetch all user progress (could be optimized to just these cards)
  const userProgress = useQuery(api.userProgress.getAllUserProgress, {
    userId: user?.id || '',
  });

  if (!flashcards || !userProgress) {
    return <div>Loading...</div>;
  }

  // Map progress by flashcardId for quick lookup
  const progressMap = new Map(userProgress.map((p) => [p.flashcardId, p]));

  // Progress stats
  const total = flashcards.length;
  const completed = flashcards.filter((card) => {
    const progress = progressMap.get(card._id);
    return (
      progress &&
      progress.reviewCount > 0 &&
      progress.nextReviewDate > Date.now()
    );
  }).length;
  const due = total - completed;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl capitalize">
            {list.replace(/([a-z])([0-9])/g, '$1 $2')} Flashcards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex gap-8 text-sm text-slate-700">
            <div>
              <span className="font-bold text-lg">{total}</span> total
            </div>
            <div>
              <span className="font-bold text-lg text-blue-600">{due}</span> due
            </div>
            <div>
              <span className="font-bold text-lg text-green-600">
                {completed}
              </span>{' '}
              completed
            </div>
          </div>
          <p className="text-slate-700 mb-4">
            You have completed{' '}
            <span className="font-bold text-green-600">{completed}</span> out of{' '}
            <span className="font-bold">{total}</span> cards in this list.
          </p>
          {flashcards.length === 0 ? (
            <p className="text-slate-500">No flashcards in this list yet.</p>
          ) : (
            <ul className="space-y-2">
              {flashcards.map((card) => (
                <li key={card._id} className="p-4 border rounded bg-slate-50">
                  <div className="font-medium">{card.question}</div>
                  <div className="text-xs text-slate-500">
                    Type: {card.type} | Category: {card.category}
                  </div>
                  {progressMap.get(card._id) && (
                    <div className="text-xs mt-1">
                      Progress: {progressMap.get(card._id)?.reviewCount || 0}{' '}
                      reviews
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
