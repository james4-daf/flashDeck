'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Flashcard } from '@/lib/types';
import { Highlight, themes } from 'prism-react-renderer';
import { useEffect, useState } from 'react';

interface CodeSnippetFlashcardProps {
  flashcard: Flashcard;
  onAnswer: (
    isCorrect: boolean,
    response: Record<string, unknown>,
    timeSpent: number,
  ) => void;
}

export function CodeSnippetFlashcard({
  flashcard,
  onAnswer,
}: CodeSnippetFlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime] = useState(Date.now());
  const [pending, setPending] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    setShowAnswer(false);
    setPending(null);
  }, [flashcard.id]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = (isCorrect: boolean) => {
    setPending(isCorrect ? 'correct' : 'incorrect');
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    onAnswer(
      isCorrect,
      { userAnswer: isCorrect ? 'correct' : 'incorrect' },
      timeSpent,
    );
  };

  // Prefer code_block property if present, otherwise extract from question
  const getCode = (flashcard: Flashcard) => {
    if (
      flashcard.code_block &&
      typeof flashcard.code_block === 'string' &&
      flashcard.code_block.trim() !== ''
    ) {
      return flashcard.code_block.trim();
    }
    // Fallback: extract from question
    // Look for code blocks marked with ``` or indented code
    const codeBlockMatch = flashcard.question.match(
      /```(?:javascript|js)?\n([\s\S]*?)```/,
    );
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    // If no code block, try to find the last part that looks like code
    const lines = flashcard.question.split('\n');
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

  const questionText = flashcard.question.split('\n')[0]; // First line is usually the question
  const code = getCode(flashcard);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">{questionText}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Always show the code block */}
        <div className="overflow-x-auto p-0 mb-4">
          <Highlight theme={themes.github} code={code} language="javascript">
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className={className + ' bg-slate-900 rounded-lg w-max block'}
                style={style}
              >
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    <span className="text-slate-400 text-sm px-4 select-none">
                      {String(i + 1).padStart(2, ' ')}
                    </span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>

        {!showAnswer ? (
          <Button onClick={handleShowAnswer} className="w-full">
            Show Answer
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Show the answer */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium text-green-900">
                Answer: {flashcard.answer.answer}
              </p>
              {flashcard.explanation && (
                <p className="text-sm text-green-700 mt-2">
                  {flashcard.explanation}
                </p>
              )}
            </div>

            {!pending ? (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleAnswer(false)}
                  className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 cursor-pointer"
                >
                  Incorrect
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
                >
                  Correct
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  disabled
                  className="flex-1 bg-red-50 border-red-200 text-red-700"
                >
                  {pending === 'incorrect' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></span>
                      Incorrect
                    </span>
                  ) : (
                    'Incorrect'
                  )}
                </Button>
                <Button disabled className="flex-1 bg-green-600">
                  {pending === 'correct' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Correct
                    </span>
                  ) : (
                    'Correct'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
