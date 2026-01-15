'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsComparisonProps {
  yourMetrics: {
    wordCount: number;
    h2Count: number;
    h3Count: number;
    internalLinks: number;
    externalLinks: number;
    hasSchema: boolean;
  };
  competitorBenchmarks: {
    avgWordCount: number;
    avgH2Count: number;
    avgH3Count: number;
    avgInternalLinks: number;
    avgExternalLinks: number;
    schemaUsage: number;
    totalCompetitors: number;
  };
}

export function MetricsComparison({ yourMetrics, competitorBenchmarks }: MetricsComparisonProps) {
  const metrics = [
    {
      label: 'Word Count',
      your: yourMetrics.wordCount,
      competitor: competitorBenchmarks.avgWordCount,
      unit: 'words',
    },
    {
      label: 'H2 Headings',
      your: yourMetrics.h2Count,
      competitor: competitorBenchmarks.avgH2Count,
      unit: 'headings',
    },
    {
      label: 'H3 Headings',
      your: yourMetrics.h3Count,
      competitor: competitorBenchmarks.avgH3Count,
      unit: 'headings',
    },
    {
      label: 'Internal Links',
      your: yourMetrics.internalLinks,
      competitor: competitorBenchmarks.avgInternalLinks,
      unit: 'links',
    },
    {
      label: 'External Links',
      your: yourMetrics.externalLinks,
      competitor: competitorBenchmarks.avgExternalLinks,
      unit: 'links',
    },
  ];

  const getComparison = (your: number, competitor: number) => {
    const diff = your - competitor;
    const percentDiff = competitor > 0 ? (diff / competitor) * 100 : 0;
    
    if (Math.abs(percentDiff) < 5) {
      return { icon: Minus, color: '#888888', text: 'Similar' };
    }
    if (diff > 0) {
      return { icon: TrendingUp, color: '#22C55E', text: `${Math.abs(percentDiff).toFixed(0)}% above` };
    }
    return { icon: TrendingDown, color: '#EF4444', text: `${Math.abs(percentDiff).toFixed(0)}% below` };
  };

  return (
    <div className="rounded-2xl p-8 border" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#FFFFFF' }}>Your Metrics vs Competitors</h2>
      
      <div className="space-y-4">
        {metrics.map((metric) => {
          const comparison = getComparison(metric.your, metric.competitor);
          const Icon = comparison.icon;
          
          return (
            <div
              key={metric.label}
              className="grid grid-cols-3 gap-4 p-4 rounded-xl border"
              style={{ backgroundColor: '#222222', borderColor: '#2A2A2A' }}
            >
              <div>
                <p className="text-sm mb-1" style={{ color: '#888888' }}>{metric.label}</p>
                <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{metric.your.toLocaleString()}</p>
                <p className="text-xs" style={{ color: '#666666' }}>Your site</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#888888' }}>Competitor Average</p>
                <p className="text-2xl font-bold" style={{ color: '#CCCCCC' }}>{metric.competitor.toLocaleString()}</p>
                <p className="text-xs" style={{ color: '#666666' }}>Based on {competitorBenchmarks.totalCompetitors} competitors</p>
              </div>
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-2" style={{ color: comparison.color }}>
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{comparison.text}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-xl border" style={{ backgroundColor: '#222222', borderColor: '#2A2A2A' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm mb-1" style={{ color: '#888888' }}>Schema Markup</p>
            <p className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
              {yourMetrics.hasSchema ? 'Present' : 'Missing'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm mb-1" style={{ color: '#888888' }}>Competitor Usage</p>
            <p className="text-lg font-semibold" style={{ color: '#CCCCCC' }}>
              {competitorBenchmarks.schemaUsage}/{competitorBenchmarks.totalCompetitors} use schema
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
