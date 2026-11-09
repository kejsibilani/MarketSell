import { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatusBadge } from '../components/StatusBadge';
import { products } from '../data/mockData';
import { Eye, Package, FileText, ShoppingCart, TrendingUp } from 'lucide-react';
import formatNumber from '../utils/numberFormat';
import { ChevronDown, ChevronUp, RefreshCw, Truck } from 'lucide-react';
import ShippingHistory from '../components/ShippingHistory';
import QuickFilters from '../components/QuickFilters';
import TableHeader from '../components/TableHeader';
import PageHeader from '../components/PageHeader';

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState<'skus' | 'stock'>('skus');
  const [selectedMarketplace, setSelectedMarketplace] = useState<'all' | 'origo' | 'peakline' | 'ember'>('all');

  const marketplaces = [
    { id: 'origo', name: 'Origo', color: 'bg-blue-500' },
    { id: 'peakline', name: 'Peakline', color: 'bg-purple-500' },
    { id: 'ember', name: 'Ember', color: 'bg-green-500' },
  ];

  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<Record<string, string | null>>({});
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('all');

  const statuses = Array.from(new Set(products.map(p => p.status)));

  // Mock stock movement log (keyed by product id)
  const STOCK_LOG: Record<string, { date: string; type: string; units: number; kg: number; source: string; company: string }[]> = {
    '1': [
      { date: '2026-05-01', type: 'In — Replenishment',   units: 500, kg: 30000, source: 'REP-2026-001', company: 'NFCOF' },
      { date: '2026-05-03', type: 'Out — Client Order',    units: -20, kg: -1200, source: 'ORD-2026-001', company: 'NFCOF' },
    ],
    '2': [
      { date: '2026-04-15', type: 'In — Replenishment',   units: 200, kg: 5000,  source: 'REP-2026-002', company: 'NFCAO' },
      { date: '2026-05-02', type: 'Out — Client Order',    units: -30, kg: -750,  source: 'ORD-2026-002', company: 'NFCAO' },
      { date: '2026-05-04', type: 'Adj — Stock Count',     units: -5,  kg: -125,  source: 'ADJ-0088',     company: 'NFCAO' },
    ],
  };

  const TRANSFORMATION_LOG: Record<string, { date: string; type: string; qty: number; cost: number; status: string }[]> = {
    '1': [
      { date: '2026-04-18', type: 'Roasting', qty: 10, cost: 70.00, status: 'Completed' },
    ],
    '2': [],
  };

  const SHIPPING_LOG: Record<string, { date: string; event: string; carrier: string; trackingRef: string; location: string }[]> = {
    '1': [
      { date: '2026-04-30', event: 'Shipment arrived at warehouse', carrier: 'Costas Ocean', trackingRef: 'CST-8812', location: 'Rotterdam WH' },
    ],
    '2': [
      { date: '2026-04-14', event: 'Shipment arrived at warehouse', carrier: 'FedEx',        trackingRef: 'FX-22193', location: 'Chisinau WH' },
    ],
  };

  const toggleSection = (productId: string, section: string) => {
    setOpenSection(prev => ({ ...prev, [productId]: prev[productId] === section ? null : section }));
  };

  return (
      <div className="space-y-6">
        <QuickFilters />
        <PageHeader
          title="Inventory Management"
          description="Manage stock across all warehouses and marketplaces"
          onExport={() => { /* stub */ }}
          onAddNew={() => { /* stub */ }}
          exportLabel="Export to Excel"
          addNewLabel="Add Stock"
        />

        {/* Tab Switcher */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('skus')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'skus'
                  ? 'text-[#0B1F3A] border-b-2 border-[#0B1F3A] bg-[#0B1F3A]/5'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package className="w-4 h-4" />
                SKUs & Products
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'stock'
                  ? 'text-[#0B1F3A] border-b-2 border-[#0B1F3A] bg-[#0B1F3A]/5'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Stock Levels & Movements
              </div>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Marketplace:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMarketplace('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedMarketplace === 'all'
                      ? 'bg-[#0B1F3A] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {marketplaces.map((mp) => (
                  <button
                    key={mp.id}
                    onClick={() => setSelectedMarketplace(mp.id as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedMarketplace === mp.id
                        ? 'bg-[#0B1F3A] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mp.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Status filter (operator pattern) */}
          <div className="mt-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
                {['all', ...statuses].map(s => (
                  <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {s === 'all' ? 'All' : String(s).replace(/_/g,' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SKUs Tab - Product Master Data */}
        {activeTab === 'skus' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <TableHeader title="SKUs & Product Master Data" count={products.length} query={query} setQuery={setQuery} status={status} setStatus={setStatus} statusOptions={[]} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 w-12"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lot</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => {
                    const unitsPerBag = 60;
                    const units = Math.floor(product.stock / unitsPerBag);
                    const companyCode = product.owner === 'Northfield Coffee' ? 'NFCOF' : 'NFCAO';

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-center">
                          <div className="w-5 h-5 bg-gray-200 rounded" />
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-900">{companyCode}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{product.lot || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.warehouse}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.owner}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{units}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">${(product.price || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-[#0B1F3A] hover:underline flex items-center gap-1">
                            <Eye className="w-4 h-4" /> Manage
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={product.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">⋯</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stock Tab - Inventory Levels & Movements */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <TableHeader title="Stock Movements & Transformations" count={products.length} query={query} setQuery={setQuery} status={status} setStatus={setStatus} statusOptions={[]} />
              <div className="p-6 space-y-4">
                {products.map((product) => {
                  const productIdStr = String(product.id);
                  const section = openSection[productIdStr];

                  return (
                    <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Stock Movement Log */}
                      <div className="bg-gray-50">
                        <button
                          onClick={() => toggleSection(productIdStr, "stock")}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100"
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Package className="w-4 h-4 text-[#0B1F3A]" />
                            {product.name} — Stock Movements
                          </span>
                          {section === "stock" ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>
                        {section === "stock" && (
                          (STOCK_LOG[productIdStr] || []).length === 0
                            ? <p className="px-4 py-3 text-sm text-gray-400 border-t border-gray-100">No stock movements recorded.</p>
                            : (
                              <table className="w-full border-t border-gray-100">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Type</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Co.</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Units</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Equiv. kg</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Source Ref</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                  {(STOCK_LOG[productIdStr] || []).map((m, i) => (
                                    <tr key={i}>
                                      <td className="px-4 py-2 text-sm text-gray-600">{m.date}</td>
                                      <td className="px-4 py-2">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                          m.units > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>{m.type}</span>
                                      </td>
                                      <td className="px-4 py-2">
                                        <span className="text-xs font-mono font-bold bg-[#0B1F3A]/10 text-[#0B1F3A] px-1.5 py-0.5 rounded">{m.company}</span>
                                      </td>
                                      <td className={`px-4 py-2 text-sm font-semibold ${m.units > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {m.units > 0 ? '+' : ''}{formatNumber(m.units)}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-600">{formatNumber(m.kg)} kg</td>
                                      <td className="px-4 py-2"><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{m.source}</code></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )
                        )}
                      </div>

                      {/* Transformation History */}
                      <div className="bg-gray-50 border-t border-gray-200">
                        <button
                          onClick={() => toggleSection(productIdStr, "transformations")}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100"
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <RefreshCw className="w-4 h-4 text-amber-600" />
                            Transformation History
                          </span>
                          {section === "transformations" ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>
                        {section === "transformations" && (
                          (TRANSFORMATION_LOG[productIdStr] || []).length === 0
                            ? <p className="px-4 py-3 text-sm text-gray-400 border-t border-gray-100">No transformation orders for this SKU.</p>
                            : (
                              <table className="w-full border-t border-gray-100">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Type</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Qty (units)</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Cost (EUR)</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                  {(TRANSFORMATION_LOG[productIdStr] || []).map((t, i) => (
                                    <tr key={i}>
                                      <td className="px-4 py-2 text-sm text-gray-600">{t.date}</td>
                                      <td className="px-4 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">{t.type}</span></td>
                                      <td className="px-4 py-2 text-sm">{formatNumber(t.qty)}</td>
                                      <td className="px-4 py-2 text-sm font-medium">{formatNumber(t.cost)} EUR</td>
                                      <td className="px-4 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">{t.status}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )
                        )}
                      </div>

                      {/* Shipping History */}
                      <div className="bg-gray-50 border-t border-gray-200">
                        <button
                          onClick={() => toggleSection(productIdStr, "shipping")}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100"
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Truck className="w-4 h-4 text-blue-600" />
                            Shipping History
                          </span>
                          {section === "shipping" ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>
                        {section === 'shipping' && (
                          <ShippingHistory events={(SHIPPING_LOG[productIdStr] || [])} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-2">Allocate Stock</h3>
            <p className="text-sm text-gray-600 mb-4">
              Assign products to agents or allocate to specific marketplaces
            </p>
            <button className="text-[#0B1F3A] hover:underline font-medium text-sm">
              Manage Allocation →
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-2">Transformation Orders</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send stock for roasting, packaging, or other processing
            </p>
            <button className="text-[#0B1F3A] hover:underline font-medium text-sm">
              Create Order →
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-2">Adjust Visibility</h3>
            <p className="text-sm text-gray-600 mb-4">
              Control which products appear on which storefronts
            </p>
            <button className="text-[#0B1F3A] hover:underline font-medium text-sm">
              Manage Visibility →
            </button>
          </div>
        </div>
      </div>
  );
}
