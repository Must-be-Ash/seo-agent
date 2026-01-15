// SEO Analysis Workflow Implementation
// Uses Vercel Workflow Kit with 'use workflow' and 'use step' directives

import * as steps from './steps';
import { updateReport } from '@/lib/db';
import type { SEOData } from '@/lib/schemas';

// ============================================================================
// STEP FUNCTIONS
// Each step is a separate function with 'use step' directive for retryability
// ============================================================================

async function fetchUserSiteStep(url: string, runId: string) {
  "use step";

  console.log(`[Workflow] Step 1: Fetching user site - ${url}`);
  const userSiteData = await steps.fetchUserSite(url);

  // Save to database
  await updateReport(runId, { userSiteData });

  return userSiteData;
}

async function discoverKeywordsStep(userSiteData: SEOData, runId: string) {
  "use step";

  console.log('[Workflow] Step 2: Discovering keywords');
  const discoveredKeywords = await steps.discoverKeywords(userSiteData);

  // Save to database
  await updateReport(runId, { discoveredKeywords });

  return discoveredKeywords;
}

async function searchCompetitorsStep(primaryKeyword: string, runId: string) {
  "use step";

  console.log('[Workflow] Step 3: Searching for competitors');
  const searchResults = await steps.searchCompetitors(primaryKeyword);

  return searchResults;
}

async function fetchCompetitorDataStep(
  searchResults: Array<{ rank: number; title: string; url: string; description: string }>,
  primaryKeyword: string,
  runId: string
) {
  "use step";

  console.log('[Workflow] Step 4: Fetching competitor data');
  const competitorData = await steps.fetchCompetitorData(searchResults, primaryKeyword);

  // Save to database
  await updateReport(runId, { competitorData });

  return competitorData;
}

async function analyzePatternsStep(userSiteData: SEOData, competitorData: Array<any>, runId: string) {
  "use step";

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

  console.log('[Workflow] Step 6: Identifying gaps');
  const gaps = await steps.identifyGaps(userSiteData, patterns, competitorData);

  // Save to database
  await updateReport(runId, { gaps });

  return gaps;
}

async function generateRecommendationsStep(gaps: Array<any>, userSiteData: SEOData, runId: string) {
  "use step";

  console.log('[Workflow] Step 7: Generating recommendations');
  const recommendations = await steps.generateRecommendations(gaps, userSiteData);

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

  console.log('[Workflow] Step 8: Calculating overall SEO score');

  // Calculate score based on gaps severity
  const highGaps = gaps.filter((g: any) => g.severity === 'high').length;
  const mediumGaps = gaps.filter((g: any) => g.severity === 'medium').length;
  const lowGaps = gaps.filter((g: any) => g.severity === 'low').length;

  // Simple scoring algorithm (can be improved)
  let score = 100;
  score -= highGaps * 15;  // -15 points per high severity gap
  score -= mediumGaps * 8;  // -8 points per medium severity gap
  score -= lowGaps * 3;     // -3 points per low severity gap

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

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
  }
) {
  "use step";

  console.log('[Workflow] Step 9: Generating structured report data');
  const reportDataJson = await steps.generateReportData(reportData);

  // Save structured data to database
  await updateReport(reportData.runId, { reportData: reportDataJson });

  return reportDataJson;
}

async function finalizeStep(runId: string) {
  "use step";

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

  // Step 3: Search for competitors
  const searchResults = await searchCompetitorsStep(discoveredKeywords.primary, runId);

  // Step 4: Fetch competitor pages
  const competitorData = await fetchCompetitorDataStep(searchResults, discoveredKeywords.primary, runId);

  // Step 5: Analyze patterns
  const patterns = await analyzePatternsStep(userSiteData, competitorData, runId);

  // Step 6: Identify gaps
  const gaps = await identifyGapsStep(userSiteData, patterns, competitorData, runId);

  // Step 7: Generate recommendations
  const recommendations = await generateRecommendationsStep(gaps, userSiteData, runId);

  // Step 8: Calculate overall score
  const score = await calculateScoreStep(userSiteData, patterns, gaps, runId);

  // Step 9: Generate structured report data
  const reportData = await generateReportDataStep({
    runId,
    userSiteData,
    discoveredKeywords,
    patterns,
    gaps,
    recommendations,
    score,
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
