'use client';

interface Gap {
  category: string;
  severity: 'high' | 'medium' | 'low';
  finding: string;
  impact: string;
  recommendation: string;
}

interface GapAnalysisProps {
  gaps: Gap[];
}

export function GapAnalysis({ gaps }: GapAnalysisProps) {
  const getBadgeColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return { bg: '#EF4444', text: '#FFFFFF' };
      case 'medium':
        return { bg: '#EAB308', text: '#000000' };
      case 'low':
        return { bg: '#3B82F6', text: '#FFFFFF' };
    }
  };

  const groupedGaps = {
    high: gaps.filter(g => g.severity === 'high'),
    medium: gaps.filter(g => g.severity === 'medium'),
    low: gaps.filter(g => g.severity === 'low'),
  };

  return (
    <div className="rounded-2xl p-8 border" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
      <h2 className="text-2xl font-bold mb-8" style={{ color: '#FFFFFF' }}>SEO Gap Analysis</h2>

      <div className="space-y-8">
        {groupedGaps.high.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
              <span className="px-3 py-1.5 rounded-full text-sm font-bold inline-block mr-2" style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}>
                High Priority ({groupedGaps.high.length})
              </span>
            </h3>
            <div className="space-y-3">
              {groupedGaps.high.map((gap, index) => (
                <GapCard key={index} gap={gap} getBadgeColor={getBadgeColor} />
              ))}
            </div>
          </div>
        )}

        {groupedGaps.medium.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
              <span className="px-3 py-1.5 rounded-full text-sm font-bold inline-block mr-2" style={{ backgroundColor: '#EAB308', color: '#000000' }}>
                Medium Priority ({groupedGaps.medium.length})
              </span>
            </h3>
            <div className="space-y-3">
              {groupedGaps.medium.map((gap, index) => (
                <GapCard key={index} gap={gap} getBadgeColor={getBadgeColor} />
              ))}
            </div>
          </div>
        )}

        {groupedGaps.low.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
              <span className="px-3 py-1.5 rounded-full text-sm font-bold inline-block mr-2" style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}>
                Low Priority ({groupedGaps.low.length})
              </span>
            </h3>
            <div className="space-y-3">
              {groupedGaps.low.map((gap, index) => (
                <GapCard key={index} gap={gap} getBadgeColor={getBadgeColor} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GapCard({ gap, getBadgeColor }: { gap: Gap; getBadgeColor: (severity: 'high' | 'medium' | 'low') => { bg: string; text: string } }) {
  const badgeColors = getBadgeColor(gap.severity);

  return (
    <div className="rounded-lg p-6 border" style={{ backgroundColor: '#222222', borderColor: '#2A2A2A' }}>
      <div className="flex items-start gap-3 mb-3">
        <span className="px-2.5 py-1 rounded text-xs font-semibold uppercase flex-shrink-0" style={{ backgroundColor: badgeColors.bg, color: badgeColors.text }}>
          {gap.severity}
        </span>
        <span className="text-sm font-medium" style={{ color: '#888888' }}>{gap.category}</span>
      </div>
      
      <h4 className="font-semibold text-base mb-2" style={{ color: '#FFFFFF' }}>{gap.finding}</h4>
      <p className="text-sm mb-4 leading-relaxed" style={{ color: '#CCCCCC' }}>{gap.impact}</p>
      
      <div className="pt-4 border-t" style={{ borderColor: '#2A2A2A' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#666666' }}>Recommendation</p>
        <p className="text-sm leading-relaxed" style={{ color: '#CCCCCC' }}>{gap.recommendation}</p>
      </div>
    </div>
  );
}
