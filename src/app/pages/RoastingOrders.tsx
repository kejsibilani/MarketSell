import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { TransformationType, TransformationOrder } from '../types/transformation';
import { TransformationDashboard } from '../components/TransformationDashboard';
import { TransformationFormModal } from '../components/TransformationFormModal';
import { generateTransformationId } from '../utils/workflowHelpers';

// ============================================================================
// MOCK DATA - ROASTING ONLY
// ============================================================================

const MOCK_ROASTING_ORDERS: TransformationOrder[] = [
  {
    id: 'TRF-2026-001',
    date: '18.04.26',
    company: 'NFCOF',
    type: TransformationType.ROASTING,
    description: 'Roast Colombian Supremo green beans to medium roast',
    internalShipmentId: 'ISP-1001',
    fromItems: [
      { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo — Green — 60 kg bag', units: 5, kg: 300 },
      { sku: 'GC-COL-002-60KG', productName: 'Colombian Supreme Extra — Green — 60 kg bag', units: 2, kg: 120 },
    ],
    toItems: [
      { sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — Medium Roast — 1 kg bag', units: 40, kg: 40 },
    ],
    estimatedQty: 40,
    cost: 70.0,
    status: 'completed',
    shippingHistory: [
      { date: '18.04.26', event: 'Sent to roasting facility', location: 'Rotterdam WH → Roast Lab BCN' },
      { date: '22.04.26', event: 'Roasting completed', location: 'Roast Lab BCN' },
      { date: '23.04.26', event: 'Returned to warehouse', location: 'Rotterdam WH' },
    ],
  },
  {
    id: 'TRF-2026-005',
    date: '22.05.26',
    company: 'NFCOF',
    type: TransformationType.ROASTING,
    description: 'Roast Ethiopian Yirgacheffe to light roast',
    internalShipmentId: 'ISP-1005',
    fromItems: [
      { sku: 'GC-ETH-001-60KG', productName: 'Ethiopian Yirgacheffe — Green — 60 kg bag', units: 3, kg: 180 },
    ],
    toItems: [
      { sku: 'RC-ETH-001-1KG', productName: 'Ethiopian Yirgacheffe — Light Roast — 1 kg bag', units: 28, kg: 28 },
    ],
    estimatedQty: 28,
    cost: 55.0,
    status: 'working',
  },
  {
    id: 'TRF-2026-007',
    date: '25.05.26',
    company: 'NFCAO',
    type: TransformationType.ROASTING,
    description: 'Roast Kenyan AA grade beans',
    internalShipmentId: 'ISP-1007',
    fromItems: [
      { sku: 'GC-KEN-AA-60KG', productName: 'Kenyan AA Grade — Green — 60 kg bag', units: 2, kg: 120 },
    ],
    toItems: [
      { sku: 'RC-KEN-AA-1KG', productName: 'Kenyan AA Grade — Medium Roast — 1 kg bag', units: 24, kg: 24 },
    ],
    estimatedQty: 24,
    cost: 65.0,
    status: 'pending',
  },
];

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function RoastingOrders() {
  const [orders, setOrders] = useState<TransformationOrder[]>(MOCK_ROASTING_ORDERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<TransformationOrder | undefined>();

  useEffect(() => {
    setOrders(MOCK_ROASTING_ORDERS);
  }, []);

  const handleUpdate = (updatedOrder: TransformationOrder) => {
    setOrders(prev =>
      prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  };

  const handleDelete = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleCreateNew = () => {
    setEditingOrder(undefined);
    setIsModalOpen(true);
  };

  const handleSaveTransformation = (data: Partial<TransformationOrder>) => {
    if (editingOrder) {
      // Edit existing
      const updated = { ...editingOrder, ...data };
      handleUpdate(updated);
    } else {
      // Create new
      const newOrder: TransformationOrder = {
        id: generateTransformationId(),
        date: new Date().toLocaleDateString('de-DE'),
        company: 'Your Company',
        type: TransformationType.ROASTING,
        fromItems: data.fromItems || [],
        toItems: data.toItems || [],
        cost: data.cost || 0,
        status: data.status || 'pending',
        description: data.description,
      };
      setOrders(prev => [newOrder, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Roasting Orders"
          description="Manage your coffee roasting transformations — convert green beans to roasted coffee"
          onAddNew={handleCreateNew}
          addNewLabel="New Roasting Order"
        />

        {/* Quick Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-2">
            <span className="text-2xl">☕</span>
            <div>
              <h3 className="font-bold text-amber-900">Roasting Tips</h3>
              <p className="text-sm text-amber-800">
                Track your roasting profiles and save previous profiles for consistent results. Monitor roasting dates to ensure 
                quality and freshness of your roasted coffee.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <TransformationDashboard
          orders={orders}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          readOnly={false}
          title="Roasting Orders"
          description="All your roasting transformations in one place"
        />
      </div>

      {/* Transformation Form Modal */}
      <TransformationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transformationType={TransformationType.ROASTING}
        onSave={handleSaveTransformation}
        editingOrder={editingOrder}
      />
      </>
  );
}
