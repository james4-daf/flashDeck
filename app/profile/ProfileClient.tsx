'use client';

import { AppHeader } from '@/components/AppHeader';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { SignedIn, SignedOut, SignOutButton, useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function RedirectToLogin() {
  const router = useRouter();
  useEffect(() => {
    router.push('/login');
  }, [router]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <p className="text-slate-600">
        Not authenticated - redirecting to login...
      </p>
    </div>
  );
}

function ProfileContent() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const subscriptionStatus = useQuery(
    api.subscriptions.getSubscriptionStatus,
    user?.id ? { userId: user.id } : 'skip',
  );

  // Fetch study counts for activity section
  const studyCounts = useQuery(api.userProgress.getStudyCounts, {
    userId: user?.id || '',
  });

  // Fetch user preferences for onboarding status
  const userPreferences = useQuery(api.userPreferences.getUserPreferences, {
    userId: user?.id || '',
  });

  const resetOnboarding = useMutation(api.userPreferences.resetOnboarding);

  const router = useRouter();

  const handleManageSubscription = async () => {
    if (!user?.id || !subscriptionStatus?.stripeCustomerId) return;
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch (err) {
      console.error('Error creating portal session:', err);
      setLoading(false);
    }
  };

  const handleReplayOnboarding = async () => {
    if (!user?.id) return;
    try {
      await resetOnboarding({ userId: user.id });
      // Redirect to dashboard where onboarding will be shown
      router.push('/dashboard');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const formatDate = (timestamp?: number) =>
    timestamp
      ? new Date(timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'N/A';

  const getStatusBadge = () => {
    if (!subscriptionStatus) return null;
    if (subscriptionStatus.isPremium && subscriptionStatus.isActive)
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          ✓ Premium Active
        </span>
      );
    if (subscriptionStatus.status === 'trial')
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          Trial Active
        </span>
      );
    if (subscriptionStatus.status === 'cancelled')
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          Cancelled (Active until renewal)
        </span>
      );
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
        Free
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Profile
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Manage your account and subscription
          </p>
        </div>

        <div className="space-y-6">
          {/* Study Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle>Study Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {studyCounts ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      {studyCounts.daily}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500">
                      Today
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {studyCounts.weekly}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500">
                      This Week
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">
                      {studyCounts.monthly}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500">
                      This Month
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-slate-600">
                      {studyCounts.total}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500">
                      Total
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Loading activity...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Name
                </label>
                <p className="text-slate-900 mt-1">
                  {user?.firstName ||
                    user?.emailAddresses[0]?.emailAddress ||
                    'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <p className="text-slate-900 mt-1">
                  {user?.emailAddresses[0]?.emailAddress || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  User ID
                </label>
                <p className="text-slate-500 text-sm mt-1 font-mono">
                  {user?.id || 'N/A'}
                </p>
              </div>
              <div className="pt-4 border-t">
                <SignOutButton>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Sign Out
                  </Button>
                </SignOutButton>
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Card */}
          <Card>
            <CardHeader>
              <CardTitle>Onboarding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <div className="mt-1">
                  {userPreferences?.hasCompletedOnboarding ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ✓ Completed
                      </span>
                      {userPreferences.completedOnboardingAt && (
                        <span className="text-sm text-slate-500">
                          on {formatDate(userPreferences.completedOnboardingAt)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Not Completed
                    </span>
                  )}
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button
                  onClick={handleReplayOnboarding}
                  variant="outline"
                  className="w-full"
                >
                  Replay Onboarding Tour
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  Take the tour again to learn about FlashDeck features
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Subscription</CardTitle>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionStatus ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Plan
                    </label>
                    <p className="text-slate-900 mt-1 capitalize">
                      {subscriptionStatus.plan}
                    </p>
                  </div>
                  {subscriptionStatus.billingCycle && (
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Billing Cycle
                      </label>
                      <p className="text-slate-900 mt-1 capitalize">
                        {subscriptionStatus.billingCycle}
                      </p>
                    </div>
                  )}
                  {subscriptionStatus.subscriptionEndsAt && (
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Renews On
                      </label>
                      <p className="text-slate-900 mt-1">
                        {formatDate(subscriptionStatus.subscriptionEndsAt)}
                        {subscriptionStatus.daysRemaining !== null && (
                          <span className="ml-2 text-sm text-slate-500">
                            ({subscriptionStatus.daysRemaining} days remaining)
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {subscriptionStatus.trialEndsAt && (
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Trial Ends
                      </label>
                      <p className="text-slate-900 mt-1">
                        {formatDate(subscriptionStatus.trialEndsAt)}
                        {subscriptionStatus.trialDaysRemaining !== null && (
                          <span className="ml-2 text-sm text-slate-500">
                            ({subscriptionStatus.trialDaysRemaining} days
                            remaining)
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {subscriptionStatus.status === 'cancelled' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        Your subscription has been cancelled. You will retain
                        access to premium features until{' '}
                        {formatDate(subscriptionStatus.subscriptionEndsAt)}.
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    {subscriptionStatus.stripeCustomerId ? (
                      <Button
                        onClick={handleManageSubscription}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                      >
                        {loading
                          ? 'Loading...'
                          : 'Manage Subscription (Stripe Portal)'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowUpgradeModal(true)}
                        className="flex-1 w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Upgrade to Premium
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">
                    Loading subscription status...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {showUpgradeModal && (
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
        />
      )}
    </div>
  );
}

export default function ProfileClient() {
  return (
    <>
      <SignedOut>
        <RedirectToLogin />
      </SignedOut>
      <SignedIn>
        <ProfileContent />
      </SignedIn>
    </>
  );
}
