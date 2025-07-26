'use client';

import { StudySession } from '@/components/StudySession';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import { MDXProvider } from '@mdx-js/react';
import { useState } from 'react';

// Custom components for MDX
const components = {
  // You can override default HTML elements
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold text-slate-900 mb-6" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-bold text-slate-800 mb-4" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold text-slate-700 mb-3" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-slate-700 mb-4 leading-relaxed" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-slate-700" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-slate-100 px-2 py-1 rounded text-sm font-mono text-slate-800"
      {...props}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-blue-500 pl-4 italic text-slate-600 mb-4"
      {...props}
    />
  ),

  // Custom components for flashcards
  FlashcardPractice: ({ title }: { title: string }) => {
    const { user } = useUser();
    const [isStudying, setIsStudying] = useState(false);

    if (isStudying) {
      return (
        <div className="my-8">
          <StudySession
            userId={user?.id || ''}
            onComplete={() => setIsStudying(false)}
            studyMode="topic"
            topicName={title}
          />
        </div>
      );
    }

    return (
      <Card className="my-8 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Practice {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 mb-4">
            Ready to test your knowledge? Practice with flashcards on this
            topic.
          </p>
          <Button
            onClick={() => setIsStudying(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Start Practice Session
          </Button>
        </CardContent>
      </Card>
    );
  },

  Tip: ({ children }: { children: React.ReactNode }) => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
      <div className="flex items-start">
        <span className="text-green-600 mr-2">💡</span>
        <div className="text-green-800">{children}</div>
      </div>
    </div>
  ),

  Warning: ({ children }: { children: React.ReactNode }) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
      <div className="flex items-start">
        <span className="text-yellow-600 mr-2">⚠️</span>
        <div className="text-yellow-800">{children}</div>
      </div>
    </div>
  ),

  CodeExample: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title?: string;
  }) => (
    <div className="my-4">
      {title && (
        <h4 className="text-sm font-medium text-slate-600 mb-2">{title}</h4>
      )}
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  ),
};

export function MDXContentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
