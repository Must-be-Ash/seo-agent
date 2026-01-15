'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { StructuredReportData } from '@/types/report-data';

interface DownloadReportButtonProps {
  reportData: StructuredReportData;
  userUrl: string;
  score: number;
  runId: string;
}

export function DownloadReportButton({ reportData, userUrl, score, runId }: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Create a temporary container for PDF generation
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '210mm'; // A4 width
      container.style.backgroundColor = '#FFFFFF';
      container.style.color = '#000000';
      container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      document.body.appendChild(container);

      // Generate HTML content with page break hints
      container.innerHTML = generatePDFHTML(reportData, userUrl, score);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use jsPDF html method for better page break handling
      const pdf = new jsPDF('p', 'mm', 'a4');

      await pdf.html(container, {
        callback: function (doc) {
          doc.save(`seo-report-${runId}.pdf`);
        },
        x: 15,
        y: 15,
        width: 180, // A4 width minus margins
        windowWidth: 800,
        html2canvas: {
          scale: 0.265, // Adjust scale for proper sizing
          useCORS: true,
          logging: false,
        }
      });

      // Remove temporary container
      document.body.removeChild(container);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: '#3A3A3A',
        color: '#FFFFFF',
        border: '1px solid #4A4A4A'
      }}
      onMouseEnter={(e) => {
        if (!isGenerating) {
          e.currentTarget.style.backgroundColor = '#4A4A4A';
          e.currentTarget.style.borderColor = '#5A5A5A';
        }
      }}
      onMouseLeave={(e) => {
        if (!isGenerating) {
          e.currentTarget.style.backgroundColor = '#3A3A3A';
          e.currentTarget.style.borderColor = '#4A4A4A';
        }
      }}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Download Report</span>
        </>
      )}
    </button>
  );
}

