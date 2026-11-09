import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import QuickFilters from '../components/QuickFilters';
import { StatusBadge } from '../components/StatusBadge';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import ShippingHistory from '../components/ShippingHistory';
import formatNumber from '../utils/numberFormat';
import { getCountryFlag } from '../utils/countryFlags';

interface OrderItem {
  sku: string;
  productName: string;
  units: number;
  kg: number;
}

interface Order {
  id: string;
  company: string;
  customer: string;
  country: string;
  countryFlag: string;
  channel: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
}

interface TransMany {
  date: string;
  type: string;
  fromItems: { sku: string; productName?: string; units?: number }[];
  toItems: { sku: string; productName?: string; units?: number }[];
  units?: number;
  cost?: number;
  status?: string;
}

const TRANSFORMATION_BY_ORDER: Record<string, TransMany[]> = {
  'ORD-2026-001': [
    {
      date: '2026-04-28',
      type: 'Roasting',
      fromItems: [{ sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo — 60 kg bag', units: 1 }],
      toItems: [{ sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — 1 kg bag', units: 10 }],
      units: 10,
      cost: 70.0,
      status: 'Completed',
    },
  ],
  'ORD-2026-002': [],
  'ORD-2026-003': [],
  'ORD-2026-004': [],
};

const SHIPPING_BY_ORDER: Record<string, { date: string; event: string; carrier: string; trackingRef: string; location: string }[]> = {
  'ORD-2026-001': [
    { date: '2026-05-06 08:00', event: 'Collected', carrier: 'FedEx', trackingRef: 'FX-992211', location: 'Rotterdam WH' },
    { date: '2026-05-06 22:15', event: 'In transit', carrier: 'FedEx', trackingRef: 'FX-992211', location: 'Lyon Hub' },
  ],
  'ORD-2026-002': [
    { date: '2026-05-05 09:00', event: 'Shipped', carrier: 'Costas Ocean', trackingRef: 'CST-77231', location: 'Rotterdam WH → Marseille Port' },
    { date: '2026-05-05 18:00', event: 'Arrived', carrier: 'Costas Ocean', trackingRef: 'CST-77231', location: 'Marseille Port' },
  ],
  'ORD-2026-003': [
    { date: '2026-05-02', event: 'Delivered', carrier: 'TNT', trackingRef: 'TNT-55012', location: 'Frankfurt' },
  ],
  'ORD-2026-004': [],
};

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2026-001',
    company: 'NFCOF',
    customer: 'Café Central',
    country: 'Spain',
    countryFlag: '🇪🇸',
    channel: 'MarketSell Mkt',
    items: [
      { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo — 60 kg bag', units: 10, kg: 600 },
      { sku: 'RC-ETH-002-1KG', productName: 'Ethiopian Yirgacheffe — 1 kg bag', units: 50, kg: 50 },
    ],
    totalAmount: 16230,
    currency: 'EUR',
    status: 'processing',
    date: '2026-05-05',
  },
  {
    id: 'ORD-2026-002',
    company: 'NFCAO',
    customer: 'Chocolat Monde',
    country: 'France',
    countryFlag: '🇫🇷',
    channel: 'Origo.com',
    items: [
      { sku: 'CAC-ECU-001-25KG', productName: 'Ecuadorian Cacao — 25 kg bag', units: 20, kg: 500 },
    ],
    totalAmount: 8750,
    currency: 'EUR',
    status: 'shipped',
    date: '2026-05-04',
  },
  {
    id: 'ORD-2026-003',
    company: 'NFCOF',
    customer: 'Coffee Lab',
    country: 'Germany',
    countryFlag: '🇩🇪',
    channel: 'Ember.com',
    items: [
      { sku: 'GC-BRA-003-60KG', productName: 'Brazilian Santos — 60 kg bag', units: 15, kg: 900 },
      { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo — 60 kg bag', units: 10, kg: 600 },
      { sku: 'RC-ETH-002-1KG', productName: 'Ethiopian Yirgacheffe — 1 kg bag', units: 100, kg: 100 },
    ],
    totalAmount: 22440,
    currency: 'EUR',
    status: 'delivered',
    date: '2026-05-01',
  },
  {
    id: 'ORD-2026-004',
    company: 'NFCOF',
    customer: 'Torino Roasters',
    country: 'Italy',
    countryFlag: '🇮🇹',
    channel: 'MarketSell Mkt',
    items: [
      { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo — 60 kg bag', units: 25, kg: 1500 },
    ],
    totalAmount: 12500,
    currency: 'EUR',
    status: 'pending',
    date: '2026-05-06',
  },
];

export default function OrdersManagement() {
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [openSection, setOpenSection] = useState<Record<string, string | null>>({});

  const toggleSection = (orderId: string, section: string) => {
    setOpenSection(prev => ({ ...prev, [orderId]: prev[orderId] === section ? null : section }));
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  return (
      <div className="space-y-6">
        <QuickFilters />
        <div className="flex items-center justify-between">

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <div className="flex gap-2">
              {['all', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    filterStatus === status
                      ? 'bg-[#0B1F3A] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status filter (operator-style compact) */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
            {['all','pending','processing','shipped','delivered'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#0B1F3A]">Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold bg-gray-100 text-gray-700">
                            {order.company}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 text-gray-900">{order.customer}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl" title={order.country}>{getCountryFlag(order.country)}</span>
                            <span className="text-gray-900">{order.country}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {order.channel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">{order.items[0].productName}</span>
                            {order.items.length > 1 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">
                                +{order.items.length - 1} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {formatNumber(order.totalAmount)} {order.currency}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={order.status}
                            type={getStatusColor(order.status) as any}
                          />
                        </td>
                        <td className="px-6 py-4 text-gray-600">{order.date}</td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              {/* Section toggles */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleSection(order.id, 'items')}
                                  className={`px-3 py-1 rounded-md text-sm font-medium ${openSection[order.id] === 'items' ? 'bg-[#0B1F3A] text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                                >
                                  Items
                                </button>
                                <button
                                  onClick={() => toggleSection(order.id, 'transformations')}
                                  className={`px-3 py-1 rounded-md text-sm font-medium ${openSection[order.id] === 'transformations' ? 'bg-[#0B1F3A] text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                                >
                                  Transformations
                                </button>
                                <button
                                  onClick={() => toggleSection(order.id, 'shipping')}
                                  className={`px-3 py-1 rounded-md text-sm font-medium ${openSection[order.id] === 'shipping' ? 'bg-[#0B1F3A] text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                                >
                                  Shipping
                                </button>
                              </div>

                              {/* Items section */}
                              {openSection[order.id] === 'items' && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Order Items:</h4>
                                  <div className="bg-white rounded border border-gray-200">
                                    <table className="w-full">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Units</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total Weight</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {order.items.map((item, idx) => (
                                          <tr key={idx}>
                                            <td className="px-4 py-2">
                                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{item.sku}</code>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{formatNumber(item.units)} units</td>
                                            <td className="px-4 py-2 text-sm text-gray-600">{formatNumber(item.kg)} kg</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Transformations section */}
                              {openSection[order.id] === 'transformations' && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Transformations</h4>
                                  <div className="bg-white rounded border border-gray-200">
                                    <table className="w-full">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">From SKU</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">To SKU</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Units</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Cost</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {(TRANSFORMATION_BY_ORDER[order.id] || []).map((t, i) => (
                                          <tr key={i}>
                                            <td className="px-4 py-2 text-sm text-gray-600">{t.date}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{t.type}</td>
                                            <td className="px-4 py-2 text-sm">
                                              <div className="text-sm">{(t.fromItems || []).map(fi => `${fi.sku}${fi.units ? ` (${fi.units})` : ''}`).join(', ')}</div>
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                              <div className="text-sm">{(t.toItems || []).map(fi => `${fi.sku}${fi.units ? ` (${fi.units})` : ''}`).join(', ')}</div>
                                            </td>
                                            <td className="px-4 py-2 text-right text-sm text-gray-900">{formatNumber(t.units ?? 0)}</td>
                                            <td className="px-4 py-2 text-right text-sm text-gray-900">{t.cost ? `€${formatNumber(t.cost)}` : ''}</td>
                                            <td className="px-4 py-2 text-sm"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">{t.status}</span></td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Shipping section */}
                              {openSection[order.id] === 'shipping' && (
                                <div>
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900 mb-2">Shipping History</h4>
                                    <div className="text-sm text-gray-600">Internal #: <code className="bg-gray-100 px-2 py-1 rounded">{order.id}</code></div>
                                  </div>
                                  <div className="bg-white rounded border border-gray-200">
                                    <ShippingHistory events={SHIPPING_BY_ORDER[order.id] || []} parentInternalId={order.id} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm text-gray-600 mb-1">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm text-gray-600 mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">
              €{formatNumber(filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm text-gray-600 mb-1">Pending Orders</h3>
            <p className="text-2xl font-bold text-orange-600">
              {filteredOrders.filter(o => o.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm text-gray-600 mb-1">Delivered Orders</h3>
            <p className="text-2xl font-bold text-green-600">
              {filteredOrders.filter(o => o.status === 'delivered').length}
            </p>
          </div>
        </div>
      </div>
          </div>
  );
}
