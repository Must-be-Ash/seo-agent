'use client';

import { ExternalLink } from 'lucide-react';

interface Competitor {
  rank: number;
  url: string;
  title: string;
  wordCount: number;
  h2Count: number;
}

interface CompetitorListProps {
  competitors: Competitor[];
  primaryKeyword: string;
}

export function CompetitorList({ competitors, primaryKeyword }: CompetitorListProps) {
  if (!competitors || competitors.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl p-8 border" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Competitors Analyzed</h2>
        <p className="text-sm" style={{ color: '#888888' }}>
          Top {competitors.length} pages ranking for "{primaryKeyword}"
        </p>
      </div>

      <div className="space-y-3">
        {competitors.map((competitor, index) => (
          <div
            key={index}
            className="p-5 rounded-lg border transition-colors"
            style={{ backgroundColor: '#222222', borderColor: '#2A2A2A' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#333333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2A2A2A';
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#2A2A2A', color: '#CCCCCC' }}>
                #{competitor.rank}
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={competitor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 group mb-2"
                >
                  <h3 
                    className="font-semibold truncate group-hover:underline"
                    style={{ color: '#FFFFFF' }}
                  >
                    {competitor.title}
                  </h3>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#888888' }} />
                </a>
                <a
                  href={competitor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm block truncate mb-3 hover:underline"
                  style={{ color: '#888888' }}
                >
                  {competitor.url}
                </a>
                <div className="flex items-center gap-4 text-xs" style={{ color: '#666666' }}>
                  <span>{competitor.wordCount.toLocaleString()} words</span>
                  <span>•</span>
                  <span>{competitor.h2Count} H2 headings</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: '#222222', borderColor: '#2A2A2A' }}>
        <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>
          <strong style={{ color: '#CCCCCC' }}>Note:</strong> These competitors were identified by searching for "{primaryKeyword}" and represent the top-ranking pages that your site is compared against in this analysis.
        </p>
      </div>
    </div>
  );
}
