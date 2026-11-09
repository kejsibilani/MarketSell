import React, { useState } from 'react';
import { Plus, FileText, ChevronDown, ChevronUp, X } from 'lucide-react';
import { MOCK_INVOICES, Invoice, CostAllocationLine } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';
import formatNumber from '../utils/numberFormat';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import FilterBar from '../components/FilterBar';
import QuickActions from '../components/QuickActions';
import TableHeader from '../components/TableHeader';
import PageHeader from '../components/PageHeader';

export default function SellerCosts() {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);

  const [filterStatus, setFilterStatus] = useState<'all'|'assigned'|'unassigned'|'partial'>('all');

  const [newInvoiceNumber, setNewInvoiceNumber] = useState('');
  const [newProvider, setNewProvider] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCurrency, setNewCurrency] = useState<'EUR' | 'USD'>('EUR');
  const [newDate, setNewDate] = useState('');
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);

  const [assignEntityType, setAssignEntityType] = useState<'shipment'|'sales_order'|'restock_order'|'transformation_order'>('shipment');
  const [assignEntityId, setAssignEntityId] = useState('');
  const [previewLines, setPreviewLines] = useState<CostAllocationLine[]>([]);
  const [overrides, setOverrides] = useState<Record<number, string>>({});

  const invoiceStatusMap: Record<Invoice['status'], { type: 'success'|'warning'|'info'|'error' }> = {
    assigned: { type: 'success' },
    unassigned: { type: 'warning' },
    partial: { type: 'info' },
  };

  function buildPreviewLines(entityId: string, totalAmount: number): CostAllocationLine[] {
    const entityItems: Record<string, { sku: string; productName: string; weightKg: number }[]> = {
      'SHP-0001':     [
        { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo Green Coffee',  weightKg: 300 },
        { sku: 'RC-ETH-002-1KG',  productName: 'Ethiopian Yirgacheffe Roasted',   weightKg: 290 },
        { sku: 'GC-BRA-003-60KG', productName: 'Brazilian Santos Green Coffee',   weightKg: 180 },
      ],
      '#1264':        [
        { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo Green Coffee', weightKg: 300 },
        { sku: 'RC-ETH-002-1KG',  productName: 'Ethiopian Yirgacheffe Roasted',  weightKg: 20  },
      ],
      'TRF-2026-001': [
        { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo Green Coffee', weightKg: 300 },
      ],
      'TRF-2026-002': [
        { sku: 'RC-ETH-002-1KG',  productName: 'Ethiopian Yirgacheffe Roasted',  weightKg: 290 },
      ],
    };

    const items = entityItems[entityId];
    if (!items || items.length === 0) {
      return [
        { sku: 'SKU-A', productName: 'Product A (placeholder)', weightKg: 100, proposedAmount: +(totalAmount / 3).toFixed(2), finalAmount: +(totalAmount / 3).toFixed(2) },
        { sku: 'SKU-B', productName: 'Product B (placeholder)', weightKg: 100, proposedAmount: +(totalAmount / 3).toFixed(2), finalAmount: +(totalAmount / 3).toFixed(2) },
        { sku: 'SKU-C', productName: 'Product C (placeholder)', weightKg: 100, proposedAmount: +(totalAmount / 3).toFixed(2), finalAmount: +(totalAmount / 3).toFixed(2) },
      ];
    }

    const totalKg = items.reduce((s, i) => s + i.weightKg, 0);
    return items.map(item => {
      const proposed = +((item.weightKg / totalKg) * totalAmount).toFixed(2);
      return { sku: item.sku, productName: item.productName, weightKg: item.weightKg, proposedAmount: proposed, finalAmount: proposed };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A]">Cost & Invoices</h1>
          <p className="text-gray-600 mt-1">Assign freight, processing and handling costs to your stock</p>
        </div>
        <button
          onClick={() => setShowNewInvoiceDialog(true)}
          className="flex items-center gap-2 bg-[#0B1F3A] text-white px-4 py-2 rounded-lg hover:bg-[#0B1F3A]/90"
        >
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* Status filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
          {['all','assigned','unassigned','partial'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === s ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <QuickActions items={[{ id: 'total', title: 'Total Invoices', value: invoices.length, onClick: () => {} }, { id: 'assigned', title: 'Assigned', value: invoices.filter(i=>i.status==='assigned').length, onClick: () => {} }]} />
      <div className="bg-white rounded-lg border border-gray-200">
        <TableHeader title="Invoices" count={invoices.length} query={''} setQuery={() => {}} status={filterStatus} setStatus={(s:string) => setFilterStatus(s as any)} statusOptions={[{ value: 'assigned', label: 'Assigned' }, { value: 'unassigned', label: 'Unassigned' }, { value: 'partial', label: 'Partial' }]} />
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <tr>
                <th className="px-6 py-3 text-left">Invoice #</th>
                <th className="px-6 py-3 text-left">Provider</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Linked To</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {invoices.map(inv => (
                <tr key={inv.id} className={`hover:bg-gray-50 ${assigningId === inv.id ? 'bg-indigo-50' : ''}`}>
                <td className="px-6 py-4 font-mono">
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{inv.invoiceNumber}</code>
                </td>
                <td className="px-6 py-4 text-gray-900">{inv.provider}</td>
                <td className="px-6 py-4 text-gray-600">{inv.date}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">{formatNumber(inv.totalAmount)} {inv.currency}</td>
                <td className="px-6 py-4 text-gray-600 text-xs">
                    {inv.assignedTo
                    ? <>
                        <span className="capitalize">{inv.assignedTo.entityType.replace(/_/g, ' ')}: </span>
                        {inv.assignedTo.entityType === 'shipment' ? (
                            <a href={`/seller/shipments#${inv.assignedTo.entityId}`} className="text-[#0B1F3A] underline font-mono">{inv.assignedTo.entityId}</a>
                        ) : (
                            <code className="bg-gray-100 px-1 py-0.5 rounded">{inv.assignedTo.entityId}</code>
                        )}
                        </>
                    : <span className="text-gray-400">—</span>}
                    {inv.pdfUrl && (
                    <div className="mt-1">
                        <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="text-sm text-[#0B1F3A] underline">View PDF</a>
                    </div>
                    )}
                </td>
                <td className="px-6 py-4">
                    <StatusBadge status={inv.status} type={invoiceStatusMap[inv.status].type} />
                </td>
                <td className="px-6 py-4">
                    {inv.status !== 'assigned' && (
                    <button
                        onClick={() => {
                        setAssigningId(assigningId === inv.id ? null : inv.id);
                        setPreviewLines([]);
                        setOverrides({});
                        setAssignEntityId('');
                        }}
                        className="text-sm px-3 py-1 rounded border border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white transition-colors"
                    >
                        {assigningId === inv.id ? 'Cancel' : 'Assign Cost'}
                    </button>
                    )}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
      </div>

      {assigningId !== null && (() => {
        const invoice = invoices.find(i => i.id === assigningId)!;
        return (
          <div className="bg-white rounded-lg border-2 border-indigo-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-[#0B1F3A]">Assign Cost — {invoice.invoiceNumber} ({formatNumber(invoice.totalAmount)} {invoice.currency})</h3>
              <button onClick={() => setAssigningId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Assign this invoice to:</p>
              <div className="flex flex-wrap gap-3">
                {(['shipment', 'sales_order', 'restock_order', 'transformation_order'] as const).map(type => (
                  <label key={type} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                    assignEntityType === type
                      ? 'border-[#0B1F3A] bg-[#0B1F3A]/5 font-medium text-[#0B1F3A]'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}>
                    <input type="radio" className="hidden" checked={assignEntityType === type} onChange={() => { setAssignEntityType(type as any); setPreviewLines([]); setOverrides({}); setAssignEntityId(''); }} />
                    <span className="capitalize text-sm">{type.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {assignEntityType === 'shipment' ? 'Shipment ID (e.g. SHP-0001)'
                  : assignEntityType === 'sales_order' ? 'Order ID (e.g. #1264)'
                  : assignEntityType === 'restock_order' ? 'Restock Order ID'
                  : 'Transformation Order ID (e.g. TRF-2026-001)'}
                </label>
                <input value={assignEntityId} onChange={e => setAssignEntityId(e.target.value)} placeholder="Enter ID..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/30" />
              </div>
              <button
                onClick={() => {
                  const knownLines = buildPreviewLines(assignEntityId, invoice.totalAmount);
                  setPreviewLines(knownLines);
                  setOverrides({});
                }}
                disabled={!assignEntityId.trim()}
                className="px-4 py-2 bg-[#0B1F3A] text-white rounded-lg text-sm disabled:opacity-40"
              >
                Load Preview
              </button>
            </div>

            {previewLines.length > 0 && (() => {
              const lines = previewLines.map((line, i) => ({
                ...line,
                finalAmount: overrides[i] !== undefined ? (parseFloat(overrides[i]) || 0) : line.finalAmount,
              }));
              const runningTotal = lines.reduce((s, l) => s + l.finalAmount, 0);
              const delta = +(runningTotal - invoice.totalAmount).toFixed(2);
              const balanced = Math.abs(delta) < 0.01;

              return (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Allocation preview — proportional by weight (kg)</p>
                  <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase">
                      <tr>
                        <th className="px-4 py-2 text-left">SKU</th>
                        <th className="px-4 py-2 text-left">Product</th>
                        <th className="px-4 py-2 text-right">Weight (kg)</th>
                        <th className="px-4 py-2 text-right">Auto-split (EUR)</th>
                        <th className="px-4 py-2 text-right">Override (EUR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {lines.map((line, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{line.sku}</code></td>
                          <td className="px-4 py-3 text-gray-900">{line.productName}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{formatNumber(line.weightKg)}</td>
                          <td className="px-4 py-3 text-right text-gray-400 line-through">{formatNumber(line.proposedAmount)}</td>
                          <td className="px-4 py-3 text-right">
                            <input type="number" step="0.01" value={overrides[i] ?? line.proposedAmount.toFixed(2)} onChange={e => setOverrides(prev => ({ ...prev, [i]: e.target.value }))} className="w-24 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#0B1F3A]" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-gray-300 bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-gray-700">Total allocated</td>
                        <td colSpan={2} className={`px-4 py-2 text-right text-sm font-bold ${balanced ? 'text-green-600' : 'text-red-600'}`}>
                          {formatNumber(runningTotal)} EUR
                          {!balanced && (
                            <span className="ml-2 text-xs font-normal">({delta > 0 ? '+' : ''}{formatNumber(delta)} vs {formatNumber(invoice.totalAmount)} invoice)</span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => { setPreviewLines([]); setAssignEntityId(''); setOverrides({}); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Reset</button>
                    <button
                      disabled={!balanced}
                      onClick={() => {
                        setInvoices(prev => prev.map(inv => inv.id === assigningId ? {
                          ...inv,
                          status: 'assigned',
                          assignedTo: { entityType: assignEntityType as any, entityId: assignEntityId },
                          allocationLines: lines,
                        } : inv));
                        setAssigningId(null);
                        setPreviewLines([]);
                        setOverrides({});
                      }}
                      className="px-5 py-2 text-sm bg-[#0B1F3A] text-white rounded-lg disabled:opacity-40 hover:bg-[#0B1F3A]/90"
                      title={!balanced ? 'Total allocated must equal invoice amount before confirming' : undefined}
                    >
                      Confirm Assignment
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        );
      })()}

      {/* New Invoice Dialog */}
      <Dialog open={showNewInvoiceDialog} onOpenChange={setShowNewInvoiceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Invoice Number (external ref)</label>
              <input value={newInvoiceNumber} onChange={e => setNewInvoiceNumber(e.target.value)} placeholder="e.g. EXT-INV-9001" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Provider / Supplier</label>
              <input value={newProvider} onChange={e => setNewProvider(e.target.value)} placeholder="e.g. FedEx Spain" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Amount</label>
                <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Currency</label>
                <select value={newCurrency} onChange={e => setNewCurrency(e.target.value as 'EUR' | 'USD') } className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Invoice PDF (optional)</label>
              <input type="file" accept="application/pdf" onChange={e => setNewPdfFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewInvoiceDialog(false)}>Cancel</Button>
            <Button
              disabled={!newInvoiceNumber || !newProvider || !newAmount || !newDate}
              onClick={() => {
                const newInv: Invoice = {
                  id: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
                  invoiceNumber: newInvoiceNumber,
                  provider: newProvider,
                  totalAmount: parseFloat(newAmount),
                  currency: newCurrency,
                  date: newDate,
                  status: 'unassigned',
                  allocationLines: [],
                };
                if (newPdfFile) {
                  newInv.pdfUrl = URL.createObjectURL(newPdfFile);
                }
                setInvoices(prev => [newInv, ...prev]);
                setShowNewInvoiceDialog(false);
                setNewInvoiceNumber(''); setNewProvider(''); setNewAmount(''); setNewDate('');
                setNewPdfFile(null);
              }}
              className="bg-[#0B1F3A] text-white"
            >
              Save Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
