'use client';

import { LibraryFlashcard } from '@/components/LibraryFlashcard';
import { StudySession } from '@/components/StudySession';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const TECH_LABELS: Record<string, string> = {
  react: 'React',
  javascript: 'JavaScript',
  css: 'CSS',
};

export default function TechLibraryPage() {
  const { user } = useUser();
  const [isStudying, setIsStudying] = useState(false);
  const params = useParams();
  const router = useRouter();
  const slug = params?.category as string;
  const tech = TECH_LABELS[slug?.toLowerCase()] || slug;
  const flashcards = useQuery(api.flashcards.getAllFlashcards);

  const handleStartStudying = () => {
    setIsStudying(true);
  };

  const handleCompleteStudying = () => {
    setIsStudying(false);
  };

  if (!flashcards) {
    return <div>Loading...</div>;
  }

  const techCards = flashcards.filter(
    (card) => card.tech?.toLowerCase() === tech.toLowerCase(),
  );

  // Show study session if user is studying
  if (isStudying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-slate-900">FlashDeck</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  📚 Studying {tech} Topic
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
            studyMode="topic"
            topicName={tech}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          ← Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">{tech} Flashcards</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">
                Flashcard Collection
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({techCards.length} cards)
                </span>
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                Click on any flashcard to practice active recall - try to think
                of the answer before expanding!
              </p>
            </div>
            <Button
              onClick={handleStartStudying}
              className="bg-blue-600 hover:bg-blue-700"
            >
              📚 Study {tech}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {techCards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No flashcards for {tech} yet.</p>
            </div>
          ) : (
            <Accordion>
              {techCards.map((card) => (
                <LibraryFlashcard
                  key={card._id}
                  flashcard={card}
                  showProgress={false}
                />
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
