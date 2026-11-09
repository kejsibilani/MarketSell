import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Truck, Download, ChevronDown, ChevronUp, Eye, Copy, X, Image, FileText } from 'lucide-react';
import formatNumber from '../utils/numberFormat';
import { products } from '../data/mockData';
import type { Shipment } from '../data/mockData';
import PageHeader from '../components/PageHeader';

export const SELLER_ROWS: Shipment[] = [
  {
    shipmentId: 'SHP-0001', internalTrackingNumber: 'ISP-1001', carrier: 'FedEx', trackingReference: 'FX-992211', latestStatus: 'In Transit', date: '2026-05-06', units: 42, from: 'Rotterdam Warehouse', to: 'Madrid Distribution',
    items: [
      { skuId: '1', quantity: 42, price: 8.50 },
    ],
    pictures: [
      { name: 'package_photo_1.jpg' },
      { name: 'package_photo_2.jpg' },
    ],
    documents: [
      { name: 'packing_list_SHP-0001.pdf', type: 'Packing List' },
      { name: 'receipt_payment.pdf', type: 'Receipt' },
    ],
    linkedOrderId: 'SO-2026-001',
    linkedOrderType: 'sales',
    history: [
      { timestamp: '2026-05-06 08:30', location: 'Rotterdam - Depot', statusDescription: 'Picked up' },
      { timestamp: '2026-05-07 13:10', location: 'Transit Hub', statusDescription: 'In transit' },
      { timestamp: '2026-05-08 09:00', location: 'Local Hub', statusDescription: 'Out for delivery' },
    ],
  },
  {
    shipmentId: 'SHP-0002', internalTrackingNumber: 'ISP-1002', carrier: 'GLS', trackingReference: 'GLS-8812', latestStatus: 'Delivered', date: '2026-05-02', units: 85, from: 'Madrid Warehouse', to: 'Valencia Center',
    items: [
      { skuId: '2', quantity: 85, price: 12.00 },
    ],
    pictures: [
      { name: 'package_photo_1.jpg' },
      { name: 'package_photo_2.jpg' },
      { name: 'package_photo_3.jpg' },
    ],
    documents: [
      { name: 'invoice_SHP-0002.pdf', type: 'Invoice' },
      { name: 'receipt_payment.pdf', type: 'Receipt' },
      { name: 'delivery_confirmation.pdf', type: 'Delivery Confirmation' },
    ],
    linkedOrderId: 'SO-2026-002',
    linkedOrderType: 'sales',
    history: [
      { timestamp: '2026-05-02 06:00', location: 'Madrid - Warehouse', statusDescription: 'Collected' },
      { timestamp: '2026-05-03 11:30', location: 'Madrid - Depot', statusDescription: 'In transit' },
    ],
  },
];

export const OPERATOR_ROWS: Shipment[] = [
  {
    shipmentId: 'SHP-OP-0001', internalTrackingNumber: 'ISP-2001', carrier: 'FedEx', trackingReference: 'FX-992211', latestStatus: 'In Transit', date: '2026-05-06', units: 120, from: 'Rotterdam Warehouse', to: 'Madrid Hub',
    items: [
      { skuId: '1', quantity: 60, price: 8.50 },
      { skuId: '2', quantity: 60, price: 12.00 },
    ],
    pictures: [
      { name: 'package_photo_1.jpg' },
      { name: 'package_photo_2.jpg' },
      { name: 'shipping_label.jpg' },
    ],
    documents: [
      { name: 'invoice_SHP-OP-0001.pdf', type: 'Invoice' },
      { name: 'receipt_payment.pdf', type: 'Receipt' },
      { name: 'customs_form.pdf', type: 'Customs' },
    ],
    linkedOrderId: 'SO-2026-003',
    linkedOrderType: 'sales',
    history: [
      { timestamp: '2026-05-06 08:30', location: 'Rotterdam - Depot', statusDescription: 'Picked up' },
    ],
  },
];

