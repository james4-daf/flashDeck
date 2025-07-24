import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Accordion = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-3 w-full', className)} {...props} />
));
Accordion.displayName = 'Accordion';

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('border rounded-lg w-full', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean;
}

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ className, children, isOpen, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex flex-1 items-center justify-between py-4 px-4 text-left font-medium transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t-lg',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronDown
      className={cn(
        'h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200',
        isOpen && 'rotate-180',
      )}
    />
  </button>
));
AccordionTrigger.displayName = 'AccordionTrigger';

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
}

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ className, children, isOpen, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'overflow-hidden transition-all duration-200',
      isOpen
        ? 'animate-in slide-in-from-top-1'
        : 'animate-out slide-out-to-top-1 hidden',
    )}
    {...props}
  >
    <div className={cn('px-4 pb-4 pt-0', className)}>{children}</div>
  </div>
));
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
