// Workflow step implementations for SEO Gap Analysis
import { searchWeb, fetchPageData, fetchMultiplePages } from '@/lib/hyperbrowser';
import { SEO_EXTRACTION_SCHEMA, type SEOData } from '@/lib/schemas';
import { x402Client, wrapFetchWithPayment } from '@x402/fetch';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { privateKeyToAccount } from 'viem/accounts';
import OpenAI from 'openai';
import { REPORT_STYLES } from '@/lib/report-styles';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to create x402-enabled fetch function for server-side payments to Hyperbrowser
function createX402Fetch(): typeof fetch {
  // For server-side, use a backend wallet (v2 client API)
  const signer = privateKeyToAccount(process.env.X402_WALLET_PRIVATE_KEY as `0x${string}`);

  // Create x402 client and register EVM scheme
  const client = new x402Client();
  registerExactEvmScheme(client, { signer });

  console.log('[x402 Client] Created v2 client for Hyperbrowser payments');

  // Return wrapped fetch with payment handling
  return wrapFetchWithPayment(fetch, client);
}

/**
 * Step 1: Fetch User's Site
 * Extracts SEO data from the user's website
 */
export async function fetchUserSite(url: string): Promise<SEOData> {
  console.log(`[Step 1] Fetching user site: ${url}`);

  const fetchFunc = createX402Fetch();
  const data = await fetchPageData<SEOData>(url, SEO_EXTRACTION_SCHEMA, fetchFunc);

  console.log(`[Step 1] ✓ Fetched: ${data.title} (${data.wordCount} words)`);
  return data;
}

/**
 * Step 2: Discover Keywords with OpenAI
 * Analyzes site content to identify target keywords
 */
