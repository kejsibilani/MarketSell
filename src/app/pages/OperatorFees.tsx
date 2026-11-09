import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import TableHeader from '../components/TableHeader';
import QuickFilters from '../components/QuickFilters';
import formatNumber from '../utils/numberFormat';
import PageHeader from '../components/PageHeader';

interface FeeEntry {
  id: string;
  date: string;
  amount: number;
  currency: 'EUR' | 'USD';
  company?: string;
  description?: string;
  linkedEntityType?: 'shipment' | 'sales_order' | 'restock_order' | 'transformation_order';
  linkedEntityId?: string;
}

const MOCK_FEES: FeeEntry[] = [
  { id: 'FEE-001', date: '2026-05-10', amount: 50, currency: 'EUR', company: 'NFCOF', description: 'Platform fee for shipment', linkedEntityType: 'shipment', linkedEntityId: 'SHP-0001' },
  { id: 'FEE-002', date: '2026-05-12', amount: 20, currency: 'EUR', company: 'NFCAO', description: 'Manual admin fee', linkedEntityType: 'sales_order', linkedEntityId: '#1264' },
];

export default function OperatorFees() {
  const [rows, setRows] = useState<FeeEntry[]>(MOCK_FEES);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('all');

  const quickFilters = [
    { label: 'All', value: 'all', count: rows.length, active: status === 'all', onClick: () => setStatus('all') },
    { label: 'Shipment-linked', value: 'shipment', count: rows.filter(r => r.linkedEntityType === 'shipment').length, active: status === 'shipment', onClick: () => setStatus('shipment') },
    { label: 'Order-linked', value: 'sales_order', count: rows.filter(r => r.linkedEntityType === 'sales_order').length, active: status === 'sales_order', onClick: () => setStatus('sales_order') },
    { label: 'Manual', value: 'manual', count: rows.filter(r => !r.linkedEntityType).length, active: status === 'manual', onClick: () => setStatus('manual') },
  ];

  const filtered = rows.filter(r => {
    if (status === 'shipment' && r.linkedEntityType !== 'shipment') return false;
    if (status === 'sales_order' && r.linkedEntityType !== 'sales_order') return false;
    if (status === 'manual' && r.linkedEntityType) return false;
    return !query || [r.id, r.company, r.description, r.linkedEntityId].join(' ').toLowerCase().includes(query.toLowerCase());
  });

  const addFee = () => {
    const next: FeeEntry = { id: `FEE-${String(rows.length + 1).padStart(3,'0')}`, date: new Date().toISOString().slice(0,10), amount: 0, currency: 'EUR' };
    setRows(prev => [next, ...prev]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operator Fees"
        description="Operator-managed fees and platform charges (administrative)"
        onAddNew={addFee}
        addNewLabel="New Fee"
      />

      {/* Status filter (operator pattern) */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
          {['all','shipment','sales_order','manual'].map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button onClick={() => { setQuery(''); setStatus('all'); }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
          <div className="text-sm text-gray-600">Total Fees</div>
          <div className="text-2xl font-bold text-gray-900">{rows.length}</div>
          <div className="text-xs text-gray-500 mt-1">All operator fees</div>
        </button>
        <button onClick={() => { setQuery(''); setStatus('shipment'); }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
          <div className="text-sm text-gray-600">Shipment-linked</div>
          <div className="text-2xl font-bold text-gray-900">{rows.filter(r => r.linkedEntityType === 'shipment').length}</div>
          <div className="text-xs text-gray-500 mt-1">Linked to shipments</div>
        </button>
        <button onClick={() => { setQuery(''); setStatus('sales_order'); }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
          <div className="text-sm text-gray-600">Order-linked</div>
          <div className="text-2xl font-bold text-gray-900">{rows.filter(r => r.linkedEntityType === 'sales_order').length}</div>
          <div className="text-xs text-gray-500 mt-1">Linked to orders</div>
        </button>
        <div className="p-4 rounded-lg border border-gray-200 bg-white">
          <div className="text-sm text-gray-600">Actions</div>
          <div className="text-2xl font-bold text-gray-900">Quick</div>
          <div className="text-xs text-gray-500 mt-1">Copy, export, assign</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <TableHeader title="Fees" count={filtered.length} query={query} setQuery={setQuery} status={status} setStatus={setStatus} statusOptions={[{ value: 'shipment', label: 'Shipment' }, { value: 'sales_order', label: 'Sales Order' }]} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Company</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Linked</th>
                <th className="px-6 py-3 text-left">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono">{r.id}</td>
                  <td className="px-6 py-4 text-gray-600">{r.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{r.company}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{formatNumber(r.amount)} {r.currency}</td>
                  <td className="px-6 py-4 text-gray-600">{r.linkedEntityType ? `${r.linkedEntityType}: ${r.linkedEntityId}` : '—'}</td>
                  <td className="px-6 py-4 text-gray-700">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
