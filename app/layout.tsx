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
  title: 'FlashDeck',
  description: 'FlashDeck',
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
