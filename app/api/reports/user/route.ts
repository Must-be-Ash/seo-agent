import { NextResponse } from 'next/server';
import { getReportsByUserId } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('[API] Fetching reports for user:', userId);

    const reports = await getReportsByUserId(userId);

    return NextResponse.json({
      success: true,
      reports: reports.map(report => ({
        runId: report.runId,
        url: report.userUrl,
        targetKeyword: report.targetKeyword,
        status: report.status,
        createdAt: report.createdAt,
        googleRanking: report.googleRanking,
      })),
    });
  } catch (error) {
    console.error('[API] Error fetching user reports:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
