import type { SEOReport } from '@/types';
import type { StructuredReportData } from '@/types/report-data';

/**
 * Converts an old report (with reportHtml) to the new structured format
 * This allows old reports to use the new UI components
 */
export function convertOldReportToStructured(report: SEOReport): StructuredReportData | null {
  // If report already has structured data, return it
  if (report.reportData) {
    return report.reportData;
  }

  // Need all the data to convert
  if (!report.userSiteData || !report.patterns || !report.gaps || !report.recommendations || !report.discoveredKeywords) {
    return null;
  }

  // Extract key findings from gaps
  const keyFindings = report.gaps
    .slice(0, 5)
    .map(gap => gap.finding);

  // Generate a simple executive summary
  const highGaps = report.gaps.filter(g => g.severity === 'high');
  const mediumGaps = report.gaps.filter(g => g.severity === 'medium');
  const mainGapCategories = [...new Set(highGaps.map(g => g.category))].slice(0, 3);
  
  const overview = `This SEO analysis reveals a score of ${report.score || 0}/100 for ${report.userUrl}. The analysis identified ${highGaps.length} high-priority and ${mediumGaps.length} medium-priority SEO gaps, primarily in ${mainGapCategories.join(', ')}. This report provides actionable recommendations to improve your search engine visibility and content quality.`;

  // Parse content outline from markdown
  const parseContentOutline = (outlineText: string) => {
    const lines = outlineText.split('\n').filter(l => l.trim());
    let recommendedH1 = '';
    const h2Sections: Array<{ title: string; estimatedWordCount: number; description: string }> = [];
    let totalWordCount = 0;
    let currentSection: { title: string; estimatedWordCount: number; description: string } | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Extract H1
      if (trimmed.toLowerCase().includes('recommended h1')) {
        const nextLineIndex = lines.indexOf(trimmed) + 1;
        if (nextLineIndex < lines.length) {
          const nextLine = lines[nextLineIndex].trim();
          const h1Match = nextLine.match(/\*\*["'](.+?)["']\*\*|["'](.+?)["']|(.+)/);
          if (h1Match) {
            recommendedH1 = (h1Match[1] || h1Match[2] || h1Match[3] || '').trim();
            if (recommendedH1) continue;
          }
        }
      } else if (trimmed.startsWith('#') && !trimmed.startsWith('##')) {
        recommendedH1 = trimmed.replace(/^#+\s*/, '').trim();
        recommendedH1 = recommendedH1.replace(/\*\*["'](.+?)["']\*\*|["'](.+?)["']/, '$1$2');
        if (recommendedH1) continue;
      } else if (trimmed.match(/^\*\*["'].+?["']\*\*|^["'].+?["']$/)) {
        const h1Match = trimmed.match(/["'](.+?)["']/);
        if (h1Match && !recommendedH1) {
          recommendedH1 = h1Match[1].trim();
          continue;
        }
      }

      // Extract H2 sections
      if (trimmed.startsWith('##') || trimmed.match(/^[-*]\s+/) || trimmed.match(/^\d+\.\s+/) || trimmed.match(/^###\s+\d+\./)) {
        if (currentSection) {
          h2Sections.push(currentSection);
          totalWordCount += currentSection.estimatedWordCount;
        }

        let match = trimmed.match(/(?:###\s+\d+\.\s*|##\s*|[-*]\s*|\d+\.\s*)(.+?)(?:\s*\([^)]*[Ee]stimated\s+[Ww]ord\s+[Cc]ount[:\s]*(\d+)[^)]*\)|\(~?(\d+)\s*words?\))/i);
        if (!match) {
          match = trimmed.match(/(?:###\s+\d+\.\s*|##\s*|[-*]\s*|\d+\.\s*)(.+?)(?:\s*\(~?(\d+)\s*words?\))?/i);
        }
        
        if (match) {
          const title = match[1].trim();
          const wordCount = match[2] ? parseInt(match[2]) : (match[3] ? parseInt(match[3]) : 200);
          currentSection = {
            title,
            estimatedWordCount: wordCount,
            description: '',
          };
        }
      } else if (currentSection && trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.match(/^Total\s+Estimated/i)) {
        if (trimmed !== '---' && !trimmed.match(/^Total\s+Estimated/i)) {
          if (currentSection.description) {
            currentSection.description += ' ' + trimmed;
          } else {
            currentSection.description = trimmed;
          }
        }
      } else if (trimmed.match(/^Total\s+Estimated\s+Word\s+Count[:\s]*(\d+)/i)) {
        const totalMatch = trimmed.match(/(\d+)/);
        if (totalMatch && totalWordCount === 0) {
          totalWordCount = parseInt(totalMatch[1]);
        }
      }
    }

    if (currentSection) {
      h2Sections.push(currentSection);
      totalWordCount += currentSection.estimatedWordCount;
    }

    if (!recommendedH1 && lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.startsWith('#')) {
        recommendedH1 = firstLine.replace(/^#+\s*/, '').trim();
      } else if (!firstLine.startsWith('##') && !firstLine.match(/^[-*]\s+/) && !firstLine.match(/^\d+\.\s+/)) {
        recommendedH1 = firstLine;
      }
    }

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

  // Structure recommendations
  const structureRecommendations = (recommendations: string[], priority: 'high' | 'medium' | 'low') => {
    return recommendations.map((rec) => {
      const trimmed = rec.trim();
      
      const correspondingGap = report.gaps!.find((g) => 
        g.severity === priority && 
        (g.recommendation === trimmed || g.recommendation.includes(trimmed.substring(0, 50)))
      );

      let title = trimmed;
      let description = '';
      let actionItems: string[] = [];

      if (correspondingGap) {
        title = correspondingGap.category || trimmed.substring(0, 60);
        description = correspondingGap.impact || '';
        actionItems = [correspondingGap.recommendation || trimmed];
      } else {
        const actionMatch = trimmed.match(/^(Add|Incorporate|Expand|Consider|Implement|Create|Build|Develop|Improve|Enhance|Optimize|Update|Fix|Remove|Replace)\s+(.+)/i);
        if (actionMatch) {
          title = actionMatch[1] + ' ' + actionMatch[2].split(/[.,]/)[0].trim();
          description = trimmed;
          actionItems = [trimmed];
        } else if (trimmed.includes(':')) {
          const parts = trimmed.split(':');
          title = parts[0].trim();
          description = parts.slice(1).join(':').trim();
          actionItems = [description || trimmed];
        } else {
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

      title = title.replace(/^[A-Z]\w+\s+/, '');
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

  const contentOutline = parseContentOutline(report.recommendations.contentOutline || '');

  const structuredData: StructuredReportData = {
    executiveSummary: {
      overview,
      keyFindings,
      score: report.score || 0,
    },
    yourMetrics: {
      wordCount: report.userSiteData.wordCount,
      h2Count: report.userSiteData.h2.length,
      h3Count: report.userSiteData.h3.length,
      internalLinks: report.userSiteData.internalLinks,
      externalLinks: report.userSiteData.externalLinks,
      hasSchema: report.userSiteData.hasSchema,
    },
    competitorBenchmarks: {
      avgWordCount: report.patterns.avgWordCount,
      avgH2Count: report.patterns.avgH2Count,
      avgH3Count: report.patterns.avgH3Count,
      avgInternalLinks: report.patterns.avgInternalLinks,
      avgExternalLinks: report.patterns.avgExternalLinks,
      schemaUsage: report.patterns.technicalPatterns?.schemaUsage || 0,
      totalCompetitors: report.patterns.technicalPatterns?.totalCompetitors || 0,
    },
    gaps: report.gaps,
    recommendations: {
      highPriority: structureRecommendations(report.recommendations.highPriority || [], 'high'),
      mediumPriority: structureRecommendations(report.recommendations.mediumPriority || [], 'medium'),
      lowPriority: structureRecommendations(report.recommendations.lowPriority || [], 'low'),
    },
    contentOutline,
    keywords: {
      primary: report.discoveredKeywords.primary,
      secondary: report.discoveredKeywords.secondary || [],
    },
    competitors: (report.competitorData || []).map((comp: any) => ({
      rank: comp.rank || 0,
      url: comp.url || '',
      title: comp.title || comp.url || 'Unknown',
      wordCount: comp.wordCount || 0,
      h2Count: comp.h2?.length || 0,
    })),
  };

  return structuredData;
}
