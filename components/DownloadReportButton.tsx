'use client';

import { Download } from 'lucide-react';
import type { StructuredReportData } from '@/types/report-data';

interface DownloadReportButtonProps {
  reportData: StructuredReportData;
  userUrl: string;
  runId: string;
}

export function DownloadReportButton({ reportData, userUrl, runId }: DownloadReportButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
      style={{
        backgroundColor: '#3A3A3A',
        color: '#FFFFFF',
        border: '1px solid #4A4A4A'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#4A4A4A';
        e.currentTarget.style.borderColor = '#5A5A5A';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#3A3A3A';
        e.currentTarget.style.borderColor = '#4A4A4A';
      }}
    >
      <Download className="w-4 h-4" />
      <span>Print / Download Report</span>
    </button>
  );
}
