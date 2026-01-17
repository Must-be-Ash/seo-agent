import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { logAndSanitizeError } from '@/lib/safe-errors';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('seo-agent');
    const collection = db.collection('seo_reports');

    const reports = await collection.find({}).sort({ createdAt: -1 }).limit(10).toArray();

    return NextResponse.json({
      count: reports.length,
      reports: reports.map(r => ({
        runId: r.runId,
        status: r.status,
        userUrl: r.userUrl,
        createdAt: r.createdAt,
        hasReportHtml: !!r.reportHtml,
      })),
    });
  } catch (error) {
    const safeError = logAndSanitizeError(error, 'debug-reports-list');
    return NextResponse.json(
      { error: safeError },
      { status: 500 }
    );
  }
}
