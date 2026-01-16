// SEO Analysis Workflow Implementation
// Uses Vercel Workflow Kit with 'use workflow' and 'use step' directives

import * as steps from './steps';
import type { SEOData } from '@/lib/schemas';

// ============================================================================
// STEP FUNCTIONS
// Each step is a separate function with 'use step' directive for retryability
// ============================================================================

async function fetchUserSiteStep(url: string, runId: string) {
  "use step";

  // Import MongoDB inside step function (step functions have full Node.js access)
  const { updateReport } = await import('@/lib/db');

  console.log(`[Workflow] Step 1: Fetching user site - ${url}`);
  const userSiteData = await steps.fetchUserSite(url);

  // Save to database
  await updateReport(runId, { userSiteData });

  return userSiteData;
}

async function discoverKeywordsStep(userSiteData: SEOData, runId: string) {
  "use step";

  const { updateReport } = await import('@/lib/db');

  console.log('[Workflow] Step 2: Discovering keywords');
  const discoveredKeywords = await steps.discoverKeywords(userSiteData);

  // Save to database
  await updateReport(runId, { discoveredKeywords });

  return discoveredKeywords;
}

async function searchCompetitorsStep(primaryKeyword: string, userSiteData: SEOData, runId: string) {
  "use step";

  console.log('[Workflow] Step 3: Identifying competitor companies');
  const searchResults = await steps.searchCompetitors(primaryKeyword, userSiteData);

  return searchResults;
}

async function fetchCompetitorDataStep(
  searchResults: Array<{ rank: number; title: string; url: string; description: string }>,
  primaryKeyword: string,
  userUrl: string,
  runId: string
) {
  "use step";

  const { updateReport } = await import('@/lib/db');

  console.log('[Workflow] Step 4: Fetching competitor data');

  // Filter out user's own domain before fetching
  const userDomain = new URL(userUrl).hostname.replace('www.', '');
  const filteredResults = searchResults.filter(result => {
    try {
      const resultDomain = new URL(result.url).hostname.replace('www.', '');
      return resultDomain !== userDomain;
    } catch {
      return true; // Keep if URL parsing fails
    }
  });

  console.log(`[Workflow] Filtered out user's domain (${userDomain}), ${filteredResults.length}/${searchResults.length} competitors remaining`);

  const competitorData = await steps.fetchCompetitorData(filteredResults, primaryKeyword);

  // Save to database
  await updateReport(runId, { competitorData });

  return competitorData;
}

async function analyzePatternsStep(userSiteData: SEOData, competitorData: Array<any>, runId: string) {
  "use step";

  const { updateReport } = await import('@/lib/db');

  console.log('[Workflow] Step 5: Analyzing patterns');
  const patterns = await steps.analyzePatterns(userSiteData, competitorData);

  // Save to database
  await updateReport(runId, { patterns });

  return patterns;
}

async function identifyGapsStep(
  userSiteData: SEOData,
  patterns: any,
  competitorData: Array<any>,
  runId: string
) {
  "use step";

  const { updateReport } = await import('@/lib/db');

  console.log('[Workflow] Step 6: Identifying gaps');
  const gaps = await steps.identifyGaps(userSiteData, patterns, competitorData);

  // Save to database
  await updateReport(runId, { gaps });

  return gaps;
}

async function generateRecommendationsStep(gaps: Array<any>, userSiteData: SEOData, discoveredKeywords: any, runId: string) {
  "use step";

  const { updateReport } = await import('@/lib/db');

  console.log('[Workflow] Step 7: Generating recommendations');
  const recommendations = await steps.generateRecommendations(gaps, userSiteData, discoveredKeywords);

  // Save to database
  await updateReport(runId, { recommendations });

  return recommendations;
}

