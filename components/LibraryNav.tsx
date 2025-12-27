'use client';

import { Button } from '@/components/ui/button';
import { SignOutButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export function LibraryNav() {
  const { user } = useUser();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-slate-900">FlashDeck</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                Dashboard
              </Button>
            </Link>
            {user && (
              <span className="hidden sm:inline text-sm text-slate-600">
                {user.firstName || user.emailAddresses[0]?.emailAddress}
              </span>
            )}
            <SignOutButton>
              <button className="bg-red-600 text-white px-2 sm:px-4 py-2 rounded-xl hover:bg-red-700 transition-colors text-xs sm:text-sm">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </nav>
  );
}

