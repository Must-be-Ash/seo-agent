'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';

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
    <div className="bg-white rounded-2xl p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Prioritized Recommendations</h2>

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
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-600">
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
  const priorityStyles = {
    high: {
      border: 'border-red-300',
      bg: 'bg-red-50',
      badge: 'bg-red-600 text-white',
    },
    medium: {
      border: 'border-amber-300',
      bg: 'bg-amber-50',
      badge: 'bg-amber-600 text-white',
    },
    low: {
      border: 'border-blue-300',
      bg: 'bg-blue-50',
      badge: 'bg-blue-600 text-white',
    },
  };

  const styles = priorityStyles[priority];

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <span className={`${styles.badge} px-3 py-1 rounded-full text-sm font-bold`}>
          {title}
        </span>
        <span className="text-slate-600">({recommendations.length} items)</span>
      </h3>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className={`${styles.bg} ${styles.border} border-l-4 rounded-xl p-6`}
          >
            <h4 className="font-semibold text-lg text-slate-900 mb-2 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-slate-600" />
              {rec.title}
            </h4>
            <p className="text-slate-700 mb-4">{rec.description}</p>
            {rec.actionItems.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-sm font-semibold text-slate-900 mb-2">Action Items:</p>
                <ul className="space-y-2">
                  {rec.actionItems.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
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
