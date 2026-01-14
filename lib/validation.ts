export function validateUrl(url: string): string | null {
  if (!url.trim()) return 'URL is required';
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith('http')) {
      return 'URL must start with http:// or https://';
    }
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
}
