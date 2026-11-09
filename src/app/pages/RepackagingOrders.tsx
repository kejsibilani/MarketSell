import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { TransformationType, TransformationOrder } from '../types/transformation';
import { TransformationDashboard } from '../components/TransformationDashboard';
import { TransformationFormModal } from '../components/TransformationFormModal';
import { generateTransformationId } from '../utils/workflowHelpers';

const MOCK_REPACKAGING_ORDERS: TransformationOrder[] = [
  {
    id: 'TRF-2026-002',
    date: '10.05.26',
    company: 'NFCOF',
    type: TransformationType.REPACKAGING,
    description: 'Repack green bag into sample retail 1kg bags',
    internalShipmentId: 'ISP-1002',
    fromItems: [{ sku: 'GC-ETH-004-60KG', productName: 'Ethiopian Yirgacheffe Green — 60 kg bag', units: 5, kg: 300 }],
    toItems: [{ sku: 'RC-ETH-002-1KG', productName: 'Ethiopian Yirgacheffe — 1 kg bag', units: 6, kg: 6 }],
    estimatedQty: 6,
    cost: 35.0,
    status: 'working',
  },
  {
    id: 'TRF-2026-006',
    date: '24.05.26',
    company: 'NFCAO',
    type: TransformationType.REPACKAGING,
    description: 'Repackage roasted coffee into 250g sample bags',
    internalShipmentId: 'ISP-1006',
    fromItems: [{ sku: 'RC-KEN-AA-1KG', productName: 'Kenyan AA — 1 kg bag', units: 10, kg: 10 }],
    toItems: [{ sku: 'RC-KEN-AA-250G', productName: 'Kenyan AA — 250g sample bag', units: 40, kg: 10 }],
    estimatedQty: 40,
    cost: 25.0,
    status: 'pending',
  },
];

export default function RepackagingOrders() {
  const [orders, setOrders] = useState<TransformationOrder[]>(MOCK_REPACKAGING_ORDERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<TransformationOrder | undefined>();

  useEffect(() => {
    setOrders(MOCK_REPACKAGING_ORDERS);
  }, []);

  const handleUpdate = (updatedOrder: TransformationOrder) => {
    setOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
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
      const updated = { ...editingOrder, ...data };
      handleUpdate(updated);
    } else {
      const newOrder: TransformationOrder = {
        id: generateTransformationId(),
        date: new Date().toLocaleDateString('de-DE'),
        company: 'Your Company',
        type: TransformationType.REPACKAGING,
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
          title="Repackaging Orders"
          description="Manage your repackaging transformations — break down larger bags into smaller packages"
          onAddNew={handleCreateNew}
          addNewLabel="New Repackaging Order"
        />

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex gap-2">
            <span className="text-2xl">📦</span>
            <div>
              <h3 className="font-bold text-purple-900">Repackaging Tips</h3>
              <p className="text-sm text-purple-800">
                Repackage larger bags into smaller consumer or sample packages. Track your repackaging history to maintain 
                consistency and quality across different package sizes.
              </p>
            </div>
          </div>
        </div>

        <TransformationDashboard
          orders={orders}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          readOnly={false}
          title="Repackaging Orders"
          description="All your repackaging transformations"
        />
      </div>

      {/* Transformation Form Modal */}
      <TransformationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transformationType={TransformationType.REPACKAGING}
        onSave={handleSaveTransformation}
        editingOrder={editingOrder}
      />
      </>
  );
}
