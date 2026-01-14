import { getReportByRunId } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';

interface ReportPageProps {
  params: Promise<{
    runId: string;
  }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { runId } = await params;

  // Fetch report from database
  const report = await getReportByRunId(runId);

  if (!report) {
    notFound();
  }

  // If still analyzing, show progress
  if (report.status === 'analyzing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/5 mb-4">
              <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Analyzing Your Site...
            </h1>
            <p className="text-slate-600 mb-4">
              This usually takes 1-2 minutes
            </p>
            <p className="text-sm text-slate-500">
              Analyzing: {report.userUrl}
            </p>
          </div>

          {/* Progress indicators */}
          <div className="mt-12 max-w-md mx-auto space-y-3">
            {[
              { label: 'Fetching your site', done: !!report.userSiteData },
              { label: 'Discovering keywords', done: !!report.discoveredKeywords },
              { label: 'Analyzing competitors', done: !!report.competitorData },
              { label: 'Identifying gaps', done: !!report.gaps },
              { label: 'Generating recommendations', done: !!report.recommendations },
              { label: 'Creating report', done: !!report.reportHtml },
            ].map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  step.done ? 'bg-green-50' : 'bg-slate-50'
                }`}
              >
                {step.done ? (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                )}
                <span className={step.done ? 'text-green-900 font-medium' : 'text-slate-600'}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Auto-refresh instructions */}
          <p className="text-center text-sm text-slate-500 mt-8">
            This page will auto-refresh when your report is ready
          </p>

          {/* Auto-refresh script */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                setTimeout(() => {
                  window.location.reload();
                }, 5000);
              `,
            }}
          />
        </main>
      </div>
    );
  }

  // If failed
  if (report.status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Analysis Failed
            </h1>
            <p className="text-slate-600 mb-8">
              We encountered an error while analyzing your site.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Try Again
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // If completed, show report
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      {/* Report Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Analyze Another Site
              </Link>
              <h1 className="text-2xl font-bold text-slate-900">
                SEO Gap Analysis Report
              </h1>
              <p className="text-slate-600 mt-1">
                {report.userUrl}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Score Badge */}
              {report.score !== undefined && (
                <div className="flex flex-col items-center">
                  <span className="text-sm text-slate-600 mb-1">SEO Score</span>
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                      report.score >= 80
                        ? 'bg-green-100 text-green-700'
                        : report.score >= 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {report.score}
                  </div>
                </div>
              )}

              {/* Download button (optional) */}
              <button
                onClick={() => {
                  const blob = new Blob([report.reportHtml || ''], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `seo-report-${runId}.html`;
                  a.click();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {report.reportHtml ? (
          <div
            className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: report.reportHtml }}
          />
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-slate-600">Report content not available</p>
          </div>
        )}
      </main>
    </div>
  );
}
