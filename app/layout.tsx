import ConvexClientProvider from '@/app/ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Fredoka } from 'next/font/google';
import './globals.css';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FlashDeck - Master JavaScript Theory with Spaced Repetition',
    template: '%s | FlashDeck',
  },
  description:
    'Learn JavaScript, React, and CSS concepts faster with science-backed spaced repetition. Build lasting knowledge with expertly crafted flashcards. Free forever, upgrade for premium topics.',
  keywords: [
    'flashcards',
    'spaced repetition',
    'JavaScript learning',
    'React flashcards',
    'programming flashcards',
    'web development',
    'coding flashcards',
    'JavaScript theory',
    'React theory',
    'CSS flashcards',
  ],
  authors: [{ name: 'FlashDeck' }],
  creator: 'FlashDeck',
  publisher: 'FlashDeck',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://flashdeck.dev'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://flashdeck.dev',
    siteName: 'FlashDeck',
    title: 'FlashDeck - Master JavaScript Theory with Spaced Repetition',
    description:
      'Learn JavaScript, React, and CSS concepts faster with science-backed spaced repetition. Build lasting knowledge with expertly crafted flashcards.',
    images: [
      {
        url: '/flashdeckLogo.png',
        width: 1200,
        height: 630,
        alt: 'FlashDeck - JavaScript Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlashDeck - Master JavaScript Theory with Spaced Repetition',
    description:
      'Learn JavaScript, React, and CSS concepts faster with science-backed spaced repetition.',
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
  icons: {
    icon: '/flashdeckLogo.png',
    shortcut: '/flashdeckLogo.png',
    apple: '/flashdeckLogo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${fredoka.className}`}>
        <ClerkProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}
