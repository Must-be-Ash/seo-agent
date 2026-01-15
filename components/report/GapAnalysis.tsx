'use client';

import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

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
  const getSeverityStyles = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          icon: AlertCircle,
          iconColor: 'text-red-600',
          badge: 'bg-red-600 text-white',
          text: 'text-red-900',
        };
      case 'medium':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          badge: 'bg-amber-600 text-white',
          text: 'text-amber-900',
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          icon: Info,
          iconColor: 'text-blue-600',
          badge: 'bg-blue-600 text-white',
          text: 'text-blue-900',
        };
    }
  };

  const groupedGaps = {
    high: gaps.filter(g => g.severity === 'high'),
    medium: gaps.filter(g => g.severity === 'medium'),
    low: gaps.filter(g => g.severity === 'low'),
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">SEO Gap Analysis</h2>

      <div className="space-y-6">
        {groupedGaps.high.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-bold">
                High Priority ({groupedGaps.high.length})
              </span>
            </h3>
            <div className="space-y-4">
              {groupedGaps.high.map((gap, index) => {
                const styles = getSeverityStyles('high');
                const Icon = styles.icon;
                return (
                  <GapCard key={index} gap={gap} styles={styles} Icon={Icon} />
                );
              })}
            </div>
          </div>
        )}

        {groupedGaps.medium.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-600 text-white rounded-full text-sm font-bold">
                Medium Priority ({groupedGaps.medium.length})
              </span>
            </h3>
            <div className="space-y-4">
              {groupedGaps.medium.map((gap, index) => {
                const styles = getSeverityStyles('medium');
                const Icon = styles.icon;
                return (
                  <GapCard key={index} gap={gap} styles={styles} Icon={Icon} />
                );
              })}
            </div>
          </div>
        )}

        {groupedGaps.low.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                Low Priority ({groupedGaps.low.length})
              </span>
            </h3>
            <div className="space-y-4">
              {groupedGaps.low.map((gap, index) => {
                const styles = getSeverityStyles('low');
                const Icon = styles.icon;
                return (
                  <GapCard key={index} gap={gap} styles={styles} Icon={Icon} />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GapCard({ gap, styles, Icon }: { gap: Gap; styles: any; Icon: any }) {
  return (
    <div className={`${styles.bg} ${styles.border} border-l-4 rounded-xl p-6`}>
      <div className="flex items-start gap-4">
        <div className={`${styles.iconColor} flex-shrink-0 mt-1`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`${styles.badge} px-2 py-1 rounded text-xs font-semibold uppercase`}>
              {gap.severity}
            </span>
            <span className="text-sm font-semibold text-slate-600">{gap.category}</span>
          </div>
          <h4 className={`${styles.text} font-semibold text-lg mb-2`}>{gap.finding}</h4>
          <p className="text-slate-700 mb-3">{gap.impact}</p>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-sm font-semibold text-slate-900 mb-1">Recommendation:</p>
            <p className="text-slate-700">{gap.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
