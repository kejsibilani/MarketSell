import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import SellerDashboard from "./pages/SellerDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OperatorDashboard from "./pages/OperatorDashboard";
import InventoryManagement from "./pages/InventoryManagement";
import MarketplaceStore from "./pages/MarketplaceStore";
import ProductDetail from "./pages/ProductDetail";
import MultiStoreDistribution, { MultiStoreDistributionPanel } from "./pages/MultiStoreDistribution";
import StorefrontBuilder from "./pages/StorefrontBuilder";
import AgentStock from "./pages/AgentStock";
import AgentOrders from "./pages/AgentOrders";
import AgentCommissions from "./pages/AgentCommissions";
import BusinessAdminAlerts from "./pages/BusinessAdminAlerts";
import CompanyList from "./pages/CompanyList";
import SellerOrders from "./pages/SellerOrders";
import SellerRestocking from "./pages/SellerRestocking";
import SellerCash from "./pages/SellerCash";
import VendorProfile from "./pages/VendorProfile";
import BuyerDashboard from "./pages/BuyerDashboard";
import SystemAdminDashboard from "./pages/SystemAdminDashboard";
import BusinessAdminDashboard from "./pages/BusinessAdminDashboard";
import AccountSettings from "./pages/AccountSettings";
import BecomeSeller from "./pages/BecomeSeller";
import BecomeAgent from "./pages/BecomeAgent";
import WarehouseManagement from "./components/WarehouseManagement";
import SystemTablesManagement from "./components/SystemTablesManagement";
import BusinessAdminTables from "./pages/BusinessAdminTables";
import SystemAdminTables from "./pages/SystemAdminTables";
import EnhancedInventoryManagement from "./components/EnhancedInventoryManagement";
import SellerInventoryView from "./components/SellerInventoryView";
import Demo from "./pages/Demo";
import ErrorBoundary from "./components/ErrorBoundary";
import OrdersManagement from "./pages/OrdersManagement";
import CarrierManagement from "./components/CarrierManagement";
import SellerTransformations from "./pages/SellerTransformations";
import SellerShipments from './pages/SellerShipments';
import OperatorShipments from './pages/OperatorShipments';
import SellerCosts from './pages/SellerCosts';
import OperatorFees from './pages/OperatorFees';
import SellerFees from './pages/SellerFees';
import OperatorUsers from './pages/OperatorUsers';
import OperatorCompanies from './pages/OperatorCompanies';
import OperatorProducers from './pages/OperatorProducers';
import OperatorSKUs from './pages/OperatorSKUs';
import OperatorStock from './pages/OperatorStock';
import OperatorUserRights from './pages/OperatorUserRights';
import OperatorCash from './pages/OperatorCash';
import OperatorTransformations from './pages/OperatorTransformations';
import OperatorRestocking from './pages/OperatorRestocking';
import OperatorSalesOrders from './pages/OperatorSalesOrders';
import OperatorAlerts from './pages/OperatorAlerts';
import ManageMyProducts from './pages/ManageMyProducts';
import RoastingOrders from './pages/RoastingOrders';
import RepackagingOrders from './pages/RepackagingOrders';
import SamplingOrders from './pages/SamplingOrders';
import QualityAnalysisOrders from './pages/QualityAnalysisOrders';
import PackagingBrandingConfig from './pages/PackagingBrandingConfig';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    // SignUp.tsx auto-detects the role ("seller" / "agent") from the URL
    // itself (see its useEffect on location.pathname) — this route was
    // missing entirely, so /signup/agent and /signup/seller 404'd even
    // though every "Apply as Agent" / "Apply as Seller" link points here.
    path: "/signup/:role",
    Component: SignUp,
  },
  {
    path: "/become-seller",
    Component: BecomeSeller,
  },
  {
    path: "/become-agent",
    Component: BecomeAgent,
  },
  {
    path: "/signin",
    Component: SignUp,
  },
  {
    path: "/seller",
    Component: SellerDashboard,
    children: [
      { path: "companies", Component: CompanyList },
      { path: "skus", Component: SellerInventoryView },
      { path: "stock", Component: EnhancedInventoryManagement },
      { path: "restocking", Component: SellerRestocking },
      { path: "sales_orders", Component: SellerOrders },
      { path: "pricing", Component: MultiStoreDistributionPanel },
      { path: "storefronts", Component: StorefrontBuilder },
      { path: "manage-products", Component: ManageMyProducts },
      { path: "roasting-orders", Component: RoastingOrders },
      { path: "repackaging-orders", Component: RepackagingOrders },
      { path: "sampling-orders", Component: SamplingOrders },
      { path: "quality-analysis-orders", Component: QualityAnalysisOrders },
      { path: "packaging-branding", Component: PackagingBrandingConfig },
      { path: "transformations", Component: SellerTransformations },
      { path: "shipments", Component: OperatorShipments },
      { path: "costs", Component: SellerCosts },
      { path: "cash", Component: SellerCash },
      { path: "fees", Component: SellerFees },
    ],
  },
  {
    path: "/agent",
    Component: AgentDashboard,
    children: [
      { path: "stock", Component: AgentStock },
      { path: "orders", Component: AgentOrders },
      { path: "commissions", Component: AgentCommissions },
    ],
  },
  {
    path: "/operator",
    Component: OperatorDashboard,
    children: [
      { path: 'users', Component: OperatorUsers },
      { path: 'companies', Component: OperatorCompanies },
      { path: 'producers', Component: OperatorProducers },
      { path: 'skus', Component: OperatorSKUs },
      { path: 'stock', Component: OperatorStock },
      { path: 'user_rights', Component: OperatorUserRights },
      { path: 'cash', Component: OperatorCash },
      { path: 'shipments', Component: OperatorShipments },
      { path: 'restocking', Component: OperatorRestocking },
      { path: 'transformations', Component: OperatorTransformations },
      { path: 'sales_orders', Component: OperatorSalesOrders },
      { path: 'alerts', Component: OperatorAlerts },
      { path: 'fees', Component: OperatorFees },
      { path: 'costs', Component: SellerCosts },
    ],
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/inventory",
    Component: InventoryManagement,
  },
  {
    path: "/orders",
    Component: OrdersManagement,
  },
  {
    path: "/marketplace",
    Component: MarketplaceStore,
  },
  {
    path: "/marketplace/:id",
    Component: ProductDetail,
  },
  {
    path: "/vendor/:id",
    Component: VendorProfile,
  },
  {
    path: "/distribution",
    Component: MultiStoreDistribution,
  },
  {
    path: "/buyer",
    Component: BuyerDashboard,
  },
  {
    path: "/business-admin",
    Component: BusinessAdminDashboard,
    children: [
      { path: "warehouses", Component: WarehouseManagement },
      { path: "tables", Component: BusinessAdminTables },
      { path: "carriers", Component: CarrierManagement },
      { path: "alerts", Component: BusinessAdminAlerts },
    ],
  },
  {
    path: "/system-admin",
    Component: SystemAdminDashboard,
    children: [
      { path: "system-tables", Component: SystemTablesManagement },
      { path: "tables", Component: SystemAdminTables },
    ],
  },
  {
    path: "/account-settings",
    Component: AccountSettings,
  },
  {
    path: "/warehouses",
    Component: WarehouseManagement,
  },
  {
    path: "/system-tables",
    Component: SystemTablesManagement,
  },
  {
    path: "/inventory-enhanced",
    Component: EnhancedInventoryManagement,
  },
  {
    path: "*",
    element: <ErrorBoundary />,
  },
]);
