'use client';

interface ContentOutlineProps {
  recommendedH1: string;
  h2Sections: Array<{
    title: string;
    estimatedWordCount: number;
    description: string;
  }>;
  totalEstimatedWordCount: number;
}

export function ContentOutline({
  recommendedH1,
  h2Sections,
  totalEstimatedWordCount,
}: ContentOutlineProps) {
  return (
    <div className="rounded-2xl p-8 border" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
      <h2 className="text-2xl font-bold mb-8" style={{ color: '#FFFFFF' }}>Content Outline for Improving Page</h2>

      <div className="mb-8 p-6 rounded-xl border" style={{ backgroundColor: '#222222', borderColor: '#2A2A2A' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#666666' }}>Recommended H1</p>
        <h3 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
          {recommendedH1 || 'Comprehensive Guide'}
        </h3>
      </div>

      <div className="space-y-3 mb-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>H2 Sections</h3>
        {h2Sections.length > 0 ? h2Sections.map((section, index) => (
          <div
            key={index}
            className="p-5 rounded-lg border transition-colors"
            style={{ backgroundColor: '#222222', borderColor: '#2A2A2A' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#333333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2A2A2A';
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <h4 className="font-semibold text-base flex-1" style={{ color: '#FFFFFF' }}>{section.title}</h4>
              <span className="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap" style={{ backgroundColor: '#2A2A2A', color: '#CCCCCC' }}>
                ~{section.estimatedWordCount} words
              </span>
            </div>
            {section.description && (
              <p className="text-sm mt-2 leading-relaxed" style={{ color: '#888888' }}>{section.description}</p>
            )}
          </div>
        )) : (
          <div className="p-5 rounded-lg border text-center" style={{ backgroundColor: '#222222', borderColor: '#2A2A2A', color: '#888888' }}>
            No H2 sections defined in the content outline.
          </div>
        )}
      </div>

      <div className="mt-8 p-6 rounded-xl border" style={{ backgroundColor: '#222222', borderColor: '#2A2A2A' }}>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>Total Estimated Word Count</span>
          <span className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>{totalEstimatedWordCount.toLocaleString()} words</span>
        </div>
      </div>
    </div>
  );
}
