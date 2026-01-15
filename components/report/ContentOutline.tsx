'use client';

import { FileText, Hash } from 'lucide-react';

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
    <div className="bg-white rounded-2xl p-8 border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-slate-600" />
        <h2 className="text-2xl font-bold text-slate-900">Content Outline for Improving Page</h2>
      </div>

      <div className="mb-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Hash className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Recommended H1</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">
          {recommendedH1 || 'Comprehensive Guide'}
        </h3>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">H2 Sections</h3>
        {h2Sections.length > 0 ? h2Sections.map((section, index) => (
          <div
            key={index}
            className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <h4 className="font-semibold text-lg text-slate-900 flex-1">{section.title}</h4>
              <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-medium whitespace-nowrap">
                ~{section.estimatedWordCount} words
              </span>
            </div>
            {section.description && (
              <p className="text-slate-600 text-sm mt-2">{section.description}</p>
            )}
          </div>
        )) : (
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-center">
            No H2 sections defined in the content outline.
          </div>
        )}
      </div>

      <div className="mt-8 p-6 bg-slate-900 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Total Estimated Word Count</span>
          <span className="text-3xl font-bold">{totalEstimatedWordCount.toLocaleString()} words</span>
        </div>
      </div>
    </div>
  );
}
