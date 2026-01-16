// JSON Schema for extracting SEO data from web pages
// Used with Hyperbrowser's structured JSON extraction

export const SEO_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "The page title (from <title> tag or meta og:title)"
    },
    metaDescription: {
      type: "string",
      description: "Meta description content"
    },
    h1: {
      type: "array",
      items: { type: "string" },
      description: "All H1 headings on the page"
    },
    h2: {
      type: "array",
      items: { type: "string" },
      description: "All H2 headings on the page"
    },
    h3: {
      type: "array",
      items: { type: "string" },
      description: "All H3 headings on the page"
    },
    wordCount: {
      type: "number",
      description: "Total word count of the main content"
    },
    internalLinks: {
      type: "number",
      description: "Count of internal links on the page"
    },
    externalLinks: {
      type: "number",
      description: "Count of external links on the page"
    },
    images: {
      type: "number",
      description: "Total number of images on the page"
    },
    hasSchema: {
      type: "boolean",
      description: "Whether the page has structured data (schema.org markup). Check for: 1) <script type='application/ld+json'> tags containing JSON-LD structured data, 2) HTML elements with itemscope/itemtype attributes for microdata, or 3) meta tags with schema.org properties. Return true if ANY structured data is found, false otherwise."
    },
    hasOpenGraph: {
      type: "boolean",
      description: "Whether the page has Open Graph meta tags. Check for <meta property='og:*'> tags (like og:title, og:description, og:image). Return true if ANY og: meta tags are found."
    },
    hasCanonical: {
      type: "boolean",
      description: "Whether the page has a canonical link tag. Check for <link rel='canonical' href='...'> in the <head>. Return true if found."
    },
    content: {
      type: "string",
      description: "Main text content of the page (cleaned, without HTML tags)"
    }
  },
  required: ["title", "h1", "h2", "wordCount"],
  additionalProperties: false
};

// TypeScript interface matching the schema
export interface SEOData {
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  h3: string[];
  wordCount: number;
  internalLinks: number;
  externalLinks: number;
  images: number;
  hasSchema: boolean;
  hasOpenGraph: boolean;
  hasCanonical: boolean;
  content: string;
}
