import { useState, useMemo } from 'react';
import { DashboardLayout } from "../components/DashboardLayout";
import { transactions } from '../data/mockData';
import formatNumber from '../utils/numberFormat';
import { RefreshCw, DollarSign } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import QuickFilters from '../components/QuickFilters';
import QuickActions from '../components/QuickActions';
import TableHeader from '../components/TableHeader';
import PageHeader from '../components/PageHeader';

export default function SellerCash() {
  const balance = transactions.reduce((s, t) => s + t.amount, 0);
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | 'all'>(() => {
    try { return (localStorage.getItem('seller.selectedCompany') as string) || 'all'; } catch { return 'all'; }
  });

  // Transactions in mockData don't include a company field; enrich with a best-effort company parsed from the description
  const enriched = (transactions as any[]).map(t => ({
    ...t,
    company: (t as any).company ?? (typeof t.description === 'string' && t.description.includes('-') ? t.description.split('-').pop().trim() : ''),
  }));

  const companies = Array.from(new Set(enriched.map(t => t.company || '').filter(Boolean)));

  // per-company aggregates for the Revolut-style selector
  const perCompany = companies.map(c => {
    const rows = enriched.filter(t => (t.company || '') === c);
    return { company: c, balance: rows.reduce((s, r) => s + r.amount, 0), count: rows.length };
  });
  const aggregatedBalance = perCompany.reduce((s, p) => s + p.balance, 0);

  const rows = useMemo(() => enriched.filter(t => {
    const q = search.toLowerCase();
    const desc = (t.description || '').toLowerCase();
    const comp = (t.company || '').toLowerCase();
    const byCompany = selectedCompany === 'all' ? true : (t.company === selectedCompany);
    return (!q || desc.includes(q) || comp.includes(q))
      && (!filterCompany || t.company === filterCompany) && byCompany;
  }), [search, filterCompany, selectedCompany]);

  return (
      <div className="space-y-6">
        <PageHeader
          title="Cash Account"
          description="View balances and recent transactions"
        />

        <div className="flex items-start gap-6">
          <div className="w-2/3 grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
              <div className="text-xs text-green-600 font-bold uppercase tracking-widest mb-1">Seller Balance</div>
              <div className="text-3xl font-bold text-green-700">€{formatNumber(balance, 2)}</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
              <div className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Inflow (30 days)</div>
              <div className="text-3xl font-bold text-blue-700">€{formatNumber(transactions.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0), 2)}</div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
              <div className="text-xs text-red-600 font-bold uppercase tracking-widest mb-1">Outflow (30 days)</div>
              <div className="text-3xl font-bold text-red-700">€{formatNumber(Math.abs(transactions.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0)), 2)}</div>
            </div>
          </div>

          <div className="w-1/3 bg-white border border-gray-100 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-700">Companies</div>
              <div className="text-xs text-gray-400">Aggregate</div>
            </div>
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setSelectedCompany('all'); try { localStorage.setItem('seller.selectedCompany', 'all'); } catch {} }}
                    className={`px-3 py-1 rounded-full text-sm ${selectedCompany === 'all' ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700'}`}>
                    All (aggregate)
                  </button>
                  {perCompany.map(p => (
                    <button key={p.company} onClick={() => { setSelectedCompany(p.company); try { localStorage.setItem('seller.selectedCompany', p.company); } catch {} }}
                      className={`px-3 py-1 rounded-full text-sm ${selectedCompany === p.company ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700'}`}>
                      {p.company} · €{formatNumber(p.balance,2)}
                    </button>
                  ))}
                </div>
              </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">Aggregated Balance</div>
                <div className="font-semibold">€{formatNumber(aggregatedBalance,2)}</div>
              </div>
              {perCompany.slice(0,6).map(p => (
                <div key={p.company} className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">{p.company}</div>
                  <div className="text-sm font-medium">€{formatNumber(p.balance,2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-[#0B1F3A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0B1F3A]/90">
            <RefreshCw size={14}/> Process Refund
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
            <DollarSign size={14}/> Withdraw Funds
          </button>
        </div>

        <QuickFilters />

        <div className="bg-white rounded-lg border p-6">
          <TableHeader title="Recent Transactions" count={rows.length} query={search} setQuery={setSearch} status={filterCompany} setStatus={setFilterCompany} statusOptions={companies.map(c=>({ value: c, label: c }))} />
          <div className="overflow-x-auto mt-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">TX ID</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.description}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded uppercase">{t.company}</span></td>
                    <td className="px-4 py-3 text-gray-500">{t.date}</td>
                    <td className={`px-4 py-3 text-right font-bold ${t.amount>0?'text-green-600':'text-red-600'}`}>{t.amount>0?'+':''}€{formatNumber(Math.abs(t.amount),2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
