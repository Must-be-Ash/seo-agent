'use client';

interface Recommendation {
  title: string;
  description: string;
  actionItems: string[];
}

interface RecommendationsProps {
  highPriority: Recommendation[];
  mediumPriority: Recommendation[];
  lowPriority: Recommendation[];
}

export function Recommendations({ highPriority, mediumPriority, lowPriority }: RecommendationsProps) {
  return (
    <div className="rounded-2xl p-8 border" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
      <h2 className="text-2xl font-bold mb-8" style={{ color: '#FFFFFF' }}>Prioritized Recommendations</h2>

      <div className="space-y-8">
        {highPriority.length > 0 && (
          <RecommendationSection
            title="High Priority"
            recommendations={highPriority}
            priority="high"
          />
        )}

        {mediumPriority.length > 0 && (
          <RecommendationSection
            title="Medium Priority"
            recommendations={mediumPriority}
            priority="medium"
          />
        )}

        {lowPriority.length > 0 && (
          <RecommendationSection
            title="Low Priority"
            recommendations={lowPriority}
            priority="low"
          />
        )}

        {highPriority.length === 0 && mediumPriority.length === 0 && lowPriority.length === 0 && (
          <div className="p-6 rounded-xl border text-center" style={{ backgroundColor: '#222222', borderColor: '#2A2A2A', color: '#888888' }}>
            No recommendations available.
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationSection({
  title,
  recommendations,
  priority,
}: {
  title: string;
  recommendations: Recommendation[];
  priority: 'high' | 'medium' | 'low';
}) {
  const badgeColors = {
    high: { bg: '#EF4444', text: '#FFFFFF' },
    medium: { bg: '#EAB308', text: '#000000' },
    low: { bg: '#3B82F6', text: '#FFFFFF' },
  }[priority];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
        <span className="px-3 py-1.5 rounded-full text-sm font-bold inline-block mr-2" style={{ backgroundColor: badgeColors.bg, color: badgeColors.text }}>
          {title}
        </span>
        <span className="text-sm" style={{ color: '#888888' }}>({recommendations.length} items)</span>
      </h3>
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="rounded-lg p-6 border"
            style={{ backgroundColor: '#222222', borderColor: '#2A2A2A' }}
          >
            <h4 className="font-semibold text-base mb-2" style={{ color: '#FFFFFF' }}>
              {rec.title}
            </h4>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: '#CCCCCC' }}>{rec.description}</p>
            {rec.actionItems.length > 0 && (
              <div className="pt-4 border-t" style={{ borderColor: '#2A2A2A' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#666666' }}>Action Items</p>
                <ul className="space-y-2">
                  {rec.actionItems.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3" style={{ color: '#CCCCCC' }}>
                      <span className="text-sm leading-relaxed">• {item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
