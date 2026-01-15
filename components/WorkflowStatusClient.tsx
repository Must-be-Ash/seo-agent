'use client';

import { useEffect, useState } from 'react';
import { WorkflowProgressBar } from './WorkflowProgressBar';
import { WorkflowStepTimeline } from './WorkflowStepTimeline';
import { CheckCircle2, XCircle } from 'lucide-react';

interface StepUpdate {
  stepId: string;
  stepLabel: string;
  status: 'pending' | 'running' | 'success' | 'error';
  timestamp: number;
  duration?: number;
  error?: string;
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
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [userUrl, setUserUrl] = useState(initialData.userUrl);

  // Poll for status updates every 1 second
  useEffect(() => {
    if (status === 'completed' || status === 'failed' || status === 'error') {
      return; // Stop polling when done
    }

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/report/${runId}/status`);
        const data = await response.json();

        setStatus(data.status);
        setProgress(data.progress);
        setUserUrl(data.userUrl);
        setScore(data.score);

        // Update step statuses based on completed steps
        setSteps(prev => prev.map(step => {
          if (step.stepId === 'fetch-site' && data.completedSteps.userSiteData) {
            return { ...step, status: 'success' as const };
          }
          if (step.stepId === 'discover-keywords' && data.completedSteps.discoveredKeywords) {
            return { ...step, status: 'success' as const };
          }
          if (step.stepId === 'search-competitors' && data.completedSteps.competitorData) {
            return { ...step, status: 'success' as const };
          }
          if (step.stepId === 'fetch-competitors' && data.completedSteps.competitorData) {
            return { ...step, status: 'success' as const };
          }
          if (step.stepId === 'analyze-patterns' && data.completedSteps.patterns) {
            return { ...step, status: 'success' as const };
          }
          if (step.stepId === 'identify-gaps' && data.completedSteps.gaps) {
            return { ...step, status: 'success' as const };
          }
          if (step.stepId === 'generate-recommendations' && data.completedSteps.recommendations) {
            return { ...step, status: 'success' as const };
          }
          if (step.stepId === 'generate-report' && data.completedSteps.reportHtml) {
            return { ...step, status: 'success' as const };
          }
          return step;
        }));

        // Fetch report HTML when completed
        if (data.status === 'completed') {
          const reportResponse = await fetch(`/api/report/${runId}`);
          const reportData = await reportResponse.json();
          setReportHtml(reportData.reportHtml);
        }
      } catch (error) {
        console.error('Failed to poll status:', error);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1000); // Poll every 1 second

    return () => clearInterval(interval);
  }, [runId, status]);

  // Error state
  if (status === 'failed' || status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Analysis Failed</h1>
                <p className="text-slate-600">Something went wrong during the analysis</p>
              </div>
            </div>

            <WorkflowStepTimeline steps={steps} />

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
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
  if (status === 'completed' && reportHtml) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Success header */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-100 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Analysis Complete!</h1>
                <p className="text-slate-600">Your SEO gap analysis is ready</p>
              </div>
            </div>

            {score !== null && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-600 mb-1">SEO Score</p>
                <p className="text-4xl font-bold text-slate-900">{score}/100</p>
              </div>
            )}

            {/* Collapsible workflow steps */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
                View Workflow Steps
              </summary>
              <div className="mt-4">
                <WorkflowStepTimeline steps={steps} />
              </div>
            </details>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Analyze Another Site
              </button>
            </div>
          </div>

          {/* Report content */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div dangerouslySetInnerHTML={{ __html: reportHtml }} />
          </div>
        </div>
      </div>
    );
  }

  // Running state - show progress
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
            Analyzing Your Site
          </h1>
          <p className="text-slate-600 mb-8 text-center">
            Analyzing: {userUrl}
          </p>

          <WorkflowProgressBar progress={progress} currentStep={steps.find(s => s.status === 'running')?.stepLabel || 'Processing...'} totalSteps={steps.length} completedSteps={steps.filter(s => s.status === 'success').length} />

          <div className="mt-8">
            <WorkflowStepTimeline steps={steps} />
          </div>

          <p className="text-sm text-slate-500 text-center mt-8">
            This usually takes 1-2 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
