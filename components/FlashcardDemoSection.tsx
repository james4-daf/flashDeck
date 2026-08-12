'use client';

import { BlogFlashcardDemo } from '@/components/blog/BlogFlashcardDemo';
import { BlogCodeSnippetFlashcardDemo } from '@/components/blog/BlogCodeSnippetFlashcardDemo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownContent } from '@/components/MarkdownContent';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

type FlashcardType = 'basic' | 'multiple_choice' | 'code_snippet' | 'fill_blank' | 'true_false';

const flashcardTypes: { id: FlashcardType; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'multiple_choice', label: 'Multiple Choice' },
  { id: 'code_snippet', label: 'Code Snippet' },
  { id: 'fill_blank', label: 'Fill in the Blank' },
  { id: 'true_false', label: 'True/False' },
];

export function FlashcardDemoSection() {
  const [activeTab, setActiveTab] = useState<FlashcardType>('basic');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
          Interactive Flashcard Types
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Explore different flashcard formats designed for developers. Click through
          the tabs to see each type in action.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {flashcardTypes.map((type) => (
          <Button
            key={type.id}
            onClick={() => setActiveTab(type.id)}
            variant={activeTab === type.id ? 'default' : 'outline'}
            className={`transition-all ${
              activeTab === type.id
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Flashcard Demo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'basic' && (
            <BlogFlashcardDemo
              question="What hook in React allows you to manage component state?"
              answer="**useState** - It's a React hook that lets you add state to functional components. You call it with an initial value, and it returns an array with the current state value and a function to update it."
              category="React"
            />
          )}

          {activeTab === 'multiple_choice' && <MultipleChoiceDemo />}

          {activeTab === 'code_snippet' && (
            <BlogCodeSnippetFlashcardDemo
              question="What will this code output?"
              code={`const arr = [1, 2, 3];
const doubled = arr.map(x => x * 2);
console.log(doubled);`}
              answer="**[2, 4, 6]** - The `map()` method creates a new array by calling the provided function on every element. Each number is multiplied by 2, resulting in [2, 4, 6]."
              category="JavaScript"
            />
          )}

          {activeTab === 'fill_blank' && <FillBlankDemo />}

          {activeTab === 'true_false' && <TrueFalseDemo />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function MultipleChoiceDemo() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const options = [
    { id: '1', text: 'useState', isCorrect: true },
    { id: '2', text: 'useEffect', isCorrect: false },
    { id: '3', text: 'useContext', isCorrect: false },
    { id: '4', text: 'useReducer', isCorrect: false },
  ];

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleSelect = (optionId: string) => {
    if (showAnswer) return;
    setSelectedAnswer(optionId);
    setShowAnswer(true);
  };

  const isCorrect = selectedAnswer === '1';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="w-full relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-blue-200">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 pointer-events-none" />
        <CardHeader className="relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                React
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold leading-tight text-slate-900">
              Which React hook is used to manage component state?
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          {!showAnswer ? (
            <div className="space-y-3">
              {options.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(option.id)}
                  className="w-full p-4 text-left border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  {option.text}
                </motion.button>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div
                className={`p-4 rounded-xl border-2 ${
                  isCorrect
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="font-semibold text-lg mb-2">
                  {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </div>
                <div className="text-slate-700">
                  <strong>Answer:</strong> useState - It's the primary hook for
                  managing state in functional components.
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowAnswer(false);
                    setSelectedAnswer(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FillBlankDemo() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);

  const correctAnswer = 'useState';

  const handleShowAnswer = () => {
    setShowAnswer(true);
    const isCorrect =
      userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase();
    setSelectedAnswer(isCorrect);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="w-full relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-blue-200">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 pointer-events-none" />
        <CardHeader className="relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                React
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold leading-tight text-slate-900">
              The <span className="bg-yellow-200 px-2 py-1 rounded">_____</span>{' '}
              hook allows you to add state to functional components.
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          {!showAnswer ? (
            <div className="space-y-4">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userAnswer.trim()) {
                    handleShowAnswer();
                  }
                }}
              />
              <Button
                onClick={handleShowAnswer}
                disabled={!userAnswer.trim()}
                className="w-full py-4 sm:py-5 text-base sm:text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Check Answer
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div
                className={`p-4 rounded-xl border-2 ${
                  selectedAnswer
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="font-semibold text-lg mb-2">
                  {selectedAnswer ? '✓ Correct!' : '✗ Incorrect'}
                </div>
                <div className="text-slate-700">
                  <strong>Answer:</strong> {correctAnswer} - It's the primary
                  hook for managing state in functional components.
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowAnswer(false);
                    setUserAnswer('');
                    setSelectedAnswer(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TrueFalseDemo() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);

  const correctAnswer = true;

  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
    setShowAnswer(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="w-full relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-blue-200">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 pointer-events-none" />
        <CardHeader className="relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                React
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold leading-tight text-slate-900">
              React hooks can only be used in functional components.
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          {!showAnswer ? (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(true)}
                className="flex-1 p-6 border-2 border-green-200 bg-green-50 hover:bg-green-100 rounded-xl font-semibold text-lg text-green-700 transition-all"
              >
                True
              </motion.button>
              <motion.button
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(false)}
                className="flex-1 p-6 border-2 border-red-200 bg-red-50 hover:bg-red-100 rounded-xl font-semibold text-lg text-red-700 transition-all"
              >
                False
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div
                className={`p-4 rounded-xl border-2 ${
                  selectedAnswer === correctAnswer
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="font-semibold text-lg mb-2">
                  {selectedAnswer === correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
                </div>
                <div className="text-slate-700">
                  <strong>Answer:</strong> True - React hooks are designed
                  specifically for functional components and cannot be used in
                  class components.
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowAnswer(false);
                    setSelectedAnswer(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

