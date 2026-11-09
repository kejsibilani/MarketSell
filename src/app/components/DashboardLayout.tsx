import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Building2,
  RefreshCw,
  Warehouse,
  Truck,
  BarChart3,
  BarChart2,
  Shield,
  FileText,
  CheckCircle,
  Database,
  Menu,
  X,
  AlertCircle,
  TrendingDownIcon,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Percent,
  Store,
  GripVertical,
} from "lucide-react";
import { Navigation } from "./Navigation";
import { AIAssistant } from "./AIAssistant";
import AlertsPopup from './AlertsPopup';
import { colors } from '../styles/designSystem';
type DashboardLayoutProps = {
  children: ReactNode;
  role: "buyer" | "agent" | "operator" | "seller" | "admin" | "business-admin" | "system-admin";
};
 
export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAlerts, setShowAlerts] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [menuOrder, setMenuOrder] = useState<number[]>([]);

  const navigation = {
    buyer: [
      { name: "Dashboard", href: "/buyer", icon: LayoutDashboard },
      { name: "My Orders", href: "/buyer#orders", icon: ShoppingCart },
      { name: "Browse Products", href: "/marketplace", icon: Package },
    ],
    agent: [
      { name: "Dashboard", href: "/agent", icon: LayoutDashboard },
      { name: "Assigned Stock", href: "/agent/stock", icon: Package },
      { name: "Orders", href: "/agent/orders", icon: ShoppingCart },
      { name: "Commissions", href: "/agent/commissions", icon: Percent },
    ],
    operator: [
      { name: "Dashboard", href: "/operator", icon: LayoutDashboard },
      { name: "Users", href: "/operator/users", icon: Users },
      { name: "User Rights", href: "/operator/user_rights", icon: Shield },
      { name: "Companies", href: "/operator/companies", icon: Building2 },
      { name: "Producers", href: "/operator/producers", icon: Package },
      { name: "SKUs (Registered)", href: "/operator/skus", icon: Package },
      { name: "Stock", href: "/operator/stock", icon: Package },
      { name: "Sales Orders", href: "/operator/sales_orders", icon: ShoppingCart },
      { name: "Restocking Requests", href: "/operator/restocking", icon: RefreshCw },
      { name: "Transformation Orders", href: "/operator/transformations", icon: TrendingDownIcon },
      { name: "Shipments", href: "/operator/shipments", icon: Truck },
      { name: 'Cost & Invoices', href: '/operator/costs', icon: FileText },
      { name: 'Fees & Pricing', href: '/operator/fees', icon: FileText },
      { name: "Cash Account", href: "/operator/cash", icon: DollarSign },
    ],
    seller: [
      { name: "Dashboard", href: "/seller", icon: LayoutDashboard },
      { name: "My Companies", href: "/seller/companies", icon: Building2 },
      { name: "My SKUs", href: "/seller/skus", icon: Package },
      { name: "My Stock", href: "/seller/stock", icon: Warehouse },
      { name: "My Restocking", href: "/seller/restocking", icon: Package },
      { name: "My Sales Orders", href: "/seller/sales_orders", icon: ShoppingCart },
      { name: "Manage My Products", href: "/seller/manage-products", icon: TrendingDownIcon },
      { name: "My Shipments", href: "/seller/shipments", icon: Truck },
      { name: 'My Cost & Invoices', href: '/seller/costs', icon: FileText },
      { name: "My Pricing Tool", href: "/seller/pricing", icon: Store },
      { name: "My Storefronts", href: "/seller/storefronts", icon: Store },
      { name: "My Fees & Pricing", href: "/seller/fees", icon: DollarSign },
      { name: "My Cash Account", href: "/seller/cash", icon: DollarSign },
    ],
    admin: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Partners", href: "/admin#partners", icon: Users },
    ],
    "business-admin": [
      {
        name: "Dashboard",
        href: "/business-admin",
        icon: LayoutDashboard,
      },
      {
        name: "Warehouses",
        href: "/business-admin/warehouses",
        icon: Warehouse,
      },
      {
        name: "Retail Sites",
        href: "/business-admin#retail_sites",
        icon: ShoppingBag,
      },
      {
        name: "Carriers",
        href: "/business-admin/carriers",
        icon: Truck,
      },
      {
        name: "Business Analytics",
        href: "/business-admin#analytics",
        icon: BarChart3,
      },
      {
        name: "Configurations",
        href: "/business-admin/tables",
        icon: Database,
      },
      {
        name: "Alerts and Promotions",
        href: "/business-admin/alerts",
        icon: AlertCircle,
      },
    ],
    "system-admin": [
      {
        name: "Dashboard",
        href: "/system-admin",
        icon: LayoutDashboard,
      },
      {
        name: "Tags and Languages",
        href: "/system-admin#terminology",
        icon: Users,
      },
      {
        name: "User Accounts",
        href: "/system-admin#accounts",
        icon: Users,
      },
      {
        name: "System Logs",
        href: "/system-admin#logs",
        icon: FileText,
      },
      {
        name: "System Tables",
        href: "/system-admin/system-tables",
        icon: Database,
      },
    ],
  };
  
  useEffect(() => {
    // close alerts popup when location changes
    setShowAlerts(false);
  }, [location.pathname, location.hash]);

  // Load saved menu order from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`menu-order-${role}`);
    const currentNav = navigation[role] || [];
    if (saved) {
      try {
        setMenuOrder(JSON.parse(saved));
      } catch {
        setMenuOrder(currentNav.map((_, i) => i));
      }
    } else {
      setMenuOrder(currentNav.map((_, i) => i));
    }
  }, [role]);

  const currentNav = navigation[role] || [];

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedItem === null || draggedItem === index) {
      setDraggedItem(null);
      return;
    }

    const newOrder = [...menuOrder];
    const draggedFromIndex = newOrder.indexOf(draggedItem);
    const draggedToIndex = newOrder.indexOf(index);

    [newOrder[draggedFromIndex], newOrder[draggedToIndex]] = [newOrder[draggedToIndex], newOrder[draggedFromIndex]];
    
    setMenuOrder(newOrder);
    localStorage.setItem(`menu-order-${role}`, JSON.stringify(newOrder));
    setDraggedItem(null);
  };

  const handleResetOrder = () => {
    const defaultOrder = currentNav.map((_, i) => i);
    setMenuOrder(defaultOrder);
    localStorage.removeItem(`menu-order-${role}`);
  };

  const sortedNav = menuOrder.map(index => currentNav[index]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.gray50 }}>
      <Navigation />

      {/* Dashboard Top Bar */}
      <div className="bg-white border-b border-gray-200 fixed top-[73px] right-0 left-0 z-10">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              className={`p-2 hover:bg-gray-100 rounded-lg ${sidebarOpen ? '' : 'fixed left-4 top-[73px] z-40'}`}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-lg font-semibold text-gray-900 capitalize">
              {role} Portal
            </span>
          </div>

          {/* Alerts / Promotions area (configured by business admin) */}
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <button onClick={() => setShowAlerts(s => !s)} className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-50">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">Alerts</span>
              </button>
              {showAlerts && (
                <div className="absolute right-0 mt-2">
                  <AlertsPopup onClose={() => setShowAlerts(false)} />
                </div>
              )}
            </div>
            <button className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-50">
              <Percent className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Promotions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 ${sidebarOpen ? 'top-[137px] h-[calc(100vh-137px)]' : 'top-[73px] h-[calc(100vh-73px)]'} bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        } overflow-hidden flex flex-col`}
      >
        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
          {sortedNav.map((item, index) => {
            if (!item) return null;
            const currentPathWithHash = location.pathname + location.hash;
            const isActive =
              currentPathWithHash === item.href ||
              (item.href !== "/" && location.pathname.startsWith(item.href.split("#")[0]) && !item.href.includes("#")) ||
              (item.href.includes("#") && currentPathWithHash === item.href);
            return (
              <div
                key={item.name}
                draggable
                onDragStart={() => handleDragStart(menuOrder.indexOf(currentNav.indexOf(item)))}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(menuOrder.indexOf(currentNav.indexOf(item)))}
                className={`group relative ${draggedItem === menuOrder.indexOf(currentNav.indexOf(item)) ? 'opacity-50' : ''}`}
              >
                <Link
                  to={item.href}
                  className={`flex items-center ${sidebarOpen ? 'gap-3 px-4 py-3 text-left' : 'justify-center p-3'} rounded-lg transition-colors cursor-move ${
                    isActive
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={isActive ? { backgroundColor: colors.primary } : undefined}
                >
                  {sidebarOpen && <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />}
                  <item.icon className={`w-5 h-5 ${sidebarOpen ? '' : 'mx-auto'}`} />
                  {sidebarOpen && <span className="font-medium flex-1">{item.name}</span>}
                </Link>
              </div>
            );
          })}
        </nav>
        {sidebarOpen && menuOrder.some((i, idx) => i !== idx) && (
          <button
            onClick={handleResetOrder}
            className="m-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
          >
            Reset Menu Order
          </button>
        )}
      </div>

      {/* Main Content */}
      <div
        className={`pt-[40px] transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <div className="p-8">
          {children}
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}