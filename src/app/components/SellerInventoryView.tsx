import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Package, AlertTriangle, TrendingDown, Clock, Filter, Search, Download, RefreshCw, ToggleLeft, ToggleRight, History, FileText, ShoppingCart, TrendingUp, Eye, MoreVertical } from 'lucide-react';
import formatNumber from '../utils/numberFormat';
import { Truck, ChevronDown, ChevronUp } from 'lucide-react';
import ShippingHistory from './ShippingHistory';
import { UnifiedSKUTable, type UnifiedSKUItem } from './UnifiedSKUTable';

interface SKUItem {
  id: string;
  sku: string;
  productName: string;
  productCategory: string;
  warehouse: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  lastUpdated: string;
  status: 'healthy' | 'low' | 'critical' | 'out';
}

interface StockLog {
  id: string;
  sku: string;
  action: string;
  quantityChange: number;
  newQuantity: number;
  timestamp: string;
  user: string;
}

interface TraceabilityItem {
  sku: string;
  productName: string;
  units: number;
  kg: number;
}

interface TraceabilityEntry {
  orderId: string;
  date: string;
  type: 'Roasting' | 'Repackaging' | 'Blending' | string;
  direction: 'upstream' | 'downstream';
  fromItems: TraceabilityItem[];
  toItems: TraceabilityItem[];
  status: string;
}

