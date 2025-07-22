'use client';

import { StudySession } from '@/components/StudySession';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/convex/_generated/api';
import { SignOutButton, useUser } from '@clerk/nextjs';
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from 'convex/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  return (
    <>
      <Unauthenticated>
        <RedirectToLogin />
      </Unauthenticated>

      <Authenticated>
        <DashboardContent />
      </Authenticated>
    </>
  );
}

function RedirectToLogin() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <p className="text-slate-600">
        Not authenticated - redirecting to login...
      </p>
    </div>
  );
}

function DashboardContent() {
  const { user } = useUser();
  const [isStudying, setIsStudying] = useState(false);
  const [studyMode, setStudyMode] = useState<'normal' | 'important' | 'list'>(
    'normal',
  );
  const [selectedList, setSelectedList] = useState<string | undefined>(
    undefined,
  );

  const flashcards = useQuery(api.flashcards.getAllFlashcards);
  // Extract unique lists from all flashcards
  const allLists = Array.from(
    new Set((flashcards ?? []).flatMap((card) => card.lists ?? [])),
  );

  // Fetch all user progress for accurate dashboard stats
  const userProgress = useQuery(api.userProgress.getAllUserProgress, {
    userId: user?.id || '',
  });

  // Fetch study counts for gamification
  const studyCounts = useQuery(api.userProgress.getStudyCounts, {
    userId: user?.id || '',
  });

  const createSampleFlashcards = useMutation(
    api.flashcards.createSampleFlashcards,
  );

  const handleCreateSamples = async () => {
    try {
      const result = await createSampleFlashcards({});
      console.log('Sample flashcards created:', result);
    } catch (error) {
      console.error('Error creating samples:', error);
    }
  };

  const handleStartStudying = (
    mode: 'normal' | 'important' | 'list' = 'normal',
    listName?: string,
  ) => {
    setStudyMode(mode);
    if (mode === 'list' && listName) {
      setSelectedList(listName);
    }
    setIsStudying(true);
  };

  const handleCompleteStudying = () => {
    setIsStudying(false);
    setStudyMode('normal');
    setSelectedList(undefined);
  };

  if (isStudying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-slate-900">FlashDeck</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  {studyMode === 'important'
                    ? '📌 Studying Important Cards'
                    : studyMode === 'list'
                      ? `📚 Studying ${selectedList?.replace(/([a-z])([0-9])/g, '$1 $2')} List`
                      : '📚 Studying All Cards'}
                </span>
                <Button
                  variant="outline"
                  onClick={handleCompleteStudying}
                  className="text-sm"
                >
                  Exit Study Session
                </Button>
                <SignOutButton>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors text-sm">
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StudySession
            userId={user?.id || ''}
            onComplete={handleCompleteStudying}
            studyMode={studyMode}
            listName={selectedList}
          />
        </main>
      </div>
    );
  }

  const total = flashcards?.length || 0;
  // Map user progress by flashcardId for quick lookup
  const progressMap = new Map(
    userProgress?.map((p) => [p.flashcardId, p]) ?? [],
  );
  // Completed: reviewed at least once and not due
  const completed = flashcards
    ? flashcards.filter((card) => {
        const progress = progressMap.get(card._id);
        return (
          progress &&
          progress.reviewCount > 0 &&
          progress.nextReviewDate > Date.now()
        );
      }).length
    : 0;
  const due = total - completed;

  // Count important cards
  const importantCards = userProgress?.filter((p) => p.important) || [];
  const importantCount = importantCards.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-slate-900">FlashDeck</h1>
            <div className="flex items-center gap-4">
              <Link href="/library">
                <Button variant="outline" className="text-sm">
                  Library
                </Button>
              </Link>
              {user && (
                <span className="text-sm text-slate-600">
                  Welcome,{' '}
                  {user.firstName || user.emailAddresses[0]?.emailAddress}!
                </span>
              )}
              <SignOutButton>
                <button className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors text-sm">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main dashboard cards in a flex row */}

        {/* Rest of dashboard (Progress, Study Now, etc.) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 my-6">
          {/* Study Now Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Study?</CardTitle>
            </CardHeader>
            <CardContent>
              {flashcards === undefined ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">
                    Checking for due flashcards...
                  </p>
                </div>
              ) : flashcards.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-slate-700">
                    You have{' '}
                    <span className="font-semibold text-blue-600">{due}</span>{' '}
                    flashcard{due === 1 ? '' : 's'} due for review.
                  </p>

                  {/* Study buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleStartStudying('normal')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    >
                      Start Studying
                    </Button>

                    {importantCount > 0 && (
                      <Button
                        onClick={() => handleStartStudying('important')}
                        variant="outline"
                        className="flex-1 text-lg py-6 border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        📌 Study Important ({importantCount})
                      </Button>
                    )}
                  </div>

                  {importantCount > 0 && (
                    <p className="text-sm text-slate-600">
                      You have {importantCount} important card
                      {importantCount === 1 ? '' : 's'} marked for focused
                      study.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">
                    🎉 No flashcards due for review right now!
                  </p>
                  <p className="text-sm text-slate-500">
                    Come back later or add more flashcards to your library.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {flashcards ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Total Flashcards
                    </p>
                    <p className="text-2xl font-bold text-slate-900">{total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Due for Review
                    </p>
                    <p className="text-2xl font-bold text-blue-600">{due}</p>
                  </div>
                  {importantCount > 0 && (
                    <div>
                      <p className="text-sm text-slate-600 mb-1">
                        Important Cards
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {importantCount}
                      </p>
                    </div>
                  )}
                  {total > 0 && (
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Progress</p>
                      <Progress
                        value={((total - due) / total) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {Math.round(((total - due) / total) * 100)}% reviewed
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-slate-600">Loading progress...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          {/* Study Activity */}
          <Card className="flex-1 min-w-[220px]">
            <CardHeader>
              <CardTitle>Study Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {studyCounts ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {studyCounts.daily}
                    </div>
                    <div className="text-sm text-slate-500">Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {studyCounts.weekly}
                    </div>
                    <div className="text-sm text-slate-500">This Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {studyCounts.monthly}
                    </div>
                    <div className="text-sm text-slate-500">This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-600">
                      {studyCounts.total}
                    </div>
                    <div className="text-sm text-slate-500">Total</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-slate-600">Loading activity...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Study by List */}
          <Card className="flex-1 min-w-[220px]">
            <CardHeader>
              <CardTitle>Study by List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allLists.length > 0 ? (
                  allLists.map((list) => (
                    <div
                      key={list}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="capitalize font-medium text-slate-700">
                        {list.replace(/([a-z])([0-9])/g, '$1 $2')}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleStartStudying('list', list)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Study
                        </Button>
                        <Link href={`/library/list/${list}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm">No lists found</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="flex-1 min-w-[220px]">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Link href="/library">
                  <Button
                    variant="outline"
                    className="w-full h-16 text-left flex flex-col items-start justify-center"
                  >
                    <span className="font-medium">Browse Library</span>
                    <span className="text-sm text-slate-500">
                      View all flashcards
                    </span>
                  </Button>
                </Link>

                {flashcards && flashcards.length === 0 && (
                  <Button
                    onClick={handleCreateSamples}
                    variant="outline"
                    className="w-full h-16 text-left flex flex-col items-start justify-center"
                  >
                    <span className="font-medium">Create Sample Cards</span>
                    <span className="text-sm text-slate-500">
                      Get started with examples
                    </span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full h-16 text-left flex flex-col items-start justify-center cursor-not-allowed opacity-50"
                  disabled
                >
                  <span className="font-medium">Add Flashcards</span>
                  <span className="text-sm text-slate-500">Coming soon</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
