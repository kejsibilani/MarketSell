import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatusBadge } from "../components/StatusBadge";
import { ChevronDown, ChevronUp, RefreshCw, Truck } from "lucide-react";
import formatNumber from "../utils/numberFormat";
import QuickFilters from "../components/QuickFilters";
import FilterBar from '../components/FilterBar';
import QuickActions from '../components/QuickActions';
import TableHeader from '../components/TableHeader';
import PageHeader from '../components/PageHeader';

interface TransformItem { sku: string; productName: string; units: number; kg?: number }
interface TransformationOrder {
  id: string; date: string; company: string; type: string;
  description?: string;
  internalShipmentId?: string;
  fromItems: TransformItem[]; // inputs (many-to-many)
  toItems: TransformItem[];   // outputs (many-to-many)
  estimatedQty?: number; cost: number; status: "pending" | "working" | "completed";
  shippingHistory: { date: string; event: string; location: string; carrier?: string; trackingRef?: string; internalShipmentId?: string }[];
}

const STATUS_META: Record<string, { label: string; type: "success" | "warning" | "info" | "error" }> = {
  pending:   { label: "Pending",   type: "warning" },
  working:   { label: "Working",   type: "info"    },
  completed: { label: "Completed", type: "success" },
};

const MOCK: TransformationOrder[] = [
  {
    id: "TRF-2026-001",
    date: "18.04.26",
  company: "NFCOF",
  description: "Roast and repackage Colombian green into retail packs",
  internalShipmentId: "ISP-1001",
    type: "Roasting",
    fromItems: [
      { sku: "GC-COL-001-60KG", productName: "Colombian Supremo — 60 kg bag", units: 5, kg: 300 },
      { sku: "GC-COL-002-60KG", productName: "Colombian Supreme Extra — 60 kg bag", units: 2, kg: 120 },
    ],
    toItems: [
      { sku: "RC-COL-001-1KG", productName: "Colombian Supremo — 1 kg bag", units: 40, kg: 40 },
    ],
    estimatedQty: 42,
    cost: 70.0,
    status: "completed",
    shippingHistory: [
      { date: "18.04.26", event: "Sent to roasting facility", location: "Rotterdam WH → Roast Lab BCN", carrier: "Costas Ocean", trackingRef: "CST-8812", internalShipmentId: "ISP-1001" },
      { date: "22.04.26", event: "Roasting completed", location: "Roast Lab BCN" },
      { date: "23.04.26", event: "Returned to warehouse", location: "Rotterdam WH" },
    ],
  },
  {
    id: "TRF-2026-002",
    date: "10.05.26",
    company: "NFCOF",
    description: "Repack green bag into sample retail 1kg bags",
    internalShipmentId: "ISP-1002",
    type: "Repackaging",
    fromItems: [ { sku: "GC-ETH-004-60KG", productName: "Ethiopian Yirgacheffe Green — 60 kg bag", units: 5, kg: 300 } ],
    toItems: [ { sku: "RC-ETH-002-1KG", productName: "Ethiopian Yirgacheffe — 1 kg bag", units: 6, kg: 6 } ],
    estimatedQty: 6,
    cost: 35.0,
    status: "working",
  shippingHistory: [ { date: "10.05.26", event: "Dispatched to facility", location: "Rotterdam WH → Partner WH", carrier: "FedEx", trackingRef: "FX-22193", internalShipmentId: "ISP-1002" } ],
  },
  {
    id: "TRF-2026-003",
    date: "20.05.26",
  company: "NFCAO",
  description: "Blend cacao and coffee for premium mix",
  internalShipmentId: "ISP-1003",
    type: "Blending",
    fromItems: [ { sku: "CAC-GHA-002-25KG", productName: "Ghana Cacao — 25 kg sack", units: 4, kg: 100 } ],
    toItems: [ { sku: "CAC-BLD-001-5KG", productName: "Premium Blend Cacao — 5 kg bag", units: 18, kg: 90 } ],
    estimatedQty: 18,
    cost: 20.0,
    status: "pending",
  shippingHistory: [],
  },
];

