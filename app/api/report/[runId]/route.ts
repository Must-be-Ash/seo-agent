import { NextResponse } from 'next/server';
import { getReportByRunId, updateReport } from '@/lib/db';
import { logAndSanitizeError } from '@/lib/safe-errors';

interface RouteParams {
  params: Promise<{
    runId: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { runId } = await params;

    // Validate runId format
    if (!/^seo_\d+_[a-z0-9]{9}$/.test(runId)) {
      return NextResponse.json(
        { error: 'Invalid report ID format' },
        { status: 400 }
      );
    }

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
      reportData: report.reportData,
      reportHtml: report.reportHtml, // Deprecated, kept for backward compatibility
      createdAt: report.createdAt,
    });
  } catch (error) {
    const safeError = logAndSanitizeError(error, 'report-fetch');
    return NextResponse.json(
      { error: safeError },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { runId } = await params;

    // Validate runId format
    if (!/^seo_\d+_[a-z0-9]{9}$/.test(runId)) {
      return NextResponse.json(
        { error: 'Invalid report ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Update report in database
    await updateReport(runId, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    const safeError = logAndSanitizeError(error, 'report-update');
    return NextResponse.json(
      { error: safeError },
      { status: 500 }
    );
  }
}
