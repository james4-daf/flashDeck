'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  selector: string | null;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingTour({
  steps,
  onComplete,
  onSkip,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    arrowPosition?: 'top' | 'bottom' | 'left' | 'right';
  } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Find and scroll to target element
  useEffect(() => {
    if (!step) return;

    if (step.selector) {
      const element = document.querySelector<HTMLElement>(step.selector);
      if (element) {
        setTargetElement(element);
        // Scroll element into view with smooth behavior
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      } else {
        setTargetElement(null);
      }
    } else {
      setTargetElement(null);
    }
  }, [step]);

  // Calculate tooltip position
  const calculatePosition = useCallback(() => {
    if (!step || step.position === 'center') {
      setTooltipPosition(null);
      return;
    }

    if (!targetElement || !tooltipRef.current) {
      setTooltipPosition(null);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const spacing = 16;
    let top = 0;
    let left = 0;
    let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

    switch (step.position) {
      case 'top':
        top = rect.top - tooltipRect.height - spacing;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        arrowPosition = 'bottom';
        break;
      case 'bottom':
        top = rect.bottom + spacing;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        arrowPosition = 'top';
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.left - tooltipRect.width - spacing;
        arrowPosition = 'right';
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.right + spacing;
        arrowPosition = 'left';
        break;
    }

    // Keep tooltip within viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 16) left = 16;
    if (left + tooltipRect.width > viewportWidth - 16) {
      left = viewportWidth - tooltipRect.width - 16;
    }

    if (top < 16) top = 16;
    if (top + tooltipRect.height > viewportHeight - 16) {
      top = viewportHeight - tooltipRect.height - 16;
    }

    setTooltipPosition({ top, left, arrowPosition });
  }, [step, targetElement]);

  // Calculate position when step or target element changes
  useEffect(() => {
    // Reset tooltip position when step changes
    setTooltipPosition(null);
    
    // Use a small delay to ensure DOM is updated and tooltip is rendered
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        calculatePosition();
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [calculatePosition, currentStep]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      calculatePosition();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculatePosition]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onComplete]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const handleSkip = useCallback(() => {
    onSkip?.();
    onComplete();
  }, [onSkip, onComplete]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, handleSkip]);

  if (!step) return null;

  // Render overlay with spotlight cutout
  const renderOverlay = () => {
    if (step.position === 'center') {
      // Full overlay for center position (welcome step)
      return (
        <div className="fixed inset-0 z-[9998] bg-black/60" onClick={handleSkip} />
      );
    }

    if (!targetElement) {
      return (
        <div className="fixed inset-0 z-[9998] bg-black/60" onClick={handleSkip} />
      );
    }

    const rect = targetElement.getBoundingClientRect();
    const padding = 8; // Padding around highlighted element

    // Create unique mask ID for each step to avoid conflicts
    const maskId = `spotlight-mask-${currentStep}`;

    return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998]"
        onClick={handleSkip}
      >
        {/* Use SVG mask for spotlight effect */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id={maskId}>
              <rect width="100%" height="100%" fill="black" />
              <rect
                x={rect.left - padding}
                y={rect.top - padding}
                width={rect.width + padding * 2}
                height={rect.height + padding * 2}
                fill="white"
                rx="8"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask={`url(#${maskId})`}
            className="pointer-events-auto"
          />
        </svg>
      </div>
    );
  };

  // Render tooltip
  const renderTooltip = () => {
    if (typeof window === 'undefined') return null;

    const tooltipContent = (
      <motion.div
        key={`tooltip-${currentStep}`}
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'bg-white rounded-lg shadow-xl border border-slate-200 p-6 z-[9999] max-w-sm',
          step.position === 'center'
            ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : tooltipPosition
              ? 'fixed'
              : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        style={
          step.position === 'center'
            ? undefined
            : tooltipPosition
              ? {
                  top: `${tooltipPosition.top}px`,
                  left: `${tooltipPosition.left}px`,
                }
              : undefined
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-slate-500">
            Step {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Title */}
        <h3 id="onboarding-title" className="text-lg font-semibold text-slate-900 mb-2">
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-6">{step.description}</p>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {!isLastStep && (
              <Button variant="ghost" onClick={handleSkip} className="text-sm">
                Skip
              </Button>
            )}
            <Button onClick={handleNext} className="text-sm bg-blue-600 hover:bg-blue-700">
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </motion.div>
    );

    return createPortal(tooltipContent, document.body);
  };

  if (!step) return null;

  return (
    <>
      {renderOverlay()}
      {renderTooltip()}
    </>
  );
}