export async function discoverKeywords(
  siteData: SEOData
): Promise<{ primary: string; secondary: string[] }> {
  console.log('[Step 2] Discovering keywords from site content');

  const prompt = `Analyze this website content and identify the best SEO keywords to target:

Title: ${siteData.title}
Meta Description: ${siteData.metaDescription}
H1 Tags: ${siteData.h1.join(', ')}
H2 Tags: ${siteData.h2.slice(0, 10).join(', ')}
Main Content Preview: ${siteData.content.substring(0, 1000)}

Based on this content, identify:
1. ONE primary keyword (2-5 words) that best represents the main topic
2. 2-4 secondary keywords (2-5 words each) that are closely related

Return as JSON:
{
  "primary": "main keyword here",
  "secondary": ["keyword 1", "keyword 2", "keyword 3"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an SEO expert. Respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');

  console.log(`[Step 2] ✓ Discovered primary keyword: "${result.primary}"`);
  console.log(`[Step 2] ✓ Secondary keywords: ${result.secondary.join(', ')}`);

  return result;
}

/**
 * Step 3: Search for Competitors
 * Searches for top-ranking pages for the primary keyword
 */
export async function searchCompetitors(
  keyword: string
): Promise<Array<{ rank: number; title: string; url: string; description: string }>> {
  console.log(`[Step 3] Searching for competitors: "${keyword}"`);

  const fetchFunc = createX402Fetch();
  const results = await searchWeb(keyword, 1, fetchFunc);

  // Take top 10 and add rank
  const rankedResults = results.slice(0, 10).map((result, index) => ({
    rank: index + 1,
    ...result,
  }));

  console.log(`[Step 3] ✓ Found ${rankedResults.length} competitor pages`);
  return rankedResults;
}

/**
 * Step 4: Fetch All Competitor Pages
 * Extracts SEO data from competitor pages in parallel
 */
export async function fetchCompetitorData(
  competitors: Array<{ rank: number; url: string; title: string; description: string }>,
  keyword: string
): Promise<Array<{
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
}>> {
  console.log(`[Step 4] Fetching ${competitors.length} competitor pages`);

  const fetchFunc = createX402Fetch();
  const urls = competitors.map(c => c.url);

  const seoDataArray = await fetchMultiplePages<SEOData>(urls, SEO_EXTRACTION_SCHEMA, fetchFunc);

  // Combine with competitor info
  const competitorData = competitors.map((comp, index) => {
    const seoData = seoDataArray[index];

    if (!seoData) {
      // Return placeholder for failed fetches
      return {
        keyword,
        rank: comp.rank,
        url: comp.url,
        title: comp.title,
        metaDescription: comp.description,
        h1: [],
        h2: [],
        h3: [],
        wordCount: 0,
        internalLinks: 0,
        externalLinks: 0,
        images: 0,
        hasSchema: false,
        content: '',
      };
    }

    return {
      keyword,
      rank: comp.rank,
      url: comp.url,
      ...seoData,
    };
  }).filter(data => data.wordCount > 0); // Filter out failed fetches

  console.log(`[Step 4] ✓ Successfully fetched ${competitorData.length} competitor pages`);
  return competitorData;
}

/**
 * Step 5: Analyze Patterns with OpenAI
 * Identifies common patterns across top-performing competitors
 */
export async function analyzePatterns(
  userSite: SEOData,
  competitors: Array<any>
): Promise<{
  avgWordCount: number;
  avgH2Count: number;
  avgH3Count: number;
  avgInternalLinks: number;
  avgExternalLinks: number;
  commonTopics: string[];
  technicalPatterns: any;
}> {
  console.log('[Step 5] Analyzing patterns in competitor data');

  // Calculate averages
  const avgWordCount = Math.round(
    competitors.reduce((sum, c) => sum + c.wordCount, 0) / competitors.length
  );
  const avgH2Count = Math.round(
    competitors.reduce((sum, c) => sum + c.h2.length, 0) / competitors.length
  );
  const avgH3Count = Math.round(
    competitors.reduce((sum, c) => sum + c.h3.length, 0) / competitors.length
  );
  const avgInternalLinks = Math.round(
    competitors.reduce((sum, c) => sum + c.internalLinks, 0) / competitors.length
  );
  const avgExternalLinks = Math.round(
    competitors.reduce((sum, c) => sum + c.externalLinks, 0) / competitors.length
  );

  // Analyze topics with OpenAI
  const topCompetitors = competitors.slice(0, 5);
  const competitorSummary = topCompetitors.map(c => ({
    title: c.title,
    h2Topics: c.h2.slice(0, 10),
    wordCount: c.wordCount,
  }));

  const prompt = `Analyze these top 5 ranking pages and identify common content themes/topics that appear across multiple pages:

${JSON.stringify(competitorSummary, null, 2)}

Return a JSON array of 5-10 common topics that appear in most pages:
{
  "commonTopics": ["topic 1", "topic 2", ...]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an SEO analyst. Respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const result = JSON.parse(response.choices[0].message.content || '{ "commonTopics": [] }');

  console.log(`[Step 5] ✓ Average metrics: ${avgWordCount} words, ${avgH2Count} H2s`);
  console.log(`[Step 5] ✓ Common topics: ${result.commonTopics.join(', ')}`);

  return {
    avgWordCount,
    avgH2Count,
    avgH3Count,
    avgInternalLinks,
    avgExternalLinks,
    commonTopics: result.commonTopics,
    technicalPatterns: {
      schemaUsage: competitors.filter(c => c.hasSchema).length,
      totalCompetitors: competitors.length,
    },
  };
}

/**
 * Step 6: Identify Gaps with OpenAI
 * Compares user site vs competitors and identifies specific gaps
 */
export async function identifyGaps(
  userSite: SEOData,
  patterns: any,
  competitors: Array<any>
): Promise<Array<{
  category: string;
  severity: 'high' | 'medium' | 'low';
  finding: string;
  impact: string;
  recommendation: string;
}>> {
  console.log('[Step 6] Identifying SEO gaps');

  const prompt = `You are an SEO consultant. Analyze this website against competitor benchmarks and identify specific SEO gaps.

USER SITE:
- Word Count: ${userSite.wordCount}
- H2 Count: ${userSite.h2.length}
- H3 Count: ${userSite.h3.length}
- Internal Links: ${userSite.internalLinks}
- Has Schema Markup: ${userSite.hasSchema}
- H2 Topics: ${userSite.h2.join(', ')}

COMPETITOR BENCHMARKS:
- Avg Word Count: ${patterns.avgWordCount}
- Avg H2 Count: ${patterns.avgH2Count}
- Avg H3 Count: ${patterns.avgH3Count}
- Common Topics: ${patterns.commonTopics.join(', ')}
- Schema Usage: ${patterns.technicalPatterns.schemaUsage}/${patterns.technicalPatterns.totalCompetitors} have schema

Identify 5-8 specific SEO gaps. For each gap, provide:
- category: (e.g., "Content Depth", "Content Structure", "Technical SEO", "Topic Coverage")
- severity: "high", "medium", or "low"
- finding: Clear description of the gap
- impact: Why this matters for SEO
- recommendation: Specific action to fix it

Return as JSON:
{
  "gaps": [
    {
      "category": "Content Depth",
      "severity": "high",
      "finding": "Your page has 1,200 words vs 2,800 average",
      "impact": "Lower content depth signals lower authority to search engines",
      "recommendation": "Add 1,600 more words covering: [specific topics]"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an SEO expert. Respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const result = JSON.parse(response.choices[0].message.content || '{ "gaps": [] }');

  console.log(`[Step 6] ✓ Identified ${result.gaps.length} SEO gaps`);
  return result.gaps;
}

/**
 * Step 7: Generate Recommendations
 * Creates prioritized, actionable recommendations
 */
export async function generateRecommendations(
  gaps: Array<any>,
  userSite: SEOData
): Promise<{
  highPriority: string[];
  mediumPriority: string[];
  lowPriority: string[];
  contentOutline: string;
}> {
  console.log('[Step 7] Generating recommendations');

  // Group by severity
  const highPriority = gaps.filter(g => g.severity === 'high').map(g => g.recommendation);
  const mediumPriority = gaps.filter(g => g.severity === 'medium').map(g => g.recommendation);
  const lowPriority = gaps.filter(g => g.severity === 'low').map(g => g.recommendation);

  // Generate content outline with OpenAI
  const prompt = `Based on these SEO gaps, create a detailed content outline for improving the page:

CURRENT H2 SECTIONS:
${userSite.h2.join('\n')}

GAPS TO ADDRESS:
${gaps.map(g => `- ${g.finding}`).join('\n')}

Create a comprehensive content outline with:
- Recommended H1 (improved)
- 8-12 H2 sections (including new ones to add)
- Brief description for each section (what to cover)
- Estimated word count per section

Format as markdown outline.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an SEO content strategist.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.5,
  });

  const contentOutline = response.choices[0].message.content || '';

  console.log(`[Step 7] ✓ Generated recommendations (${highPriority.length} high priority)`);

  return {
    highPriority,
    mediumPriority,
    lowPriority,
    contentOutline,
  };
}

