'use client';

import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

export default function LibraryPage() {
  const flashcards = useQuery(api.flashcards.getAllFlashcards);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Library</h1>

      {flashcards ? (
        <div className="p-4 bg-green-100 rounded">
          <p>Convex connected! Found {flashcards.length} flashcards</p>
          {flashcards.map((card) => (
            <div key={card._id} className="mt-2 p-2 bg-white rounded">
              <strong>{card.question}</strong>
            </div>
          ))}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
