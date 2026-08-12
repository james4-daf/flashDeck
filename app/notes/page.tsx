'use client';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Authenticated, useMutation, useQuery } from 'convex/react';
import { FileText, Plus } from 'lucide-react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotesPage() {
  return (
    <Authenticated>
      <NotesContent />
    </Authenticated>
  );
}

function NotesContent() {
  const { user } = useUser();
  const router = useRouter();
  const userId = user?.id ?? '';

  const notes = useQuery(
    api.userNotes.listForUser,
    userId ? { userId } : 'skip',
  );
  const createNote = useMutation(api.userNotes.create);

  const handleNew = async () => {
    if (!userId) return;
    const id = await createNote({ userId, title: 'Untitled note' });
    router.push(`/notes/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Notes</h1>
            <p className="text-slate-600 text-sm mt-1">
              Write study notes, highlight text to make flashcards, or use AI to draft cards from a note
              (Premium).
            </p>
          </div>
          <Button onClick={() => void handleNew()} disabled={!userId}>
            <Plus className="h-4 w-4 mr-2" />
            New note
          </Button>
        </div>

        {notes === undefined && (
          <ul className="space-y-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <Skeleton className="h-5 w-5 shrink-0 rounded" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {notes && notes.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">No notes yet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Create a note to capture ideas, lecture snippets, or pasted articles—then turn selections into
                deck cards or generate a batch with AI.
              </p>
              <Button onClick={() => void handleNew()}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first note
              </Button>
            </CardContent>
          </Card>
        )}

        {notes && notes.length > 0 && (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n._id}>
                <NextLink
                  href={`/notes/${n._id}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 hover:bg-slate-50/80 transition-colors"
                >
                  <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{n.title}</p>
                    <p className="text-xs text-slate-500">
                      Updated {new Date(n.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </NextLink>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
