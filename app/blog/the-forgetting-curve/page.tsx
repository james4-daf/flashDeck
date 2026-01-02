import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title:
    'The Forgetting Curve: Why You Forget 80% of What You Learn (And How to Stop It)',
  description:
    'Discover the science behind the forgetting curve and why you forget most of what you learn. Learn how spaced repetition and active recall can help you retain 80% more information long-term.',
  keywords: [
    'forgetting curve',
    'memory retention',
    'Ebbinghaus',
    'spaced repetition',
    'forgetting curve psychology',
    'memory decay',
    'learning retention',
    'how to remember better',
    'memory improvement',
    'retention strategies',
    'cognitive psychology',
    'memory science',
  ],
  authors: [{ name: 'FlashDeck' }],
  creator: 'FlashDeck',
  publisher: 'FlashDeck',
  metadataBase: new URL('https://flashdeck.dev'),
  alternates: {
    canonical: '/blog/the-forgetting-curve',
  },
  openGraph: {
    type: 'article',
    locale: 'en_US',
    url: 'https://flashdeck.dev/blog/the-forgetting-curve',
    siteName: 'FlashDeck',
    title: 'The Forgetting Curve: Why You Forget 80% of What You Learn',
    description:
      'Discover the science behind the forgetting curve and learn how to stop forgetting what you study. Master memory retention with proven techniques.',
    images: [
      {
        url: '/flashdeckLogo.png',
        width: 1200,
        height: 630,
        alt: 'The Forgetting Curve - Memory Retention',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Forgetting Curve: Why You Forget 80% of What You Learn',
    description:
      'Discover the science behind the forgetting curve and learn how to stop forgetting what you study.',
    images: ['/flashdeckLogo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline:
    'The Forgetting Curve: Why You Forget 80% of What You Learn (And How to Stop It)',
  description:
    'Discover the science behind the forgetting curve and why you forget most of what you learn. Learn how spaced repetition and active recall can help you retain 80% more information long-term.',
  image: 'https://flashdeck.dev/flashdeckLogo.png',
  datePublished: '2026-01-01T00:00:00Z',
  dateModified: new Date().toISOString(),
  author: {
    '@type': 'Organization',
    name: 'FlashDeck',
    url: 'https://flashdeck.dev',
  },
  publisher: {
    '@type': 'Organization',
    name: 'FlashDeck',
    logo: {
      '@type': 'ImageObject',
      url: 'https://flashdeck.dev/flashdeckLogo.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://flashdeck.dev/blog/the-forgetting-curve',
  },
};

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-slate-900">
              FlashDeck
            </Link>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-12">
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Blog
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            The Forgetting Curve: Why You Forget 80% of What You Learn (And How
            to Stop It)
          </h1>
          <div className="flex items-center gap-4 text-slate-600 text-sm">
            <time dateTime="2026-01-01">January 01, 2026</time>
            <span>•</span>
            <span>12 min read</span>
          </div>
        </header>

        {/* Introduction */}
        <section className="prose prose-lg max-w-none mb-12">
          <p className="text-xl text-slate-700 leading-relaxed mb-6">
            You spend hours studying JavaScript concepts, watching React
            tutorials, and reading documentation. A week later, you can barely
            remember what you learned. Sound familiar? You&apos;re not alone—and
            it&apos;s not your fault. This phenomenon has a name: the{' '}
            <strong>forgetting curve</strong>.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed">
            Discovered over 140 years ago by German psychologist{' '}
            <strong>Hermann Ebbinghaus</strong>, the forgetting curve reveals a
            harsh truth: without proper reinforcement, we forget approximately{' '}
            <strong>80% of new information within a month</strong>. But
            here&apos;s the good news: understanding this curve is the first
            step toward defeating it. In this article, we&apos;ll explore the
            science behind memory decay and the proven strategies that can help
            you retain information long-term.
          </p>
        </section>

        {/* What is the Forgetting Curve */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              What is the Forgetting Curve?
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              The <strong>forgetting curve</strong> is a mathematical model that
              describes how information is lost over time when there&apos;s no
              attempt to retain it. Ebbinghaus discovered this pattern through
              self-experimentation, memorizing thousands of nonsense syllables
              and tracking how quickly he forgot them.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              His groundbreaking research revealed that memory retention follows
              a predictable exponential decay:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                <strong>Within 1 hour:</strong> You forget about 50% of new
                information
              </li>
              <li>
                <strong>Within 24 hours:</strong> You forget about 70% of what
                you learned
              </li>
              <li>
                <strong>Within 1 week:</strong> You forget about 80% of the
                information
              </li>
              <li>
                <strong>Within 1 month:</strong> You forget about 90% if not
                reviewed
              </li>
            </ul>
            <p className="text-lg text-slate-700 mb-4">
              This rapid decay happens because your brain is designed to forget.
              From an evolutionary perspective, forgetting is a feature, not a
              bug—it helps you focus on what&apos;s important and discard
              irrelevant information. However, when you&apos;re trying to learn
              programming concepts, JavaScript theory, or React patterns, this
              natural forgetting mechanism works against you.
            </p>
          </div>
        </section>

        {/* Ebbinghaus Research */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Ebbinghaus&apos;s Groundbreaking Research
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              In the 1880s, <strong>Hermann Ebbinghaus</strong> conducted the
              first systematic study of human memory. His methodology was
              rigorous: he created over 2,300 nonsense syllables (like
              &quot;DAX&quot;, &quot;BOK&quot;, &quot;YAT&quot;) to eliminate
              the influence of prior knowledge, then memorized lists and tested
              his recall at various intervals.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              Ebbinghaus discovered several key principles that still guide
              memory research today:
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              1. The Rate of Forgetting is Exponential
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              Memory doesn&apos;t decay linearly—it drops rapidly at first, then
              levels off. Most forgetting happens within the first few hours and
              days after learning.
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              2. Meaningful Material is Retained Better
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              While Ebbinghaus used nonsense syllables, he found that meaningful
              information (like words, concepts, or code patterns) is retained
              much better. This is why understanding JavaScript concepts deeply
              helps you remember them longer than just memorizing syntax.
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              3. Review Can Flatten the Curve
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              Most importantly, Ebbinghaus discovered that each time you review
              information, the forgetting curve becomes less steep. With
              repeated, spaced reviews, you can dramatically improve long-term
              retention.
            </p>
          </div>
        </section>

        {/* Why We Forget */}
        <section className="mb-12 bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Why Does This Happen? The Science Behind Forgetting
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              Modern neuroscience has revealed why the forgetting curve exists.
              When you learn something new, your brain creates neural pathways.
              Without reinforcement, these pathways weaken and fade—a process
              called <strong>synaptic decay</strong>.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              Several factors influence how quickly you forget:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-3 text-lg text-slate-700">
              <li>
                <strong>Interference:</strong> New information competes with old
                memories, making it harder to retrieve specific details
              </li>
              <li>
                <strong>Lack of consolidation:</strong> Memories need time and
                repetition to move from short-term to long-term storage
              </li>
              <li>
                <strong>Context dependency:</strong> You remember better when
                you&apos;re in the same context where you learned (this is why
                coding in your IDE helps you remember better than just reading)
              </li>
              <li>
                <strong>Passive learning:</strong> Simply reading or watching
                creates weak memory traces compared to active practice
              </li>
            </ul>
          </div>
        </section>

        {/* How to Flatten the Curve */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              How to Flatten the Forgetting Curve
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              The good news? You don&apos;t have to accept 80% memory loss.
              Research has identified several strategies that can dramatically
              flatten the forgetting curve and improve retention:
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              1. Spaced Repetition: Review at Optimal Intervals
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              <strong>Spaced repetition</strong> is the practice of reviewing
              information at increasing intervals over time. Instead of cramming
              everything in one session, you space out your reviews
              strategically.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              Here&apos;s how it works:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                Review new material after 1 day, then 3 days, then 1 week, then
                2 weeks, then 1 month
              </li>
              <li>
                Each review strengthens the memory trace and resets the
                forgetting curve
              </li>
              <li>
                Over time, the intervals get longer as the information becomes
                more firmly encoded
              </li>
            </ul>
            <p className="text-lg text-slate-700 mb-4">
              Studies show that spaced repetition can improve retention by up to{' '}
              <strong>200%</strong> compared to massed practice (cramming).
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              2. Active Recall: Test Yourself Instead of Re-reading
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              <strong>Active recall</strong> (also called retrieval practice)
              involves actively retrieving information from memory rather than
              passively reviewing it. Instead of re-reading your notes, you test
              yourself.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              Research by cognitive scientists like Henry Roediger and Jeffrey
              Karpicke has shown that active recall is far more effective than
              re-reading. In one study, students who used active recall
              remembered 50% more information after a week compared to those who
              simply re-read their notes.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              For programming concepts, this means:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                Instead of re-reading React documentation, try explaining React
                hooks from memory
              </li>
              <li>
                Instead of watching the same tutorial again, try coding the
                solution yourself
              </li>
              <li>
                Use flashcards to test your knowledge of JavaScript concepts
              </li>
            </ul>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              3. Combine Spaced Repetition with Active Recall
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              The most powerful approach combines both strategies: use active
              recall at spaced intervals. This is exactly what spaced repetition
              systems do—they schedule active recall sessions at optimal
              intervals.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              When you use flashcards with spaced repetition:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                You&apos;re actively recalling information (not just reading it)
              </li>
              <li>
                Reviews are scheduled at optimal intervals (right before
                you&apos;re about to forget)
              </li>
              <li>Each review strengthens the memory and extends retention</li>
            </ul>
          </div>
        </section>

        {/* Practical Applications */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Practical Applications: Learning Programming Concepts
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              Understanding the forgetting curve is especially important for
              learning programming. Technical concepts like JavaScript closures,
              React hooks, or CSS Grid require both understanding and
              memorization. Here&apos;s how to apply these principles:
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              For JavaScript Theory
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                Create flashcards for key concepts (closures, hoisting, event
                loop, etc.)
              </li>
              <li>
                Review them using spaced repetition—daily at first, then weekly
                as you master them
              </li>
              <li>
                Test yourself by explaining concepts out loud or writing code
                examples from memory
              </li>
            </ul>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              For React Patterns
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                Use flashcards to memorize hook rules, component patterns, and
                best practices
              </li>
              <li>
                Practice building components from scratch to reinforce your
                understanding
              </li>
              <li>
                Review concepts you learned weeks ago to prevent forgetting
              </li>
            </ul>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              For CSS Techniques
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                Create flashcards for CSS properties, layout techniques, and
                responsive design patterns
              </li>
              <li>
                Review them regularly, even after you think you&apos;ve mastered
                them
              </li>
              <li>
                Apply concepts in projects to strengthen memory through
                practical use
              </li>
            </ul>
          </div>
        </section>

        {/* The Numbers */}
        <section className="mb-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            The Numbers: What Research Shows
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl font-bold text-red-600 mb-2">80%</div>
              <p className="text-slate-700">
                Information forgotten within a month without review
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl font-bold text-green-600 mb-2">200%</div>
              <p className="text-slate-700">
                Improvement in retention with spaced repetition vs. cramming
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">50%</div>
              <p className="text-slate-700">
                Better retention with active recall vs. re-reading
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl font-bold text-purple-600 mb-2">90%</div>
              <p className="text-slate-700">
                Information retained long-term with proper spaced repetition
              </p>
            </div>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="mb-12 bg-amber-50 border border-amber-200 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Common Mistakes That Accelerate Forgetting
          </h2>
          <div className="prose prose-lg max-w-none">
            <ul className="list-disc pl-6 mb-4 space-y-3 text-lg text-slate-700">
              <li>
                <strong>Cramming:</strong> Trying to learn everything in one
                session. This creates weak memory traces that fade quickly.
              </li>
              <li>
                <strong>Passive review:</strong> Re-reading notes or watching
                tutorials repeatedly without testing yourself.
              </li>
              <li>
                <strong>No follow-up:</strong> Learning something once and never
                reviewing it again.
              </li>
              <li>
                <strong>Too much new information:</strong> Overloading yourself
                with too many concepts at once makes it harder to retain any of
                them.
              </li>
              <li>
                <strong>Ignoring difficult concepts:</strong> Avoiding review of
                concepts you find challenging means you&apos;ll forget them
                faster.
              </li>
            </ul>
          </div>
        </section>

        {/* Conclusion */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Conclusion</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              The forgetting curve is a fundamental reality of how human memory
              works. You will forget most of what you learn—unless you take
              deliberate action to prevent it. But understanding this curve
              gives you the power to fight back.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              By combining <strong>spaced repetition</strong> with{' '}
              <strong>active recall</strong>, you can transform the steep
              forgetting curve into a gentle slope. Instead of losing 80% of
              what you learn, you can retain 80% or more long-term.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              For developers learning JavaScript, React, or CSS, this means
              building a systematic approach to review. Don&apos;t just learn
              concepts once—create a system that ensures you&apos;ll remember
              them months and years from now.
            </p>
            <p className="text-lg text-slate-700 mb-6">
              The forgetting curve discovered by Ebbinghaus over 140 years ago
              is still relevant today. But now, with modern spaced repetition
              systems and active recall techniques, you have the tools to master
              it. The question isn&apos;t whether you&apos;ll forget—it&apos;s
              whether you&apos;ll take action to remember.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Defeat the Forgetting Curve?
          </h2>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
            Start using spaced repetition and active recall with FlashDeck
            today. Master JavaScript, React, and CSS concepts with
            science-backed learning that ensures long-term retention.
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
        </section>
      </article>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
