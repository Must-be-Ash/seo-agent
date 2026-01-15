import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
