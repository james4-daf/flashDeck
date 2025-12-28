'use client';

import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function AppHeader() {
  const { user } = useUser();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/flashdeckLogo.png"
              alt="FlashDeck"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-bold text-slate-900">FlashDeck</h1>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/my-decks">
              <Button
                variant="outline"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                My Decks
              </Button>
            </Link>
            <Link href="/library">
              <Button
                variant="outline"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                Library
              </Button>
            </Link>
            <Link href="/community">
              <Button
                variant="outline"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                Community
              </Button>
            </Link>
            <Link href="/profile">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full p-2 h-9 w-9 flex items-center justify-center"
                title={
                  user
                    ? `Profile - ${user.firstName || user.emailAddresses[0]?.emailAddress}`
                    : 'Profile'
                }
              >
                <User className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
