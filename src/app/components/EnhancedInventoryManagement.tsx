import { useState } from 'react';
import { Package, AlertTriangle, TrendingDown, Clock, Filter, Search, Download, RefreshCw, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import formatNumber from '../utils/numberFormat';

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
  ownerOfStock?: string;
}

interface StockMovement {
  id: string;
  skuId: string;
  date: string;
  type: 'INITIAL_INVENTORY' | 'GOODS_RECEIPT_FROM_RESTOCK' | 'GOODS_RECEIPT_FROM_RETURN' | 'GOODS_ISSUE_TO_TRANSFORMATION' | 'GOODS_ISSUE_TO_SALES' | 'INVENTORY_CORRECTION';
  quantityUnits: number;
  warehouseId: string;
  referenceNumber?: string;
  linkedToId?: string;
  comment?: string;
}

const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mv-1-001',
    skuId: '1',
    date: '2026-05-01',
    type: 'GOODS_RECEIPT_FROM_RESTOCK',
    quantityUnits: 120,
    warehouseId: 'Rotterdam WH',
    referenceNumber: 'RSO-2026-05-001',
    linkedToId: 'RSO-2026-05-001',
    comment: 'Monthly replenishment from producer',
  },
  {
    id: 'mv-1-002',
    skuId: '1',
    date: '2026-04-28',
    type: 'GOODS_ISSUE_TO_TRANSFORMATION',
    quantityUnits: -50,
    warehouseId: 'Rotterdam WH',
    linkedToId: 'TRANS-2026-04-0042',
    comment: 'Roasting batch',
  },
  {
    id: 'mv-1-003',
    skuId: '1',
    date: '2026-04-18',
    type: 'GOODS_ISSUE_TO_SALES',
    quantityUnits: -30,
    warehouseId: 'Rotterdam WH',
    linkedToId: 'SO-2026-04-0015',
    comment: 'Customer order',
  },
  {
    id: 'mv-1-004',
    skuId: '1',
    date: '2026-03-15',
    type: 'INITIAL_INVENTORY',
    quantityUnits: 200,
    warehouseId: 'Rotterdam WH',
    referenceNumber: 'INIT-001',
    comment: 'Initial stock setup',
  },
  {
    id: 'mv-2-001',
    skuId: '2',
    date: '2026-05-03',
    type: 'GOODS_RECEIPT_FROM_RESTOCK',
    quantityUnits: 45,
    warehouseId: 'Rotterdam WH',
    referenceNumber: 'RSO-2026-05-002',
    linkedToId: 'RSO-2026-05-002',
    comment: 'Roasted coffee delivery',
  },
  {
    id: 'mv-3-001',
    skuId: '3',
    date: '2026-04-20',
    type: 'INVENTORY_CORRECTION',
    quantityUnits: -25,
    warehouseId: 'Muhlenberg WH',
    comment: 'Physical inventory adjustment',
  },
];

const MOCK_TRANSFORMATIONS_ENH: Record<string, { date: string; type: string; qty: number; cost: number; status: string }[]> = {
  '1': [{ date: '2026-04-18', type: 'Roasting', qty: 5, cost: 35.00, status: 'Completed' }],
  '2': [], '3': [], '4': [], '5': [],
};

const MOCK_SHIPPING_ENH: Record<string, { date: string; event: string; carrier: string; location: string }[]> = {
  '1': [{ date: '2026-05-01', event: 'Replenishment received', carrier: 'Costas Ocean', location: 'Rotterdam WH' }],
  '2': [{ date: '2026-05-03', event: 'Order dispatched', carrier: 'FedEx', location: 'Rotterdam WH → Milan' }],
  '3': [], '4': [], '5': [],
};

