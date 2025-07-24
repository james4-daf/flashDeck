'use client';

import { LibraryFlashcard } from '@/components/LibraryFlashcard';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation';

const TECH_LABELS: Record<string, string> = {
  react: 'React',
  javascript: 'JavaScript',
  css: 'CSS',
};

export default function TechLibraryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.category as string;
  const tech = TECH_LABELS[slug?.toLowerCase()] || slug;
  const flashcards = useQuery(api.flashcards.getAllFlashcards);

  if (!flashcards) {
    return <div>Loading...</div>;
  }

  const techCards = flashcards.filter(
    (card) => card.tech?.toLowerCase() === tech.toLowerCase(),
  );

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
        <h1 className="text-2xl font-bold text-slate-900">{tech} Flashcards</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Flashcard Collection
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({techCards.length} cards)
            </span>
          </CardTitle>
          <p className="text-sm text-slate-600">
            Click on any flashcard to practice active recall - try to think of
            the answer before expanding!
          </p>
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
