import { LibraryNav } from '@/components/LibraryNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const TECHS = [
  { name: 'React', slug: 'react' },
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'CSS', slug: 'css' },
];

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <LibraryNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Flashcard Library
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Browse your flashcards by technology. Click on any card to explore
            the flashcards for that tech.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:gap-8">
          {TECHS.map(({ name, slug }) => (
            <Link key={slug} href={`/library/${slug}`} className="group">
              <Card className="w-full hover:shadow-lg transition-all duration-200 border-slate-200 group-hover:border-blue-300 group-hover:scale-[1.02] cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl group-hover:text-blue-600 transition-colors">
                    {name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-500 text-base sm:text-lg">
                    View {name} flashcards
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Learning Guides Section */}
        <div className="mt-8 sm:mt-12">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
            Learning Guides
          </h3>
          <div className="flex flex-col gap-3 sm:gap-4">
            <Link href="/react/usestate" className="group">
              <Card className="w-full hover:shadow-lg transition-all duration-200 border-slate-200 group-hover:border-green-300 group-hover:scale-[1.02] cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl group-hover:text-green-600 transition-colors">
                    React useState Hook - Complete Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-500 text-sm sm:text-base">
                    Learn how to use the useState hook in React with examples
                    and practice flashcards
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
