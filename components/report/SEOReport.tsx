'use client';

import type { StructuredReportData } from '@/types/report-data';
import { ExecutiveSummary } from './ExecutiveSummary';
import { MetricsComparison } from './MetricsComparison';
import { CompetitorList } from './CompetitorList';
import { GapAnalysis } from './GapAnalysis';
import { Recommendations } from './Recommendations';
import { ContentOutline } from './ContentOutline';

interface SEOReportProps {
  data: StructuredReportData;
}

export function SEOReport({ data }: SEOReportProps) {
  return (
    <div className="space-y-8">
      <ExecutiveSummary
        overview={data.executiveSummary.overview}
        keyFindings={data.executiveSummary.keyFindings}
        score={data.executiveSummary.score}
      />

      <MetricsComparison
        yourMetrics={data.yourMetrics}
        competitorBenchmarks={data.competitorBenchmarks}
      />

      <CompetitorList
        competitors={data.competitors}
        primaryKeyword={data.keywords.primary}
      />

      <GapAnalysis gaps={data.gaps} />

      <Recommendations
        highPriority={data.recommendations.highPriority}
        mediumPriority={data.recommendations.mediumPriority}
        lowPriority={data.recommendations.lowPriority}
      />

      <ContentOutline
        recommendedH1={data.contentOutline.recommendedH1}
        h2Sections={data.contentOutline.h2Sections}
        totalEstimatedWordCount={data.contentOutline.totalEstimatedWordCount}
      />
    </div>
  );
}