const MOCK_TRACEABILITY: Record<string, TraceabilityEntry[]> = {
  'GC-COL-001-60KG': [
    {
      orderId: 'TRF-2026-000',
      date: '2026-03-10',
      type: 'Import',
      direction: 'upstream',
      fromItems: [{ sku: 'RAW-COL-001', productName: 'Colombian Supremo Raw — bulk', units: 10, kg: 600 }],
      toItems:   [{ sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo Green Coffee', units: 10, kg: 600 }],
      status: 'Completed',
    },
    {
      orderId: 'TRF-2026-001',
      date: '2026-04-18',
      type: 'Roasting',
      direction: 'downstream',
      fromItems: [{ sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo Green Coffee', units: 5, kg: 300 }],
      toItems:   [{ sku: 'RC-COL-001-1KG',  productName: 'Colombian Supremo Roasted — 1 kg bag', units: 280, kg: 280 }],
      status: 'Completed',
    },
  ],
  'RC-ETH-002-1KG': [
    {
      orderId: 'TRF-2026-002',
      date: '2026-04-22',
      type: 'Roasting',
      direction: 'upstream',
      fromItems: [{ sku: 'GC-ETH-004-60KG', productName: 'Ethiopian Yirgacheffe Green — 60 kg bag', units: 5, kg: 300 }],
      toItems:   [{ sku: 'RC-ETH-002-1KG',  productName: 'Ethiopian Yirgacheffe Roasted — 1 kg bag', units: 290, kg: 290 }],
      status: 'Completed',
    },
    {
      orderId: 'TRF-2026-004',
      date: '2026-05-10',
      type: 'Repackaging',
      direction: 'downstream',
      fromItems: [{ sku: 'RC-ETH-002-1KG', productName: 'Ethiopian Yirgacheffe Roasted — 1 kg bag', units: 10, kg: 10 }],
      toItems:   [{ sku: 'RC-ETH-005-250G', productName: 'Ethiopian Yirgacheffe — 250 g sample pack', units: 36, kg: 9 }],
      status: 'Working',
    },
  ],
  'GC-BRA-003-60KG': [
    {
      orderId: 'TRF-2026-003',
      date: '2026-04-05',
      type: 'Import',
      direction: 'upstream',
      fromItems: [{ sku: 'RAW-BRA-003', productName: 'Brazilian Santos Raw — bulk', units: 5, kg: 300 }],
      toItems:   [{ sku: 'GC-BRA-003-60KG', productName: 'Brazilian Santos Green Coffee', units: 5, kg: 300 }],
      status: 'Completed',
    },
  ],
};

interface CostLogEntry {
  invoiceId: string;
  invoiceNumber: string;
  provider: string;
  date: string;
  allocatedAmount: number;
  currency: string;
  linkedEntity: string;
  entityType: 'shipment' | 'sales_order' | 'restock_order' | 'transformation_order';
}

interface Product {
  id: string;
  productName: string;
  productCategory: string;
  totalQuantity: number;
  totalKg: number;
  skuCount: number;
  status: 'healthy' | 'low' | 'critical' | 'out';
  skus: SKUItem[];
}

const MOCK_COST_LOG: Record<string, CostLogEntry[]> = {
  'GC-COL-001-60KG': [
    { invoiceId: 'INV-2026-001', invoiceNumber: 'EXT-INV-7821', provider: 'Costas Ocean Freight', date: '2026-05-01', allocatedAmount: 312.50, currency: 'EUR', linkedEntity: 'SHP-0001', entityType: 'shipment' },
    { invoiceId: 'INV-2026-003', invoiceNumber: 'EXT-INV-8190', provider: 'Rotterdam Roast Lab', date: '2026-04-25', allocatedAmount: 35.00, currency: 'EUR', linkedEntity: 'TRF-2026-001', entityType: 'transformation_order' },
  ],
  'RC-ETH-002-1KG': [
    { invoiceId: 'INV-2026-002', invoiceNumber: 'EXT-INV-8001', provider: 'FedEx Spain', date: '2026-05-03', allocatedAmount: 18.75, currency: 'EUR', linkedEntity: '#1264', entityType: 'sales_order' },
  ],
  'GC-BRA-003-60KG': [],
};

const MOCK_SHIPPING: Record<string, { date: string; event: string; carrier: string; location: string }[]> = {
  'GC-COL-001-60KG': [
    { date: '2026-05-01', event: 'Replenishment received', carrier: 'Costas Ocean', location: 'Rotterdam WH' },
  ],
  'RC-ETH-002-1KG': [
    { date: '2026-05-03', event: 'Order dispatched', carrier: 'FedEx', location: 'Rotterdam WH → Milan' },
  ],
  'GC-BRA-003-60KG': [],
};

const MOCK_INVENTORY: SKUItem[] = [
  {
    id: '1',
    sku: 'GC-COL-001-60KG',
    productName: 'Colombian Supremo Green Coffee',
    productCategory: 'Green Coffee',
    warehouse: 'Rotterdam Warehouse',
    quantity: 20,
    unit: 'kg',
    minStockLevel: 500,
    lastUpdated: '2026-05-01',
    status: 'healthy',
  },
  {
    id: '2',
    sku: 'RC-ETH-002-1KG',
    productName: 'Ethiopian Yirgacheffe Roasted',
    productCategory: 'Roasted Coffee',
    warehouse: 'Rotterdam Warehouse',
    quantity: 45,
    unit: 'kg',
    minStockLevel: 100,
    lastUpdated: '2026-05-03',
    status: 'low',
  },
  {
    id: '3',
    sku: 'GC-BRA-003-60KG',
    productName: 'Brazilian Santos Green Coffee',
    productCategory: 'Green Coffee',
    warehouse: 'Muhlenberg Warehouse',
    quantity: 3,
    unit: 'kg',
    minStockLevel: 200,
    lastUpdated: '2026-05-04',
    status: 'critical',
  },
];

// Group inventory by product
const groupInventoryByProduct = (inventory: SKUItem[]): Product[] => {
  const grouped = inventory.reduce((acc, item) => {
    const key = item.productName;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        productName: item.productName,
        productCategory: item.productCategory,
        totalQuantity: 0,
        totalKg: 0,
        skuCount: 0,
        status: 'healthy' as const,
        skus: [],
      };
    }
    acc[key].totalQuantity += item.quantity;
    acc[key].skuCount += 1;
    acc[key].skus.push(item);
    
    // Calculate total kg
    const perUnitKg = parsePerUnitKgStatic(item);
    if (perUnitKg !== undefined) {
      acc[key].totalKg += perUnitKg * item.quantity;
    }
    
    // Determine overall status (critical > low > healthy)
    if (item.status === 'critical' || item.status === 'out') {
      acc[key].status = 'critical';
    } else if (item.status === 'low' && acc[key].status !== 'critical') {
      acc[key].status = 'low';
    }
    
    return acc;
  }, {} as Record<string, Product>);
  
  return Object.values(grouped);
};

// Helper to parse kg from SKU (static version for use in grouping)
const parsePerUnitKgStatic = (item: SKUItem): number | undefined => {
  const skuMatch = /([\d,.]+)\s*(KG|G)$|-(\d+(?:\.\d+)?)(KG|G)$/i.exec(item.sku);
  if (skuMatch) {
    const num = skuMatch[1] || skuMatch[3];
    const unit = skuMatch[2] || skuMatch[4];
    const n = Number(String(num).replace(/,/g, ''));
    if (!Number.isNaN(n)) {
      return unit.toLowerCase() === 'g' ? n / 1000 : n;
    }
  }
  const unitMatch = /^(\d+(?:\.\d+)?)\s*kg$/i.exec(String(item.unit));
  if (unitMatch) {
    const total = Number(unitMatch[1]);
    if (!Number.isNaN(total) && item.quantity > 0) {
      return total / item.quantity;
    }
  }
  return undefined;
};

const MOCK_LOGS: StockLog[] = [
  {
    id: 'L001',
    sku: 'GC-COL-001-60KG',
    action: 'Shipment Received',
    quantityChange: 500,
    newQuantity: 1200,
    timestamp: '2026-05-01 14:30',
    user: 'Warehouse Manager',
  },
  {
    id: 'L002',
    sku: 'RC-ETH-002-1KG',
    action: 'Client Order Fulfilled',
    quantityChange: -55,
    newQuantity: 45,
    timestamp: '2026-05-03 10:15',
    user: 'Operations Team',
  },
  {
    id: 'L003',
    sku: 'GC-BRA-003-60KG',
    action: 'Stock Adjustment',
    quantityChange: -20,
    newQuantity: 180,
    timestamp: '2026-05-04 16:45',
    user: 'Inventory Manager',
  },
];

export default function SellerInventoryView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'simple' | 'enhanced' | 'skus' | 'products'>('simple');
  const [inventory] = useState<SKUItem[]>(MOCK_INVENTORY);
  const [logs] = useState<StockLog[]>(MOCK_LOGS);
  const [selectedSKU, setSelectedSKU] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  // Apply filter from URL params on mount
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setActiveFilter(filterParam);
    }
  }, [searchParams]);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    switch (activeFilter) {
      case 'low': matchesFilter = item.status === 'low'; break;
      case 'critical': matchesFilter = item.status === 'critical'; break;
      case 'out': matchesFilter = item.status === 'out'; break;
      case 'running_out': matchesFilter = item.status === 'low' || item.status === 'critical'; break;
      default: matchesFilter = true;
    }

    const matchesActiveOnly = !showActiveOnly || item.status !== 'out';

    return matchesSearch && matchesFilter && matchesActiveOnly;
  });

  // Use centralized formatter
  const fmt = (n: number) => formatNumber(n);

  const parsePerUnitKg = (it: SKUItem) => {
    // try parse SKU suffix like -60KG or -250G or -1KG
    const skuMatch = /([\d,.]+)\s*(KG|G)$|-(\d+(?:\.\d+)?)(KG|G)$/i.exec(it.sku);
    if (skuMatch) {
      const num = skuMatch[1] || skuMatch[3];
      const unit = skuMatch[2] || skuMatch[4];
      const n = Number(String(num).replace(/,/g, ''));
      if (!Number.isNaN(n)) {
        return unit.toLowerCase() === 'g' ? n / 1000 : n;
      }
    }

    // try parse item.unit as total kilos (e.g. '1200 kg' or '45 kg') and convert to per-unit when quantity present
    const unitMatch = /^(\d+(?:\.\d+)?)\s*kg$/i.exec(String(it.unit));
    if (unitMatch) {
      const total = Number(unitMatch[1]);
      if (!Number.isNaN(total) && it.quantity > 0) {
        return total / it.quantity; // per-unit kg
      }
    }

    return undefined;
  };

  const selectedLogs = selectedSKU ? logs.filter(log => log.sku === selectedSKU) : [];

  const getStatusColor = (status: SKUItem['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-orange-100 text-orange-800';
      case 'out': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusLabel = (status: SKUItem['status']) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'low': return 'Low Stock';
      case 'critical': return 'Critical';
      case 'out': return 'Out of Stock';
    }
  };

  const lowStockCount = inventory.filter(item => item.status === 'low').length;
  const criticalCount = inventory.filter(item => item.status === 'critical').length;
  const outOfStockCount = inventory.filter(item => item.status === 'out').length;
  const runningOutCount = lowStockCount + criticalCount;

  const [openHistorySection, setOpenHistorySection] = useState<Record<string, string | null>>({});

  const toggleHistorySection = (itemId: string, section: string) => {
    setOpenHistorySection(prev => ({
      ...prev,
      [itemId]: prev[itemId] === section ? null : section,
    }));
  };

  const clearFilter = () => {
    setActiveFilter('all');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Inventory / Stock</h2>
          <p className="text-gray-600">Track stock levels across all products and warehouses</p>
          {activeFilter !== 'all' && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filter:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {activeFilter === 'running_out' && 'Running Out Soon'}
                {activeFilter === 'low' && 'Low Stock'}
                {activeFilter === 'critical' && 'Critical Level'}
                {activeFilter === 'out' && 'Out of Stock'}
              </span>
              <button onClick={clearFilter} className="text-sm text-blue-600 hover:text-blue-700 underline">
                Clear filter
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Active-only toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className={`relative w-10 h-5 rounded-full transition-colors ${showActiveOnly ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showActiveOnly ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm text-gray-600 whitespace-nowrap">Active only</span>
          </label>
          {/* View Mode Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('simple')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'simple'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setViewMode('skus')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'skus'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              SKUs
            </button>
            <button
              onClick={() => setViewMode('products')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'products'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setViewMode('enhanced')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'enhanced'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setActiveFilter('running_out');
            setSearchParams({ filter: 'running_out' });
          }}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            activeFilter === 'running_out'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Running Out Soon</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{runningOutCount}</div>
          <p className="text-xs text-gray-500 mt-1">Low or critical stock</p>
        </button>

        <button
          onClick={() => {
            setActiveFilter('critical');
            setSearchParams({ filter: 'critical' });
          }}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            activeFilter === 'critical'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Critical Level</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{criticalCount}</div>
          <p className="text-xs text-gray-500 mt-1">Immediate action needed</p>
        </button>

        <button
          onClick={() => {
            setActiveFilter('out');
            setSearchParams({ filter: 'out' });
          }}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            activeFilter === 'out'
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Out of Stock</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{outOfStockCount}</div>
          <p className="text-xs text-gray-500 mt-1">No inventory available</p>
        </button>

        <button
          onClick={() => {
            setActiveFilter('all');
            setSearchParams({});
          }}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            activeFilter === 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">All Items</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{inventory.length}</div>
          <p className="text-xs text-gray-500 mt-1">Total SKUs</p>
        </button>
      </div>

      {/* SKUs View - Unified Table */}
      {viewMode === 'skus' && (
        <UnifiedSKUTable
          items={filteredInventory.map(item => ({
            id: item.id,
            sku: item.sku,
            skuName: item.sku,
            productName: item.productName,
            productCategory: item.productCategory,
            warehouse: item.warehouse,
            quantity: item.quantity,
            unit: 'units',
            weight: (() => {
              const perUnit = parsePerUnitKg(item);
              return perUnit ? perUnit * item.quantity : undefined;
            })(),
            status: item.status,
            lastUpdated: item.lastUpdated,
            minStockLevel: item.minStockLevel,
          }))}
          showWarehouse
          onViewDetails={(item) => setSelectedSKU(item.sku)}
        />
      )}

      {/* Products View */}
      {viewMode === 'products' && (() => {
        const products = groupInventoryByProduct(filteredInventory);
        const filteredProducts = products.filter(product => {
          const matchesSearch = searchTerm === '' ||
            product.productName.toLowerCase().includes(searchTerm.toLowerCase());

          let matchesFilter = true;
          switch (activeFilter) {
            case 'low': matchesFilter = product.status === 'low'; break;
            case 'critical': matchesFilter = product.status === 'critical' || product.status === 'out'; break;
            case 'out': matchesFilter = product.skus.some(s => s.status === 'out'); break;
            case 'running_out': matchesFilter = product.status === 'low' || product.status === 'critical'; break;
            default: matchesFilter = true;
          }

          const matchesActiveOnly = !showActiveOnly || product.status !== 'out';
          return matchesSearch && matchesFilter && matchesActiveOnly;
        });

        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by product name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">SKUs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Total Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Total Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{product.productName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.productCategory}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{product.skuCount}</span>
                          <div className="flex gap-1">
                            {product.skus.slice(0, 2).map((sku, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 truncate max-w-[100px]"
                                title={sku.sku}
                              >
                                {sku.sku}
                              </span>
                            ))}
                            {product.skuCount > 2 && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                +{product.skuCount - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{fmt(product.totalQuantity)} units</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.totalKg > 0 ? `${formatNumber(product.totalKg, 2)} kg` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusColor(product.status)}`}>
                          {getStatusLabel(product.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No products match your filters.</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Simple View */}
      {viewMode === 'simple' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by SKU or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Product Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Warehouse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map(item => {
                  const companyCode = 'NFCOF';
                  return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold bg-gray-100 text-gray-700">
                        {companyCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{item.sku}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.productName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.warehouse}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{fmt(item.quantity)} <span className="text-xs font-medium text-gray-600">units</span></div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(() => {
                          const perUnit = parsePerUnitKg(item);
                          let totalKg: number | null = null;
                          if (perUnit !== undefined) totalKg = perUnit * item.quantity;
                          // fallback: if unit itself already expresses total kg
                          if (totalKg === null) {
                            const totalMatch = /^(\d+(?:\.\d+)?)\s*kg$/i.exec(String(item.unit));
                            if (totalMatch) totalKg = Number(totalMatch[1]);
                          }
                          if (totalKg !== null && totalKg !== undefined) {
                            const decimals = Math.abs(totalKg) % 1 === 0 ? 0 : 2;
                            return `(${formatNumber(totalKg, decimals)} KG)`;
                          }
                          return `(${item.unit})`;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-700 hover:text-[#0B1F3A] hover:bg-gray-100 rounded transition-colors" title="View Details">
                          <Eye className="w-5 h-5" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenActionMenu(openActionMenu === item.id ? null : item.id)}
                            className="p-2 text-gray-700 hover:text-[#0B1F3A] hover:bg-gray-100 rounded transition-colors"
                            title="More Actions"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {openActionMenu === item.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" onClick={() => setOpenActionMenu(null)}>
                                <FileText className="w-4 h-4" />Details
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" onClick={() => setOpenActionMenu(null)}>
                                <ShoppingCart className="w-4 h-4" />Buy Details
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" onClick={() => setOpenActionMenu(null)}>
                                <TrendingUp className="w-4 h-4" />View Proposals
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enhanced View — Accordion */}
      {viewMode === 'enhanced' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Products &amp; Stock Log</h3>
              <span className="ml-auto text-xs text-gray-400">Click a row to expand its log</span>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredInventory.map(item => {
                const isExpanded = expandedProduct === item.id;
                const itemLogs = logs.filter(l => l.sku === item.sku);
                return (
                  <div key={item.id}>
                    {/* Row — clickable */}
                    <button
                      onClick={() => setExpandedProduct(isExpanded ? null : item.id)}
                      className={`w-full p-4 text-left flex items-center gap-4 hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{item.sku}</code>
                          <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(item.status)}`}>{getStatusLabel(item.status)}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.warehouse}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-gray-900">{fmt(item.quantity)} <span className="text-sm font-medium text-gray-600">units</span></div>
                        <div className="text-xs text-gray-500 mt-1">
                          {(() => {
                            const perUnit = parsePerUnitKg(item);
                            let totalKg: number | null = null;
                            if (perUnit !== undefined) totalKg = perUnit * item.quantity;
                            if (totalKg === null) {
                              const totalMatch = /^(\d+(?:\.\d+)?)\s*kg$/i.exec(String(item.unit));
                              if (totalMatch) totalKg = Number(totalMatch[1]);
                            }
                            if (totalKg !== null && totalKg !== undefined) {
                              const decimals = Math.abs(totalKg) % 1 === 0 ? 0 : 2;
                              return `(${formatNumber(totalKg, decimals)} KG)`;
                            }
                            return `(${item.unit})`;
                          })()}
                        </div>
                      </div>
                      <div className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                        ▾
                      </div>
                    </button>
                    {/* Expanded log */}
                    {isExpanded && (
                      <div className="bg-[#F5F7FA] border-t border-gray-100 px-4 py-3 space-y-2">

                        {/* ── Stock Change Log ── */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => toggleHistorySection(item.id, "stock")}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                          >
                            <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                              <Package className="w-4 h-4 text-[#0B1F3A]" />
                              Stock Change Log ({itemLogs.length})
                            </span>
                            {openHistorySection[item.id] === "stock" ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </button>
                          {openHistorySection[item.id] === "stock" && (
                            itemLogs.length === 0
                              ? <p className="px-4 py-3 text-sm text-gray-400 border-t border-gray-100">No log entries for this product.</p>
                              : (
                                <div className="border-t border-gray-100 divide-y divide-gray-100">
                                  {itemLogs.map(log => (
                                    <div key={log.id} className="flex items-center justify-between px-4 py-2 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-900">{log.action}</span>
                                        <div className="text-xs text-gray-500">{log.user} · {log.timestamp}</div>
                                      </div>
                                      <div className="text-right">
                                        <span className={`font-semibold ${log.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {log.quantityChange > 0 ? '+' : ''}{fmt(log.quantityChange)} units
                                        </span>
                                        <div className="text-xs text-gray-400">Total: {fmt(log.newQuantity)} units</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )
                          )}
                        </div>

                        {/* ── Product Traceability ── */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => toggleHistorySection(item.id, "traceability")}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                          >
                            <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                              <RefreshCw className="w-4 h-4 text-amber-600" />
                              Product Traceability ({(MOCK_TRACEABILITY[item.sku] || []).length})
                            </span>
                            {openHistorySection[item.id] === "traceability"
                              ? <ChevronUp className="w-4 h-4 text-gray-400" />
                              : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </button>

                          {openHistorySection[item.id] === "traceability" && (() => {
                            const entries = MOCK_TRACEABILITY[item.sku] || [];
                            const upstream   = entries.filter(e => e.direction === 'upstream');
                            const downstream = entries.filter(e => e.direction === 'downstream');

                            const EntryTable = ({ rows }: { rows: TraceabilityEntry[] }) =>
                              rows.length === 0 ? (
                                <p className="px-4 py-2 text-sm text-gray-400">None recorded.</p>
                              ) : (
                                <table className="w-full">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Order</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">From → To</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {rows.map((e, i) => (
                                      <tr key={i}>
                                        <td className="px-4 py-2">
                                          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{e.orderId}</code>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{e.date}</td>
                                        <td className="px-4 py-2">
                                          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">{e.type}</span>
                                        </td>
                                        <td className="px-4 py-2 text-xs text-gray-700">
                                          <span className="text-gray-500">{e.fromItems.map(f => f.productName).join(' + ')}</span>
                                          <span className="mx-1 text-gray-400">→</span>
                                          <span className="font-medium">{e.toItems.map(t => t.productName).join(' + ')}</span>
                                        </td>
                                        <td className="px-4 py-2">
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            e.status === 'Completed' ? 'bg-green-100 text-green-700'
                                            : e.status === 'Working'  ? 'bg-blue-100 text-blue-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                          }`}>{e.status}</span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              );

                            return (
                              <div className="border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                  <div>
                                    <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                      ← Produced from (upstream)
                                    </p>
                                    <EntryTable rows={upstream} />
                                  </div>
                                  <div>
                                    <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                      → Used in (downstream)
                                    </p>
                                    <EntryTable rows={downstream} />
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* ── Shipping History ── */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => toggleHistorySection(item.id, "shipping")}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                          >
                            <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                              <Truck className="w-4 h-4 text-blue-600" />
                              Shipping History ({(MOCK_SHIPPING[item.sku] || []).length} events)
                            </span>
                            {openHistorySection[item.id] === "shipping" ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </button>
                          {openHistorySection[item.id] === "shipping" && (
                            (MOCK_SHIPPING[item.sku] || []).length === 0
                              ? <p className="px-4 py-3 text-sm text-gray-400 border-t border-gray-100">No shipping events recorded.</p>
                              : (
                                <table className="w-full border-t border-gray-100">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Event</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Carrier</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Location</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {(MOCK_SHIPPING[item.sku] || []).map((s, i) => (
                                      <tr key={i}>
                                        <td className="px-4 py-2 text-sm text-gray-600">{s.date}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{s.event}</td>
                                        <td className="px-4 py-2 text-sm">{s.carrier}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{s.location}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )
                          )}
                        </div>

                        {/* ── Cost Log ── */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => toggleHistorySection(item.id, "costs")}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                          >
                            <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                              <FileText className="w-4 h-4 text-indigo-600" />
                              Cost Log ({(MOCK_COST_LOG[item.sku] || []).length} entries)
                            </span>
                            {openHistorySection[item.id] === "costs" ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </button>

                          {openHistorySection[item.id] === "costs" && (() => {
                            const entries = MOCK_COST_LOG[item.sku] || [];
                            const total = entries.reduce((s, e) => s + e.allocatedAmount, 0);
                            return entries.length === 0 ? (
                              <p className="px-4 py-3 text-sm text-gray-400 border-t border-gray-100">No costs assigned to this product yet.</p>
                            ) : (
                              <div className="border-t border-gray-100">
                                <table className="w-full">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Invoice #</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Provider</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Linked To</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Allocated (EUR)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {entries.map((e, i) => (
                                      <tr key={i}>
                                        <td className="px-4 py-2">
                                          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{e.invoiceNumber}</code>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{e.provider}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{e.date}</td>
                                        <td className="px-4 py-2">
                                          <span className="text-xs text-gray-500 capitalize">{e.entityType.replace(/_/g, ' ')}: </span>
                                          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{e.linkedEntity}</code>
                                        </td>
                                        <td className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">
                                          {formatNumber(e.allocatedAmount)} {e.currency}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                                    <tr>
                                      <td colSpan={4} className="px-4 py-2 text-sm font-semibold text-gray-700">Total Cost Allocated</td>
                                      <td className="px-4 py-2 text-sm font-bold text-[#0B1F3A] text-right">{formatNumber(total)} EUR</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            );
                          })()}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Transformation Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">My Transformation Orders</h3>
            </div>
            <div className="p-6 text-center text-gray-400">
              <RefreshCw className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No transformation orders yet.</p>
              <p className="text-xs mt-1 text-gray-400">Transformation orders convert raw stock into finished products (e.g. green coffee → roasted).</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
