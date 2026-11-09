import { LayoutGrid, Grid3X3 } from 'lucide-react';

type ViewType = 'product' | 'storefront';

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 border border-gray-300 rounded-lg p-1 bg-white w-fit">
      <button
        onClick={() => onViewChange('product')}
        className={`flex items-center gap-2 px-4 py-2 rounded transition-all font-medium text-sm ${
          currentView === 'product'
            ? 'bg-[#0B1F3A] text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
        title="View pricing by product"
      >
        <LayoutGrid className="w-4 h-4" />
        By Product
      </button>
      <button
        onClick={() => onViewChange('storefront')}
        className={`flex items-center gap-2 px-4 py-2 rounded transition-all font-medium text-sm ${
          currentView === 'storefront'
            ? 'bg-[#0B1F3A] text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
        title="View pricing by storefront"
      >
        <Grid3X3 className="w-4 h-4" />
        By Storefront
      </button>
    </div>
  );
}
