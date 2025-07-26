'use client';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ConvexFlashcard } from '@/lib/types';
import { useState } from 'react';

interface LibraryFlashcardProps {
  flashcard: ConvexFlashcard;
  showProgress?: boolean;
  progressInfo?: {
    reviewCount: number;
    isCompleted: boolean;
    nextReviewDate?: number;
  };
}

export function LibraryFlashcard({
  flashcard,
  showProgress = false,
  progressInfo,
}: LibraryFlashcardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getAnswerText = () => {
    if (typeof flashcard.answer === 'string') {
      return flashcard.answer;
    }
    // For multiple choice, show all correct answers
    return flashcard.answer.join(', ');
  };

  const getCardTypeDisplay = () => {
    switch (flashcard.type) {
      case 'basic':
        return 'Basic';
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      default:
        return flashcard.type;
    }
  };

  const getProgressBadge = () => {
    if (!showProgress || !progressInfo) return null;

    if (progressInfo.isCompleted) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✅ Completed
        </span>
      );
    } else if (progressInfo.reviewCount > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          📚 {progressInfo.reviewCount} reviews
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          🆕 New
        </span>
      );
    }
  };

  return (
    <AccordionItem className="bg-white hover:bg-slate-50 transition-colors w-full">
      <AccordionTrigger
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="text-left w-full"
      >
        <div className="flex-1 pr-4 w-full">
          <div className="font-medium text-slate-900 mb-3 text-lg">
            {flashcard.question}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {flashcard.category}
            </span>

            {getProgressBadge()}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent isOpen={isOpen}>
        <div className="border-t border-slate-200 pt-6 w-full">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Answer:</h4>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg w-full">
              <p className="text-slate-900 font-medium text-base leading-relaxed">
                {getAnswerText()}
              </p>
            </div>
          </div>

          {/* Show multiple choice options if available */}
          {flashcard.type === 'multiple_choice' && flashcard.options && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                All Options:
              </h4>
              <ul className="space-y-2 w-full">
                {flashcard.options.map((option, index) => {
                  const isCorrect = Array.isArray(flashcard.answer)
                    ? flashcard.answer.includes(option)
                    : flashcard.answer === option;

                  return (
                    <li
                      key={index}
                      className={`p-2 rounded text-sm ${
                        isCorrect
                          ? 'bg-green-100 text-green-800 font-medium'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isCorrect ? '✅' : '⭕'} {option}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {showProgress && progressInfo && (
            <div className="mt-4 pt-4 border-t border-slate-200 w-full">
              <p className="text-xs text-slate-500">
                Progress: {progressInfo.reviewCount} review
                {progressInfo.reviewCount !== 1 ? 's' : ''}
                {progressInfo.nextReviewDate && !progressInfo.isCompleted && (
                  <span className="ml-2">
                    • Next review:{' '}
                    {new Date(progressInfo.nextReviewDate).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
