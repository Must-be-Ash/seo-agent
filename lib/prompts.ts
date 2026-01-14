import type { SEOData } from './schemas';

/**
 * Template for keyword discovery from site content
 */
export function keywordDiscoveryPrompt(siteData: SEOData): string {
  return `Analyze this website content and identify the best SEO keywords to target:

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
}

/**
 * System prompt for keyword discovery
 */
export const KEYWORD_DISCOVERY_SYSTEM = 'You are an SEO expert. Respond with valid JSON only.';

/**
 * Template for pattern analysis across competitors
 */
export function patternAnalysisPrompt(competitors: Array<any>): string {
  const topCompetitors = competitors.slice(0, 5);
  const competitorSummary = topCompetitors.map(c => ({
    title: c.title,
    h2Topics: c.h2.slice(0, 10),
    wordCount: c.wordCount,
  }));

  return `Analyze these top 5 ranking pages and identify common content themes/topics that appear across multiple pages:

${JSON.stringify(competitorSummary, null, 2)}

Return a JSON array of 5-10 common topics that appear in most pages:
{
  "commonTopics": ["topic 1", "topic 2", ...]
}`;
}

/**
 * System prompt for pattern analysis
 */
export const PATTERN_ANALYSIS_SYSTEM = 'You are an SEO analyst. Respond with valid JSON only.';

/**
 * Template for gap identification
 */
export function gapIdentificationPrompt(
  userSite: SEOData,
  patterns: any
): string {
  return `You are an SEO consultant. Analyze this website against competitor benchmarks and identify specific SEO gaps.

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
}

/**
 * System prompt for gap identification
 */
export const GAP_IDENTIFICATION_SYSTEM = 'You are an SEO expert. Respond with valid JSON only.';

/**
 * Template for content outline generation
 */
export function contentOutlinePrompt(
  userSite: SEOData,
  gaps: Array<any>
): string {
  return `Based on these SEO gaps, create a detailed content outline for improving the page:

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
}

/**
 * System prompt for content outline
 */
export const CONTENT_OUTLINE_SYSTEM = 'You are an SEO content strategist.';

/**
 * Template for HTML report generation
 */
export function htmlReportPrompt(reportData: any): string {
  return `Create a professional, comprehensive SEO Gap Analysis report in HTML.

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
}

/**
 * System prompt for HTML report generation
 */
export const HTML_REPORT_SYSTEM = 'You are an expert at creating HTML reports. Return only HTML body content, no code blocks, no explanations, no <html> or <head> tags.';

/**
 * Helper to create a chat message array
 */
export function createChatMessages(
  systemPrompt: string,
  userPrompt: string
): Array<{ role: 'system' | 'user'; content: string }> {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}
