'use client';

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
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { UpgradeModal } from './UpgradeModal';
import { Sparkles } from 'lucide-react';

type FlashcardType =
  | 'basic'
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'code_snippet';

interface FlashcardCreationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: Id<'decks'>;
  onFlashcardCreated?: () => void;
}

export function FlashcardCreationForm({
  open,
  onOpenChange,
  deckId,
  onFlashcardCreated,
}: FlashcardCreationFormProps) {
  const { user } = useUser();
  const [type, setType] = useState<FlashcardType>('basic');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [category, setCategory] = useState('');
  const [tech, setTech] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiContext, setAiContext] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const createFlashcard = useMutation(api.flashcards.createFlashcard);
  const usageStats = useQuery(
    api.aiUsage.getUsageStats,
    user?.id ? { userId: user.id } : 'skip',
  );

  const resetForm = () => {
    setType('basic');
    setQuestion('');
    setAnswer('');
    setOptions(['', '']);
    setCorrectAnswers([]);
    setCategory('');
    setTech('');
    setError(null);
    setAiTopic('');
    setAiContext('');
  };

  const handleAIGenerate = async () => {
    if (!user?.id) return;
    if (!aiTopic.trim()) {
      setError('Please enter a topic for AI generation');
      return;
    }

    setAiGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-flashcard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          context: aiContext.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'AI_GENERATION_LIMIT_REACHED') {
          setError(data.message);
          setShowUpgradeModal(true);
          setShowAIDialog(false);
          return;
        }
        throw new Error(data.message || 'Failed to generate flashcard');
      }

      if (data.success && data.flashcard) {
        // Pre-fill form with AI-generated content
        setQuestion(data.flashcard.question);
        setAnswer(data.flashcard.answer);
        if (data.flashcard.category) {
          setCategory(data.flashcard.category);
        }
        if (data.flashcard.tech) {
          setTech(data.flashcard.tech);
        }
        setType('basic'); // AI generates basic cards by default
        setShowAIDialog(false);
        setAiTopic('');
        setAiContext('');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate flashcard';
      setError(errorMessage);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    setCorrectAnswers(
      correctAnswers
        .map((idx) => (idx > index ? idx - 1 : idx))
        .filter((idx) => idx >= 0 && idx < newOptions.length),
    );
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleToggleCorrectAnswer = (index: number) => {
    if (correctAnswers.includes(index)) {
      setCorrectAnswers(correctAnswers.filter((i) => i !== index));
    } else {
      setCorrectAnswers([...correctAnswers, index]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setError(null);

    // Validate based on type
    if (!question.trim()) {
      setError('Question is required');
      return;
    }

    if (type === 'multiple_choice') {
      const validOptions = options.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        setError('Multiple choice requires at least 2 options');
        return;
      }
      if (correctAnswers.length === 0) {
        setError('Please select at least one correct answer');
        return;
      }
    } else {
      if (!answer.trim()) {
        setError('Answer is required');
        return;
      }
    }

    setLoading(true);

    try {
      let flashcardAnswer: string | string[];
      let flashcardOptions: string[] | undefined;

      if (type === 'multiple_choice') {
        const validOptions = options.filter((opt) => opt.trim());
        flashcardOptions = validOptions;
        flashcardAnswer = correctAnswers.map((idx) => validOptions[idx]);
      } else if (type === 'true_false') {
        flashcardAnswer = answer.toLowerCase() === 'true' ? 'true' : 'false';
      } else {
        flashcardAnswer = answer.trim();
      }

      const flashcardData: {
        question: string;
        answer: string | string[];
        type: FlashcardType;
        category: string;
        tech?: string;
        options?: string[];
        deckId: Id<'decks'>;
        userId: string;
      } = {
        question: question.trim(),
        answer: flashcardAnswer,
        type,
        category: category.trim() || 'Custom',
        options: flashcardOptions,
        deckId,
        userId: user.id,
      };

      // Only include tech if it's provided
      if (tech.trim()) {
        flashcardData.tech = tech.trim();
      }

      await createFlashcard(flashcardData);

      resetForm();
      onOpenChange(false);
      if (onFlashcardCreated) {
        onFlashcardCreated();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create flashcard';
      setError(errorMessage);

      // If it's a limit error, show upgrade modal
      if (errorMessage.includes('FREE_LIMIT_REACHED')) {
        setShowUpgradeModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Flashcard to Deck</DialogTitle>
            <DialogDescription>
              Create a new flashcard. Choose the type and fill in the details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selector */}
            <div className="space-y-2">
              <label htmlFor="flashcard-type" className="text-sm font-medium">
                Flashcard Type <span className="text-red-500">*</span>
              </label>
              <select
                id="flashcard-type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value as FlashcardType);
                  setError(null);
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                disabled={loading}
              >
                <option value="basic">Basic (Q&A)</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True/False</option>
                <option value="fill_blank">Fill in the Blank</option>
                <option value="code_snippet">Code Snippet</option>
              </select>
            </div>

            {/* AI Generation Button */}
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Generate with AI</p>
                {usageStats && !usageStats.isPremium && (
                  <p className="text-xs text-blue-700">
                    You&apos;ve used {usageStats.usageCount} of {usageStats.limit} AI generations this month
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAIDialog(true)}
                disabled={loading || (usageStats && !usageStats.canUse)}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate
              </Button>
            </div>

            {/* Question */}
            <div className="space-y-2">
              <label htmlFor="flashcard-question" className="text-sm font-medium">
                Question <span className="text-red-500">*</span>
              </label>
              <textarea
                id="flashcard-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  type === 'code_snippet'
                    ? 'Enter your question and code. Use ```javascript to mark code blocks.'
                    : 'Enter your question...'
                }
                rows={type === 'code_snippet' ? 8 : 3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                required
                disabled={loading}
              />
              {type === 'code_snippet' && (
                <p className="text-xs text-slate-500">
                  Tip: Wrap code in ```javascript blocks for syntax highlighting
                </p>
              )}
            </div>

            {/* Answer Fields Based on Type */}
            {type === 'multiple_choice' ? (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Options <span className="text-red-500">*</span>
                </label>
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={correctAnswers.includes(index)}
                      onChange={() => handleToggleCorrectAnswer(index)}
                      className="w-4 h-4 rounded border-slate-300"
                      disabled={loading || !option.trim()}
                    />
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                      disabled={loading}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                        disabled={loading}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={loading}
                >
                  + Add Option
                </Button>
                <p className="text-xs text-slate-500">
                  Check the boxes next to the correct answer(s)
                </p>
              </div>
            ) : type === 'true_false' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Correct Answer <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAnswer('true')}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      answer === 'true'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    disabled={loading}
                  >
                    True
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswer('false')}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      answer === 'false'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    disabled={loading}
                  >
                    False
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="flashcard-answer" className="text-sm font-medium">
                  Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="flashcard-answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter the answer..."
                  rows={type === 'code_snippet' ? 4 : 3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Optional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="flashcard-category" className="text-sm font-medium">
                  Category (optional)
                </label>
                <Input
                  id="flashcard-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Variables, Functions"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="flashcard-tech" className="text-sm font-medium">
                  Tech (optional)
                </label>
                <Input
                  id="flashcard-tech"
                  value={tech}
                  onChange={(e) => setTech(e.target.value)}
                  placeholder="e.g., JavaScript, React"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Flashcard'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Generation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Flashcard with AI</DialogTitle>
            <DialogDescription>
              Enter a topic and optional context. AI will generate a question and answer for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="ai-topic" className="text-sm font-medium">
                Topic <span className="text-red-500">*</span>
              </label>
              <Input
                id="ai-topic"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g., JavaScript closures, React hooks, CSS flexbox"
                disabled={aiGenerating}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="ai-context" className="text-sm font-medium">
                Additional Context (optional)
              </label>
              <textarea
                id="ai-context"
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
                placeholder="Provide any additional context or specific focus areas..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={aiGenerating}
              />
            </div>
            {error && error.includes('AI') && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAIDialog(false);
                  setAiTopic('');
                  setAiContext('');
                  setError(null);
                }}
                disabled={aiGenerating}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiGenerating || !aiTopic.trim()}
              >
                {aiGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {showUpgradeModal && (
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
        />
      )}
    </>
  );
}

