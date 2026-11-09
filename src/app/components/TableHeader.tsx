import React from 'react';
import { Download, Search } from 'lucide-react';

interface StatusOption { value: string; label: string }

export default function TableHeader(props: {
  title: string;
  count?: number;
  query: string;
  setQuery: (q: string) => void;
  status: string;
  setStatus: (s: string) => void;
  statusOptions?: StatusOption[];
  onExport?: () => void;
  showExport?: boolean;
}) {
  const { title, count, query, setQuery, status, setStatus, statusOptions = [], onExport, showExport = false } = props;

  return (
    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-[#0B1F3A]">{title}{typeof count === 'number' ? ` (${count})` : ''}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`} className="pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-sm w-64" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded-md px-2 py-2 text-sm">
          <option value="all">All status</option>
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {showExport && (
          <button onClick={onExport} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export
          </button>
        )}
      </div>
    </div>
  );
}
