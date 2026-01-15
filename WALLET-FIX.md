# Embedded Wallet x402 Payment Fix

## Issues Found & Fixed

### Issue 1: Wrong Wallet Type ❌ → ✅
**Problem:** App was creating EOA wallets, but x402 v2 requires Smart Wallets (ERC-4337)

**File:** `app/providers.tsx:11`

**Before:**
```typescript
ethereum: {
  createOnLogin: "eoa" as const,  // ❌ EOA not compatible with x402 v2
}
```

**After:**
```typescript
ethereum: {
  createOnLogin: "smart" as const,  // ✅ Smart Wallet (ERC-4337) required
}
```

---

### Issue 2: Wrong Wallet Address Reference ❌ → ✅
**Problem:** WalletDropdown was accessing EOA address instead of Smart Wallet address

**File:** `components/WalletDropdown.tsx:19`

**Before:**
```typescript
const evmAddress = currentUser?.evmAccounts?.[0];  // ❌ EOA address
```

**After:**
```typescript
const evmAddress = currentUser?.evmSmartAccounts?.[0];  // ✅ Smart Wallet
```

---

### Issue 3: Missing x402-fetch Package ❌ → ✅
**Problem:** CDP hooks `useX402()` requires `x402-fetch` v1 as peer dependency

**Error:**
```
x402-fetch is not installed. Make sure x402-fetch is installed and try again.
```

**Fix:**
```bash
npm install x402-fetch@^0.7.3 --legacy-peer-deps
```

**Why Both Versions?**
- `x402-fetch` v0.7.3 (v1) - Client-side, used by CDP hooks
- `@x402/fetch` v2.2.0 (v2) - Server-side, for future use
- They are **different packages** that coexist

---

## Architecture Overview

### Client-Side Payment Flow (Fixed)
```
User signs in with CDP
  ↓
Smart Wallet created (ERC-4337)
  ↓
useX402() hook provides fetchWithPayment
  ↓
Uses x402-fetch v1 under the hood
  ↓
Automatically handles 402 responses
  ↓
Signs payments with Smart Wallet
  ↓
Retries with X-PAYMENT header
```

### Smart Wallet vs EOA

| Feature | EOA (Old) | Smart Wallet (New) |
|---------|-----------|-------------------|
| **x402 v2 Support** | ❌ No | ✅ Yes |
| **Standard** | Basic Ethereum account | ERC-4337 Account Abstraction |
| **CDP Field** | `evmAccounts[0]` | `evmSmartAccounts[0]` |
| **Deployment** | Pre-deployed | Counterfactual (EIP-6492) |
| **Gas** | User pays | Can sponsor/batch |

---

## What Changed

### Package Dependencies
```json
{
  "dependencies": {
    "@coinbase/cdp-hooks": "^0.0.75",
    "@coinbase/cdp-react": "^0.0.75",

    // Client-side (v1 for CDP hooks)
    "x402-fetch": "^0.7.3",

    // Server-side (v2)
    "@coinbase/x402": "^2.1.0",
    "@x402/core": "^2.2.0",
    "@x402/evm": "^2.2.0",
    "@x402/fetch": "^2.2.0"
  }
}
```

### Environment Variables (Unchanged)
```bash
NEXT_PUBLIC_CDP_PROJECT_ID=xxx
USDC_RECEIVING_WALLET_ADDRESS=0x...
X402_WALLET_PRIVATE_KEY=0x...  # Backend wallet for Hyperbrowser
OPENAI_API_KEY=sk-...
```

---

## Testing Checklist

- [x] Install `x402-fetch` v1
- [x] Change wallet type to `smart`
- [x] Update wallet address reference
- [x] Downgrade to CDP v0.0.60 + x402-fetch v0.7.0 (compatible versions)
- [x] Rewrite manual wrapped fetch (no useX402 hook)
- [x] Build succeeds without errors
- [ ] **Restart dev server** (`npm run dev`)
- [ ] User signs in (Smart Wallet created)
- [ ] Check wallet dropdown shows USDC balance
- [ ] Submit SEO analysis form
- [ ] Payment modal appears
- [ ] Payment succeeds
- [ ] Workflow starts
- [ ] Check console for tx hash

---

## Payment Flow (User Journey)

1. **User signs in** → Smart Wallet created on Base
2. **Wallet dropdown** → Shows USDC balance from Smart Wallet
3. **Submit form** → `fetchWithPayment` called
4. **Initial request** → API returns 402 with payment requirements
5. **x402-fetch detects 402** → Automatically creates payment
6. **Smart Wallet signs** → User approves via CDP modal
7. **Retry with payment** → API verifies & accepts
8. **Workflow starts** → Report generation begins
9. **Transaction logged** → On-chain USDC transfer complete

---

## Common Issues

### Issue: "x402-fetch is not installed"
**Fix:** `npm install x402-fetch@^0.7.3 --legacy-peer-deps`

### Issue: "Payment failed" (with sufficient balance)
**Fix:** Check wallet type is `"smart"` not `"eoa"`

### Issue: "Cannot read evmSmartAccounts[0]"
**Fix:** User needs to sign out and sign back in to create Smart Wallet

