'use client';

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
          <CardTitle className="text-xl">Flashcard Collection</CardTitle>
        </CardHeader>
        <CardContent>
          {techCards.length === 0 ? (
            <p className="text-slate-500">No flashcards for {tech} yet.</p>
          ) : (
            <ul className="space-y-2">
              {techCards.map((card) => (
                <li key={card._id} className="p-4 border rounded bg-slate-50">
                  <div className="font-medium">{card.question}</div>
                  <div className="text-xs text-slate-500">
                    Type: {card.type} | Category: {card.category}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
