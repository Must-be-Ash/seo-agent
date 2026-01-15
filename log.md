[x402] Using CDP facilitator (v2)
[API] Payment required - returning 402
 POST /api/workflows/seo-analysis 402 in 212ms (compile: 206ms, render: 6ms)
[API] ✓ Payment verified from: 0xaE37d342353d9df938bCB75a70457cEb11945Bc6
[API] Creating initial report for: https://v0.app/
[API] Starting SEO analysis workflow
[API] ✓ Workflow started: wrun_01KF00H9HMPD37YAWXQAE66YVP
 POST /api/workflows/seo-analysis 200 in 269ms (compile: 3ms, render: 266ms)
 GET /report/seo_1768453350932_6ug6itcku 200 in 142ms (compile: 11ms, render: 131ms)
 POST /.well-known/workflow/v1/flow 200 in 220ms (compile: 133ms, render: 87ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 187ms (compile: 5ms, render: 182ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 23ms (compile: 3ms, render: 20ms)
[Workflow] Step 1: Fetching user site - https://v0.app/
[Step 1] Fetching user site: https://v0.app/
[x402 Client] Created v2 client for Hyperbrowser payments
[Hyperbrowser] Fetching page: https://v0.app/
[API] ✓ Payment settled: 0xbe9c4c416b37fb1508def03a1dc45bf07c394edb492fb94ea085f201d0d4a099
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 30ms (compile: 5ms, render: 25ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 31ms (compile: 4ms, render: 27ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 35ms (compile: 9ms, render: 27ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 24ms (compile: 3ms, render: 20ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 26ms (compile: 4ms, render: 22ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 31ms (compile: 7ms, render: 24ms)
[Hyperbrowser] Successfully fetched: v0 by Vercel - Build Agents, Apps, and Websites with AI
[Step 1] ✓ Fetched: v0 by Vercel - Build Agents, Apps, and Websites with AI (684 words)
 POST /.well-known/workflow/v1/step 200 in 6.9s (compile: 159ms, render: 6.8s)
 POST /.well-known/workflow/v1/flow 200 in 60ms (compile: 1300µs, render: 59ms)
[Workflow] Step 2: Discovering keywords
[Step 2] Discovering keywords from site content
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 174ms (compile: 3ms, render: 171ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 37ms (compile: 6ms, render: 31ms)
[Step 2] ✓ Discovered primary keyword: "AI website builder"
[Step 2] ✓ Secondary keywords: build apps with AI, create landing pages, AI templates for websites
 POST /.well-known/workflow/v1/step 200 in 1773ms (compile: 1132µs, render: 1772ms)
 POST /.well-known/workflow/v1/flow 200 in 60ms (compile: 1166µs, render: 58ms)
[Workflow] Step 3: Searching for competitors
[Step 3] Searching for competitors: "AI website builder"
[x402 Client] Created v2 client for Hyperbrowser payments
[Hyperbrowser] Searching for: "AI website builder" (page 1)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 25ms (compile: 3ms, render: 22ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 25ms (compile: 4ms, render: 21ms)
[Hyperbrowser] Found 10 results
[Step 3] ✓ Found 10 competitor pages
 POST /.well-known/workflow/v1/step 200 in 1788ms (compile: 1059µs, render: 1787ms)
 POST /.well-known/workflow/v1/flow 200 in 69ms (compile: 1513µs, render: 67ms)
[Workflow] Step 4: Fetching competitor data
[Step 4] Fetching 10 competitor pages
[x402 Client] Created v2 client for Hyperbrowser payments
[Hyperbrowser] Fetching 10 pages in parallel
[Hyperbrowser] Fetching page: https://www.design.com/ai-website-generator
[Hyperbrowser] Fetching page: https://www.wix.com/ai-website-builder
[Hyperbrowser] Fetching page: https://www.figma.com/solutions/ai-website-generator/
[Hyperbrowser] Fetching page: https://www.relume.io/
[Hyperbrowser] Fetching page: https://webflow.com/ai-site-builder
[Hyperbrowser] Fetching page: https://replit.com/usecases/ai-website-builder
[Hyperbrowser] Fetching page: https://www.techradar.com/pro/best-ai-website-builder
[Hyperbrowser] Fetching page: https://www.marketermilk.com/blog/best-ai-website-builder
[Hyperbrowser] Fetching page: https://zapier.com/blog/best-ai-website-builder/
[Hyperbrowser] Fetching page: https://usefulai.com/tools/ai-website-builders
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 21ms (compile: 2ms, render: 19ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 28ms (compile: 4ms, render: 24ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 45ms (compile: 5ms, render: 40ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 29ms (compile: 6ms, render: 23ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 23ms (compile: 3ms, render: 20ms)
[Hyperbrowser] Successfully fetched: 5 Best AI Website Builders in 2025
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 29ms (compile: 6ms, render: 24ms)
[Hyperbrowser] Successfully fetched: AI Website Builder: Create Websites From Text | Replit
[Hyperbrowser] Successfully fetched: The 4 best AI website builders in 2025
[Hyperbrowser] Successfully fetched: Free AI Website Generator | Figma
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 33ms (compile: 5ms, render: 27ms)
[Hyperbrowser] Successfully fetched: 10 best AI website builders I'm using in 2026 (free + paid) | Marketer Milk
[Hyperbrowser] Successfully fetched: The 9 best AI website builders in 2025: Tested, rated, and ranked | TechRadar
[Hyperbrowser] Successfully fetched: Relume — Websites designed & built faster with AI | AI website builder
[Hyperbrowser] Successfully fetched: Free AI Website Builder | Design.com
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 29ms (compile: 5ms, render: 24ms)
[Hyperbrowser] Successfully fetched: AI site builder — Build and launch faster with Webflow
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 29ms (compile: 4ms, render: 26ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 26ms (compile: 5ms, render: 21ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 35ms (compile: 7ms, render: 29ms)
[Hyperbrowser] Successfully fetched: AI Website Builder - Create A Website In Minutes | Wix
[Step 4] ✓ Successfully fetched 10 competitor pages
 POST /.well-known/workflow/v1/step 200 in 10.5s (compile: 1284µs, render: 10.5s)
 POST /.well-known/workflow/v1/flow 200 in 69ms (compile: 1350µs, render: 67ms)
[Workflow] Step 5: Analyzing patterns
[Step 5] Analyzing patterns in competitor data
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 47ms (compile: 5ms, render: 42ms)
[Step 5] ✓ Average metrics: 1718 words, 9 H2s
[Step 5] ✓ Common topics: How to create a website with AI, Get started for free, Customization options, AI tools for website building, FAQs, Responsive design, Features of AI website builders, User experience and support, Collaboration and community involvement
 POST /.well-known/workflow/v1/step 200 in 1636ms (compile: 1043µs, render: 1635ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 58ms (compile: 3ms, render: 55ms)
 POST /.well-known/workflow/v1/flow 200 in 85ms (compile: 2ms, render: 83ms)
[Workflow] Step 6: Identifying gaps
[Step 6] Identifying SEO gaps
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 48ms (compile: 6ms, render: 43ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 65ms (compile: 3ms, render: 62ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 73ms (compile: 4ms, render: 69ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 46ms (compile: 5ms, render: 42ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 56ms (compile: 4ms, render: 52ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 58ms (compile: 4ms, render: 54ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 52ms (compile: 3ms, render: 49ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 66ms (compile: 5ms, render: 62ms)
GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 45ms (compile: 3ms, render: 42ms)
[Step 6] ✓ Identified 6 SEO gaps
 POST /.well-known/workflow/v1/step 200 in 10.8s (compile: 3ms, render: 10.8s)
 POST /.well-known/workflow/v1/flow 200 in 80ms (compile: 1394µs, render: 78ms)
[Workflow] Step 7: Generating recommendations
[Step 7] Generating recommendations
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 56ms (compile: 3ms, render: 53ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 58ms (compile: 3ms, render: 54ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 87ms (compile: 6ms, render: 81ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 60ms (compile: 3ms, render: 57ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 58ms (compile: 3ms, render: 55ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 64ms (compile: 4ms, render: 60ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 57ms (compile: 3ms, render: 54ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 171ms (compile: 4ms, render: 167ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 57ms (compile: 2ms, render: 55ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 63ms (compile: 4ms, render: 59ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 59ms (compile: 3ms, render: 56ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 61ms (compile: 4ms, render: 57ms)
GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 59ms (compile: 3ms, render: 56ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 61ms (compile: 4ms, render: 57ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 94ms (compile: 3ms, render: 91ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 59ms (compile: 3ms, render: 56ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 64ms (compile: 5ms, render: 59ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 78ms (compile: 14ms, render: 64ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 60ms (compile: 3ms, render: 57ms)
[Step 7] ✓ Generated recommendations (2 high priority)
 POST /.well-known/workflow/v1/step 200 in 16.8s (compile: 1499µs, render: 16.8s)
 POST /.well-known/workflow/v1/flow 200 in 103ms (compile: 1538µs, render: 101ms)
[Workflow] Step 8: Calculating overall SEO score
 POST /.well-known/workflow/v1/step 200 in 82ms (compile: 1301µs, render: 80ms)
 POST /.well-known/workflow/v1/flow 200 in 70ms (compile: 765µs, render: 69ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 57ms (compile: 2ms, render: 55ms)
[Workflow] Fetching report from database
 POST /.well-known/workflow/v1/step 200 in 111ms (compile: 637µs, render: 110ms)
 POST /.well-known/workflow/v1/flow 200 in 76ms (compile: 1271µs, render: 75ms)
[Workflow] Step 9: Generating structured report data
[Step 8] Generating structured report data
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 65ms (compile: 8ms, render: 58ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 60ms (compile: 3ms, render: 57ms)
[Step 8] ✓ Generated structured report data
 POST /.well-known/workflow/v1/step 200 in 2.6s (compile: 1111µs, render: 2.6s)
 POST /.well-known/workflow/v1/flow 200 in 83ms (compile: 1220µs, render: 81ms)
[Workflow] Finalizing report
[Workflow] ✓ SEO Analysis completed successfully
 POST /.well-known/workflow/v1/step 200 in 80ms (compile: 1205µs, render: 79ms)
 GET /api/report/seo_1768453350932_6ug6itcku/status 200 in 56ms (compile: 3ms, render: 53ms)
 POST /.well-known/workflow/v1/flow 200 in 77ms (compile: 862µs, render: 76ms)
 GET /api/report/seo_1768453350932_6ug6itcku 200 in 729ms (compile: 671ms, render: 59ms)
 GET /api/report/seo_1768453350932_6ug6itcku 200 in 62ms (compile: 3ms, render: 59ms)
