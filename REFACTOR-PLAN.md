# SEO Agent Refactor Plan: Client-Side Embedded Wallet Payments

## Overview

Refactor the SEO agent from a **backend wallet payment model** to a **client-side embedded wallet model** following the pattern used in `/Users/ashnouruzi/content-agent`.

---

## Current Architecture (Before)

### Payment Flow
```
User → Pays $0.50 USDC (flat fee) → Your receiving wallet
Server → Uses backend wallet (X402_WALLET_PRIVATE_KEY) → Pays Hyperbrowser (~$0.15)
```

### Issues
- ❌ Backend wallet custody/management
- ❌ Fixed pricing regardless of actual costs
- ❌ Server needs to hold private keys
- ❌ You absorb cost variance

---

## New Architecture (After)

### Payment Flow
```
User's Embedded Wallet → $0.01 service fee → NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS
User's Embedded Wallet → Pay-per-use (~$0.01 each) → Hyperbrowser (15-20 calls)
Total: ~$0.16-$0.21 (transparent, pay-what-you-use)
```

### Benefits
- ✅ No backend wallet custody
- ✅ Transparent per-use pricing
- ✅ User pays exact costs
- ✅ Simpler security model
- ✅ No cost variance risk

---

## Architecture Pattern: Client-Side x402 with Server Proxies

Following the **content-agent** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                            │
│                                                             │
│  User's CDP Embedded Wallet                                │
│  └─> x402-fetch wrapper (wrapFetchWithPayment)            │
│       └─> Automatically handles 402 responses               │
│           └─> Signs payments with embedded wallet           │
│               └─> Retries with X-PAYMENT header             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP with X-PAYMENT header
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ SERVER (Next.js API Proxies)                                │
│                                                             │
│  /api/hyperbrowser/fetch                                    │
│  /api/hyperbrowser/search                                   │
│  /api/service-fee/charge                                    │
│                                                             │
│  Action: Forward X-PAYMENT header to external services      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP with X-PAYMENT header
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ EXTERNAL SERVICES                                           │
│                                                             │
│  Hyperbrowser x402 endpoints                                │
│  Your service fee endpoint (x402-protected)                 │
│                                                             │
│  Action: Verify payment, settle USDC, return results        │
└─────────────────────────────────────────────────────────────┘
```

---

## Tasks Breakdown

### Phase 1: Client-Side Setup (app/page.tsx)

#### Task 1.1: Add x402-fetch Dependencies
**What:** Install client-side x402 packages for payment handling

**Action:**
```bash
npm install x402-fetch viem --legacy-peer-deps
```

**Files:** `package.json`

---

#### Task 1.2: Create x402-Fetch Wrapper in Client Component
**What:** Wrap fetch with payment capability using user's embedded wallet

**Location:** `app/page.tsx` (client component)

**Code Pattern (from content-agent):**
```typescript
'use client';

import { wrapFetchWithPayment } from 'x402-fetch';
import { createWalletClient, http, publicActions } from 'viem';
import { base } from 'viem/chains';
import { useCurrentUser } from '@coinbase/cdp-hooks';
import { toViemAccount } from '@/lib/cdp-utils'; // Helper to convert CDP wallet

