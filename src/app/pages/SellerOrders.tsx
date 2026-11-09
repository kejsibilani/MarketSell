import React, { useState, useMemo } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { ChevronDown, ChevronUp, Package, Truck, RefreshCw, X, ImageIcon, FileText, Eye, Plus } from "lucide-react";
import formatNumber from "../utils/numberFormat";
import ShippingHistory from "../components/ShippingHistory";
import QuickFilters from "../components/QuickFilters";
import TableHeader from "../components/TableHeader";
import QuickActions from "../components/QuickActions";
import PageHeader from "../components/PageHeader";
import { getCountryFlag } from "../utils/countryFlags";
import type { Shipment, ShipmentHistoryEvent } from '../data/mockData';

interface OrderItem {
  skuId: string;
  quantity: number;
  price?: number;
  warehouse?: string;
  linkedShipmentIds?: string[];
  shippedQuantity?: number;
  ownerOfStock?: string;
}

interface Order {
  id: string;
  orderId: string;
  date: string;
  buyerName: string;
  buyerEmail: string;
  buyerCountry?: string;
  buyerDestination?: string;
  sellerCompanyId?: string;
  sellerCompany?: string;
  sellerEmail?: string;
  agent?: string;
  agentCommission?: number;
  orderSource?: 'agent' | 'operator' | 'owner' | 'storefront';
  orderSourceValue?: string;
  status: 'pending' | 'partial' | 'fulfilled' | 'cancelled';
  totalValue?: number;
  createdDate: string;
  dueDate?: string;
  notes?: string;
  items: OrderItem[];
  currency?: string;
  totalItems?: number;
  shipments?: Shipment[];
}

// ── Mock Data ────────────────────────────────────────────────────────────────
const SELLER_MOCK_SHIPMENTS = [
  {
    shipmentId: 'SELL-SHP-001',
    carrier: 'FedEx',
    trackingReference: 'FDX-SELL-001',
    trackingNumber: 'FDX-SELL-0001',
    internalTrackingNumber: 'INT-001',
    date: '2026-02-02T10:30:00Z',
    status: 'delivered',
    from: 'Rotterdam Warehouse',
    to: 'Germany',
    latestStatus: 'Delivered',
    pictures: [
      { name: 'roasted-beans-1.jpg' },
      { name: 'packaging-quality.jpg' },
      { name: 'final-box.jpg' },
    ],
    documents: [
      { name: 'Packing_List_SELL001.pdf', type: 'Packing List' },
      { name: 'Invoice_SELL001.pdf', type: 'Invoice' },
      { name: 'Certificate_of_Origin.pdf', type: 'Certificate' },
    ],
    history: [
      { timestamp: '02.02.26 14:30', location: 'Rotterdam Hub', statusDescription: 'Picked up' },
      { timestamp: '03.02.26 09:15', location: 'Madrid Sort Facility', statusDescription: 'In transit' },
      { timestamp: '04.02.26 18:45', location: 'Berlin Delivery Center', statusDescription: 'Out for delivery' },
      { timestamp: '05.02.26 10:20', location: 'Kestrel Inc', statusDescription: 'Delivered' },
    ],
  },
  {
    shipmentId: 'SELL-SHP-002',
    carrier: 'UPS',
    trackingReference: 'UPS-SELL-001',
    trackingNumber: 'UPS-SELL-0001',
    internalTrackingNumber: 'INT-002',
    date: '2026-01-24T09:00:00Z',
    status: 'delivered',
    from: 'Madrid Warehouse',
    to: 'Italy',
    latestStatus: 'Delivered',
    pictures: [
      { name: 'ethiopian-blend.jpg' },
      { name: 'sealed-package.jpg' },
    ],
    documents: [
      { name: 'Packing_List_SELL002.pdf', type: 'Packing List' },
      { name: 'Customs_Form.pdf', type: 'Customs' },
    ],
    history: [
      { timestamp: '24.01.26 10:00', location: 'Madrid Hub', statusDescription: 'Picked up' },
      { timestamp: '25.01.26 15:30', location: 'Rome Sort Facility', statusDescription: 'In transit' },
      { timestamp: '26.01.26 11:45', location: 'Ventura Marco Address', statusDescription: 'Delivered' },
    ],
  },
  {
    shipmentId: 'SELL-SHP-003',
    carrier: 'DHL',
    trackingReference: 'DHL-SELL-001',
    trackingNumber: 'DHL-SELL-0001',
    internalTrackingNumber: 'INT-003',
    date: '2026-01-21T14:30:00Z',
    status: 'delivered',
    from: 'Rotterdam Warehouse',
    to: 'France',
    latestStatus: 'Delivered',
    pictures: [
      { name: 'cacao-bulk.jpg' },
      { name: 'quality-inspection.jpg' },
      { name: 'ready-shipment.jpg' },
    ],
    documents: [
      { name: 'Packing_List_SELL003.pdf', type: 'Packing List' },
      { name: 'Invoice_SELL003.pdf', type: 'Invoice' },
      { name: 'Quality_Certificate.pdf', type: 'Certificate' },
    ],
    history: [
      { timestamp: '21.01.26 15:00', location: 'Rotterdam Hub', statusDescription: 'Picked up' },
      { timestamp: '22.01.26 10:20', location: 'Lyon Sort Facility', statusDescription: 'In transit' },
      { timestamp: '23.01.26 16:30', location: 'Best of Coffee Paris', statusDescription: 'Delivered' },
    ],
  },
];

