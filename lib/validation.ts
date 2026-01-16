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
    return null;
  } catch {
    return 'Please enter a valid URL (e.g., example.com or https://example.com)';
  }
}
