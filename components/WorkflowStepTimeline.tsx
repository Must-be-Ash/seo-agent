'use client';

import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { TextShimmer } from './ui/text-shimmer';

interface StepUpdate {
  stepId: string;
  stepLabel: string;
  status: 'pending' | 'running' | 'success' | 'error';
  timestamp: number;
  duration?: number;
  error?: string;
}

interface WorkflowStepTimelineProps {
  steps: StepUpdate[];
}

export function WorkflowStepTimeline({ steps }: WorkflowStepTimelineProps) {
  const getStatusIcon = (status: StepUpdate['status']) => {
    switch (status) {
      case 'pending':
        return <Circle className="w-5 h-5 text-slate-300" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-black animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusStyle = (status: StepUpdate['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-slate-50 border-slate-200';
      case 'running':
        return 'bg-black/5 border-black/20';
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={step.stepId} className="relative">
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="absolute left-[10px] top-[28px] w-0.5 h-[calc(100%+12px)] bg-slate-200" />
          )}

          {/* Step card */}
          <div
            className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all ${getStatusStyle(
              step.status
            )}`}
          >
            <div className="relative z-10 flex-shrink-0">
              {getStatusIcon(step.status)}
            </div>

            <div className="flex-1 min-w-0">
              {step.status === 'running' ? (
                <TextShimmer className="text-sm font-medium text-slate-900">
                  {step.stepLabel}
                </TextShimmer>
              ) : (
                <p
                  className={`text-sm font-medium ${
                    step.status === 'success'
                      ? 'text-emerald-700'
                      : step.status === 'error'
                      ? 'text-red-700'
                      : 'text-slate-500'
                  }`}
                >
                  {step.stepLabel}
                </p>
              )}

              {step.error && (
                <p className="text-xs text-red-600 mt-1">{step.error}</p>
              )}

              {step.duration && step.status === 'success' && (
                <p className="text-xs text-slate-500 mt-1">
                  Completed in {(step.duration / 1000).toFixed(1)}s
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
