#!/usr/bin/env tsx
/**
 * Clear all documents from seo-agent.seo_reports collection
 * Safe script that only targets the specific collection
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'seo-agent';
const COLLECTION_NAME = 'seo_reports';

async function clearReports() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Count documents before deletion
    const countBefore = await collection.countDocuments();
    console.log(`\n📊 Found ${countBefore} documents in ${DATABASE_NAME}.${COLLECTION_NAME}`);

    if (countBefore === 0) {
      console.log('✓ Collection is already empty. Nothing to delete.');
      return;
    }

    // Ask for confirmation
    console.log(`\n⚠️  About to delete ${countBefore} documents from ${DATABASE_NAME}.${COLLECTION_NAME}`);
    console.log('   This action cannot be undone.');

    // Delete all documents
    console.log('\n🗑️  Deleting documents...');
    const result = await collection.deleteMany({});

    console.log(`✓ Deleted ${result.deletedCount} documents`);

    // Verify deletion
    const countAfter = await collection.countDocuments();
    console.log(`✓ Collection now has ${countAfter} documents`);

    if (countAfter === 0) {
      console.log('\n✅ Successfully cleared all reports from seo-agent.seo_reports');
    } else {
      console.log('\n⚠️  Warning: Some documents may still remain');
    }

  } catch (error) {
    console.error('\n❌ Error clearing reports:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
clearReports();
