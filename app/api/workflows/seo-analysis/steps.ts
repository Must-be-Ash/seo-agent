// Workflow step implementations for SEO Gap Analysis
import { searchWeb, fetchPageData, fetchMultiplePages } from '@/lib/hyperbrowser';
import { SEO_EXTRACTION_SCHEMA, type SEOData } from '@/lib/schemas';
import { x402Client, wrapFetchWithPayment } from '@x402/fetch';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { privateKeyToAccount } from 'viem/accounts';
import OpenAI from 'openai';
import type { StructuredReportData } from '@/types/report-data';

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
  const primaryKeyword = userSite.title || 'the topic';
  const prompt = `Based on these SEO gaps, create a detailed content outline for improving the page:

PRIMARY KEYWORD: ${primaryKeyword}
CURRENT H2 SECTIONS:
${userSite.h2.length > 0 ? userSite.h2.join('\n') : 'None'}

GAPS TO ADDRESS:
${gaps.map(g => `- ${g.finding}`).join('\n')}

Create a comprehensive content outline with:
- Recommended H1 (use the primary keyword "${primaryKeyword}" naturally, not placeholders)
- 8-12 H2 sections (numbered format: "### 1. Section Title")
- For each section, include: title, estimated word count in parentheses like "(Estimated Word Count: 200)", and a brief description
- Use the actual keyword "${primaryKeyword}" throughout, NOT placeholders like [Topic]

Format as markdown with this exact structure:
## Recommended H1
**"Your H1 here using the keyword"**

## H2 Sections
### 1. Section Title (Estimated Word Count: 200)
Brief description of what to cover in this section.

### 2. Next Section Title (Estimated Word Count: 250)
Brief description...

Include a "Total Estimated Word Count" at the end.`;

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
 * Step 8: Generate Structured Report Data
 * Creates structured JSON data for the report (no HTML generation)
 */
