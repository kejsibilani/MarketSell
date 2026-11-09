import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Truck, Download, ChevronDown, ChevronUp, Eye, Copy, X, Image, FileText } from 'lucide-react';
import formatNumber from '../utils/numberFormat';
import type { Shipment } from '../data/mockData';

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

export default function ShippingTable({ role, queryProp, setQueryProp, statusProp, setStatusProp, onViewDetails }: { role: 'seller' | 'operator', queryProp?: string, setQueryProp?: (q: string) => void, statusProp?: string, setStatusProp?: (s: string) => void, onViewDetails?: (shipment: any) => void }) {
  const initial = role === 'seller' ? SELLER_ROWS : OPERATOR_ROWS;
  const [rows, setRows] = useState<Shipment[]>(initial);
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
  const [sortKey, setSortKey] = useState<'date' | 'shipmentId' | 'carrier' | null>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const location = useLocation();

  useEffect(() => {
    // if URL hash is #SHP-xxx, expand that shipment row
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

  const toggleSort = (key: 'date' | 'shipmentId' | 'carrier') => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const updateStatus = (id: string, status: string) => {
    setRows(prev => prev.map(r => r.shipmentId === id ? { ...r, latestStatus: status } : r));
  };

  const updateInternal = (id: string, internalId?: string) => {
    setRows(prev => prev.map(r => r.shipmentId === id ? { ...r, internalTrackingNumber: internalId ?? '' } : r));
  };

  // Details Modal Component
  const ShipmentDetailsModal = ({ shipment, onClose }: { shipment: Shipment, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-elegant">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Shipment Details</h2>
            <p className="text-sm text-muted-foreground mt-1">{shipment.shipmentId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Shipment Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">From</p>
              <p className="text-foreground font-medium">{shipment.from}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">To</p>
              <p className="text-foreground font-medium">{shipment.to}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Carrier</p>
              <p className="text-foreground font-medium">{shipment.carrier}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Tracking</p>
              <p className="text-foreground font-mono font-medium">{shipment.trackingReference}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('pictures')}
                className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'pictures'
                    ? 'border-accent text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Image className="w-4 h-4 inline mr-2" />
                Pictures ({shipment.pictures?.length ?? 0})
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'documents'
                    ? 'border-accent text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Documents ({shipment.documents?.length ?? 0})
              </button>
            </div>
          </div>

          {/* Pictures Tab */}
          {activeTab === 'pictures' && (
            <div className="grid grid-cols-2 gap-4">
              {(shipment.pictures ?? []).map((pic, idx) => (
                <div key={idx} className="aspect-video bg-muted rounded-lg border border-border flex items-center justify-center cursor-pointer hover:border-accent transition-colors">
                  <div className="text-center">
                    <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">{pic.name}</p>
                  </div>
                </div>
              ))}
              {(!shipment.pictures || shipment.pictures.length === 0) && (
                <div className="col-span-2 p-8 text-center text-muted-foreground">
                  <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pictures available</p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-2">
              {(shipment.documents ?? []).map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-accent flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.type}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 text-xs font-medium text-accent hover:bg-accent/10 rounded transition-colors opacity-0 group-hover:opacity-100">
                    Download
                  </button>
                </div>
              ))}
              {(!shipment.documents || shipment.documents.length === 0) && (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 flex gap-3 bg-muted/30">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Close
          </button>
          <button
            className="flex-1 px-4 py-2 text-sm font-medium text-accent-foreground bg-accent rounded-lg hover:opacity-90 transition-opacity"
          >
            Download All
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Shipments</h3>
          <button
            onClick={() => downloadCsv(filtered, 'shipments.csv')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Excel
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search shipments..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
          >
            <option value="all">All Statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Shipments List */}
      <div className="divide-y divide-border">
        {filtered.map(shipment => (
          <div key={shipment.shipmentId} className="border-b border-border last:border-b-0">
            {/* Main Shipment Row */}
            <div
              className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => setExpanded(prev => ({ ...prev, [shipment.shipmentId]: !prev[shipment.shipmentId] }))}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {expanded[shipment.shipmentId] ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Shipment #{shipment.shipmentId}
                        <span className="text-xs text-muted-foreground ml-2">
                          {shipment.date}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {shipment.from} → {shipment.to}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        Carrier: {shipment.carrier}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {shipment.trackingReference}
                      </p>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-3 pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Units</p>
                      <p className="text-sm font-semibold text-foreground">{formatNumber(shipment.units)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Items</p>
                      <p className="text-sm font-semibold text-foreground">{shipment.items?.length ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                      <p className="text-sm font-semibold">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          shipment.latestStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                          shipment.latestStatus === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                          shipment.latestStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {shipment.latestStatus}
                        </span>
                      </p>
                    </div>
                    <div className="text-right flex items-center justify-end gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedShipment(shipment);
                        }}
                        className="text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
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
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                        title="Copy tracking reference"
                      >
                        <Copy className="w-4 h-4 inline mr-1" />
                        Copy Ref
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details - Items Table */}
            {expanded[shipment.shipmentId] && (
              <div className="bg-muted/30 p-4 border-t border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                      <th className="text-left py-2 px-3">SKU</th>
                      <th className="text-left py-2 px-3">SKU Details</th>
                      <th className="text-center py-2 px-3">Units</th>
                      <th className="text-right py-2 px-3">Value</th>
                      <th className="text-center py-2 px-3">Not Allocated</th>
                      <th className="text-center py-2 px-3">Assigned to Ship</th>
                      <th className="text-center py-2 px-3">Cancelled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {shipment.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/50">
                        <td className="py-3 px-3 font-mono text-sm font-medium text-foreground">{item.skuId}</td>
                        <td className="py-3 px-3 text-muted-foreground">Product SKU {item.skuId}</td>
                        <td className="py-3 px-3 text-center font-medium text-foreground">
                          {formatNumber(item.quantity)}<br/>
                          <span className="text-xs text-muted-foreground">({(item.quantity * 20).toLocaleString()}kg)</span>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-foreground">
                          €{(item.quantity * (item.price ?? 0)).toFixed(2)}<br/>
                          <span className="text-xs text-muted-foreground">{((item.quantity * (item.price ?? 0) * 0.21) + (item.quantity * (item.price ?? 0))).toFixed(2)} inc. VAT</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {Math.floor(item.quantity * 0.6)}<br/>({Math.floor(item.quantity * 0.6 * 20)}kg)
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            {Math.floor(item.quantity * 0.3)}<br/>({Math.floor(item.quantity * 0.3 * 20)}kg)
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                            {Math.floor(item.quantity * 0.1)}<br/>({Math.floor(item.quantity * 0.1 * 20)}kg)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Shipment History */}
                {shipment.history.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">Shipment History</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                          <th className="text-left py-2 px-3">Shipment ID</th>
                          <th className="text-left py-2 px-3">Date</th>
                          <th className="text-left py-2 px-3">From Warehouse</th>
                          <th className="text-left py-2 px-3">To Destination</th>
                          <th className="text-left py-2 px-3">Carrier</th>
                          <th className="text-right py-2 px-3">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {shipment.history.map((h, idx) => (
                          <tr key={idx} className="hover:bg-muted/50">
                            <td className="py-2 px-3 text-muted-foreground">{shipment.shipmentId}</td>
                            <td className="py-2 px-3 text-foreground">{h.timestamp}</td>
                            <td className="py-2 px-3 text-foreground">{shipment.from}</td>
                            <td className="py-2 px-3 text-foreground">{h.location}</td>
                            <td className="py-2 px-3 text-foreground">{shipment.carrier}</td>
                            <td className="py-2 px-3 text-right font-mono text-muted-foreground">{shipment.trackingReference}</td>
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
          <div className="p-8 text-center text-muted-foreground">
            <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No shipments found.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedShipment && <ShipmentDetailsModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} />}
    </div>
  );
}
