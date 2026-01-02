'use client';

import { AppHeader } from '@/components/AppHeader';
import { OnboardingTour, type OnboardingStep } from '@/components/OnboardingTour';
import { StudySession } from '@/components/StudySession';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Authenticated, useMutation, useQuery } from 'convex/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  return (
    <Authenticated>
      <DashboardContent />
    </Authenticated>
  );
}

// Onboarding step configuration
const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to FlashDeck! 🎉',
    description: 'Let\'s take a quick 2-minute tour of your dashboard to get you started.',
    selector: null,
    position: 'center',
  },
  {
    id: 'study-now',
    title: 'Start Studying',
    description: 'This is your main study area. When you have flashcards due for review, click "Start Studying" to begin a session. FlashDeck uses spaced repetition to help you learn efficiently.',
    selector: '[data-onboarding="study-now-card"]',
    position: 'right',
  },
  {
    id: 'progress',
    title: 'Track Your Progress',
    description: 'Here you can see your stats at a glance: total cards, how many are due now, and your mastery progress. Keep an eye on this to see your improvement over time!',
    selector: '[data-onboarding="progress-card"]',
    position: 'left',
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    description: 'Use these quick links to browse the library, create custom decks, or manage your important cards. This is where you\'ll add new flashcards to study.',
    selector: '[data-onboarding="quick-actions-card"]',
    position: 'top',
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description: 'Use the header to navigate to your decks, browse the community library, or access your profile settings. Everything you need is just a click away!',
    selector: '[data-onboarding="header-nav"]',
    position: 'bottom',
  },
];

