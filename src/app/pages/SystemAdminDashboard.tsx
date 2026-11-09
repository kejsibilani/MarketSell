import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { KPICard } from "../components/KPICard";
import {
  Settings,
  Users,
  TrendingUp,
  Globe,
  Download,
  Upload,
  Edit,
  Save,
  X,
  Shield,
  Activity,
  Warehouse,
  Database,
} from "lucide-react";
import SystemAdminTables from "./SystemAdminTables";

interface TerminologyEntry {
  id: string;
  key: string;
  tagFor: string;
  english: string;
  spanish: string;
  french: string;
  japanese: string;
  chinese: string;
  arabic: string;
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin: string;
}

interface SecurityLog {
  id: string;
  event: string;
  user: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
}

export default function SystemAdminDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<
  "languages" | "users" | "security" | "analytics" | "systemTables"
  >("languages");

  const [terminologyEntries, setTerminologyEntries] = useState<
    TerminologyEntry[]
  >([
    {
      id: "T001",
      key: "nav.products",
      tagFor: "seller",
      english: "My Products",
      spanish: "Mis Productos",
      french: "Mes Produits",
      japanese: "私の製品",
      chinese: "我的产品",
      arabic: "منتجاتي",
    },
    {
      id: "T002",
      key: "nav.products",
      tagFor: "buyer",
      english: "Products",
      spanish: "Productos",
      french: "Produits",
      japanese: "製品",
      chinese: "产品",
      arabic: "منتجات",
    },
    {
      id: "T003",
      key: "nav.orders",
      tagFor: "seller",
      english: "My Orders",
      spanish: "Mis Pedidos",
      french: "Mes Commandes",
      japanese: "私の注文",
      chinese: "我的订单",
      arabic: "طلباتي",
    },
  ]);

  const [userAccounts] = useState<UserAccount[]>([
    {
      id: "U001",
      name: "Admin User",
      email: "admin@marketsell.com",
      role: "System Admin",
      status: "active",
      lastLogin: "2026-04-29 10:30",
    },
    {
      id: "U002",
      name: "Business Manager",
      email: "manager@marketsell.com",
      role: "Business Admin",
      status: "active",
      lastLogin: "2026-04-29 09:15",
    },
    {
      id: "U003",
      name: "Operations Lead",
      email: "ops@marketsell.com",
      role: "Operator",
      status: "active",
      lastLogin: "2026-04-28 18:45",
    },
    {
      id: "U004",
      name: "Costa Coffee Co.",
      email: "contact@costacoffee.com",
      role: "Seller",
      status: "active",
      lastLogin: "2026-04-29 11:00",
    },
    {
      id: "U005",
      name: "Test Account",
      email: "test@example.com",
      role: "Buyer",
      status: "inactive",
      lastLogin: "2026-04-20 14:22",
    },
  ]);

  const [securityLogs] = useState<SecurityLog[]>([
    {
      id: "S001",
      event: "User login successful",
      user: "admin@marketsell.com",
      timestamp: "2026-04-29 10:30:15",
      severity: "info",
    },
    {
      id: "S002",
      event: "Failed login attempt",
      user: "unknown@domain.com",
      timestamp: "2026-04-29 08:22:41",
      severity: "warning",
    },
    {
      id: "S003",
      event: "Password changed",
      user: "manager@marketsell.com",
      timestamp: "2026-04-28 16:45:33",
      severity: "info",
    },
    {
      id: "S004",
      event: "Multiple failed login attempts",
      user: "attacker@bad.com",
      timestamp: "2026-04-27 03:12:08",
      severity: "critical",
    },
    {
      id: "S005",
      event: "User account created",
      user: "admin@marketsell.com",
      timestamp: "2026-04-26 11:20:00",
      severity: "info",
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(
    null,
  );
  const [editingEntry, setEditingEntry] =
    useState<TerminologyEntry | null>(null);

  const handleEdit = (entry: TerminologyEntry) => {
    setEditingId(entry.id);
    setEditingEntry({ ...entry });
  };

  const handleSave = () => {
    if (editingEntry) {
      setTerminologyEntries((entries) =>
        entries.map((e) =>
          e.id === editingEntry.id ? editingEntry : e,
        ),
      );
      setEditingId(null);
      setEditingEntry(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingEntry(null);
  };

  const handleDownloadExcel = () => {
    const csvContent = [
      [
        "ID",
        "Key",
        "Tag For",
        "English",
        "Spanish",
        "French",
        "Japanese",
        "Chinese",
        "Arabic",
      ],
      ...terminologyEntries.map((e) => [
        e.id,
        e.key,
        e.tagFor,
        e.english,
        e.spanish,
        e.french,
        e.japanese,
        e.chinese,
        e.arabic,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "terminology-export.csv";
    a.click();
  };

  const handleUploadExcel = () => {
    alert(
      "Excel upload functionality - Select a file to import translations",
    );
  };

  // Check if we're on a nested route
  const isNestedRoute = location.pathname !== "/system-admin";

  // Show nested routes (system-tables)
  if (isNestedRoute) {
    return (
      <DashboardLayout role="system-admin">
        <Outlet />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="system-admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A]">
            System Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage system configuration and translations
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <KPICard
            title="Tags and Languages"
            value={terminologyEntries.length}
            change="6 languages supported"
            changeType="neutral"
            icon={Globe}
          />
          <KPICard
            title="User Accounts"
            value={userAccounts.length}
            change={`${userAccounts.filter((u) => u.status === "active").length} active`}
            changeType="neutral"
            icon={Users}
          />
          <KPICard
            title="Security Alerts"
            value={
              securityLogs.filter(
                (s) => s.severity === "critical",
              ).length
            }
            change="Critical incidents"
            changeType="negative"
            icon={Shield}
          />
          <KPICard
            title="System Health"
            value="98.5%"
            change="All systems operational"
            changeType="positive"
            icon={Activity}
          />
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6"></div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6 pt-4">
              <button
                onClick={() => setActiveTab("languages")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "languages"
                    ? "text-[#0B1F3A] border-b-2 border-[#0B1F3A]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tags and Languages
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "users"
                    ? "text-[#0B1F3A] border-b-2 border-[#0B1F3A]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                User Accounts
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "security"
                    ? "text-[#0B1F3A] border-b-2 border-[#0B1F3A]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                System Logs
              </button>
              <button
                onClick={() => setActiveTab("systemTables")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "systemTables"
                    ? "text-[#0B1F3A] border-b-2 border-[#0B1F3A]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                System Tables
              </button>
            </div>
          </div>

    {/* Tags and Languages Tab */}
          {activeTab === "languages" && (
            <div>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#0B1F3A]">Terminology Management</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage UI translations across all languages - updates apply in real-time</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button onClick={handleUploadExcel} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      <Upload size={16} />
                      Upload
                    </button>
                  </div>
                </div>

              </div>

                  <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Key
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Default
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        English
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Spanish
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        French
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Japanese
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Chinese
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Arabic
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {terminologyEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 text-sm text-gray-900 font-mono">
                          {entry.tagFor}.{entry.key}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-semibold">
                          {entry.english}
                        </td>
                        {editingId === entry.id &&
                        editingEntry ? (
                          <>
                            <td className="px-4 py-4">
                              <input
                                type="text"
                                value={editingEntry.english}
                                onChange={(e) =>
                                  setEditingEntry({
                                    ...editingEntry,
                                    english: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <input
                                type="text"
                                value={editingEntry.spanish}
                                onChange={(e) =>
                                  setEditingEntry({
                                    ...editingEntry,
                                    spanish: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <input
                                type="text"
                                value={editingEntry.french}
                                onChange={(e) =>
                                  setEditingEntry({
                                    ...editingEntry,
                                    french: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <input
                                type="text"
                                value={editingEntry.japanese}
                                onChange={(e) =>
                                  setEditingEntry({
                                    ...editingEntry,
                                    japanese: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <input
                                type="text"
                                value={editingEntry.chinese}
                                onChange={(e) =>
                                  setEditingEntry({
                                    ...editingEntry,
                                    chinese: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <input
                                type="text"
                                value={editingEntry.arabic}
                                onChange={(e) =>
                                  setEditingEntry({
                                    ...editingEntry,
                                    arabic: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                dir="rtl"
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {entry.english}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {entry.spanish}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {entry.french}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {entry.japanese}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {entry.chinese}
                            </td>
                            <td
                              className="px-4 py-4 text-sm text-gray-900"
                              dir="rtl"
                            >
                              {entry.arabic}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-4">
                          {editingId === entry.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={handleSave}
                                className="text-green-500 hover:text-green-700"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEdit(entry)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "systemTables" && (
            <div className="p-6">
              <SystemAdminTables />
            </div>
          )}

          {/* User Accounts Tab */}
          {activeTab === "users" && (
            <div className="p-6">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0B1F3A]">
                    User Accounts
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Manage users, permissions, and assigned
                    roles
                  </p>
                </div>

                <button className="px-4 py-2 bg-[#0B1F3A] text-white rounded-lg hover:bg-[#0B1F3A]/90 font-medium transition-colors">
                  + Add User
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Name
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Roles
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {userAccounts.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* User ID */}
                        <td className="px-6 py-4">
                          <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                            {user.id}
                          </code>
                        </td>

                        {/* Name */}
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.email}
                        </td>

                        {/* Roles */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2 max-w-[250px]">
                            {(Array.isArray((user as any).roles) ? (user as any).roles : [user.role]).map(
                              (role: string, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                >
                                  {role}
                                </span>
                              ),
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        {/* Last Login */}
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {user.lastLogin}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Edit
                            </button>

                            <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-[#0B1F3A]">
                  Security Log
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Monitor security events and access patterns
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Severity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {securityLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                          {log.timestamp}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {log.event}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.user}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              log.severity === "critical"
                                ? "bg-red-100 text-red-800"
                                : log.severity === "warning"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {log.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* System Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#0B1F3A] mb-4">
                System Analytics
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Platform Usage
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Users
                      </span>
                      <span className="font-semibold">
                        {userAccounts.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Active Sessions
                      </span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        API Calls (24h)
                      </span>
                      <span className="font-semibold">
                        15,234
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Avg Response Time
                      </span>
                      <span className="font-semibold">
                        142ms
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    System Performance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Uptime
                      </span>
                      <span className="font-semibold text-green-600">
                        99.8%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        CPU Usage
                      </span>
                      <span className="font-semibold">34%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Memory Usage
                      </span>
                      <span className="font-semibold">
                        2.4 GB / 8 GB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Database Size
                      </span>
                      <span className="font-semibold">
                        1.2 GB
                      </span>
                    </div>
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