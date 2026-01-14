// Hyperbrowser API utilities for x402 endpoints
// API Endpoints:
// - Search: https://api.hyperbrowser.ai/x402/web/search
// - Fetch: https://api.hyperbrowser.ai/x402/web/fetch

const HYPERBROWSER_SEARCH_ENDPOINT = 'https://api.hyperbrowser.ai/x402/web/search';
const HYPERBROWSER_FETCH_ENDPOINT = 'https://api.hyperbrowser.ai/x402/web/fetch';

// Types for Hyperbrowser responses
export interface SearchResult {
  title: string;
  url: string;
  description: string;
}

export interface SearchResponse {
  status: 'completed' | 'pending' | 'failed';
  data: {
    query: string;
    results: SearchResult[];
  };
}

export interface FetchResponse {
  status: 'completed' | 'pending' | 'failed';
  data: {
    metadata: {
      sourceURL: string;
      title: string;
      url: string;
    };
    markdown?: string;
    html?: string;
    links?: string[];
    screenshot?: string;
    json?: any;
  };
}

/**
 * Search the web using Hyperbrowser x402 endpoint
 * @param query - The search query
 * @param page - Page number (default: 1)
 * @param fetchFunc - Optional custom fetch function (for x402 payment wrapper)
 * @returns Search results
 */
export async function searchWeb(
  query: string,
  page: number = 1,
  fetchFunc: typeof fetch = fetch
): Promise<SearchResult[]> {
  console.log(`[Hyperbrowser] Searching for: "${query}" (page ${page})`);

  const response = await fetchFunc(HYPERBROWSER_SEARCH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, page }),
  });

  if (!response.ok) {
    throw new Error(`Hyperbrowser search failed: ${response.status} ${response.statusText}`);
  }

  const result: SearchResponse = await response.json();
  console.log(`[Hyperbrowser] Found ${result.data.results.length} results`);

  return result.data.results;
}

/**
 * Fetch a page with structured JSON extraction using Hyperbrowser x402 endpoint
 * @param url - The URL to fetch
 * @param schema - JSON schema for structured data extraction
 * @param fetchFunc - Optional custom fetch function (for x402 payment wrapper)
 * @returns Extracted structured data
 */
export async function fetchPageData<T = any>(
  url: string,
  schema: any,
  fetchFunc: typeof fetch = fetch
): Promise<T> {
  console.log(`[Hyperbrowser] Fetching page: ${url}`);

  const response = await fetchFunc(HYPERBROWSER_FETCH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      outputs: {
        formats: [
          {
            type: 'json',
            schema,
          },
        ],
      },
      stealth: 'auto', // Use stealth mode to avoid detection
      navigation: {
        waitUntil: 'networkidle', // Wait for dynamic content to load
        waitFor: 2000, // Additional wait time for lazy-loaded content
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Hyperbrowser fetch failed: ${response.status} ${response.statusText}`);
  }

  const result: FetchResponse = await response.json();
  console.log(`[Hyperbrowser] Successfully fetched: ${result.data.metadata.title}`);

  return result.data.json as T;
}

/**
 * Fetch multiple pages in parallel with structured extraction
 * @param urls - Array of URLs to fetch
 * @param schema - JSON schema for structured data extraction
 * @param fetchFunc - Optional custom fetch function (for x402 payment wrapper)
 * @returns Array of extracted data (failed fetches return null)
 */
export async function fetchMultiplePages<T = any>(
  urls: string[],
  schema: any,
  fetchFunc: typeof fetch = fetch
): Promise<(T | null)[]> {
  console.log(`[Hyperbrowser] Fetching ${urls.length} pages in parallel`);

  const results = await Promise.allSettled(
    urls.map(url => fetchPageData<T>(url, schema, fetchFunc))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`[Hyperbrowser] Failed to fetch ${urls[index]}:`, result.reason);
      return null;
    }
  });
}
