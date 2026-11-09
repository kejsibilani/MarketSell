import { useState } from 'react';
import { Link } from 'react-router';
import { DashboardLayout } from '../components/DashboardLayout';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { Package, ShoppingCart, TrendingDown, Clock } from 'lucide-react';
import { orders, products } from '../data/mockData';
import formatNumber from '../utils/numberFormat';

export default function BuyerDashboard() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');

  // Mock buyer's orders
  const myOrders = orders;
  const totalSpent = myOrders.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = myOrders.filter(o => o.status !== 'delivered').length;
  const deliveredOrders = myOrders.filter(o => o.status === 'delivered').length;
  const avgOrderValue = totalSpent / myOrders.length;

  const filteredOrders = filterStatus === 'all' 
    ? myOrders 
    : myOrders.filter(o => o.status === filterStatus);

  return (
    <DashboardLayout role="buyer">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A]">Buyer Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your orders and purchases</p>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <KPICard
            title="Active Orders"
            value={activeOrders}
            change={`${activeOrders} orders in progress`}
            changeType={activeOrders > 0 ? "negative" : "positive"}
            icon={Clock}
          />
          <KPICard
            title="Delivered Orders"
            value={deliveredOrders}
            change="This month"
            changeType="positive"
            icon={Package}
          />
          <KPICard
            title="Total Spent"
            value={`€${formatNumber(totalSpent, 2)}`}
            change="+15% from last month"
            changeType="neutral"
            icon={ShoppingCart}
          />
          <KPICard
            title="Avg Order Value"
            value={`€${formatNumber(avgOrderValue, 2)}`}
            change="Per order"
            changeType="neutral"
            icon={TrendingDown}
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0B1F3A]">My Orders</h2>
              <div className="flex items-center gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
                <Link to="/marketplace">
                  <button className="bg-[#0B1F3A] text-white px-4 py-2 rounded-lg hover:bg-[#0B1F3A]/90 font-medium">
                    Browse Products
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const product = products.find(p => p.name === order.productName);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{order.productName}</div>
                          <div className="text-sm text-gray-500">{product?.origin}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{product?.owner || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-900">{order.quantity} kg</td>
                      <td className="px-6 py-4 font-medium text-gray-900">€{order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-600">{order.date}</td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={order.status}
                          type={
                            order.status === 'delivered'
                              ? 'success'
                              : order.status === 'shipped'
                              ? 'success'
                              : order.status === 'processing'
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-[#0B1F3A] hover:underline text-sm font-medium">
                          Track
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reorder Suggestions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[#0B1F3A] mb-4">Suggested Reorders</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.origin}</p>
                  </div>
                  <div className="text-4xl">☕</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Last ordered</p>
                    <p className="text-sm font-medium text-gray-900">2 weeks ago</p>
                  </div>
                  <button className="bg-[#0B1F3A] text-white px-4 py-2 rounded-lg hover:bg-[#0B1F3A]/90 text-sm font-medium">
                    Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}