import { Check, Circle, Loader2 } from "lucide-react";
import { clsx } from "clsx";

export type Step = "discovery" | "specification" | "summary";

interface StatusStepperProps {
  currentStep: Step;
  onStepClick?: (step: Step) => void;
}

const steps: { id: Step; label: string }[] = [
  { id: "discovery", label: "Discovery & Recommendation" },
  { id: "specification", label: "Specification" },
  { id: "summary", label: "Summary" },
];

export function StatusStepper({ currentStep, onStepClick }: StatusStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full mb-12">
      <div className="relative flex justify-between">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -z-10 -translate-y-1/2 rounded-full" />
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div 
              key={step.id} 
              className={clsx(
                "flex flex-col items-center gap-2 group cursor-pointer",
                isUpcoming && !onStepClick && "pointer-events-none"
              )}
              onClick={() => isCompleted && onStepClick?.(step.id)}
            >
              <div 
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-background",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary shadow-[0_0_0_4px_rgba(var(--primary),0.2)] scale-110",
                  isUpcoming && "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isCurrent ? (
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>
              <span className={clsx(
                "text-xs font-medium uppercase tracking-wider transition-colors duration-300 absolute -bottom-8 whitespace-nowrap",
                isCurrent ? "text-primary font-bold" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
