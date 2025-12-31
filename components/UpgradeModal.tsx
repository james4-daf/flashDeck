'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { calculateSavings } from '@/lib/subscription';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>(
    'annual',
  );

  const handleCheckout = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingCycle: selectedPlan,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setLoading(false);
    }
  };

  const monthlyPrice = 5.99;
  const annualPrice = 39;
  const savings = calculateSavings(monthlyPrice, annualPrice);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade to Premium</DialogTitle>
          <DialogDescription>
            Unlock all features and access 20+ premium topics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Selection */}
          <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setSelectedPlan('annual')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
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
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                selectedPlan === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Pricing Display */}
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900">
              ${selectedPlan === 'annual' ? annualPrice : monthlyPrice}
              {selectedPlan === 'monthly' && (
                <span className="text-lg font-normal text-slate-600">
                  /month
                </span>
              )}
              {selectedPlan === 'annual' && (
                <span className="text-lg font-normal text-slate-600">
                  /year
                </span>
              )}
            </div>
            {selectedPlan === 'annual' && (
              <p className="mt-1 text-sm text-slate-600">
                ${(annualPrice / 12).toFixed(2)}/month billed annually
              </p>
            )}
          </div>

          {/* Feature List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Premium Features:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Unlimited user-created decks and cards
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Unlimited cards per study session
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Unlimited important cards
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Public deck sharing
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Unlimited progress history
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                20+ premium topics (JavaScript Under the Hood, Advanced React,
                Next.js, TypeScript, and more)
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700"
          >
            {loading ? 'Processing...' : `Upgrade to Premium`}
          </Button>

          <p className="text-center text-xs text-slate-500">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
