// lib/subscription.ts
// Utility functions for subscription and feature access

export type Plan = 'free' | 'premium';

export interface FeatureLimits {
  maxDecks: number;
  maxCardsPerDeck: number;
  maxCardsPerSession: number;
  maxImportantCards: number;
  canUseCodeSnippets: boolean;
  canUseFillBlank: boolean;
  canAccessPremiumTopics: boolean;
  canShareDecks: boolean;
  progressHistoryDays: number;
}

// Get feature limits for a plan
export function getFeatureLimits(plan: Plan): FeatureLimits {
  if (plan === 'premium') {
    return {
      maxDecks: Infinity,
      maxCardsPerDeck: Infinity,
      maxCardsPerSession: Infinity,
      maxImportantCards: Infinity,
      canUseCodeSnippets: true,
      canUseFillBlank: true,
      canAccessPremiumTopics: true,
      canShareDecks: true,
      progressHistoryDays: Infinity,
    };
  }

  // Free plan limits
  return {
    maxDecks: 1,
    maxCardsPerDeck: 12,
    maxCardsPerSession: 12,
    maxImportantCards: 5,
    canUseCodeSnippets: false,
    canUseFillBlank: false,
    canAccessPremiumTopics: false,
    canShareDecks: false,
    progressHistoryDays: 30,
  };
}

// Check if user can access a feature
export function canAccessFeature(
  isPremium: boolean,
  feature: keyof FeatureLimits,
): boolean {
  const plan: Plan = isPremium ? 'premium' : 'free';
  const limits = getFeatureLimits(plan);

  if (feature === 'maxDecks' || feature === 'maxCardsPerDeck') {
    return limits[feature] === Infinity;
  }

  if (typeof limits[feature] === 'boolean') {
    return limits[feature] as boolean;
  }

  return true; // For numeric limits, we check elsewhere
}

// Generate upgrade messages for different features
export function getUpgradeMessage(feature: string): string {
  const messages: Record<string, string> = {
    deck: 'Upgrade to Premium to create unlimited decks!',
    card: 'Upgrade to Premium to add unlimited cards to your decks!',
    session: 'Upgrade to Premium to study unlimited cards per session!',
    codeSnippet: 'Upgrade to Premium to use code snippet flashcards!',
    fillBlank: 'Upgrade to Premium to use fill-in-the-blank flashcards!',
    topic: 'Upgrade to Premium to access all topics!',
    important: 'Upgrade to Premium to mark unlimited cards as important!',
    share: 'Upgrade to Premium to share your decks publicly!',
    history: 'Upgrade to Premium for unlimited progress history!',
  };

  return (
    messages[feature] ||
    'Upgrade to Premium to unlock this feature!'
  );
}

// Get feature name for display
export function getFeatureName(feature: string): string {
  const names: Record<string, string> = {
    deck: 'Unlimited Decks',
    card: 'Unlimited Cards',
    session: 'Unlimited Study Sessions',
    codeSnippet: 'Code Snippet Flashcards',
    fillBlank: 'Fill-in-the-Blank Flashcards',
    topic: '20+ Premium Topics',
    important: 'Unlimited Important Cards',
    share: 'Public Deck Sharing',
    history: 'Unlimited Progress History',
  };

  return names[feature] || feature;
}

// Format pricing for display
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Calculate savings percentage
export function calculateSavings(
  monthlyPrice: number,
  annualPrice: number,
): number {
  const monthlyAnnual = monthlyPrice * 12;
  return Math.round(((monthlyAnnual - annualPrice) / monthlyAnnual) * 100);
}

