'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { ArrowRight, Search } from 'lucide-react';
import { useIsSignedIn, useX402 } from '@coinbase/cdp-hooks';
import { COST_CONFIG } from '@/lib/config';
import { validateUrl } from '@/lib/validation';
import { Header } from '@/components/Header';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const authButtonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isSignedIn } = useIsSignedIn();
  const { fetchWithPayment } = useX402();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate URL
    const urlError = validateUrl(url);
    if (urlError) {
      setError(urlError);
      return;
    }

    // Check if signed in
    if (!isSignedIn) {
      setError('Please sign in to continue');
      // Trigger auth modal
      setTimeout(() => {
        const authButton = document.querySelector('[data-testid="cdp-auth-button"]') as HTMLButtonElement;
        if (authButton) authButton.click();
      }, 100);
      return;
    }

    setLoading(true);

    try {
      console.log('[SEO Analysis] Starting analysis for:', url);
      console.log('[Payment] Using CDP x402 hook for payment handling');

      // Use fetchWithPayment from CDP hooks - automatically handles x402 payment flow
      const response = await fetchWithPayment('/api/workflows/seo-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          userId: 'user-placeholder', // Can be enhanced later
        }),
      });

      console.log('[Workflow] Response status:', response.status);

      // Handle response
      if (response.status === 402) {
        console.warn('[Payment] Payment required (402), CDP hook will handle automatically');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start analysis');
      }

      const { runId } = await response.json();
      console.log('[Workflow] ✓ Analysis started:', runId);

      // Redirect to report page
      router.push(`/report/${runId}`);

    } catch (error) {
      console.error('[Client] Failed to start analysis:', error);

      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        if (error.message.includes('402') || error.message.includes('Payment')) {
          errorMessage = `Payment failed. Please ensure you have sufficient USDC balance ($${COST_CONFIG.seoAnalysis}) on Base network.`;
        } else if (error.message.includes('rejected')) {
          errorMessage = 'Payment was rejected by your wallet';
        } else if (error.message.includes('Insufficient funds')) {
          errorMessage = `Insufficient USDC balance. You need at least $${COST_CONFIG.seoAnalysis} USDC on Base.`;
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Discover Your SEO Gaps
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Analyze competitor SEO and find content opportunities
          </p>
          <p className="text-sm text-slate-500">
            Powered by Hyperbrowser x402 • Just ${COST_CONFIG.seoAnalysis} USDC
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            {/* URL Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Website URL to Analyze
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="https://example.com"
                  disabled={loading}
                  className={`w-full pl-12 pr-4 py-4 text-lg rounded-xl border-2 transition-all
                    ${focused ? 'border-black ring-4 ring-black/5' : 'border-slate-200'}
                    ${error ? 'border-red-500' : ''}
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none`}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  {error}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="mt-6 w-full py-4 px-6 bg-black text-white rounded-xl font-medium text-lg
                hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <TextShimmer className="text-lg font-medium">
                  Analyzing your site...
                </TextShimmer>
              ) : (
                <>
                  Generate SEO Report (${COST_CONFIG.seoAnalysis} USDC)
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Discover Keywords',
              description: 'AI automatically identifies your target keywords from your content',
            },
            {
              title: 'Analyze Competitors',
              description: 'Fetches and analyzes top 10 ranking pages with structured data',
            },
            {
              title: 'Actionable Insights',
              description: 'Get specific recommendations to improve your SEO rankings',
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
