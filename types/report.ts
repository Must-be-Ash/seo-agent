// SEO Report Data Types

export interface SEOMetrics {
  wordCount: number;
  h2Count: number;
  internalLinks: number;
  title: string;
  url: string;
}

export interface CompetitorMetrics {
  avgWordCount: number;
  avgH2Count: number;
  avgInternalLinks: number;
}

export interface SEOGap {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  impact: string;
  currentValue?: number;
  targetValue?: number;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  actionItems: string[];
}

export interface ContentOutline {
  recommendedH1: string;
  h2Sections: Array<{
    title: string;
    estimatedWordCount: number;
    keyPoints: string[];
  }>;
  totalEstimatedWordCount: number;
}

export interface SEOReportData {
  // Basic info
  userUrl: string;
  score: number;
  createdAt: Date;
  
  // Metrics
  yourMetrics: SEOMetrics;
  competitorMetrics: CompetitorMetrics;
  
  // Analysis
  gaps: SEOGap[];
  recommendations: Recommendation[];
  contentOutline?: ContentOutline;
  
  // Keywords
  primaryKeyword: string;
  relatedKeywords: string[];
}
