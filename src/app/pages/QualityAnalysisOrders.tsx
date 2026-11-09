import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { TransformationType, TransformationOrder } from '../types/transformation';
import { TransformationDashboard } from '../components/TransformationDashboard';
import { TransformationFormModal } from '../components/TransformationFormModal';
import { generateTransformationId } from '../utils/workflowHelpers';

const MOCK_QUALITY_ANALYSIS_ORDERS: TransformationOrder[] = [
  {
    id: 'TRF-2026-004',
    date: '22.05.26',
    company: 'NFCOF',
    type: TransformationType.BAG_OPENING,
    description: 'Open bag for quality analysis - green beans assessment',
    internalShipmentId: 'ISP-1004',
    fromItems: [{ sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — 1 kg bag', units: 2, kg: 2 }],
    toItems: [{ sku: 'RC-COL-001-1KG-OPEN', productName: 'Colombian Supremo — 1 kg bag (open)', units: 2, kg: 2 }],
    estimatedQty: 2,
    cost: 15.0,
    status: 'pending',
  },
  {
    id: 'TRF-2026-009',
    date: '26.05.26',
    company: 'NFCAO',
    type: TransformationType.BAG_OPENING,
    description: 'Open roasted coffee bag for quality check and cupping',
    internalShipmentId: 'ISP-1009',
    fromItems: [{ sku: 'RC-ETH-001-1KG', productName: 'Ethiopian Yirgacheffe — 1 kg bag', units: 1, kg: 1 }],
    toItems: [{ sku: 'RC-ETH-001-1KG-OPEN', productName: 'Ethiopian Yirgacheffe — 1 kg bag (open)', units: 1, kg: 1 }],
    estimatedQty: 1,
    cost: 10.0,
    status: 'working',
  },
];

export default function QualityAnalysisOrders() {
  const [orders, setOrders] = useState<TransformationOrder[]>(MOCK_QUALITY_ANALYSIS_ORDERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<TransformationOrder | undefined>();

  useEffect(() => {
    setOrders(MOCK_QUALITY_ANALYSIS_ORDERS);
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
        type: TransformationType.BAG_OPENING,
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
          title="Quality Analysis"
          description="Open bags for quality checks and analysis at any stage of your coffee journey"
          onAddNew={handleCreateNew}
          addNewLabel="New Quality Check"
        />

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex gap-2">
            <span className="text-2xl">🔓</span>
            <div>
              <h3 className="font-bold text-orange-900">Quality Analysis</h3>
              <p className="text-sm text-orange-800">
                Open bags for quality checks at any stage — green beans, roasted coffee, or packaged products. Track quality 
                assessments and maintain detailed records of your quality control processes.
              </p>
            </div>
          </div>
        </div>

        <TransformationDashboard
          orders={orders}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          readOnly={false}
          title="Quality Analysis Orders"
          description="All your quality checks and analysis records"
        />
      </div>

      {/* Transformation Form Modal */}
      <TransformationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transformationType={TransformationType.BAG_OPENING}
        onSave={handleSaveTransformation}
        editingOrder={editingOrder}
      />
    </>
  );
}