const MOCK_INVENTORY: SKUItem[] = [
  {
    id: '1',
    sku: 'GC-COL-001-60KG',
    productName: 'Colombian Supremo Green Coffee',
    productCategory: 'Green Coffee',
    warehouse: 'Rotterdam Warehouse',
    quantity: 20,
    unit: '1200 kg',
    minStockLevel: 500,
    lastUpdated: '2026-05-01',
    status: 'healthy',
    ownerOfStock: 'Ember France',
  },
  {
    id: '2',
    sku: 'RC-ETH-002-1KG',
    productName: 'Ethiopian Yirgacheffe Roasted',
    productCategory: 'Roasted Coffee',
    warehouse: 'Rotterdam Warehouse',
    quantity: 45,
    unit: '45 kg',
    minStockLevel: 100,
    lastUpdated: '2026-05-03',
    status: 'low',
    ownerOfStock: 'Specialty Imports',
  },
  {
    id: '3',
    sku: 'GC-BRA-003-60KG',
    productName: 'Brazilian Santos Green Coffee',
    productCategory: 'Green Coffee',
    warehouse: 'Muhlenberg Warehouse',
    quantity: 3,
    unit: '180 kg',
    minStockLevel: 200,
    lastUpdated: '2026-05-04',
    status: 'critical',
    ownerOfStock: 'Nordic Supplies',
  },
  {
    id: '4',
    sku: 'SC-KEN-004-250G',
    productName: 'Kenyan AA Specialty Coffee',
    productCategory: 'Specialty Coffee',
    warehouse: 'Rotterdam Warehouse',
    quantity: 0,
    unit: '0 kg',
    minStockLevel: 50,
    lastUpdated: '2026-04-28',
    status: 'out',
    ownerOfStock: 'Ember France',
  },
  {
    id: '5',
    sku: 'GC-COL-005-60KG',
    productName: 'Colombian Excelso Green Coffee',
    productCategory: 'Green Coffee',
    warehouse: 'Rotterdam Warehouse',
    quantity: 850,
    unit: 'kg',
    minStockLevel: 400,
    lastUpdated: '2026-05-02',
    status: 'healthy',
    ownerOfStock: 'Nordic Supplies',
  },
];

type SmartFilter = 'all' | 'running_out' | 'low_stock' | 'critical' | 'out_of_stock' | 'recent_changes';

