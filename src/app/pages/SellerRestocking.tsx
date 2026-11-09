import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Truck, Package } from "lucide-react";
import ShippingHistory from '../components/ShippingHistory';
import QuickFilters from '../components/QuickFilters';
import TableHeader from '../components/TableHeader';
import QuickActions from '../components/QuickActions';
import PageHeader from '../components/PageHeader';
import formatNumber from "../utils/numberFormat";

interface ReplenishmentOrder {
  id: string; date: string; company: string; product: string; sku: string;
  qty: number; warehouse: string; requestedDate: string;
  status: "pending" | "approved" | "awaiting" | "received" | "rejected";
  shipments?: import('../data/mockData').Shipment[];
}

const STATUS_META: Record<string, { label: string; type: "success" | "warning" | "info" | "error" }> = {
  pending:   { label: "Pending Approval", type: "warning" },
  approved:  { label: "Approved",         type: "info"    },
  awaiting:  { label: "Awaiting Shipment",type: "info"    },
  received:  { label: "Received — In Stock", type: "success" },
  rejected:  { label: "Rejected",         type: "error"   },
};

const MOCK: ReplenishmentOrder[] = [
  {
    id: "REP-2026-001", date: "01.05.26", company: "NFCOF",
    product: "Colombian Supremo Green Coffee — 60 kg bag", sku: "GC-COL-001-60KG",
    qty: 50, warehouse: "Rotterdam WH", requestedDate: "10.05.26", status: "received",
    shipments: [
      {
        shipmentId: 'SHP-101', internalTrackingNumber: 'ISP-5001', carrier: 'Costas Ocean', trackingReference: 'CST-5001', latestStatus: 'Delivered', date: '2026-05-09', units: 50,
        history: [
          { timestamp: '2026-05-05 08:00', location: 'Bogotá, Colombia', statusDescription: 'Shipped by seller' },
          { timestamp: '2026-05-08 12:00', location: 'Cartagena Port', statusDescription: 'In transit — at port' },
          { timestamp: '2026-05-09 16:00', location: 'Rotterdam WH', statusDescription: 'Arrived at warehouse' },
        ],
      },
    {
        shipmentId: 'SHP-101', internalTrackingNumber: 'ISP-5001', carrier: 'Costas Ocean', trackingReference: 'CST-5001', latestStatus: 'Delivered', date: '2026-05-09', units: 50,
        history: [
          { timestamp: '2026-05-05 08:00', location: 'Bogotá, Colombia', statusDescription: 'Shipped by seller' },
          { timestamp: '2026-05-08 12:00', location: 'Cartagena Port', statusDescription: 'In transit — at port' },
          { timestamp: '2026-05-09 16:00', location: 'Rotterdam WH', statusDescription: 'Arrived at warehouse' },
        ],
      }
    ],
  },
  {
    id: "REP-2026-002", date: "10.05.26", company: "NFCAO",
    product: "Ecuadorian Cacao — 25 kg sack", sku: "CAC-ECU-001-25KG",
    qty: 30, warehouse: "Chisinau WH", requestedDate: "20.05.26", status: "awaiting",
  shipments: [
      {
        shipmentId: 'SHP-201', internalTrackingNumber: 'ISP-7001', carrier: 'TransMar', trackingReference: 'TM-7001', latestStatus: 'In Transit', date: '2026-05-12',
        history: [
          { timestamp: '2026-05-11 09:30', location: 'Guayaquil, Ecuador', statusDescription: 'Picked up by carrier' },
          { timestamp: '2026-05-12 14:20', location: 'On board vessel', statusDescription: 'Departed port' },
        ],
      },
      {
        shipmentId: 'SHP-202', internalTrackingNumber: 'ISP-7002', carrier: 'AirLift', trackingReference: 'AL-7002', latestStatus: 'Scheduled', date: '2026-05-15',
        history: [
          { timestamp: '2026-05-14 07:00', location: 'Guayaquil Airport', statusDescription: 'Awaiting departure' },
        ],
      }
    ],
  },
  {
    id: "REP-2026-003", date: "15.05.26", company: "NFCOF",
    product: "Brazilian Santos Green Coffee — 60 kg bag", sku: "GC-BRA-003-60KG",
    qty: 20, warehouse: "Rotterdam WH", requestedDate: "25.05.26", status: "pending",
  shipments: [],
  },
];

