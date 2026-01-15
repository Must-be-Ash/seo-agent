import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

interface RouteParams {
  params: Promise<{
    runId: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { runId } = await params;
    const client = await clientPromise;
    const db = client.db('seo-agent');
    const collection = db.collection('seo_reports');

    // Try to find by runId first
    let report = await collection.findOne({ runId });

    // If not found, try to find by workflow runId or any recent report
    if (!report) {
      report = await collection.findOne({}, { sort: { createdAt: -1 } });
    }

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Return the full report for inspection
    return NextResponse.json({
      runId: report.runId,
      status: report.status,
      userUrl: report.userUrl,
      score: report.score,
      hasReportData: !!report.reportData,
      hasReportHtml: !!report.reportHtml,
      reportData: report.reportData || null,
      recommendations: report.recommendations || null,
      gaps: report.gaps || null,
      patterns: report.patterns || null,
      userSiteData: report.userSiteData ? {
        title: report.userSiteData.title,
        wordCount: report.userSiteData.wordCount,
        h2Count: report.userSiteData.h2?.length || 0,
        h3Count: report.userSiteData.h3?.length || 0,
        internalLinks: report.userSiteData.internalLinks,
        externalLinks: report.userSiteData.externalLinks,
        hasSchema: report.userSiteData.hasSchema,
      } : null,
      discoveredKeywords: report.discoveredKeywords || null,
      competitorData: report.competitorData || null,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
