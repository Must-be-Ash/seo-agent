
[x402] Using CDP facilitator (v2)
[API] Payment required - returning 402
 POST /api/workflows/seo-analysis 402 in 727ms (compile: 718ms, render: 10ms)
[API] ✓ Payment verified from: 0xaE37d342353d9df938bCB75a70457cEb11945Bc6
[API] Creating initial report for: https://www.slophub.xyz/
[API] Starting SEO analysis workflow
[API] ✓ Workflow started: wrun_01KEZQA98VNGMPAGT7ZY2MA7H2
 POST /api/workflows/seo-analysis 200 in 356ms (compile: 3ms, render: 352ms)
 POST /.well-known/workflow/v1/flow 200 in 331ms (compile: 266ms, render: 64ms)
[Workflow] Step 1: Fetching user site - https://www.slophub.xyz/
[Step 1] Fetching user site: https://www.slophub.xyz/
[x402 Client] Created v2 client for Hyperbrowser payments
[Hyperbrowser] Fetching page: https://www.slophub.xyz/
[API] ✓ Payment settled: 0x8d2407cf957c678e74ec66fc1aaf45cccd9ff86a1e7ba41a42c464f94fcb1c78
 GET /report/wrun_01KEZQA98VNGMPAGT7ZY2MA7H2 200 in 1587ms (compile: 1553ms, render: 34ms)
[Hyperbrowser] Successfully fetched: Slophub - Landing Page Generator
[Step 1] ✓ Fetched:  (48 words)
 POST /.well-known/workflow/v1/step 200 in 19.3s (compile: 270ms, render: 19.1s)
 POST /.well-known/workflow/v1/flow 200 in 64ms (compile: 1680µs, render: 63ms)
[Workflow] Step 2: Discovering keywords
[Step 2] Discovering keywords from site content
[Step 2] ✓ Discovered primary keyword: "landing page generator"
[Step 2] ✓ Secondary keywords: conversion-focused landing pages, campaign landing pages, brand-consistent CTAs
 POST /.well-known/workflow/v1/step 200 in 3.6s (compile: 1370µs, render: 3.6s)
 POST /.well-known/workflow/v1/flow 200 in 61ms (compile: 1522µs, render: 59ms)
[Workflow] Step 3: Searching for competitors
[Step 3] Searching for competitors: "landing page generator"
[x402 Client] Created v2 client for Hyperbrowser payments
[Hyperbrowser] Searching for: "landing page generator" (page 1)
[Hyperbrowser] Found 10 results
[Step 3] ✓ Found 10 competitor pages
 POST /.well-known/workflow/v1/step 200 in 6.3s (compile: 909µs, render: 6.3s)
 POST /.well-known/workflow/v1/flow 200 in 77ms (compile: 3ms, render: 75ms)
[Workflow] Step 4: Fetching competitor data
[Step 4] Fetching 10 competitor pages
[x402 Client] Created v2 client for Hyperbrowser payments
[Hyperbrowser] Fetching 10 pages in parallel
[Hyperbrowser] Fetching page: https://www.canva.com/create/landing-pages/
[Hyperbrowser] Fetching page: https://www.wix.com/landing-page-builder
[Hyperbrowser] Fetching page: https://codedesign.ai/ai-landingpage-generator
[Hyperbrowser] Fetching page: https://ahrefs.com/writing-tools/landing-page-generator
[Hyperbrowser] Fetching page: https://makelanding.ai/
[Hyperbrowser] Fetching page: https://unbounce.com/
[Hyperbrowser] Fetching page: https://blink.new/explore/landing-page
[Hyperbrowser] Fetching page: https://www.websiteplanet.com/blog/best-really-free-landing-page-builders/
[Hyperbrowser] Fetching page: https://www.ucraft.com/free-landing-page-creator
[Hyperbrowser] Fetching page: https://www.renderforest.com/landing-page-builder
[Hyperbrowser] Successfully fetched: Build Beautiful Landing Pages Instantly With AI | Makelanding
[Hyperbrowser] Successfully fetched: 10 Best (REALLY FREE) Landing Page Builders in 2026
[Hyperbrowser] Successfully fetched: Free Website Landing Page Builder & Creator | Canva
[Hyperbrowser] Successfully fetched: Free Landing Page Creator | next-test-1
[Hyperbrowser] Successfully fetched: Ai landing page generator
[Hyperbrowser] Successfully fetched: The Best Landing Page Builder and CRO platform | Unbounce
[Hyperbrowser] Successfully fetched: Free Landing Page Builder | Renderforest
[Hyperbrowser] Successfully fetched: Build a Landing Page with AI | Free Landing Page Builder | Blink
[Hyperbrowser] Successfully fetched: Free AI Landing Page Generator
[Hyperbrowser] Successfully fetched: Free Landing Page Builder | Create a Landing Page | Wix.com
[Step 4] ✓ Successfully fetched 10 competitor pages
 POST /.well-known/workflow/v1/step 200 in 50s (compile: 796µs, render: 50s)
 POST /.well-known/workflow/v1/flow 200 in 74ms (compile: 1237µs, render: 73ms)
[Workflow] Step 5: Analyzing patterns
[Step 5] Analyzing patterns in competitor data
[Step 5] ✓ Average metrics: 1127 words, 8 H2s
[Step 5] ✓ Common topics: Landing page creation, AI landing page generation, Customization and templates, Marketing tools integration, Conversion optimization, Building for specific intents or goals, User-friendly design without coding, FAQs and support resources
 POST /.well-known/workflow/v1/step 200 in 2.0s (compile: 913µs, render: 2.0s)
 POST /.well-known/workflow/v1/flow 200 in 76ms (compile: 1102µs, render: 75ms)
[Workflow] Step 6: Identifying gaps
[Step 6] Identifying SEO gaps
[Step 6] ✓ Identified 5 SEO gaps
 POST /.well-known/workflow/v1/step 200 in 8.4s (compile: 899µs, render: 8.4s)
 POST /.well-known/workflow/v1/flow 200 in 80ms (compile: 3ms, render: 77ms)
[Workflow] Step 7: Generating recommendations
[Step 7] Generating recommendations
[Step 7] ✓ Generated recommendations (3 high priority)
 POST /.well-known/workflow/v1/step 200 in 15.6s (compile: 946µs, render: 15.6s)
 POST /.well-known/workflow/v1/flow 200 in 79ms (compile: 1401µs, render: 78ms)
[Workflow] Step 8: Calculating overall SEO score
 POST /.well-known/workflow/v1/step 200 in 78ms (compile: 814µs, render: 77ms)
 POST /.well-known/workflow/v1/flow 200 in 69ms (compile: 744µs, render: 68ms)
[Workflow] Step 9: Generating HTML report
[Step 8] Generating HTML report
[Step 8] ✓ Generated HTML report with styles
 POST /.well-known/workflow/v1/step 200 in 25.5s (compile: 755µs, render: 25.5s)
 POST /.well-known/workflow/v1/flow 200 in 86ms (compile: 1649µs, render: 85ms)
[Workflow] Finalizing report
[Workflow] ✓ SEO Analysis completed successfully
 POST /.well-known/workflow/v1/step 200 in 77ms (compile: 808µs, render: 76ms)
 POST /.well-known/workflow/v1/flow 200 in 76ms (compile: 713µs, render: 75ms)
 GET /report/wrun_01KEZQA98VNGMPAGT7ZY2MA7H2 404 in 77ms (compile: 23ms, render: 55ms)