export default function SellerRestocking() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openShipment, setOpenShipment] = useState<Record<string, string | null>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK.filter(r => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (!q) return true;
      return [r.id, r.product, r.sku, r.company].join(' ').toLowerCase().includes(q);
    });
  }, [filterStatus, query]);

  const totalQty = filtered.reduce((s, r) => s + r.qty, 0);
  const awaiting = filtered.filter(r => r.status === 'awaiting').length;
  const received = filtered.filter(r => r.status === 'received').length;

  return (
      <div className="space-y-6">
        <PageHeader
          title="My Replenishment Orders"
          description="Track stock shipments from your facilities to MarketSell warehouses"
          onExport={() => { /* stub */ }}
          onAddNew={() => alert('Create new replenishment order functionality coming soon!')}
          addNewLabel="New Replenishment Order"
        />

        {/* Status filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
            {["all", "pending", "approved", "awaiting", "received", "rejected"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === s ? "bg-[#0B1F3A] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {STATUS_META[s]?.label ?? "All"}
              </button>
            ))}
          </div>
        </div>

        <QuickActions items={[
          { id: 'all', title: 'Replenishment Orders', value: filtered.length, active: filterStatus === 'all', onClick: () => { setQuery(''); setFilterStatus('all'); } },
          { id: 'qty', title: 'Total Qty', value: formatNumber(totalQty), onClick: () => { setQuery(''); } },
          { id: 'awaiting', title: 'Awaiting Shipment', value: awaiting, active: filterStatus === 'awaiting', onClick: () => { setQuery(''); setFilterStatus('awaiting'); } },
          { id: 'received', title: 'Received', value: received, active: filterStatus === 'received', onClick: () => { setQuery(''); setFilterStatus('received'); } },
        ]} />

        <div className="bg-white rounded-lg border border-gray-200">
          <TableHeader title="Replenishment Orders" count={filtered.length} query={query} setQuery={setQuery} status={filterStatus} setStatus={setFilterStatus}
            statusOptions={[{ value: 'pending', label: 'Pending Approval' }, { value: 'approved', label: 'Approved' }, { value: 'awaiting', label: 'Awaiting Shipment' }, { value: 'received', label: 'Received' }]} />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-12"></th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product (SKU)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Warehouse</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Req. Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(r => {
                  const isExpanded = expandedId === r.id;
                  const meta = STATUS_META[r.status];
                  return (
                    <>
                      <tr key={r.id} className="hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-500">
                        <td className="px-6 py-4">
                          <button onClick={() => setExpandedId(isExpanded ? null : r.id)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded transition-colors" title={isExpanded ? 'Collapse' : 'Expand'}>
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 text-sm">{r.id}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            {r.company}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{r.product}</div>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono mt-1 inline-block">{r.sku}</code>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatNumber(r.qty)} units</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{r.warehouse}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{r.requestedDate}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            r.status === 'received' ? 'bg-green-100 text-green-800' :
                            r.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            r.status === 'awaiting' ? 'bg-amber-100 text-amber-800' :
                            r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {meta.label}
                          </span>
                        </td>
                      </tr>

                      {/* Accordion panel */}
                      {isExpanded && (
                        <tr key={`${r.id}-exp`}>
                          <td colSpan={9} className="px-6 py-0 bg-[#F5F7FA]">
                            <div className="py-4 space-y-2">

                              {/* Details */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                                  <Package className="w-4 h-4 text-[#0B1F3A]" /> Order Details
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div><span className="text-gray-500">SKU</span><div className="font-medium mt-0.5">{r.sku}</div></div>
                                  <div><span className="text-gray-500">Quantity</span><div className="font-medium mt-0.5">{formatNumber(r.qty)} units</div></div>
                                  <div><span className="text-gray-500">Target Warehouse</span><div className="font-medium mt-0.5">{r.warehouse}</div></div>
                                  <div><span className="text-gray-500">Requested Date</span><div className="font-medium mt-0.5">{r.requestedDate}</div></div>
                                </div>
                              </div>

                              {/* Shipping History */}
                              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="px-4 py-3 flex items-center gap-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
                                  <Truck className="w-4 h-4 text-blue-600" />
                                  Shipments ({(r.shipments || []).length})
                                </div>
                                {(r.shipments || []).length === 0 ? (
                                  <p className="px-4 py-3 text-sm text-gray-400">No shipments recorded yet.</p>
                                ) : (
                                  <div className="border-t border-gray-100">
                                    <table className="w-full">
                                      <thead className="bg-gray-50 text-xs text-gray-500">
                                        <tr>
                                          <th className="px-4 py-2"></th>
                                          <th className="px-4 py-2 text-left">Shipment #</th>
                                          <th className="px-4 py-2 text-left">Carrier</th>
                                          <th className="px-4 py-2 text-left">Tracking</th>
                                          <th className="px-4 py-2 text-left">Latest status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 text-sm">
                                        {(r.shipments || []).map(s => (
                                          <React.Fragment key={s.shipmentId}>
                                            <tr className="hover:bg-gray-50">
                                              <td className="px-4 py-2">
                                                <button onClick={() => setOpenShipment(prev => ({ ...prev, [r.id]: prev[r.id] === s.shipmentId ? null : s.shipmentId }))} className="text-gray-500 hover:text-gray-700">
                                                  {openShipment[r.id] === s.shipmentId ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                              </td>
                                              <td className="px-4 py-2 font-mono">{s.shipmentId}</td>
                                              <td className="px-4 py-2">{s.carrier}</td>
                                              <td className="px-4 py-2"><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{s.trackingReference}</code></td>
                                              <td className="px-4 py-2 text-gray-700">{s.latestStatus}</td>
                                            </tr>

                                            {openShipment[r.id] === s.shipmentId && (
                                              <tr>
                                                <td colSpan={5} className="px-4 py-2 bg-gray-50">
                                                  <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                      <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date/Time</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Location</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 text-sm">
                                                      {s.history.map((ev, i) => (
                                                        <tr key={i}>
                                                          <td className="px-4 py-2 text-gray-600">{ev.timestamp}</td>
                                                          <td className="px-4 py-2 text-gray-900">{ev.location}</td>
                                                          <td className="px-4 py-2 text-gray-700">{ev.statusDescription}</td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
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
      </div>
  );
}