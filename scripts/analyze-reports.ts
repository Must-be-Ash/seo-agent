#!/usr/bin/env tsx
/**
 * Fetch and analyze specific reports from the database
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'seo-agent';
const COLLECTION_NAME = 'seo_reports';

async function analyzeReports() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Fetch the two specific reports
    const reportIds = ['seo_1768600111963_731vz94ng'];

    for (const runId of reportIds) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📊 Analyzing Report: ${runId}`);
      console.log('='.repeat(80));

      const report = await collection.findOne({ runId });

      if (!report) {
        console.log(`❌ Report not found: ${runId}\n`);
        continue;
      }

      console.log(`\n✓ Report Found`);
      console.log(`  Status: ${report.status}`);
      console.log(`  URL: ${report.url}`);
      console.log(`  Created: ${new Date(report.createdAt).toLocaleString()}`);

      if (report.score !== undefined) {
        console.log(`  Score: ${report.score}/100`);
      }

      // Analyze keywords
      console.log(`\n📌 KEYWORDS:`);
      if (report.discoveredKeywords) {
        console.log(`  Primary: "${report.discoveredKeywords.primary}"`);
        console.log(`  Secondary: ${report.discoveredKeywords.secondary?.join(', ') || 'None'}`);
      } else {
        console.log(`  ❌ No keywords found in database`);
      }

      // Analyze gaps
      console.log(`\n🔍 GAPS IDENTIFIED:`);
      if (report.gaps && Array.isArray(report.gaps)) {
        const highGaps = report.gaps.filter((g: any) => g.severity === 'high').length;
        const mediumGaps = report.gaps.filter((g: any) => g.severity === 'medium').length;
        const lowGaps = report.gaps.filter((g: any) => g.severity === 'low').length;

        console.log(`  Total: ${report.gaps.length} gaps`);
        console.log(`  High: ${highGaps}`);
        console.log(`  Medium: ${mediumGaps}`);
        console.log(`  Low: ${lowGaps}`);

        // Show gap details
        report.gaps.forEach((gap: any, index: number) => {
          console.log(`\n  Gap ${index + 1} [${gap.severity.toUpperCase()}] - ${gap.category}:`);
          console.log(`    Finding: ${gap.finding}`);
        });
      } else {
        console.log(`  ❌ No gaps found in database`);
      }

      // Analyze score calculation
      if (report.gaps && Array.isArray(report.gaps)) {
        const highGaps = report.gaps.filter((g: any) => g.severity === 'high').length;
        const mediumGaps = report.gaps.filter((g: any) => g.severity === 'medium').length;
        const lowGaps = report.gaps.filter((g: any) => g.severity === 'low').length;

        let calculatedScore = 100;
        calculatedScore -= highGaps * 15;
        calculatedScore -= mediumGaps * 8;
        calculatedScore -= lowGaps * 3;
        calculatedScore = Math.max(0, Math.min(100, calculatedScore));

        console.log(`\n🎯 SCORE ANALYSIS:`);
        console.log(`  Calculated score: ${calculatedScore}`);
        console.log(`  Stored score: ${report.score}`);
        console.log(`  Match: ${calculatedScore === report.score ? '✓ Yes' : '❌ No'}`);
      }

      // Check reportData structure
      console.log(`\n📋 REPORT DATA STRUCTURE:`);
      if (report.reportData) {
        console.log(`  ✓ Has structured reportData`);
        console.log(`  Executive Summary: ${report.reportData.executiveSummary ? '✓' : '❌'}`);
        console.log(`  Metrics: ${report.reportData.yourMetrics ? '✓' : '❌'}`);
        console.log(`  Competitor Benchmarks: ${report.reportData.competitorBenchmarks ? '✓' : '❌'}`);
        console.log(`  Gaps: ${report.reportData.gaps ? `✓ (${report.reportData.gaps.length})` : '❌'}`);
        console.log(`  Recommendations: ${report.reportData.recommendations ? '✓' : '❌'}`);
        console.log(`  Content Outline: ${report.reportData.contentOutline ? '✓' : '❌'}`);
        console.log(`  Keywords in reportData: ${report.reportData.keywords ? `✓ Primary: "${report.reportData.keywords.primary}"` : '❌'}`);
        console.log(`  Competitors: ${report.reportData.competitors ? `✓ (${report.reportData.competitors.length})` : '❌'}`);
      } else {
        console.log(`  ❌ No reportData found`);
      }

      // Metrics comparison
      if (report.userSiteData && report.patterns) {
        console.log(`\n📊 METRICS COMPARISON:`);
        console.log(`  Your Word Count: ${report.userSiteData.wordCount}`);
        console.log(`  Competitor Avg: ${report.patterns.avgWordCount}`);
        console.log(`  Difference: ${report.userSiteData.wordCount - report.patterns.avgWordCount} (${((report.userSiteData.wordCount / report.patterns.avgWordCount - 1) * 100).toFixed(1)}%)`);
      }
    }

    console.log(`\n${'='.repeat(80)}\n`);
    console.log('✅ Analysis complete\n');

  } catch (error) {
    console.error('\n❌ Error analyzing reports:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the script
analyzeReports();