async function calculateScoreStep(
  userSiteData: SEOData,
  patterns: any,
  gaps: Array<any>,
  runId: string
) {
  "use step";

  const { updateReport } = await import('@/lib/db');

  console.log('[Workflow] Step 8: Calculating overall SEO score');

  // Start at neutral baseline (50 points)
  let score = 50;

  // POSITIVE SCORING: Add points for good metrics (up to +50)

  // 1. Word count comparison (up to +15 points)
  const wordCountRatio = userSiteData.wordCount / patterns.avgWordCount;
  if (wordCountRatio >= 1.2) {
    score += 15;  // 20%+ above average
    console.log(`[Score] Word count: +15 (${userSiteData.wordCount} vs ${patterns.avgWordCount} avg)`);
  } else if (wordCountRatio >= 1.0) {
    score += 10;  // At or above average
    console.log(`[Score] Word count: +10 (${userSiteData.wordCount} vs ${patterns.avgWordCount} avg)`);
  } else if (wordCountRatio >= 0.8) {
    score += 5;   // 80%+ of average
    console.log(`[Score] Word count: +5 (${userSiteData.wordCount} vs ${patterns.avgWordCount} avg)`);
  } else {
    score -= 5;   // Below 80%
    console.log(`[Score] Word count: -5 (${userSiteData.wordCount} vs ${patterns.avgWordCount} avg)`);
  }

  // 2. H2 structure comparison (up to +10 points)
  const h2Ratio = userSiteData.h2.length / patterns.avgH2Count;
  if (h2Ratio >= 1.0) {
    score += 10;
    console.log(`[Score] H2 count: +10 (${userSiteData.h2.length} vs ${patterns.avgH2Count} avg)`);
  } else if (h2Ratio >= 0.8) {
    score += 5;
    console.log(`[Score] H2 count: +5 (${userSiteData.h2.length} vs ${patterns.avgH2Count} avg)`);
  } else {
    score -= 5;
    console.log(`[Score] H2 count: -5 (${userSiteData.h2.length} vs ${patterns.avgH2Count} avg)`);
  }

  // 3. Internal links (up to +10 points, sweet spot is 10-30)
  if (userSiteData.internalLinks >= 10 && userSiteData.internalLinks <= 30) {
    score += 10;
    console.log(`[Score] Internal links: +10 (${userSiteData.internalLinks} in optimal range)`);
  } else if (userSiteData.internalLinks > 30 && userSiteData.internalLinks <= 50) {
    score += 5;
    console.log(`[Score] Internal links: +5 (${userSiteData.internalLinks} slightly high)`);
  } else if (userSiteData.internalLinks < 10) {
    score -= 5;
    console.log(`[Score] Internal links: -5 (${userSiteData.internalLinks} too few)`);
  }

  // 4. Schema markup bonus (up to +10 points)
  if (userSiteData.hasSchema) {
    score += 10;
    console.log('[Score] Schema markup: +10 (present)');
  } else {
    console.log('[Score] Schema markup: 0 (absent)');
  }

  // NEGATIVE SCORING: Deduct for gaps with nuanced penalties
  const criticalGaps = gaps.filter((g: any) => g.severity === 'critical').length;
  const highGaps = gaps.filter((g: any) => g.severity === 'high').length;
  const mediumGaps = gaps.filter((g: any) => g.severity === 'medium').length;
  const lowGaps = gaps.filter((g: any) => g.severity === 'low').length;

  score -= criticalGaps * 15;  // Critical severity
  score -= highGaps * 12;      // High severity (reduced from 15)
  score -= mediumGaps * 6;     // Medium severity (reduced from 8)
  score -= lowGaps * 2;        // Low severity (reduced from 3)

  console.log(`[Score] Gap penalties: -${criticalGaps * 15 + highGaps * 12 + mediumGaps * 6 + lowGaps * 2} (${criticalGaps}C, ${highGaps}H, ${mediumGaps}M, ${lowGaps}L)`);

  // Additional penalty for excessive gaps (shows systemic issues)
  const totalGaps = gaps.length;
  if (totalGaps > 8) {
    score -= 5;
    console.log(`[Score] Excessive gaps: -5 (${totalGaps} total gaps)`);
  } else if (totalGaps > 6) {
    score -= 3;
    console.log(`[Score] Many gaps: -3 (${totalGaps} total gaps)`);
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  console.log(`[Score] ✓ Final SEO score: ${score}/100`);

  // Save score
  await updateReport(runId, { score });

  return score;
}

async function generateReportDataStep(
  reportData: {
    runId: string;
    userSiteData: SEOData;
    discoveredKeywords: any;
    patterns: any;
    gaps: Array<any>;
    recommendations: any;
    score: number;
    competitorData: Array<any>;
  }
) {
  "use step";

  const { updateReport } = await import('@/lib/db');

  console.log('[Workflow] Step 9: Generating structured report data');
  const reportDataJson = await steps.generateReportData(reportData);

  // Save structured data to database
  await updateReport(reportData.runId, { reportData: reportDataJson });

  return reportDataJson;
}

async function getReportStep(runId: string) {
  "use step";

  const { getReportByRunId } = await import('@/lib/db');

  console.log('[Workflow] Fetching report from database');
  const report = await getReportByRunId(runId);

  // Only return the competitorData field to avoid MongoDB ObjectId serialization issues
  return report?.competitorData || [];
}

async function finalizeStep(runId: string) {
  "use step";

  const { updateReport } = await import('@/lib/db');

  console.log('[Workflow] Finalizing report');

  // Update status to completed
  await updateReport(runId, {
    status: 'completed',
  });

  console.log('[Workflow] ✓ SEO Analysis completed successfully');

  return { success: true };
}

// ============================================================================
// MAIN WORKFLOW FUNCTION
// ============================================================================

export const seoAnalysisWorkflow = async (input: { url: string; runId: string }) => {
  "use workflow";

  const { url, runId } = input;

  // Step 1: Fetch user's site
  const userSiteData = await fetchUserSiteStep(url, runId);

  // Step 2: Discover keywords from user site
  const discoveredKeywords = await discoverKeywordsStep(userSiteData, runId);

  // Step 3: Identify competitor companies (not blog posts)
  const searchResults = await searchCompetitorsStep(discoveredKeywords.primary, userSiteData, runId);

  // Step 4: Fetch competitor pages (filter out user's own domain)
  const competitorData = await fetchCompetitorDataStep(searchResults, discoveredKeywords.primary, url, runId);

  // Step 5: Analyze patterns
  const patterns = await analyzePatternsStep(userSiteData, competitorData, runId);

  // Step 6: Identify gaps
  const gaps = await identifyGapsStep(userSiteData, patterns, competitorData, runId);

  // Step 7: Generate recommendations
  const recommendations = await generateRecommendationsStep(gaps, userSiteData, discoveredKeywords, runId);

  // Step 8: Calculate overall score
  const score = await calculateScoreStep(userSiteData, patterns, gaps, runId);

  // Step 9: Generate structured report data
  // Fetch competitor data from database for the report
  const competitorDataFromDb = await getReportStep(runId);
  const reportData = await generateReportDataStep({
    runId,
    userSiteData,
    discoveredKeywords,
    patterns,
    gaps,
    recommendations,
    score,
    competitorData: competitorDataFromDb,
  });

  // Final step: Mark as completed
  await finalizeStep(runId);

  return {
    success: true,
    runId,
    reportData,
    score,
  };
};
