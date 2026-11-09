import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import PageHeader from '../components/PageHeader';
import { ArrowRight } from 'lucide-react';
import { TransformationType, TRANSFORMATION_TYPE_CARDS, TransformationOrder, TRANSFORMATION_TYPE_ICONS, TRANSFORMATION_TYPE_COLORS } from '../types/transformation';
import { useLabels } from '../hooks/useLabels';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TRANSFORMATION_ORDERS: TransformationOrder[] = [
  {
    id: 'TRF-2026-001',
    date: '18.04.26',
    company: 'NFCOF',
    type: TransformationType.ROASTING,
    description: 'Roast and repackage Colombian green into retail packs',
    internalShipmentId: 'ISP-1001',
    fromItems: [
      { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo — 60 kg bag', units: 5, kg: 300 },
    ],
    toItems: [
      { sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — 1 kg bag', units: 40, kg: 40 },
    ],
    estimatedQty: 40,
    cost: 70.0,
    status: 'completed',
  },
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
    id: 'TRF-2026-003',
    date: '20.05.26',
    company: 'NFCAO',
    type: TransformationType.PACKAGING,
    description: 'Create sample bags for testing',
    internalShipmentId: 'ISP-1003',
    fromItems: [{ sku: 'CAC-GHA-002-25KG', productName: 'Ghana Cacao — 25 kg sack', units: 4, kg: 100 }],
    toItems: [{ sku: 'CAC-BLD-001-5KG', productName: 'Premium Blend Cacao — 5 kg bag', units: 18, kg: 90 }],
    estimatedQty: 18,
    cost: 20.0,
    status: 'pending',
  },
  {
    id: 'TRF-2026-004',
    date: '22.05.26',
    company: 'NFCOF',
    type: TransformationType.BAG_OPENING,
    description: 'Open bag for quality analysis',
    internalShipmentId: 'ISP-1004',
    fromItems: [
      { sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — 1 kg bag', units: 2, kg: 2 },
    ],
    toItems: [
      { sku: 'RC-COL-001-1KG-OPEN', productName: 'Colombian Supremo — 1 kg bag (open)', units: 2, kg: 2 },
    ],
    estimatedQty: 2,
    cost: 15.0,
    status: 'pending',
  },
];

// ============================================================================
// TYPE CARD COMPONENT
// ============================================================================

interface TransformationTypeCardProps {
  type: TransformationType;
  label: string;
  description: string;
  icon: string;
  color: { bg: string; text: string; border: string };
  count: number;
  route: string;
  onNavigate: (route: string) => void;
}

function TypeCard({
  label,
  description,
  icon,
  color,
  count,
  route,
  onNavigate,
}: TransformationTypeCardProps) {
  return (
    <button
      onClick={() => onNavigate(route)}
      className={`${color.bg} ${color.border} rounded-lg p-6 text-left hover:shadow-md transition-all cursor-pointer h-full flex flex-col`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{icon}</div>
        <span className={`${color.text} px-2 py-1 rounded-full text-sm font-bold`}>
          {count}
        </span>
      </div>

      <h3 className={`text-lg font-bold ${color.text} mb-2`}>{label}</h3>
      <p className="text-sm text-gray-700 mb-4 flex-grow">{description}</p>

      <div className={`flex items-center gap-2 ${color.text} font-medium text-sm`}>
        View Orders <ArrowRight className="w-4 h-4" />
      </div>
    </button>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

// Transform/Edit Modal (UNUSED - for future use)
function TransformationModal({ isOpen, onClose, editingOrder, onSave }: any) {
  if (!isOpen) return null;
  return <div>Not implemented in Manage Products view</div>;

  if (!isOpen) return null;
  return <div>Not implemented in Manage Products view</div>;
}


export default function OperatorTransformations() {
  const navigate = useNavigate();
  const label = useLabels();
  const [orders, setOrders] = useState<TransformationOrder[]>(MOCK_TRANSFORMATION_ORDERS);

  useEffect(() => {
    setOrders(MOCK_TRANSFORMATION_ORDERS);
  }, []);

  const cards = TRANSFORMATION_TYPE_CARDS(orders);

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Transformations"
        description="Explore transformation options for inventory management"
        addNewLabel={label('action.addNew')}
      />

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {cards.map(card => (
          <TypeCard
            key={card.type}
            type={card.type}
            label={card.label}
            description={card.description}
            icon={card.icon}
            color={card.color}
            count={card.count}
            route={card.route}
            onNavigate={handleNavigate}
          />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'working').length}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'completed').length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">How to Use</h3>
        <p className="text-sm text-blue-800">
          Click on any card above to view and manage orders for that transformation type. Each order shows details about the input items, 
          output items, and current status. You can edit orders, add notes, and track shipping history.
        </p>
      </div>
    </div>
  );
}
