'use client';

import { TextShimmer } from './ui/text-shimmer';

interface WorkflowProgressBarProps {
  progress: number;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
}

export function WorkflowProgressBar({
  progress,
  currentStep,
  totalSteps,
  completedSteps,
}: WorkflowProgressBarProps) {
  return (
    <div className="space-y-4">
      {/* Progress percentage */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">Progress</span>
        <span className="text-slate-600">{completedSteps} of {totalSteps} steps</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-slate-900 to-slate-700 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Current step with shimmer */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-2 h-2 bg-black rounded-full" />
          <div className="absolute inset-0 w-2 h-2 bg-black rounded-full animate-ping opacity-75" />
        </div>
        <TextShimmer className="text-sm font-medium text-slate-700">
          {currentStep}
        </TextShimmer>
      </div>
    </div>
  );
}
