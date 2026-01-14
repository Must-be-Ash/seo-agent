// CSS styles to be injected into generated HTML reports
export const REPORT_STYLES = `
<style>
  /* Reset and base styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #0f172a;
    background: #ffffff;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Typography */
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #0f172a;
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 600;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    color: #0f172a;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: #334155;
  }

  p {
    margin-bottom: 1rem;
    color: #475569;
  }

  /* Executive Summary */
  .executive-summary {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-left: 4px solid #000;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
  }

  .executive-summary h2 {
    margin-top: 0;
    border-bottom: none;
  }

  /* Score Badge */
  .score-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    font-size: 2rem;
    font-weight: 700;
    margin: 1rem 0;
  }

  .score-high {
    background: #d1fae5;
    color: #065f46;
  }

  .score-medium {
    background: #fef3c7;
    color: #92400e;
  }

  .score-low {
    background: #fee2e2;
    color: #991b1b;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  thead {
    background: #f8fafc;
  }

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #0f172a;
    border-bottom: 2px solid #e2e8f0;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: #f8fafc;
  }

  /* Gap Severity Badges */
  .gap-item {
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 0.5rem;
    border-left: 4px solid;
  }

  .gap-high {
    background: #fef2f2;
    border-left-color: #dc2626;
  }

  .gap-medium {
    background: #fffbeb;
    border-left-color: #f59e0b;
  }

  .gap-low {
    background: #f0fdf4;
    border-left-color: #10b981;
  }

  .severity-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .severity-high {
    background: #dc2626;
    color: #ffffff;
  }

  .severity-medium {
    background: #f59e0b;
    color: #ffffff;
  }

  .severity-low {
    background: #10b981;
    color: #ffffff;
  }

  /* Metrics Cards */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .metric-card {
    background: #f8fafc;
    padding: 1.25rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .metric-label {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
  }

  /* Collapsible Sections */
  details {
    margin: 1rem 0;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  summary {
    padding: 1rem;
    background: #f8fafc;
    cursor: pointer;
    font-weight: 600;
    user-select: none;
  }

  summary:hover {
    background: #f1f5f9;
  }

  details[open] summary {
    border-bottom: 1px solid #e2e8f0;
  }

  details > div {
    padding: 1rem;
  }

  /* Lists */
  ul, ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }

  li {
    margin-bottom: 0.5rem;
    color: #475569;
  }

  /* Recommendations */
  .recommendation-section {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
  }

  .priority-high {
    border-left: 4px solid #dc2626;
  }

  .priority-medium {
    border-left: 4px solid #f59e0b;
  }

  .priority-low {
    border-left: 4px solid #10b981;
  }

  /* Code blocks */
  code {
    background: #f1f5f9;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
  }

  pre {
    background: #0f172a;
    color: #f8fafc;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;
  }

  pre code {
    background: transparent;
    color: inherit;
  }

  /* Print styles */
  @media print {
    body {
      padding: 0;
      max-width: none;
    }

    .no-print {
      display: none;
    }

    h2 {
      page-break-after: avoid;
    }

    table, .gap-item, .metric-card {
      page-break-inside: avoid;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    body {
      padding: 1rem;
    }

    h1 {
      font-size: 2rem;
    }

    h2 {
      font-size: 1.5rem;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }

    table {
      font-size: 0.875rem;
    }

    th, td {
      padding: 0.75rem 0.5rem;
    }
  }

  /* Status indicators */
  .status-icon {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    margin-right: 0.5rem;
  }

  .status-good {
    background: #10b981;
  }

  .status-warning {
    background: #f59e0b;
  }

  .status-bad {
    background: #dc2626;
  }

  /* Comparison indicators */
  .comparison {
    font-weight: 600;
  }

  .comparison-above {
    color: #10b981;
  }

  .comparison-below {
    color: #dc2626;
  }

  .comparison-equal {
    color: #64748b;
  }
</style>
`;