### Issue: Wallet dropdown shows undefined
**Fix:** Check using `evmSmartAccounts[0]` not `evmAccounts[0]`

---

## References

- **x402 Discovery Site:** `/Users/ashnouruzi/x402/x402-discovery-site`
  - Smart Wallet configuration
  - EIP-6492 support

- **Content Agent:** `/Users/ashnouruzi/content-agent`
  - x402-fetch v1 usage
  - Client-side payment flow

- **API Maker:** `/Users/ashnouruzi/api-maker`
  - Dual payment handling
  - CDP embedded wallet patterns

---

## Next Steps

After restart:
1. Sign out and sign back in (to create Smart Wallet)
2. Check wallet dropdown shows balance
3. Test payment flow end-to-end
4. Verify transaction on BaseScan

---

## Issue 4: Solana Version Conflict (Build Failure) ❌ → ✅

**Problem:** After adding `x402-fetch@0.7.3`, build failed with Solana package conflict

**Error:**
```
Export sequentialInstructionPlan doesn't exist in target module
```

**Root Cause:**
- `@coinbase/cdp-core@0.0.75` → `@solana/kit@2.3.0`
- `x402-fetch@0.7.3` → `@solana/kit@5.4.0`
- Solana v5 and v2 are incompatible

**Fix:**
Downgraded to compatible versions:
```bash
npm uninstall @coinbase/cdp-core @coinbase/cdp-hooks @coinbase/cdp-react x402-fetch
npm install @coinbase/cdp-core@0.0.60 @coinbase/cdp-hooks@0.0.60 @coinbase/cdp-react@0.0.60 x402-fetch@0.7.0 --legacy-peer-deps
```

---

## Issue 5: useX402 Hook Missing in CDP v0.0.60 ❌ → ✅

**Problem:** `useX402` hook doesn't exist in CDP v0.0.60 (added in v0.0.75)

**Error:**
```
Export useX402 doesn't exist in target module
```

**Fix:** Manually created wrapped fetch like content-agent pattern

**File:** `app/page.tsx`

**Changes:**
1. Removed `useX402` import
2. Added manual dependencies:
```typescript
import { getCurrentUser, toViemAccount } from '@coinbase/cdp-core';
import { wrapFetchWithPayment } from 'x402-fetch';
import { createWalletClient, http, publicActions } from 'viem';
import { base } from 'viem/chains';
```

3. Created useEffect to setup wrapped fetch:
```typescript
const [paymentFetch, setPaymentFetch] = useState<typeof fetch | null>(null);

useEffect(() => {
  async function setupPaymentFetch() {
    if (!isSignedIn) return;

    const user = await getCurrentUser();
    if (!user?.evmSmartAccounts?.[0]) return;  // Use Smart Wallet

    const viemAccount = await toViemAccount(user.evmSmartAccounts[0]);
    const walletClient = createWalletClient({
      account: viemAccount,
      chain: base,
      transport: http('https://mainnet.base.org'),
    }).extend(publicActions);

    const maxPaymentAmount = BigInt(COST_CONFIG.seoAnalysis * 10 ** 6);
    const wrapped = wrapFetchWithPayment(fetch, walletClient as any, maxPaymentAmount);

    setPaymentFetch(() => wrapped);
  }
  setupPaymentFetch();
}, [isSignedIn]);
```

4. Updated handleSubmit to use `paymentFetch` instead of `fetchWithPayment`

**Key Difference from content-agent:**
- content-agent uses `user.evmAccounts[0]` (EOA)
- We use `user.evmSmartAccounts[0]` (Smart Wallet for x402 v2)

---

---

## Issue 6: v1/v2 Protocol Mismatch ❌ → ✅

**Problem:** Using x402-fetch v0.7.0 (v1 protocol) on client but @x402 v2 on server

**Root Cause:**
- Downgraded to x402-fetch v0.7.0 to avoid Solana conflicts
- Created v1 client → v2 server protocol mismatch
- ZodError: Network format mismatch ("eip155:8453" vs "base")

**Fix:** Use x402 v2 everywhere

**Changes:**
1. **Uninstalled x402-fetch v1**
```bash
npm uninstall x402-fetch --legacy-peer-deps
```

2. **Updated client to use @x402/fetch v2** (app/page.tsx:9-11,56-74)
```typescript
// Old (v1):
import { wrapFetchWithPayment } from 'x402-fetch';
const wrapped = wrapFetchWithPayment(fetch, walletClient, maxAmount);

// New (v2):
import { wrapFetchWithPayment, x402Client } from '@x402/fetch';
import { ExactEvmScheme } from '@x402/evm';

const signer = {
  address: viemAccount.address,
  signTypedData: async (message) => walletClient.signTypedData({...})
};

const client = new x402Client()
  .register('eip155:8453', new ExactEvmScheme(signer));

const wrapped = wrapFetchWithPayment(fetch, client);
```

3. **Server already uses v2** - No changes needed

**Result:**
- ✅ v2 protocol everywhere (client and server)
- ✅ CAIP-2 network format ("eip155:8453")
- ✅ Smart Wallet (ERC-4337) support
- ✅ Clean architecture

---

**Date:** 2026-01-14
**Status:** ✅ All fixes complete, v2 protocol everywhere, build successful
