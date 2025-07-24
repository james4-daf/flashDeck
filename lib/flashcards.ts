// Spaced repetition intervals (in days) - powers of 2
export const SRS_INTERVALS = [1, 2, 4, 8, 16];

// Calculate next review date based on performance
export function getNextReviewDate(
  reviewCount: number,
  isCorrect: boolean,
): Date {
  if (!isCorrect) {
    // Give wrong answers a 20-minute delay to prevent infinite loops
    return new Date(Date.now() + 20 * 60 * 1000); // 20 minutes
  }

  // For correct answers, use exponential backoff
  const intervalIndex = Math.min(reviewCount, SRS_INTERVALS.length - 1);
  const daysToAdd = SRS_INTERVALS[intervalIndex];
  return new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
}

// Check if a flashcard is due for review
export function isCardDue(nextReviewDate: number): boolean {
  return nextReviewDate <= Date.now();
}

// Format time spent in a readable way
export function formatTimeSpent(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// Calculate study session accuracy
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
