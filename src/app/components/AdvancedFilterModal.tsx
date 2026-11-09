import { useState } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';

interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'greater' | 'less' | 'between';
  value: string | number;
  value2?: string | number; // For 'between' operator
}

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterConfig[]) => void;
  availableFields: Array<{name: string; type: 'text' | 'number' | 'date' | 'select'; options?: string[]}>;
  title?: string;
}

export function AdvancedFilterModal({
  isOpen,
  onClose,
  onApply,
  availableFields,
  title = 'Advanced Filters'
}: AdvancedFilterModalProps) {
  const [filters, setFilters] = useState<FilterConfig[]>([{field: '', operator: 'equals', value: ''}]);

  if (!isOpen) return null;

  const addFilter = () => {
    setFilters([...filters, {field: '', operator: 'equals', value: ''}]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<FilterConfig>) => {
    const newFilters = [...filters];
    newFilters[index] = {...newFilters[index], ...updates};
    setFilters(newFilters);
  };

  const handleApply = () => {
    const validFilters = filters.filter(f => f.field && f.value !== '');
    onApply(validFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters([{field: '', operator: 'equals', value: ''}]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Filter size={20}/>
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {filters.map((filter, index) => (
            <div key={index} className="flex gap-3 items-end p-3 bg-gray-50 rounded-lg">
              <select
                value={filter.field}
                onChange={(e) => updateFilter(index, {field: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="">Select field</option>
                {availableFields.map(f => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </select>

              <select
                value={filter.operator}
                onChange={(e) => updateFilter(index, {operator: e.target.value as any})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="startsWith">Starts with</option>
                <option value="greater">Greater than</option>
                <option value="less">Less than</option>
                <option value="between">Between</option>
              </select>

              <input
                type={filter.operator === 'between' ? 'number' : 'text'}
                placeholder="Value"
                value={filter.value}
                onChange={(e) => updateFilter(index, {value: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />

              {filter.operator === 'between' && (
                <input
                  type="number"
                  placeholder="To"
                  value={filter.value2 || ''}
                  onChange={(e) => updateFilter(index, {value2: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              )}

              {filters.length > 1 && (
                <button
                  onClick={() => removeFilter(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X size={18}/>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-3">
          <button
            onClick={addFilter}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white font-medium"
          >
            + Add Filter
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white font-medium flex items-center justify-center gap-2"
            >
              <RotateCcw size={18}/>
              Reset
            </button>
            <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white font-medium">
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
