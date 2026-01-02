'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  featured?: boolean;
  tags?: string[];
};

const blogPosts: BlogPost[] = [
  {
    slug: 'active-recall-spaced-repetition',
    title: 'The Power of Active Recall Testing and Spaced Repetition',
    description:
      'Discover how active recall testing and spaced repetition can transform your learning. Learn the science behind these powerful techniques and how to implement them for maximum retention.',
    date: 'January 15, 2026',
    readTime: '10 min read',
    category: 'Learning Science',
    featured: true,
    tags: ['active recall', 'spaced repetition', 'learning strategies'],
  },
  {
    slug: 'the-forgetting-curve',
    title:
      'The Forgetting Curve: Why You Forget 80% of What You Learn (And How to Stop It)',
    description:
      'Discover the science behind the forgetting curve and why you forget most of what you learn. Learn how spaced repetition and active recall can help you retain 80% more information long-term.',
    date: 'January 20, 2026',
    readTime: '12 min read',
    category: 'Learning Science',
    featured: false,
    tags: [
      'forgetting curve',
      'memory retention',
      'Ebbinghaus',
      'memory science',
    ],
  },
  {
    slug: 'digital-flashcard-alternatives',
    title:
      'Best Digital Flashcard Alternatives: Anki, Quizlet, and More Compared (2026)',
    description:
      'Compare the best digital flashcard apps and alternatives in 2026. Find the perfect flashcard platform for learning programming, languages, or any subject. Compare Anki, Quizlet, Brainscape, FlashDeck, and more.',
    date: 'January 25, 2026',
    readTime: '15 min read',
    category: 'Study Tips',
    featured: false,
    tags: [
      'flashcard alternatives',
      'Anki alternatives',
      'Quizlet alternatives',
      'best flashcard apps',
    ],
  },
];

const categories = ['All', 'Learning Science', 'Study Tips', 'Programming'];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesCategory =
        selectedCategory === 'All' || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/flashdeckLogo.png"
                alt="FlashDeck"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold text-slate-900">FlashDeck</h1>
            </Link>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
              FlashDeck Blog
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Evidence-based learning strategies, study tips, and insights to help
            you master programming and technical skills.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : ''
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Featured Post */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">
              Featured Article
            </h2>
          </div>
          <Link href={`/blog/${featuredPost.slug}`}>
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
              <div className="md:flex">
                <div className="md:w-2/3 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {featuredPost.category}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="h-4 w-4" />
                      <time dateTime={featuredPost.date}>
                        {featuredPost.date}
                      </time>
                      <span>•</span>
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">
                    {featuredPost.title}
                  </h3>
                  <p className="text-lg text-slate-600 mb-6 line-clamp-2">
                    {featuredPost.description}
                  </p>
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white group"
                  >
                    Read Featured Article
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <div className="md:w-1/3 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-8">
                  <TrendingUp className="h-24 w-24 text-blue-600 opacity-50" />
                </div>
              </div>
            </Card>
          </Link>
        </section>
      )}

      {/* All Blog Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            {selectedCategory === 'All' ? 'All Articles' : selectedCategory}
          </h2>
          <span className="text-slate-600">
            {regularPosts.length} article{regularPosts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {regularPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 flex flex-col">
                  <CardContent className="pt-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                        {post.category}
                      </span>
                      <span>•</span>
                      <time dateTime={post.date}>{post.date}</time>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 mb-4 line-clamp-3 flex-1">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group text-blue-600 hover:text-blue-700"
                      >
                        Read
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">
              No articles found
            </h3>
            <p className="text-slate-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Put These Strategies Into Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start using active recall and spaced repetition with FlashDeck
            today. Master JavaScript, React, and CSS concepts faster with
            science-backed learning.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-white hover:bg-slate-100 text-blue-600"
            >
              Start Learning Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-blue-100 mt-4">
            Free forever • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-slate-600 text-sm">
              © {new Date().getFullYear()} FlashDeck. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link
                href="/"
                className="text-slate-600 hover:text-slate-900 text-sm"
              >
                Home
              </Link>
              <Link
                href="/blog"
                className="text-slate-600 hover:text-slate-900 text-sm"
              >
                Blog
              </Link>
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-900 text-sm"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
