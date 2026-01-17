export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  // Add https:// if no protocol is present
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function validateUrl(url: string): string | null {
  if (!url.trim()) return 'URL is required';

  const normalized = normalizeUrl(url);

  try {
    const parsed = new URL(normalized);
    if (!parsed.protocol.startsWith('http')) {
      return 'URL must start with http:// or https://';
    }

    // Ensure domain has a valid TLD (contains at least one dot)
    // Examples: "v0.app" ✓, "example.com" ✓, "v0" ✗, "localhost" ✗
    const hostname = parsed.hostname;
    if (!hostname.includes('.')) {
      return 'Please enter a valid domain with TLD (e.g., v0.app, not just v0)';
    }

    // Check that TLD is at least 2 characters (e.g., .co, .com, .app)
    const parts = hostname.split('.');
    const tld = parts[parts.length - 1];
    if (tld.length < 2) {
      return 'Please enter a valid domain with a proper TLD (e.g., .com, .app)';
    }

    return null;
  } catch {
    return 'Please enter a valid URL (e.g., example.com or https://example.com)';
  }
}
