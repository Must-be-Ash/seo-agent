'use client';

import { TrendingUp, MapPin } from 'lucide-react';

interface ExecutiveSummaryProps {
  overview: string;
  keyFindings: string[];
  googleRanking?: number | null;
  googleRankingUrl?: string | null;
  targetKeyword?: string;
}

export function ExecutiveSummary({
  overview,
  keyFindings,
  googleRanking,
  googleRankingUrl,
  targetKeyword
}: ExecutiveSummaryProps) {
  return (
    <div className="rounded-2xl p-8 border" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
      {/* Google Ranking Badge */}
      {googleRanking !== undefined && (
        <div className="mb-6 flex items-center gap-4">
          {googleRanking ? (
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border-2"
                 style={{
                   backgroundColor: googleRanking <= 10 ? '#1A3A1A' : googleRanking <= 30 ? '#3A3A1A' : '#3A1A1A',
                   borderColor: googleRanking <= 10 ? '#22C55E' : googleRanking <= 30 ? '#EAB308' : '#EF4444'
                 }}>
              <MapPin className="w-6 h-6" style={{
                color: googleRanking <= 10 ? '#22C55E' : googleRanking <= 30 ? '#EAB308' : '#EF4444'
              }} />
              <div>
                <div className="text-xs uppercase tracking-wider" style={{ color: '#888888' }}>
                  Google Ranking for "{targetKeyword}"
                </div>
                <div className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>
                  #{googleRanking}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border-2"
                 style={{ backgroundColor: '#3A1A1A', borderColor: '#EF4444' }}>
              <TrendingUp className="w-6 h-6" style={{ color: '#EF4444' }} />
              <div>
                <div className="text-xs uppercase tracking-wider" style={{ color: '#888888' }}>
                  Google Ranking for "{targetKeyword}"
                </div>
                <div className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
                  Not in top 100
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold mb-3" style={{ color: '#FFFFFF' }}>Executive Summary</h2>
        <p className="text-lg leading-relaxed" style={{ color: '#CCCCCC' }}>{overview}</p>
      </div>

      {keyFindings.length > 0 && (
        <div className="mt-6 pt-6 border-t" style={{ borderColor: '#2A2A2A' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Key Findings</h3>
          <ul className="space-y-3">
            {keyFindings.map((finding, index) => (
              <li key={index} className="text-sm leading-relaxed" style={{ color: '#CCCCCC' }}>
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
