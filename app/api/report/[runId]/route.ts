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

    // Return full report data
    return NextResponse.json({
      runId: report.runId,
      status: report.status,
      userUrl: report.userUrl,
      score: report.score,
      reportHtml: report.reportHtml,
      createdAt: report.createdAt,
    });
  } catch (error) {
    console.error('Report fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
