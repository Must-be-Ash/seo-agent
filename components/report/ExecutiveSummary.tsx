'use client';

import { ScoreBadge } from './ScoreBadge';
import { CheckCircle2 } from 'lucide-react';

interface ExecutiveSummaryProps {
  overview: string;
  keyFindings: string[];
  score: number;
}

export function ExecutiveSummary({ overview, keyFindings, score }: ExecutiveSummaryProps) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
      <div className="flex items-start gap-6 mb-6">
        <ScoreBadge score={score} size="lg" />
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Executive Summary</h2>
          <p className="text-lg text-slate-700 leading-relaxed">{overview}</p>
        </div>
      </div>

      {keyFindings.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Key Findings</h3>
          <ul className="space-y-2">
            {keyFindings.map((finding, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
