import React from 'react';
import { Download, Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  onExport?: () => void;
  exportLabel?: string;
}

export default function PageHeader({
  title,
  description,
  onAddNew,
  addNewLabel = 'Add New',
  onExport,
  exportLabel = 'Download Excel',
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3A]">{title}</h1>
        {description && <p className="text-gray-600 mt-1">{description}</p>}
      </div>
      <div className="flex gap-3">
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium"
          >
            <Download className="w-4 h-4" /> {exportLabel}
          </button>
        )}
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 bg-[#0B1F3A] text-white px-4 py-2 rounded-lg hover:bg-[#0B1F3A]/90 font-medium"
          >
            <Plus className="w-4 h-4" /> {addNewLabel}
          </button>
        )}
      </div>
    </div>
  );
}
