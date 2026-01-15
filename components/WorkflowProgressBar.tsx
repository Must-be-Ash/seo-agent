'use client';

import { Loader2 } from 'lucide-react';

interface WorkflowProgressBarProps {
  progress: number;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  subStep?: string;
}

export function WorkflowProgressBar({
  progress,
  currentStep,
  totalSteps,
  completedSteps,
  subStep,
}: WorkflowProgressBarProps) {
  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Loader2 className="w-4 h-4 text-[#888888] animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-medium text-[#CCCCCC] animate-pulse"
                style={{
                  background: 'linear-gradient(90deg, #888888 0%, #CCCCCC 50%, #888888 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 2s ease-in-out infinite',
                }}
              >
                {currentStep}
              </span>
            </div>
            {subStep && (
              <p className="text-xs text-[#666666] mt-1 ml-6">{subStep}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-[#FFFFFF]">{Math.round(progress)}%</div>
          <div className="text-xs text-[#888888]">{completedSteps} of {totalSteps}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#2A2A2A]">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#444444] to-[#666666] transition-all duration-700 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        >
          {/* Animated shimmer effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"
            style={{
              animation: 'shimmer 2s ease-in-out infinite',
            }}
          />
        </div>
        {/* Progress indicator dots */}
        <div className="absolute inset-0 flex items-center">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepProgress = ((i + 1) / totalSteps) * 100;
            const isCompleted = stepProgress <= progress;
            const isCurrent = stepProgress > progress && ((i / totalSteps) * 100) < progress;
            
            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  left: `${stepProgress}%`,
                  transform: 'translateX(-50%)',
                  backgroundColor: isCompleted ? '#22C55E' : isCurrent ? '#666666' : '#2A2A2A',
                  boxShadow: isCompleted ? '0 0 4px rgba(34, 197, 94, 0.5)' : 'none',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