function downloadCsv(rows: Shipment[], filename = 'shipments.csv') {
  const headers = ['Shipment #', 'Date', 'From', 'To', 'Carrier', 'Tracking Ref', 'Internal #', 'Units', 'Status'];
  const lines = [headers.join(',')].concat(rows.map(r => [r.shipmentId, r.date, r.from ?? '', r.to ?? '', r.carrier, r.trackingReference ?? '', r.internalTrackingNumber ?? '', r.units ?? '', r.latestStatus ?? ''].map(cell => `"${String(cell).replace(/"/g, '""') }"`).join(',')));
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ShippingTable({ role, queryProp, setQueryProp, statusProp, setStatusProp }: { role: 'seller' | 'operator', queryProp?: string, setQueryProp?: (q: string) => void, statusProp?: string, setStatusProp?: (s: string) => void }) {
  const initial = role === 'seller' ? SELLER_ROWS : OPERATOR_ROWS;
  const [rows] = useState<Shipment[]>(initial);
  const [localQuery, setLocalQuery] = useState('');
  const [localStatus, setLocalStatus] = useState<'all' | string>('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [activeTab, setActiveTab] = useState<'pictures' | 'documents'>('pictures');
  
  const query = queryProp !== undefined && setQueryProp ? queryProp : localQuery;
  const setQuery = (v: string) => {
    if (setQueryProp) setQueryProp(v);
    else setLocalQuery(v);
  };
  
  const statusFilter = statusProp !== undefined && setStatusProp ? statusProp : localStatus;
  const setStatusFilter = (v: 'all' | string) => {
    if (setStatusProp) setStatusProp(v);
    else setLocalStatus(v);
  };

  const [sortKey] = useState<'date' | 'shipmentId' | 'carrier' | null>('date');
  const [sortDir] = useState<'asc' | 'desc'>('desc');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const location = useLocation();

  useEffect(() => {
    const hash = (location.hash || '').replace('#', '');
    if (hash) {
      setExpanded(prev => ({ ...prev, [hash]: true }));
    }
  }, [location.hash]);

  const statuses = useMemo(() => Array.from(new Set(rows.map(r => r.latestStatus ?? ''))), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows.filter(r => {
      if (statusFilter !== 'all' && r.latestStatus !== statusFilter) return false;
      if (!q) return true;
      return [r.shipmentId, r.carrier, r.trackingReference, r.internalTrackingNumber].some(v => (v ?? '').toLowerCase().includes(q));
    });

    if (sortKey) {
      out = out.sort((a, b) => {
        const av = (a as any)[sortKey] ?? '';
        const bv = (b as any)[sortKey] ?? '';
        if (sortKey === 'date') {
          const ad = new Date(a.date).getTime();
          const bd = new Date(b.date).getTime();
          return sortDir === 'asc' ? ad - bd : bd - ad;
        }
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return out;
  }, [rows, query, statusFilter, sortKey, sortDir]);

  // Details Modal Component
  const ShipmentDetailsModal = ({ shipment, onClose }: { shipment: Shipment, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shipment Details</h2>
            <p className="text-sm text-gray-500 mt-1">{shipment.shipmentId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">From</p>
              <p className="text-gray-900 font-medium">{shipment.from}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">To</p>
              <p className="text-gray-900 font-medium">{shipment.to}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Carrier</p>
              <p className="text-gray-900 font-medium">{shipment.carrier}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Tracking</p>
              <p className="text-gray-900 font-mono font-medium">{shipment.trackingReference}</p>
            </div>
          </div>

          {/* Modal Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('pictures')}
                className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'pictures'
                    ? 'border-[#0B1F3A] text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Image className="w-4 h-4 inline mr-2" />
                Pictures ({shipment.pictures?.length ?? 0})
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'documents'
                    ? 'border-[#0B1F3A] text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Documents ({shipment.documents?.length ?? 0})
              </button>
            </div>
          </div>

          {/* Pictures Tab Content */}
          {activeTab === 'pictures' && (
            <div className="grid grid-cols-2 gap-4">
              {(shipment.pictures ?? []).map((pic, idx) => (
                <div key={idx} className="aspect-video bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">{pic.name}</p>
                  </div>
                </div>
              ))}
              {(!shipment.pictures || shipment.pictures.length === 0) && (
                <div className="col-span-2 p-8 text-center text-gray-500">
                  <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pictures available</p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab Content */}
          {activeTab === 'documents' && (
            <div className="space-y-2">
              {(shipment.documents ?? []).map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 text-xs font-medium text-[#0B1F3A] hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100">
                    Download
                  </button>
                </div>
              ))}
              {(!shipment.documents || shipment.documents.length === 0) && (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#0B1F3A] rounded-lg hover:opacity-90 transition-opacity">
            Download All
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200">
       <PageHeader
          title="Shipments"
          description="All shipments from your seller accounts"
          onExport={() => {}}
          onAddNew={() => alert('Create new shipment functionality coming soon!')}
          addNewLabel="New Shipment"
        />

        {/* Status filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
            {['all','Delivered','In Transit'].map(s => (
              <button key={s} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button onClick={() => { setQuery('') }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
            <div className="text-sm text-gray-600">Total Shipments</div>
            <div className="text-2xl font-bold text-gray-900">total</div>
            <div className="text-xs text-gray-500 mt-1">All seller shipments</div>
          </button>
          <button onClick={() => { setQuery('') }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
            <div className="text-sm text-gray-600">Delivered</div>
            <div className="text-2xl font-bold text-green-600">delivered</div>
            <div className="text-xs text-gray-500 mt-1">Completed deliveries</div>
          </button>
          <button onClick={() => { setQuery('') }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
            <div className="text-sm text-gray-600">In Transit</div>
            <div className="text-2xl font-bold text-orange-600">inTransit</div>
            <div className="text-xs text-gray-500 mt-1">Currently moving</div>
          </button>
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="text-sm text-gray-600">Actions</div>
            <div className="text-2xl font-bold text-gray-900">Quick</div>
            <div className="text-xs text-gray-500 mt-1">Copy, export, update status</div>
          </div>
        </div>
        
      {/* Search, Status Select & Download Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Shipments</h3>
          <button
            onClick={() => downloadCsv(filtered, 'shipments.csv')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <Download className="w-4 h-4" />
            Download Excel
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search shipments..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
          >
            <option value="all">All Statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Accordion Shipments List */}
      <div className="divide-y divide-gray-200">
        {filtered.map(shipment => (
          <div key={shipment.shipmentId} className="border-b border-gray-200 last:border-b-0">
            {/* Header Accordion Bar */}
            <div
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setExpanded(prev => ({ ...prev, [shipment.shipmentId]: !prev[shipment.shipmentId] }))}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {expanded[shipment.shipmentId] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Shipment #{shipment.shipmentId}
                        <span className="text-xs text-gray-500 ml-2">
                          {shipment.date}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {shipment.from} → {shipment.to}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        Carrier: {shipment.carrier}
                      </p>
                      <p className="text-xs text-gray-500">
                        {shipment.trackingReference}
                      </p>
                    </div>
                  </div>

                  {/* Stat Counters & Actions */}
                  <div className="grid grid-cols-3 gap-4 mb-1 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Units</p>
                      <p className="text-sm font-semibold text-gray-900">{formatNumber(shipment.units)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Items</p>
                      <p className="text-sm font-semibold text-gray-900">{shipment.items?.length ?? 0}</p>
                    </div>
                    <div className="text-right flex items-center justify-end gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedShipment(shipment);
                        }}
                        className="text-xs font-medium text-[#0B1F3A] hover:underline flex items-center gap-1"
                        title="View shipment details"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard?.writeText(shipment.trackingReference ?? '');
                        }}
                        className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                        title="Copy tracking reference"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Ref
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion Expanded Sub-Table */}
            {expanded[shipment.shipmentId] && (
              <div className="bg-gray-50/70 p-4 border-t border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                      <th className="text-left py-2 px-3">SKU</th>
                      <th className="text-left py-2 px-3">Product</th>
                      <th className="text-center py-2 px-3">Quantity</th>
                      <th className="text-right py-2 px-3">Unit Price</th>
                      <th className="text-right py-2 px-3">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {shipment.items?.map((item, idx) => {
                      const product = products.find(p => p.id === item.skuId);
                      const lineTotal = item.quantity * (item.price ?? 0);
                      return (
                        <tr key={idx} className="hover:bg-gray-100/50">
                          <td className="py-3 px-3 font-mono text-sm font-medium text-gray-900">{item.skuId}</td>
                          <td className="py-3 px-3 text-gray-900 font-medium">{product?.name || 'Unknown Product'}</td>
                          <td className="py-3 px-3 text-center font-medium text-gray-900">
                            {formatNumber(item.quantity)}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-500">€{(item.price ?? 0).toFixed(2)}</td>
                          <td className="py-3 px-3 text-right font-medium text-gray-900">€{lineTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200 font-semibold text-gray-900">
                      <td colSpan={2} className="py-2 px-3">Total</td>
                      <td className="py-2 px-3 text-center">{formatNumber(shipment.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0)}</td>
                      <td></td>
                      <td className="py-2 px-3 text-right">
                        €{(shipment.items?.reduce((sum, i) => sum + i.quantity * (i.price ?? 0), 0) ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* History Timeline */}
                {shipment.history.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-3">Shipment History</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                          <th className="text-left py-2 px-3">Timestamp</th>
                          <th className="text-left py-2 px-3">Location</th>
                          <th className="text-left py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {shipment.history.map((h, idx) => (
                          <tr key={idx} className="hover:bg-gray-100/50">
                            <td className="py-2 px-3 text-gray-900">{h.timestamp}</td>
                            <td className="py-2 px-3 text-gray-900">{h.location}</td>
                            <td className="py-2 px-3 text-gray-500">{h.statusDescription}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No shipments found.</p>
          </div>
        )}
      </div>

      {/* Details Modal Trigger */}
      {selectedShipment && <ShipmentDetailsModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} />}
    </div>
  );
}