export default function SellerTransformations() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rows, setRows] = useState<TransformationOrder[]>(MOCK);

  useEffect(()=>{
    setRows(MOCK);
  },[]);

  const filtered = filterStatus === "all" ? rows : rows.filter(t => t.status === filterStatus);

  const handleSave = (id: string, newFrom: TransformItem[], newTo: TransformItem[], description?: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, fromItems: newFrom, toItems: newTo, estimatedQty: newTo.reduce((s,i)=>s+i.units,0), description } : r));
    setExpandedId(null);
  };

  return (
      <div className="space-y-6">
        <PageHeader
          title="My Transformation Orders"
          description="Roasting, repackaging, and blending orders applied to your stock"
          onExport={() => { /* stub */ }}
          onAddNew={() => alert('Create new transformation order functionality coming soon!')}
          addNewLabel="New Transformation Order"
        />

  {/* Status filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
            {["all", "pending", "working", "completed"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filterStatus === s ? "bg-[#0B1F3A] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {STATUS_META[s]?.label ?? "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions (above table) */}
        <QuickActions items={[{ id: 'total', title: 'Total Ops', value: rows.length, onClick: () => {} }, { id: 'completed', title: 'Completed', value: rows.filter(r=>r.status==='completed').length, onClick: () => {} }]} />

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <TableHeader title="Transformation Orders" count={filtered.length} query={''} setQuery={() => {}} status={filterStatus} setStatus={setFilterStatus} statusOptions={Object.keys(STATUS_META).map(k=>({ value: k, label: STATUS_META[k].label }))} />
          <div className="p-0">
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
                {filtered.map(t => {
                  const isExpanded = expandedId === t.id;
                  const meta = STATUS_META[t.status];
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
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold bg-[#0B1F3A]/10 text-[#0B1F3A]">
                            {t.company}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">{t.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{t.fromItems.map(fi=>fi.productName).join(' + ')}</div>
                          <div className="text-xs text-gray-400 mt-0.5">→ {t.toItems.map(to=>to.productName).join(' + ')}</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{formatNumber(t.estimatedQty ?? t.toItems.reduce((s,i)=>s+i.units,0))}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{formatNumber(t.cost)} EUR</td>
                        <td className="px-6 py-4"><StatusBadge status={t.status} type={meta.type} /></td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${t.id}-exp`}>
                          <td colSpan={9} className="px-6 py-0 bg-[#F5F7FA]">
                            <div className="py-4 space-y-2">
                              {/* Details */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                                  <RefreshCw className="w-4 h-4 text-amber-600" /> Transformation Details
                                </div>
                                <EditableTransformationForm order={t} onSave={handleSave} onCancel={() => setExpandedId(null)} />
                              </div>

                              {/* Shipping removed from transformation details per request */}
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
    </div>
  );
}

function EditableTransformationForm({ order, onSave, onCancel }: { order: TransformationOrder; onSave: (id:string, from:TransformItem[], to:TransformItem[], description?:string)=>void; onCancel: ()=>void }) {
  const [fromItems, setFromItems] = useState<TransformItem[]>(order.fromItems.map(i=>({ ...i })));
  const [toItems, setToItems] = useState<TransformItem[]>(order.toItems.map(i=>({ ...i })));
  const [description, setDescription] = useState<string>(order.description ?? '');

  const updateFrom = (idx:number, val:number) => setFromItems(prev=>prev.map((p,i)=>i===idx?{...p, units: Number(val)}:p));
  const updateTo   = (idx:number, val:number) => setToItems(prev=>prev.map((p,i)=>i===idx?{...p, units: Number(val)}:p));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Source Items (inputs)</span>
          <div className="mt-2 space-y-2">
            {fromItems.map((fi, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{fi.sku}</code>
                <div className="text-sm text-gray-800 flex-1">{fi.productName}</div>
                <input value={fi.units} onChange={e=>updateFrom(idx, Number(e.target.value))} type="number" className="w-20 px-2 py-1 border rounded text-sm" />
                <div className="text-xs text-gray-500 ml-1">units</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Target Items (outputs)</span>
          <div className="mt-2 space-y-2">
            {toItems.map((to, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{to.sku}</code>
                <div className="text-sm text-gray-800 flex-1">{to.productName}</div>
                <input value={to.units} onChange={e=>updateTo(idx, Number(e.target.value))} type="number" className="w-20 px-2 py-1 border rounded text-sm" />
                <div className="text-xs text-gray-500 ml-1">units</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <label className="text-sm text-gray-600">Description</label>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full mt-1 p-2 border rounded text-sm" rows={3} />
      </div>
      <div className="flex gap-2 justify-end mt-3">
        <button onClick={onCancel} className="px-3 py-1 text-sm bg-gray-100 rounded">Cancel</button>
        <button onClick={()=>onSave(order.id, fromItems, toItems, description)} className="px-3 py-1 text-sm bg-[#0B1F3A] text-white rounded">Save</button>
      </div>
    </div>
  );
}