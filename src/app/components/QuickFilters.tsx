import React from 'react';

interface QuickFilterItem {
  label: string;
  value: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

interface QuickFilterProps {
  filters?: QuickFilterItem[];
}

export default function QuickFilters({ filters }: QuickFilterProps) {
  if (!filters || filters.length === 0) return null;

  return (
    <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      {filters.map(f => (
        <button key={f.value} onClick={f.onClick} className={`flex items-center justify-between bg-white border ${f.active ? 'bg-[#0B1F3A] text-white' : 'border-gray-100 text-gray-700 hover:bg-gray-50'} p-3 rounded-lg`}>
          <div className="text-left">
            <div className="text-xs opacity-80">{f.label}</div>
            <div className="text-sm font-semibold">{f.count ?? '-'}</div>
          </div>
          <div className="text-xs text-gray-400">▸</div>
        </button>
      ))}
    </div>
  );
}
