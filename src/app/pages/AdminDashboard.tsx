import { DashboardLayout } from '../components/DashboardLayout';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { Users, TrendingUp, AlertCircle, Activity, CheckCircle, XCircle, Settings, Store } from 'lucide-react';
import { products, orders } from '../data/mockData';
import formatNumber from '../utils/numberFormat';

export default function AdminDashboard() {
  const totalPartners = 15;
  const pendingApprovals = 2;
  const activeUsers = 48;
  const totalRevenue = 127450;

  const partners = [
    { id: '1', name: 'Costa Coffee Co.', type: 'Seller', status: 'active', joinDate: '2025-11-15', revenue: 45200, contract: 'Standard' },
    { id: '2', name: 'African Beans Ltd.', type: 'Seller', status: 'active', joinDate: '2025-12-01', revenue: 32100, contract: 'Premium' },
    { id: '3', name: 'European Coffee Agents', type: 'Agent', status: 'active', joinDate: '2026-01-10', revenue: 8900, contract: 'Standard' },
    { id: '4', name: 'Nordic Coffee Imports', type: 'Seller', status: 'pending', joinDate: '2026-03-20', revenue: 0, contract: 'Pending' },
    { id: '5', name: 'Mediterranean Traders', type: 'Agent', status: 'pending', joinDate: '2026-03-22', revenue: 0, contract: 'Pending' },
    { id: '6', name: 'Cafe Milano', type: 'Buyer', status: 'active', joinDate: '2025-10-05', revenue: 0, contract: 'Standard' },
  ];

  const systemAlerts = [
    { id: '1', type: 'warning', message: 'Rotterdam warehouse at 85% capacity', priority: 'high' },
    { id: '2', type: 'error', message: 'Order ORD-003 delayed - shipment issue', priority: 'high' },
    { id: '3', type: 'info', message: 'Ethiopian Yirgacheffe stock low (< 500kg)', priority: 'medium' },
  ];

  const globalKPIs = [
    { label: 'Total Sales (MTD)', value: '€127,450', change: '+18%', changeType: 'positive' },
    { label: 'Active Orders', value: '24', change: '8 shipped today', changeType: 'neutral' },
    { label: 'Avg. Warehouse Utilization', value: '56%', change: 'Across 3 locations', changeType: 'neutral' },
    { label: 'Platform Uptime', value: '99.8%', change: 'Last 30 days', changeType: 'positive' },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A]">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform control, partner management, and system configuration</p>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <KPICard
            title="Total Partners"
            value={totalPartners}
            change={`${pendingApprovals} pending approval`}
            changeType="neutral"
            icon={Users}
          />
          <KPICard
            title="Active Users"
            value={activeUsers}
            change="+6 this month"
            changeType="positive"
            icon={Activity}
          />
          <KPICard
            title="Total Revenue"
            value={`€${formatNumber(totalRevenue, 2)}`}
            change="+18% from last month"
            changeType="positive"
            icon={TrendingUp}
          />
          <KPICard
            title="System Alerts"
            value={systemAlerts.length}
            change="2 require attention"
            changeType="negative"
            icon={AlertCircle}
          />
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#0B1F3A]">System Alerts</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    alert.type === 'error' ? 'bg-red-50 border-red-200' :
                    alert.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    alert.type === 'error' ? 'text-red-600' :
                    alert.type === 'warning' ? 'text-orange-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-600 mt-1">Priority: {alert.priority}</p>
                  </div>
                  <button className="text-[#0B1F3A] text-sm hover:underline font-medium">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Global KPIs */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#0B1F3A]">Global KPIs</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {globalKPIs.map((kpi, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm text-gray-600">{kpi.label}</p>
                      <p className="text-2xl font-bold text-[#0B1F3A] mt-1">{kpi.value}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${
                        kpi.changeType === 'positive' ? 'text-green-600' :
                        kpi.changeType === 'negative' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {kpi.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#0B1F3A]">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <Settings className="w-6 h-6 text-[#0B1F3A] mb-2" />
                  <p className="font-medium text-gray-900">Configure Pricing</p>
                  <p className="text-xs text-gray-600 mt-1">Set rules & commissions</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <Store className="w-6 h-6 text-[#0B1F3A] mb-2" />
                  <p className="font-medium text-gray-900">Manage Stores</p>
                  <p className="text-xs text-gray-600 mt-1">Configure marketplaces</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <Users className="w-6 h-6 text-[#0B1F3A] mb-2" />
                  <p className="font-medium text-gray-900">User Permissions</p>
                  <p className="text-xs text-gray-600 mt-1">Manage access levels</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <Activity className="w-6 h-6 text-[#0B1F3A] mb-2" />
                  <p className="font-medium text-gray-900">View Reports</p>
                  <p className="text-xs text-gray-600 mt-1">Analytics & insights</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Management */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0B1F3A]">Partner Management</h2>
              <p className="text-sm text-gray-600 mt-1">Approve, reject, and manage all partners</p>
            </div>
            <button className="bg-[#0B1F3A] text-white px-4 py-2 rounded-lg hover:bg-[#0B1F3A]/90 font-medium">
              View All Partners
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{partner.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        partner.type === 'Seller' ? 'bg-blue-100 text-blue-800' :
                        partner.type === 'Agent' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {partner.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={partner.status}
                        type={partner.status === 'active' ? 'success' : 'warning'}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{partner.contract}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{partner.joinDate}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {partner.revenue > 0 ? `€${formatNumber(partner.revenue, 2)}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {partner.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 text-sm">
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button className="text-[#0B1F3A] hover:underline font-medium text-sm">
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Pricing Control */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#0B1F3A]">Global Pricing Control</h2>
            <p className="text-sm text-gray-600 mt-1">Configure commission structures and pricing strategies</p>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Agent Commission</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-[#0B1F3A]">12%</span>
                  <span className="text-sm text-gray-600">standard rate</span>
                </div>
                <button className="text-[#0B1F3A] text-sm hover:underline">Modify Rate →</button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Seller Fees</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-[#0B1F3A]">5%</span>
                  <span className="text-sm text-gray-600">per transaction</span>
                </div>
                <button className="text-[#0B1F3A] text-sm hover:underline">Modify Fee →</button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Pricing Strategy</h3>
                <p className="text-sm text-gray-600 mb-3">Dynamic pricing enabled for high-demand products</p>
                <button className="text-[#0B1F3A] text-sm hover:underline">Configure Rules →</button>
              </div>
            </div>
          </div>
        </div>

        {/* Store Configuration */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#0B1F3A]">Store Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">Manage which products appear on each marketplace</p>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">Origo</h3>
                  <Store className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Products:</span>
                    <span className="font-medium text-gray-900">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Orders:</span>
                    <span className="font-medium text-gray-900">127</span>
                  </div>
                </div>
                <button className="text-[#0B1F3A] text-sm hover:underline font-medium">
                  Configure Store →
                </button>
              </div>

              <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">Peakline</h3>
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Products:</span>
                    <span className="font-medium text-gray-900">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Orders:</span>
                    <span className="font-medium text-gray-900">89</span>
                  </div>
                </div>
                <button className="text-[#0B1F3A] text-sm hover:underline font-medium">
                  Configure Store →
                </button>
              </div>

              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">Ember</h3>
                  <Store className="w-5 h-5 text-green-600" />
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Products:</span>
                    <span className="font-medium text-gray-900">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Orders:</span>
                    <span className="font-medium text-gray-900">54</span>
                  </div>
                </div>
                <button className="text-[#0B1F3A] text-sm hover:underline font-medium">
                  Configure Store →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Supervision */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#0B1F3A]">Order Supervision</h2>
            <p className="text-sm text-gray-600 mt-1">View all orders across the system with override capabilities</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-gray-900">{order.productName}</td>
                    <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Origo
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">€{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={order.status}
                        type={
                          order.status === 'delivered' ? 'success' :
                          order.status === 'shipped' ? 'success' :
                          order.status === 'processing' ? 'warning' : 'default'
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-[#0B1F3A] hover:underline font-medium text-sm">
                        Override Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <strong>Admin Role:</strong> You have full platform access. Use carefully - changes to pricing, commissions, and partner approvals affect the entire ecosystem.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
