import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

interface PublicNavProps {
  logoHref?: string;
  rightContent?: ReactNode;
  maxWidth?: 'default' | 'narrow';
  variant?: 'transparent' | 'solid';
  showLogo?: boolean;
  logoText?: string;
}

export function PublicNav({
  logoHref = '/',
  rightContent,
  maxWidth = 'default',
  variant = 'transparent',
  showLogo = true,
  logoText = 'FlashDeck',
}: PublicNavProps) {
  const maxWidthClass =
    maxWidth === 'narrow' ? 'max-w-4xl' : 'max-w-7xl';
  const bgClass =
    variant === 'solid'
      ? 'bg-white shadow-sm'
      : 'bg-white/80 backdrop-blur-sm';

  return (
    <nav
      className={`${bgClass} border-b border-slate-200 sticky top-0 z-50 safe-top`}
    >
      <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex justify-between items-center h-16">
          {showLogo ? (
            <Link href={logoHref} className="flex items-center gap-2">
              <Image
                src="/flashdeckLogo.png"
                alt="FlashDeck"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold text-slate-900">{logoText}</h1>
            </Link>
          ) : (
            <Link
              href={logoHref}
              className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors"
            >
              {logoText}
            </Link>
          )}
          {rightContent}
        </div>
      </div>
    </nav>
  );
}

