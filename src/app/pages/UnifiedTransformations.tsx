import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { TransformationDashboard } from '../components/TransformationDashboard';
import { TransformationOrder, TransformItem } from '../types/transformation';
import { TransformationType } from '../types/transformation';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TRANSFORMATIONS: TransformationOrder[] = [
  {
      id: 'TRF-2026-001',
      date: '18.04.26',
      company: 'NFCOF',
      type: TransformationType.ROASTING,
      description: 'Roast and repackage Colombian green into retail packs',
      internalShipmentId: 'ISP-1001',
      fromItems: [
          { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo — 60 kg bag', units: 5, kg: 300 },
          { sku: 'GC-COL-002-60KG', productName: 'Colombian Supreme Extra — 60 kg bag', units: 2, kg: 120 },
      ],
      toItems: [
          { sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — 1 kg bag', units: 40, kg: 40 },
      ],
      estimatedQty: 42,
      cost: 70.0,
      status: 'completed',
      shippingHistory: [
          { date: '18.04.26', event: 'Sent to roasting facility', location: 'Rotterdam WH → Roast Lab BCN', carrier: 'Costas Ocean', trackingRef: 'CST-8812', internalShipmentId: 'ISP-1001' },
          { date: '22.04.26', event: 'Roasting completed', location: 'Roast Lab BCN' },
          { date: '23.04.26', event: 'Returned to warehouse', location: 'Rotterdam WH' },
      ],
  },
  {
      id: 'TRF-2026-002',
      date: '10.05.26',
      company: 'NFCOF',
      type: TransformationType.PACKAGING,
      description: 'Repack green bag into sample retail 1kg bags',
      internalShipmentId: 'ISP-1002',
      fromItems: [{ sku: 'GC-ETH-004-60KG', productName: 'Ethiopian Yirgacheffe Green — 60 kg bag', units: 5, kg: 300 }],
      toItems: [{ sku: 'RC-ETH-002-1KG', productName: 'Ethiopian Yirgacheffe — 1 kg bag', units: 6, kg: 6 }],
      estimatedQty: 6,
      cost: 35.0,
      status: 'working',
      shippingHistory: [{ date: '10.05.26', event: 'Dispatched to facility', location: 'Rotterdam WH → Partner WH', carrier: 'FedEx', trackingRef: 'FX-22193', internalShipmentId: 'ISP-1002' }],
  },
  {
      id: 'TRF-2026-003',
      date: '20.05.26',
      company: 'NFCAO',
      type: TransformationType.REPACKAGING,
      description: 'Blend cacao and coffee for premium mix',
      internalShipmentId: 'ISP-1003',
      fromItems: [{ sku: 'CAC-GHA-002-25KG', productName: 'Ghana Cacao — 25 kg sack', units: 4, kg: 100 }],
      toItems: [{ sku: 'CAC-BLD-001-5KG', productName: 'Premium Blend Cacao — 5 kg bag', units: 18, kg: 90 }],
      estimatedQty: 18,
      cost: 20.0,
      status: 'pending',
      shippingHistory: [],
  },
  {
      id: 'TRF-2026-004',
      date: '22.05.26',
      company: 'NFCOF',
      type: TransformationType.BAG_OPENING,
      description: 'Grind Colombian coffee for espresso blends',
      internalShipmentId: 'ISP-1004',
      fromItems: [
          { sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — 1 kg bag', units: 15, kg: 15 },
      ],
      toItems: [
          { sku: 'GR-COL-ESP-1KG', productName: 'Espresso Grind Colombian — 1 kg bag', units: 15, kg: 15 },
      ],
      estimatedQty: 15,
      cost: 25.0,
      status: 'pending',
      shippingHistory: [],
  },
  {
      id: 'TRF-2026-005',
      date: '25.05.26',
      company: 'NFCAO',
      type: TransformationType.BRAND_PACKAGING,
      description: 'Package premium blend into 250g bags',
      internalShipmentId: 'ISP-1005',
      fromItems: [
          { sku: 'BLD-PRE-5KG', productName: 'Premium Blend — 5 kg bag', units: 8, kg: 40 },
      ],
      toItems: [
          { sku: 'PKG-PRE-250G', productName: 'Premium Blend — 250g bag', units: 160, kg: 40 },
      ],
      estimatedQty: 160,
      cost: 45.0,
      status: 'working',
      shippingHistory: [
          { date: '25.05.26', event: 'Started packaging', location: 'Packaging Facility', carrier: 'Internal', trackingRef: 'PKG-2026-005' },
      ],
  },
];

// ============================================================================
// PAGE COMPONENT
// ============================================================================

interface UnifiedTransformationsPageProps {
  mode: 'seller' | 'operator';
}

export default function UnifiedTransformationsPage({ mode = 'seller' }: UnifiedTransformationsPageProps) {
  const [transformations, setTransformations] = useState<TransformationOrder[]>(MOCK_TRANSFORMATIONS);

  useEffect(() => {
    setTransformations(MOCK_TRANSFORMATIONS);
  }, []);

  const handleUpdate = (updatedOrder: TransformationOrder) => {
    setTransformations(prev =>
      prev.map(t => (t.id === updatedOrder.id ? updatedOrder : t))
    );
  };

  const handleDelete = (orderId: string) => {
    setTransformations(prev => prev.filter(t => t.id !== orderId));
  };

  const handleAddNew = () => {
    // TODO: Open modal to create new transformation order
    console.log('Add new transformation');
  };

  const isSeller = mode === 'seller';

  return (
      <div className="space-y-6">
        <PageHeader
          title={isSeller ? 'My Transformations' : 'Transformation Orders'}
          description={
            isSeller
              ? 'Manage roasting, repackaging, and blending orders applied to your stock'
              : 'Oversee all transformation orders across your network'
          }
          onAddNew={handleAddNew}
          addNewLabel="New Transformation"
        />

        <TransformationDashboard
          orders={transformations}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          readOnly={false}
          title={isSeller ? 'My Transformation Orders' : 'All Transformation Orders'}
          description={
            isSeller
              ? 'Dashboard view of all your transformation activities'
              : 'Complete overview of all transformation operations'
          }
        />
      </div>
  );
}
