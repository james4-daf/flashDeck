'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateSavings } from '@/lib/subscription';
import { useUser } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function PricingSection() {
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
      window.location.href = '/login';
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
    <>
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Master JavaScript and React theory with spaced repetition. Start free,
          upgrade when you&apos;re ready.
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
      <div className="relative max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-0 items-start lg:items-start">
          {/* Free Plan */}
          <Card className="w-full lg:w-[48%] lg:z-10 bg-white shadow-lg px-[38px]">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-600">/forever</span>
              </div>
              <p className="text-slate-600 mt-2 text-sm">
                Start learning JavaScript theory right now.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>5 pre-loaded topics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>1 user-created deck</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>12 cards max per deck</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Basic flashcard types</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>5 important cards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>30 days progress history</span>
                </li>
              </ul>
              {user ? (
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Current Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="w-full lg:w-[52%] lg:-ml-8 lg:-mt-2 lg:mb-2 lg:z-20 relative bg-slate-900 text-white border-slate-800 shadow-xl">
            <div className="absolute top-4 right-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader className="pb-0">
              <CardTitle className="text-2xl text-white">Premium</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">
                  ${selectedPlan === 'annual' ? annualPrice : monthlyPrice}
                </span>
                <span className="text-slate-300">
                  /{selectedPlan === 'annual' ? 'year' : 'month'}
                </span>
              </div>
              <p className="text-slate-300 mt-3 text-sm">
                Master JavaScript theory at maximum speed.
              </p>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  <span>
                    <strong>Unlimited</strong> user-created decks
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  <span>
                    <strong>Unlimited</strong> cards per deck
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  <span>
                    <strong>Unlimited</strong> cards per session
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  <span>
                    <strong>Unlimited</strong> important cards
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  <span>Public deck sharing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  <span>
                    <strong>Unlimited</strong> progress history
                  </span>
                </li>
              </ul>
              <div className="pt-2">
                <Button
                  onClick={() => handleCheckout(selectedPlan)}
                  disabled={!!loading}
                  className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700 text-white"
                >
                  {loading === selectedPlan ? 'Processing...' : `Get Started`}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-center text-xs text-slate-400 mt-3">
                  Secure payment powered by Stripe. Cancel anytime.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Can I cancel anytime?
            </h4>
            <p className="text-slate-600 text-sm">
              Yes, you can cancel your subscription at any time. You&apos;ll
              continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              What happens to my data if I cancel?
            </h4>
            <p className="text-slate-600 text-sm">
              Your data is always safe. If you cancel, you&apos;ll keep access
              to free features and can upgrade again anytime to restore premium
              access.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Do you offer refunds?
            </h4>
            <p className="text-slate-600 text-sm">
              We offer a 30-day money-back guarantee. If you&apos;re not
              satisfied, contact us for a full refund.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
