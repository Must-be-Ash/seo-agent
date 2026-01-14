import { ObjectId } from 'mongodb';

export interface SEOReport {
  _id?: ObjectId;
  runId: string; // Unique workflow run ID
  userId: string; // Wallet address
  userUrl: string; // Website URL analyzed
  createdAt: Date;
  status: 'analyzing' | 'completed' | 'failed';

  // Step 1: User site data
  userSiteData?: {
    title: string;
    metaDescription: string;
    h1: string[];
    h2: string[];
    h3: string[];
    wordCount: number;
    internalLinks: number;
    externalLinks: number;
    images: number;
    hasSchema: boolean;
    hasOpenGraph: boolean;
    hasCanonical: boolean;
    content: string; // Full text content
  };

  // Step 2: Discovered keywords
  discoveredKeywords?: {
    primary: string;
    secondary: string[];
  };

  // Step 3 & 4: Competitor data
  competitorData?: Array<{
    keyword: string;
    rank: number;
    url: string;
    title: string;
    metaDescription: string;
    h1: string[];
    h2: string[];
    h3: string[];
    wordCount: number;
    internalLinks: number;
    externalLinks: number;
    images: number;
    hasSchema: boolean;
    content: string;
  }>;

  // Step 5: Pattern analysis
  patterns?: {
    avgWordCount: number;
    avgH2Count: number;
    avgH3Count: number;
    avgInternalLinks: number;
    avgExternalLinks: number;
    commonTopics: string[];
    technicalPatterns: any;
  };

  // Step 6: Gap analysis
  gaps?: Array<{
    category: string;
    severity: 'high' | 'medium' | 'low';
    finding: string;
    impact: string;
    recommendation: string;
  }>;

  // Step 7: Recommendations
  recommendations?: {
    highPriority: string[];
    mediumPriority: string[];
    lowPriority: string[];
    contentOutline: string;
  };

  // Step 8: Generated HTML report
  reportHtml?: string;

  // Overall score
  score?: number; // 0-100

  // Payment tracking
  paymentTxHash?: string;
  paymentAmount?: number;
}
