'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';
import { calculateSavings } from '@/lib/subscription';

export default function PricingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>(
    'annual',
  );

  const monthlyPrice = 5.99;
  const annualPrice = 39;
  const savings = calculateSavings(monthlyPrice, annualPrice);

  const handleCheckout = async (billingCycle: 'monthly' | 'annual') => {
    if (!user?.id) {
      // Redirect to login
      window.location.href = '/';
      return;
    }

    setLoading(billingCycle);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        setLoading(null);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard">
              <h1 className="text-xl font-bold text-slate-900">FlashDeck</h1>
            </Link>
            {user ? (
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Master JavaScript and React theory with spaced repetition. Start
            free, upgrade when you're ready.
          </p>
        </div>

        {/* Plan Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setSelectedPlan('annual')}
              className={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
                selectedPlan === 'annual'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual
              {selectedPlan === 'annual' && (
                <span className="ml-2 text-xs text-green-600">
                  Save {savings}%
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
                selectedPlan === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-600">/forever</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>5 pre-loaded topics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>1 user-created deck</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>12 cards max per deck</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Basic flashcard types</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>5 important cards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>30 days progress history</span>
                </li>
              </ul>
              {user ? (
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Current Plan
                  </Button>
                </Link>
              ) : (
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${selectedPlan === 'annual' ? annualPrice : monthlyPrice}
                </span>
                <span className="text-slate-600">
                  /{selectedPlan === 'annual' ? 'year' : 'month'}
                </span>
                {selectedPlan === 'annual' && (
                  <p className="text-sm text-slate-600 mt-1">
                    ${(annualPrice / 12).toFixed(2)}/month billed annually
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>
                    <strong>20+ premium topics</strong> (JavaScript Under the
                    Hood, Advanced React, Next.js, TypeScript, and more)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>
                    <strong>Unlimited</strong> user-created decks
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>
                    <strong>Unlimited</strong> cards per deck
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>
                    <strong>Unlimited</strong> cards per session
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Code snippet & fill-in-the-blank flashcards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>
                    <strong>Unlimited</strong> important cards
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Public deck sharing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>
                    <strong>Unlimited</strong> progress history
                  </span>
                </li>
              </ul>
              <Button
                onClick={() => handleCheckout(selectedPlan)}
                disabled={!!loading}
                className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700"
              >
                {loading === selectedPlan
                  ? 'Processing...'
                  : `Upgrade to Premium`}
              </Button>
              <p className="text-center text-xs text-slate-500">
                Secure payment powered by Stripe. Cancel anytime.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-slate-600 text-sm">
                Yes, you can cancel your subscription at any time. You'll
                continue to have access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                What happens to my data if I cancel?
              </h3>
              <p className="text-slate-600 text-sm">
                Your data is always safe. If you cancel, you'll keep access to
                free features and can upgrade again anytime to restore premium
                access.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-slate-600 text-sm">
                We offer a 30-day money-back guarantee. If you're not satisfied,
                contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

