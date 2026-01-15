'use client';

import { ScoreBadge } from './ScoreBadge';

interface ExecutiveSummaryProps {
  overview: string;
  keyFindings: string[];
  score: number;
}

export function ExecutiveSummary({ overview, keyFindings, score }: ExecutiveSummaryProps) {
  return (
    <div className="rounded-2xl p-8 border" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
      <div className="flex items-start gap-6 mb-6">
        <ScoreBadge score={score} size="lg" />
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-3" style={{ color: '#FFFFFF' }}>Executive Summary</h2>
          <p className="text-lg leading-relaxed" style={{ color: '#CCCCCC' }}>{overview}</p>
        </div>
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