function generatePDFHTML(data: StructuredReportData, userUrl: string, score: number): string {
  return `
    <style>
      .pdf-section { page-break-inside: avoid; margin-bottom: 20px; }
      .pdf-gap-item { page-break-inside: avoid; margin-bottom: 20px; }
      .pdf-recommendation { page-break-inside: avoid; margin-bottom: 15px; }
      .pdf-competitor { page-break-inside: avoid; margin-bottom: 15px; }
      h2 { page-break-after: avoid; }
      h3 { page-break-after: avoid; }
    </style>
    <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #fff; color: #000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div class="pdf-section">
        <h1 style="font-size: 32px; margin-bottom: 10px; color: #000;">SEO Gap Analysis Report</h1>
        <p style="margin: 5px 0;"><strong>Website:</strong> ${userUrl}</p>
        <p style="margin: 5px 0;"><strong>Score:</strong> <span style="font-size: 36px; font-weight: bold;">${score}/100</span></p>
        <p style="margin: 5px 0 30px 0;"><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="pdf-section" style="margin: 30px 0;">
        <h2 style="font-size: 24px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 5px;">Executive Summary</h2>
        <p style="line-height: 1.6; margin-bottom: 15px;">${data.executiveSummary.overview}</p>
        <h3 style="font-size: 18px; margin-top: 20px; margin-bottom: 10px;">Key Findings</h3>
        <ul style="line-height: 1.8;">
          ${data.executiveSummary.keyFindings.map(f => `<li style="margin-bottom: 8px;">${f}</li>`).join('')}
        </ul>
      </div>

      <div class="pdf-section" style="margin: 30px 0;">
        <h2 style="font-size: 24px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 5px;">Your Metrics vs Competitors</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #000;">Metric</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #000;">Your Site</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #000;">Competitor Average</th>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">Word Count</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.yourMetrics.wordCount.toLocaleString()}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.competitorBenchmarks.avgWordCount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">H2 Headings</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.yourMetrics.h2Count}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.competitorBenchmarks.avgH2Count}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">H3 Headings</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.yourMetrics.h3Count}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.competitorBenchmarks.avgH3Count}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">Internal Links</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.yourMetrics.internalLinks}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.competitorBenchmarks.avgInternalLinks}</td>
          </tr>
        </table>
      </div>

      ${data.competitors && data.competitors.length > 0 ? `
      <div class="pdf-section" style="margin: 30px 0;">
        <h2 style="font-size: 24px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 5px;">Competitors Analyzed</h2>
        <p style="margin-bottom: 15px;">Top ${data.competitors.length} pages ranking for "${data.keywords.primary}"</p>
        ${data.competitors.map(c => `
          <div class="pdf-competitor" style="margin: 15px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #000;">
            <strong>#${c.rank}:</strong> ${c.title}<br>
            <small style="color: #666;">${c.url}</small><br>
            ${c.wordCount.toLocaleString()} words • ${c.h2Count} H2 headings
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="pdf-section" style="margin: 30px 0;">
        <h2 style="font-size: 24px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 5px;">SEO Gap Analysis</h2>
        ${data.gaps.map(gap => {
          const badgeColor = gap.severity === 'high' ? '#EF4444' : gap.severity === 'medium' ? '#EAB308' : '#3B82F6';
          const badgeTextColor = gap.severity === 'medium' ? '#000' : '#fff';
          return `
          <div class="pdf-gap-item" style="margin: 20px 0; padding: 20px; border-left: 4px solid ${badgeColor}; background: #f5f5f5;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; margin-right: 8px; background: ${badgeColor}; color: ${badgeTextColor};">${gap.severity.toUpperCase()}</span>
            <strong style="font-size: 12px;">${gap.category}</strong>
            <h3 style="font-size: 16px; margin-top: 10px; margin-bottom: 8px;">${gap.finding}</h3>
            <p style="margin: 8px 0;"><strong>Impact:</strong> ${gap.impact}</p>
            <p style="margin: 8px 0;"><strong>Recommendation:</strong> ${gap.recommendation}</p>
          </div>
        `;
        }).join('')}
      </div>

      <div class="pdf-section" style="margin: 30px 0;">
        <h2 style="font-size: 24px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 5px;">Prioritized Recommendations</h2>
        ${data.recommendations.highPriority.length > 0 ? `
          <h3 style="font-size: 18px; margin-top: 20px; margin-bottom: 10px;">High Priority</h3>
          ${data.recommendations.highPriority.map(rec => `
            <div class="pdf-recommendation" style="margin: 15px 0; padding: 15px; border-left: 4px solid #EF4444; background: #f5f5f5;">
              <h4 style="font-size: 16px; margin-bottom: 8px;">${rec.title}</h4>
              <p style="margin: 8px 0;">${rec.description}</p>
              ${rec.actionItems.length > 0 ? `
                <ul style="margin: 10px 0; padding-left: 20px;">
                  ${rec.actionItems.map(item => `<li style="margin: 5px 0;">${item}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        ` : ''}
        ${data.recommendations.mediumPriority.length > 0 ? `
          <h3 style="font-size: 18px; margin-top: 20px; margin-bottom: 10px;">Medium Priority</h3>
          ${data.recommendations.mediumPriority.map(rec => `
            <div class="pdf-recommendation" style="margin: 15px 0; padding: 15px; border-left: 4px solid #EAB308; background: #f5f5f5;">
              <h4 style="font-size: 16px; margin-bottom: 8px;">${rec.title}</h4>
              <p style="margin: 8px 0;">${rec.description}</p>
            </div>
          `).join('')}
        ` : ''}
      </div>

      <div class="pdf-section" style="margin: 30px 0;">
        <h2 style="font-size: 24px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 5px;">Content Outline</h2>
        <h3 style="font-size: 18px; margin-top: 20px; margin-bottom: 10px;">Recommended H1</h3>
        <p style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">${data.contentOutline.recommendedH1}</p>
        <h3 style="font-size: 18px; margin-top: 20px; margin-bottom: 10px;">H2 Sections</h3>
        <ul style="line-height: 1.8;">
          ${data.contentOutline.h2Sections.map(s => `
            <li style="margin-bottom: 10px;"><strong>${s.title}</strong> (~${s.estimatedWordCount} words)${s.description ? `<br><small style="color: #666;">${s.description}</small>` : ''}</li>
          `).join('')}
        </ul>
        <p style="margin-top: 20px; font-size: 16px;"><strong>Total Estimated Word Count:</strong> ${data.contentOutline.totalEstimatedWordCount.toLocaleString()} words</p>
      </div>
    </div>
  `;
}
