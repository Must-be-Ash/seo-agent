'use client';

import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';

interface StepUpdate {
  stepId: string;
  stepLabel: string;
  status: 'pending' | 'running' | 'success' | 'error';
  timestamp: number;
  duration?: number;
  error?: string;
  subStep?: string;
}

interface WorkflowStepTimelineProps {
  steps: StepUpdate[];
}

export function WorkflowStepTimeline({ steps }: WorkflowStepTimelineProps) {
  const getStatusIcon = (status: StepUpdate['status']) => {
    switch (status) {
      case 'pending':
        return <Circle className="w-5 h-5" style={{ color: '#333333' }} strokeWidth={1.5} />;
      case 'running':
        return <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#888888' }} />;
      case 'success':
        return (
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1A3A1A' }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: '#22C55E' }} />
          </div>
        );
      case 'error':
        return <XCircle className="w-5 h-5" style={{ color: '#666666' }} />;
    }
  };

  const getStatusStyle = (status: StepUpdate['status']) => {
    switch (status) {
      case 'pending':
        return {
          text: '#666666',
          subText: '#555555',
        };
      case 'running':
        return {
          text: '#CCCCCC',
          subText: '#888888',
        };
      case 'success':
        return {
          text: '#FFFFFF',
          subText: '#888888',
        };
      case 'error':
        return {
          text: '#666666',
          subText: '#555555',
        };
    }
  };

  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const styles = getStatusStyle(step.status);
        const isRunning = step.status === 'running';
        const isSuccess = step.status === 'success';
        
        return (
          <div key={step.stepId} className="relative">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div 
                className="absolute left-[10px] top-[24px] w-px transition-all duration-500"
                style={{
                  height: 'calc(100% + 4px)',
                  backgroundColor: isSuccess ? '#22C55E' : '#2A2A2A',
                  opacity: isSuccess ? 0.3 : 1,
                }}
              />
            )}

            {/* Step item - minimal design */}
            <div className="relative flex items-center gap-4 py-2">
              <div className="relative z-10 flex-shrink-0 flex items-center">
                {getStatusIcon(step.status)}
              </div>

              <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {isRunning ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-sm font-medium"
                          style={{
                            color: styles.text,
                            background: 'linear-gradient(90deg, #666666 0%, #CCCCCC 50%, #666666 100%)',
                            backgroundSize: '200% 100%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'shimmer 2s ease-in-out infinite',
                          }}
                        >
                          {step.stepLabel}
                        </span>
                      </div>
                      {step.subStep && (
                        <p className="text-xs mt-1" style={{ color: styles.subText }}>
                          {step.subStep}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <p
                          className="text-sm font-medium"
                          style={{ color: styles.text }}
                        >
                          {step.stepLabel}
                        </p>
                      </div>
                      {step.error && (
                        <p className="text-xs mt-1" style={{ color: '#666666' }}>
                          {step.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {step.duration && step.status === 'success' && (
                  <span className="text-xs flex-shrink-0" style={{ color: styles.subText }}>
                    {(step.duration / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
