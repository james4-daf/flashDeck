import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Audio feedback for flashcard answers
export function playAnswerSound(isCorrect: boolean) {
  try {
    const soundFile = isCorrect ? '/correct.mp3' : '/wrong.mp3';
    const audio = new Audio(soundFile);
    audio.volume = 0.3; // Set volume to 30% to avoid being too loud
    audio.play().catch((error) => {
      // Silently handle autoplay restrictions or other audio errors
      console.debug('Audio playback failed:', error);
    });
  } catch (error) {
    // Silently handle any audio creation errors
    console.debug('Audio creation failed:', error);
  }
}
