/**
 * Safely parses JSON with fallback value
 * Prevents workflow crashes from malformed LLM responses
 */
export function safeParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('[JSON] Parse error:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[JSON] Failed string (first 200 chars):', jsonString?.substring(0, 200));
    return fallback;
  }
}
