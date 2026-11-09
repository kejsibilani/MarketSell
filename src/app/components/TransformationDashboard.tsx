import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Edit2, Check, X, Trash2 } from 'lucide-react';
import formatNumber from '../utils/numberFormat';
import { TransformItem, TransformationOrder, TransformationType, TRANSFORMATION_TYPE_COLORS } from '../types/transformation';

// ============================================================================
// TYPES
// ============================================================================

export interface TransformationDashboardProps {
  orders: TransformationOrder[];
  onUpdate?: (order: TransformationOrder) => void;
  onDelete?: (orderId: string) => void;
  readOnly?: boolean;
  title?: string;
  description?: string;
}

// ============================================================================
// COLORS & STYLING
// ============================================================================

const TRANSFORMATION_TYPES = [
  TransformationType.ROASTING,
  TransformationType.PACKAGING,
  TransformationType.REPACKAGING,
  TransformationType.BRAND_PACKAGING,
  TransformationType.BAG_OPENING,
] as const;

const getTypeColor = (type: TransformationType): { bg: string; text: string; border: string } => {
  return TRANSFORMATION_TYPE_COLORS[type] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-l-4 border-gray-500' };
};

const getStatusColor = (status: string): { badge: string; text: string; bg: string } => {
  const colors: Record<string, { badge: string; text: string; bg: string }> = {
    'pending': { badge: 'bg-yellow-100', text: 'text-yellow-700', bg: 'bg-yellow-50' },
    'working': { badge: 'bg-blue-100', text: 'text-blue-700', bg: 'bg-blue-50' },
    'completed': { badge: 'bg-green-100', text: 'text-green-700', bg: 'bg-green-50' },
  };
  return colors[status] || { badge: 'bg-gray-100', text: 'text-gray-700', bg: 'bg-gray-50' };
};

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================

function KPICard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EDITABLE TRANSFORMATION ITEM COMPONENT
// ============================================================================

interface EditableTransformItemProps {
  item: TransformItem;
  onUpdate: (item: TransformItem) => void;
  isEditing: boolean;
}

