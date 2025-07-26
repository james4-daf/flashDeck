import { MDXContent } from '@/components/MDXContent';
import fs from 'fs';
import matter from 'gray-matter';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import path from 'path';

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), 'content');
  const categories = fs.readdirSync(contentDir);

  const params = [];

  for (const category of categories) {
    const categoryPath = path.join(contentDir, category);
    const files = fs.readdirSync(categoryPath);

    for (const file of files) {
      if (file.endsWith('.mdx')) {
        params.push({
          category,
          slug: file.replace('.mdx', ''),
        });
      }
    }
  }

  return params;
}

export default async function MDXPage({ params }: PageProps) {
  const { category, slug } = await params;

  try {
    const filePath = path.join(
      process.cwd(),
      'content',
      category,
      `${slug}.mdx`,
    );
    const source = fs.readFileSync(filePath, 'utf8');

    // Parse frontmatter
    const { data: frontmatter, content } = matter(source);

    const title = frontmatter?.title || 'Untitled';
    const description = frontmatter?.description || '';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link
                href="/dashboard"
                className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors"
              >
                FlashDeck
              </Link>
              <div className="flex items-center gap-6">
                <Link
                  href="/library"
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Library
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Start Studying
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <header className="mb-8 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {category}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                  {frontmatter?.topic || 'Tutorial'}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
                {title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {description}
              </p>
            </header>

            {/* Render MDX content */}
            <div className="prose prose-slate max-w-none">
              <MDXContent source={content} />
            </div>
          </article>
        </main>
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
