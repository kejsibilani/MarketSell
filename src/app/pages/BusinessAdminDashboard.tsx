import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { KPICard } from "../components/KPICard";
import { StatusBadge } from "../components/StatusBadge";
import {
  Store,
  Users,
  Package,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Truck,
  Globe,
  Warehouse,
} from "lucide-react";
import formatNumber from '../utils/numberFormat';

interface RestockingOrder {
  id: string;
  sellerId: string;
  sellerName: string;
  productName: string;
  quantity: number;
  warehouse: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected";
}

interface PartnerApplication {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  type: "seller" | "agent";
  applicationDate: string;
  status: "pending" | "approved" | "rejected";
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentStock: number;
  status: "active" | "inactive";
}

interface RetailSite {
  id: string;
  name: string;
  url: string;
  reliability?: number;
  status: "active" | "maintenance" | "inactive";
  monthlyOrders: number;
}

interface Carrier {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "maintenance";
  avgDeliveryDays: number;
  reliability: number;
}

export default function BusinessAdminDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<
  "warehouses" | "retail" | "carriers" | "analytics"
  >("warehouses");

  const [restockingOrders, setRestockingOrders] = useState<
    RestockingOrder[]
  >([
    {
      id: "REP-001",
      sellerId: "S001",
      sellerName: "Costa Coffee Co.",
      productName: "Colombian Supremo",
      quantity: 1000,
      warehouse: "Madrid Central",
      requestDate: "2026-04-25",
      status: "pending",
    },
    {
      id: "REP-002",
      sellerId: "S002",
      sellerName: "Bean Masters Ltd",
      productName: "Ethiopian Yirgacheffe",
      quantity: 500,
      warehouse: "Rotterdam North",
      requestDate: "2026-04-26",
      status: "pending",
    },
  ]);

  const [partnerApplications, setPartnerApplications] =
    useState<PartnerApplication[]>([
      {
        id: "APP-001",
        companyName: "Premium Roasters Inc.",
        contactName: "John Smith",
        email: "john@premiumroasters.com",
        type: "seller",
        applicationDate: "2026-04-28",
        status: "pending",
      },
    ]);

  const [warehouses] = useState<Warehouse[]>([
    {
      id: "W001",
      name: "Madrid Central",
      location: "Madrid, Spain",
      capacity: 5000,
      currentStock: 3200,
      status: "active",
    },
    {
      id: "W002",
      name: "Rotterdam North",
      location: "Rotterdam, Spain",
      capacity: 4500,
      currentStock: 2800,
      status: "active",
    },
    {
      id: "W003",
      name: "Valencia East",
      location: "Valencia, Spain",
      capacity: 3000,
      currentStock: 1500,
      status: "active",
    },
    {
      id: "W004",
      name: "Seville South",
      location: "Seville, Spain",
      capacity: 3500,
      currentStock: 2100,
      status: "active",
    },
    {
      id: "W005",
      name: "Bilbao Port",
      location: "Bilbao, Spain",
      capacity: 6000,
      currentStock: 4200,
      status: "active",
    },
  ]);

  const [retailSites] = useState<RetailSite[]>([
    {
      id: "R001",
      name: "Origo",
      url: "origo.marketsell.com",
      status: "active",
      monthlyOrders: 342,
    },
    {
      id: "R002",
      name: "Peakline",
      url: "peakline.marketsell.com",
      status: "active",
      monthlyOrders: 278,
    },
    {
      id: "R003",
      name: "Ember",
      url: "ember.marketsell.com",
      status: "active",
      monthlyOrders: 195,
    },
    {
      id: "R004",
      name: "Skulls & Roses",
      url: "skullsandroses.com",
      status: "active",
      monthlyOrders: 412,
    },
    {
      id: "R005",
      name: "Roast FR",
      url: "roast.fr",
      status: "maintenance",
      monthlyOrders: 156,
    },
  ]);

  const [carriers] = useState<Carrier[]>([
    {
      id: "C001",
      name: "Express Logistics Spain",
      type: "Ground",
      status: "active",
      avgDeliveryDays: 2,
      reliability: 98,
    },
    {
      id: "C002",
      name: "Euro Fast Shipping",
      type: "Air",
      status: "active",
      avgDeliveryDays: 1,
      reliability: 95,
    },
    {
      id: "C003",
      name: "Mediterranean Freight",
      type: "Sea",
      status: "active",
      avgDeliveryDays: 7,
      reliability: 92,
    },
    {
      id: "C004",
      name: "Iberian Couriers",
      type: "Ground",
      status: "active",
      avgDeliveryDays: 3,
      reliability: 97,
    },
    {
      id: "C005",
      name: "Quick Transit EU",
      type: "Ground",
      status: "inactive",
      avgDeliveryDays: 4,
      reliability: 88,
    },
  ]);

  const handleRestockingAction = (
    orderId: string,
    action: "approved" | "rejected",
  ) => {
    setRestockingOrders((orders) =>
      orders.map((order) =>
        order.id === orderId
          ? { ...order, status: action }
          : order,
      ),
    );
  };

  const handlePartnerAction = (
    appId: string,
    action: "approved" | "rejected",
  ) => {
    setPartnerApplications((apps) =>
      apps.map((app) =>
        app.id === appId ? { ...app, status: action } : app,
      ),
    );
  };

  const pendingRestockings = restockingOrders.filter(
    (o) => o.status === "pending",
  ).length;
  const pendingPartners = partnerApplications.filter(
    (a) => a.status === "pending",
  ).length;

  // Check if we're on a nested route
  const isNestedRoute = location.pathname !== "/business-admin";

  // Show nested routes (warehouses)
  if (isNestedRoute) {
    return (
      <DashboardLayout role="business-admin">
        <Outlet />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="business-admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A]">
            Business Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage business operations and approvals
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <KPICard
            title="Pending Restockings"
            value={pendingRestockings}
            change={
              pendingRestockings > 0
                ? "Awaiting approval"
                : "All processed"
            }
            changeType={
              pendingRestockings > 0 ? "neutral" : "positive"
            }
            icon={Package}
          />
          <KPICard
            title="Partner Applications"
            value={pendingPartners}
            change={
              pendingPartners > 0
                ? "New applications"
                : "All reviewed"
            }
            changeType={
              pendingPartners > 0 ? "neutral" : "positive"
            }
            icon={Users}
          />
          <KPICard
            title="Active Warehouses"
            value={
              warehouses.filter((w) => w.status === "active")
                .length
            }
            change={`${warehouses.length} total warehouses`}
            changeType="neutral"
            icon={Store}
          />
          <KPICard
            title="Total Orders (MTD)"
            value="1,383"
            change="+18% from last month"
            changeType="positive"
            icon={ShoppingCart}
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6 pt-4">
              <button
                onClick={() => setActiveTab("warehouses")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "warehouses"
                    ? "text-[#0B1F3A] border-b-2 border-[#0B1F3A]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Warehouses
              </button>
              <button
                onClick={() => setActiveTab("retail")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "retail"
                    ? "text-[#0B1F3A] border-b-2 border-[#0B1F3A]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Retail Sites
              </button>
              <button
                onClick={() => setActiveTab("carriers")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "carriers"
                    ? "text-[#0B1F3A] border-b-2 border-[#0B1F3A]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Carriers
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "analytics"
                    ? "text-[#0B1F3A] border-b-2 border-[#0B1F3A]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Business Analytics
              </button>

            </div>
          </div>

          {/* Warehouses Tab */}
          {activeTab === "warehouses" && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0B1F3A]">
                  Warehouse Management
                </h2>
                <button className="px-4 py-2 bg-[#0B1F3A] text-white rounded-lg hover:bg-[#0B1F3A]/90">
                  + Add Warehouse
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Warehouse ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Capacity (kg)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Current Stock (units)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Utilization
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
                    {warehouses.map((warehouse) => {
                      const utilization = Math.round(
                        (warehouse.currentStock /
                          warehouse.capacity) *
                          100,
                      );
                      return (
                        <tr
                          key={warehouse.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                            {warehouse.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            {warehouse.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {warehouse.location}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatNumber(warehouse.capacity)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatNumber(warehouse.currentStock)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${utilization > 80 ? "bg-red-500" : utilization > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                                  style={{
                                    width: `${utilization}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">
                                {utilization}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge
                              status={warehouse.status}
                              type={
                                warehouse.status === "active"
                                  ? "success"
                                  : "default"
                              }
                            />
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-blue-500 hover:text-blue-700 text-sm">
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Retail Sites Tab */}
          {activeTab === "retail" && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0B1F3A]">
                  Retail Sites
                </h2>
                <button className="px-4 py-2 bg-[#0B1F3A] text-white rounded-lg hover:bg-[#0B1F3A]/90">
                  + Add Site
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Site ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Monthly Orders
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
                    {retailSites.map((site) => (
                      <tr
                        key={site.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                          {site.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {site.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-600">
                          {site.url}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {site.monthlyOrders}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={site.status}
                            type={
                              site.status === "active"
                                ? "success"
                                : site.status === "maintenance"
                                  ? "warning"
                                  : "default"
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-500 hover:text-blue-700 text-sm">
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Carriers Tab */}
          {activeTab === "carriers" && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0B1F3A]">
                  Shipping Carriers
                </h2>
                <button className="px-4 py-2 bg-[#0B1F3A] text-white rounded-lg hover:bg-[#0B1F3A]/90">
                  + Add Carrier
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Carrier ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Avg Delivery
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Reliability
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
                    {carriers.map((carrier) => (
                      <tr
                        key={carrier.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                          {carrier.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {carrier.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {carrier.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {carrier.avgDeliveryDays} days
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-24">
                              <div
                                className={`h-full ${carrier.reliability > 95 ? "bg-green-500" : carrier.reliability > 90 ? "bg-yellow-500" : "bg-red-500"}`}
                                style={{
                                  width: `${carrier.reliability}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-900">
                              {carrier.reliability}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={carrier.status}
                            type={
                              carrier.status === "active"
                                ? "success"
                                : "default"
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-500 hover:text-blue-700 text-sm">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Business Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#0B1F3A] mb-4">
                Business Analytics
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Revenue Overview
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Revenue (MTD)
                      </span>
                      <span className="font-semibold">
                        €245,680
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Average Order Value
                      </span>
                      <span className="font-semibold">
                        €177.60
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Orders
                      </span>
                      <span className="font-semibold">
                        1,383
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Growth vs Last Month
                      </span>
                      <span className="font-semibold text-green-600">
                        +18%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Operational Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Warehouses
                      </span>
                      <span className="font-semibold">
                        {warehouses.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Active Retail Sites
                      </span>
                      <span className="font-semibold">
                        {
                          retailSites.filter(
                            (s) => s.status === "active",
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Active Carriers
                      </span>
                      <span className="font-semibold">
                        {
                          carriers.filter(
                            (c) => c.status === "active",
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Avg Delivery Time
                      </span>
                      <span className="font-semibold">
                        2.8 days
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Top Performing Sites
                  </h3>
                  <div className="space-y-2">
                    {retailSites
                      .filter((s) => s.status === "active")
                      .sort(
                        (a, b) =>
                          b.monthlyOrders - a.monthlyOrders,
                      )
                      .slice(0, 4)
                      .map((site) => (
                        <div
                          key={site.id}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-700">
                            {site.name}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {site.monthlyOrders} orders
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Warehouse Utilization
                  </h3>
                  <div className="space-y-2">
                    {warehouses.slice(0, 4).map((warehouse) => {
                      const utilization = Math.round(
                        (warehouse.currentStock /
                          warehouse.capacity) *
                          100,
                      );
                      return (
                        <div
                          key={warehouse.id}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-700">
                            {warehouse.name}
                          </span>
                          <span
                            className={`text-sm font-medium ${utilization > 80 ? "text-red-600" : utilization > 60 ? "text-yellow-600" : "text-green-600"}`}
                          >
                            {utilization}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}