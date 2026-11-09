import { useState, useMemo } from 'react';
import { Eye, MoreVertical, Search, ChevronUp, ChevronDown } from 'lucide-react';
import formatNumber from '../utils/numberFormat';

export interface UnifiedSKUItem {
  id: string;
  sku: string;
  skuName: string;
  productName: string;
  productCategory: string;
  origin?: string;
  producerName?: string;
  warehouse?: string;
  quantity: number;
  unit: string;
  weight?: number;
  status: 'healthy' | 'low' | 'critical' | 'out' | 'selling' | 'pending';
  lastUpdated?: string;
  minStockLevel?: number;
  userId?: string | number;
  companyId?: string;
}

export interface SKUTableProps {
  items: UnifiedSKUItem[];
  compact?: boolean;
  showCompany?: boolean;
  showOrigin?: boolean;
  showProducer?: boolean;
  showWarehouse?: boolean;
  onRowClick?: (item: UnifiedSKUItem) => void;
  onViewDetails?: (item: UnifiedSKUItem) => void;
  actions?: Array<{ label: string; onClick: (item: UnifiedSKUItem) => void; icon?: any }>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'bg-green-100 text-green-800';
    case 'low': return 'bg-yellow-100 text-yellow-800';
    case 'critical': return 'bg-orange-100 text-orange-800';
    case 'out': return 'bg-red-100 text-red-800';
    case 'selling': return 'bg-blue-100 text-blue-800';
    case 'pending': return 'bg-amber-100 text-amber-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'healthy': return 'Healthy';
    case 'low': return 'Low Stock';
    case 'critical': return 'Critical';
    case 'out': return 'Out of Stock';
    case 'selling': return 'Selling';
    case 'pending': return 'Pending';
    default: return status;
  }
};

export function UnifiedSKUTable({
  items,
  compact = false,
  showCompany = false,
  showOrigin = false,
  showProducer = false,
  showWarehouse = false,
  onRowClick,
  onViewDetails,
  actions = [],
}: SKUTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = searchTerm.toLowerCase();
      return (
        !q ||
        item.sku.toLowerCase().includes(q) ||
        item.skuName.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        (item.producerName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [items, searchTerm]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SKU, name or producer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {showCompany && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Company</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">SKU Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Category</th>
              {showOrigin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Origin</th>
              )}
              {showProducer && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Producer</th>
              )}
              {showWarehouse && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Warehouse</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              {!compact && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick?.(item)}
              >
                {showCompany && (
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold bg-gray-100 text-gray-700">
                      {item.companyId || 'N/A'}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono font-semibold">
                    {item.sku}
                  </code>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {item.productName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {item.productCategory}
                </td>
                {showOrigin && (
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.origin || '—'}
                  </td>
                )}
                {showProducer && (
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.producerName || '—'}
                  </td>
                )}
                {showWarehouse && (
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.warehouse || '—'}
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatNumber(item.quantity)} {item.unit}
                  </div>
                  {item.weight && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatNumber(item.weight)} kg
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                </td>
                {!compact && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails?.(item);
                        }}
                        className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {actions.length > 0 && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenu(
                                openActionMenu === item.id ? null : item.id
                              );
                            }}
                            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            title="More Actions"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {openActionMenu === item.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                              {actions.map((action, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(item);
                                    setOpenActionMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  {action.icon && <action.icon className="w-4 h-4" />}
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No SKUs match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}