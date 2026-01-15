import { NextResponse } from 'next/server';
import { getReportByRunId } from '@/lib/db';

interface RouteParams {
  params: Promise<{
    runId: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { runId } = await params;

    // Fetch report from database
    const report = await getReportByRunId(runId);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
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

    // Return status and progress information
    return NextResponse.json({
      status: report.status,
      progress,
      completedSteps: {
        userSiteData: !!report.userSiteData,
        discoveredKeywords: !!report.discoveredKeywords,
        competitorData: !!report.competitorData,
        patterns: !!report.patterns,
        gaps: !!report.gaps,
        recommendations: !!report.recommendations,
        reportHtml: !!(report.reportData || report.reportHtml),
      },
    });
  } catch (error) {
    console.error('Status fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
