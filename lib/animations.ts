import confetti from 'canvas-confetti';

// Confetti celebration on correct answer
export function celebrateCorrect() {
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: NodeJS.Timeout = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

// Subtle confetti for streak milestones
export function celebrateStreak() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    zIndex: 9999,
  });
}

// Shake animation for incorrect answers
export const shakeAnimation = {
  x: [0, -10, 10, -10, 10, -5, 5, 0],
  transition: { duration: 0.5 },
};

// Pulse animation for progress bar
export const pulseAnimation = {
  scale: [1, 1.02, 1],
  transition: { duration: 0.3, ease: 'easeOut' as const },
};

