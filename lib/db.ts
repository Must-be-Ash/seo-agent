import clientPromise from './mongodb';
import type { SEOReport } from '@/types';

// Using dedicated database 'seo-agent' in the shared MongoDB cluster
// This ensures no conflicts with other projects using the same cluster
const DB_NAME = 'seo-agent';
const COLLECTION_NAME = 'seo_reports';

export async function saveReport(report: SEOReport): Promise<void> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<SEOReport>(COLLECTION_NAME);

  await collection.insertOne(report);
}

export async function getReportByRunId(runId: string): Promise<SEOReport | null> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<SEOReport>(COLLECTION_NAME);

  const report = await collection.findOne({ runId });
  return report;
}

export async function updateReportStatus(
  runId: string,
  status: 'analyzing' | 'completed' | 'failed',
  data?: Partial<SEOReport>
): Promise<void> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<SEOReport>(COLLECTION_NAME);

  await collection.updateOne(
    { runId },
    { $set: { status, ...data } }
  );
}

export async function updateReport(runId: string, data: Partial<SEOReport>): Promise<void> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<SEOReport>(COLLECTION_NAME);

  await collection.updateOne(
    { runId },
    { $set: data }
  );
}

export async function getUserReports(userId: string): Promise<SEOReport[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<SEOReport>(COLLECTION_NAME);

  const reports = await collection
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return reports;
}
