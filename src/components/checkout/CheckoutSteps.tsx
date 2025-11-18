'use client';

import { cn } from '@/lib/utils';

type CheckoutStep = 'shipping' | 'payment' | 'review';

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
}

const steps = [
  { id: 'shipping', name: 'Shipping', number: 1 },
  { id: 'payment', name: 'Payment', number: 2 },
  { id: 'review', name: 'Review', number: 3 },
];

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = step.id === currentStep;
          const isUpcoming = index > currentStepIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && 'bg-accent text-background',
                    isUpcoming && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-sm font-medium',
                    isCurrent && 'text-foreground',
                    !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {step.name}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-4 transition-colors',
                    isCompleted ? 'bg-green-500' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
