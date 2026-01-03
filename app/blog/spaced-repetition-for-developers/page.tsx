import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BlogFlashcardDemo } from '@/components/blog/BlogFlashcardDemo';
import { BlogCodeSnippetFlashcardDemo } from '@/components/blog/BlogCodeSnippetFlashcardDemo';
import {
  ArrowRight,
  Code,
  Lightbulb,
  Rocket,
  TrendingUp,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How Developers Can Use Spaced Repetition to Learn Faster: A Practical Guide',
  description:
    'Learn how developers can use spaced repetition to master programming concepts faster. Discover practical strategies for learning JavaScript, React, and other technologies with science-backed techniques.',
  keywords: [
    'spaced repetition for developers',
    'learn programming faster',
    'developer learning strategies',
    'JavaScript spaced repetition',
    'programming study techniques',
    'learn code faster',
    'developer productivity',
    'programming memory',
    'code learning strategies',
    'spaced repetition coding',
    'developer study methods',
    'programming retention',
  ],
  authors: [{ name: 'FlashDeck' }],
  creator: 'FlashDeck',
  publisher: 'FlashDeck',
  metadataBase: new URL('https://flashdeck.dev'),
  alternates: {
    canonical: '/blog/spaced-repetition-for-developers',
  },
  openGraph: {
    type: 'article',
    locale: 'en_US',
    url: 'https://flashdeck.dev/blog/spaced-repetition-for-developers',
    siteName: 'FlashDeck',
    title: 'How Developers Can Use Spaced Repetition to Learn Faster',
    description:
      'Learn how developers can use spaced repetition to master programming concepts faster. Practical strategies for learning JavaScript, React, and more.',
    images: [
      {
        url: '/flashdeckLogo.png',
        width: 1200,
        height: 630,
        alt: 'Spaced Repetition for Developers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Developers Can Use Spaced Repetition to Learn Faster',
    description:
      'Learn how developers can use spaced repetition to master programming concepts faster.',
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
  headline: 'How Developers Can Use Spaced Repetition to Learn Faster: A Practical Guide',
  description:
    'Learn how developers can use spaced repetition to master programming concepts faster. Discover practical strategies for learning JavaScript, React, and other technologies.',
  image: 'https://flashdeck.dev/flashdeckLogo.png',
  datePublished: '2026-02-01T00:00:00Z',
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
    '@id': 'https://flashdeck.dev/blog/spaced-repetition-for-developers',
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
            How Developers Can Use Spaced Repetition to Learn Faster: A
            Practical Guide
          </h1>
          <div className="flex items-center gap-4 text-slate-600 text-sm">
            <time dateTime="2026-02-01">February 1, 2026</time>
            <span>•</span>
            <span>14 min read</span>
          </div>
        </header>

        {/* Introduction */}
        <section className="prose prose-lg max-w-none mb-12">
          <p className="text-xl text-slate-700 leading-relaxed mb-6">
            As a developer, you&apos;re constantly learning. New frameworks emerge,
            best practices evolve, and the JavaScript ecosystem never stops
            moving. But here&apos;s the problem: you learn React hooks one week, and
            by next month, you&apos;ve forgotten half of what you studied. Sound
            familiar?
          </p>
          <p className="text-lg text-slate-600 leading-relaxed">
            <strong>Spaced repetition</strong> is a learning technique that can
            transform how you master programming concepts. Instead of cramming
            information and watching it fade, spaced repetition helps you build
            lasting knowledge through strategically timed reviews. In this
            guide, we&apos;ll explore how developers can use spaced repetition to
            learn faster, retain more, and stay ahead in an ever-changing tech
            landscape.
          </p>
        </section>

        {/* Why Developers Need Spaced Repetition */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Code className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Why Developers Need Spaced Repetition
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              Programming is unique among learning domains. Unlike memorizing
              historical dates or vocabulary words, coding requires both{' '}
              <strong>theoretical understanding</strong> and{' '}
              <strong>practical application</strong>. You need to remember:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                <strong>Syntax and APIs:</strong> How to use React hooks, array
                methods, or CSS properties
              </li>
              <li>
                <strong>Concepts and patterns:</strong> What closures are, how
                promises work, when to use certain design patterns
              </li>
              <li>
                <strong>Best practices:</strong> When to use useMemo, how to
                structure components, performance optimization techniques
              </li>
              <li>
                <strong>Problem-solving approaches:</strong> How to debug, how
                to think through algorithms, how to architect solutions
              </li>
            </ul>
            <p className="text-lg text-slate-700 mb-4">
              Traditional learning methods—watching tutorials, reading docs, or
              following along with courses—create weak memory traces. You might
              understand something in the moment, but without reinforcement,
              you&apos;ll forget it. Spaced repetition solves this by ensuring you
              review concepts at optimal intervals, building stronger neural
              pathways over time.
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              The Developer&apos;s Forgetting Problem
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              Consider this scenario: You spend a weekend learning React&apos;s
              Context API. You understand it, you build a small project, and you
              feel confident. Two months later, you need to use Context again,
              but you can&apos;t remember the exact syntax or when to use it versus
              props drilling.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              This happens because:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                <strong>One-time learning doesn&apos;t stick:</strong> Without
                review, memories decay rapidly
              </li>
              <li>
                <strong>Context switching:</strong> You learn many things
                simultaneously, causing interference
              </li>
              <li>
                <strong>Passive consumption:</strong> Watching or reading
                doesn&apos;t create strong memory traces
              </li>
              <li>
                <strong>No reinforcement schedule:</strong> You don&apos;t have a
                system to ensure you&apos;ll remember long-term
              </li>
            </ul>
            <p className="text-lg text-slate-700 mb-4">
              Spaced repetition addresses all of these issues by creating a
              systematic approach to learning that ensures long-term retention.
            </p>
          </div>
        </section>

        {/* How Spaced Repetition Works for Developers */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Rocket className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              How Spaced Repetition Works for Developers
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              Spaced repetition is based on the{' '}
              <Link
                href="/blog/the-forgetting-curve"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                forgetting curve
              </Link>
              —the observation that we forget information exponentially over
              time. Each time you review something, the curve becomes less
              steep, meaning you&apos;ll remember it longer.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              For developers, spaced repetition works like this:
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-3 text-lg text-slate-700">
              <li>
                <strong>Learn a concept:</strong> You study React&apos;s useEffect
                hook, understanding when and how to use it
              </li>
              <li>
                <strong>First review (1 day later):</strong> You test yourself
                on useEffect—what does it do? When do you use it? What&apos;s the
                syntax?
              </li>
              <li>
                <strong>Second review (3 days later):</strong> If you remember
                it well, you review again. If not, you study it more
              </li>
              <li>
                <strong>Third review (1 week later):</strong> The interval
                increases as your memory strengthens
              </li>
              <li>
                <strong>Ongoing reviews:</strong> As you master it, reviews
                become less frequent (2 weeks, 1 month, 3 months)
              </li>
            </ol>
            <p className="text-lg text-slate-700 mb-4">
              The key insight: you spend most of your time reviewing concepts
              you&apos;re about to forget, not things you already know. This makes
              your study time incredibly efficient.
            </p>
          </div>
        </section>

        {/* Practical Strategies */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Practical Strategies for Developers
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              1. Create Code-Specific Flashcards
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              Flashcards aren&apos;t just for vocabulary. For developers, they&apos;re
              perfect for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                <strong>Syntax questions:</strong> &quot;What&apos;s the syntax for
                React&apos;s useState hook?&quot;
              </li>
              <li>
                <strong>Concept explanations:</strong> &quot;Explain JavaScript
                closures in your own words&quot;
              </li>
              <li>
                <strong>Code snippets:</strong> Show a code example and ask
                &quot;What does this do?&quot; or &quot;What&apos;s wrong with this code?&quot;
              </li>
              <li>
                <strong>Best practices:</strong> &quot;When should you use useMemo
                vs useCallback?&quot;
              </li>
              <li>
                <strong>Problem-solving:</strong> &quot;How would you implement a
                debounce function?&quot;
              </li>
            </ul>
            <p className="text-lg text-slate-700 mb-4">
              <strong>Example flashcard for React:</strong>
            </p>
            <BlogFlashcardDemo
              question="What&apos;s the difference between useEffect with an empty dependency array and useEffect with no dependency array?"
              answer="useEffect with an empty array [] runs once after the initial render (like componentDidMount). useEffect with no dependency array runs after every render, which can cause infinite loops if you&apos;re updating state inside it."
              category="React"
            />
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              2. Use Active Recall, Not Passive Review
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              When reviewing, don&apos;t just re-read your notes or watch the
              tutorial again. Instead, <strong>actively recall</strong> the
              information:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                <strong>Write code from memory:</strong> Try to write a React
                component without looking at documentation
              </li>
              <li>
                <strong>Explain concepts out loud:</strong> Teach someone (or
                yourself) how closures work
              </li>
              <li>
                <strong>Solve problems:</strong> Implement a function you learned
                last week without checking your previous code
              </li>
              <li>
                <strong>Answer questions:</strong> Use flashcards to test your
                knowledge
              </li>
            </ul>
            <p className="text-lg text-slate-700 mb-4">
              Active recall is significantly more effective than passive review
              because it strengthens memory retrieval pathways.
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              3. Integrate Spaced Repetition into Your Workflow
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              Don&apos;t treat spaced repetition as a separate activity. Integrate it
              into your daily development routine:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                <strong>Morning review:</strong> Spend 10-15 minutes reviewing
                flashcards before starting work
              </li>
              <li>
                <strong>After learning something new:</strong> Create flashcards
                immediately, then review them the next day
              </li>
              <li>
                <strong>Weekly review session:</strong> Set aside time each week
                to review concepts you learned weeks or months ago
              </li>
              <li>
                <strong>Before interviews:</strong> Use spaced repetition to
                prepare for technical interviews systematically
              </li>
            </ul>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              4. Focus on Understanding, Not Just Memorization
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              Spaced repetition works best when you understand concepts deeply.
              Don&apos;t just memorize syntax—understand the &quot;why&quot; behind it:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                <strong>Understand the problem it solves:</strong> Why does
                React need hooks? What problem do they solve?
              </li>
              <li>
                <strong>Know when to use it:</strong> When should you use
                useMemo? When is it unnecessary?
              </li>
              <li>
                <strong>Understand trade-offs:</strong> What are the
                performance implications? What are the alternatives?
              </li>
            </ul>
            <p className="text-lg text-slate-700 mb-4">
              When you understand deeply,{' '}
              <Link
                href="/blog/spaced-repetition-for-developers"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                spaced repetition
              </Link>{' '}
              helps you remember that understanding long-term. Combine this with{' '}
              <Link
                href="/blog/active-recall-for-developers"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                active recall techniques
              </Link>{' '}
              for maximum effectiveness.
            </p>
          </div>
        </section>

        {/* Real-World Examples */}
        <section className="mb-12 bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Real-World Examples: Learning JavaScript Concepts
          </h2>
          <div className="prose prose-lg max-w-none">
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              Example 1: Learning React Hooks
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              <strong>Day 1:</strong> Learn useState and useEffect. Create
              flashcards for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>&quot;What&apos;s the useState syntax?&quot;</li>
              <li>&quot;When do you use useEffect?&quot;</li>
              <li>&quot;What&apos;s the difference between useEffect and componentDidMount?&quot;</li>
            </ul>
            <p className="text-lg text-slate-700 mb-4">
              <strong>Day 2:</strong> Review the flashcards. If you remember
              them, mark as &quot;easy&quot; and schedule for 3 days later.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              <strong>Day 5:</strong> Review again. If still easy, schedule for
              1 week later.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              <strong>Week 2:</strong> Review. By now, you should have a solid
              understanding. Schedule for 2 weeks later.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              <strong>Month 1:</strong> Final review. If you still remember
              it, you&apos;ve likely mastered it long-term.
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              Example 2: Learning JavaScript Closures
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              <strong>Flashcard 1:</strong> &quot;What is a closure in JavaScript?&quot;
            </p>
            <p className="text-lg text-slate-700 mb-4">
              <strong>Flashcard 2:</strong> Show code example and ask &quot;What does
              this output and why?&quot;
            </p>
            <BlogCodeSnippetFlashcardDemo
              question="What does this output and why?"
              code={`function outer() {
  let count = 0;
  return function inner() {
    count++;
    return count;
  };
}
const counter = outer();
console.log(counter()); // ?
console.log(counter()); // ?`}
              answer="The output is `1` then `2`. This demonstrates closures: the `inner` function has access to the `count` variable from its outer scope even after `outer` has finished executing. Each call to `counter()` increments and returns the same `count` variable."
              category="JavaScript"
            />
            <p className="text-lg text-slate-700 mb-4">
              <strong>Flashcard 3:</strong> &quot;When would you use closures in
              real code?&quot;
            </p>
            <p className="text-lg text-slate-700 mb-4">
              Review these at increasing intervals. Each review strengthens your
              understanding and helps you apply closures in real projects.
            </p>
          </div>
        </section>

        {/* Tools and Platforms */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Tools and Platforms for Developers
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              While you can use any spaced repetition tool, some are better
              suited for developers:
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              General-Purpose Tools
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                <strong>Anki:</strong> Powerful and free, but requires setup
                and doesn&apos;t have built-in code support
              </li>
              <li>
                <strong>Quizlet:</strong> Easy to use, but not optimized for
                programming concepts
              </li>
            </ul>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              Developer-Specific Platforms
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              <strong>FlashDeck</strong> is designed specifically for developers
              learning programming concepts. It offers:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                <strong>Code snippet cards:</strong> Flashcards with syntax
                highlighting for code examples
              </li>
              <li>
                <strong>Curated content:</strong> Pre-made flashcards for
                JavaScript, React, CSS, and more
              </li>
              <li>
                <strong>Multiple card types:</strong> Basic, multiple choice,
                fill-in-the-blank, and code snippets
              </li>
              <li>
                <strong>Spaced repetition algorithm:</strong> Automatically
                schedules reviews at optimal intervals. This{' '}
                <Link
                  href="/blog/spaced-repetition-for-developers"
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  spaced repetition learning method
                </Link>{' '}
                ensures you review concepts right before you&apos;re about to forget
              </li>
              <li>
                <strong>Progress tracking:</strong> See your mastery grow over
                time
              </li>
            </ul>
            <p className="text-lg text-slate-700 mb-4">
              The advantage of developer-specific tools is that they understand
              the unique needs of learning code—syntax highlighting, code
              formatting, and programming-specific question types.
            </p>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="mb-12 bg-amber-50 border border-amber-200 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Common Mistakes Developers Make
          </h2>
          <div className="prose prose-lg max-w-none">
            <ul className="list-disc pl-6 mb-4 space-y-3 text-lg text-slate-700">
              <li>
                <strong>Only memorizing syntax:</strong> Understanding concepts
                is more important than memorizing exact syntax (you can always
                look up syntax)
              </li>
              <li>
                <strong>Creating too many cards at once:</strong> Start with
                10-20 cards, not 100. Quality over quantity.
              </li>
              <li>
                <strong>Not being honest about performance:</strong> If you
                mark everything as &quot;easy&quot; when it&apos;s not, the algorithm won&apos;t
                work
              </li>
              <li>
                <strong>Skipping reviews:</strong> Consistency is key. Missing
                reviews disrupts the spaced repetition schedule
              </li>
              <li>
                <strong>Only using flashcards:</strong> Combine spaced
                repetition with building projects and writing code
              </li>
              <li>
                <strong>Reviewing too frequently:</strong> Trust the algorithm.
                If you review too often, you&apos;re not maximizing efficiency
              </li>
            </ul>
          </div>
        </section>

        {/* Measuring Success */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Measuring Your Success
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              How do you know spaced repetition is working? Look for these
              signs:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                <strong>Faster recall:</strong> You remember concepts more
                quickly when you need them
              </li>
              <li>
                <strong>Less documentation checking:</strong> You need to look up
                syntax less often
              </li>
              <li>
                <strong>Better interviews:</strong> You can explain concepts
                clearly without hesitation
              </li>
              <li>
                <strong>Long-term retention:</strong> You remember concepts you
                learned months ago
              </li>
              <li>
                <strong>Confidence:</strong> You feel more confident in your
                knowledge
              </li>
            </ul>
            <p className="text-lg text-slate-700 mb-4">
              Track your progress over time. Most spaced repetition tools
              provide statistics showing how many cards you&apos;ve mastered, your
              review schedule, and your retention rate.
            </p>
          </div>
        </section>

        {/* Conclusion */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Conclusion</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              Spaced repetition is one of the most powerful learning techniques
              available to developers. By reviewing concepts at optimal
              intervals, you can transform temporary understanding into lasting
              knowledge.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              The key is to start small and be consistent. Don&apos;t try to create
              100 flashcards on day one. Instead, combine spaced repetition with{' '}
              <Link
                href="/blog/active-recall-for-developers"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                active recall techniques
              </Link>{' '}
              for maximum effectiveness:
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>Pick 5-10 concepts you want to master</li>
              <li>Create flashcards for each one</li>
              <li>Review them daily for the first week</li>
              <li>Let the spaced repetition algorithm schedule future reviews</li>
              <li>Add new concepts gradually</li>
            </ol>
            <p className="text-lg text-slate-700 mb-4">
              Over time, you&apos;ll build a comprehensive knowledge base that stays
              with you long-term. Instead of constantly re-learning the same
              concepts, you&apos;ll have a solid foundation that grows stronger with
              each review.
            </p>
            <p className="text-lg text-slate-700 mb-6">
              In a field that changes as rapidly as software development, spaced
              repetition gives you a systematic way to stay current and build
              expertise. Start today, and in a few months, you&apos;ll be amazed at
              how much you remember.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Learning Faster?
          </h2>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
            FlashDeck makes spaced repetition easy for developers. Get curated
            flashcards for JavaScript, React, and CSS, plus tools to create
            your own. Start building lasting knowledge today.
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

