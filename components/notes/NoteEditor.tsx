'use client';

import { UpgradeModal } from '@/components/UpgradeModal';
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
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import type { Content } from '@tiptap/core';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Sparkles,
  Strikethrough,
  Trash2,
  Underline as UnderlineIcon,
} from 'lucide-react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type NoteEditorProps = {
  noteId: Id<'userNotes'>;
};

type GeneratedCard = {
  question: string;
  answer: string;
  category?: string;
  tech?: string;
};

function parseNoteContent(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    };
  }
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const { user } = useUser();
  const router = useRouter();
  const userId = user?.id ?? '';

  const note = useQuery(
    api.userNotes.get,
    userId ? { noteId, userId } : 'skip',
  );
  const decks = useQuery(
    api.decks.getUserDecks,
    userId ? { userId } : 'skip',
  );

  const updateNote = useMutation(api.userNotes.update);
  const removeNote = useMutation(api.userNotes.remove);
  const createFlashcard = useMutation(api.flashcards.createFlashcard);

  const [title, setTitle] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [deckId, setDeckId] = useState<Id<'decks'> | ''>('');
  const [maxCards, setMaxCards] = useState(10);

  const [selectionOpen, setSelectionOpen] = useState(false);
  const [selectionAnswer, setSelectionAnswer] = useState('');
  const [selectionQuestion, setSelectionQuestion] = useState('');

  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [pageError, setPageError] = useState<string | null>(null);

  const loadedForNoteRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateNoteRef = useRef(updateNote);
  const userIdRef = useRef(userId);
  updateNoteRef.current = updateNote;
  userIdRef.current = userId;

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
        }),
        Placeholder.configure({
          placeholder: 'Write or paste your notes. Select text to turn it into a flashcard.',
        }),
        Underline,
        TiptapLink.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-600 underline underline-offset-2',
          },
        }),
      ],
      editorProps: {
        attributes: {
          class:
            'tiptap-editor prose prose-slate max-w-none min-h-[280px] px-4 py-3 focus:outline-none',
        },
      },
      onUpdate: ({ editor: ed }) => {
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }
        setSaveState('saving');
        saveTimerRef.current = setTimeout(() => {
          const json = JSON.stringify(ed.getJSON());
          const uid = userIdRef.current;
          if (!uid) return;
          updateNoteRef
            .current({ noteId, userId: uid, contentJson: json })
            .then(() => {
              setSaveState('saved');
              setTimeout(() => setSaveState('idle'), 1500);
            })
            .catch((e: Error) => {
              setPageError(e.message);
              setSaveState('idle');
            });
        }, 900);
      },
    },
    [noteId],
  );

  useEffect(() => {
    if (!note || !editor) return;
    if (loadedForNoteRef.current === note._id) return;
    editor.commands.setContent(parseNoteContent(note.contentJson) as Content, {
      emitUpdate: false,
    });
    setTitle(note.title);
    loadedForNoteRef.current = note._id;
  }, [note, editor]);

  useEffect(() => {
    loadedForNoteRef.current = null;
  }, [noteId]);

  useEffect(() => {
    if (decks && decks.length > 0 && deckId === '') {
      setDeckId(decks[0]._id);
    }
  }, [decks, deckId]);

  const saveTitle = useCallback(async () => {
    if (!userId || !note) return;
    const trimmed = title.trim() || 'Untitled note';
    if (trimmed === note.title) return;
    try {
      await updateNote({ noteId, userId, title: trimmed });
    } catch (e: unknown) {
      setPageError(e instanceof Error ? e.message : 'Failed to save title');
    }
  }, [userId, note, title, noteId, updateNote]);

  const openFlashcardFromSelection = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;
    const text = editor.state.doc.textBetween(from, to, ' ').trim();
    if (!text) return;
    setSelectionAnswer(text);
    setSelectionQuestion('');
    setSelectionOpen(true);
  }, [editor]);

  const handleCreateFromSelection = async () => {
    if (!userId || !deckId || !selectionQuestion.trim()) {
      setPageError('Choose a deck and enter a question.');
      return;
    }
    setPageError(null);
    try {
      await createFlashcard({
        question: selectionQuestion.trim(),
        answer: selectionAnswer.trim(),
        type: 'basic',
        category: 'Notes',
        deckId,
        userId,
      });
      setSelectionOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create card';
      setPageError(msg);
      if (msg.includes('FREE_LIMIT_REACHED')) {
        setShowUpgrade(true);
      }
    }
  };

  const handleAiGenerate = async () => {
    if (!user?.id || !editor) return;
    setAiError(null);
    setGeneratedCards([]);
    const text = editor.getText().trim();
    if (text.length < 20) {
      setAiError('Add more text to your note first.');
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/note-to-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, maxCards }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.error === 'PREMIUM_FEATURE') {
          setShowUpgrade(true);
          setAiError(data.message);
          return;
        }
        throw new Error(data.message || 'Generation failed');
      }
      if (data.success && data.flashcards) {
        setGeneratedCards(data.flashcards);
      }
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : 'Failed to generate');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveGenerated = async () => {
    if (!userId || !deckId || generatedCards.length === 0) return;
    setAiError(null);
    try {
      for (const card of generatedCards) {
        await createFlashcard({
          question: card.question,
          answer: card.answer,
          type: 'basic',
          category: card.category || 'Notes',
          tech: card.tech,
          deckId,
          userId,
        });
      }
      setGeneratedCards([]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save';
      setAiError(msg);
      if (msg.includes('FREE_LIMIT_REACHED')) {
        setShowUpgrade(true);
      }
    }
  };

  const handleDeleteNote = async () => {
    if (!userId || !window.confirm('Delete this note? This cannot be undone.')) {
      return;
    }
    try {
      await removeNote({ noteId, userId });
      router.push('/notes');
    } catch (e: unknown) {
      setPageError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!userId) {
    return (
      <p className="text-sm text-slate-600">
        Sign in to edit notes.
      </p>
    );
  }

  if (note === undefined) {
    return (
      <div className="flex items-center gap-2 text-slate-600 py-12">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading note…
      </div>
    );
  }

  if (note === null) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-slate-700 mb-4">Note not found.</p>
        <Button asChild variant="outline">
          <NextLink href="/notes">Back to notes</NextLink>
        </Button>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="flex items-center gap-2 text-slate-600 py-12">
        <Loader2 className="h-5 w-5 animate-spin" />
        Preparing editor…
      </div>
    );
  }

  const deckSelectDisabled = !decks || decks.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:items-center">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => void saveTitle()}
            className="text-lg font-semibold max-w-xl"
            placeholder="Note title"
          />
          <span className="text-xs text-slate-500 shrink-0">
            {saveState === 'saving' && 'Saving…'}
            {saveState === 'saved' && 'Saved'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <NextLink href="/notes">All notes</NextLink>
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => void handleDeleteNote()}
          >
            <Trash2 className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50 px-2 py-2">
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            label="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            label="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            label="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            label="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarBtn>
          <span className="w-px h-6 bg-slate-200 mx-1 self-center" />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            label="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            label="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarBtn>
          <span className="w-px h-6 bg-slate-200 mx-1 self-center" />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            label="Bullet list"
          >
            <List className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            label="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={setLink} active={editor.isActive('link')} label="Link">
            <LinkIcon className="h-4 w-4" />
          </ToolbarBtn>
        </div>

        <div className="relative bg-white">
          <BubbleMenu
            editor={editor}
            className="flex rounded-md border border-slate-200 bg-white shadow-md p-0.5 gap-0.5"
          >
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 text-xs"
              onClick={openFlashcardFromSelection}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Make flashcard
            </Button>
          </BubbleMenu>
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Flashcards</h3>
        <p className="text-xs text-slate-600">
          Select a deck for new cards. Highlight text in the note and use <strong>Make flashcard</strong>, or
          generate many cards with AI (Premium).
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-700 flex-1 min-w-[200px]">
            Deck
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              value={deckId}
              onChange={(e) => setDeckId(e.target.value as Id<'decks'>)}
              disabled={deckSelectDisabled}
            >
              {deckSelectDisabled ? (
                <option value="">Create a deck first</option>
              ) : (
                decks!.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-700 w-full sm:w-28">
            AI cards
            <Input
              type="number"
              min={1}
              max={20}
              value={maxCards}
              onChange={(e) => setMaxCards(Math.min(20, Math.max(1, Number(e.target.value) || 10)))}
              className="text-sm"
            />
          </label>
          <Button
            type="button"
            onClick={() => void handleAiGenerate()}
            disabled={aiLoading || deckSelectDisabled}
            className="shrink-0"
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                AI: cards from note
              </>
            )}
          </Button>
        </div>
        {deckSelectDisabled && (
          <p className="text-xs text-amber-800">
            You need at least one deck.{' '}
            <NextLink href="/my-decks" className="underline font-medium">
              Create a deck
            </NextLink>
            .
          </p>
        )}
        {aiError && (
          <p className="text-sm text-red-700">{aiError}</p>
        )}
        {generatedCards.length > 0 && (
          <div className="space-y-2 border border-slate-200 rounded-md bg-white p-3">
            <p className="text-xs font-medium text-slate-800">
              Preview ({generatedCards.length} cards)
            </p>
            <ul className="max-h-48 overflow-y-auto space-y-2 text-xs text-slate-700">
              {generatedCards.map((c, i) => (
                <li key={i} className="border-b border-slate-100 pb-2 last:border-0">
                  <span className="font-medium text-slate-900">Q:</span> {c.question}
                  <br />
                  <span className="font-medium text-slate-900">A:</span> {c.answer}
                </li>
              ))}
            </ul>
            <Button type="button" size="sm" onClick={() => void handleSaveGenerated()}>
              Save {generatedCards.length} to deck
            </Button>
          </div>
        )}
      </div>

      {pageError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {pageError}
        </div>
      )}

      <Dialog open={selectionOpen} onOpenChange={setSelectionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create flashcard from selection</DialogTitle>
            <DialogDescription>
              The answer is filled from your selection. Add a question (e.g. a prompt that recalls that answer).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-xs font-medium text-slate-700 block">
              Question
              <Input
                value={selectionQuestion}
                onChange={(e) => setSelectionQuestion(e.target.value)}
                placeholder="What is…?"
                className="mt-1"
              />
            </label>
            <label className="text-xs font-medium text-slate-700 block">
              Answer
              <textarea
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm min-h-[80px]"
                value={selectionAnswer}
                onChange={(e) => setSelectionAnswer(e.target.value)}
              />
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectionOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleCreateFromSelection()}
              disabled={!deckId}
            >
              Add to deck
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  active,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'secondary' : 'ghost'}
      className="h-8 w-8 p-0"
      onClick={onClick}
      title={label}
    >
      {children}
    </Button>
  );
}
