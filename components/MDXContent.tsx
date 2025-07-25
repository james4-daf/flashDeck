'use client';

import { MDXRemote } from 'next-mdx-remote/rsc';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MDXContentProps {
  source: string;
}

const components = {
  code: ({ children, className }: { children: string; className?: string }) => {
    const language = className?.replace('language-', '') || 'javascript';
    return (
      <SyntaxHighlighter
        language={language}
        style={tomorrow}
        className="rounded-lg my-4"
        showLineNumbers
      >
        {children}
      </SyntaxHighlighter>
    );
  },
  pre: ({ children }: { children: React.ReactNode }) => (
    <div className="my-4">{children}</div>
  ),
  Tip: ({ children }: { children: React.ReactNode }) => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-6">
      <div className="flex items-start">
        <span className="text-green-600 mr-3 text-lg">💡</span>
        <div className="text-green-800 prose prose-green max-w-none">
          {children}
        </div>
      </div>
    </div>
  ),
  Warning: ({ children }: { children: React.ReactNode }) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6">
      <div className="flex items-start">
        <span className="text-yellow-600 mr-3 text-lg">⚠️</span>
        <div className="text-yellow-800 prose prose-yellow max-w-none">
          {children}
        </div>
      </div>
    </div>
  ),
  FlashcardPractice: ({ topic, title }: { topic: string; title: string }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
      <h3 className="text-blue-900 text-xl font-semibold mb-4">
        Practice {title}
      </h3>
      <p className="text-blue-800 mb-4">
        Ready to test your knowledge? Practice with flashcards on this topic.
      </p>
      <a
        href="/dashboard"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Start Practice Session
      </a>
    </div>
  ),
};

export function MDXContent({ source }: MDXContentProps) {
  return (
    <div className="prose prose-slate max-w-none">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
