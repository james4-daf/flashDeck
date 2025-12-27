import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MDXContentProps {
  source: string;
}

const components = {
  code: ({ children, className }: { children: string; className?: string }) => {
    // If className exists, it's a code block (from triple backticks)
    // In this case, the pre component will handle it
    if (className) {
      // Return the code element as-is, pre component will handle SyntaxHighlighter
      return <code className={className}>{children}</code>;
    }
    // Inline code - render as simple code element
    return (
      <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono text-slate-800">
        {children}
      </code>
    );
  },
  pre: ({ children }: { children: React.ReactNode }) => {
    // Extract code element and its className
    // MDX wraps code blocks as <pre><code className="language-...">...</code></pre>
    const childArray = React.Children.toArray(children);
    const codeChild = childArray.find(
      (child) =>
        React.isValidElement(child) &&
        (child.type === 'code' ||
          (typeof child.type === 'string' && child.type === 'code'))
    ) as React.ReactElement<{ className?: string; children?: React.ReactNode }> | undefined;

    if (codeChild?.props?.className) {
      const language =
        codeChild.props.className.replace('language-', '') || 'javascript';
      const codeContent = String(codeChild.props.children || '').replace(
        /\n$/,
        ''
      );

      return (
        <div className="my-4">
          <SyntaxHighlighter
            language={language}
            style={tomorrow}
            className="rounded-lg"
            showLineNumbers
            PreTag="div"
          >
            {codeContent}
          </SyntaxHighlighter>
        </div>
      );
    }
    // Fallback for regular pre elements
    return (
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-4">
        {children}
      </pre>
    );
  },
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
  FlashcardPractice: ({ title }: { title: string }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
      <h3 className="text-blue-900 text-xl font-semibold mb-4">
        Practice {title}
      </h3>
      <p className="text-blue-800 mb-4">
        Ready to test your knowledge? Practice with flashcards on this topic.
      </p>
      <Link
        href="/dashboard"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Start Practice Session
      </Link>
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
