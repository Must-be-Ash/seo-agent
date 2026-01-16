'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsSignedIn } from '@coinbase/cdp-hooks';
import { getCurrentUser, toViemAccount } from '@coinbase/cdp-core';
import { FileText, Calendar, TrendingUp, ArrowRight, Home } from 'lucide-react';

interface Report {
  runId: string;
  url: string;
  targetKeyword: string;
  status: 'analyzing' | 'completed' | 'failed';
  createdAt: number;
  googleRanking?: number | null;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useIsSignedIn();
  const router = useRouter();

  useEffect(() => {
    async function fetchReports() {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser();
        const walletAddress = user?.evmSmartAccounts?.[0] ?
          (await toViemAccount(user.evmSmartAccounts[0])).address :
          null;

        if (!walletAddress) {
          setError('Could not get wallet address');
          setLoading(false);
          return;
        }

        console.log('[Reports] Fetching reports for:', walletAddress);

        const response = await fetch(`/api/reports/user?userId=${walletAddress}`);
        const data = await response.json();

        if (data.success) {
          setReports(data.reports);
        } else {
          setError(data.error || 'Failed to fetch reports');
        }
      } catch (err) {
        console.error('[Reports] Error:', err);
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [isSignedIn]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#212121' }}>
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="mb-6">
            <FileText className="w-16 h-16 mx-auto" style={{ color: '#666666' }} />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Sign In Required
          </h1>
          <p className="text-lg mb-8" style={{ color: '#888888' }}>
            Please sign in to view your report history
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
            style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F5F5F5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#212121' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#FFFFFF' }}></div>
          <p style={{ color: '#888888' }}>Loading your reports...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#212121' }}>
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <p className="text-lg mb-8" style={{ color: '#EF4444' }}>
            {error}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
            style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    );
  }

  // No reports yet
  if (reports.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#212121' }}>
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="mb-6">
            <FileText className="w-16 h-16 mx-auto" style={{ color: '#666666' }} />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            No Reports Yet
          </h1>
          <p className="text-lg mb-8" style={{ color: '#888888' }}>
            You haven't created any SEO reports yet
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
            style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F5F5F5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <Home className="w-4 h-4" />
            <span>Start First Analysis</span>
          </button>
        </div>
      </div>
    );
  }

  // Show reports
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
            Your SEO Reports
          </h1>
          <p style={{ color: '#888888' }}>
            View and access your previous SEO analyses
          </p>
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.runId}
              onClick={() => router.push(`/report/${report.runId}`)}
              className="rounded-xl p-6 border transition-all cursor-pointer hover:border-[#444444]"
              style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>
                      {report.url}
                    </h3>
                    {report.status === 'completed' && (
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: '#1E3A1E', color: '#4ADE80' }}
                      >
                        Completed
                      </span>
                    )}
                    {report.status === 'analyzing' && (
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: '#3A3A1A', color: '#EAB308' }}
                      >
                        Analyzing
                      </span>
                    )}
                    {report.status === 'failed' && (
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: '#3A1A1A', color: '#EF4444' }}
                      >
                        Failed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" style={{ color: '#666666' }} />
                      <span className="text-sm" style={{ color: '#888888' }}>
                        {report.targetKeyword}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: '#666666' }} />
                      <span className="text-sm" style={{ color: '#888888' }}>
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                  </div>

                  {report.googleRanking !== undefined && report.googleRanking !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider" style={{ color: '#666666' }}>
                        Google Ranking:
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: report.googleRanking <= 10 ? '#22C55E' : report.googleRanking <= 30 ? '#EAB308' : '#EF4444'
                        }}
                      >
                        #{report.googleRanking}
                      </span>
                    </div>
                  )}
                </div>

                <ArrowRight className="w-5 h-5 flex-shrink-0" style={{ color: '#666666' }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-lg font-medium transition-all"
            style={{ backgroundColor: '#2A2A2A', color: '#FFFFFF' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3A3A3A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2A2A2A';
            }}
          >
            Create New Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
