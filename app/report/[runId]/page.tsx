import { getReportByRunId } from '@/lib/db';
import { notFound } from 'next/navigation';
import { WorkflowStatusClient } from '@/components/WorkflowStatusClient';

interface ReportPageProps {
  params: Promise<{
    runId: string;
  }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { runId } = await params;

  // Fetch initial report data from database
  const report = await getReportByRunId(runId);

  if (!report) {
    notFound();
  }

  // Calculate progress based on completed steps
  let progress = 0;
  if (report.userSiteData) progress += 15;
  if (report.discoveredKeywords) progress += 15;
  if (report.competitorData) progress += 30;
  if (report.patterns) progress += 10;
  if (report.gaps) progress += 10;
  if (report.recommendations) progress += 10;
  if (report.reportData || report.reportHtml) progress += 10;

  if (report.status === 'completed') {
    progress = 100;
  }

  const initialData = {
    status: report.status,
    progress,
    userUrl: report.userUrl,
    completedSteps: {
      userSiteData: !!report.userSiteData,
      discoveredKeywords: !!report.discoveredKeywords,
      competitorData: !!report.competitorData,
      patterns: !!report.patterns,
      gaps: !!report.gaps,
      recommendations: !!report.recommendations,
      reportHtml: !!(report.reportData || report.reportHtml),
    },
  };

  return <WorkflowStatusClient runId={runId} initialData={initialData} />;
}
