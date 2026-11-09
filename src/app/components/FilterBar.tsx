import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterDef {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

export function FilterBar({ search, onSearch, filters = [] }: { search: string; onSearch: (v: string) => void; filters?: FilterDef[] }) {
  return (
    <div className="flex flex-wrap gap-3 mb-5">
      <div className="relative flex-1 min-w-[200px] md:w-auto">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search…"
          className="pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] w-full md:w-64"
        />
        {search && <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13}/></button>}
      </div>
      {filters.map(f => (
        <div key={f.label} className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select value={f.value} onChange={e => f.onChange(e.target.value)}
            className="pl-8 pr-8 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] appearance-none bg-white">
            <option value="">{f.label}: All</option>
            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, count }: { title: string; subtitle?: string; count?: number }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F3A]">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-0.5 text-sm">{subtitle}</p>}
      </div>
      {count !== undefined && (
        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{count} records</span>
      )}
    </div>
  );
}

export default FilterBar;
