'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PricingSection } from '@/components/PricingSection';
import { ArrowRight, BookOpen, CheckCircle2, Target, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function LandingContent() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCards, setVisibleCards] = useState<boolean[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards((prev) => {
                const newVisible = [...prev];
                newVisible[index] = true;
                return newVisible;
              });
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        },
      );

      observer.observe(card);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'FlashDeck',
    description:
      'Learn JavaScript, React, and CSS concepts faster with science-backed spaced repetition. Build lasting knowledge with expertly crafted flashcards.',
    url: 'https://flashdeck.dev',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    featureList: [
      'Spaced Repetition Learning',
      'JavaScript Flashcards',
      'React Flashcards',
      'CSS Flashcards',
      'Progress Tracking',
      'Free Forever Plan',
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
                priority
              />
              <h1 className="text-xl font-bold text-slate-900">FlashDeck</h1>
            </Link>
            <div className="flex items-center gap-4">
              <a href="#pricing">
                <Button variant="ghost">Pricing</Button>
              </a>
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Master JavaScript Theory
            <br />
            <span className="text-blue-600">With Spaced Repetition</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Learn React, JavaScript, and CSS concepts faster with science-backed
            spaced repetition. Build lasting knowledge, not just short-term
            memory.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            Free forever • No credit card required
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/flashdeckLogo.png"
              alt="FlashDeck"
              width={60}
              height={20}
              className="h-10 w-auto"
            />
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Why FlashDeck Works
            </h2>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Built on proven learning science to help you retain knowledge
            long-term
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card
            ref={(el) => {
              cardRefs.current[0] = el;
            }}
            className={`border-2 border-transparent hover:border-blue-200 transition-all duration-500 ${
              visibleCards[0]
                ? 'shadow-lg shadow-blue-200/50 scale-100 opacity-100'
                : 'shadow-none scale-95 opacity-0'
            }`}
          >
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Spaced Repetition
              </h3>
              <p className="text-slate-600">
                Review cards at optimal intervals to maximize retention. The
                algorithm adapts to your performance.
              </p>
            </CardContent>
          </Card>

          <Card
            ref={(el) => {
              cardRefs.current[1] = el;
            }}
            style={{
              transitionDelay: visibleCards[1] ? '100ms' : '0ms',
            }}
            className={`border-2 border-transparent hover:border-blue-200 transition-all duration-500 ${
              visibleCards[1]
                ? 'shadow-lg shadow-blue-200/50 scale-100 opacity-100'
                : 'shadow-none scale-95 opacity-0'
            }`}
          >
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Curated Content
              </h3>
              <p className="text-slate-600">
                Learn from expertly crafted flashcards covering React,
                JavaScript, CSS, and advanced topics. No need to create your
                own.
              </p>
            </CardContent>
          </Card>

          <Card
            ref={(el) => {
              cardRefs.current[2] = el;
            }}
            style={{
              transitionDelay: visibleCards[2] ? '200ms' : '0ms',
            }}
            className={`border-2 border-transparent hover:border-blue-200 transition-all duration-500 ${
              visibleCards[2]
                ? 'shadow-lg shadow-blue-200/50 scale-100 opacity-100'
                : 'shadow-none scale-95 opacity-0'
            }`}
          >
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Track Progress
              </h3>
              <p className="text-slate-600">
                See your mastery grow over time. Real-time stats show what
                you&apos;ve learned and what needs review.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Collections Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Flashcard Collections
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Start with free collections, unlock premium topics as you grow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl mb-2">⚛️</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                React
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Master React hooks, components, and patterns
              </p>
              <Link href="/login">
                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Start Learning
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl mb-2">📜</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                JavaScript
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Deep dive into JavaScript fundamentals
              </p>
              <Link href="/login">
                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Start Learning
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">CSS</h3>
              <p className="text-slate-600 text-sm mb-4">
                Learn modern CSS techniques and layouts
              </p>
              <Link href="/login">
                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Start Learning
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Unlock Premium Features
            </h2>
            <p className="text-lg text-slate-600">
              Get access to advanced topics and unlimited learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  20+ Premium Topics
                </h3>
                <p className="text-sm text-slate-600">
                  Advanced React, Next.js, TypeScript, JavaScript Under the
                  Hood, and more
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Unlimited Decks & Cards
                </h3>
                <p className="text-sm text-slate-600">
                  Create as many custom decks as you want with unlimited cards
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Advanced Card Types
                </h3>
                <p className="text-sm text-slate-600">
                  Code snippets, fill-in-the-blank, and more interactive formats
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Public Deck Sharing
                </h3>
                <p className="text-sm text-slate-600">
                  Share your decks with the community and discover others&apos;
                  work
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a href="#pricing">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Premium Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
      >
        <PricingSection />
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-16">
        <div className="text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Master JavaScript?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join developers learning JavaScript theory with spaced repetition.
            Start learning free today.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-white hover:bg-slate-100 text-blue-600"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-blue-100 mt-4">
            No credit card required • Cancel anytime
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
              <a
                href="#pricing"
                className="text-slate-600 hover:text-slate-900 text-sm"
              >
                Pricing
              </a>
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
