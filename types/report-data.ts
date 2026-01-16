// Structured report data type - replaces HTML generation
export interface StructuredReportData {
  executiveSummary: {
    overview: string;
    keyFindings: string[];
    score: number;
  };
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
  gaps: Array<{
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    finding: string;
    impact: string;
    recommendation: string;
    estimatedEffort?: string;
  }>;
  recommendations: {
    highPriority: Array<{
      title: string;
      description: string;
      actionItems: string[];
    }>;
    mediumPriority: Array<{
      title: string;
      description: string;
      actionItems: string[];
    }>;
    lowPriority: Array<{
      title: string;
      description: string;
      actionItems: string[];
    }>;
  };
  contentOutline: {
    recommendedH1: string;
    h2Sections: Array<{
      title: string;
      estimatedWordCount: number;
      description: string;
    }>;
    totalEstimatedWordCount: number;
  };
  keywords: {
    primary: string;
    secondary: string[];
  };
  competitors: Array<{
    rank: number;
    url: string;
    title: string;
    wordCount: number;
    h2Count: number;
  }>;
}
