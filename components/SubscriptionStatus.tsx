'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import Link from 'next/link';
import { UpgradeModal } from './UpgradeModal';
import { useState } from 'react';

export function SubscriptionStatus() {
  const { user } = useUser();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const subscriptionStatus = useQuery(
    api.subscriptions.getSubscriptionStatus,
    user?.id ? { userId: user.id } : 'skip',
  );

  if (!user || !subscriptionStatus) {
    return null;
  }

  const isPremium = subscriptionStatus.isPremium;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Current Plan
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {isPremium ? 'Premium' : 'Free'}
              </p>
            </div>

            {isPremium ? (
              <div className="space-y-2">
                {subscriptionStatus.subscriptionEndsAt && (
                  <p className="text-xs text-slate-600">
                    {subscriptionStatus.daysRemaining !== null &&
                      subscriptionStatus.daysRemaining > 0 && (
                        <>
                          Renews in {subscriptionStatus.daysRemaining} day
                          {subscriptionStatus.daysRemaining !== 1 ? 's' : ''}
                        </>
                      )}
                  </p>
                )}
                <Link href="/dashboard?manage=subscription">
                  <Button variant="outline" className="w-full">
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-600">
                  Upgrade to unlock all features
                </p>
                <Button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Upgrade to Premium
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showUpgradeModal && (
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
        />
      )}
    </>
  );
}

