'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export function MarkdownContent({ content, className = '', inline = false }: MarkdownContentProps) {
  // For inline content (single line), render without wrapper div
  if (inline) {
    return (
      <span className={className}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ ...props }: React.ComponentPropsWithoutRef<'p'>) => <span {...props} />,
            // Remove default paragraph wrapper for inline
            h1: ({ ...props }: React.ComponentPropsWithoutRef<'h1'>) => <span className="font-bold" {...props} />,
            h2: ({ ...props }: React.ComponentPropsWithoutRef<'h2'>) => <span className="font-semibold" {...props} />,
            h3: ({ ...props }: React.ComponentPropsWithoutRef<'h3'>) => <span className="font-semibold" {...props} />,
            strong: ({ ...props }: React.ComponentPropsWithoutRef<'strong'>) => <strong className="font-semibold" {...props} />,
            em: ({ ...props }: React.ComponentPropsWithoutRef<'em'>) => <em className="italic" {...props} />,
            code: ({ inline: isInline, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
              if (isInline) {
                return (
                  <code
                    {...props}
                    style={{
                      display: 'inline',
                      backgroundColor: 'rgb(245 245 244)',
                      color: 'rgb(239 68 68)',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '3px',
                      fontSize: '0.875rem',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    }}
                    className=""
                  />
                );
              }
              return <code className="block p-3 bg-slate-900 rounded-lg text-sm font-mono text-slate-100 overflow-x-auto" {...props} />;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </span>
    );
  }

  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize heading styles
          h1: ({ ...props }: React.ComponentPropsWithoutRef<'h1'>) => (
            <h1 className="text-2xl font-bold mb-4 text-slate-900" {...props} />
          ),
          h2: ({ ...props }: React.ComponentPropsWithoutRef<'h2'>) => (
            <h2 className="text-xl font-semibold mb-3 text-slate-900" {...props} />
          ),
          h3: ({ ...props }: React.ComponentPropsWithoutRef<'h3'>) => (
            <h3 className="text-lg font-semibold mb-2 text-slate-800" {...props} />
          ),
          // Customize paragraph styles
          p: ({ ...props }: React.ComponentPropsWithoutRef<'p'>) => (
            <p className="text-base leading-relaxed mb-3 text-slate-700" {...props} />
          ),
          // Customize code blocks
          code: ({ inline, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
            if (inline) {
              return (
                <code
                  {...props}
                  style={{
                    display: 'inline',
                    backgroundColor: 'rgb(245 245 244)',
                    color: 'rgb(239 68 68)',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '3px',
                    fontSize: '0.875rem',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  }}
                  className=""
                />
              );
            }
            return (
              <code
                className="block p-3 bg-slate-900 rounded-lg text-sm font-mono text-slate-100 overflow-x-auto"
                {...props}
              />
            );
          },
          // Customize lists
          ul: ({ ...props }: React.ComponentPropsWithoutRef<'ul'>) => (
            <ul className="list-disc list-inside mb-3 space-y-1 text-slate-700" {...props} />
          ),
          ol: ({ ...props }: React.ComponentPropsWithoutRef<'ol'>) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-700" {...props} />
          ),
          li: ({ ...props }: React.ComponentPropsWithoutRef<'li'>) => (
            <li className="text-base leading-relaxed" {...props} />
          ),
          // Customize blockquotes
          blockquote: ({ ...props }: React.ComponentPropsWithoutRef<'blockquote'>) => (
            <blockquote
              className="border-l-4 border-slate-300 pl-4 italic my-3 text-slate-600"
              {...props}
            />
          ),
          // Customize links
          a: ({ ...props }: React.ComponentPropsWithoutRef<'a'>) => (
            <a
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          // Customize strong/bold
          strong: ({ ...props }: React.ComponentPropsWithoutRef<'strong'>) => (
            <strong className="font-semibold text-slate-900" {...props} />
          ),
          // Customize emphasis/italic
          em: ({ ...props }: React.ComponentPropsWithoutRef<'em'>) => (
            <em className="italic text-slate-700" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