export default function Home() {
  const { currentUser } = useCurrentUser();
  const [fetchFunc, setFetchFunc] = useState<typeof fetch | null>(null);

  useEffect(() => {
    async function setupPaymentFetch() {
      if (!currentUser?.evmAccounts?.[0]) return;

      // Convert CDP embedded wallet to viem account
      const viemAccount = await toViemAccount(currentUser.evmAccounts[0]);

      // Create wallet client for Base network
      const walletClient = createWalletClient({
        account: viemAccount,
        chain: base,
        transport: http('https://mainnet.base.org'),
      }).extend(publicActions);

      // Wrap fetch with x402 payment capability
      // Max payment: $0.50 (covers service fee + ~20 Hyperbrowser calls)
      const paymentFetch = wrapFetchWithPayment(
        fetch,
        walletClient,
        BigInt(0.50 * 10 ** 6) // USDC has 6 decimals
      );

      setFetchFunc(() => paymentFetch);
    }

    setupPaymentFetch();
  }, [currentUser]);

  // ... rest of component
}
```

**New File Needed:** `lib/cdp-utils.ts` (copy from content-agent)

**Dependencies:**
- User must be signed in with CDP wallet
- CDP wallet must have USDC on Base

---

#### Task 1.3: Update Form Submission Flow
**What:** Replace direct API call with two-phase payment flow

**Current Flow:**
```typescript
// Single API call, backend handles everything
const response = await fetchWithPayment('/api/workflows/seo-analysis', {
  method: 'POST',
  body: JSON.stringify({ url, userId })
});
```

**New Flow:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!fetchFunc) {
    setError('Payment system not ready');
    return;
  }

  setLoading(true);

  try {
    // Step 1: Pay service fee ($0.01)
    console.log('[Payment] Step 1: Service fee');
    const feeResponse = await fetchFunc('/api/service-fee/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!feeResponse.ok) {
      throw new Error('Service fee payment failed');
    }

    const { txHash: feeTxHash } = await feeResponse.json();
    console.log('[Payment] Service fee paid:', feeTxHash);

    // Step 2: Start workflow with payment-enabled fetch
    console.log('[Workflow] Starting SEO analysis');
    const workflowResponse = await fetch('/api/workflows/seo-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        userId,
        // Pass wallet info for server to create proxy URLs
        walletAddress: currentUser.evmAccounts[0]
      })
    });

    const { runId } = await workflowResponse.json();
    console.log('[Workflow] Started:', runId);

    // Redirect to report page (polling workflow status)
    router.push(`/report/${runId}`);

  } catch (error) {
    console.error('[Client] Error:', error);
    setError(error.message);
    setLoading(false);
  }
};
```

**Note:** Hyperbrowser payments happen during workflow execution via proxy routes

---

### Phase 2: Server-Side Proxy Routes

#### Task 2.1: Create Hyperbrowser Fetch Proxy
**What:** Proxy route that forwards X-PAYMENT header to Hyperbrowser

**New File:** `app/api/hyperbrowser/fetch/route.ts`

**Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const paymentHeader = request.headers.get('X-PAYMENT');

    console.log('[Hyperbrowser Proxy] Fetch request:', {
      url: body.url,
      hasPayment: !!paymentHeader
    });

    // Forward to Hyperbrowser x402 endpoint
    const response = await axios.post(
      'https://api.hyperbrowser.ai/x402/web/fetch',
      body, // { url, outputs, ... }
      {
        headers: {
          'Content-Type': 'application/json',
          ...(paymentHeader && { 'X-PAYMENT': paymentHeader })
        }
      }
    );

    // Extract payment response (transaction hash)
    const paymentResponseHeader = response.headers['x-payment-response'];

    if (paymentResponseHeader) {
      const decoded = JSON.parse(
        Buffer.from(paymentResponseHeader, 'base64').toString()
      );
      console.log('[Hyperbrowser Proxy] Payment settled:', {
        txHash: decoded.transaction,
        baseScan: `https://basescan.org/tx/${decoded.transaction}`
      });
    }

    // Return Hyperbrowser response + payment info
    return NextResponse.json({
      ...response.data,
      _payment: paymentResponseHeader ? {
        txHash: JSON.parse(Buffer.from(paymentResponseHeader, 'base64').toString()).transaction
      } : null
    });

  } catch (error) {
    console.error('[Hyperbrowser Proxy] Error:', error);

    // Forward 402 responses (payment required)
    if (axios.isAxiosError(error) && error.response?.status === 402) {
      return NextResponse.json(
        error.response.data,
        {
          status: 402,
          headers: error.response.headers as HeadersInit
        }
      );
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**Files:** Create `app/api/hyperbrowser/fetch/route.ts`

---

#### Task 2.2: Create Hyperbrowser Search Proxy
**What:** Proxy route for web search with x402 payments

**New File:** `app/api/hyperbrowser/search/route.ts`

**Code:** (Similar to fetch proxy, but calls `/x402/web/search`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const paymentHeader = request.headers.get('X-PAYMENT');

    console.log('[Hyperbrowser Proxy] Search request:', {
      query: body.query,
      hasPayment: !!paymentHeader
    });

    const response = await axios.post(
      'https://api.hyperbrowser.ai/x402/web/search',
      body, // { query, page, ... }
      {
        headers: {
          'Content-Type': 'application/json',
          ...(paymentHeader && { 'X-PAYMENT': paymentHeader })
        }
      }
    );

    // Extract payment response
    const paymentResponseHeader = response.headers['x-payment-response'];

    if (paymentResponseHeader) {
      const decoded = JSON.parse(
        Buffer.from(paymentResponseHeader, 'base64').toString()
      );
      console.log('[Hyperbrowser Proxy] Payment settled:', decoded.transaction);
    }

    return NextResponse.json({
      ...response.data,
      _payment: paymentResponseHeader ? {
        txHash: JSON.parse(Buffer.from(paymentResponseHeader, 'base64').toString()).transaction
      } : null
    });

  } catch (error) {
    console.error('[Hyperbrowser Proxy] Error:', error);

    if (axios.isAxiosError(error) && error.response?.status === 402) {
      return NextResponse.json(
        error.response.data,
        {
          status: 402,
          headers: error.response.headers as HeadersInit
        }
      );
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**Files:** Create `app/api/hyperbrowser/search/route.ts`

---

#### Task 2.3: Create Service Fee Endpoint
**What:** x402-protected endpoint that charges your service fee

**New File:** `app/api/service-fee/charge/route.ts`

**Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  createPaymentRequirements,
  verifyPayment,
  settlePayment,
  create402Response,
} from '@/lib/payment-verification';

export async function POST(request: NextRequest) {
  try {
    const paymentHeader = request.headers.get('X-PAYMENT');
    const body = await request.json();
    const requestUrl = `${new URL(request.url).origin}${new URL(request.url).pathname}`;

    // Get receiving address from env
    const receivingAddress = process.env.NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS as `0x${string}`;
    if (!receivingAddress) {
      throw new Error('NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS not configured');
    }

    // Create payment requirements ($0.01 service fee)
    const paymentRequirements = createPaymentRequirements(
      '$0.01',
      'base',
      requestUrl,
      'SEO Agent Service Fee - LLM & Analysis Costs'
    );

    // Update payTo to your receiving address
    paymentRequirements.accepts[0].payTo = receivingAddress;

    // Verify payment
    const verificationResult = await verifyPayment(
      paymentHeader,
      paymentRequirements
    );

    if (!verificationResult.isValid) {
      console.log('[Service Fee] Payment required');
      return NextResponse.json(
        create402Response(paymentRequirements, verificationResult.error),
        { status: 402 }
      );
    }

    console.log('[Service Fee] Payment verified:', verificationResult.payer);

    // Settle payment (async, don't block)
    settlePayment(paymentHeader!, paymentRequirements).then(result => {
      if (result.success) {
        console.log('[Service Fee] Settled:', result.txHash);
      } else {
        console.error('[Service Fee] Settlement failed:', result.error);
      }
    });

    // Return success
    return NextResponse.json({
      success: true,
      payer: verificationResult.payer,
      message: 'Service fee paid'
    });

  } catch (error) {
    console.error('[Service Fee] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**Files:** Create `app/api/service-fee/charge/route.ts`

**Note:** Uses existing `payment-verification.ts` functions (already v2 compatible)

---

### Phase 3: Update Hyperbrowser Library (lib/hyperbrowser.ts)

#### Task 3.1: Add Client-Side Fetch Parameter
**What:** Pass user's payment-enabled fetch to Hyperbrowser functions

**Current Signature:**
```typescript
export async function fetchPageData<T>(
  url: string,
  schema: z.ZodSchema<T>,
  fetchFunc: typeof fetch
): Promise<T>
```

**Changes Needed:**
```typescript
// Update to use proxy routes instead of direct Hyperbrowser calls
export async function fetchPageData<T>(
  url: string,
  schema: z.ZodSchema<T>,
  paymentFetch: typeof fetch // User's x402-wrapped fetch from client
): Promise<T> {
  console.log(`[Hyperbrowser] Fetching: ${url}`);

  // Call proxy route (which forwards to Hyperbrowser)
  const response = await paymentFetch('/api/hyperbrowser/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      outputs: ['markdown', 'html']
    })
  });

  if (!response.ok) {
    throw new Error(`Hyperbrowser fetch failed: ${response.status}`);
  }

  const result = await response.json();

  // Log payment info
  if (result._payment) {
    console.log(`[Hyperbrowser] Payment TX: ${result._payment.txHash}`);
  }

  // Extract data using schema
  return extractWithSchema(result.data, schema);
}

export async function searchWeb(
  query: string,
  page: number = 1,
  paymentFetch: typeof fetch
): Promise<Array<{ title: string; url: string; description: string }>> {
  console.log(`[Hyperbrowser] Searching: ${query}`);

  // Call proxy route
  const response = await paymentFetch('/api/hyperbrowser/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, page })
  });

  if (!response.ok) {
    throw new Error(`Hyperbrowser search failed: ${response.status}`);
  }

  const result = await response.json();

  if (result._payment) {
    console.log(`[Hyperbrowser] Payment TX: ${result._payment.txHash}`);
  }

  return result.data.results;
}

export async function fetchMultiplePages<T>(
  urls: string[],
  schema: z.ZodSchema<T>,
  paymentFetch: typeof fetch
): Promise<Array<T | null>> {
  console.log(`[Hyperbrowser] Fetching ${urls.length} pages in parallel`);

  const promises = urls.map(url =>
    fetchPageData(url, schema, paymentFetch).catch(error => {
      console.error(`[Hyperbrowser] Failed to fetch ${url}:`, error);
      return null;
    })
  );

  return Promise.all(promises);
}
```

**Files:** Update `lib/hyperbrowser.ts`

**Key Changes:**
- Remove `createX402Fetch()` function (no longer needed)
- Change to call proxy routes instead of direct Hyperbrowser
- Accept `paymentFetch` parameter (user's wrapped fetch)
- Proxy routes handle x402 payment forwarding

---

### Phase 4: Update Workflow Steps (app/api/workflows/seo-analysis/steps.ts)

#### Task 4.1: Remove Backend Wallet Code
**What:** Remove server-side x402 client creation

**Remove:**
```typescript
import { x402Client, wrapFetchWithPayment } from '@x402/fetch';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { privateKeyToAccount } from 'viem/accounts';

function createX402Fetch(): typeof fetch {
  const signer = privateKeyToAccount(process.env.X402_WALLET_PRIVATE_KEY as `0x${string}`);
  const client = new x402Client();
  registerExactEvmScheme(client, { signer });
  return wrapFetchWithPayment(fetch, client);
}
```

**Files:** `app/api/workflows/seo-analysis/steps.ts`

---

#### Task 4.2: Pass Client Fetch Through Workflow Context
**What:** Workflow steps need access to user's payment-enabled fetch

**Problem:** Workflow runs on server, but user's wallet is on client

**Solution:** Use proxy pattern - workflow calls proxy routes, client handles payments

**Updated Step Functions:**
```typescript
// Steps now use regular fetch to call proxy routes
// User's payment context is maintained via session/workflow state

export async function fetchUserSite(url: string): Promise<SEOData> {
  console.log(`[Step 1] Fetching user site: ${url}`);

  // Call proxy route (no special fetch needed - proxy forwards X-PAYMENT)
  const response = await fetch('/api/hyperbrowser/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      outputs: ['markdown', 'html']
    })
  });

  const result = await response.json();
  const data = extractWithSchema(result.data, SEO_EXTRACTION_SCHEMA);

  console.log(`[Step 1] ✓ Fetched: ${data.title}`);
  return data;
}
```

**Wait, this won't work!**

**Problem:** Workflow runs on server, can't access client's payment-enabled fetch.

**Better Solution:** Pre-execute Hyperbrowser calls on client before starting workflow

---

#### Task 4.3: REVISED APPROACH - Client Pre-Executes Hyperbrowser Calls
**What:** Move Hyperbrowser calls to client-side (like content-agent does)

**New Flow:**

```typescript
// app/page.tsx - Client-side
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Pay service fee
    await fetchFunc('/api/service-fee/charge', {...});

    // 2. Fetch user's site (with payment)
    console.log('[Client] Fetching user site...');
    const userSiteResponse = await fetchFunc('/api/hyperbrowser/fetch', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
    const userSiteData = await userSiteResponse.json();

    // 3. Search competitors (with payment)
    console.log('[Client] Searching competitors...');
    const searchResponse = await fetchFunc('/api/hyperbrowser/search', {
      method: 'POST',
      body: JSON.stringify({ query: url }) // Need to extract domain/topic
    });
    const competitors = await searchResponse.json();

    // 4. Fetch competitor pages (with payments)
    console.log('[Client] Fetching competitors...');
    const competitorPromises = competitors.data.results.slice(0, 10).map(comp =>
      fetchFunc('/api/hyperbrowser/fetch', {
        method: 'POST',
        body: JSON.stringify({ url: comp.url })
      }).then(r => r.json())
    );
    const competitorData = await Promise.all(competitorPromises);

    // 5. Start workflow with pre-fetched data
    console.log('[Client] Starting workflow...');
    const workflowResponse = await fetch('/api/workflows/seo-analysis', {
      method: 'POST',
      body: JSON.stringify({
        url,
        userId,
        // Pass pre-fetched data
        userSiteData: userSiteData.data,
        competitorData: competitorData.map(c => c.data)
      })
    });

    const { runId } = await workflowResponse.json();
    router.push(`/report/${runId}`);

  } catch (error) {
    setError(error.message);
    setLoading(false);
  }
};
```

**Workflow steps then just process data:**
```typescript
// steps.ts - Server-side
export async function analyzeData(
  userSiteData: any,
  competitorData: any[]
): Promise<Analysis> {
  // No Hyperbrowser calls - just process pre-fetched data
  // Use OpenAI to analyze patterns, identify gaps, etc.
}
```

**Files:**
- Update `app/page.tsx` - Add pre-fetch logic
- Update `steps.ts` - Remove Hyperbrowser calls, accept pre-fetched data
- Update `workflow.ts` - Adjust input types

---

### Phase 5: Update Workflow Entry Point

#### Task 5.1: Update Workflow Input Type
**What:** Workflow now receives pre-fetched data instead of just URL

**Current:**
```typescript
export interface SEOAnalysisInput {
  runId: string;
  url: string;
}
```

**New:**
```typescript
export interface SEOAnalysisInput {
  runId: string;
  url: string;
  userId: string;
  // Pre-fetched data from client
  userSiteData: {
    metadata: any;
    markdown: string;
    html: string;
  };
  competitorData: Array<{
    metadata: any;
    markdown: string;
    html: string;
  }>;
}
```

**Files:** `app/api/workflows/seo-analysis/workflow.ts`

---

#### Task 5.2: Update Workflow Steps
**What:** Refactor steps to work with pre-fetched data

**New Step Structure:**
```typescript
// Step 1: Extract SEO data from user site (already fetched)
export async function extractUserSiteData(rawData: any): Promise<SEOData> {
  return extractWithSchema(rawData, SEO_EXTRACTION_SCHEMA);
}

// Step 2: Discover keywords (no changes - uses OpenAI)
export async function discoverKeywords(siteData: SEOData): Promise<Keywords> {
  // Same as before
}

// Step 3: Extract competitor data (already fetched)
export async function extractCompetitorData(
  rawData: any[],
  keyword: string
): Promise<CompetitorData[]> {
  return rawData.map((data, index) => ({
    rank: index + 1,
    ...extractWithSchema(data, SEO_EXTRACTION_SCHEMA)
  }));
}

// Step 4-8: Analysis steps (no changes - use OpenAI)
```

**Files:** `app/api/workflows/seo-analysis/steps.ts`

---

#### Task 5.3: Remove Payment Verification from Workflow Route
**What:** Payment handled on client, workflow just processes data

**Current:**
```typescript
// app/api/workflows/seo-analysis/route.ts
const paymentHeader = request.headers.get('PAYMENT-SIGNATURE');
const verificationResult = await verifyPayment(paymentHeader, paymentRequirements);
if (!verificationResult.isValid) {
  return NextResponse.json(create402Response(...), { status: 402 });
}
```

**New:**
```typescript
// app/api/workflows/seo-analysis/route.ts
// No payment verification - service fee already paid on client
// Just validate input and start workflow

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, userId, userSiteData, competitorData } = body;

    // Input validation
    if (!url || !userId || !userSiteData || !competitorData) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Start workflow
    const runId = `seo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await saveReport({
      runId,
      userId,
      userUrl: url,
      createdAt: new Date(),
      status: 'analyzing',
    });

    const run = await start(seoAnalysisWorkflow, [{
      runId,
      url,
      userId,
      userSiteData,
      competitorData
    }]);

    console.log('[Workflow] Started:', run.runId);

    return NextResponse.json({
      success: true,
      runId: run.runId,
      message: 'SEO analysis started',
    });

  } catch (error) {
    console.error('[Workflow] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**Files:** `app/api/workflows/seo-analysis/route.ts`

---

### Phase 6: Environment Variables & Config

#### Task 6.1: Update Environment Variables

**Remove:**
```bash
# Backend wallet (no longer needed)
X402_WALLET_PRIVATE_KEY=0x...
```

**Keep:**
```bash
# Service fee receiving address (make public for client)
NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS=0x...

# OpenAI API (server-side)
OPENAI_API_KEY=sk-...
```

**Add to `.env.local`:**
```bash
# CDP Project ID (if not already present)
NEXT_PUBLIC_CDP_PROJECT_ID=your-project-id
```

**Files:**
- `.env.local`
- `.env.example` (update template)

---

#### Task 6.2: Update Config
**What:** Update pricing config to reflect new pay-per-use model

**File:** `lib/config.ts`

**Current:**
```typescript
export const COST_CONFIG = {
  seoAnalysis: 0.50, // Flat fee
};
```

**New:**
```typescript
export const COST_CONFIG = {
  serviceFee: 0.01,        // Your fee for LLM/analysis
  hyperbrowserFetch: 0.01, // ~$0.01 per page fetch (Hyperbrowser pricing)
  hyperbrowserSearch: 0.01, // ~$0.01 per search

  // Estimated total (service fee + ~15 Hyperbrowser calls)
  estimatedTotal: 0.16,

  // Max allowed (buffer for variance)
  maxPayment: 0.50,
};
```

---

### Phase 7: UI Updates

#### Task 7.1: Update Pricing Display
**What:** Show transparent per-use pricing instead of flat fee

**File:** `app/page.tsx`

**Current:**
```tsx
<button type="submit">
  Generate SEO Report ($0.50 USDC)
</button>
```

**New:**
```tsx
<div className="space-y-2">
  <div className="text-sm text-slate-600">
    <div className="font-medium">Pricing (Pay-per-use):</div>
    <ul className="list-disc list-inside space-y-1 mt-1">
      <li>Service fee: ${COST_CONFIG.serviceFee} USDC</li>
      <li>Web scraping: ~${COST_CONFIG.hyperbrowserFetch} USDC per page</li>
      <li className="font-semibold">Estimated total: ~${COST_CONFIG.estimatedTotal} USDC</li>
    </ul>
  </div>

  <button type="submit">
    Generate SEO Report (~${COST_CONFIG.estimatedTotal} USDC)
  </button>
</div>
```

---

#### Task 7.2: Add Payment Progress Indicator
**What:** Show user what they're paying for in real-time

**Component:**
```tsx
<div className="mt-4 space-y-2">
  {paymentSteps.map((step, i) => (
    <div key={i} className="flex items-center gap-2 text-sm">
      {step.status === 'completed' && <CheckIcon className="text-green-500" />}
      {step.status === 'processing' && <SpinnerIcon />}
      {step.status === 'pending' && <ClockIcon className="text-gray-400" />}
      <span className={step.status === 'completed' ? 'text-green-600' : ''}>
        {step.label}
      </span>
      {step.cost && (
        <span className="ml-auto text-xs text-slate-500">
          ${step.cost} USDC
        </span>
      )}
    </div>
  ))}
</div>
```

**Files:** `app/page.tsx`, create `components/PaymentProgress.tsx`

---

### Phase 8: Testing & Deployment

#### Task 8.1: Local Testing Checklist

- [ ] User can sign in with CDP wallet
- [ ] Service fee payment works ($0.01 to your address)
- [ ] Hyperbrowser fetch proxy works (402 → payment → retry)
- [ ] Hyperbrowser search proxy works
- [ ] Multiple Hyperbrowser calls work (10-20 calls)
- [ ] Workflow receives pre-fetched data correctly
- [ ] Report generation works with new data flow
- [ ] Total cost is ~$0.16 (service fee + Hyperbrowser calls)
- [ ] Transaction hashes logged for all payments

---

#### Task 8.2: Error Handling

**Add error handling for:**
1. **Insufficient USDC balance**
   ```typescript
   if (error.message.includes('insufficient')) {
     setError(`Insufficient USDC balance. You need ~$${COST_CONFIG.estimatedTotal}`);
   }
   ```

2. **Payment rejection**
   ```typescript
   if (error.message.includes('rejected')) {
     setError('Payment was rejected. Please try again.');
   }
   ```

3. **Hyperbrowser rate limits**
   ```typescript
   if (response.status === 429) {
     setError('Too many requests. Please wait a moment.');
   }
   ```

4. **Network issues**
   ```typescript
   if (!navigator.onLine) {
     setError('No internet connection. Please check your network.');
   }
   ```

---

#### Task 8.3: Update Documentation

**Files to update:**
- `README.md` - Update architecture section
- `REFACTOR-PLAN.md` - This document
- Add migration notes to `bug.md`

---

## Implementation Order

### Week 1: Foundation
1. ✅ Install dependencies (Task 1.1)
2. ✅ Create x402-fetch wrapper (Task 1.2)
3. ✅ Create Hyperbrowser proxy routes (Task 2.1, 2.2)
4. ✅ Create service fee endpoint (Task 2.3)

### Week 2: Integration
5. ✅ Update client submission flow (Task 1.3)
6. ✅ Update Hyperbrowser library (Task 3.1)
7. ✅ Refactor workflow steps (Task 4.3)
8. ✅ Update workflow input types (Task 5.1, 5.2)

### Week 3: Polish
9. ✅ Remove old payment code (Task 4.1, 5.3, 6.1)
10. ✅ Update UI with new pricing (Task 7.1, 7.2)
11. ✅ Add error handling (Task 8.2)
12. ✅ Testing (Task 8.1)

### Week 4: Launch
13. ✅ Update documentation (Task 8.3)
14. ✅ Deploy to production
15. ✅ Monitor first user transactions

---

## Key Differences vs Current Architecture

| Aspect | Current (Backend Wallet) | New (Client Wallet) |
|--------|-------------------------|---------------------|
| **User Payment** | $0.50 flat fee | ~$0.16 pay-per-use |
| **Payment Timing** | Upfront | On-demand per call |
| **Wallet Custody** | Backend holds private key | No custody, client-side only |
| **Hyperbrowser Calls** | Server-side with backend wallet | Client-side pre-fetch with user wallet |
| **Cost Variance** | You absorb | User pays exact costs |
| **Security** | Backend key management | CDP embedded wallet |
| **Transparency** | Fixed price | Itemized per-use |
| **Workflow Input** | Just URL | URL + pre-fetched data |

---

## Dependencies

### npm Packages
```json
{
  "dependencies": {
    "@coinbase/cdp-hooks": "latest",
    "x402-fetch": "^0.7.3",
    "viem": "^2.x",
    "@x402/core": "^2.x",
    "@x402/evm": "^2.x"
  }
}
```

### Environment Variables
```bash
NEXT_PUBLIC_CDP_PROJECT_ID=xxx
NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS=0x...
OPENAI_API_KEY=sk-...
```

---

## Reference Projects

- **content-agent**: `/Users/ashnouruzi/content-agent`
  - Client-side x402 payment flow
  - Pre-workflow data fetching
  - Proxy route pattern

- **api-maker**: `/Users/ashnouruzi/api-maker`
  - Dual payment handling (creator + service)
  - CDP embedded wallet integration
  - Payment verification patterns

---

## Success Metrics

- ✅ No backend wallet custody
- ✅ Transparent per-use pricing
- ✅ User pays ~$0.16 (vs $0.50 before)
- ✅ All payments on-chain with transaction hashes
- ✅ ~15-20 Hyperbrowser calls per workflow
- ✅ <30 second total payment time for all calls
- ✅ Zero failed payments due to backend issues

---

## Rollback Plan

If issues arise, can rollback by:
1. Keep both architectures in separate branches
2. Feature flag to toggle between old/new flow
3. Gradual migration: 10% → 50% → 100% of users

---

**Last Updated:** 2026-01-14
**Status:** Ready to implement
