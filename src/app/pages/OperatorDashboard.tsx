import { useState, useMemo, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router';
import { DashboardLayout } from '../components/DashboardLayout';
import { KPICard } from '../components/KPICard';
import DashboardOverview from '../components/DashboardOverview';
import { StatusBadge } from '../components/StatusBadge';
import FilterBar, { PageHeader as PageHeaderComponent } from '../components/FilterBar';
import QuickActions from '../components/QuickActions';
import TableHeader from '../components/TableHeader';
import {
  Package, Users, ShoppingCart, Building2, Edit, FileText,
  Shield, BarChart2, RefreshCw, Eye, Search, Filter,
  ChevronRight, X, DollarSign, ArrowRight, ChevronUp, ChevronDown, Truck,
  MapPin, Play, ImageIcon, Star, Plus,
} from 'lucide-react';
import { Download } from 'lucide-react';
import { products, orders, transactions, USERS, COMPANIES, USER_RIGHTS, PRODUCERS, SKUS } from '../data/mockData';
import ShippingTable from '../components/ShippingTable';
import { NewRecordModal } from '../components/NewRecordModal';
import ShippingHistory from '../components/ShippingHistory';

// Simple country flag helper (local to this file)
const getCountryFlag = (code?: string): string => {
  const flags: Record<string, string> = {
    'ES': '🇪🇸', 'GB': '🇬🇧', 'IT': '🇮🇹', 'FR': '🇫🇷', 'DE': '🇩🇪', 'BE': '🇧🇪',
    'NL': '🇳🇱', 'AT': '🇦🇹', 'CH': '🇨🇭', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰',
    'FI': '🇫🇮', 'PL': '🇵🇱', 'CZ': '🇨🇿', 'HU': '🇭🇺', 'RO': '🇷🇴', 'MD': '🇲🇩',
    'UA': '🇺🇦', 'RU': '🇷🇺', 'TR': '🇹🇷', 'GR': '🇬🇷', 'PT': '🇵🇹', 'IE': '🇮🇪',
    'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'BR': '🇧🇷', 'AR': '🇦🇷', 'CL': '🇨🇱',
    'CO': '🇨🇴', 'PE': '🇵🇪', 'EC': '🇪🇨', 'BO': '🇧🇴', 'PA': '🇵🇦', 'SV': '🇸🇻',
    'HN': '🇭🇳', 'CR': '🇨🇷', 'UY': '🇺🇾', 'ET': '🇪🇹', 'KE': '🇰🇪', 'TZ': '🇹🇿',
    'UG': '🇺🇬', 'RW': '🇷🇼', 'ZA': '🇿🇦', 'NG': '🇳🇬', 'GH': '🇬🇭', 'CM': '🇨🇲',
    'CI': '🇨🇮', 'CN': '🇨🇳', 'IN': '🇮🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'VN': '🇻🇳',
    'TH': '🇹🇭', 'ID': '🇮🇩', 'PH': '🇵🇭', 'MY': '🇲🇾', 'SG': '🇸🇬', 'BD': '🇧🇩',
    'PK': '🇵🇰', 'IR': '🇮🇷', 'AE': '🇦🇪', 'SA': '🇸🇦', 'IL': '🇮🇱', 'AU': '🇦🇺', 'NZ': '🇳🇿',
  };
  return code ? (flags[code.toUpperCase()] || '🌍') : '🌍';
};
// Removed: CountryFlag, CountryDisplay imports - not needed for operator dashboard
// Lightweight in-file mocks and tiny helpers (restores operators view after an accidental edit).

const OVERVIEW_TABS: { key: Exclude<View,'overview'>; label: string }[] = [
  { key: 'users', label: 'Users' },
  { key: 'user_rights', label: 'User Rights' },
  { key: 'companies', label: 'Companies' },
  { key: 'producers', label: 'Producers' },
  { key: 'stock', label: 'Stock' },
  { key: 'skus', label: 'Registered SKUs' },
  { key: 'restocking', label: 'Restocking' },
  { key: 'sales_orders', label: 'Sales Orders' },
  { key: 'transformations', label: 'Transformations' },
  { key: 'cash', label: 'Cash' },
];

const VIEW_LABELS: Record<View, string> = {
  overview: 'Overview', users: 'Users', companies: 'Companies', user_rights: 'User Rights', stock: 'Stock', skus: 'Registered SKUs', producers: 'Producers', transformations: 'Transformations', restocking: 'Restocking', sales_orders: 'Sales Orders', cash: 'Cash',
};

// Pricing analytics intentionally omitted from operator dashboard (seller-only tool)

const OP_TRANSFORMATIONS = [
  {
    id: 'T1', date: '2024-03-20', company: 'MarketSell', type: 'Roast', status: 'completed',
    description: 'Operator-managed roast batch', internalShipmentId: 'ISP-2001',
    fromItems: [{ sku: 'GC-COL-001-60KG', productName: 'Colombian — 60kg', units: 5 }],
    toItems: [{ sku: 'RC-COL-001-1KG', productName: 'Colombian — 1kg', units: 40 }],
    cost: 70,
  },
];

const TRANSACTIONS = transactions as any[];

function RatingStars({ value }: { value: number }) { return <span className="text-yellow-500">{'★'.repeat(Math.max(0, Math.round(value)))}</span>; }
function CompanyStatusBadge({ status }: { status: string }) { return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">{status}</span>; }
function BoolCell({ value }: { value: boolean }) { return <span className={`px-2 py-0.5 rounded text-xs ${value ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{value ? 'Yes' : 'No'}</span>; }
function SKUStatusBadge({ status }: { status: string }) { return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">{status}</span>; }
import formatNumber from '../utils/numberFormat';

// ─── Types ────────────────────────────────────────────────────────────────────

type View =
  | 'overview'
  | 'users'
  | 'companies'
  | 'user_rights'
  | 'stock'
  | 'skus'
  | 'producers'
  | 'transformations'
  | 'restocking'
  | 'sales_orders'
  | 'cash';


// (use shared FilterBar and PageHeader from components/FilterBar)

// ─── Individual Table Components ──────────────────────────────────────────────

function UsersTable({ compact = false }: { compact?: boolean }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const allGroups = Array.from(new Set(USERS.flatMap(u => [u.sellerGroup, u.buyerGroup, u.agentGroup])));
  const rows = useMemo(() => USERS.filter(u => {
    const q = search.toLowerCase();
    return (!q || `u${u.userId}`.includes(q) || u.sellerGroup.toLowerCase().includes(q) || u.buyerGroup.toLowerCase().includes(q) || u.agentGroup.toLowerCase().includes(q))
      && (!filterGroup || [u.sellerGroup, u.buyerGroup, u.agentGroup].includes(filterGroup));
  }), [search, filterGroup]);

  const handleAddUser = (data: any) => {
    console.log('New user:', data);
    setShowNewUserModal(false);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowNewUserModal(true);
  };

  const handleSaveEdit = (data: any) => {
    console.log('Updated user:', { ...editingUser, ...data });
    setEditingUser(null);
    setShowNewUserModal(false);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <QuickActions items={[{ id: 'total', title: 'Total Users', value: rows.length, onClick: () => {} }, { id: 'groups', title: 'Groups', value: allGroups.length, onClick: () => {} }]} />
        <button onClick={() => { setEditingUser(null); setShowNewUserModal(true); }} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 flex items-center gap-2"><Plus size={16}/> New User</button>
      </div>

      {/* Status filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
          {['all','Active','Pending'].map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <TableHeader title="Users" count={rows.length} query={search} setQuery={setSearch} status={status} setStatus={setStatus} statusOptions={[]} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">User ID</th>
              <th className="px-4 py-3">Seller Group</th>
              <th className="px-4 py-3">Buyer Group</th>
              <th className="px-4 py-3">Agent Group</th>
              <th className="px-4 py-3">Buyer Rating</th>
              <th className="px-4 py-3">Seller Rating</th>
              <th className="px-4 py-3">Agent Rating</th>
              {!compact && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(u => (
              <tr key={u.userId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-gray-800">U{String(u.userId).padStart(3,'0')}</td>
                <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-xs font-semibold">{u.sellerGroup}</span></td>
                <td className="px-4 py-3"><span className="bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded text-xs font-semibold">{u.buyerGroup}</span></td>
                <td className="px-4 py-3"><span className="bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded text-xs font-semibold">{u.agentGroup}</span></td>
                <td className="px-4 py-3"><RatingStars value={u.buyerRating} /></td>
                <td className="px-4 py-3"><RatingStars value={u.sellerRating} /></td>
                <td className="px-4 py-3"><RatingStars value={u.agentRating} /></td>
                {!compact && <td className="px-4 py-3 flex gap-2"><button onClick={() => handleEditUser(u)} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs font-medium"><Edit size={13}/> Edit</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <NewRecordModal 
        isOpen={showNewUserModal} 
        onClose={() => { setShowNewUserModal(false); setEditingUser(null); }} 
        title={editingUser ? 'Edit User' : 'New User'}
        entityType="stock"
        onSubmit={editingUser ? handleSaveEdit : handleAddUser}
      />
    </div>
  );
}

function CompaniesTable({ compact = false }: { compact?: boolean }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const statuses = Array.from(new Set(COMPANIES.map(c => c.status)));
  const types    = Array.from(new Set(COMPANIES.map(c => c.companyType)));
  const rolesAll = Array.from(new Set(COMPANIES.flatMap(c => (c.roles || []))));
  const [status, setStatus] = useState(filterStatus || 'all');
  const rows = useMemo(() => COMPANIES.filter(c => {
    const q = search.toLowerCase();
    return (!q || String(c.companyId).includes(q) || c.shortName.toLowerCase().includes(q) || c.legalName.toLowerCase().includes(q) || c.companyType.toLowerCase().includes(q))
      && (!filterStatus || c.status === filterStatus) && (!filterType || c.companyType === filterType) && (!filterRole || (c.roles || []).includes(filterRole));
  }), [search, filterStatus, filterType, filterRole]);

  const handleAddCompany = (data: any) => {
    console.log('New company:', data);
    setShowNewCompanyModal(false);
  };

  const handleEditCompany = (company: any) => {
    setEditingCompany(company);
    setShowNewCompanyModal(true);
  };

  const handleSaveEdit = (data: any) => {
    console.log('Updated company:', { ...editingCompany, ...data });
    setEditingCompany(null);
    setShowNewCompanyModal(false);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <QuickActions items={[{ id: 'total', title: 'Total Cos', value: rows.length, onClick: () => {} }, { id: 'active', title: 'Active', value: rows.filter(r=>r.status==='Active').length, onClick: () => {} }]} />
        <button onClick={() => { setEditingCompany(null); setShowNewCompanyModal(true); }} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 flex items-center gap-2"><Plus size={16}/> New Company</button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <TableHeader title="Companies" count={rows.length} query={search} setQuery={setSearch} status={filterStatus||status} setStatus={(s:string)=>{ setFilterStatus(s); setStatus(s); }} statusOptions={statuses.map(s=>({ value: s, label: s }))} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="sticky left-0 bg-gray-50 z-10 px-4 py-3">Actions</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Group</th>
              <th className="px-4 py-3">Short Name</th>
              <th className="px-4 py-3">Legal Name</th>
              <th className="px-4 py-3">Roles</th>
              {!compact && <><th className="px-4 py-3">Tax ID</th><th className="px-4 py-3">Tax Country</th><th className="px-4 py-3">Legal Address</th></>}
              <th className="px-4 py-3">Documents</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(c => (
              <tr key={c.companyId} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white hover:bg-gray-50 z-10 px-4 py-3 border-r border-gray-200"><button onClick={() => handleEditCompany(c)} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"><Edit size={14}/> Edit</button></td>
                <td className="px-4 py-3 font-mono font-bold text-gray-800">{c.companyId}</td>
                <td className="px-4 py-3"><CompanyStatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-gray-700">{c.companyType}</td>
                <td className="px-4 py-3 text-gray-600">{c.companyGroup}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{c.shortName || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-gray-700">{c.legalName || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-sm">{(c.roles || []).map((r:string,i:number)=>(<span key={i} className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs mr-1">{r}</span>))}</td>
                {!compact && <><td className="px-4 py-3 font-mono text-gray-500">{c.taxId || <span className="text-gray-300">—</span>}</td><td className="px-4 py-3 text-gray-500 flex items-center gap-2">{c.taxCountry ? <><span className="text-lg">{getCountryFlag(c.taxCountry)}</span> <span>{c.taxCountry}</span></> : <span className="text-gray-300">—</span>}</td><td className="px-4 py-3 text-gray-500">{c.legalAddress || <span className="text-gray-300">—</span>}</td></>}
                <td className="px-4 py-3"><button className="flex items-center gap-1 text-xs text-red-600 font-semibold hover:underline"><FileText size={12}/> {c.documents.toUpperCase()}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <NewRecordModal 
        isOpen={showNewCompanyModal} 
        onClose={() => { setShowNewCompanyModal(false); setEditingCompany(null); }} 
        title={editingCompany ? 'Edit Company' : 'New Company'}
        entityType="company"
        onSubmit={editingCompany ? handleSaveEdit : handleAddCompany}
      />
    </div>
  );
}

function UserRightsTable({ compact = false }: { compact?: boolean }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const rows = useMemo(() => USER_RIGHTS.filter(r => {
    const q = search.toLowerCase();
    return !q || `u${r.userId}`.includes(q) || String(r.companyId).includes(q);
  }), [search]);

  return (
    <div>

      <div className="mb-4">
        <QuickActions items={[{ id: 'total', title: 'Total Rights', value: rows.length, onClick: () => {} }]} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <TableHeader title="User Rights" count={rows.length} query={search} setQuery={setSearch} status={status} setStatus={setStatus} statusOptions={[]} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">User ID</th>
              <th className="px-4 py-3">Company ID</th>
              <th className="px-4 py-3">Can Sell?</th>
              <th className="px-4 py-3">Can Be Agent?</th>
              <th className="px-4 py-3">Can Place Orders?</th>
              <th className="px-4 py-3">Can Update Data?</th>
              <th className="px-4 py-3">Can Authorise Users?</th>
              {!compact && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-gray-800">U{String(r.userId).padStart(3,'0')}</td>
                <td className="px-4 py-3 font-mono font-bold text-gray-800">{r.companyId}</td>
                <td className="px-4 py-3"><BoolCell value={r.canSell} /></td>
                <td className="px-4 py-3"><BoolCell value={r.canBeAgent} /></td>
                <td className="px-4 py-3"><BoolCell value={r.canPlaceOrders} /></td>
                <td className="px-4 py-3"><BoolCell value={r.canUpdateData} /></td>
                <td className="px-4 py-3"><BoolCell value={r.canAuthoriseUsers} /></td>
                {!compact && <td className="px-4 py-3"><button className="text-blue-500 hover:text-blue-700"><Edit size={14}/></button></td>}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// Inventory page has multiple internal sub-tabs: Stock, Registered SKUs, Producers
function StockTable({ compact = false }: { compact?: boolean }) {
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [stockSearch, setStockSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const statuses   = Array.from(new Set(products.map(p => p.status)));
  const warehouses = Array.from(new Set(products.map(p => p.warehouse)));
  const stockRows = useMemo(() => products.filter(p => {
    const q = stockSearch.toLowerCase();
    return (!q || p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q))
      && (!filterStatus || p.status === filterStatus)
      && (!filterWarehouse || p.warehouse === filterWarehouse);
  }), [stockSearch, filterStatus, filterWarehouse]);

  const TRANSFORMATION_LOG: Record<string, { date: string; type: string; qty: number; cost: number; status: string }[]> = {
    '1': [ { date: '2026-04-18', type: 'Roasting', qty: 10, cost: 70.00, status: 'Completed' } ],
    '2': [],
  };
  const SHIPPING_LOG: Record<string, { date: string; event: string; carrier: string; trackingRef: string; location: string }[]> = {
    '1': [ { date: '2026-04-30', event: 'Shipment arrived at warehouse', carrier: 'Costas Ocean', trackingRef: 'CST-8812', location: 'Rotterdam WH' } ],
    '2': [ { date: '2026-04-14', event: 'Shipment arrived at warehouse', carrier: 'FedEx', trackingRef: 'FX-22193', location: 'Chisinau WH' } ],
  };

  // Merge transformation and shipping logs into unified activity log
  const getActivityLog = (productIdStr: string) => {
    const transformations = (TRANSFORMATION_LOG[productIdStr] || []).map(t => ({
      date: t.date,
      logType: 'transformation',
      description: `${t.type} - ${t.qty} units`,
      details: `Cost: ${formatNumber(t.cost)} EUR`,
      status: t.status,
    }));
    const shipments = (SHIPPING_LOG[productIdStr] || []).map(s => ({
      date: s.date,
      logType: 'shipment',
      description: s.event,
      details: `${s.carrier} - ${s.trackingRef} - ${s.location}`,
      status: 'In Transit',
    }));
    return [...transformations, ...shipments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div>
      <div className="mb-4">
        <QuickActions items={[{ id: 'total', title: 'Total Products', value: stockRows.length, onClick: () => {} }, { id: 'warehouses', title: 'Warehouses', value: warehouses.length, onClick: () => {} }]} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <TableHeader title="Stock" count={stockRows.length} query={stockSearch} setQuery={setStockSearch} status={filterStatus||'all'} setStatus={setFilterStatus} statusOptions={statuses.map(s=>({ value: s, label: s }))} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Product ID</th>
              <th className="px-4 py-3 text-left">Product Name</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Stock (units)</th>
              <th className="px-4 py-3 text-left">Warehouse</th>
              <th className="px-4 py-3 text-left">Lot Number</th>
              <th className="px-4 py-3 text-left">Status</th>
              {!compact && <th className="px-4 py-3 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stockRows.map(p => {
              const productIdStr = String(p.id);
              const isExpanded = expandedProductId === productIdStr;
              return (
                <>
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button onClick={() => setExpandedProductId(prev => prev === productIdStr ? null : productIdStr)} className="text-gray-500 hover:text-gray-700">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700">{p.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.owner}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatNumber(p.stock)}</td>
                    <td className="px-4 py-3 text-gray-600">{p.warehouse}</td>
                    <td className="px-4 py-3 font-mono text-gray-500">{p.lot}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} type={p.status==='selling'?'success':p.status==='pending'?'warning':'error'} /></td>
                    {!compact && <td className="px-4 py-3"><button className="text-blue-500 hover:text-blue-700"><Edit size={14}/></button></td>}
                  </tr>

                  {isExpanded && (
                    <tr key={`${p.id}-exp`}>
                      <td colSpan={9} className="px-6 py-0 bg-[#F5F7FA]">
                        <div className="py-4">
                          {/* Activity Log - Unified */}
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-700">📋 Activity Log ({getActivityLog(productIdStr).length} events)</span>
                            </div>
                            {getActivityLog(productIdStr).length === 0 ? (
                              <p className="px-4 py-3 text-sm text-gray-400">No activity logs found.</p>
                            ) : (
                              <table className="w-full">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Details</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {getActivityLog(productIdStr).map((log, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 text-sm text-gray-600">{log.date}</td>
                                      <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.logType === 'transformation' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{log.logType === 'transformation' ? '⚙️ Transform' : '🚚 Shipment'}</span></td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{log.description}</td>
                                      <td className="px-4 py-2 text-xs text-gray-600">{log.details}</td>
                                      <td className="px-4 py-2"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{log.status}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
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

function RegisteredSKUsTable({ compact = false }: { compact?: boolean }) {
  const [selectedSKU, setSelectedSKU] = useState<any>(null);
  const [showNewSkuModal, setShowNewSkuModal] = useState(false);
  const [editingSKU, setEditingSKU] = useState<any>(null);
  const [skuSearch, setSkuSearch] = useState('');
  const [filterSkuStatus, setFilterSkuStatus] = useState('');
  const skuStatuses = Array.from(new Set(SKUS.map(s => s.status)));
  const skuRows = useMemo(() => SKUS.filter(s => {
    const q = skuSearch.toLowerCase();
    return (!q || s.skuName.toLowerCase().includes(q) || s.eanBarcode.includes(q) || s.product.toLowerCase().includes(q))
      && (!filterSkuStatus || s.status === filterSkuStatus);
  }), [skuSearch, filterSkuStatus]);

  const handleAddSKU = (data: any) => {
    console.log('New SKU:', data);
    setShowNewSkuModal(false);
  };

  const handleEditSKU = (sku: any) => {
    setEditingSKU(sku);
    setShowNewSkuModal(true);
  };

  const handleSaveEdit = (data: any) => {
    console.log('Updated SKU:', { ...editingSKU, ...data });
    setEditingSKU(null);
    setShowNewSkuModal(false);
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <QuickActions items={[{ id: 'total', title: 'Total SKUs', value: skuRows.length, onClick: () => {} }]} />
        <button onClick={() => { setEditingSKU(null); setShowNewSkuModal(true); }} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 flex items-center gap-2"><Package size={16}/> New SKU</button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <TableHeader title="Registered SKUs" count={skuRows.length} query={skuSearch} setQuery={setSkuSearch} status={filterSkuStatus||'all'} setStatus={setFilterSkuStatus} statusOptions={skuStatuses.map(s=>({ value: s, label: s }))} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="sticky left-0 bg-gray-50 z-10 px-4 py-3">Edit</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Co.</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">EAN / Barcode</th>
              <th className="px-4 py-3">SKU Name</th>
              <th className="px-4 py-3">Product Line</th>
              <th className="px-4 py-3">Producer</th>
              {!compact && <><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Origin</th><th className="px-4 py-3">Batch</th><th className="px-4 py-3">Pack</th><th className="px-4 py-3">Weight</th><th className="px-4 py-3">Size</th><th className="px-4 py-3">Pelletisation</th></>}
              <th className="px-4 py-3">Pictures</th>
              {!compact && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {skuRows.map((s, i) => (
              <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedSKU(s)}>
                <td className="sticky left-0 bg-white hover:bg-gray-50 z-10 px-4 py-3 border-r border-gray-200"><button onClick={(e) => { e.stopPropagation(); handleEditSKU(s); }} className="text-blue-600 hover:text-blue-800 font-semibold"><Edit size={14}/></button></td>
                <td className="px-4 py-3 font-mono font-bold text-gray-800">U{String(s.userId).padStart(3,'0')}</td>
                <td className="px-4 py-3 font-mono text-gray-600">{s.companyId}</td>
                <td className="px-4 py-3"><SKUStatusBadge status={s.status} /></td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.eanBarcode}</td>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{s.skuName}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.productLine}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.producerName}</td>
                {!compact && <><td className="px-4 py-3 text-gray-600">{s.product}</td><td className="px-4 py-3 text-gray-600">{s.productCategory}</td><td className="px-4 py-3 text-gray-600">{s.origin}</td><td className="px-4 py-3 font-mono text-gray-500">{s.originBatch}</td><td className="px-4 py-3 text-gray-600">{s.pack}</td><td className="px-4 py-3 font-semibold text-gray-700">{s.weight} kg</td><td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.size}</td><td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.pelletisation}</td></>}
                <td className="px-4 py-3"><button onClick={(e) => { e.stopPropagation(); setSelectedSKU(s); }} className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"><Eye size={12}/> View</button></td>
                {!compact && <td className="px-4 py-3 flex gap-2"><button onClick={(e) => { e.stopPropagation(); }} className="text-xs text-blue-600 hover:text-blue-700 font-semibold" title="Traceability Report">📋</button><button onClick={(e) => { e.stopPropagation(); }} className="text-xs text-green-600 hover:text-green-700 font-semibold" title="Stock Movements">📊</button><button onClick={(e) => { e.stopPropagation(); }} className="text-xs text-purple-600 hover:text-purple-700 font-semibold" title="Compatible Products">🔗</button></td>}
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      <NewRecordModal 
        isOpen={showNewSkuModal} 
        onClose={() => { setShowNewSkuModal(false); setEditingSKU(null); }} 
        title={editingSKU ? 'Edit SKU' : 'New SKU'}
        entityType="sku"
        onSubmit={editingSKU ? handleSaveEdit : handleAddSKU}
      />

      {/* SKU Detail Modal */}
      {selectedSKU && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-h-[95vh] overflow-hidden shadow-lg flex flex-col" style={{maxWidth: '90vw'}}>
            {/* Header - Always Visible */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start gap-4 flex-shrink-0">
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">SKU Code</p>
                <h2 className="text-3xl font-bold text-gray-900 font-mono mb-3">{selectedSKU.skuName}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">✓ {selectedSKU.status || 'Active'}</span>
                  <p className="text-sm text-gray-600">SKU Name: <span className="font-semibold text-gray-900">{selectedSKU.productName}</span></p>
                </div>
              </div>
              
              {/* Action Buttons - Fixed Right Side */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => window.print()} className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm whitespace-nowrap">🖨️ Print</button>
                <button className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 font-medium text-sm whitespace-nowrap">✏️ Edit</button>
                <button className="px-3 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 font-medium text-sm whitespace-nowrap">📷 Photo</button>
                <button onClick={() => setSelectedSKU(null)} className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm">Close</button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              <div className="px-6 py-6 space-y-6">
              {/* Labels & Barcodes for Printing */}
              <section className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-amber-900 mb-4 flex items-center gap-2">
                  <span>🏷️ Labels & Barcodes</span>
                  <button onClick={() => window.print()} className="ml-auto px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 font-medium">Print Labels</button>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-amber-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-2">EAN Barcode</p>
                    <div className="bg-gray-100 p-3 rounded mb-2 text-center">
                      <p className="font-mono text-sm font-bold text-gray-900">{selectedSKU.eanBarcode}</p>
                    </div>
                    <p className="text-xs text-gray-500 text-center">Main barcode</p>
                  </div>
                  <div className="bg-white border border-amber-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-2">Barcode</p>
                    <div className="bg-gray-100 p-3 rounded mb-2 text-center">
                      <p className="font-mono text-sm font-bold text-gray-900">{selectedSKU.barcode}</p>
                    </div>
                    <p className="text-xs text-gray-500 text-center">Secondary barcode</p>
                  </div>
                  <div className="bg-white border border-amber-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-2">Warehouse Code</p>
                    <div className="bg-gray-100 p-3 rounded mb-2 text-center">
                      <p className="font-mono text-sm font-bold text-gray-900">{selectedSKU.warehouseCode}</p>
                    </div>
                    <p className="text-xs text-gray-500 text-center">Warehouse ID</p>
                  </div>
                </div>
              </section>

              {/* Product Image */}
              <section>
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 font-medium">{selectedSKU.pictures} Photo{selectedSKU.pictures !== '1' ? 's' : ''}</p>
                    <p className="text-xs text-gray-500 mt-1">Package image would display here</p>
                  </div>
                </div>
              </section>

              {/* Key Identifiers */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Key Identifiers</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Internal Code</span>
                    <p className="font-mono text-sm font-bold text-gray-900 mt-1">{selectedSKU.internalCode}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">EAN Barcode</span>
                    <p className="font-mono text-xs text-gray-700 mt-1">{selectedSKU.eanBarcode}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Warehouse Code</span>
                    <p className="font-mono text-xs text-gray-700 mt-1">{selectedSKU.warehouseCode}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
                    <p className="text-xs font-medium text-gray-900 mt-1 capitalize">{selectedSKU.status}</p>
                  </div>
                </div>
              </section>

              {/* Product Details */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <span className="text-xs font-medium text-gray-500 uppercase">Product Name</span>
                    <p className="text-sm text-gray-900 mt-2 font-medium">{selectedSKU.product}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <span className="text-xs font-medium text-gray-500 uppercase">Product Line</span>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <span className="text-xs font-medium text-gray-500 uppercase">Category</span>
                    <p className="text-sm text-gray-900 mt-2 font-medium">{selectedSKU.productCategory}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <span className="text-xs font-medium text-gray-500 uppercase">Origin</span>
                    <p className="text-sm text-gray-900 mt-2 font-medium">{selectedSKU.origin}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <span className="text-xs font-medium text-gray-500 uppercase">Origin Batch</span>
                    <p className="text-sm text-gray-900 mt-2 font-medium">{selectedSKU.originBatch}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <span className="text-xs font-medium text-gray-500 uppercase">Producer</span>
                    <p className="text-sm text-gray-900 mt-2 font-medium">{selectedSKU.producerName}</p>
                  </div>
                </div>
              </section>

              {/* Warehouses */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Warehouses</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSKU.warehouses.map((w, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">{w}</span>
                  ))}
                </div>
              </section>

              {/* Registration Info */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Registration Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <span className="text-xs font-medium text-gray-500 uppercase">Registered On</span>
                    <p className="text-sm text-gray-900 mt-2 font-medium">{selectedSKU.registeredDate}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <span className="text-xs font-medium text-gray-500 uppercase">Registered By</span>
                    <p className="text-sm text-gray-900 mt-2 font-medium">{selectedSKU.registeredBy}</p>
                  </div>
                </div>
              </section>

              {/* Documents */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Documents & Certificates</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Document Name</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedSKU.documents.map((doc, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">{doc.date}</td>
                          <td className="px-4 py-3 text-sm"><span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">{doc.type}</span></td>
                          <td className="px-4 py-3 text-sm text-blue-600 hover:underline cursor-pointer">{doc.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Traceability */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Traceability & Usage Summary</h3>
                <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                  {/* Last Movement */}
                  <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Last Movement</p>
                      <p className="text-sm text-gray-900 font-medium mt-1">Received at {selectedSKU.warehouses[0]}</p>
                      <p className="text-xs text-gray-600 mt-0.5">30 Apr 2026 — Costas Ocean — CST-8812</p>
                    </div>
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">✓ In Stock</span>
                  </div>
                  
                  {/* Usage Summary Counts */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">12</p>
                      <p className="text-xs text-gray-600 mt-1 uppercase font-medium">Shipments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">8</p>
                      <p className="text-xs text-gray-600 mt-1 uppercase font-medium">Sales Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">3</p>
                      <p className="text-xs text-gray-600 mt-1 uppercase font-medium">Transformations</p>
                    </div>
                  </div>
                  
                  {/* View Full Report CTA */}
                  <div className="pt-2">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                      📋 View Full Traceability Report
                    </button>
                  </div>
                </div>
              </section>

              {/* Stock Movements */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Stock Movements</h3>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 flex items-center gap-1">
                    <span>+</span> Add Movement
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Warehouse</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">30.04.26</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">Goods In</span></td>
                        <td className="px-4 py-3 text-gray-700 font-medium">Lisbon-Main</td>
                        <td className="px-4 py-3 font-medium text-gray-900">50 units</td>
                        <td className="px-4 py-3 text-gray-600">Shipment CST-8812</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">05.05.26</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">Goods Out</span></td>
                        <td className="px-4 py-3 text-gray-700 font-medium">Lisbon-Main</td>
                        <td className="px-4 py-3 font-medium text-gray-900">-5 units</td>
                        <td className="px-4 py-3 text-gray-600">Transformation Order</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">12.05.26</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-medium">Goods Out</span></td>
                        <td className="px-4 py-3 text-gray-700 font-medium">Lisbon-Main</td>
                        <td className="px-4 py-3 font-medium text-gray-900">-10 units</td>
                        <td className="px-4 py-3 text-gray-600">Sales Order #1264</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Related Products */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Related Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <p className="text-xs text-gray-500 uppercase font-medium">Compatible With</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">RC-COL-001-1KG</p>
                    <p className="text-xs text-gray-600 mt-1">Colombian Supremo — 1kg</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <p className="text-xs text-gray-500 uppercase font-medium">From Same Producer</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">GC-SAL-002-60KG</p>
                    <p className="text-xs text-gray-600 mt-1">Salvadorian Green — 60kg</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <p className="text-xs text-gray-500 uppercase font-medium">Same Category</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">GC-BRA-003-60KG</p>
                    <p className="text-xs text-gray-600 mt-1">Brazilian Santos — 60kg</p>
                  </div>
                </div>
              </section>

              {/* Packaging Information */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Packaging Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Pack Type</span>
                    <p className="text-sm text-gray-900 mt-2 font-medium">{selectedSKU.pack}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Weight</span>
                    <p className="text-sm text-gray-900 mt-2 font-medium">{selectedSKU.weight} kg</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Size</span>
                    <p className="text-xs text-gray-700 mt-2">{selectedSKU.size}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Pelletisation</span>
                    <p className="text-sm text-gray-900 mt-2 font-medium capitalize">{selectedSKU.pelletisation}</p>
                  </div>
                </div>
              </section>

              {/* Storage Conditions */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Storage Conditions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Temperature</span>
                    <p className="text-sm text-gray-900 mt-2">{selectedSKU.temp}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Humidity</span>
                    <p className="text-sm text-gray-900 mt-2">{selectedSKU.humidity}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Light</span>
                    <p className="text-sm text-gray-900 mt-2">{selectedSKU.light}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Rack</span>
                    <p className="text-sm text-gray-900 mt-2 capitalize">{selectedSKU.rack}</p>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm" title="Traceability Report">📋 Traceability Report</button>
                <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm" title="Stock Movements">📊 Stock Movements</button>
                <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm" title="Compatible Products">🔗 Compatible Products</button>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New SKU Modal */}
      {showNewSkuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Register New SKU</h2>
                <p className="text-sm text-gray-600 mt-1">Complete all fields to register a new SKU in the system</p>
              </div>
              <button onClick={() => setShowNewSkuModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
            </div>

            <form className="px-6 py-6 space-y-6">
              {/* SKU Identification */}
              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-semibold text-gray-900 px-2 -mx-2">SKU Identification</legend>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU Code *</label>
                    <input type="text" placeholder="e.g., GC-COL-001-60KG" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Internal Code *</label>
                    <input type="text" placeholder="e.g., CO-345" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">EAN Barcode</label>
                    <input type="text" placeholder="1234567890123" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse Code</label>
                    <input type="text" placeholder="e.g., JA482" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
                  </div>
                </div>
              </fieldset>

              {/* Product Information */}
              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-semibold text-gray-900 px-2 -mx-2">Product Information</legend>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input type="text" placeholder="e.g., Colombian Supremo" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Line *</label>
                    <input type="text" placeholder="e.g., Green Coffee" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <input type="text" placeholder="e.g., Green Coffee" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Origin *</label>
                    <input type="text" placeholder="e.g., El Salvador" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Origin Batch</label>
                    <input type="text" placeholder="e.g., LOT-2024-001" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
                  </div>
                </div>
              </fieldset>

              {/* Producer & Company */}
              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-semibold text-gray-900 px-2 -mx-2">Producer & Company</legend>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Producer *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" required>
                      <option value="">Select a producer...</option>
                      {PRODUCERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" required>
                      <option value="">Select a company...</option>
                      {COMPANIES.map(c => <option key={c.companyId} value={c.companyId}>{c.shortName}</option>)}
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Packaging Details */}
              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-semibold text-gray-900 px-2 -mx-2">Packaging Details</legend>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pack Type *</label>
                    <input type="text" placeholder="e.g., 60kg" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg) *</label>
                    <input type="number" step="0.01" placeholder="60" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size (dimensions) *</label>
                    <input type="text" placeholder="e.g., 60 x 80 x 40 cm" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pelletisation</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400">
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pictures</label>
                    <input type="number" min="0" placeholder="Number of pictures" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
                  </div>
                </div>
              </fieldset>

              {/* Storage Conditions */}
              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-semibold text-gray-900 px-2 -mx-2">Storage Conditions</legend>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
                    <input type="text" placeholder="e.g., 15°C / 25°C" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Humidity</label>
                    <input type="text" placeholder="e.g., 45% / 80%" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Light</label>
                    <input type="text" placeholder="e.g., No light" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rack</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400">
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Warehouses */}
              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-semibold text-gray-900 px-2 -mx-2">Warehouses</legend>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Warehouses</label>
                  <div className="space-y-2">
                    {['Rotterdam', 'Chisinau', 'Muhlenberg'].map((wh) => (
                      <label key={wh} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm text-gray-700">{wh}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                <button onClick={() => setShowNewSkuModal(false)} type="button" className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">Create SKU</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function ProducersTable({ compact = false }: { compact?: boolean }) {
  const [producerSearch, setProducerSearch] = useState('');
  const [selectedProducer, setSelectedProducer] = useState<any>(null);
  const [showNewProducerModal, setShowNewProducerModal] = useState(false);
  const [editingProducer, setEditingProducer] = useState<any>(null);
  const producerRows = useMemo(() => PRODUCERS.filter(p => {
    const q = producerSearch.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q) || p.contactEmail.toLowerCase().includes(q);
  }), [producerSearch]);

  const handleAddProducer = (data: any) => {
    console.log('New producer:', data);
    setShowNewProducerModal(false);
  };

  const handleEditProducer = (producer: any) => {
    setEditingProducer(producer);
    setShowNewProducerModal(true);
  };

  const handleSaveEdit = (data: any) => {
    console.log('Updated producer:', { ...editingProducer, ...data });
    setEditingProducer(null);
    setShowNewProducerModal(false);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <QuickActions items={[{ id: 'total', title: 'Total Producers', value: producerRows.length, onClick: () => {} }]} />
        <button onClick={() => { setEditingProducer(null); setShowNewProducerModal(true); }} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 flex items-center gap-2"><Plus size={16}/> New Producer</button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <TableHeader title="Producers" count={producerRows.length} query={producerSearch} setQuery={setProducerSearch} status="all" setStatus={() => {}} statusOptions={[]} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="sticky left-0 bg-gray-50 z-10 px-4 py-3">Actions</th>
              <th className="px-4 py-3">Producer Name</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Contact Email</th>
              <th className="px-4 py-3">SKU Count</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {producerRows.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedProducer(p)}>
                <td className="sticky left-0 bg-white hover:bg-gray-50 z-10 px-4 py-3 border-r border-gray-200"><button onClick={(e) => { e.stopPropagation(); handleEditProducer(p); }} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"><Edit size={14}/> Edit</button></td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-600 flex items-center gap-2"><span className="text-lg" title={p.country}>{getCountryFlag(p.country)}</span> {p.country}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{p.contactEmail}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{p.skuCount}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      <NewRecordModal 
        isOpen={showNewProducerModal} 
        onClose={() => { setShowNewProducerModal(false); setEditingProducer(null); }} 
        title={editingProducer ? 'Edit Producer' : 'New Producer'}
        entityType="producer"
        onSubmit={editingProducer ? handleSaveEdit : handleAddProducer}
      />

      {/* Producer Detail Modal */}
      {selectedProducer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-green-600">{selectedProducer.name}</h2>
                <p className="text-sm text-gray-600">Code: {selectedProducer.id}</p>
              </div>
              <button onClick={() => setSelectedProducer(null)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Country</span>
                  <p className="text-gray-900 font-semibold text-sm mt-1 flex items-center gap-2"><span className="text-lg">{getCountryFlag(selectedProducer.country)}</span> {selectedProducer.country}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Contact Email</span>
                  <p className="text-gray-600 text-sm mt-1">{selectedProducer.contactEmail}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Status</span>
                <p className={`px-3 py-1 rounded text-xs font-bold w-fit mt-1 ${selectedProducer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{selectedProducer.status}</p>
              </div>

              {/* Farm Location Map */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="font-bold text-sm mb-3">Farm Location</h3>
                <div className="w-full h-48 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Location: {selectedProducer.country}</p>
                  </div>
                </div>
              </div>

              {/* SKU Count Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-sm mb-2">Products</h3>
                <p className="text-2xl font-bold text-green-600 mb-1">{selectedProducer.skuCount}</p>
                <p className="text-xs text-gray-600">SKUs registered in system</p>
              </div>

              {/* Promotional Material Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-sm mb-3">Promotional Material</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left">
                    <Play className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Farm View</p>
                      <p className="text-xs text-gray-500">Video tour of facilities</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left">
                    <Play className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Harvest</p>
                      <p className="text-xs text-gray-500">Seasonal harvest details</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left">
                    <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Shipping</p>
                      <p className="text-xs text-gray-500">Shipping information</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Certifications/Documents */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-sm mb-3">Documents & Certificates</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Document Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">02.06.2026</td>
                      <td className="px-3 py-2"><span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">Sanitary certificate</span></td>
                      <td className="px-3 py-2 text-blue-600 hover:underline cursor-pointer">Original scan from farmer</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">02.06.2026</td>
                      <td className="px-3 py-2"><span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Labor certificate</span></td>
                      <td className="px-3 py-2 text-blue-600 hover:underline cursor-pointer">Producer labour statement</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">08.05.2026</td>
                      <td className="px-3 py-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">Quality check</span></td>
                      <td className="px-3 py-2 text-blue-600 hover:underline cursor-pointer">Test Incalabs</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">12.05.2026</td>
                      <td className="px-3 py-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">Quality check</span></td>
                      <td className="px-3 py-2 text-blue-600 hover:underline cursor-pointer">3rd party test</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">18.04.2026</td>
                      <td className="px-3 py-2"><span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">Sample picture</span></td>
                      <td className="px-3 py-2 text-blue-600 hover:underline cursor-pointer">Picture of current status</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Comments & Reviews */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-sm mb-3">Comments & Reviews</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-yellow-400 pl-3 py-2">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-xs text-gray-600">"Great coffee..."</p>
                  </div>
                  <div className="border-l-4 border-yellow-400 pl-3 py-2">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(3)].map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-xs text-gray-600">"Didn't like..."</p>
                  </div>
                  <div className="border-l-4 border-yellow-400 pl-3 py-2">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-xs text-gray-600">"Fantastic..."</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-between border-t border-gray-200 pt-4">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 text-sm">📋 Traceability Report</button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 text-sm">📊 Stock Movements</button>
                </div>
                <button onClick={() => setSelectedProducer(null)} className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RestockingTable({ compact = false }: { compact?: boolean }) {
  const refillOrders = orders.filter(o => o.orderType === 'restocking');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const statuses = Array.from(new Set(refillOrders.map(o => o.status)));
  const rows = useMemo(() => refillOrders.filter(o => {
    const q = search.toLowerCase();
    return (!q || o.id.toLowerCase().includes(q) || o.productName.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q))
      && (!filterStatus || o.status === filterStatus);
  }), [search, filterStatus]);

  const TRANSFORMATION_BY_ORDER_LOCAL: Record<string, { date: string; type: string; units?: number; cost?: number; status: string }[]> = {
    'REP-001': [ { date: '2026-04-20', type: 'Repacking', units: 50, cost: 30, status: 'Completed' } ],
  };
  const SHIPPING_BY_ORDER_LOCAL: Record<string, { date: string; event: string; carrier: string; trackingRef?: string; location?: string }[]> = {
    'REP-001': [ { date: '2026-04-22', event: 'Arrived', carrier: 'Costas Ocean', trackingRef: 'CST-8812', location: 'Rotterdam WH' } ],
  };

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<Record<string, 'transformations' | 'shipping' | null>>({});
  const [openShipment, setOpenShipment] = useState<Record<string, string | null>>({});
  const toggleSection = (id: string, section: 'transformations' | 'shipping') => setOpenSection(prev => ({ ...prev, [id]: prev[id] === section ? null : section }));

  return (
    <div>
      <div className="mb-4">
        <QuickActions items={[{ id: 'total', title: 'Total Restocks', value: rows.length, onClick: () => {} }, { id: 'pending', title: 'Pending', value: rows.filter(r=>r.status==='pending').length, onClick: () => {} }]} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <TableHeader title="Restocking Orders" count={rows.length} query={search} setQuery={setSearch} status={filterStatus||'all'} setStatus={setFilterStatus} statusOptions={statuses.map(s=>({ value: s, label: s }))} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left"></th>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Seller</th>
                <th className="px-4 py-3 text-left">Qty (kg)</th>
                <th className="px-4 py-3 text-left">Warehouse</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                {!compact && <th className="px-4 py-3 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(o => {
                const isExpanded = expandedId === o.id;
                const section = openSection[o.id];
                return (
                  <>
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button onClick={() => setExpandedId(prev => prev === o.id ? null : o.id)} className="text-gray-500 hover:text-gray-700">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800">{o.id}</td>
                      <td className="px-4 py-3 text-gray-900">{o.productName}</td>
                      <td className="px-4 py-3 text-gray-600">{o.customer}</td>
                      <td className="px-4 py-3 text-gray-900">{formatNumber(o.quantity)}</td>
                      <td className="px-4 py-3 text-gray-600">{o.warehouse}</td>
                      <td className="px-4 py-3 text-gray-500">{o.date}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.status} type={o.status==='approved'?'success':o.status==='rejected'?'error':'warning'} /></td>
                      {!compact && <td className="px-4 py-3 flex gap-2">
                        <button className="px-3 py-1 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700">Approve</button>
                        <button className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-xs font-semibold hover:bg-red-200">Reject</button>
                      </td>}
                    </tr>

                    {isExpanded && (
                      <tr key={`${o.id}-exp`}>
                        <td colSpan={9} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-3">
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <button onClick={() => toggleSection(o.id, 'transformations')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700"><RefreshCw className="w-4 h-4 text-amber-600"/> Transformation History ({(TRANSFORMATION_BY_ORDER_LOCAL[o.id] || []).length})</div>
                                {section === 'transformations' ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
                              </button>
                              {section === 'transformations' && (
                                (TRANSFORMATION_BY_ORDER_LOCAL[o.id] || []).length === 0
                                  ? <p className="px-4 py-3 text-sm text-gray-400 border-t border-gray-100">No transformation orders linked to this refill.</p>
                                  : (
                                    <table className="w-full border-t border-gray-100">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cost</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {(TRANSFORMATION_BY_ORDER_LOCAL[o.id] || []).map((t, i) => (
                                          <tr key={i}>
                                            <td className="px-4 py-2 text-sm text-gray-600">{t.date}</td>
                                            <td className="px-4 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">{t.type}</span></td>
                                            <td className="px-4 py-2 text-sm">{t.units ?? ''}</td>
                                            <td className="px-4 py-2 text-sm font-medium">{t.cost ? `${formatNumber(t.cost)} EUR` : ''}</td>
                                            <td className="px-4 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">{t.status}</span></td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )
                              )}
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <button onClick={() => toggleSection(o.id, 'shipping')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Truck className="w-4 h-4 text-blue-600" /> Shipments ({(SHIPPING_BY_ORDER_LOCAL[o.id] || []).length})</div>
                                {section === 'shipping' ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
                              </button>
                              {section === 'shipping' && (
                                (SHIPPING_BY_ORDER_LOCAL[o.id] || []).length === 0 ? (
                                  <p className="px-4 py-3 text-sm text-gray-400 border-t border-gray-100">No shipments recorded yet.</p>
                                ) : (
                                  <div className="border-t border-gray-100">
                                    {(() => {
                                      const events = SHIPPING_BY_ORDER_LOCAL[o.id] || [];
                                      const shipments = [{
                                        shipmentId: `SHP-${o.id}`,
                                        internalTrackingNumber: '',
                                        carrier: events[0]?.carrier ?? '',
                                        trackingReference: events[0]?.trackingRef ?? '',
                                        latestStatus: events[events.length-1]?.event ?? '',
                                        date: events[0]?.date ?? '',
                                        history: events.map(ev => ({ timestamp: ev.date, location: ev.location ?? '', statusDescription: ev.event }))
                                      }];
                                      return (
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
                                            {shipments.map(s => (
                                              <>
                                                <tr className="hover:bg-gray-50" key={s.shipmentId}>
                                                  <td className="px-4 py-2">
                                                    <button onClick={() => setOpenShipment(prev => ({ ...prev, [o.id]: prev[o.id] === s.shipmentId ? null : s.shipmentId }))} className="text-gray-500 hover:text-gray-700">
                                                      {openShipment[o.id] === s.shipmentId ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                  </td>
                                                  <td className="px-4 py-2 font-mono">{s.shipmentId}</td>
                                                  <td className="px-4 py-2">{s.carrier}</td>
                                                  <td className="px-4 py-2 font-mono text-gray-500">{s.trackingReference}</td>
                                                  <td className="px-4 py-2 text-gray-700">{s.latestStatus}</td>
                                                </tr>

                                                {openShipment[o.id] === s.shipmentId && (
                                                  <tr key={`${s.shipmentId}-exp`}>
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
                                                          {s.history.map((h, i) => (
                                                            <tr key={i}>
                                                              <td className="px-4 py-2 text-gray-600">{h.timestamp}</td>
                                                              <td className="px-4 py-2 text-gray-900">{h.location}</td>
                                                              <td className="px-4 py-2 text-gray-700">{h.statusDescription}</td>
                                                            </tr>
                                                          ))}
                                                        </tbody>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                )}
                                              </>
                                            ))}
                                          </tbody>
                                        </table>
                                      );
                                    })()}
                                  </div>
                                )
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

function TransformationsTable({ compact = false }: { compact?: boolean }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [opRows, setOpRows] = useState<any[]>(OP_TRANSFORMATIONS);

  useEffect(()=>{ setOpRows(OP_TRANSFORMATIONS); }, []);
  const STATUS_META: Record<string, { label: string; type: 'success' | 'warning' | 'info' | 'error' }> = {
    pending: { label: 'Pending', type: 'warning' },
    working: { label: 'Working', type: 'info' },
    completed: { label: 'Completed', type: 'success' },
  };

  const filtered = filterStatus === 'all' ? opRows : opRows.filter((t: any) => t.status === filterStatus);

  const handleOpSave = (id: string, newFrom: any[], newTo: any[], description?: string) => {
    setOpRows(prev => prev.map(r => r.id === id ? { ...r, fromItems: newFrom, toItems: newTo, estimatedQty: (newTo || []).reduce((s,i)=>s+(i.units||0),0), description } : r));
    setExpandedId(null);
  };

  function EditableOpForm({ order, onSave, onCancel }: { order: any; onSave: any; onCancel: any }) {
  const [fromItems, setFromItems] = useState<any[]>((order.fromItems||[]).map((i:any)=>({ ...i })));
  const [toItems, setToItems] = useState<any[]>((order.toItems||[]).map((i:any)=>({ ...i })));
  const [description, setDescription] = useState<string>(order.description ?? '');
    const updateFrom = (idx:number, v:number) => setFromItems(prev=>prev.map((p,i)=>i===idx?{...p, units: Number(v)}:p));
    const updateTo   = (idx:number, v:number) => setToItems(prev=>prev.map((p,i)=>i===idx?{...p, units: Number(v)}:p));
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Source Items (inputs)</span>
            <div className="mt-2 space-y-2">
              {fromItems.map((fi, idx)=>(
                <div key={idx} className="flex items-center gap-3">
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{fi.sku}</code>
                  <div className="text-sm text-gray-800 flex-1">{fi.productName}</div>
                  <input value={fi.units} onChange={e=>updateFrom(idx, Number(e.target.value))} type="number" className="w-20 px-2 py-1 border rounded text-sm" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Target Items (outputs)</span>
            <div className="mt-2 space-y-2">
              {toItems.map((to, idx)=>(
                <div key={idx} className="flex items-center gap-3">
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{to.sku}</code>
                  <div className="text-sm text-gray-800 flex-1">{to.productName}</div>
                  <input value={to.units} onChange={e=>updateTo(idx, Number(e.target.value))} type="number" className="w-20 px-2 py-1 border rounded text-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <label className="text-sm text-gray-600">Description</label>
          <input value={description} onChange={e=>setDescription(e.target.value)} className="w-full mt-1 p-2 border rounded text-sm" />
        </div>
        <div className="flex gap-2 justify-end mt-3">
          <button onClick={onCancel} className="px-3 py-1 text-sm bg-gray-100 rounded">Cancel</button>
          <button onClick={()=>onSave(order.id, fromItems, toItems, description)} className="px-3 py-1 text-sm bg-[#0B1F3A] text-white rounded">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Transformation Orders</h1>
            <p className="text-sm text-gray-500">Roasting, repackaging and blending orders (operator)</p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <QuickActions items={[{ id: 'total', title: 'Total Ops', value: opRows.length, onClick: () => {} }, { id: 'completed', title: 'Completed', value: opRows.filter(r=>r.status==='completed').length, onClick: () => {} }]} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 w-12"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Co.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inputs → Outputs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty (units)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost (EUR)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((t: any) => {
                const isExpanded = expandedId === t.id;
                const meta = STATUS_META[t.status] || { label: t.status, type: 'info' };
                return (
                  <>
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button onClick={() => setExpandedId(isExpanded ? null : t.id)} className="text-gray-500 hover:text-gray-700">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{t.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.date}</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold bg-[#0B1F3A]/10 text-[#0B1F3A]">{t.company}</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">{t.type}</span></td>
                      <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{(t.fromItems||[]).map((f:any)=>f.productName).join(' + ')}</div><div className="text-xs text-gray-400 mt-0.5">→ {(t.toItems||[]).map((f:any)=>f.productName).join(' + ')}</div></td>
                      <td className="px-6 py-4 font-medium text-gray-900">{formatNumber(t.estimatedQty ?? ((t.toItems||[]).reduce((s:any,i:any)=>s+i.units,0)))}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{formatNumber(t.cost)} EUR</td>
                      <td className="px-6 py-4"><StatusBadge status={t.status} type={meta.type} /></td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${t.id}-exp`}>
                        <td colSpan={9} className="px-6 py-0 bg-[#F5F7FA]">
                          <div className="py-4 space-y-2">
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700"><RefreshCw className="w-4 h-4 text-amber-600"/> Transformation Details</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Source Items (inputs)</span>
                                  <div className="mt-2 space-y-2">
                                    {(t.fromItems||[]).map((fi:any, idx:number) => (
                                      <div key={idx} className="flex items-center gap-3">
                                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{fi.sku}</code>
                                        <div className="text-sm text-gray-800 flex-1">{fi.productName}</div>
                                        <input type="number" defaultValue={fi.units} className="w-20 px-2 py-1 border rounded text-sm" />
                                        <div className="text-xs text-gray-500 ml-1">units</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Target Items (outputs)</span>
                                  <div className="mt-2 space-y-2">
                                    {(t.toItems||[]).map((to:any, idx:number) => (
                                      <div key={idx} className="flex items-center gap-3">
                                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{to.sku}</code>
                                        <div className="text-sm text-gray-800 flex-1">{to.productName}</div>
                                        <input type="number" defaultValue={to.units} className="w-20 px-2 py-1 border rounded text-sm" />
                                        <div className="text-xs text-gray-500 ml-1">units</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end mt-3">
                                <button className="px-3 py-1 text-sm bg-gray-100 rounded">Cancel</button>
                                <button className="px-3 py-1 text-sm bg-[#0B1F3A] text-white rounded">Save</button>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <div className="px-4 py-3 flex items-center gap-2 text-sm font-semibold text-gray-700 border-b border-gray-100"><Truck className="w-4 h-4 text-blue-600"/> Movement History ({(t.shippingHistory?.length ?? 0)} events)</div>
                              {(t.shippingHistory?.length ?? 0) === 0 ? <p className="px-4 py-3 text-sm text-gray-400">No movements recorded — order is pending scheduling.</p> : (
                                <ShippingHistory events={t.shippingHistory || []} parentInternalId={t.internalShipmentId} />
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

function SalesOrdersTable({ compact = false }: { compact?: boolean }) {
  const salesOrders = orders.filter(o => o.orderType === 'client');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const statuses = Array.from(new Set(salesOrders.map(o => o.status)));
  const rows = useMemo(() => salesOrders.filter(o => {
    const q = search.toLowerCase();
    return (!q || o.id.toLowerCase().includes(q) || o.productName.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q))
      && (!filterStatus || o.status === filterStatus);
  }), [search, filterStatus]);

  // local mock maps for transformations/shipping per order
  const TRANS_BY_ORDER: Record<string, { date: string; type: string; fromSku?: string; toSku?: string; units?: number; cost?: number; status: string }[]> = {
    'ORD-2026-001': [{ date: '2026-04-28', type: 'Roasting', fromSku: 'GC-COL-001-60KG', toSku: 'RC-COL-001-1KG', units: 10, cost: 70, status: 'Completed' }],
  };
  const SHIP_BY_ORDER: Record<string, { date: string; event: string; carrier: string; trackingRef?: string; location?: string }[]> = {
    'ORD-2026-001': [{ date: '2026-05-06 08:00', event: 'Collected', carrier: 'FedEx', trackingRef: 'FX-992211', location: 'Rotterdam WH' }],
  };

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<Record<string, 'items'|'transformations'|'shipping' | null>>({});
  const toggleSection = (orderId: string, section: 'items'|'transformations'|'shipping') => setOpenSection(prev => ({ ...prev, [orderId]: prev[orderId] === section ? null : section }));
  const toggleOrder = (id: string) => { setExpandedOrder(prev => prev === id ? null : id); if (!openSection[id]) setOpenSection(prev => ({ ...prev, [id]: 'items' })); };

  return (
    <div>
      {/* Quick actions summary above the table card */}
      <div className="mb-4">
        <QuickActions items={[
          { id: 'total', title: 'Total Orders', value: rows.length, onClick: () => {} },
          { id: 'pending', title: 'Pending', value: rows.filter(r=>r.status==='pending').length, onClick: () => {} },
          { id: 'processing', title: 'Processing', value: rows.filter(r=>r.status==='processing').length, onClick: () => {} },
          { id: 'shipped', title: 'Shipped', value: rows.filter(r=>r.status==='shipped'||r.status==='delivered').length, onClick: () => {} },
        ]} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <TableHeader title="Sales Orders" count={rows.length} query={search} setQuery={setSearch} status={filterStatus||'all'} setStatus={setFilterStatus} statusOptions={statuses.map(s=>({ value: s, label: s }))} />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Qty (kg)</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                {!compact && <th className="px-4 py-3 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(o => {
                const isExpanded = expandedOrder === o.id;
                const section = openSection[o.id];
                return (
                  <>
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button onClick={() => toggleOrder(o.id)} className="text-gray-500 hover:text-gray-700">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800">{o.id}</td>
                      <td className="px-4 py-3 text-gray-900">{o.productName}</td>
                      <td className="px-4 py-3 text-gray-600">{o.customer}</td>
                      <td className="px-4 py-3 text-gray-900">{formatNumber(o.quantity)}</td>
                      <td className="px-4 py-3 font-bold text-[#0B1F3A]">€{o.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-500">{o.date}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.status} type={o.status==='delivered'||o.status==='shipped'?'success':o.status==='processing'?'warning':'default'} /></td>
                      {!compact && <td className="px-4 py-3"><button className="px-3 py-1 bg-[#0B1F3A] text-white rounded-md hover:bg-[#0B1F3A]/90 text-xs font-semibold">Fulfill</button></td>}
                    </tr>

                    {isExpanded && (
                      <tr key={`${o.id}-exp`}>
                        <td colSpan={9} className="px-6 py-4 bg-gray-50">
                          <div className="py-4 space-y-2">
                            {/* Items accordion */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <button onClick={() => toggleSection(o.id, 'items')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">Order Items ({o.items?.length ?? 0})</div>
                                {section === 'items' ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
                              </button>
                              {section === 'items' && (
                                <table className="w-full border-t border-gray-100">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Units</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total Weight</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Gross</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">VAT</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Net</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {o.items?.map((it, i) => (
                                      <tr key={i}>
                                        <td className="px-4 py-2 text-sm text-gray-600"><code className="bg-gray-100 px-1 py-0.5 rounded">{it.sku}</code></td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{it.productName}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{formatNumber(it.units)}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{formatNumber(it.kg)} kg</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">€{(it.gross ?? 0).toFixed(2)}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">€{(it.vat ?? 0).toFixed(2)}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">€{(it.net ?? 0).toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>

                            {/* Transformation History */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <button onClick={() => toggleSection(o.id, 'transformations')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700"><RefreshCw className="w-4 h-4 text-amber-600"/> Transformation History ({(TRANS_BY_ORDER[o.id] || []).length})</div>
                                {section === 'transformations' ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
                              </button>
                              {section === 'transformations' && (
                                (TRANS_BY_ORDER[o.id] || []).length === 0
                                  ? <p className="px-4 py-3 text-sm text-gray-400 border-t border-gray-100">No transformation orders linked to this sale.</p>
                                  : (
                                    <table className="w-full border-t border-gray-100">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">From SKU</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">To SKU</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Units</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cost (EUR)</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {(TRANS_BY_ORDER[o.id] || []).map((t, i) => (
                                          <tr key={i}>
                                            <td className="px-4 py-2 text-sm text-gray-600">{t.date}</td>
                                            <td className="px-4 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">{t.type}</span></td>
                                            <td className="px-4 py-2"><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{t.fromSku}</code></td>
                                            <td className="px-4 py-2"><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{t.toSku}</code></td>
                                            <td className="px-4 py-2 text-sm">{t.units}</td>
                                            <td className="px-4 py-2 text-sm font-medium">{t.cost} EUR</td>
                                            <td className="px-4 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">{t.status}</span></td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )
                              )}
                            </div>

                            {/* Shipping History */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <button onClick={() => toggleSection(o.id, 'shipping')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Truck className="w-4 h-4 text-blue-600"/> Shipping History ({(SHIP_BY_ORDER[o.id] || []).length} events)</div>
                                {section === 'shipping' ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
                              </button>
                              {section === 'shipping' && (
                                (SHIP_BY_ORDER[o.id] || []).length === 0
                                  ? <p className="px-4 py-3 text-sm text-gray-400 border-t border-gray-100">No shipping events recorded yet.</p>
                                  : (
                                    <table className="w-full border-t border-gray-100">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Event</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Carrier</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tracking</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Location</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {(SHIP_BY_ORDER[o.id] || []).map((s, i) => (
                                          <tr key={i}>
                                            <td className="px-4 py-2 text-sm text-gray-600">{s.date}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{s.event}</td>
                                            <td className="px-4 py-2 text-sm">{s.carrier}</td>
                                            <td className="px-4 py-2"><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{s.trackingRef}</code></td>
                                            <td className="px-4 py-2 text-sm text-gray-600">{s.location}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )
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

// PricingTable removed — seller-only pricing tool lives under /seller/pricing

function CashSection({ compact = false }: { compact?: boolean }) {
  const balance = 48_290.20;
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const companies = Array.from(new Set(TRANSACTIONS.map(t => t.company)));
  const rows = useMemo(() => TRANSACTIONS.filter(t => {
    const q = search.toLowerCase();
    return (!q || t.description.toLowerCase().includes(q) || t.company.toLowerCase().includes(q))
      && (!filterCompany || t.company === filterCompany);
  }), [search, filterCompany]);

  if (compact) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-green-50 p-6 rounded-lg text-center border border-green-100 flex flex-col justify-center">
          <div className="text-xs text-green-600 font-bold uppercase tracking-widest mb-1">Platform Balance</div>
          <div className="text-3xl font-bold text-green-700">€{formatNumber(balance, 2)}</div>
        </div>
        <div className="md:col-span-2 space-y-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b pb-1">Recent Transactions</div>
          {TRANSACTIONS.slice(0, 4).map(t => (
            <div key={t.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
              <div>
                <div className="font-semibold text-gray-900">{t.description}</div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-1 rounded uppercase">{t.company}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">{t.date}</span>
                </div>
              </div>
              <div className={`font-bold ${t.amount>0?'text-green-600':'text-red-600'}`}>{t.amount>0?'+':''}€{formatNumber(Math.abs(t.amount),2)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
          <div className="text-xs text-green-600 font-bold uppercase tracking-widest mb-1">Platform Balance</div>
          <div className="text-3xl font-bold text-green-700">€{formatNumber(balance, 2)}</div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
          <div className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Inflow (30 days)</div>
          <div className="text-3xl font-bold text-blue-700">€{formatNumber(TRANSACTIONS.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0), 2)}</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
          <div className="text-xs text-red-600 font-bold uppercase tracking-widest mb-1">Outflow (30 days)</div>
          <div className="text-3xl font-bold text-red-700">€{formatNumber(Math.abs(TRANSACTIONS.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0)), 2)}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex items-center gap-2 bg-[#0B1F3A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0B1F3A]/90">
          <RefreshCw size={14}/> Process Refund
        </button>
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          <DollarSign size={14}/> Withdraw Funds
        </button>
      </div>

      {/* Transaction log */}
      <div>

        <div className="bg-white rounded-lg border border-gray-200">
          <TableHeader title="Transactions" count={rows.length} query={search} setQuery={setSearch} status={filterCompany || 'all'} setStatus={setFilterCompany} statusOptions={companies.map(c=>({ value: c, label: c }))} />
          <div className="overflow-x-auto">
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
          {rows.length === 0 && <EmptyState />}
        </div>
      </div>
    </div>
    </div>
  );
}

function EmptyState() {
  return <p className="text-center py-8 text-sm text-gray-400">No results match your search.</p>;
}

// ─── View → component router ──────────────────────────────────────────────────

function ContentForView({ view, compact }: { view: Exclude<View,'overview'>; compact: boolean }) {
  switch (view) {
    case 'users':       return <UsersTable        compact={compact} />;
    case 'companies':   return <CompaniesTable    compact={compact} />;
    case 'user_rights': return <UserRightsTable   compact={compact} />;
    case 'stock':       return <StockTable        compact={compact} />;
    case 'skus':        return <RegisteredSKUsTable compact={compact} />;
    case 'producers':   return <ProducersTable    compact={compact} />;
    case 'transformations': return <TransformationsTable compact={compact} />;
    case 'restocking':  return <RestockingTable   compact={compact} />;
    case 'sales_orders':return <SalesOrdersTable  compact={compact} />;
    case 'cash':        return <CashSection       compact={compact} />;
  }
}

// ─── Hash → View ──────────────────────────────────────────────────────────────

function hashToView(hash: string): View {
  const key = hash.replace('#', '') as View;
  const valid: View[] = ['users','companies','user_rights','stock','skus','producers','transformations','restocking','sales_orders','cash'];
  return valid.includes(key) ? key : 'overview';
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function OperatorDashboard() {
  const location = useLocation();
  // If this is a nested route (e.g. /operator/shipments) render the child via Outlet
  const isNestedRoute = location.pathname !== '/operator';
  if (isNestedRoute) {
    return (
      <DashboardLayout role="operator">
        <Outlet />
      </DashboardLayout>
    );
  }

  const activeView: View = hashToView(location.hash);
  const [activeOverviewTab, setActiveOverviewTab] = useState<Exclude<View,'overview'>>('users');

  // Per-view subtitles to replace the generic "Full view with search and filters."
  const VIEW_SUBTITLES: Record<View, string> = {
    overview: 'Overview of key KPIs and quick links.',
    users: 'Manage user accounts, groups and quick actions.',
    companies: 'Manage companies, documents and statuses.',
    user_rights: 'Review and assign user permissions scoped to companies.',
    stock: 'Browse warehouse stock levels; expand rows for transformations and shipping logs.',
    skus: 'Manage registered SKUs, producers and product information.',
    producers: 'Manage coffee producers and suppliers.',
    transformations: 'Track all transformation orders and their status.',
    restocking: 'Review restocking orders and link them to shipments and transformations.',
    sales_orders: 'Sales orders with SKU details, transformation history and shipping events.',
    cash: 'View cash transactions and recent activity for accounts.',
  };

  const totalStock      = products.reduce((sum, p) => sum + p.stock, 0);
  const pendingRefills  = orders.filter(o => o.orderType === 'restocking' && o.status === 'pending').length;
  const activeCompanies = COMPANIES.filter(c => c.status === 'Active').length;

  return (
    <DashboardLayout role="operator">
      <div className="space-y-6">

        {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
        {activeView === 'overview' && (
          <>
            <DashboardOverview role="operator" />
          </>
        )}

        {/* ── DETAIL PAGES ──────────────────────────────────────────────────── */}
        {activeView !== 'overview' && (
          <>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <a href="/operator" className="hover:text-[#0B1F3A] font-medium">Dashboard</a>
              <ChevronRight size={14} />
              <span className="text-[#0B1F3A] font-semibold">{VIEW_LABELS[activeView]}</span>
            </div>

            {/* Page Header with Title & Description */}
            <div>
              <h1 className="text-3xl font-bold text-[#0B1F3A] mb-1">{VIEW_LABELS[activeView]}</h1>
              <p className="text-gray-600">{VIEW_SUBTITLES[activeView]}</p>
            </div>

            {/* Content View - preserves all internal QuickActions, Filters, TableHeader */}
            <ContentForView view={activeView} compact={false} />
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
