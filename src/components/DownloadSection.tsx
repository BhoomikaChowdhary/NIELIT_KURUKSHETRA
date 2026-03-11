import React from 'react';
import { Download, FileSpreadsheet, ExternalLink } from 'lucide-react';

export default function DownloadSection() {
  const handleDownload = () => {
    window.open('/api/download-excel', '_blank');
  };

  return (
    <div id="reports" className="gov-panel p-6">
      <h2 className="gov-title">Reports and Downloads</h2>

      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-[#f8f9fa] border border-gov-border">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="p-3 bg-white border border-gov-border">
            <FileSpreadsheet className="w-8 h-8 text-green-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gov-text">Extracted Dataset (Excel)</h3>
            <p className="text-xs text-gray-600">Complete structured data from all processed application forms.</p>
          </div>
        </div>
        
        <button 
          onClick={handleDownload}
          className="gov-button bg-green-700 hover:bg-green-800"
        >
          Download Excel Dataset
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 border border-gov-border flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3">
            <ExternalLink className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-bold text-gov-text">View Processing Logs</span>
          </div>
          <span className="text-[10px] text-gov-blue font-bold uppercase">Open</span>
        </div>
        <div className="p-3 border border-gov-border flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3">
            <ExternalLink className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-bold text-gov-text">System Performance Metrics</span>
          </div>
          <span className="text-[10px] text-gov-blue font-bold uppercase">Open</span>
        </div>
      </div>
    </div>
  );
}
