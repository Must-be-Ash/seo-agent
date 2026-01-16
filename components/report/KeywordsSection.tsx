'use client';

import { Target, Tag } from 'lucide-react';

interface KeywordsSectionProps {
  keywords: {
    primary: string;
    secondary: string[];
  };
}

export function KeywordsSection({ keywords }: KeywordsSectionProps) {
  return (
    <div className="rounded-2xl p-8 border" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ backgroundColor: '#222222' }}>
          <Target className="w-5 h-5" style={{ color: '#888888' }} />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Target Keywords</h2>
      </div>

      <p className="text-sm mb-6" style={{ color: '#888888' }}>
        These are the keywords your site is being analyzed against. Optimize your content around these terms to improve rankings.
      </p>

      {/* Primary Keyword */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#666666' }}>
            Primary Keyword
          </span>
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: '#1E3A1E', color: '#4ADE80' }}
          >
            Main Focus
          </span>
        </div>
        <div
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border-2"
          style={{ backgroundColor: '#222222', borderColor: '#4ADE80' }}
        >
          <Tag className="w-5 h-5" style={{ color: '#4ADE80' }} />
          <span className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
            {keywords.primary}
          </span>
        </div>
      </div>

      {/* Secondary Keywords */}
      {keywords.secondary && keywords.secondary.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#666666' }}>
              Secondary Keywords
            </span>
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: '#2A2A3A', color: '#93C5FD' }}
            >
              Supporting Topics
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.secondary.map((keyword, index) => (
              <div
                key={index}
                className="px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: '#222222',
                  borderColor: '#3A3A3A',
                  color: '#CCCCCC'
                }}
              >
                {keyword}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