export default function EnhancedInventoryManagement() {
  const [inventory] = useState<SKUItem[]>(MOCK_INVENTORY);
  const [movements] = useState<StockMovement[]>(MOCK_STOCK_MOVEMENTS);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<SmartFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openSection, setOpenSection] = useState<Record<string, string | null>>({});
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<SKUItem | null>(null);
  const [showCreateMovementModal, setShowCreateMovementModal] = useState(false);

  const toggleSection = (itemId: string, section: string) => {
    setOpenSection(prev => ({ ...prev, [itemId]: prev[itemId] === section ? null : section }));
  };

  const handleMovementClick = (movement: StockMovement, product: SKUItem) => {
    setSelectedMovement(movement);
    setSelectedProduct(product);
  };

  const downloadReceipt = (movement: StockMovement, product: SKUItem) => {
    const isReceiptMovement = movement.type === 'GOODS_RECEIPT_FROM_RESTOCK' || movement.type === 'GOODS_RECEIPT_FROM_RETURN';
    if (!isReceiptMovement) return;

    const receiptLabel = movement.type === 'GOODS_RECEIPT_FROM_RESTOCK' 
      ? 'Receipt from Re-stock Order' 
      : 'Receipt from Return';
    
    const date = new Date(movement.date);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

    const receiptContent = `RECEIPT DOCUMENT
=====================================
Date: ${dateStr}
Receipt Type: ${receiptLabel}
SKU: ${product.id} - ${product.productName}
Quantity: ${Math.abs(movement.quantityUnits)} units
Warehouse: ${movement.warehouseId}
Reference: ${movement.referenceNumber || 'N/A'}
Linked ID: ${movement.linkedToId || 'N/A'}
Comment: ${movement.comment || 'N/A'}
=====================================`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `Receipt_${product.id}_${movement.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getMovementTypeLabel = (type: StockMovement['type']): string => {
    const typeLabels: Record<string, string> = {
      'INITIAL_INVENTORY': 'Initial Inventory',
      'GOODS_RECEIPT_FROM_RESTOCK': 'Goods In',
      'GOODS_RECEIPT_FROM_RETURN': 'Goods In',
      'GOODS_ISSUE_TO_TRANSFORMATION': 'Goods Out',
      'GOODS_ISSUE_TO_SALES': 'Goods Out',
      'INVENTORY_CORRECTION': 'Inventory Correction'
    };
    return typeLabels[type] || type;
  };

  const getMovementBadgeColor = (type: StockMovement['type']): string => {
    if (type === 'INITIAL_INVENTORY' || type === 'GOODS_RECEIPT_FROM_RESTOCK' || type === 'GOODS_RECEIPT_FROM_RETURN') {
      return 'bg-green-100 text-green-800';
    } else if (type === 'GOODS_ISSUE_TO_TRANSFORMATION' || type === 'GOODS_ISSUE_TO_SALES') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  const getMovementDescriptionBadge = (movement: StockMovement, product: SKUItem): { label: string; color: string } => {
    const baseColor = {
      'INITIAL_INVENTORY': 'bg-blue-100 text-blue-800',
      'GOODS_RECEIPT_FROM_RESTOCK': 'bg-green-100 text-green-800',
      'GOODS_RECEIPT_FROM_RETURN': 'bg-indigo-100 text-indigo-800',
      'GOODS_ISSUE_TO_TRANSFORMATION': 'bg-orange-100 text-orange-800',
      'GOODS_ISSUE_TO_SALES': 'bg-purple-100 text-purple-800',
      'INVENTORY_CORRECTION': 'bg-gray-100 text-gray-800',
    };

    const labels = {
      'INITIAL_INVENTORY': `Added to Stock (${movement.warehouseId})`,
      'GOODS_RECEIPT_FROM_RESTOCK': `Restocked (${movement.warehouseId})`,
      'GOODS_RECEIPT_FROM_RETURN': `Return Received (${movement.warehouseId})`,
      'GOODS_ISSUE_TO_TRANSFORMATION': `Transformation Order (${movement.linkedToId || 'N/A'})`,
      'GOODS_ISSUE_TO_SALES': `Client/Buyer (${movement.linkedToId || 'N/A'})`,
      'INVENTORY_CORRECTION': 'Inventory Adjustment',
    };

    return {
      label: labels[movement.type] || movement.type,
      color: baseColor[movement.type] || 'bg-gray-100 text-gray-800',
    };
  };
  
  const getFilteredInventory = () => {
    let filtered = inventory;

    // Apply smart filter
    switch (activeFilter) {
      case 'running_out':
        filtered = filtered.filter(item => item.status === 'low' || item.status === 'critical');
        break;
      case 'low_stock':
        filtered = filtered.filter(item => item.status === 'low');
        break;
      case 'critical':
        filtered = filtered.filter(item => item.status === 'critical');
        break;
      case 'out_of_stock':
        filtered = filtered.filter(item => item.status === 'out');
        break;
      case 'recent_changes':
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        filtered = filtered.filter(item => new Date(item.lastUpdated) >= threeDaysAgo);
        break;
    }

    // Apply warehouse filter
    if (selectedWarehouse !== 'all') {
      filtered = filtered.filter(item => item.warehouse === selectedWarehouse);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.productCategory === selectedCategory);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status: SKUItem['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-orange-100 text-orange-800';
      case 'out':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusLabel = (status: SKUItem['status']) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'low':
        return 'Low Stock';
      case 'critical':
        return 'Critical';
      case 'out':
        return 'Out of Stock';
    }
  };

  const filteredInventory = getFilteredInventory();
  const runningOutCount = inventory.filter(item => item.status === 'low' || item.status === 'critical').length;
  const criticalCount = inventory.filter(item => item.status === 'critical').length;
  const outOfStockCount = inventory.filter(item => item.status === 'out').length;

  const warehouses = Array.from(new Set(inventory.map(item => item.warehouse)));
  const categories = Array.from(new Set(inventory.map(item => item.productCategory)));

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-gray-600">Track and manage stock levels across all warehouses</p>
      </div>

      {/* Smart Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <button
          onClick={() => setActiveFilter('running_out')}
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
          onClick={() => setActiveFilter('critical')}
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
          onClick={() => setActiveFilter('out_of_stock')}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            activeFilter === 'out_of_stock'
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
          onClick={() => setActiveFilter('recent_changes')}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            activeFilter === 'recent_changes'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Recent Changes</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {inventory.filter(item => {
              const threeDaysAgo = new Date();
              threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
              return new Date(item.lastUpdated) >= threeDaysAgo;
            }).length}
          </div>
          <p className="text-xs text-gray-500 mt-1">Last 3 days</p>
        </button>

        <button
          onClick={() => setActiveFilter('all')}
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

      {/* Search and Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
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
          <div>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map(warehouse => (
                <option key={warehouse} value={warehouse}>{warehouse}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">
            Stock Items ({filteredInventory.length})
          </h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-4"></th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">SKU Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Warehouse</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Min Level</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInventory.map(item => (
                <>
                <tr key={item.id} className="hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-500">
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => toggleExpand(item.id)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded transition-colors">
                      {expandedIds.includes(item.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{item.sku}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.productCategory}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.warehouse}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.ownerOfStock || '—'}</td>
                      <td className="px-6 py-4">
                        {/* Units primary, kilos secondary */}
                        {(() => {
                          // helper: derive per-unit kg from SKU or unit string
                          const parsePerUnitKg = (it: typeof item) => {
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

                            // try parse item.unit as total kilos or per-unit (e.g. '1200 kg' or '45 kg' or 'kg')
                            const unitMatch = /^(\d+(?:\.\d+)?)\s*kg$/i.exec(String(it.unit));
                            if (unitMatch) {
                              const total = Number(unitMatch[1]);
                              if (!Number.isNaN(total) && it.quantity > 0) {
                                return total / it.quantity; // per-unit kg
                              }
                            }

                            // fallback unknown
                            return undefined;
                          };

                          const perUnitKg = parsePerUnitKg(item);
                          let totalKg: number | null = null;
                          if (perUnitKg !== undefined) {
                            totalKg = perUnitKg * item.quantity;
                          } else {
                            // try to extract a numeric kg from item.unit as total
                            const totalMatch = /^(\d+(?:\.\d+)?)\s*kg$/i.exec(String(item.unit));
                            if (totalMatch) totalKg = Number(totalMatch[1]);
                          }

                          const formatKgLabel = (kg?: number | null) => {
                            if (kg === null || kg === undefined) return null;
                            const decimals = Math.abs(kg) % 1 === 0 ? 0 : 2;
                            return `${formatNumber(kg, decimals)} KG`;
                          };

                          return (
                            <div>
                              <div className={`text-lg font-bold ${
                                item.status === 'critical' || item.status === 'out'
                                  ? 'text-red-600'
                                  : item.status === 'low'
                                  ? 'text-orange-600'
                                  : 'text-gray-900'
                              }`}>
                                {formatNumber(item.quantity)}
                                <span className="ml-2 text-sm font-medium text-gray-600">units</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {totalKg !== null && totalKg !== undefined ? (
                                  <span>({formatKgLabel(totalKg)})</span>
                                ) : (
                                  <span>({item.unit})</span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {/* Show min stock in units and kilos */}
                    {(() => {
                      const parsePerUnitKg2 = (it: typeof item) => {
                        const skuMatch = /([\d,.]+)\s*(KG|G)$|-(\d+(?:\.\d+)?)(KG|G)$/i.exec(it.sku);
                        if (skuMatch) {
                          const num = skuMatch[1] || skuMatch[3];
                          const unit = skuMatch[2] || skuMatch[4];
                          const n = Number(String(num).replace(/,/g, ''));
                          if (!Number.isNaN(n)) {
                            return unit.toLowerCase() === 'g' ? n / 1000 : n;
                          }
                        }
                        const unitMatch = /^(\d+(?:\.\d+)?)\s*kg$/i.exec(String(it.unit));
                        if (unitMatch) {
                          const total = Number(unitMatch[1]);
                          if (!Number.isNaN(total) && it.quantity > 0) {
                            return total / it.quantity;
                          }
                        }
                        return undefined;
                      };

                      const perUnit = parsePerUnitKg2(item);
                      const minKg = perUnit ? perUnit * item.minStockLevel : null;
                      const formatKgLabelMin = (kg?: number | null) => {
                        if (kg === null || kg === undefined) return null;
                        const decimals = Math.abs(kg) % 1 === 0 ? 0 : 2;
                        return `${formatNumber(kg, decimals)} KG`;
                      };

                      return (
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{formatNumber(item.minStockLevel)}</div>
                          <div className="text-xs text-gray-500 mt-1">{minKg ? `(${formatKgLabelMin(minKg)})` : `(${item.unit})`}</div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.lastUpdated}</td>
                </tr>

                {/* Expanded Activity Log Row */}
                {expandedIds.includes(item.id) && (
                  <tr key={`${item.id}-expanded`} className="bg-gray-50">
                    <td colSpan={10} className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-gray-700">Activity Log</p>
                          <button
                            onClick={() => {
                              setSelectedMovement(null);
                              setSelectedProduct(item);
                              setShowCreateMovementModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-xs font-medium"
                            title="Add new stock movement"
                          >
                            <Plus size={14} />
                            Add Movement
                          </button>
                        </div>
                        {(() => {
                          const relevantMovements = movements
                            .filter(m => m.skuId === item.id)
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                          
                          if (relevantMovements.length === 0) {
                            return (
                              <div className="text-xs text-gray-500">No activity recorded for this product. Current stock: {item.quantity} units</div>
                            );
                          }
                          
                          return (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Date</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Type</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Units</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Document</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Link</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Description</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Comment</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {relevantMovements.map(movement => {
                                    const date = new Date(movement.date);
                                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
                                    
                                    const movementType = getMovementTypeLabel(movement.type);
                                    
                                    const isReceiptMovement = movement.type === 'GOODS_RECEIPT_FROM_RESTOCK' || movement.type === 'GOODS_RECEIPT_FROM_RETURN';
                                    const receiptLabel = isReceiptMovement 
                                      ? (movement.type === 'GOODS_RECEIPT_FROM_RESTOCK' ? 'Receipt from Re-stock Order' : 'Receipt from Return')
                                      : '-';
                                    
                                    const descBadge = getMovementDescriptionBadge(movement, item);
                                    
                                    return (
                                      <tr
                                        key={movement.id}
                                        onClick={() => handleMovementClick(movement, item)}
                                        className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                                      >
                                        <td className="px-3 py-2 text-gray-700">{dateStr}</td>
                                        <td className="px-3 py-2">
                                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMovementBadgeColor(movement.type)}`}>
                                            {movementType}
                                          </span>
                                        </td>
                                        <td className={`px-3 py-2 font-semibold ${
                                          movement.quantityUnits > 0 ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                          {movement.quantityUnits > 0 ? '+' : '−'} {Math.abs(movement.quantityUnits)}
                                        </td>
                                        <td className="px-3 py-2">
                                          {isReceiptMovement ? (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                downloadReceipt(movement, item);
                                              }}
                                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-xs"
                                              title="Click to download receipt"
                                            >
                                              {receiptLabel}
                                            </button>
                                          ) : (
                                            <span className="text-gray-500">−</span>
                                          )}
                                        </td>
                                        <td className="px-3 py-2 text-gray-700">{movement.linkedToId || '—'}</td>
                                        <td className="px-3 py-2">
                                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${descBadge.color}`}>
                                            {descBadge.label}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2 text-gray-700">{movement.comment || '—'}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
