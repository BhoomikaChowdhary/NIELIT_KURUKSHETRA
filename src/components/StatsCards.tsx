import React from 'react';

interface Stats {
  total_uploaded: number;
  processed: number;
  photos_extracted: number;
  signatures_extracted: number;
}

export default function StatsCards({ stats }: { stats: Stats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="gov-panel p-4 border-l-4 border-gray-200 animate-pulse">
            <div className="h-2 w-16 bg-gray-200 mb-2"></div>
            <div className="h-6 w-8 bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  const remaining = (stats.total_uploaded || 0) - (stats.processed || 0);

  const cards = [
    { label: 'Total Uploaded', value: stats.total_uploaded || 0, color: 'border-blue-600' },
    { label: 'Processed', value: stats.processed || 0, color: 'border-green-600' },
    { label: 'Remaining', value: remaining, color: 'border-orange-600' },
    { label: 'Photos', value: stats.photos_extracted || 0, color: 'border-indigo-600' },
    { label: 'Signatures', value: stats.signatures_extracted || 0, color: 'border-purple-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`gov-panel p-4 border-l-4 ${card.color}`}>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
          <p className="text-2xl font-bold text-gov-text">{card.value || 0}</p>
        </div>
      ))}
    </div>
  );
}
