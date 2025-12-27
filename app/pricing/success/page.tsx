'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PricingSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Give webhook time to process
    setTimeout(() => setLoading(false), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {loading ? 'Processing...' : 'Welcome to Premium!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">
                Activating your premium subscription...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center py-4">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-lg text-slate-700 mb-2">
                  Your subscription is now active!
                </p>
                <p className="text-sm text-slate-600">
                  You now have access to all premium features including 20+
                  topics, unlimited decks, and more.
                </p>
              </div>
              <Link href="/dashboard">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