function DashboardContent() {
  const { user } = useUser();
  const [isStudying, setIsStudying] = useState(false);
  const [studyMode, setStudyMode] = useState<'normal' | 'important' | 'list'>(
    'normal',
  );
  const [selectedList, setSelectedList] = useState<string | undefined>(
    undefined,
  );
  const flashcards = useQuery(api.flashcards.getUserFlashcards, {
    userId: user?.id || '',
  });

  // Fetch all user progress for accurate dashboard stats
  const userProgress = useQuery(api.userProgress.getAllUserProgress, {
    userId: user?.id || '',
  });

  // Fetch flashcards grouped by due time for smart grouping
  const dueTimeGroups = useQuery(api.flashcards.getFlashcardsByDueTime, {
    userId: user?.id || '',
  });

  // Check if onboarding should be shown
  const shouldShowOnboarding = useQuery(api.userPreferences.shouldShowOnboarding, {
    userId: user?.id || '',
  });

  const markOnboardingComplete = useMutation(
    api.userPreferences.markOnboardingComplete,
  );

  const ensureUserExists = useMutation(api.users.ensureUserExists);

  const createSampleFlashcards = useMutation(
    api.flashcards.createSampleFlashcards,
  );

  // Ensure user exists in users table on mount (uses JWT token, passes email if available)
  useEffect(() => {
    if (user?.id) {
      ensureUserExists({
        email: user.emailAddresses?.[0]?.emailAddress,
      }).catch((error) => {
        console.error('Error ensuring user exists:', error);
      });
    }
  }, [user?.id, user?.emailAddresses, ensureUserExists]);

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

  const handleOnboardingComplete = async () => {
    if (user?.id) {
      try {
        await markOnboardingComplete({ userId: user.id });
      } catch (error) {
        console.error('Error marking onboarding complete:', error);
      }
    }
  };

  if (isStudying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AppHeader />
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end items-center h-12">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="hidden sm:inline text-sm text-slate-600">
                  {studyMode === 'important'
                    ? '📌 Studying Important Cards'
                    : studyMode === 'list'
                      ? `📚 Studying ${selectedList?.replace(/([a-z])([0-9])/g, '$1 $2')} List`
                      : '📚 Studying All Cards'}
                </span>
                <Button
                  variant="outline"
                  onClick={handleCompleteStudying}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  Exit Study Session
                </Button>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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

  // Calculate due cards using the same logic as the study session
  const now = Date.now();
  const due = flashcards
    ? flashcards.filter((card) => {
        const progress = progressMap.get(card._id);

        if (!progress) {
          return true; // New card - due for study
        }

        return progress.nextReviewDate <= now; // Due for review
      }).length
    : 0;

  // Count important cards
  const importantCards = userProgress?.filter((p) => p.important) || [];
  const importantCount = importantCards.length;

  // Helper function to calculate next review time
  const getNextReviewTime = () => {
    if (!userProgress || userProgress.length === 0) {
      return null;
    }

    const now = Date.now();
    const futureReviews = userProgress
      .filter((progress) => progress.nextReviewDate > now)
      .sort((a, b) => a.nextReviewDate - b.nextReviewDate);

    if (futureReviews.length === 0) {
      return null;
    }

    const nextReview = futureReviews[0].nextReviewDate;
    const timeDiff = nextReview - now;

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'}`;
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    } else {
      const minutes = Math.floor(timeDiff / (1000 * 60));
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
  };

  const nextReviewTime = getNextReviewTime();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />
      {shouldShowOnboarding === true && (
        <OnboardingTour
          steps={onboardingSteps}
          onComplete={handleOnboardingComplete}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Main dashboard cards in a flex row */}

        {/* Rest of dashboard (Progress, Study Now, etc.) */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3 my-4 sm:my-6">
          {/* Study Now Card */}
          <Card className="lg:col-span-2" data-onboarding="study-now-card">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">
                Ready to Study?{' '}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flashcards === undefined ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">
                    Checking for due flashcards...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {due > 0 ? (
                    <>
                      {dueTimeGroups ? (
                        <div className="space-y-3">
                          <p className="text-slate-700 text-sm sm:text-base">
                            You have{' '}
                            <span className="font-semibold text-blue-600">
                              {due}
                            </span>{' '}
                            flashcard{due === 1 ? '' : 's'} due for review.
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-700 text-sm sm:text-base">
                          You have{' '}
                          <span className="font-semibold text-blue-600">
                            {due}
                          </span>{' '}
                          flashcard{due === 1 ? '' : 's'} due for review.
                        </p>
                      )}

                      {/* Study buttons */}
                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={() => handleStartStudying('normal')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-base sm:text-lg py-4 sm:py-6"
                        >
                          Start Studying
                        </Button>

                        {importantCount > 0 && (
                          <Button
                            onClick={() => handleStartStudying('important')}
                            variant="outline"
                            className="w-full text-base sm:text-lg py-4 sm:py-6 border-orange-300 text-orange-700 hover:bg-orange-50"
                          >
                            📌 Study Important ({importantCount})
                          </Button>
                        )}
                      </div>

                      {importantCount > 0 && (
                        <p className="text-xs sm:text-sm text-slate-600">
                          You have {importantCount} important card
                          {importantCount === 1 ? '' : 's'} marked for focused
                          study.
                        </p>
                      )}

                      {/* Smart grouping counters */}
                      {dueTimeGroups && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                          {dueTimeGroups.dueIn15Minutes > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                              <span className="text-orange-700 font-medium">
                                {dueTimeGroups.dueIn15Minutes} due in 15 min
                              </span>
                            </div>
                          )}
                          {dueTimeGroups.dueInNextHour > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                              <span className="text-yellow-700 font-medium">
                                {dueTimeGroups.dueInNextHour} due in next hour
                              </span>
                            </div>
                          )}
                          {dueTimeGroups.dueToday > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              <span className="text-blue-700 font-medium">
                                {dueTimeGroups.dueToday} due today
                              </span>
                            </div>
                          )}
                          {dueTimeGroups.dueTomorrow > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-green-700 font-medium">
                                {dueTimeGroups.dueTomorrow} due tomorrow
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-slate-700 text-base sm:text-lg font-medium">
                          🎉 All caught up!
                        </p>
                        {nextReviewTime ? (
                          <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Next review in {nextReviewTime}
                          </p>
                        ) : (
                          <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            No more reviews scheduled
                          </p>
                        )}
                      </div>

                      {/* Study buttons */}
                      <div className="flex flex-col gap-3">
                        <Button
                          disabled
                          className="w-full bg-slate-300 text-slate-500 text-base sm:text-lg py-4 sm:py-6 cursor-not-allowed"
                        >
                          No Cards Due
                        </Button>

                        {importantCount > 0 && (
                          <Button
                            onClick={() => handleStartStudying('important')}
                            variant="outline"
                            className="w-full text-base sm:text-lg py-4 sm:py-6 border-orange-300 text-orange-700 hover:bg-orange-50"
                          >
                            📌 Study Important ({importantCount})
                          </Button>
                        )}
                      </div>

                      {importantCount > 0 && (
                        <p className="text-xs sm:text-sm text-slate-600 text-center">
                          You can still study your {importantCount} important
                          card
                          {importantCount === 1 ? '' : 's'} for focused review.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card data-onboarding="progress-card">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flashcards ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs sm:text-sm text-slate-600 mb-2">
                        Total Cards
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                        {total}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs sm:text-sm text-blue-700 mb-2">
                        Due Now
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                        {due}
                      </p>
                    </div>
                  </div>
                  {importantCount > 0 && (
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <Link href="/library/important">
                        <p className="text-xs sm:text-sm text-orange-700 mb-2">
                          Important Cards
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-orange-600 hover:text-orange-700 cursor-pointer transition-colors">
                          {importantCount}
                        </p>
                      </Link>
                    </div>
                  )}
                  {total > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs sm:text-sm font-medium text-slate-700">
                          Mastery Progress
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900">
                          {Math.round(((total - due) / total) * 100)}%
                        </p>
                      </div>
                      <Progress
                        value={((total - due) / total) * 100}
                        className="h-3"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        {total - due} of {total} cards reviewed recently
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Loading progress...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {/* Quick Actions */}
          <Card className="flex-1" data-onboarding="quick-actions-card">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {importantCount > 0 && (
                  <Link href="/library/important">
                    <Button
                      variant="outline"
                      className="w-full h-12 sm:h-16 text-left flex flex-col items-start justify-center border-orange-200 hover:bg-orange-50"
                    >
                      <span className="font-medium text-sm sm:text-base">
                        📌 Manage Important Cards
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500">
                        View and edit your {importantCount} important card
                        {importantCount === 1 ? '' : 's'}
                      </span>
                    </Button>
                  </Link>
                )}
                <Link href="/library">
                  <Button
                    variant="outline"
                    className="w-full h-12 sm:h-16 text-left flex flex-col items-start justify-center"
                  >
                    <span className="font-medium text-sm sm:text-base">
                      Browse Library
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500">
                      View all flashcards
                    </span>
                  </Button>
                </Link>

                {flashcards && flashcards.length === 0 && (
                  <Button
                    onClick={handleCreateSamples}
                    variant="outline"
                    className="w-full h-12 sm:h-16 text-left flex flex-col items-start justify-center"
                  >
                    <span className="font-medium text-sm sm:text-base">
                      Create Sample Cards
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500">
                      Get started with examples
                    </span>
                  </Button>
                )}

                <Link href="/my-decks">
                  <Button
                    variant="outline"
                    className="w-full h-12 sm:h-16 text-left flex flex-col items-start justify-center"
                  >
                    <span className="font-medium text-sm sm:text-base">
                      Create Deck & Add Flashcards
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500">
                      Organize your study materials
                    </span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
