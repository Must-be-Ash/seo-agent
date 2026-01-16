'use client';

import { useEffect, useState } from 'react';
import { WorkflowProgressBar } from './WorkflowProgressBar';
import { WorkflowStepTimeline } from './WorkflowStepTimeline';
import { SEOReport } from './report/SEOReport';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { DownloadReportButton } from './DownloadReportButton';
import type { StructuredReportData } from '@/types/report-data';

interface StepUpdate {
  stepId: string;
  stepLabel: string;
  status: 'pending' | 'running' | 'success' | 'error';
  timestamp: number;
  duration?: number;
  error?: string;
  subStep?: string;
}

interface WorkflowStatusClientProps {
  runId: string;
  initialData: {
    status: string;
    progress: number;
    userUrl: string;
    completedSteps: Record<string, boolean>;
  };
}

export function WorkflowStatusClient({ runId, initialData }: WorkflowStatusClientProps) {
  const [status, setStatus] = useState(initialData.status);
  const [progress, setProgress] = useState(initialData.progress);
  const [steps, setSteps] = useState<StepUpdate[]>([
    { stepId: 'fetch-site', stepLabel: 'Fetching your site', status: initialData.completedSteps.userSiteData ? 'success' : 'pending', timestamp: Date.now() },
    { stepId: 'discover-keywords', stepLabel: 'Discovering keywords', status: initialData.completedSteps.discoveredKeywords ? 'success' : 'pending', timestamp: Date.now() },
    { stepId: 'search-competitors', stepLabel: 'Searching for competitors', status: initialData.completedSteps.competitorData ? 'success' : 'pending', timestamp: Date.now() },
    { stepId: 'fetch-competitors', stepLabel: 'Fetching competitor pages', status: initialData.completedSteps.competitorData ? 'success' : 'pending', timestamp: Date.now() },
    { stepId: 'analyze-patterns', stepLabel: 'Analyzing patterns', status: initialData.completedSteps.patterns ? 'success' : 'pending', timestamp: Date.now() },
    { stepId: 'identify-gaps', stepLabel: 'Identifying SEO gaps', status: initialData.completedSteps.gaps ? 'success' : 'pending', timestamp: Date.now() },
    { stepId: 'generate-recommendations', stepLabel: 'Generating recommendations', status: initialData.completedSteps.recommendations ? 'success' : 'pending', timestamp: Date.now() },
    { stepId: 'generate-report', stepLabel: 'Creating your report', status: initialData.completedSteps.reportHtml ? 'success' : 'pending', timestamp: Date.now() },
  ]);
  const [reportData, setReportData] = useState<StructuredReportData | null>(null);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [googleRanking, setGoogleRanking] = useState<number | null>(null);
  const [userUrl, setUserUrl] = useState(initialData.userUrl);
  const [currentSubStep, setCurrentSubStep] = useState<string | undefined>();
  const [showSteps, setShowSteps] = useState(false);

  // Track step start times for duration calculation
  const stepStartTimes = useState<Map<string, number>>(new Map())[0];

  // Fetch report on initial load if already completed
  useEffect(() => {
    if (status === 'completed' && !reportData && !reportHtml) {
      fetch(`/api/report/${runId}`)
        .then(res => res.json())
        .then(data => {
          if (data.reportData) {
            setReportData(data.reportData);
          } else if (data.reportHtml) {
            setReportHtml(data.reportHtml);
          }
          setGoogleRanking(data.googleRanking);
        })
        .catch(err => console.error('Failed to fetch report:', err));
    }
  }, [runId, status, reportData, reportHtml]);

  // Poll for status updates every 1 second
  useEffect(() => {
    if (status === 'completed' || status === 'failed' || status === 'error') {
      return;
    }

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/report/${runId}/status`);
        const data = await response.json();

        setStatus(data.status);
        setProgress(data.progress);
        setUserUrl(data.userUrl);
        setGoogleRanking(data.googleRanking);

        // Update step statuses and track durations
        setSteps(prev => {
          const updated = prev.map((step, index) => {
            let newStatus = step.status;
            let duration = step.duration;
            let subStep = step.subStep;

            // Check each step completion
            const stepCompletionMap: Record<string, keyof typeof data.completedSteps> = {
              'fetch-site': 'userSiteData',
              'discover-keywords': 'discoveredKeywords',
              'search-competitors': 'competitorData',
              'fetch-competitors': 'competitorData',
              'analyze-patterns': 'patterns',
              'identify-gaps': 'gaps',
              'generate-recommendations': 'recommendations',
              'generate-report': 'reportHtml',
            };

            const completionKey = stepCompletionMap[step.stepId];
            if (completionKey && data.completedSteps[completionKey] && step.status !== 'success') {
              newStatus = 'success';
              const startTime = stepStartTimes.get(step.stepId) || step.timestamp;
              duration = Date.now() - startTime;
            }

            return {
              ...step,
              status: newStatus,
              duration,
              subStep,
            };
          });

          // Now determine which step should be running
          return updated.map((step, index) => {
            // If already success or error, keep it
            if (step.status === 'success' || step.status === 'error') {
              return step;
            }

            // Find the first pending step after the last success
            let lastSuccessIndex = -1;
            for (let i = updated.length - 1; i >= 0; i--) {
              if (updated[i].status === 'success') {
                lastSuccessIndex = i;
                break;
              }
            }
            const isFirstPending = index === lastSuccessIndex + 1 && step.status === 'pending';

            if (isFirstPending) {
              if (!stepStartTimes.has(step.stepId)) {
                stepStartTimes.set(step.stepId, Date.now());
              }
              
              // Add sub-step hints for long-running operations
              let subStep = step.subStep;
              if (step.stepId === 'fetch-site') {
                subStep = 'Extracting SEO data from your site...';
              } else if (step.stepId === 'discover-keywords') {
                subStep = 'Analyzing content with AI...';
              } else if (step.stepId === 'search-competitors') {
                subStep = 'Searching search engines...';
              } else if (step.stepId === 'fetch-competitors') {
                subStep = 'Fetching competitor pages in parallel...';
              } else if (step.stepId === 'analyze-patterns') {
                subStep = 'Identifying common patterns...';
              } else if (step.stepId === 'identify-gaps') {
                subStep = 'Analyzing SEO gaps with AI...';
              } else if (step.stepId === 'generate-recommendations') {
                subStep = 'Generating content outline...';
              } else if (step.stepId === 'generate-report') {
                subStep = 'Structuring report data...';
              }

              return {
                ...step,
                status: 'running',
                subStep,
              };
            }

            return step;
          });
        });

        // Fetch report data when completed
        if (data.status === 'completed') {
          const reportResponse = await fetch(`/api/report/${runId}`);
          const reportResponseData = await reportResponse.json();
          if (reportResponseData.reportData) {
            setReportData(reportResponseData.reportData);
          } else if (reportResponseData.reportHtml) {
            setReportHtml(reportResponseData.reportHtml);
          }
        }
      } catch (error) {
        console.error('Failed to poll status:', error);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1000);

    return () => clearInterval(interval);
  }, [runId, status, stepStartTimes]);

  // Error state
  if (status === 'failed' || status === 'error') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#111111' }}>
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="rounded-2xl border p-8" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full" style={{ backgroundColor: '#222222' }}>
                <XCircle className="w-8 h-8" style={{ color: '#666666' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Analysis Failed</h1>
                <p style={{ color: '#888888' }}>Something went wrong during the analysis</p>
              </div>
            </div>

            <WorkflowStepTimeline steps={steps} />

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-6 py-3 rounded-xl font-medium transition-colors"
                style={{ backgroundColor: '#222222', color: '#FFFFFF' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2A2A2A'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#222222'}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show completed report
  if (status === 'completed' && (reportData || reportHtml)) {
    const completedCount = steps.filter(s => s.status === 'success').length;
    const totalDuration = steps
      .filter(s => s.duration)
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    return (
      <div className="min-h-screen" style={{ backgroundColor: '#222222' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Success header - minimal and elegant */}
          <div className="mb-12 no-print">
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#1A3A1A', border: '2px solid #22C55E' }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: '#22C55E' }} />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Analysis Complete</h1>
                <p className="text-lg" style={{ color: '#888888' }}>{userUrl}</p>
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t" style={{ borderColor: '#2A2A2A' }}>
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#666666' }}>Steps Completed</p>
                <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{completedCount}/{steps.length}</p>
              </div>
              {totalDuration > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#666666' }}>Total Time</p>
                  <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{(totalDuration / 1000).toFixed(0)}s</p>
                </div>
              )}
              {googleRanking !== undefined && googleRanking !== null && (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#666666' }}>Google Ranking</p>
                  <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                    {googleRanking > 0 ? `#${googleRanking}` : 'Not in top 100'}
                  </p>
                </div>
              )}
            </div>

            {/* Collapsible workflow steps - cleaner design */}
            <div className="mt-6">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors w-full text-left"
                style={{ 
                  backgroundColor: showSteps ? '#222222' : 'transparent',
                  color: '#888888'
                }}
                onMouseEnter={(e) => {
                  if (!showSteps) e.currentTarget.style.backgroundColor = '#1A1A1A';
                }}
                onMouseLeave={(e) => {
                  if (!showSteps) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {showSteps ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">Workflow Steps</span>
                <span className="ml-auto text-xs" style={{ color: '#666666' }}>
                  {completedCount} completed
                </span>
              </button>
              
              {showSteps && (
                <div className="mt-4 pl-2">
                  <WorkflowStepTimeline steps={steps} />
                </div>
              )}
            </div>

            <div className="mt-8">
              {reportData && (
                <DownloadReportButton
                  reportData={reportData}
                  userUrl={userUrl}
                  runId={runId}
                />
              )}
            </div>
          </div>

          {/* Report content */}
          {reportData ? (
            <SEOReport data={reportData} />
          ) : reportHtml ? (
            <div className="rounded-2xl border p-8" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
              <div dangerouslySetInnerHTML={{ __html: reportHtml }} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Running state - show progress
  const currentStep = steps.find(s => s.status === 'running');
  const currentSubStepText = currentStep?.subStep;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="rounded-2xl border p-8" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
          <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: '#FFFFFF' }}>
            Analyzing Your Site
          </h1>
          <p className="mb-8 text-center" style={{ color: '#888888' }}>
            {userUrl}
          </p>

          <WorkflowProgressBar 
            progress={progress} 
            currentStep={currentStep?.stepLabel || 'Processing...'} 
            totalSteps={steps.length} 
            completedSteps={steps.filter(s => s.status === 'success').length}
            subStep={currentSubStepText}
          />

          <div className="mt-8">
            <WorkflowStepTimeline steps={steps} />
          </div>

          <p className="text-sm text-center mt-8" style={{ color: '#555555' }}>
            This usually takes 1-2 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
