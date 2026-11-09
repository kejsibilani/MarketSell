/**
 * UNIFIED REUSABLE TABLE COMPONENT
 * Used across all pages (Operators, Sellers, Agents) for:
 * - Sales Orders
 * - Shipments
 * - Transformations
 * - SKUs
 * - Stock
 */

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Download, Filter } from 'lucide-react';
import type { TableColumn, SortConfig, FilterConfig } from '../types/unified';

interface UnifiedTableProps<T> {
  // Data
  data: T[];
  columns: TableColumn<T>[];
  
  // Features
  expandable?: boolean;
  renderExpandedRow?: (item: T, index: number) => React.ReactNode;
  onRowClick?: (item: T, index: number) => void;
  
  // Search & Filter
  searchFields?: (keyof T)[];
  onSearch?: (query: string) => void;
  
  // Sorting
  sortable?: boolean;
  initialSort?: SortConfig;
  onSort?: (sort: SortConfig) => void;
  
  // Selection
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  
  // Pagination
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  
  // Styling
  className?: string;
  headerClassName?: string;
  rowClassName?: (item: T, index: number) => string;
  dense?: boolean;
  striped?: boolean;
}

interface RowState {
  expanded: Set<string>;
}

export function UnifiedTable<T extends { id?: string }>(props: UnifiedTableProps<T>) {
  const {
    data,
    columns,
    expandable = false,
    renderExpandedRow,
    onRowClick,
    searchFields = [],
    onSearch,
    sortable = true,
    initialSort,
    onSort,
    selectable = false,
    selectedIds = [],
    onSelectionChange,
    pageSize = 20,
    currentPage = 1,
    totalItems,
    onPageChange,
    className = '',
    headerClassName = '',
    rowClassName,
    dense = false,
    striped = true,
  } = props;

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(initialSort);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery || searchFields.length === 0) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter(item =>
      searchFields.some(field => {
        const value = (item[field] as any)?.toString().toLowerCase() || '';
        return value.includes(query);
      })
    );
  }, [data, searchQuery, searchFields]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig || !sortable) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const accessor = sortConfig.field;
      const aValue = (a as any)[accessor];
      const bValue = (b as any)[accessor];
      
      if (aValue === bValue) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pageSize) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (fieldId: string) => {
    if (!sortable) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.field === fieldId && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    const newSort = { field: fieldId, direction };
    setSortConfig(newSort);
    onSort?.(newSort);
  };

  const handleExpandRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSelectAll = () => {
    if (selectedIds?.length === paginatedData.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(paginatedData.map((item, i) => item.id || `row-${i}`));
    }
  };

  const handleSelectRow = (rowId: string) => {
    const newSelection = selectedIds?.includes(rowId)
      ? selectedIds.filter(id => id !== rowId)
      : [...(selectedIds || []), rowId];
    onSelectionChange?.(newSelection);
  };

  const padding = dense ? 'px-4 py-2' : 'px-6 py-4';
  const headerPadding = dense ? 'px-4 py-2' : 'px-6 py-3';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Search */}
      <div className="flex items-center justify-between gap-4">
        {searchFields.length > 0 && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch?.(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Filter size={18} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Download size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          {/* Header */}
          <thead className={`bg-gray-100 border-b border-gray-200 ${headerClassName}`}>
            <tr>
              {selectable && (
                <th className={`${headerPadding} text-left`}>
                  <input
                    type="checkbox"
                    checked={selectedIds?.length === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
              )}
              {expandable && <th className={`${headerPadding} w-12`}></th>}
              {columns.map(column => (
                <th
                  key={column.id}
                  className={`${headerPadding} text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-200 transition-colors`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable !== false && sortConfig?.field === column.id && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((item, index) => {
              const rowId = item.id || `row-${index}`;
              const isExpanded = expandedRows.has(rowId);
              const isSelected = selectedIds?.includes(rowId);
              const customRowClass = rowClassName?.(item, index);

              return (
                <React.Fragment key={rowId}>
                  <tr
                    className={`
                      hover:bg-gray-50 transition-colors cursor-pointer
                      ${striped && index % 2 === 1 ? 'bg-gray-50' : ''}
                      ${isSelected ? 'bg-blue-50' : ''}
                      ${customRowClass || ''}
                    `}
                    onClick={() => onRowClick?.(item, index)}
                  >
                    {selectable && (
                      <td className={`${padding} text-left`}>
                        <input
                          type="checkbox"
                          checked={isSelected || false}
                          onChange={() => handleSelectRow(rowId)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </td>
                    )}
                    {expandable && (
                      <td className={`${padding} text-left`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpandRow(rowId);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    )}
                    {columns.map(column => (
                      <td key={`${rowId}-${column.id}`} className={`${padding} text-sm text-gray-900`}>
                        {column.render
                          ? column.render((item as any)[column.accessor || column.id], item)
                          : String((item as any)[column.accessor || column.id] || '-')}
                      </td>
                    ))}
                  </tr>
                  {expandable && isExpanded && renderExpandedRow && (
                    <tr className="bg-gray-50">
                      <td colSpan={columns.length + (selectable ? 1 : 0) + 1} className="p-0">
                        {renderExpandedRow(item, index)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {paginatedData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Pagination */}
      {pageSize && totalItems && totalItems > pageSize && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={currentPage * pageSize >= totalItems}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
