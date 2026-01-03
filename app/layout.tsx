import ConvexClientProvider from '@/app/ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';

import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { Rubik } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  preload: true,
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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FlashDeck',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${rubik.className}`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WNPKRD7HPF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WNPKRD7HPF');
          `}
        </Script>
        <ClerkProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
