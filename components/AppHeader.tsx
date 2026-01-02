'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useUser } from '@clerk/nextjs';
import { Menu, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export function AppHeader() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/my-decks', label: 'My Decks' },
    { href: '/library', label: 'Library' },
    { href: '/community', label: 'Community' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16" data-onboarding="header-nav">
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

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="outline"
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
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

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center gap-2">
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
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full p-2 h-9 w-9 flex items-center justify-center"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
