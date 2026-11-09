import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Truck,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  MapPin,
  Calendar,
  Package,
  ArrowRight,
  Clock,
  AlertCircle,
  DollarSign,
  Users,
} from 'lucide-react';
import formatNumber from '../utils/numberFormat';

interface TransformItem {
  sku: string;
  productName: string;
  units: number;
  kg?: number;
}

interface ShippingEvent {
  date: string;
  event: string;
  location: string;
  carrier?: string;
  trackingRef?: string;
  internalShipmentId?: string;
}

interface TransformationOrder {
  id: string;
  date: string;
  company: string;
  type: string;
  description?: string;
  internalShipmentId?: string;
  fromItems: TransformItem[];
  toItems: TransformItem[];
  estimatedQty?: number;
  cost: number;
  status: 'pending' | 'working' | 'completed';
  shippingHistory: ShippingEvent[];
}

interface TransformationOrderPanelProps {
  order: TransformationOrder;
  isExpanded: boolean;
  onExpand: (orderId: string) => void;
  onUpdate?: (order: TransformationOrder) => void;
  onDelete?: (orderId: string) => void;
  readOnly?: boolean;
}

/**
 * Transformation Order Panel Component
 * Displays detailed transformation order information with editable inputs/outputs and shipping history
 */
export const TransformationOrderPanel: React.FC<TransformationOrderPanelProps> = ({
  order,
  isExpanded,
  onExpand,
  onUpdate,
  onDelete,
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fromItems, setFromItems] = useState<TransformItem[]>(order.fromItems);
  const [toItems, setToItems] = useState<TransformItem[]>(order.toItems);
  const [description, setDescription] = useState(order.description || '');
  const [expandedShipping, setExpandedShipping] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock };
      case 'working':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: RefreshCw };
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: Check };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle };
    }
  };

  const getTransformationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Roasting: 'bg-amber-100 text-amber-800',
      Repackaging: 'bg-blue-100 text-blue-800',
      Blending: 'bg-purple-100 text-purple-800',
      Grinding: 'bg-orange-100 text-orange-800',
      Cupping: 'bg-pink-100 text-pink-800',
      Sorting: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleSave = () => {
    if (onUpdate) {
      const updatedOrder = {
        ...order,
        fromItems,
        toItems,
        description,
        estimatedQty: toItems.reduce((sum, item) => sum + item.units, 0),
      };
      onUpdate(updatedOrder);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFromItems(order.fromItems);
    setToItems(order.toItems);
    setDescription(order.description || '');
    setIsEditing(false);
  };

  const statusColor = getStatusColor(order.status);
  const StatusIcon = statusColor.icon;

  const totalInputKg = fromItems.reduce((sum, item) => sum + (item.kg || 0), 0);
  const totalOutputKg = toItems.reduce((sum, item) => sum + (item.kg || 0), 0);
  const totalInputUnits = fromItems.reduce((sum, item) => sum + item.units, 0);
  const totalOutputUnits = toItems.reduce((sum, item) => sum + item.units, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div
        onClick={() => onExpand(order.id)}
        className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Expand Button */}
            <button className="text-gray-500 hover:text-gray-700 p-1">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* Order ID & Date */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">{order.id}</span>
                <span className="text-xs text-gray-500">{order.date}</span>
                {order.internalShipmentId && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {order.internalShipmentId}
                  </span>
                )}
              </div>
              {order.description && (
                <div className="text-sm text-gray-600 mt-1">{order.description}</div>
              )}
            </div>

            {/* Type Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTransformationTypeColor(order.type)}`}>
              {order.type}
            </span>

            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusColor.bg} ${statusColor.text}`}>
              <StatusIcon size={14} />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>

            {/* Cost */}
            <div className="text-right">
              <div className="font-semibold text-gray-900 flex items-center gap-1">
                <DollarSign size={14} />
                {formatNumber(order.cost)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6">
          {/* Company & Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase font-semibold">Company</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">{order.company}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-semibold">Type</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">{order.type}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-semibold">Status</div>
              <div className={`text-sm font-semibold mt-1 ${statusColor.text}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-semibold">Cost</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">€{formatNumber(order.cost)}</div>
            </div>
          </div>

          {/* Transformation Flow */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw size={16} className="text-amber-600" />
              <h3 className="font-semibold text-gray-900">Transformation Flow</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Items */}
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Package size={14} className="text-green-600" />
                  Input Items ({totalInputUnits} units)
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    {fromItems.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-end bg-green-50 p-3 rounded border border-green-200">
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 font-semibold">SKU</div>
                          <input
                            type="text"
                            value={item.sku}
                            onChange={(e) => {
                              const updated = [...fromItems];
                              updated[idx].sku = e.target.value;
                              setFromItems(updated);
                            }}
                            className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                        </div>
                        <div className="w-20">
                          <div className="text-xs text-gray-600 font-semibold">Units</div>
                          <input
                            type="number"
                            value={item.units}
                            onChange={(e) => {
                              const updated = [...fromItems];
                              updated[idx].units = parseInt(e.target.value) || 0;
                              setFromItems(updated);
                            }}
                            className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fromItems.map((item, idx) => (
                      <div key={idx} className="bg-green-50 p-3 rounded border border-green-200 text-sm">
                        <div className="font-mono text-xs bg-white px-2 py-1 rounded mb-1">{item.sku}</div>
                        <div className="text-gray-700">{item.productName}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatNumber(item.units)} units
                          {item.kg && ` • ${formatNumber(item.kg)} kg`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Arrow & Transform Type */}
              <div className="flex md:flex-col items-center justify-center">
                <div className="flex-1 md:flex-none">
                  <ArrowRight size={24} className="text-gray-400 hidden md:block mx-auto mb-2" />
                  <ArrowRight size={24} className="text-gray-400 md:hidden" />
                </div>
                <div className="text-center px-4">
                  <span className={`inline-block px-3 py-2 rounded-full text-xs font-semibold ${getTransformationTypeColor(order.type)}`}>
                    {order.type}
                  </span>
                </div>
              </div>

              {/* Output Items */}
              <div className="md:col-start-2">
                <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Package size={14} className="text-blue-600" />
                  Output Items ({totalOutputUnits} units)
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    {toItems.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-end bg-blue-50 p-3 rounded border border-blue-200">
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 font-semibold">SKU</div>
                          <input
                            type="text"
                            value={item.sku}
                            onChange={(e) => {
                              const updated = [...toItems];
                              updated[idx].sku = e.target.value;
                              setToItems(updated);
                            }}
                            className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                        </div>
                        <div className="w-20">
                          <div className="text-xs text-gray-600 font-semibold">Units</div>
                          <input
                            type="number"
                            value={item.units}
                            onChange={(e) => {
                              const updated = [...toItems];
                              updated[idx].units = parseInt(e.target.value) || 0;
                              setToItems(updated);
                            }}
                            className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {toItems.map((item, idx) => (
                      <div key={idx} className="bg-blue-50 p-3 rounded border border-blue-200 text-sm">
                        <div className="font-mono text-xs bg-white px-2 py-1 rounded mb-1">{item.sku}</div>
                        <div className="text-gray-700">{item.productName}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatNumber(item.units)} units
                          {item.kg && ` • ${formatNumber(item.kg)} kg`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {isEditing ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this transformation..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          ) : description ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Description</div>
              <div className="text-sm text-gray-600">{description}</div>
            </div>
          ) : null}

          {/* Shipping History */}
          {order.shippingHistory && order.shippingHistory.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Shipping & Movement History</h3>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {order.shippingHistory.length} events
                </span>
              </div>

              <div className="space-y-3">
                {order.shippingHistory.map((event, idx) => (
                  <div key={idx} className="border-l-4 border-blue-300 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{event.event}</div>
                        <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                          <Calendar size={12} />
                          {event.date}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                          <MapPin size={12} />
                          {event.location}
                        </div>
                        {event.carrier && (
                          <div className="text-xs text-gray-600 mt-1">
                            <span className="font-semibold">{event.carrier}</span>
                            {event.trackingRef && ` • Tracking: ${event.trackingRef}`}
                          </div>
                        )}
                        {event.internalShipmentId && (
                          <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mt-1 inline-block">
                            {event.internalShipmentId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  Save Changes
                </button>
              </>
            ) : (
              <>
                {!readOnly && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    {onDelete && order.status === 'pending' && (
                      <button
                        onClick={() => {
                          if (confirm('Delete this transformation order?')) {
                            onDelete(order.id);
                          }
                        }}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={16} />
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
};

export default TransformationOrderPanel;
