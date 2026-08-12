'use client';

import { AppHeader } from '@/components/AppHeader';
import { NoteEditor } from '@/components/notes/NoteEditor';
import type { Id } from '@/convex/_generated/dataModel';
import { Authenticated } from 'convex/react';
import { useParams } from 'next/navigation';

export default function NoteDetailPage() {
  return (
    <Authenticated>
      <NoteDetailContent />
    </Authenticated>
  );
}

function NoteDetailContent() {
  const params = useParams();
  const noteId = params?.noteId as Id<'userNotes'> | undefined;

  if (!noteId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AppHeader />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <p className="text-slate-600">Invalid note.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <NoteEditor noteId={noteId} />
      </main>
    </div>
  );
}
