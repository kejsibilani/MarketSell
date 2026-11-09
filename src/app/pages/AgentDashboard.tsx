import { useState } from "react";
import { useLocation, Link, Outlet } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  Percent,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AgentDataProvider, useAgentData } from "../hooks/useAgentData";
import formatNumber from "../utils/numberFormat";

function AgentOverview() {
  const {
    agentName,
    allocations,
    requests,
    agentOrders,
    totalCommission,
    commissionRate,
  } = useAgentData();

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const activeOrders = agentOrders.filter(
    (o) =>
      o.status === "processing" ||
      o.status === "pending" ||
      o.status === "shipped"
  );

  // Derive sales performance chart data from completed/active orders
  const chartData = [
    { name: "Mon", sales: 420, commission: 420 * commissionRate },
    { name: "Tue", sales: 680, commission: 680 * commissionRate },
    { name: "Wed", sales: 510, commission: 510 * commissionRate },
    { name: "Thu", sales: 890, commission: 890 * commissionRate },
    { name: "Fri", sales: 1200, commission: 1200 * commissionRate },
    { name: "Sat", sales: 940, commission: 940 * commissionRate },
    { name: "Sun", sales: 1100, commission: 1100 * commissionRate },
  ];

  const stats = [
    {
      label: "Assigned SKUs",
      value: allocations.length,
      icon: Package,
      href: "/agent/stock",
      note:
        pendingRequests.length > 0
          ? `${pendingRequests.length} request pending`
          : "All requests resolved",
      change: "+2 this week",
    },
    {
      label: "Active Orders",
      value: activeOrders.length,
      icon: ShoppingCart,
      href: "/agent/orders",
      note: `${agentOrders.length} total placed`,
      change: "+12%",
    },
    {
      label: "Total Commission",
      value: `€${formatNumber(totalCommission, 2)}`,
      icon: DollarSign,
      href: "/agent/commissions",
      note: `${(commissionRate * 100).toFixed(0)}% per sale`,
      change: "+18.4%",
    },
    {
      label: "Pending Requests",
      value: pendingRequests.length,
      icon: Clock,
      href: "/agent/stock",
      note: "Awaiting seller approval",
      change: "Action needed",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A]">Agent Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, <span className="font-semibold text-[#0B1F3A]">{agentName}</span> — manage your allocations & sales metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/agent/orders"
            className="flex items-center gap-2 bg-[#0B1F3A] text-white px-4 py-2 rounded-lg hover:bg-[#0B1F3A]/90 font-medium text-sm transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Enter Sales Order
          </Link>
          <Link
            to="/agent/commissions"
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors shadow-sm"
          >
            <Percent className="w-4 h-4" />
            View Commissions
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#0B1F3A]/40 hover:shadow-md transition-all block group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-[#0B1F3A]/5 flex items-center justify-center group-hover:bg-[#0B1F3A] transition-colors">
                <s.icon className="w-5 h-5 text-[#0B1F3A] group-hover:text-white transition-colors" />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#0B1F3A] mt-4">{s.value}</p>
            <p className="text-sm font-medium text-gray-700">{s.label}</p>
            <p className="text-xs text-gray-400 mt-1">{s.note}</p>
          </Link>
        ))}
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Area Graph */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#0B1F3A]">Sales & Commission Performance</h2>
              <p className="text-xs text-gray-500">Weekly breakdown of revenue vs commission earned</p>
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Last 7 Days
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B1F3A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0B1F3A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B1F3A",
                    borderRadius: "8px",
                    color: "#FFF",
                    border: "none",
                  }}
                  itemStyle={{ color: "#FFF" }}
                  formatter={(value: any) => [`€${value}`, ""]}
                />
                <Area type="monotone" dataKey="sales" name="Sales (€)" stroke="#0B1F3A" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="commission" name="Commission (€)" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#commGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations & Stock Insights */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-amber-50">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-[#0B1F3A]">Smart Recommendations</h2>
            </div>

            <div className="space-y-3">
              {allocations.length === 0 ? (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-600">
                  You have no assigned stock yet. Head over to{" "}
                  <Link to="/agent/stock" className="text-[#0B1F3A] font-semibold hover:underline">
                    Assigned Stock
                  </Link>{" "}
                  to request an allocation.
                </div>
              ) : (
                allocations.map((a) => {
                  const remaining = a.qtyAllocatedKg - a.qtySoldKg;
                  const pctSold = a.qtyAllocatedKg > 0 ? a.qtySoldKg / a.qtyAllocatedKg : 0;
                  if (pctSold < 0.7) return null;
                  return (
                    <div key={a.id} className="text-sm text-amber-900 bg-amber-50/80 border border-amber-200/60 rounded-xl p-4">
                      <p className="font-semibold text-amber-900 mb-1">Stock Depletion Warning</p>
                      You've sold <span className="font-bold">{Math.round(pctSold * 100)}%</span> of your allocated stock for this product. Only{" "}
                      <span className="font-bold">{formatNumber(remaining)} kg</span> left!
                    </div>
                  );
                })
              )}

              {allocations.length > 0 &&
                allocations.every(
                  (a) => (a.qtyAllocatedKg > 0 ? a.qtySoldKg / a.qtyAllocatedKg : 0) < 0.7
                ) && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-800">
                    <p className="font-semibold text-emerald-900 mb-1">Optimal Stock Levels</p>
                    No urgent stock re-orders needed. All allocations are in healthy ranges.
                  </div>
                )}
            </div>
          </div>

          <Link
            to="/agent/stock"
            className="mt-6 flex items-center justify-between text-xs font-semibold text-[#0B1F3A] bg-gray-50 hover:bg-gray-100 p-3 rounded-lg border border-gray-200 transition-colors"
          >
            <span>Request Additional Allocations</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Allocated Products Overview Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#0B1F3A]">Assigned Stock Status</h2>
          <Link to="/agent/stock" className="text-sm font-semibold text-[#0B1F3A] hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Product ID</th>
                <th className="py-3 px-4">Allocated (kg)</th>
                <th className="py-3 px-4">Sold (kg)</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    No active product allocations found.
                  </td>
                </tr>
              ) : (
                allocations.slice(0, 5).map((alloc) => {
                  const pct = alloc.qtyAllocatedKg > 0 ? (alloc.qtySoldKg / alloc.qtyAllocatedKg) * 100 : 0;
                  return (
                    <tr key={alloc.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#0B1F3A]">{alloc.productId}</td>
                      <td className="py-3.5 px-4">{formatNumber(alloc.qtyAllocatedKg)} kg</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600">{formatNumber(alloc.qtySoldKg)} kg</td>
                      <td className="py-3.5 px-4 w-48">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-[#0B1F3A] h-2 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                          </div>
                          <span className="text-xs font-medium text-gray-500">{Math.round(pct)}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link to="/agent/stock" className="text-xs font-semibold text-[#0B1F3A] hover:underline">
                          Order Stock
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AgentDashboard() {
  const location = useLocation();
  const isNestedRoute = location.pathname !== "/agent";

  if (isNestedRoute) {
    return (
      <DashboardLayout role="agent">
        <AgentDataProvider>
          <Outlet />
        </AgentDataProvider>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="agent">
      <AgentDataProvider>
        <AgentOverview />
      </AgentDataProvider>
    </DashboardLayout>
  );
}