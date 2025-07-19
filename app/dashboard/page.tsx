'use client';

import { StudySession } from '@/components/StudySession';
import { getUserStats } from '@/lib/flashcards';
import { getCurrentUser, signOut } from '@/lib/supabase';
import type { User } from '@/lib/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    correctAttempts: 0,
    accuracy: 0,
    dueToday: 0,
    cardsAttempted: 0,
    totalFlashcards: 0,
  });
  const [isStudying, setIsStudying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const checkUser = async () => {
    const { user, error } = await getCurrentUser();
    if (error || !user) {
      router.push('/');
    } else {
      setUser(mapSupabaseUserToLocal(user));
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      if (!user) return;
      const userStats = await getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleStartStudying = () => {
    setIsStudying(true);
  };

  const handleStudyComplete = () => {
    setIsStudying(false);
    loadStats(); // Refresh stats after study session
  };

  // Map Supabase user to local User type
  function mapSupabaseUserToLocal(user: SupabaseUser): User {
    return {
      id: user.id,
      email: user.email ?? '',
      trial_expires_at: '', // Set default or fetch from DB if needed
      pro: false, // Set default or fetch from DB if needed
      created_at: user.created_at ?? '',
      updated_at: user.updated_at ?? '',
    };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isStudying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-slate-900">FlashDeck</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">Studying...</span>
                <button
                  onClick={() => setIsStudying(false)}
                  className="bg-slate-600 text-white px-4 py-2 rounded-xl hover:bg-slate-700 transition-colors text-sm"
                >
                  Exit Session
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {user && (
            <StudySession userId={user.id} onComplete={handleStudyComplete} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900">FlashDeck</h1>
              <Link
                href="/library"
                className="ml-8 text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Revision Library
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Welcome, {user?.email || ''}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Cards Progress
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.cardsAttempted}/{stats.totalFlashcards}
              </p>
              <p className="text-sm text-blue-700 mt-1">Cards studied</p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Due Today
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.dueToday}
              </p>
              <p className="text-sm text-green-700 mt-1">Ready for review</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Accuracy
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {stats.accuracy}%
              </p>
              <p className="text-sm text-purple-700 mt-1">
                Overall performance
              </p>
            </div>

            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                Correct
              </h3>
              <p className="text-3xl font-bold text-amber-600">
                {stats.correctAttempts}
              </p>
              <p className="text-sm text-amber-700 mt-1">Right answers</p>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleStartStudying}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={stats.dueToday === 0 && stats.totalAttempts > 0}
            >
              Start Studying
            </button>
            {stats.dueToday === 0 && stats.totalAttempts > 0 && (
              <p className="text-slate-500 mt-2 text-sm">
                No flashcards due for review right now.
              </p>
            )}
          </div>
        </div>
        {/* JavaScript Library Card */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl shadow border border-yellow-200 p-8 flex flex-col md:flex-row items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-yellow-900 mb-2">
              JavaScript Library
            </h3>
            <p className="text-yellow-800 mb-4 max-w-md">
              Browse and revise all JavaScript Basics flashcards at your own
              pace. No spaced repetition—just pure revision!
            </p>
          </div>
          <Link
            href="/library"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-xl transition-all text-lg shadow"
          >
            Go to Library
          </Link>
        </div>
      </main>
    </div>
  );
}
