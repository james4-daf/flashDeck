import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Learning Tips and Strategies',
  description:
    'Discover evidence-based learning strategies, study tips, and insights about spaced repetition, active recall, and effective learning techniques.',
  keywords: [
    'learning tips',
    'study strategies',
    'spaced repetition',
    'active recall',
    'learning blog',
    'educational content',
  ],
  metadataBase: new URL('https://flashdeck.dev'),
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://flashdeck.dev/blog',
    siteName: 'FlashDeck',
    title: 'FlashDeck Blog - Learning Tips and Strategies',
    description:
      'Discover evidence-based learning strategies and study tips for mastering programming and technical skills.',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

