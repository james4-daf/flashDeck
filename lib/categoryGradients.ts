// Category gradient mappings for flashcard backgrounds
export function getCategoryGradient(category: string): string {
  const categoryLower = category.toLowerCase();
  
  // Map categories to beautiful gradients
  const gradients: Record<string, string> = {
    // JavaScript/React categories
    'react hooks': 'from-blue-500 via-purple-500 to-pink-500',
    'react': 'from-blue-400 via-cyan-400 to-blue-600',
    'javascript basics': 'from-yellow-400 via-orange-400 to-yellow-600',
    'javascript': 'from-yellow-400 via-orange-400 to-yellow-600',
    'variables': 'from-emerald-400 via-teal-400 to-emerald-600',
    'arrays': 'from-indigo-400 via-purple-400 to-indigo-600',
    'types': 'from-rose-400 via-pink-400 to-rose-600',
    'functions': 'from-violet-400 via-purple-400 to-violet-600',
    'objects': 'from-amber-400 via-yellow-400 to-amber-600',
    'async': 'from-cyan-400 via-blue-400 to-cyan-600',
    'promises': 'from-sky-400 via-blue-400 to-sky-600',
    'dom': 'from-green-400 via-emerald-400 to-green-600',
    'events': 'from-red-400 via-rose-400 to-red-600',
    'classes': 'from-purple-400 via-violet-400 to-purple-600',
    'modules': 'from-orange-400 via-amber-400 to-orange-600',
    'es6': 'from-teal-400 via-cyan-400 to-teal-600',
    'es6+': 'from-teal-400 via-cyan-400 to-teal-600',
    
    // Default fallbacks
    'default': 'from-slate-400 via-slate-500 to-slate-600',
  };

  // Try exact match first
  if (gradients[categoryLower]) {
    return gradients[categoryLower];
  }

  // Try partial matches
  for (const [key, value] of Object.entries(gradients)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      return value;
    }
  }

  // Hash-based fallback for unknown categories
  return getHashBasedGradient(category);
}

function getHashBasedGradient(category: string): string {
  // Create a consistent gradient based on category name hash
  const gradients = [
    'from-blue-400 via-indigo-400 to-purple-500',
    'from-pink-400 via-rose-400 to-red-500',
    'from-green-400 via-emerald-400 to-teal-500',
    'from-yellow-400 via-amber-400 to-orange-500',
    'from-cyan-400 via-blue-400 to-indigo-500',
    'from-violet-400 via-purple-400 to-fuchsia-500',
    'from-teal-400 via-cyan-400 to-blue-500',
    'from-orange-400 via-red-400 to-pink-500',
  ];

  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return gradients[Math.abs(hash) % gradients.length];
}

// Get subtle gradient overlay for card backgrounds
export function getCategoryGradientOverlay(category: string): string {
  const gradient = getCategoryGradient(category);
  return `bg-gradient-to-br ${gradient} opacity-5`;
}

// Get border color based on category
export function getCategoryBorderColor(category: string): string {
  const categoryLower = category.toLowerCase();
  
  const colors: Record<string, string> = {
    'react hooks': 'border-blue-200',
    'react': 'border-blue-200',
    'javascript basics': 'border-yellow-200',
    'javascript': 'border-yellow-200',
    'variables': 'border-emerald-200',
    'arrays': 'border-indigo-200',
    'types': 'border-rose-200',
    'functions': 'border-violet-200',
    'objects': 'border-amber-200',
    'async': 'border-cyan-200',
    'promises': 'border-sky-200',
    'dom': 'border-green-200',
    'events': 'border-red-200',
    'classes': 'border-purple-200',
    'modules': 'border-orange-200',
    'es6': 'border-teal-200',
    'es6+': 'border-teal-200',
  };

  if (colors[categoryLower]) {
    return colors[categoryLower];
  }

  for (const [key, value] of Object.entries(colors)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      return value;
    }
  }

  return 'border-slate-200';
}

