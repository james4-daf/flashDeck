'use client';

import { SignIn, SignUp } from '@clerk/nextjs';
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-up');

  return (
    <>
      <AuthLoading>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </AuthLoading>

      <Authenticated>
        <RedirectToDashboard />
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Navigation */}
            <div className="mb-6 text-center">
              <Link href="/" className="inline-block mb-4">
                <h1 className="text-2xl font-bold text-slate-900">FlashDeck</h1>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  ← Back to Home
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  {mode === 'sign-up' ? 'Create Your Account' : 'Welcome Back'}
                </h2>

                <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                  <button
                    onClick={() => setMode('sign-up')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      mode === 'sign-up'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setMode('sign-in')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      mode === 'sign-in'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                {mode === 'sign-up' ? (
                  <SignUp
                    routing="hash"
                    signInUrl="/login#sign-in"
                    fallbackRedirectUrl="/dashboard"
                  />
                ) : (
                  <SignIn
                    routing="hash"
                    signUpUrl="/login#sign-up"
                    fallbackRedirectUrl="/dashboard"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}

// Separate component to handle redirect
function RedirectToDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <p className="text-slate-600">Redirecting to dashboard...</p>
    </div>
  );
}

