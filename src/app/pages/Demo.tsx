import { Link } from 'react-router';
import { UserPlus, Warehouse, Database, Package, ArrowRight } from 'lucide-react';

export default function Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] to-[#1a3a5f] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">MarketSell Feature Demo</h1>
          <p className="text-xl text-gray-300">
            New seller onboarding flow, warehouse management, and system configuration features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Seller Onboarding */}
          <Link
            to="/signup"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Seller Onboarding</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Sales-focused onboarding flow with qualifying questions about products, shipping countries,
              and target markets. Part of the signup process for sellers.
            </p>
            <div className="flex items-center gap-2 text-blue-300 group-hover:text-blue-200">
              <span>Try it now</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* Agent Onboarding */}
          <Link
            to="/signup"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Agent Onboarding</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Onboarding flow tailored for sales agents who will earn commissions
              by finding offline buyers. Part of the signup process for agents.
            </p>
            <div className="flex items-center gap-2 text-green-300 group-hover:text-green-200">
              <span>Try it now</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* Warehouse Management */}
          <Link
            to="/business-admin/warehouses"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Warehouse className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Warehouse Management</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Card-based interface nested under Business Admin dashboard for managing warehouses with detailed information
              including address, allowed categories, documents, Google Maps links, and usage tracking.
            </p>
            <div className="flex items-center gap-2 text-purple-300 group-hover:text-purple-200">
              <span>View warehouses</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* Carrier Management */}
          <Link
            to="/business-admin/carriers"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-500 rounded-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Carrier Management</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Card-based interface nested under Business Admin dashboard for managing shipping carriers with contact info,
              service regions, vehicle types, insurance details, and performance ratings.
            </p>
            <div className="flex items-center gap-2 text-indigo-300 group-hover:text-indigo-200">
              <span>View carriers</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* System Tables Management */}
          <Link
            to="/system-admin/system-tables"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-yellow-500 rounded-lg">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">System Tables</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Nested under System Admin dashboard to configure product categories, document types,
              and transformation order types with multilingual translations and usage tracking.
            </p>
            <div className="flex items-center gap-2 text-yellow-300 group-hover:text-yellow-200">
              <span>Manage tables</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* SKU Inventory */}
          <Link
            to="/seller/inventory"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500 rounded-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">SKU Inventory Management</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Nested under Seller dashboard with toggle between simple table and enhanced view with stock change logs per SKU.
              All products tracked by SKUs (Stock Keeping Units) for precise inventory management.
            </p>
            <div className="flex items-center gap-2 text-red-300 group-hover:text-red-200">
              <span>View inventory</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* Orders Management */}
          <Link
            to="/orders"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-500 rounded-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Orders Management</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Comprehensive orders view with country flags, sales channels, expandable rows showing order details,
              company badges, and formatted amounts. Includes status filters and Download Excel functionality.
            </p>
            <div className="flex items-center gap-2 text-orange-300 group-hover:text-orange-200">
              <span>View orders</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        </div>

        {/* Implementation Notes */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Implementation Notes</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>
                <strong>Clickable Dashboard Cards:</strong> Dashboard KPI cards trigger quick actions - click "Running Out Soon"
                to instantly filter inventory to low stock items, no manual filtering needed
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>
                <strong>Smart Filters with URL Params:</strong> Filters are URL-based so you can bookmark or share
                direct links to filtered views (e.g., /seller/inventory?filter=critical)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>
                <strong>Nested Routes:</strong> Routes are organized hierarchically - system tables under system-admin,
                warehouses and carriers under business-admin, inventory under seller, and onboarding flows under signup
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>
                <strong>Clear Section Separation:</strong> No cross-paths between sections — Operators handle inventory
                and restocking orders, Business Admins handle warehouses and carriers, System Admins handle all system
                configuration like terminology and categories
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>
                <strong>SKU-Based Inventory:</strong> All products tracked by SKUs (Stock Keeping Units) with
                simple table and enhanced views showing stock change logs per item
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>
                <strong>Actions-Based Logging:</strong> All inventory changes tracked through actions rather than direct edits
                to maintain comprehensive logs for accounting purposes
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>
                <strong>Usage Indicators:</strong> System shows "Is Used" status to help identify entries
                that can be safely modified or removed during early iterations
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>
                <strong>Sales-Focused Onboarding:</strong> Qualifying questions first to convince prospects,
                integrated into the signup flow for sellers and agents
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>
                <strong>Three-Section Navigation:</strong> Admin areas clearly separated into Operations (Inventory,
                Orders, Approvals, Agents), Business Admin (Warehouses, Retail Sites, Carriers, Analytics), and
                System (Accounts, Security, Logs, System Tables) with role-based access
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>
                <strong>Multi-Company Architecture:</strong> All tables include 5-character company codes (NFCOF, NFCAO),
                company switcher in top navigation, and multi-company support throughout the platform
              </span>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0B1F3A] rounded-lg hover:bg-gray-100 font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
