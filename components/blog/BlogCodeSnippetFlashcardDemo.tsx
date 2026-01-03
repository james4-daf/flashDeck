'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownContent } from '@/components/MarkdownContent';
import { motion, AnimatePresence } from 'framer-motion';
import { Highlight, themes } from 'prism-react-renderer';
import { useState } from 'react';

interface BlogCodeSnippetFlashcardDemoProps {
  question: string;
  code: string;
  answer: string;
  category?: string;
}

export function BlogCodeSnippetFlashcardDemo({
  question,
  code,
  answer,
  category = 'JavaScript',
}: BlogCodeSnippetFlashcardDemoProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = (isCorrect: boolean) => {
    setSelectedAnswer(isCorrect);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto my-8"
    >
      <Card className="w-full relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-blue-200">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 pointer-events-none" />
        <CardHeader className="relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                {category}
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold leading-tight text-slate-900">
              <MarkdownContent content={question} inline />
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          {/* Always show the code block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="overflow-x-auto p-0 mb-4 rounded-xl shadow-lg"
          >
            <Highlight theme={themes.github} code={code} language="javascript">
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                  className={className + ' bg-slate-900 rounded-xl w-max block shadow-lg'}
                  style={style}
                >
                  {tokens.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      {...getLineProps({ line })}
                    >
                      <span className="text-slate-400 text-sm px-4 select-none">
                        {String(i + 1).padStart(2, ' ')}
                      </span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </motion.div>
                  ))}
                </pre>
              )}
            </Highlight>
          </motion.div>

          <div style={{ perspective: '1000px' }} className="w-full">
            <AnimatePresence mode="wait">
              {!showAnswer ? (
                <motion.div
                  key="question"
                  initial={{ rotateY: 0, opacity: 1 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleShowAnswer}
                      className="w-full py-4 sm:py-5 text-base sm:text-lg font-semibold relative overflow-hidden group bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <span className="relative z-10">Show Answer</span>
                      <motion.span
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="answer"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="p-4 sm:p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm"
                    >
                      <div className="text-base sm:text-lg font-medium text-green-900 leading-relaxed">
                        <span className="font-semibold">Answer: </span>
                        <MarkdownContent content={answer} />
                      </div>
                    </motion.div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => handleAnswer(false)}
                          className={`flex-1 transition-all duration-200 py-4 sm:py-5 text-base sm:text-lg font-semibold relative overflow-hidden ${
                            selectedAnswer === false
                              ? 'bg-red-500 text-white border-red-500'
                              : selectedAnswer === true
                                ? 'bg-slate-100 text-slate-400 border-slate-200'
                                : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {selectedAnswer === false && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 200,
                                  damping: 10,
                                }}
                              >
                                ✗
                              </motion.span>
                            )}
                            Incorrect
                          </span>
                        </Button>
                      </motion.div>
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => handleAnswer(true)}
                          className={`flex-1 transition-all duration-200 py-4 sm:py-5 text-base sm:text-lg font-semibold relative overflow-hidden ${
                            selectedAnswer === true
                              ? 'bg-green-500 text-white'
                              : selectedAnswer === false
                                ? 'bg-slate-100 text-slate-400 border-slate-200'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          <motion.span
                            className="absolute inset-0 bg-white/20"
                            initial={{ scale: 0 }}
                            animate={
                              selectedAnswer === true
                                ? { scale: 1, opacity: [1, 0] }
                                : {}
                            }
                            transition={{ duration: 0.4 }}
                          />
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {selectedAnswer === true && (
                              <motion.span
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 200,
                                  damping: 10,
                                }}
                              >
                                ✓
                              </motion.span>
                            )}
                            Correct
                          </span>
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

