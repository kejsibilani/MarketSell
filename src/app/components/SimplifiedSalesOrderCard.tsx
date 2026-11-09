import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SalesOrderCardProps {
  order: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onViewDetails: () => void;
  getCountryFlag: (code: string) => string;
}

export function SimplifiedSalesOrderCard({ 
  order, 
  isExpanded, 
  onToggleExpand,
  onViewDetails,
  getCountryFlag 
}: SalesOrderCardProps) {
  // Helper to get order source display text
  const getOrderSourceDisplay = () => {
    if (order.orderSource === 'agent' && order.orderSourceValue) {
      return `via Agent ${order.orderSourceValue}`;
    } else if (order.orderSource === 'storefront' && order.orderSourceValue) {
      return `via Storefront ${order.orderSourceValue}`;
    } else if (order.orderSource === 'owner') {
      return 'Direct entry (Owner)';
    } else if (order.orderSource === 'operator') {
      return 'Operator entry';
    }
    return 'Unknown source';
  };

  // Calculate shipment status summary
  const shipmentStatusSummary = () => {
    let inTransit = 0;
    let delivered = 0;
    let pending = 0;

    order.items.forEach((item: any) => {
      if (!item.linkedShipmentIds || item.linkedShipmentIds.length === 0) {
        pending++;
      } else {
        // Simplified: assume first shipment status
        if (item.shippedQuantity === item.quantity) {
          delivered++;
        } else if ((item.shippedQuantity || 0) > 0) {
          inTransit++;
        }
      }
    });

    return { inTransit, delivered, pending };
  };

  const shipmentStatus = shipmentStatusSummary();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Main 4-Block Layout */}
      <div className="grid grid-cols-4 gap-4 mb-3">
        {/* Block 1: Order & Date */}
        <div className="bg-gray-50 rounded p-3 border border-gray-100">
          <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Order & Date</div>
          <div className="font-bold text-gray-900 text-sm">{order.orderId}</div>
          <div className="text-xs text-gray-600 mt-1">
            {new Date(order.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          {order.dueDate && (
            <div className="text-xs text-gray-500 mt-1">
              Due: {new Date(order.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>

        {/* Block 2: Buyer */}
        <div className="bg-gray-50 rounded p-3 border border-gray-100">
          <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Buyer</div>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-lg">{getCountryFlag(order.buyerCountry)}</span>
            <span className="font-semibold text-gray-900 text-sm truncate">{order.buyerName}</span>
          </div>
          <div className="text-xs text-gray-600 mb-1">Deliver to: {order.buyerDestination || 'N/A'}</div>
          <div className="text-xs text-gray-500 italic">{getOrderSourceDisplay()}</div>
        </div>

        {/* Block 3: Contents Overview */}
        <div className="bg-gray-50 rounded p-3 border border-gray-100">
          <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Contents</div>
          <div className="text-sm font-medium text-gray-900">{order.items.length} items</div>
          <div className="text-sm text-gray-900">
            {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} units
          </div>
          <div className="text-sm font-semibold text-gray-900 mt-1">
            €{(order.totalValue || 0).toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
        </div>

        {/* Block 4: Status */}
        <div className="bg-gray-50 rounded p-3 border border-gray-100">
          <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Status</div>
          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(order.status)} mb-2`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <div className="text-xs text-gray-600 space-y-0.5 mt-2">
            {shipmentStatus.delivered > 0 && <div>✓ {shipmentStatus.delivered} delivered</div>}
            {shipmentStatus.inTransit > 0 && <div>→ {shipmentStatus.inTransit} in transit</div>}
            {shipmentStatus.pending > 0 && <div>⏱ {shipmentStatus.pending} pending</div>}
          </div>
        </div>
      </div>

      {/* Bottom Row: Seller, Agent, Expand */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-gray-600">Seller:</span>
            <span className="font-medium text-gray-900 ml-1">{order.sellerCompany || 'N/A'}</span>
          </div>
          {order.agent && (
            <div>
              <span className="text-gray-600">Agent:</span>
              <span className="font-medium text-gray-900 ml-1">{order.agent}</span>
              {order.agentCommission && (
                <span className="text-gray-500 ml-1">(${order.agentCommission.toFixed(2)})</span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onToggleExpand}
          className="flex items-center gap-1 px-3 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show Details
            </>
          )}
        </button>
      </div>
    </div>
  );
}
