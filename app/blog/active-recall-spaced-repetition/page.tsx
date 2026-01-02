import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Brain, Target, TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title:
    'The Power of Active Recall Testing and Spaced Repetition: Science-Backed Learning Strategies',
  description:
    'Discover how active recall testing and spaced repetition can transform your learning. Learn the science behind these powerful techniques and how to implement them for maximum retention.',
  keywords: [
    'active recall',
    'spaced repetition',
    'learning techniques',
    'memory retention',
    'study methods',
    'flashcards',
    'cognitive science',
    'learning strategies',
    'memory improvement',
    'effective studying',
    'retrieval practice',
    'forgetting curve',
  ],
  authors: [{ name: 'FlashDeck' }],
  creator: 'FlashDeck',
  publisher: 'FlashDeck',
  metadataBase: new URL('https://flashdeck.dev'),
  alternates: {
    canonical: '/blog/active-recall-spaced-repetition',
  },
  openGraph: {
    type: 'article',
    locale: 'en_US',
    url: 'https://flashdeck.dev/blog/active-recall-spaced-repetition',
    siteName: 'FlashDeck',
    title: 'The Power of Active Recall Testing and Spaced Repetition',
    description:
      'Discover how active recall testing and spaced repetition can transform your learning. Learn the science behind these powerful techniques.',
    images: [
      {
        url: '/flashdeckLogo.png',
        width: 1200,
        height: 630,
        alt: 'Active Recall and Spaced Repetition Learning',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Power of Active Recall Testing and Spaced Repetition',
    description:
      'Discover how active recall testing and spaced repetition can transform your learning.',
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
  headline: 'The Power of Active Recall Testing and Spaced Repetition',
  description:
    'Discover how active recall testing and spaced repetition can transform your learning. Learn the science behind these powerful techniques.',
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
    '@id': 'https://flashdeck.dev/blog/active-recall-spaced-repetition',
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
            The Power of Active Recall Testing and Spaced Repetition:
            Science-Backed Learning Strategies
          </h1>
          <div className="flex items-center gap-4 text-slate-600 text-sm">
            <time dateTime="2026-01-01">January 01, 2026</time>
            <span>•</span>
            <span>10 min read</span>
          </div>
        </header>

        {/* Introduction */}
        <section className="prose prose-lg max-w-none mb-12">
          <p className="text-xl text-slate-700 leading-relaxed mb-6">
            Have you ever spent hours re-reading notes or watching tutorials,
            only to forget everything a week later? You&apos;re not alone.
            Traditional study methods like passive reading and highlighting are
            surprisingly ineffective for long-term retention. But there&apos;s a
            better way:
            <strong> active recall testing</strong> combined with{' '}
            <strong>spaced repetition</strong>.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed">
            These two learning techniques, backed by decades of cognitive
            science research, can dramatically improve your ability to retain
            information. Whether you&apos;re learning JavaScript, preparing for
            exams, or mastering any new skill, understanding and implementing
            these strategies can transform your learning efficiency.
          </p>
        </section>

        {/* What is Active Recall */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              What is Active Recall Testing?
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              <strong>Active recall</strong> (also known as retrieval practice)
              is the process of actively retrieving information from memory
              rather than passively reviewing it. Instead of re-reading your
              notes, you test yourself by trying to recall the information
              without looking at the source material.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              Think of it like the difference between watching someone play
              tennis versus actually playing tennis yourself. Active recall
              forces your brain to work harder, strengthening neural pathways
              and making information more accessible in the future.
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              The Science Behind Active Recall
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              Research by cognitive scientists like{' '}
              <strong>Henry Roediger</strong> and{' '}
              <strong>Jeffrey Karpicke</strong> has consistently shown that
              retrieval practice is far more effective than re-reading. In one
              landmark study, students who used active recall remembered 50%
              more information after a week compared to those who simply re-read
              their notes.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              The reason? When you actively retrieve information, you&apos;re
              not just reviewing it—you&apos;re strengthening the memory trace
              itself. This process, known as the <strong>testing effect</strong>
              , makes memories more durable and easier to access later.
            </p>
          </div>
        </section>

        {/* What is Spaced Repetition */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Understanding Spaced Repetition
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              <strong>Spaced repetition</strong> is a learning technique that
              involves reviewing information at increasing intervals over time.
              Instead of cramming everything in one session, you space out your
              reviews strategically to maximize retention.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              The concept is based on the <strong>forgetting curve</strong>,
              discovered by German psychologist{' '}
              <strong>Hermann Ebbinghaus</strong> in the 1880s. Ebbinghaus found
              that we forget information exponentially over time, but each time
              we review it, the forgetting curve becomes less steep.
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              How Spaced Repetition Works
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              Spaced repetition algorithms schedule reviews based on your
              performance:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                <strong>New material:</strong> Review frequently (daily or every
                other day)
              </li>
              <li>
                <strong>Familiar material:</strong> Review at longer intervals
                (weekly, monthly)
              </li>
              <li>
                <strong>Mastered material:</strong> Review only when you&apos;re
                about to forget it
              </li>
            </ul>
            <p className="text-lg text-slate-700 mb-4">
              This approach ensures you spend most of your time on material you
              haven&apos;t mastered yet, while still maintaining your knowledge
              of previously learned concepts.
            </p>
          </div>
        </section>

        {/* Why They Work Together */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Why Active Recall and Spaced Repetition Work Better Together
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              While both techniques are powerful on their own, combining active
              recall with spaced repetition creates a{' '}
              <strong>synergistic effect</strong> that dramatically improves
              learning outcomes.
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              The Perfect Learning Loop
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              Here&apos;s how they work together:
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-3 text-lg text-slate-700">
              <li>
                <strong>Active recall tests your knowledge:</strong> You attempt
                to retrieve information from memory, identifying gaps in your
                understanding.
              </li>
              <li>
                <strong>Spaced repetition optimizes timing:</strong> The
                algorithm schedules your next review at the optimal moment—right
                before you&apos;re about to forget.
              </li>
              <li>
                <strong>Each review strengthens memory:</strong> Every retrieval
                practice session makes the memory trace more durable.
              </li>
              <li>
                <strong>Intervals increase as mastery grows:</strong> As you get
                better at recalling information, reviews become less frequent
                but more effective.
              </li>
            </ol>
            <p className="text-lg text-slate-700 mb-4">
              This combination is particularly effective for learning
              programming concepts, technical terminology, and theoretical
              knowledge—exactly what you need when mastering JavaScript, React,
              or any other technical skill.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-12 bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            The Benefits: Why This Matters
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                🧠 Better Long-Term Retention
              </h3>
              <p className="text-slate-700">
                Studies show that spaced repetition with active recall can
                improve retention by up to 200% compared to traditional study
                methods.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                ⏱️ More Efficient Learning
              </h3>
              <p className="text-slate-700">
                You spend less time studying overall because you focus on
                material you&apos;re about to forget, not what you already know.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                🎯 Identifies Knowledge Gaps
              </h3>
              <p className="text-slate-700">
                Active recall immediately shows you what you don&apos;t know,
                allowing you to target your study time more effectively.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                📈 Builds Confidence
              </h3>
              <p className="text-slate-700">
                Regular practice with immediate feedback helps build confidence
                in your knowledge and reduces test anxiety.
              </p>
            </div>
          </div>
        </section>

        {/* How to Implement */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              How to Implement Active Recall and Spaced Repetition
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              1. Use Flashcards
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              Flashcards are the perfect tool for active recall. Each card
              presents a question or prompt, forcing you to retrieve the answer
              from memory. When combined with a spaced repetition algorithm,
              flashcards become incredibly powerful.
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              2. Test Yourself Regularly
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              Instead of re-reading your notes, close the book and try to
              explain concepts in your own words. Write down what you remember,
              then check your notes to see what you missed.
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              3. Use Spaced Repetition Software
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              Modern spaced repetition systems automatically schedule your
              reviews based on your performance. These tools handle the timing
              so you can focus on learning.
            </p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
              4. Be Honest About Your Performance
            </h3>
            <p className="text-lg text-slate-700 mb-4">
              The effectiveness of spaced repetition depends on accurate
              self-assessment. If you got something wrong, mark it as such. The
              algorithm will adjust and schedule it for review sooner.
            </p>
          </div>
        </section>

        {/* Real-World Applications */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Real-World Applications: Learning Programming
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              For developers learning JavaScript, React, or other programming
              concepts, active recall and spaced repetition are particularly
              valuable. Programming involves both theoretical knowledge (how
              closures work, what React hooks do) and practical application.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              Here&apos;s how to apply these techniques:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-slate-700">
              <li>
                <strong>Create flashcards for concepts:</strong> &quot;What is a
                closure in JavaScript?&quot; or &quot;Explain the difference
                between useState and useEffect&quot;
              </li>
              <li>
                <strong>Include code examples:</strong> Show a code snippet and
                ask what it does, or ask how to implement a specific pattern
              </li>
              <li>
                <strong>Review regularly:</strong> Use spaced repetition to
                ensure you don&apos;t forget fundamental concepts as you learn
                new ones
              </li>
              <li>
                <strong>Test your understanding:</strong> Try to explain
                concepts without looking at documentation
              </li>
            </ul>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="mb-12 bg-amber-50 border border-amber-200 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Common Mistakes to Avoid
          </h2>
          <div className="prose prose-lg max-w-none">
            <ul className="list-disc pl-6 mb-4 space-y-3 text-lg text-slate-700">
              <li>
                <strong>Peeking at answers too quickly:</strong> Give yourself
                time to try recalling before checking the answer. The struggle
                is part of the learning process.
              </li>
              <li>
                <strong>Not being honest about performance:</strong> If you mark
                everything as &quot;easy&quot; when it&apos;s not, the spaced
                repetition algorithm won&apos;t work effectively.
              </li>
              <li>
                <strong>Skipping reviews:</strong> Consistency is key. Missing
                scheduled reviews disrupts the spaced repetition schedule.
              </li>
              <li>
                <strong>Creating too many cards at once:</strong> Start with a
                manageable number and build gradually. Quality over quantity.
              </li>
            </ul>
          </div>
        </section>

        {/* Conclusion */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Conclusion</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              Active recall testing and spaced repetition aren&apos;t just study
              techniques—they&apos;re evidence-based methods that leverage how
              your brain actually learns and remembers. By combining the power
              of retrieval practice with optimal timing, you can dramatically
              improve your learning efficiency and long-term retention.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              Whether you&apos;re learning JavaScript theory, preparing for
              certifications, or mastering any new skill, these techniques can
              help you build lasting knowledge instead of temporary familiarity.
            </p>
            <p className="text-lg text-slate-700 mb-6">
              The best part? You don&apos;t have to implement these strategies
              manually. Modern learning platforms like FlashDeck combine active
              recall flashcards with intelligent spaced repetition algorithms,
              making it easy to apply these powerful techniques to your learning
              journey.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
            Start using active recall and spaced repetition today with
            FlashDeck. Master JavaScript, React, and CSS concepts faster with
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
