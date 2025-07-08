'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import type { Flashcard, FlashcardCategory } from '@/lib/types';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { Highlight, themes } from 'prism-react-renderer';
import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';

export default function LibraryPage() {
  const [categories, setCategories] = useState<FlashcardCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<FlashcardCategory | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    if (!selectedCategory) {
      fetchCategories();
    } else {
      fetchFlashcards(selectedCategory.id);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('flashcard_categories')
      .select('*')
      .order('name', { ascending: true });
    if (!error && data) {
      setCategories(data);
    }
    setLoading(false);
  };

  const fetchFlashcards = async (categoryId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('flashcards')
      .select('*, type:flashcard_types(name, component_name)')
      .eq('is_active', true)
      .eq('category_id', categoryId);
    if (!error && data) {
      setFlashcards(data);
    }
    setLoading(false);
  };

  const handleShowAnswer = (id: string) => {
    setShowAnswers((prev) => ({ ...prev, [id]: true }));
  };

  // UI: Category List
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-4">
            <Link href="/dashboard">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium shadow-sm transition-all">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Revision Library
          </h1>
          {loading ? (
            <div className="text-center text-slate-600">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-center text-slate-600">
              No categories found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="bg-white border border-slate-200 rounded-xl shadow p-6 flex flex-col items-start hover:bg-slate-50 transition-all"
                >
                  <span className="text-xl font-semibold text-slate-900 mb-1 flex items-center gap-2">
                    {cat.icon &&
                      (() => {
                        // Convert kebab-case or snake_case to PascalCase for Lucide
                        const iconName = cat.icon
                          .split(/[-_]/)
                          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                          .join('');
                        const LucideIcon =
                          (
                            LucideIcons as unknown as Record<
                              string,
                              ComponentType<{ className?: string }>
                            >
                          )[iconName] || LucideIcons['Circle'];
                        return <LucideIcon className="text-2xl mr-1" />;
                      })()}
                    {cat.name}
                  </span>
                  {cat.description && (
                    <span className="text-slate-600 text-sm">
                      {cat.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // UI: Flashcards for selected category
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium shadow-sm transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Categories
          </button>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
          {selectedCategory.name} Library
        </h1>
        {loading ? (
          <div className="text-center text-slate-600">Loading...</div>
        ) : flashcards.length === 0 ? (
          <div className="text-center text-slate-600">No flashcards found.</div>
        ) : (
          <div className="space-y-8">
            {flashcards.map((card) => {
              const isCodeSnippet =
                card.type?.name?.toLowerCase() === 'code_snippet';
              // Helper to get code
              const getCode = (card: Flashcard) => {
                if (
                  card.code_block &&
                  typeof card.code_block === 'string' &&
                  card.code_block.trim() !== ''
                ) {
                  return card.code_block.trim();
                }
                // Fallback: extract from question
                const codeBlockMatch = card.question.match(
                  /```(?:javascript|js)?\n([\s\S]*?)```/,
                );
                if (codeBlockMatch) {
                  return codeBlockMatch[1].trim();
                }
                const lines = card.question.split('\n');
                const codeLines = lines.filter(
                  (line) =>
                    line.trim().startsWith('const ') ||
                    line.trim().startsWith('let ') ||
                    line.trim().startsWith('var ') ||
                    line.trim().startsWith('function ') ||
                    line.trim().startsWith('console.') ||
                    line.trim().startsWith('document.') ||
                    line.trim().startsWith('element.') ||
                    (line.includes('(') && line.includes(')')) ||
                    (line.includes('{') && line.includes('}')),
                );
                return codeLines.join('\n');
              };
              return (
                <Card key={card.id} className="w-full">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {card.question.split('\n')[0]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isCodeSnippet && (
                      <div className="mb-4 overflow-x-auto p-0">
                        <Highlight
                          theme={themes.github}
                          code={getCode(card)}
                          language="javascript"
                        >
                          {({
                            className,
                            style,
                            tokens,
                            getLineProps,
                            getTokenProps,
                          }) => (
                            <pre
                              className={
                                className +
                                ' bg-slate-900 rounded-lg w-max block'
                              }
                              style={style}
                            >
                              {tokens.map((line, i) => (
                                <div key={i} {...getLineProps({ line })}>
                                  <span className="text-slate-400 text-sm px-4 select-none ">
                                    {String(i + 1).padStart(2, ' ')}
                                  </span>
                                  {line.map((token, key) => (
                                    <span
                                      key={key}
                                      {...getTokenProps({ token })}
                                    />
                                  ))}
                                </div>
                              ))}
                            </pre>
                          )}
                        </Highlight>
                      </div>
                    )}
                    {!showAnswers[card.id] ? (
                      <Button onClick={() => handleShowAnswer(card.id)}>
                        Show Answer
                      </Button>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-lg border mt-2">
                        <p className="font-medium text-slate-900">
                          {card.answer?.answer}
                        </p>
                        {card.explanation && (
                          <p className="text-sm text-slate-600 mt-2">
                            {card.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
