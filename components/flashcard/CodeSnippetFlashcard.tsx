'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConvexFlashcard } from '@/lib/types';
import { playAnswerSound } from '@/lib/utils';
import { Highlight, themes } from 'prism-react-renderer';
import { useEffect, useState } from 'react';

interface CodeSnippetFlashcardProps {
  flashcard: ConvexFlashcard;
  onAnswer: (isCorrect: boolean) => void;
  showingResult?: boolean;
}

export function CodeSnippetFlashcard({
  flashcard,
  onAnswer,
  showingResult = false,
}: CodeSnippetFlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setShowAnswer(false);
    setIsCorrect(null);
  }, [flashcard._id]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = (isCorrect: boolean) => {
    setIsCorrect(isCorrect);
    playAnswerSound(isCorrect);
    onAnswer(isCorrect);
  };

  // Extract code from question - look for code blocks marked with ``` or indented code
  const getCode = (question: string) => {
    const codeBlockMatch = question.match(
      /```(?:javascript|js)?\n([\s\S]*?)```/,
    );
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    // If no code block, try to find the last part that looks like code
    const lines = question.split('\n');
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

  const getCorrectAnswer = () => {
    if (typeof flashcard.answer === 'string') {
      return flashcard.answer;
    }
    return flashcard.answer.join(', ');
  };

  const questionText = flashcard.question.split('\n')[0]; // First line is usually the question
  const code = getCode(flashcard.question);

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
          <Button
            onClick={handleShowAnswer}
            className="w-full"
            disabled={showingResult}
          >
            Show Answer
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Show the answer */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium text-green-900">
                Answer: {getCorrectAnswer()}
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => handleAnswer(false)}
                className={`flex-1 transition-colors ${
                  isCorrect === false
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                }`}
                disabled={showingResult}
              >
                {isCorrect === false ? '✓ Incorrect' : 'Incorrect'}
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                className={`flex-1 transition-colors ${
                  isCorrect === true
                    ? 'bg-green-500 text-white'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                disabled={showingResult}
              >
                {isCorrect === true ? '✓ Correct' : 'Correct'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