const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    orderId: "SO-SELLER-001",
    date: "02.02.26",
    buyerName: "Kestrel Inc",
    buyerEmail: "orders@kestrel-cafe.example",
    buyerCountry: "DE",
    buyerDestination: "Berlin BE",
    sellerCompanyId: "seller-001",
    sellerCompany: "NFCOF Trading",
    sellerEmail: "sales@northfieldcoffee.example",
    agent: "Marco Rossi",
    agentCommission: 5.5,
    orderSource: "agent",
    orderSourceValue: "Marco Rossi",
    status: "fulfilled",
    items: [
      {
        skuId: "1",
        quantity: 100,
        price: 8.50,
        warehouse: "Rotterdam WH",
        linkedShipmentIds: ["SHP-0001", "SHP-0002"],
        shippedQuantity: 100,
        ownerOfStock: "NFCOF Trading",
      },
      {
        skuId: "2",
        quantity: 50,
        price: 12.00,
        warehouse: "Rotterdam WH",
        linkedShipmentIds: ["SHP-0003"],
        shippedQuantity: 50,
        ownerOfStock: "NFCOF Trading",
      },
    ],
    totalValue: 1450,
    currency: "EUR",
    totalItems: 150,
    createdDate: "2026-02-02T08:00:00Z",
    dueDate: "2026-02-20T23:59:59Z",
    notes: "Standard order for Q1 supply",
    shipments: [SELLER_MOCK_SHIPMENTS[0]],
  },
  {
    id: "2",
    orderId: "SO-SELLER-002",
    date: "24.01.26",
    buyerName: "Ventura Marco Ltd",
    buyerEmail: "procurement@ventura-caffe.example",
    buyerCountry: "IT",
    buyerDestination: "Milan MI",
    sellerCompanyId: "seller-002",
    sellerCompany: "NFCOF Trading",
    sellerEmail: "sales@northfieldcoffee.example",
    agent: "Sofia Benedetti",
    agentCommission: 4.5,
    orderSource: "agent",
    orderSourceValue: "Sofia Benedetti",
    status: "partial",
    items: [
      {
        skuId: "2",
        quantity: 200,
        price: 12.00,
        warehouse: "Madrid WH",
        linkedShipmentIds: ["SHP-0005", "SHP-0006"],
        shippedQuantity: 120,
        ownerOfStock: "NFCOF Trading",
      },
      {
        skuId: "1",
        quantity: 60,
        price: 8.50,
        warehouse: "Rotterdam WH",
        linkedShipmentIds: ["SHP-0007"],
        shippedQuantity: 0,
        ownerOfStock: "NFCOF Trading",
      },
    ],
    totalValue: 2910,
    currency: "EUR",
    totalItems: 260,
    createdDate: "2026-01-24T10:30:00Z",
    dueDate: "2026-02-24T23:59:59Z",
    notes: "Large order - partial shipment allowed",
    shipments: [SELLER_MOCK_SHIPMENTS[1]],
  },
  {
    id: "3",
    orderId: "SO-SELLER-003",
    date: "21.01.26",
    buyerName: "Best of Coffee Paris",
    buyerEmail: "supply@bestofcoffee.fr",
    buyerCountry: "FR",
    buyerDestination: "Paris IL",
    sellerCompanyId: "seller-003",
    sellerCompany: "NFCAO Specialties",
    sellerEmail: "sales@northfieldcacao.example",
    agent: "Jean Dubois",
    agentCommission: 3.5,
    orderSource: "agent",
    orderSourceValue: "Jean Dubois",
    status: "pending",
    items: [
      {
        skuId: "3",
        quantity: 80,
        price: 15.00,
        warehouse: "Valencia WH",
        linkedShipmentIds: ["SHP-0009", "SHP-0010"],
        shippedQuantity: 0,
        ownerOfStock: "NFCAO Specialties",
      },
    ],
    totalValue: 1200,
    currency: "EUR",
    totalItems: 80,
    createdDate: "2026-01-21T14:15:00Z",
    dueDate: "2026-02-21T23:59:59Z",
    notes: "Waiting for warehouse confirmation",
    shipments: [SELLER_MOCK_SHIPMENTS[2]],
  },
];

