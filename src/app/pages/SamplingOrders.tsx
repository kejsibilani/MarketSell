import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { TransformationType, TransformationOrder } from '../types/transformation';
import { TransformationDashboard } from '../components/TransformationDashboard';
import { TransformationFormModal } from '../components/TransformationFormModal';
import { generateTransformationId } from '../utils/workflowHelpers';

const MOCK_SAMPLING_ORDERS: TransformationOrder[] = [
  {
    id: 'TRF-2026-003',
    date: '20.05.26',
    company: 'NFCAO',
    type: TransformationType.PACKAGING,
    description: 'Create sample bags for testing and distribution',
    internalShipmentId: 'ISP-1003',
    fromItems: [{ sku: 'CAC-GHA-002-25KG', productName: 'Ghana Cacao — 25 kg sack', units: 4, kg: 100 }],
    toItems: [{ sku: 'CAC-BLD-001-5KG', productName: 'Premium Blend Cacao — 5 kg bag', units: 18, kg: 90 }],
    estimatedQty: 18,
    cost: 20.0,
    status: 'pending',
  },
  {
    id: 'TRF-2026-008',
    date: '28.05.26',
    company: 'NFCOF',
    type: TransformationType.PACKAGING,
    description: 'Create tasting samples for coffee cupping evaluation',
    internalShipmentId: 'ISP-1008',
    fromItems: [{ sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — 1 kg bag', units: 3, kg: 3 }],
    toItems: [{ sku: 'RC-COL-SAMPLE-50G', productName: 'Colombian Supremo — 50g sample', units: 60, kg: 3 }],
    estimatedQty: 60,
    cost: 15.0,
    status: 'completed',
  },
];

export default function SamplingOrders() {
  const [orders, setOrders] = useState<TransformationOrder[]>(MOCK_SAMPLING_ORDERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<TransformationOrder | undefined>();

  useEffect(() => {
    setOrders(MOCK_SAMPLING_ORDERS);
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
        type: TransformationType.PACKAGING,
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
          title="Create Samples"
          description="Create sample packages for testing, tasting, and distribution to customers"
          onAddNew={handleCreateNew}
          addNewLabel="New Sample Order"
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-2">
            <span className="text-2xl">🧪</span>
            <div>
              <h3 className="font-bold text-blue-900">Sampling Best Practices</h3>
              <p className="text-sm text-blue-800">
                Create small samples for cupping evaluations and customer distribution. Track sample batches to ensure consistency 
                and maintain quality standards across your portfolio.
              </p>
            </div>
          </div>
        </div>

        <TransformationDashboard
          orders={orders}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          readOnly={false}
          title="Sample Orders"
          description="All your sample creation orders"
        />
      </div>

      {/* Transformation Form Modal */}
      <TransformationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transformationType={TransformationType.PACKAGING}
        onSave={handleSaveTransformation}
        editingOrder={editingOrder}
      />
    </>
  );
}
