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
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { Upload, FileText, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { UpgradeModal } from './UpgradeModal';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: Id<'decks'>;
  onFlashcardsCreated?: () => void;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  deckId,
  onFlashcardsCreated,
}: DocumentUploadDialogProps) {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<
    Array<{
      question: string;
      answer: string;
      category?: string;
      tech?: string;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createFlashcard = useMutation(api.flashcards.createFlashcard);
  const isPremium = useQuery(
    api.subscriptions.isPremium,
    user?.id ? { userId: user.id } : 'skip',
  );
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|docx)$/i)) {
      setError('Please select a PDF or DOCX file');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setGeneratedFlashcards([]);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setGeneratedFlashcards([]);
  };

  const handleGenerateFlashcards = async () => {
    if (!file || !user?.id) return;

    // Check premium status
    if (!isPremium) {
      setError('Document upload is a Premium feature. Upgrade to Premium to upload documents!');
      setShowUpgradeModal(true);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('maxCards', '10');

      const response = await fetch('/api/ai/parse-document', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'PREMIUM_FEATURE') {
          setError(data.message);
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(data.message || 'Failed to generate flashcards');
      }

      if (data.success && data.flashcards) {
        setGeneratedFlashcards(data.flashcards);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate flashcards';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveFlashcards = async () => {
    if (!user?.id || generatedFlashcards.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      // Create flashcards one by one
      for (const card of generatedFlashcards) {
        await createFlashcard({
          question: card.question,
          answer: card.answer,
          type: 'basic',
          category: card.category || 'Document',
          tech: card.tech,
          deckId,
          userId: user.id,
        });
      }

      // Reset and close
      setFile(null);
      setGeneratedFlashcards([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
      if (onFlashcardsCreated) {
        onFlashcardsCreated();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save flashcards';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setGeneratedFlashcards([]);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document & Generate Flashcards</DialogTitle>
            <DialogDescription>
              Upload a PDF or DOCX file. AI will extract key concepts and generate flashcards for you.
              <span className="block mt-1 text-xs text-blue-600">
                Premium feature - Unlimited document uploads
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload */}
            {!file && (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="document-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="document-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-slate-400 mb-4" />
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    Click to upload document
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF or DOCX up to 10MB
                  </p>
                </label>
              </div>
            )}

            {/* File Preview */}
            {file && (
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {!uploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {!generatedFlashcards.length && (
                  <Button
                    type="button"
                    onClick={handleGenerateFlashcards}
                    disabled={uploading || !isPremium}
                    className="mt-4 w-full"
                  >
                    {uploading ? 'Generating...' : 'Generate Flashcards'}
                  </Button>
                )}
              </div>
            )}

            {/* Generated Flashcards Preview */}
            {generatedFlashcards.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900">
                  Generated Flashcards ({generatedFlashcards.length})
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-4">
                  {generatedFlashcards.map((card, index) => (
                    <div
                      key={index}
                      className="border-b border-slate-100 pb-2 last:border-0"
                    >
                      <p className="text-sm font-medium text-slate-900 mb-1">
                        Q: {card.question}
                      </p>
                      <p className="text-xs text-slate-600">A: {card.answer}</p>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={handleSaveFlashcards}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? 'Saving...' : `Save ${generatedFlashcards.length} Flashcards`}
                </Button>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              {generatedFlashcards.length > 0 ? 'Cancel' : 'Close'}
            </Button>
          </DialogFooter>
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