/**
 * Step 8: Generate HTML Report
 * Creates a comprehensive HTML report with all findings
 */
export async function generateReportHtml(
  reportData: any
): Promise<string> {
  console.log('[Step 8] Generating HTML report');

  const prompt = `Create a professional, comprehensive SEO Gap Analysis report in HTML.

DATA:
${JSON.stringify({
  userSite: {
    title: reportData.userSiteData.title,
    wordCount: reportData.userSiteData.wordCount,
    h2Count: reportData.userSiteData.h2.length,
  },
  keywords: reportData.discoveredKeywords,
  patterns: reportData.patterns,
  gaps: reportData.gaps,
  recommendations: reportData.recommendations,
  score: reportData.score,
}, null, 2)}

Create a beautiful, modern HTML report with:
- Clean, professional design (use semantic HTML)
- Executive summary section with key findings
- Your current SEO profile section with metrics
- Competitor benchmark comparison with data visualization
- Gap analysis with severity indicators using CSS classes:
  * .gap-item.gap-high (for high severity)
  * .gap-item.gap-medium (for medium severity)
  * .gap-item.gap-low (for low severity)
- Prioritized recommendations in sections:
  * .recommendation-section.priority-high
  * .recommendation-section.priority-medium
  * .recommendation-section.priority-low
- Content outline
- Overall SEO score with appropriate class:
  * .score-badge.score-high (80-100)
  * .score-badge.score-medium (60-79)
  * .score-badge.score-low (0-59)

Use semantic HTML with proper CSS classes that match our styling.
Do NOT include <style> tags - styles will be injected separately.
Return ONLY the HTML content (no markdown code blocks, no DOCTYPE, no <html> wrapper).
Start directly with content that goes in <body>.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert at creating HTML reports. Return only HTML body content, no code blocks, no explanations, no <html> or <head> tags.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
  });

  let html = response.choices[0].message.content || '';

  // Clean up any markdown code blocks if present
  html = html.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

  // Inject our comprehensive styles into the HTML
  // If HTML has a <head> tag, inject there; otherwise wrap it
  if (html.includes('<head>')) {
    html = html.replace('</head>', `${REPORT_STYLES}</head>`);
  } else if (html.includes('<html>')) {
    html = html.replace('<html>', `<html><head>${REPORT_STYLES}</head>`);
  } else {
    // Wrap in full HTML document
    html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Gap Analysis Report</title>
  ${REPORT_STYLES}
</head>
<body>
  ${html}
</body>
</html>`;
  }

  console.log('[Step 8] ✓ Generated HTML report with styles');
  return html;
}
