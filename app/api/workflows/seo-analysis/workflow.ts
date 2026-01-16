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

async function generateReportDataStep(
  reportData: {
    runId: string;
    userSiteData: SEOData;
    discoveredKeywords: any;
    patterns: any;
    gaps: Array<any>;
    recommendations: any;
    googleRanking?: number | null;
    googleRankingUrl?: string | null;
    competitorData: Array<any>;
  }
) {
  "use step";

  const { updateReport } = await import('@/lib/db');

  console.log('[Workflow] Step 8: Generating structured report data');
  const reportDataJson = await steps.generateReportData(reportData);

  // Save structured data to database
  await updateReport(reportData.runId, { reportData: reportDataJson });

  return reportDataJson;
}

async function detectRankingStep(targetKeyword: string, userUrl: string, runId: string) {
  "use step";

  const { updateReport } = await import('@/lib/db');

  console.log('[Workflow] Step 2b: Detecting Google ranking position');
  const rankingData = await steps.detectGoogleRanking(targetKeyword, userUrl);

  // Save to database
  await updateReport(runId, {
    googleRanking: rankingData.rank,
    googleRankingUrl: rankingData.foundUrl
  });

  return rankingData;
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

export const seoAnalysisWorkflow = async (input: { url: string; runId: string; targetKeyword: string }) => {
  "use workflow";

  const { url, runId, targetKeyword } = input;

  // Step 1: Fetch user's site
  const userSiteData = await fetchUserSiteStep(url, runId);

  // Step 2: Discover supporting keywords (optional context, not primary)
  const discoveredKeywords = await discoverKeywordsStep(userSiteData, runId);

  // Step 2b: Detect Google ranking position for target keyword
  const rankingData = await detectRankingStep(targetKeyword, url, runId);

  // Step 3: Identify competitor companies using TARGET keyword (not discovered)
  const searchResults = await searchCompetitorsStep(targetKeyword, userSiteData, runId);

  // Step 4: Fetch competitor pages (filter out user's own domain)
  const competitorData = await fetchCompetitorDataStep(searchResults, targetKeyword, url, runId);

  // Step 5: Analyze patterns
  const patterns = await analyzePatternsStep(userSiteData, competitorData, runId);

  // Step 6: Identify gaps (focus on TARGET keyword)
  const gaps = await identifyGapsStep(userSiteData, patterns, competitorData, runId);

  // Step 7: Generate recommendations (use TARGET keyword)
  const recommendations = await generateRecommendationsStep(gaps, userSiteData, {
    primary: targetKeyword,
    secondary: discoveredKeywords.secondary
  }, runId);

  // Step 8: Generate structured report data (pass targetKeyword + ranking)
  const competitorDataFromDb = await getReportStep(runId);
  const reportData = await generateReportDataStep({
    runId,
    userSiteData,
    discoveredKeywords: {
      primary: targetKeyword, // USER-PROVIDED, not auto-discovered
      secondary: discoveredKeywords.secondary,
    },
    patterns,
    gaps,
    recommendations,
    googleRanking: rankingData.rank,
    googleRankingUrl: rankingData.foundUrl,
    competitorData: competitorDataFromDb,
  });

  // Final step: Mark as completed
  await finalizeStep(runId);

  return {
    success: true,
    runId,
    reportData,
  };
};
