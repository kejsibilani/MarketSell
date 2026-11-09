import { useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import DashboardOverview from '../components/DashboardOverview';
import { ProductFormModal } from "../components/ProductFormModal";

export default function SellerDashboard() {
  const location = useLocation();
  const isNestedRoute = location.pathname !== "/seller";
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveProduct = (product: any) => {
    // demo: no-op
    setIsModalOpen(false);
  };

  if (isNestedRoute) {
    return (
      <DashboardLayout role="seller">
        <Outlet />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6">
        <DashboardOverview role="seller" />
      </div>

      <ProductFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveProduct} />
    </DashboardLayout>
  );
}