function EditableTransformItem({ item, onUpdate, isEditing }: EditableTransformItemProps) {
  if (!isEditing) {
    return (
      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded border border-gray-200">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
          <div className="text-xs text-gray-500 mt-0.5">{item.sku}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">{formatNumber(item.units)}</div>
          <div className="text-xs text-gray-500">units</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded border border-blue-200">
      <div className="flex-1">
        <div className="text-xs font-mono text-gray-600 mb-1">{item.sku}</div>
        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
      </div>
      <input
        type="number"
        min="1"
        value={item.units}
        onChange={(e) => onUpdate({ ...item, units: Math.max(1, Number(e.target.value)) })}
        className="w-20 px-2 py-1.5 border border-blue-300 rounded text-sm font-medium text-right"
      />
      <span className="text-xs text-gray-600 whitespace-nowrap">units</span>
    </div>
  );
}

// ============================================================================
// TRANSFORMATION ORDER CARD COMPONENT
// ============================================================================

interface TransformationOrderCardProps {
  order: TransformationOrder;
  onUpdate?: (order: TransformationOrder) => void;
  onDelete?: (orderId: string) => void;
  readOnly?: boolean;
}

function TransformationOrderCard({
  order,
  onUpdate,
  onDelete,
  readOnly = false,
}: TransformationOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fromItems, setFromItems] = useState<TransformItem[]>(order.fromItems);
  const [toItems, setToItems] = useState<TransformItem[]>(order.toItems);
  const [description, setDescription] = useState(order.description || '');

  const typeColor = getTypeColor(order.type);
  const statusColor = getStatusColor(order.status);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...order,
        fromItems,
        toItems,
        description,
        estimatedQty: toItems.reduce((sum, item) => sum + item.units, 0),
      });
    }
    setIsEditing(false);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setFromItems(order.fromItems);
    setToItems(order.toItems);
    setDescription(order.description || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this transformation order?')) {
      onDelete?.(order.id);
    }
  };

  return (
    <div className={`rounded-lg border ${statusColor.bg} ${typeColor.border} overflow-hidden transition-all`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full hover:opacity-90 transition-opacity"
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div className="text-left flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{order.id}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor.text} ${typeColor.bg}`}>
                  {order.type}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-0.5">{order.date} • {order.company}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-sm font-semibold text-gray-900">{formatNumber(order.cost)} EUR</div>
              <div className="text-xs text-gray-500">{formatNumber(order.estimatedQty || 0)} units</div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor.badge} ${statusColor.text}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white p-4 space-y-4">
          {/* Input Items */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Input Items (What comes in)
            </div>
            <div className="space-y-2">
              {fromItems.map((item, idx) => (
                <EditableTransformItem
                  key={idx}
                  item={item}
                  onUpdate={(updated) => {
                    const newItems = [...fromItems];
                    newItems[idx] = updated;
                    setFromItems(newItems);
                  }}
                  isEditing={isEditing}
                />
              ))}
            </div>
          </div>

          {/* Transformation Type Display */}
          <div className="flex items-center justify-center py-2">
            <div className={`px-4 py-2 rounded-full font-semibold text-sm ${typeColor.text} ${typeColor.bg}`}>
              {order.type}
            </div>
          </div>

          {/* Output Items */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Output Items (What comes out)
            </div>
            <div className="space-y-2">
              {toItems.map((item, idx) => (
                <EditableTransformItem
                  key={idx}
                  item={item}
                  onUpdate={(updated) => {
                    const newItems = [...toItems];
                    newItems[idx] = updated;
                    setToItems(newItems);
                  }}
                  isEditing={isEditing}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Description</label>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                {description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-2 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <>
                {!readOnly && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    {order.status === 'pending' && (
                      <button
                        onClick={handleDelete}
                        className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export const TransformationDashboard: React.FC<TransformationDashboardProps> = ({
  orders,
  onUpdate,
  onDelete,
  readOnly = false,
  title = 'Transformation Dashboard',
  description = 'Manage and track all transformation orders by type',
}) => {
  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      working: orders.filter(o => o.status === 'working').length,
      completed: orders.filter(o => o.status === 'completed').length,
    };
  }, [orders]);

  // Group orders by type
  const ordersByType = useMemo(() => {
    const grouped: Record<string, TransformationOrder[]> = {};
    TRANSFORMATION_TYPES.forEach(type => {
      grouped[type] = orders.filter(o => o.type === type);
    });
    return grouped;
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={() => <span className="text-xl">📦</span>}
          label="Total Orders"
          value={formatNumber(stats.total)}
          color="bg-gray-500"
        />
        <KPICard
          icon={() => <span className="text-xl">⏳</span>}
          label="Pending"
          value={formatNumber(stats.pending)}
          color="bg-yellow-500"
        />
        <KPICard
          icon={() => <span className="text-xl">⚙️</span>}
          label="In Progress"
          value={formatNumber(stats.working)}
          color="bg-blue-500"
        />
        <KPICard
          icon={() => <span className="text-xl">✅</span>}
          label="Completed"
          value={formatNumber(stats.completed)}
          color="bg-green-500"
        />
      </div>

      {/* Transformation Type Sections */}
      <div className="space-y-8">
        {TRANSFORMATION_TYPES.map(type => {
          const typeOrders = ordersByType[type];
          if (typeOrders.length === 0) return null;

          const typeColor = getTypeColor(type);

          return (
            <div key={type} className="space-y-3">
              {/* Section Header */}
              <div className={`${typeColor.border} pl-4 py-3`}>
                <h2 className={`text-lg font-bold ${typeColor.text}`}>
                  {type}
                  <span className="ml-2 text-sm font-normal opacity-75">
                    ({typeOrders.length} {typeOrders.length === 1 ? 'order' : 'orders'})
                  </span>
                </h2>
              </div>

              {/* Orders Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {typeOrders.map(order => (
                  <TransformationOrderCard
                    key={order.id}
                    order={order}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No transformation orders yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first transformation order to get started</p>
        </div>
      )}
    </div>
  );
};

export default TransformationDashboard;