// ── Status helpers ────────────────────────────────────────────────────────────
const statusMeta: Record<string, { label: string; type: "success" | "warning" | "info" | "error" }> = {
  pending:    { label: "Pending",    type: "warning" },
  partial:    { label: "Partial",    type: "info"    },
  fulfilled:  { label: "Fulfilled",  type: "success" },
  cancelled:  { label: "Cancelled",  type: "error"   },
};

type AccordionSection = "items" | "transformations" | "shipping";

export default function SellerOrders() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [query, setQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<Record<string, AccordionSection | null>>({});
  const [openShipment, setOpenShipment] = useState<Record<string, string | null>>({});
  const [expandedItem, setExpandedItem] = useState<Record<string, string | null>>({});
  const [selectedShipmentForModal, setSelectedShipmentForModal] = useState<any>(null);
  const [activeModalTab, setActiveModalTab] = useState<'pictures' | 'documents'>('pictures');
  const [showCreateShipmentModal, setShowCreateShipmentModal] = useState(false);
  const [createShipmentData, setCreateShipmentData] = useState<any>(null);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_ORDERS.filter(o => {
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      if (!q) return true;
      return [o.orderId, o.buyerName, o.sellerCompany, o.agent].join(' ').toLowerCase().includes(q);
    });
  }, [filterStatus, query]);

  // Quick action stats
  const totalRevenue = filteredOrders.reduce((s, o) => s + (o.totalValue || 0), 0);
  const pendingCount = filteredOrders.filter(o => o.status === 'pending').length;
  const fulfilledCount = filteredOrders.filter(o => o.status === 'fulfilled').length;

  const toggleOrder = (id: string) => {
    setExpandedOrder(prev => (prev === id ? null : id));
    if (!openSection[id]) {
      setOpenSection(prev => ({ ...prev, [id]: "items" }));
    }
  };

  const toggleSection = (orderId: string, section: AccordionSection) => {
    setOpenSection(prev => ({
      ...prev,
      [orderId]: prev[orderId] === section ? null : section,
    }));
  };

  return (
      <div className="space-y-6">
        <PageHeader
          title="My Orders"
          description="Client sales orders across all your companies and storefronts"
          onExport={() => { /* stub */ }}
          onAddNew={() => alert('Add new order functionality coming soon!')}
          addNewLabel="New Order"
        />

        {/* Status filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
            {["all", "pending", "partial", "fulfilled", "cancelled"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize text-sm ${
                  filterStatus === s ? "bg-[#0B1F3A] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <QuickActions items={[
          { id: 'all', title: 'Total Orders', value: filteredOrders.length, active: filterStatus === 'all', onClick: () => { setQuery(''); setFilterStatus('all'); } },
          { id: 'revenue', title: 'Total Revenue', value: `€${formatNumber(totalRevenue)}`, onClick: () => { setQuery(''); } },
          { id: 'pending', title: 'Pending Orders', value: pendingCount, active: filterStatus === 'pending', onClick: () => { setQuery(''); setFilterStatus('pending'); } },
          { id: 'fulfilled', title: 'Fulfilled', value: fulfilledCount, active: filterStatus === 'fulfilled', onClick: () => { setQuery(''); setFilterStatus('fulfilled'); } },
        ]} />

        <div className="bg-white rounded-lg border border-gray-200">
          <TableHeader title="Orders" count={filteredOrders.length} query={query} setQuery={setQuery} status={filterStatus} setStatus={setFilterStatus}
            statusOptions={[{ value: 'pending', label: 'Pending' }, { value: 'partial', label: 'Partial' }, { value: 'fulfilled', label: 'Fulfilled' }, { value: 'cancelled', label: 'Cancelled' }]} />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-900 to-slate-800 border-b-2 border-slate-700">
                <tr>
                  <th className="px-4 py-3 w-12"></th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Seller</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Source of Order</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Buyer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Shipments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => {
                  const isExpanded = expandedOrder === order.id;
                  const section = openSection[order.id];
                  const meta = statusMeta[order.status];
                  return (
                    <>
                      {/* Main row */}
                      <tr key={order.id} className="hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-500">
                        <td className="px-4 py-3">
                          <button onClick={() => toggleOrder(order.id)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded transition-colors" title={isExpanded ? 'Collapse' : 'Expand'}>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        {/* Order Number + Date - Combined in one column */}
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-gray-900">
                            {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {new Date(order.date).toLocaleDateString('en-US', { year: '2-digit' })}
                          </div>
                          <div className="text-xs font-medium text-gray-600">#{order.orderId}</div>
                        </td>
                        {/* Seller Column - Company (top) + Seller Account (bottom) */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">
                              {order.sellerCompany}
                            </div>
                            <div className="text-xs text-gray-600">
                              {order.sellerEmail || '—'}
                            </div>
                          </div>
                        </td>
                        {/* Source of Order Column */}
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium text-gray-900">
                            {order.orderSource === 'agent' && `👤 Agent${order.orderSourceValue ? ` — ${order.orderSourceValue}` : ''}`}
                            {order.orderSource === 'operator' && '👨‍💼 Operator'}
                            {order.orderSource === 'owner' && '📋 Owner'}
                            {order.orderSource === 'storefront' && `🛍️ ${order.orderSourceValue || 'Storefront'}`}
                            {!order.orderSource && '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-sm">{getCountryFlag(order.buyerCountry || '')}</span>
                            <span className="text-xs font-semibold text-gray-900">{order.buyerName}</span>
                          </div>
                          <div className="text-xs text-gray-600">📍 {order.buyerDestination || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-bold text-gray-900">€{formatNumber(order.totalValue || 0)}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{order.totalItems || 0} items</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1.5">
                            {(() => {
                              // Collect all unique shipment IDs from items
                              const allShipmentIds = new Set<string>();
                              order.items.forEach((item: any) => {
                                (item.linkedShipmentIds || []).forEach((id: string) => allShipmentIds.add(id));
                              });

                              const shipmentArray = Array.from(allShipmentIds).sort();
                              
                              if (shipmentArray.length === 0) {
                                return (
                                  <button
                                    onClick={() => toggleOrder(order.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors"
                                    title="No shipments yet - click to expand"
                                  >
                                    <span>⏱</span>
                                    <span>Pending</span>
                                  </button>
                                );
                              }

                              // Render each shipment separately
                              return shipmentArray.map((shipmentId: string) => {
                                const shipment = SELLER_MOCK_SHIPMENTS?.find(s => s.shipmentId === shipmentId);
                                const status = shipment?.status || 'pending';
                                
                                // Get status icon and color
                                let icon = '⏱';
                                let bgColor = 'bg-blue-100';
                                let textColor = 'text-blue-800';
                                let hoverColor = 'hover:bg-blue-200';
                                
                                if (status === 'delivered') {
                                  icon = '✓';
                                  bgColor = 'bg-green-100';
                                  textColor = 'text-green-800';
                                  hoverColor = 'hover:bg-green-200';
                                } else if (status === 'in_transit') {
                                  icon = '→';
                                  bgColor = 'bg-orange-100';
                                  textColor = 'text-orange-800';
                                  hoverColor = 'hover:bg-orange-200';
                                }

                                // Get shipment number from ID (e.g., "SHP-0001" -> "0001")
                                const shipmentNum = shipmentId.substring(4);

                                return (
                                  <button
                                    key={shipmentId}
                                    onClick={() => {
                                      toggleOrder(order.id);
                                    }}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold w-full ${bgColor} ${textColor} ${hoverColor} cursor-pointer transition-colors`}
                                    title={`Shipment ${shipmentId} - ${status}`}
                                  >
                                    <span className="text-sm">{icon}</span>
                                    <span className="font-mono">{shipmentNum}</span>
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </td>
                      </tr>

                      {/* Accordion panel */}
                      {isExpanded && (
                        <tr key={`${order.id}-expanded`}>
                          <td colSpan={8} className="px-6 py-0 bg-gray-50">
                            <div className="p-6 space-y-4">
                              {/* Items Table */}
                              <div className="bg-white rounded-lg overflow-hidden">
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-gray-100 border-b border-gray-200">
                                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">SKU</th>
                                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Units</th>
                                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Warehouse</th>
                                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Shipped</th>
                                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Owner</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {order.items.map((item, i) => (
                                      <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                          <div className="font-medium text-gray-900">{item.skuId}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                          <div className="font-medium text-gray-900">{item.quantity}</div>
                                          <div className="text-xs text-gray-600">({(item.quantity * 0.4).toFixed(2)}kg)</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                          <div className="font-medium text-gray-900">€{item.price ? formatNumber(item.price * item.quantity) : 'N/A'}</div>
                                          <div className="text-xs text-gray-600">21.4% ES VAT</div>
                                          <div className="text-xs text-gray-600">€{item.price ? formatNumber((item.price * item.quantity) * 0.214) : 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.warehouse || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-center">
                                          <div className="font-medium text-gray-900">{item.shippedQuantity || 0}</div>
                                          <div className="text-xs text-gray-600">({((item.shippedQuantity || 0) * 0.4).toFixed(2)}kg)</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.ownerOfStock || 'N/A'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { label: "Total Orders", value: filteredOrders.length, color: "text-gray-900" },
            { label: "Total Revenue", value: `€${formatNumber(filteredOrders.reduce((s, o) => s + (o.totalValue || 0), 0))}`, color: "text-gray-900" },
            { label: "Pending", value: filteredOrders.filter(o => o.status === "pending").length, color: "text-orange-600" },
            { label: "Fulfilled", value: filteredOrders.filter(o => o.status === "fulfilled").length, color: "text-green-600" },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm text-gray-600 mb-1">{kpi.label}</h3>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Shipment Details Modal */}
        {selectedShipmentForModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Shipment Details</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedShipmentForModal.shipmentId}</p>
                </div>
                <button
                  onClick={() => setSelectedShipmentForModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8">
                {/* Shipment Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">From</p>
                    <p className="text-gray-900 font-medium">{selectedShipmentForModal.from || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">To</p>
                    <p className="text-gray-900 font-medium">{selectedShipmentForModal.to || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Carrier</p>
                    <p className="text-gray-900 font-medium">{selectedShipmentForModal.carrier || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Tracking</p>
                    <p className="text-gray-900 font-mono font-medium text-sm">{selectedShipmentForModal.trackingReference || selectedShipmentForModal.trackingNumber || 'N/A'}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex gap-6">
                    <button
                      onClick={() => setActiveModalTab('pictures')}
                      className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeModalTab === 'pictures'
                          ? 'border-blue-600 text-gray-900'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 inline mr-2" />
                      Pictures ({selectedShipmentForModal.pictures?.length ?? 0})
                    </button>
                    <button
                      onClick={() => setActiveModalTab('documents')}
                      className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeModalTab === 'documents'
                          ? 'border-blue-600 text-gray-900'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <FileText className="w-4 h-4 inline mr-2" />
                      Documents ({selectedShipmentForModal.documents?.length ?? 0})
                    </button>
                  </div>
                </div>

                {/* Pictures Tab */}
                {activeModalTab === 'pictures' && (
                  <div className="grid grid-cols-2 gap-4">
                    {(selectedShipmentForModal.pictures ?? []).map((pic: any, idx: number) => (
                      <div key={idx} className="aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-600 font-medium">{pic.name}</p>
                        </div>
                      </div>
                    ))}
                    {(!selectedShipmentForModal.pictures || selectedShipmentForModal.pictures.length === 0) && (
                      <div className="col-span-2 p-8 text-center text-gray-500">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No pictures available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Documents Tab */}
                {activeModalTab === 'documents' && (
                  <div className="space-y-2">
                    {(selectedShipmentForModal.documents ?? []).map((doc: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.type}</p>
                          </div>
                        </div>
                        <button className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100">
                          Download
                        </button>
                      </div>
                    ))}
                    {(!selectedShipmentForModal.documents || selectedShipmentForModal.documents.length === 0) && (
                      <div className="p-8 text-center text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No documents available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 flex gap-3 bg-gray-50">
                <button
                  onClick={() => setSelectedShipmentForModal(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                <button
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Shipment Modal */}
        {showCreateShipmentModal && createShipmentData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Create Shipment</h2>
                <button onClick={() => setShowCreateShipmentModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600">Order</p>
                  <p className="font-semibold text-gray-900">{createShipmentData.orderId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipment ID *</label>
                  <input
                    type="text"
                    placeholder="e.g., SHP-2026-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipment Type *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="standard">Standard Shipment</option>
                    <option value="express">Express Shipment</option>
                    <option value="bulk">Bulk Cargo</option>
                    <option value="fragile">Fragile Goods</option>
                    <option value="temperature-controlled">Temperature Controlled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carrier *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Select Carrier --</option>
                    <option value="FedEx">FedEx</option>
                    <option value="UPS">UPS</option>
                    <option value="DHL">DHL</option>
                    <option value="DPD">DPD</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Reference *</label>
                    <input
                      type="text"
                      placeholder="e.g., FDX-2026-0001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                    <input
                      type="text"
                      placeholder="e.g., FDX2026000100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateShipmentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCreateShipmentModal(false);
                    alert('Shipment created successfully!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Create Shipment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}