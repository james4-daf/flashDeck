'use client';

import { StudySession } from '@/components/StudySession';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ListLibraryPage() {
  const params = useParams();
  const list = params?.list as string;
  const { user } = useUser();
  const router = useRouter();
  const [isStudying, setIsStudying] = useState(false);

  // Fetch flashcards for this list
  const flashcards = useQuery(api.flashcards.getFlashcardsByList, { list });
  // Fetch all user progress (could be optimized to just these cards)
  const userProgress = useQuery(api.userProgress.getAllUserProgress, {
    userId: user?.id || '',
  });

  const handleStartStudying = () => {
    setIsStudying(true);
  };

  const handleCompleteStudying = () => {
    setIsStudying(false);
  };

  if (isStudying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-slate-900">FlashDeck</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  📚 Studying {list.replace(/([a-z])([0-9])/g, '$1 $2')} List
                </span>
                <Button
                  variant="outline"
                  onClick={handleCompleteStudying}
                  className="text-sm"
                >
                  Exit Study Session
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StudySession
            userId={user?.id || ''}
            onComplete={handleCompleteStudying}
            studyMode="list"
            listName={list}
          />
        </main>
      </div>
    );
  }

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
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          ← Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">
          {list.replace(/([a-z])([0-9])/g, '$1 $2')} List
        </h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">Flashcards</CardTitle>
            <Button
              onClick={handleStartStudying}
              className="bg-blue-600 hover:bg-blue-700"
            >
              📚 Study List
            </Button>
          </div>
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