export async function generateReportData(
  reportData: any
): Promise<StructuredReportData> {
  console.log('[Step 8] Generating structured report data');

  // Extract key findings from gaps
  const keyFindings = reportData.gaps
    .slice(0, 5)
    .map((gap: any) => gap.finding);

  // Generate executive summary overview
  const highGaps = reportData.gaps.filter((g: any) => g.severity === 'high');
  const mediumGaps = reportData.gaps.filter((g: any) => g.severity === 'medium');
  const mainGapCategories = [...new Set(highGaps.map((g: any) => g.category))].slice(0, 3);
  
  const overviewPrompt = `Create a concise, professional executive summary (2-3 sentences) for this SEO gap analysis report:

Website: ${reportData.userSiteData.title || reportData.userSiteData.url || 'The analyzed website'}
SEO Score: ${reportData.score}/100
Primary Keyword: "${reportData.discoveredKeywords.primary}"
Key Issues Found: ${highGaps.length} high-priority gaps, ${mediumGaps.length} medium-priority gaps
Main Gap Categories: ${mainGapCategories.join(', ')}

Write a summary that:
- Mentions the SEO score and what it indicates
- Highlights the most critical gap (${highGaps[0]?.category || 'content quality'})
- Sets expectations for what the report covers

Return only the summary text, no markdown, no formatting, no quotes.`;

  const overviewResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an SEO consultant. Write concise, professional summaries.'
      },
      {
        role: 'user',
        content: overviewPrompt
      }
    ],
    temperature: 0.5,
    max_tokens: 150,
  });

  const overview = overviewResponse.choices[0].message.content || '';

  // Parse content outline from markdown
  const parseContentOutline = (outlineText: string) => {
    const lines = outlineText.split('\n').filter(l => l.trim());
    let recommendedH1 = '';
    const h2Sections: Array<{ title: string; estimatedWordCount: number; description: string }> = [];
    let totalWordCount = 0;
    let currentSection: { title: string; estimatedWordCount: number; description: string } | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Extract H1 (usually starts with # or "Recommended H1:")
      // Handle format: "## Recommended H1" followed by "**\"H1 text\"**"
      if (trimmed.toLowerCase().includes('recommended h1')) {
        // Look ahead for the next line which should have the H1 in quotes
        const nextLineIndex = lines.indexOf(trimmed) + 1;
        if (nextLineIndex < lines.length) {
          const nextLine = lines[nextLineIndex].trim();
          // Extract from format: **"H1 text"** or "H1 text"
          const h1Match = nextLine.match(/\*\*["'](.+?)["']\*\*|["'](.+?)["']|(.+)/);
          if (h1Match) {
            recommendedH1 = (h1Match[1] || h1Match[2] || h1Match[3] || '').trim();
            if (recommendedH1) continue;
          }
        }
      } else if (trimmed.startsWith('#') && !trimmed.startsWith('##')) {
        // Single # is H1
        recommendedH1 = trimmed.replace(/^#+\s*/, '').trim();
        // Remove markdown formatting
        recommendedH1 = recommendedH1.replace(/\*\*["'](.+?)["']\*\*|["'](.+?)["']/, '$1$2');
        if (recommendedH1) continue;
      } else if (trimmed.match(/^\*\*["'].+?["']\*\*|^["'].+?["']$/)) {
        // Standalone H1 in quotes
        const h1Match = trimmed.match(/["'](.+?)["']/);
        if (h1Match && !recommendedH1) {
          recommendedH1 = h1Match[1].trim();
          continue;
        }
      }

      // Extract H2 sections (usually start with ## or - or numbered)
      // Handle format: "### 1. Section Title (Estimated Word Count: 200)"
      if (trimmed.startsWith('##') || trimmed.match(/^[-*]\s+/) || trimmed.match(/^\d+\.\s+/) || trimmed.match(/^###\s+\d+\./)) {
        // Save previous section if exists
        if (currentSection) {
          h2Sections.push(currentSection);
          totalWordCount += currentSection.estimatedWordCount;
        }

        // Parse new section - handle multiple formats
        // Format 1: "### 1. Title (Estimated Word Count: 200)"
        // Format 2: "## Title (200 words)"
        // Format 3: "- Title (~200 words)"
        let match = trimmed.match(/(?:###\s+\d+\.\s*|##\s*|[-*]\s*|\d+\.\s*)(.+?)(?:\s*\([^)]*[Ee]stimated\s+[Ww]ord\s+[Cc]ount[:\s]*(\d+)[^)]*\)|\(~?(\d+)\s*words?\))/i);
        if (!match) {
          // Try simpler format
          match = trimmed.match(/(?:###\s+\d+\.\s*|##\s*|[-*]\s*|\d+\.\s*)(.+?)(?:\s*\(~?(\d+)\s*words?\))?/i);
        }
        
        if (match) {
          const title = match[1].trim();
          // Word count could be in match[2] or match[3] depending on format
          const wordCount = match[2] ? parseInt(match[2]) : (match[3] ? parseInt(match[3]) : 200);
          currentSection = {
            title,
            estimatedWordCount: wordCount,
            description: '',
          };
        }
      } else if (currentSection && trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.match(/^Total\s+Estimated/i)) {
        // This is a description line for the current section
        // Skip lines that are just separators or total word count
        if (trimmed !== '---' && !trimmed.match(/^Total\s+Estimated/i)) {
          if (currentSection.description) {
            currentSection.description += ' ' + trimmed;
          } else {
            currentSection.description = trimmed;
          }
        }
      } else if (trimmed.match(/^Total\s+Estimated\s+Word\s+Count[:\s]*(\d+)/i)) {
        // Extract total from summary line if provided
        const totalMatch = trimmed.match(/(\d+)/);
        if (totalMatch && totalWordCount === 0) {
          totalWordCount = parseInt(totalMatch[1]);
        }
      }
    }

    // Don't forget the last section
    if (currentSection) {
      h2Sections.push(currentSection);
      totalWordCount += currentSection.estimatedWordCount;
    }

    // If we didn't find H1, try to extract from first line
    if (!recommendedH1 && lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.startsWith('#')) {
        recommendedH1 = firstLine.replace(/^#+\s*/, '').trim();
      } else if (!firstLine.startsWith('##') && !firstLine.match(/^[-*]\s+/) && !firstLine.match(/^\d+\.\s+/)) {
        recommendedH1 = firstLine;
      }
    }

    // If no word count found, estimate based on sections
    if (totalWordCount === 0 && h2Sections.length > 0) {
      totalWordCount = h2Sections.length * 200;
      h2Sections.forEach(s => s.estimatedWordCount = 200);
    }

    return {
      recommendedH1: recommendedH1 || 'Comprehensive Guide',
      h2Sections,
      totalEstimatedWordCount: totalWordCount || 2000,
    };
  };

  const contentOutline = parseContentOutline(reportData.recommendations.contentOutline || '');

  // Structure recommendations by priority
  // Map recommendations to their corresponding gaps for better structure
  const structureRecommendations = (recommendations: string[], priority: 'high' | 'medium' | 'low', gaps: Array<any>) => {
    return recommendations.map((rec, index) => {
      const trimmed = rec.trim();
      
      // Try to find the corresponding gap for this recommendation
      const correspondingGap = gaps.find((g: any) => 
        g.severity === priority && 
        (g.recommendation === trimmed || g.recommendation.includes(trimmed.substring(0, 50)))
      );

      let title = trimmed;
      let description = '';
      let actionItems: string[] = [];

      // If we found a corresponding gap, use its data for better structure
      if (correspondingGap) {
        title = correspondingGap.category || trimmed.substring(0, 60);
        description = correspondingGap.impact || '';
        actionItems = [correspondingGap.recommendation || trimmed];
      } else {
        // Try to extract title and description from the recommendation text
        // Many recommendations start with action verbs like "Add", "Incorporate", "Expand"
        const actionMatch = trimmed.match(/^(Add|Incorporate|Expand|Consider|Implement|Create|Build|Develop|Improve|Enhance|Optimize|Update|Fix|Remove|Replace)\s+(.+)/i);
        if (actionMatch) {
          title = actionMatch[1] + ' ' + actionMatch[2].split(/[.,]/)[0].trim();
          description = trimmed;
          actionItems = [trimmed];
        } else if (trimmed.includes(':')) {
          // Check if it has a colon separator (title: description)
          const parts = trimmed.split(':');
          title = parts[0].trim();
          description = parts.slice(1).join(':').trim();
          actionItems = [description || trimmed];
        } else {
          // Use first part as title, rest as description
          const firstSentence = trimmed.split(/[.!?]/)[0];
          if (firstSentence.length < 80) {
            title = firstSentence;
            description = trimmed.substring(firstSentence.length).trim();
  } else {
            title = trimmed.substring(0, 60) + '...';
            description = trimmed;
          }
          actionItems = [trimmed];
        }
      }

      // Clean up title (remove trailing periods, etc.)
      title = title.replace(/^[A-Z]\w+\s+/, ''); // Remove leading action verb if it makes title too generic
      if (title.length > 80) {
        title = title.substring(0, 77) + '...';
      }

      return {
        title: title || 'SEO Recommendation',
        description: description || trimmed,
        actionItems: actionItems.length > 0 ? actionItems : [trimmed],
      };
    });
  };

  const structuredData: StructuredReportData = {
    executiveSummary: {
      overview,
      keyFindings,
      score: reportData.score,
    },
    yourMetrics: {
      wordCount: reportData.userSiteData.wordCount,
      h2Count: reportData.userSiteData.h2.length,
      h3Count: reportData.userSiteData.h3.length,
      internalLinks: reportData.userSiteData.internalLinks,
      externalLinks: reportData.userSiteData.externalLinks,
      hasSchema: reportData.userSiteData.hasSchema,
    },
    competitorBenchmarks: {
      avgWordCount: reportData.patterns.avgWordCount,
      avgH2Count: reportData.patterns.avgH2Count,
      avgH3Count: reportData.patterns.avgH3Count,
      avgInternalLinks: reportData.patterns.avgInternalLinks,
      avgExternalLinks: reportData.patterns.avgExternalLinks,
      schemaUsage: reportData.patterns.technicalPatterns.schemaUsage,
      totalCompetitors: reportData.patterns.technicalPatterns.totalCompetitors,
    },
    gaps: reportData.gaps,
    recommendations: {
      highPriority: structureRecommendations(reportData.recommendations.highPriority || [], 'high', reportData.gaps),
      mediumPriority: structureRecommendations(reportData.recommendations.mediumPriority || [], 'medium', reportData.gaps),
      lowPriority: structureRecommendations(reportData.recommendations.lowPriority || [], 'low', reportData.gaps),
    },
    contentOutline,
    keywords: {
      primary: reportData.discoveredKeywords.primary,
      secondary: reportData.discoveredKeywords.secondary || [],
    },
  };

  console.log('[Step 8] ✓ Generated structured report data');
  return structuredData;
}
