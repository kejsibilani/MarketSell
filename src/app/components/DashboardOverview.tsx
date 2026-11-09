import React, { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import { Settings, Sliders } from 'lucide-react';
import { ChartContainer } from './ui/chart';
import { colors } from '../styles/designSystem';

type WidgetKey = 'revenue' | 'orders' | 'inventory_health' | 'shipments' | 'transformations';

const allWidgets: { key: WidgetKey; title: string }[] = [
  { key: 'revenue', title: 'Revenue (30d)' },
  { key: 'orders', title: 'Sales Orders (30d)' },
  { key: 'inventory_health', title: 'Inventory Health' },
  { key: 'shipments', title: 'Shipments Status' },
  { key: 'transformations', title: 'Transformation Orders' },
];

function lastNDays(n: number) {
  const out: { date: string; value: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ date: d.toISOString().slice(0, 10), value: Math.round(200 + Math.random() * 800) });
  }
  return out;
}

export default function DashboardOverview({ role }: { role?: string }) {
  const key = role || 'default';
  const storageKey = `dashboard_widgets_${key}`;
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetKey[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as WidgetKey[];
    } catch (e) {}
    return ['revenue', 'orders', 'inventory_health'];
  });
  const [openSettings, setOpenSettings] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(visibleWidgets));
    } catch (e) {}
  }, [visibleWidgets, storageKey]);

  const revenueData = useMemo(() => lastNDays(30).map((d, i) => ({ ...d, revenue: Math.round(d.value * 1.2) })), []);
  const ordersData = useMemo(() => lastNDays(30).map((d, i) => ({ ...d, orders: Math.round(10 + Math.random() * 40) })), []);
  const inventoryData = useMemo(() => [
    { name: 'Healthy', value: 64 },
    { name: 'Low', value: 18 },
    { name: 'Critical', value: 12 },
    { name: 'Out', value: 6 },
  ], []);
  const shipmentsData = useMemo(() => [
    { name: 'in_transit', count: 24 }, { name: 'delivered', count: 120 }, { name: 'pending', count: 12 }
  ], []);
  const transformationsData = useMemo(() => [
    { name: 'pending', count: 8 }, { name: 'working', count: 14 }, { name: 'completed', count: 120 }
  ], []);

  const toggleWidget = (k: WidgetKey) => {
    setVisibleWidgets(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>Overview</h2>
        <div className="relative">
          <button onClick={() => setOpenSettings(s => !s)} className="p-2 rounded hover:bg-gray-100">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          {openSettings && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg p-3 z-20">
              <div className="text-sm font-semibold mb-2">Widgets</div>
              <div className="space-y-2">
                {allWidgets.map(w => (
                  <label key={w.key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={visibleWidgets.includes(w.key)} onChange={() => toggleWidget(w.key)} />
                    <span>{w.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visibleWidgets.includes('revenue') && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700">Revenue (30d)</h3>
            <div className="mt-3 h-36">
              <ChartContainer id="rev" config={{ revenue: { color: colors.primary } }}>
                <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.primary} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke={colors.primary} fillOpacity={1} fill="url(#g1)" />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>
        )}

        {visibleWidgets.includes('orders') && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700">Sales Orders (30d)</h3>
            <div className="mt-3 h-36">
              <ChartContainer id="orders" config={{ orders: { color: colors.primary } }}>
                <BarChart data={ordersData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="orders" fill={colors.primary} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        )}

        {visibleWidgets.includes('inventory_health') && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700">Inventory Health</h3>
            <div className="mt-3 h-36">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={inventoryData} dataKey="value" nameKey="name" outerRadius={50} innerRadius={30} label={false}>
                    {inventoryData.map((entry, idx) => (
                      <Cell key={entry.name} fill={["#10B981", "#F59E0B", "#F97316", "#EF4444"][idx % 4]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700">Trends & Insights</h3>
          <div className="mt-3 space-y-2">
            <div className="h-48 bg-gray-50 rounded border flex items-center justify-center text-gray-400">Trend chart placeholder</div>
            <div className="flex gap-3 mt-3">
              <div className="flex-1 bg-white border rounded p-3">Top SKUs</div>
              <div className="w-40 bg-white border rounded p-3">Stock warnings</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700">AI Suggestions</h3>
          <div className="mt-3 space-y-3">
            <div className="p-3 bg-indigo-50 rounded">Suggest reordering <strong>RC-COL-001-1KG</strong> — low stock</div>
            <div className="p-3 bg-indigo-50 rounded">Consider bundling <strong>GC-COL-001-60KG</strong> + <strong>RC-COL-001-1KG</strong></div>
            <div className="p-3 bg-indigo-50 rounded">Forecast demand increase for Spain region</div>
          </div>

          <div className="mt-4">
            <h4 className="text-xs text-gray-500 mb-2">Quick actions</h4>
            <div className="flex flex-col gap-2">
              <button className="px-3 py-2 text-white rounded" style={{ backgroundColor: colors.primary }}>Create Purchase Order</button>
              <button className="px-3 py-2 border rounded">Run Pricing Tool</button>
              <button className="px-3 py-2 border rounded">Request Carrier Quote</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleWidgets.includes('shipments') && (
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700">Shipments Status</h3>
            <div className="mt-3 h-36">
              <ResponsiveContainer>
                <BarChart data={shipmentsData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="count" fill={colors.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {visibleWidgets.includes('transformations') && (
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700">Transformation Orders</h3>
            <div className="mt-3 h-36">
              <ResponsiveContainer>
                <BarChart data={transformationsData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="count" fill={colors.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
