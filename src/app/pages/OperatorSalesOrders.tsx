import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { DashboardLayout } from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import TableHeader from '../components/TableHeader';
import ShipmentDetails from '../components/ShipmentDetails';
import { SimplifiedSalesOrderCard } from '../components/SimplifiedSalesOrderCard';
import { Plus, Edit, X, AlertCircle, CheckCircle, Clock, TrendingUp, Truck, Package, ChevronUp, ChevronDown, FileText, ArrowRight, Eye, ImageIcon, Layers } from 'lucide-react';
import { loadFromLS, saveToLS, generateShipmentId } from '../utils/workflowHelpers';
import { getCountryFlag } from '../utils/countryFlags';
import { products, MOCK_SALES_ORDERS, MOCK_ACTIVITY_LOG, MOCK_SHIPMENTS } from '../data/mockData';

export interface SalesOrder {
  id: string;
  orderId: string;
  date: string;
  buyerName: string;
  buyerEmail: string;
  buyerCountry?: string;
  buyerDestination?: string;
  sellerCompanyId?: string;
  sellerCompany?: string;
  sellerEmail?: string;
  agent?: string;
  agentCommission?: number;
  orderSource?: 'agent' | 'operator' | 'owner' | 'storefront';
  orderSourceValue?: string;
  status: 'pending' | 'partial' | 'fulfilled' | 'cancelled';
  items: Array<{
    skuId: string;
    quantity: number;
    price?: number;
    warehouse?: string;
    linkedShipmentIds?: string[];
    shippedQuantity?: number;
    ownerOfStock?: string;
  }>;
  totalValue?: number;
  createdDate: string;
  dueDate?: string;
  notes?: string;
}

// Sales Order Detail Modal
function SalesOrderDetailModal({ isOpen, onClose, order }: any) {
  const [openActivityDetail, setOpenActivityDetail] = useState<Record<string, boolean>>({});

  if (!isOpen || !order) return null;

  const shipments = loadFromLS('shipments', []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return { bg: 'bg-green-50', text: 'text-green-800', badge: 'bg-green-100' };
      case 'partial':
        return { bg: 'bg-yellow-50', text: 'text-yellow-800', badge: 'bg-yellow-100' };
      case 'pending':
        return { bg: 'bg-blue-50', text: 'text-blue-800', badge: 'bg-blue-100' };
      case 'cancelled':
        return { bg: 'bg-red-50', text: 'text-red-800', badge: 'bg-red-100' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-800', badge: 'bg-gray-100' };
    }
  };

  const colors = getStatusColor(order.status);

  const pendingQuantity = order.items.reduce((sum: number, item: any) => {
    const shipped = item.shippedQuantity || 0;
    return sum + Math.max(0, item.quantity - shipped);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Sales Order Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className={`${colors.bg} rounded-lg p-4`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{order.orderId}</h3>
                <p className="text-sm text-gray-600 mt-1">{order.buyerName}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge} ${colors.text}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-gray-600">Email: {order.buyerEmail}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
              <p className="text-sm text-gray-900">{new Date(order.createdDate).toLocaleDateString()}</p>
            </div>
            {order.dueDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <p className="text-sm text-gray-900">{new Date(order.dueDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item: any, idx: number) => {
                const product = products.find(p => p.id === item.skuId);
                const shipped = item.shippedQuantity || 0;
                const pending = Math.max(0, item.quantity - shipped);
                const linkedShipments = item.linkedShipmentIds
                  ? shipments.filter((s: any) => item.linkedShipmentIds.includes(s.id))
                  : [];

                return (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{product?.name || item.skuId}</p>
                        <p className="text-xs text-gray-600">{item.skuId}</p>
                      </div>
                      {item.price && <p className="font-semibold text-gray-900">${item.price.toFixed(2)}</p>}
                    </div>
                    <div className="flex gap-4 text-sm mb-2">
                      <div>
                        <span className="text-gray-600">Ordered:</span>
                        <span className="font-medium text-gray-900 ml-2">{item.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Shipped:</span>
                        <span className="font-medium text-green-600 ml-2">{shipped}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Pending:</span>
                        <span className={`font-medium ml-2 ${pending > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {pending}
                        </span>
                      </div>
                    </div>
                    {item.warehouse && (
                      <p className="text-xs text-gray-600">Warehouse: {item.warehouse}</p>
                    )}
                    {linkedShipments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <p className="text-xs font-medium text-gray-600 mb-1">Linked Shipments ({linkedShipments.length}):</p>
                        <div className="space-y-1">
                          {linkedShipments.map((s: any) => (
                            <p key={s.id} className="text-xs text-gray-700">
                              {s.shipmentId} • {s.carrier} • {s.status}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
              <Truck className="w-4 h-4 text-blue-600" />
              Activity Log ({MOCK_ACTIVITY_LOG.filter(a => a.orderId === order.orderId).length})
            </div>
            {MOCK_ACTIVITY_LOG.filter(a => a.orderId === order.orderId).length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">No activities recorded yet.</p>
            ) : (
              <div className="border-t border-gray-100 overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 w-12"></th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product (SKU)</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ref ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {MOCK_ACTIVITY_LOG.filter(a => a.orderId === order.orderId).map((activity: any) => {
                      const product = products.find(p => p.id === activity.skuId);
                      const detailKey = `${order.id}-${activity.id}`;
                      const showDetail = openActivityDetail[detailKey];

                      return (
                        <React.Fragment key={activity.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <button 
                                onClick={() => setOpenActivityDetail(prev => ({ ...prev, [detailKey]: !prev[detailKey] }))}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {showDetail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </td>
                            <td className="px-4 py-2 font-mono text-xs">{activity.type === 'transformation' ? 'TRF' : 'SHP'}</td>
                            <td className="px-4 py-2">
                              <div className="text-xs font-medium text-gray-900">{product?.name || activity.skuId}</div>
                              <code className="text-[10px] bg-gray-100 px-1 py-0.5 rounded">{activity.skuId}</code>
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-600">{new Date(activity.date).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-xs text-gray-900">{activity.description}</td>
                            <td className="px-4 py-2 font-medium text-xs text-gray-900">{activity.quantity}</td>
                            <td className="px-4 py-2"><code className="text-[10px] bg-gray-100 px-1 py-0.5 rounded">{activity.linkedId}</code></td>
                            <td className="px-4 py-2 text-xs text-gray-700">{activity.status === 'completed' ? 'Completed' : activity.status === 'in_progress' ? 'In Transit' : activity.status === 'pending' ? 'Pending' : 'Failed'}</td>
                          </tr>

                          {showDetail && (
                            <tr>
                              <td colSpan={8} className="px-4 py-0 bg-[#F5F7FA]">
                                <div className="py-3 space-y-2">
                                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-700">
                                      <Package className="w-3.5 h-3.5 text-[#0B1F3A]" /> Activity Details
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                      <div><span className="text-gray-500">Type</span><div className="font-medium mt-0.5">{activity.type === 'transformation' ? 'Transformation' : 'Shipment'}</div></div>
                                      <div><span className="text-gray-500">SKU</span><div className="font-medium mt-0.5">{activity.skuId}</div></div>
                                      <div><span className="text-gray-500">Quantity</span><div className="font-medium mt-0.5">{activity.quantity} units</div></div>
                                      <div><span className="text-gray-500">Date</span><div className="font-medium mt-0.5">{new Date(activity.date).toLocaleDateString()}</div></div>
                                      <div className="col-span-2"><span className="text-gray-500">Description</span><div className="font-medium mt-0.5">{activity.description}</div></div>
                                      <div className="col-span-2"><span className="text-gray-500">Ref ID</span><div className="font-medium mt-0.5 font-mono">{activity.linkedId}</div></div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {pendingQuantity > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900">Pending Fulfillment</h3>
                  <p className="text-sm text-orange-800 mt-1">{pendingQuantity} units still need to be shipped</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Sales Order Modal
function CreateSalesOrderModal({ isOpen, onClose, onSave }: any) {
  const [orderId, setOrderId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<Array<{ skuId: string; quantity: number; price: number }>>([
    { skuId: '', quantity: 0, price: 0 }
  ]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { skuId: '', quantity: 0, price: 0 }]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const handleUpdateItem = (idx: number, field: string, value: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const handleCreate = () => {
    if (!orderId || !buyerName || !buyerEmail || items.filter(i => i.skuId && i.quantity > 0).length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const newOrder: SalesOrder = {
      id: Date.now().toString(),
      orderId,
      date: new Date().toISOString(),
      buyerName,
      buyerEmail,
      status: 'pending',
      items: items.filter(i => i.skuId && i.quantity > 0),
      createdDate: new Date().toISOString(),
      dueDate: dueDate || undefined,
      notes: notes || undefined,
    };

    onSave(newOrder);
    setOrderId('');
    setBuyerName('');
    setBuyerEmail('');
    setDueDate('');
    setItems([{ skuId: '', quantity: 0, price: 0 }]);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create Sales Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order ID *</label>
            <input
              type="text"
              placeholder="e.g., SO-2024-001"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name *</label>
              <input
                type="text"
                placeholder="Buyer name"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Email *</label>
              <input
                type="email"
                placeholder="buyer@example.com"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Items *</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <select
                    value={item.skuId}
                    onChange={(e) => handleUpdateItem(idx, 'skuId', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units </label>
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length === 1}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddItem}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
            <CheckCircle size={16} /> Create Order
          </button>
        </div>
      </div>
    </div>
  );
}

// Shipment Planner Modal
function ShipmentPlannerModal({ isOpen, onClose, order, shipments, allocations, setAllocations, onCreateShipment }: any) {
  if (!isOpen || !order) return null;

  const skus = order.items.map((item: any, idx: number) => ({
    idx,
    skuId: item.skuId,
    ordered: item.quantity,
    shipped: item.shippedQuantity || 0,
  })).filter((sku: any) => sku.ordered > sku.shipped);

  const orderShipments = shipments.filter((s: any) => {
    return order.items.some((item: any) => item.linkedShipmentIds?.includes(s.id));
  });

  const orderAllocations = allocations[order.orderId] || {};

  const handleAllocationChange = (skuId: string, shipmentId: string, value: number) => {
    const newAllocations = { ...allocations };
    if (!newAllocations[order.orderId]) {
      newAllocations[order.orderId] = {};
    }
    const key = `${skuId}-${shipmentId}`;
    if (value > 0) {
      newAllocations[order.orderId][key] = value;
    } else {
      delete newAllocations[order.orderId][key];
    }
    setAllocations(newAllocations);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Shipment Planning</h2>
            <p className="text-sm text-gray-600 mt-1">Order {order.orderId} - Allocate SKUs to shipments</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {skus.length === 0 ? (
            <div className="text-center py-8">
              <Package size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">All items have been shipped</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[150px]">SKU</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[80px]">Ordered</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[80px]">Shipped</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[100px] bg-blue-50">Suggested</th>
                    {orderShipments.map((shipment: any) => (
                      <th key={shipment.id} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[120px] border-l border-gray-300">
                        <div className="text-xs font-medium text-gray-600">{shipment.shipmentId}</div>
                        <div className="text-xs text-gray-500">({shipment.carrier})</div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[120px] border-l border-gray-300 bg-green-50">
                      <Plus size={16} className="inline" />
                      <span className="ml-1">New Shipment</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {skus.map((sku: any, idx: number) => {
                    const suggestion = sku.ordered - sku.shipped;
                    return (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{sku.skuId}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">{sku.ordered}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">{sku.shipped}</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-blue-600 bg-blue-50">{suggestion}</td>
                        {orderShipments.map((shipment: any) => (
                          <td key={`${sku.skuId}-${shipment.id}`} className="px-4 py-3 text-center border-l border-gray-300">
                            <input
                              type="number"
                              min="0"
                              max={suggestion}
                              value={orderAllocations[`${sku.skuId}-${shipment.id}`] || ''}
                              onChange={(e) => handleAllocationChange(sku.skuId, shipment.id, parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center border-l border-gray-300 bg-green-50">
                          <button
                            onClick={() => {
                              if (onCreateShipment) {
                                onCreateShipment({
                                  orderId: order.orderId,
                                  itemIdx: sku.idx,
                                  skuId: sku.skuId,
                                  suggestedQty: suggestion
                                });
                              }
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                            title="Create new shipment for this SKU"
                          >
                            <Plus size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 flex gap-3 bg-gray-50">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">
            Close
          </button>
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Save Allocations
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Shipment Modal
function CreateShipmentModal({ isOpen, onClose, onSave, data, salesOrders }: any) {
  const [shipmentId, setShipmentId] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingReference, setTrackingReference] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [status, setStatus] = useState('pending');
  
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});

  const order = useMemo(() => {
    return salesOrders?.find((o: any) => o.orderId === data?.orderId);
  }, [salesOrders, data]);

  React.useEffect(() => {
    if (data && order) {
      const initialMap: Record<number, number> = {};
      order.items.forEach((item: any, idx: number) => {
        const pending = item.quantity - (item.shippedQuantity || 0);
        if (data.itemIdx === idx || data.itemSkuIds?.includes(item.skuId)) {
          initialMap[idx] = pending > 0 ? pending : 0;
        }
      });
      setSelectedQuantities(initialMap);
    }
  }, [data, order]);

  if (!isOpen || !data || !order) return null;

  const handleToggleItem = (idx: number, pendingQty: number) => {
    setSelectedQuantities(prev => {
      const next = { ...prev };
      if (next[idx] !== undefined) {
        delete next[idx];
      } else {
        next[idx] = pendingQty;
      }
      return next;
    });
  };

  const handleQtyChange = (idx: number, val: number, maxQty: number) => {
    const clampedVal = Math.min(Math.max(0, val), maxQty);
    setSelectedQuantities(prev => ({
      ...prev,
      [idx]: clampedVal
    }));
  };

  const selectedItemsList = Object.entries(selectedQuantities).filter(([_, qty]) => qty > 0);

  const handleCreate = () => {
    if (selectedItemsList.length === 0 || !shipmentId || !carrier || !trackingReference) {
      alert('Please fill in all required fields and select at least one item with a valid quantity');
      return;
    }

    const itemsToShip = selectedItemsList.map(([idxStr, qty]) => {
      const idx = parseInt(idxStr);
      const item = order.items[idx];
      return {
        itemIdx: idx,
        skuId: item.skuId,
        quantity: qty,
        price: item.price
      };
    });

    const totalUnits = itemsToShip.reduce((acc, curr) => acc + curr.quantity, 0);

    const newShipment = {
      id: Date.now().toString(),
      shipmentId,
      carrier,
      trackingReference,
      trackingNumber,
      date: new Date().toISOString(),
      status,
      units: totalUnits,
      isMultiItem: itemsToShip.length > 1,
      items: itemsToShip.map(i => ({ skuId: i.skuId, quantity: i.quantity, price: i.price })),
    };

    onSave(newShipment, itemsToShip);
    
    setSelectedQuantities({});
    setShipmentId('');
    setCarrier('');
    setTrackingReference('');
    setTrackingNumber('');
    setStatus('pending');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">Create Shipment</h2>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Multi-Item Enabled
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600">Order</p>
            <p className="font-semibold text-gray-900">{order.orderId}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Items & Quantities to Include in this Shipment *
            </label>
            <p className="text-xs text-gray-500 mb-3">
              💡 Select multiple SKUs to group them into a single multi-item shipment.
            </p>
            
            <div className="space-y-2">
              {order.items.map((item: any, idx: number) => {
                const prod = products.find((p: any) => p.id === item.skuId);
                const shipped = item.shippedQuantity || 0;
                const pending = item.quantity - shipped;
                const isSelected = selectedQuantities[idx] !== undefined;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50/60' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        disabled={pending <= 0}
                        checked={isSelected}
                        onChange={() => handleToggleItem(idx, pending)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{prod?.name || item.skuId}</p>
                            <p className="text-xs text-gray-600">SKU: {item.skuId}</p>
                            {item.warehouse && <p className="text-xs text-gray-600">Warehouse: {item.warehouse}</p>}
                          </div>
                          <div className="text-right text-xs">
                            <p className="text-gray-600">Ordered: {item.quantity}</p>
                            <p className="text-green-600">Shipped: {shipped}</p>
                            <p className={`font-semibold ${pending > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                              Available: {pending}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-3 pt-2 border-t border-blue-200 flex items-center justify-between">
                            <span className="text-xs font-semibold text-blue-900">Units to ship:</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max={pending}
                                value={selectedQuantities[idx] || 0}
                                onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 0, pending)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm font-semibold text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-500">/ {pending}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shipment ID *</label>
            <input
              type="text"
              placeholder="e.g., SHP-2026-001"
              value={shipmentId}
              onChange={(e) => setShipmentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carrier *</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Carrier --</option>
              <option value="FedEx">FedEx</option>
              <option value="UPS">UPS</option>
              <option value="DHL">DHL</option>
              <option value="DPD">DPD</option>
              <option value="PostNL">PostNL</option>
              <option value="GLS">GLS</option>
              <option value="TNT">TNT</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Reference *</label>
              <input
                type="text"
                placeholder="e.g., FDX-2026-0001"
                value={trackingReference}
                onChange={(e) => setTrackingReference(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
              <input
                type="text"
                placeholder="e.g., FDX2026000100"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={selectedItemsList.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle size={16} /> Create Shipment ({selectedItemsList.length} items)
          </button>
        </div>
      </div>
    </div>
  );
}

// Shipment Detail Modal
function ShipmentDetailModal({ isOpen, onClose, shipment }: any) {
  if (!isOpen || !shipment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">Shipment Details</h2>
            {(shipment.items?.length > 1 || shipment.isMultiItem) && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Multi-Item Shipment ({shipment.items?.length || 'Multiple'})
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div>
              <span className="text-gray-600 text-xs font-semibold uppercase">Shipment ID</span>
              <p className="font-mono font-medium text-gray-900 mt-1">{shipment.shipmentId}</p>
            </div>
            <div>
              <span className="text-gray-600 text-xs font-semibold uppercase">Carrier</span>
              <p className="font-medium text-gray-900 mt-1">{shipment.carrier || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600 text-xs font-semibold uppercase">Status</span>
              <p className="mt-1">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                  shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {shipment.status === 'delivered' ? 'Delivered' : shipment.status === 'in_transit' ? 'In Transit' : 'Pending'}
                </span>
              </p>
            </div>
            <div>
              <span className="text-gray-600 text-xs font-semibold uppercase">Date</span>
              <p className="font-medium text-gray-900 mt-1">{new Date(shipment.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Tracking Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 text-xs font-semibold">Tracking Reference</span>
                <p className="font-mono text-sm font-medium text-gray-900 mt-1">
                  {shipment.trackingReference || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-600 text-xs font-semibold">Tracking Number</span>
                <p className="font-mono text-sm font-medium text-gray-900 mt-1">
                  {shipment.trackingNumber || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {shipment.items && shipment.items.length > 0 && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Items in Shipment</h3>
                <span className="text-xs text-gray-500 font-medium">{shipment.items.length} product(s) included</span>
              </div>
              <div className="space-y-2">
                {shipment.items.map((item: any, idx: number) => {
                  const product = products.find((p: any) => p.id === item.skuId);
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{product?.name || item.skuId}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          SKU: <code className="bg-white px-1 py-0.5 rounded">{item.skuId}</code>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{item.quantity} units</p>
                        {item.price && <p className="text-xs text-gray-600">€{item.price.toFixed(2)}/unit</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OperatorSalesOrders() {
  const navigate = useNavigate();
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    return loadFromLS("salesOrders", MOCK_SALES_ORDERS as any);
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  const [showCreateShipmentModal, setShowCreateShipmentModal] = useState(false);
  const [createShipmentData, setCreateShipmentData] = useState<any>(null);
  const [showShipmentDetailModal, setShowShipmentDetailModal] = useState(false);
  const [selectedShipmentDetail, setSelectedShipmentDetail] = useState<any>(null);
  const [showShipmentPlanner, setShowShipmentPlanner] = useState(false);
  const [shipmentPlannerOrderId, setShipmentPlannerOrderId] = useState<string | null>(null);
  const [shipmentAllocations, setShipmentAllocations] = useState<Record<string, Record<string, number>>>({});

  const shipments = MOCK_SHIPMENTS;

  const stats = useMemo(() => {
    const total = salesOrders.length;
    const fulfilled = salesOrders.filter(o => o.status === 'fulfilled').length;
    const partial = salesOrders.filter(o => o.status === 'partial').length;
    const pending = salesOrders.filter(o => o.status === 'pending').length;
    const overdue = salesOrders.filter(o => {
      if (!o.dueDate) return false;
      return new Date(o.dueDate) < new Date() && o.status !== 'fulfilled';
    }).length;

    return { total, fulfilled, partial, pending, overdue };
  }, [salesOrders]);

  const filteredOrders = useMemo(() => {
    return salesOrders.filter(order => {
      if (filterStatus !== 'all' && order.status !== filterStatus) return false;
      if (query && !order.orderId.toLowerCase().includes(query.toLowerCase()) && 
          !order.buyerName.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [salesOrders, query, filterStatus]);

  const updateOrderStatus = (order: SalesOrder) => {
    const totalOrdered = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalShipped = order.items.reduce((sum, item) => sum + (item.shippedQuantity || 0), 0);

    if (totalShipped === 0) return 'pending';
    if (totalShipped >= totalOrdered) return 'fulfilled';
    return 'partial';
  };

  const handleCreateOrder = (newOrder: SalesOrder) => {
    const updated = [...salesOrders, { ...newOrder, status: updateOrderStatus(newOrder) as any }];
    setSalesOrders(updated);
    saveToLS('salesOrders', updated);
    alert(`Sales Order ${newOrder.orderId} created successfully!`);
  };

  const handleCreateShipment = (newShipment: any, itemsToShip: Array<{ itemIdx: number; quantity: number }>) => {
    if (!createShipmentData?.orderId) return;

    const orderIdx = salesOrders.findIndex((o: any) => o.orderId === createShipmentData.orderId);
    if (orderIdx < 0) return;

    const updated = [...salesOrders];
    const order = updated[orderIdx];

    itemsToShip.forEach(({ itemIdx, quantity }) => {
      const item = order.items[itemIdx];
      item.linkedShipmentIds = [...(item.linkedShipmentIds || []), newShipment.id];
      item.shippedQuantity = (item.shippedQuantity || 0) + quantity;
    });

    setSalesOrders(updated);
    saveToLS('salesOrders', updated);

    const allShipments = loadFromLS('shipments', MOCK_SHIPMENTS);
    saveToLS('shipments', [...allShipments, newShipment]);

    alert(`Shipment ${newShipment.shipmentId} created successfully!`);
    setShowCreateShipmentModal(false);
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Sales Orders"
          description="Manage customer sales orders and track fulfillment"
          onAddNew={() => setShowCreateModal(true)}
          addNewLabel="New Sales Order"
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Total Orders</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Partial</div>
            <div className="text-3xl font-bold text-orange-600 mt-1">{stats.partial}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Fulfilled</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{stats.fulfilled}</div>
          </div>
          <div className="bg-white rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="text-sm text-red-600 font-medium">⚠️ Overdue</div>
            <div className="text-3xl font-bold text-red-600 mt-1">{stats.overdue}</div>
          </div>
        </div>

        {/* Main Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <TableHeader
            title="Sales Orders"
            count={filteredOrders.length}
            query={query}
            setQuery={setQuery}
            status={filterStatus}
            setStatus={setFilterStatus}
            statusOptions={[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'partial', label: 'Partial' },
              { value: 'fulfilled', label: 'Fulfilled' },
            ]}
          />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-900 to-slate-800 border-b-2 border-slate-700">
                <tr>
                  <th className="px-4 py-3 w-12"></th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Seller</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Source of Order</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Buyer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Shipments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No sales orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.flatMap((order) => {
                    const isExpanded = expandedOrderId === order.id;

                    // Compute linked shipments for this order
                    const linkedShipmentsList = shipments.filter(s => 
                      order.items.some(item => item.linkedShipmentIds?.includes(s.id))
                    );

                    const rows: any[] = [
                      <tr key={`order-${order.id}`} className="hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-500">
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-gray-900">
                            {new Date(order.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {new Date(order.createdDate).toLocaleDateString('en-US', { year: '2-digit' })}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailModal(true);
                            }}
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >
                            #{order.orderId}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">
                              {order.sellerCompany || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-600">{order.sellerEmail || '—'}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium text-gray-900">
                            {order.orderSource === 'agent' && `👤 Agent${order.orderSourceValue ? ` — ${order.orderSourceValue}` : ''}`}
                            {order.orderSource === 'operator' && '👨‍💼 Operator'}
                            {order.orderSource === 'owner' && '📋 Owner'}
                            {order.orderSource === 'storefront' && `🛍️ ${order.orderSourceValue || 'Storefront'}`}
                            {!order.orderSource && '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-sm">{getCountryFlag(order.buyerCountry)}</span>
                            <span className="text-xs font-semibold text-gray-900">{order.buyerName}</span>
                          </div>
                          <div className="text-xs text-gray-600">📍 {order.buyerDestination}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-bold text-gray-900">
                            €{(order.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">{order.items.length} items</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1.5">
                            {(() => {
                              const allShipmentIds = new Set<string>();
                              order.items.forEach((item: any) => {
                                (item.linkedShipmentIds || []).forEach((id: string) => allShipmentIds.add(id));
                              });

                              const shipmentArray = Array.from(allShipmentIds).sort();
                              
                              if (shipmentArray.length === 0) {
                                return (
                                  <button
                                    onClick={() => setExpandedOrderId(order.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors"
                                  >
                                    <span>⏱ Pending</span>
                                  </button>
                                );
                              }

                              return shipmentArray.map((shipmentId: string) => {
                                const shipment = shipments?.find(s => s.shipmentId === shipmentId || s.id === shipmentId);
                                const status = shipment?.status || 'pending';
                                
                                const skusInThisShipmentCount = order.items.filter(item => 
                                  item.linkedShipmentIds?.includes(shipmentId) || item.linkedShipmentIds?.includes(shipment?.id || '')
                                ).length;

                                // Safely cast shipment to any to avoid TS error
                                const isMultiItemShipment = skusInThisShipmentCount > 1 || (shipment as any)?.isMultiItem;

                                let icon = '⏱';
                                let bgColor = 'bg-blue-100';
                                let textColor = 'text-blue-800';
                                let hoverColor = 'hover:bg-blue-200';
                                
                                if (status === 'delivered') {
                                  icon = '✓';
                                  bgColor = 'bg-green-100';
                                  textColor = 'text-green-800';
                                  hoverColor = 'hover:bg-green-200';
                                } else if (status === 'in_transit') {
                                  icon = '→';
                                  bgColor = 'bg-orange-100';
                                  textColor = 'text-orange-800';
                                  hoverColor = 'hover:bg-orange-200';
                                }

                                const shipmentNum = shipment?.shipmentId || shipmentId;

                                return (
                                  <button
                                    key={shipmentId}
                                    onClick={() => setExpandedOrderId(order.id)}
                                    className={`flex items-center justify-between gap-1.5 px-2 py-1 rounded text-xs font-semibold w-full ${bgColor} ${textColor} ${hoverColor} cursor-pointer transition-colors`}
                                    title={`Shipment ${shipmentNum} - ${status}`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm">{icon}</span>
                                      <span className="font-mono">{shipmentNum}</span>
                                    </div>
                                    
                                    {isMultiItemShipment && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] bg-white/70 rounded-full font-bold shadow-xs">
                                        <Layers className="w-2.5 h-2.5" />
                                        {skusInThisShipmentCount} SKUs
                                      </span>
                                    )}
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </td>
                      </tr>
                    ];

                    // Accordion subtable section
                    if (isExpanded) {
                      rows.push(
                        <tr key={`accordion-${order.id}`} className="border-t border-gray-100 bg-slate-50">
                          <td colSpan={7} className="p-4 md:p-6 space-y-6">
                            
                            {/* Subtable 1: Order Items / SKUs */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
                              <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Package size={16} className="text-blue-600" />
                                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    SKUs & Line Items ({order.items.length})
                                  </h4>
                                </div>
                                <button
                                  onClick={() => {
                                    setCreateShipmentData({ orderId: order.orderId });
                                    setShowCreateShipmentModal(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
                                >
                                  <Plus size={14} /> Create Shipment
                                </button>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200 font-semibold">
                                    <tr>
                                      <th className="px-4 py-2.5">SKU ID / Product</th>
                                      <th className="px-4 py-2.5 text-center">Warehouse</th>
                                      <th className="px-4 py-2.5 text-center">Ordered</th>
                                      <th className="px-4 py-2.5 text-center">Shipped</th>
                                      <th className="px-4 py-2.5 text-center">Pending</th>
                                      <th className="px-4 py-2.5 text-right">Price</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {order.items.map((item, idx) => {
                                      const prod = products.find(p => p.id === item.skuId);
                                      const shipped = item.shippedQuantity || 0;
                                      const pending = Math.max(0, item.quantity - shipped);

                                      return (
                                        <tr key={idx} className="hover:bg-gray-50">
                                          <td className="px-4 py-2.5">
                                            <div className="font-semibold text-gray-900">{prod?.name || item.skuId}</div>
                                            <code className="text-[10px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">{item.skuId}</code>
                                          </td>
                                          <td className="px-4 py-2.5 text-center text-gray-600">{item.warehouse || '—'}</td>
                                          <td className="px-4 py-2.5 text-center font-medium text-gray-900">{item.quantity}</td>
                                          <td className="px-4 py-2.5 text-center font-medium text-green-600">{shipped}</td>
                                          <td className="px-4 py-2.5 text-center font-medium">
                                            <span className={`px-2 py-0.5 rounded-full ${pending > 0 ? 'bg-orange-100 text-orange-800 font-bold' : 'bg-green-100 text-green-800'}`}>
                                              {pending}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                                            {item.price ? `€${item.price.toFixed(2)}` : '—'}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Subtable 2: Associated Shipments */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
                              <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Truck size={16} className="text-blue-600" />
                                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    Associated Shipments ({linkedShipmentsList.length})
                                  </h4>
                                </div>
                                <button
                                  onClick={() => {
                                    setShipmentPlannerOrderId(order.orderId);
                                    setShowShipmentPlanner(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 text-white rounded text-xs font-semibold hover:bg-gray-900 transition-colors"
                                >
                                  <Layers size={14} /> Shipment Planner Matrix
                                </button>
                              </div>

                              {linkedShipmentsList.length === 0 ? (
                                <div className="p-4 text-center text-xs text-gray-500">
                                  No shipments created for this order yet.
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200 font-semibold">
                                      <tr>
                                        <th className="px-4 py-2.5">Shipment ID</th>
                                        <th className="px-4 py-2.5">Carrier</th>
                                        <th className="px-4 py-2.5">Tracking Ref</th>
                                        <th className="px-4 py-2.5 text-center">Units</th>
                                        <th className="px-4 py-2.5 text-center">Status</th>
                                        <th className="px-4 py-2.5 text-right">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {linkedShipmentsList.map((shp) => (
                                        <tr key={shp.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-2.5 font-bold text-blue-600 font-mono">
                                            {shp.shipmentId}
                                          </td>
                                          <td className="px-4 py-2.5 text-gray-800 font-medium">{shp.carrier}</td>
                                          <td className="px-4 py-2.5 font-mono text-gray-600">{shp.trackingReference || '—'}</td>
                                          <td className="px-4 py-2.5 text-center font-bold text-gray-900">{shp.units || '—'}</td>
                                          <td className="px-4 py-2.5 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                              shp.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                              shp.status === 'in_transit' ? 'bg-orange-100 text-orange-800' :
                                              'bg-blue-100 text-blue-800'
                                            }`}>
                                              {shp.status}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2.5 text-right">
                                            <button
                                              onClick={() => {
                                                setSelectedShipmentDetail(shp);
                                                setShowShipmentDetailModal(true);
                                              }}
                                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs"
                                            >
                                              <Eye size={12} /> View Details
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>

                          </td>
                        </tr>
                      );
                    }

                    return rows;
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateSalesOrderModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSave={handleCreateOrder} />
      {selectedOrder && <SalesOrderDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} order={selectedOrder} />}
      <CreateShipmentModal isOpen={showCreateShipmentModal} onClose={() => setShowCreateShipmentModal(false)} onSave={handleCreateShipment} data={createShipmentData} salesOrders={salesOrders} />
      <ShipmentDetailModal isOpen={showShipmentDetailModal} onClose={() => setShowShipmentDetailModal(false)} shipment={selectedShipmentDetail} />
      {shipmentPlannerOrderId && (
        <ShipmentPlannerModal 
          isOpen={showShipmentPlanner} 
          onClose={() => {
            setShowShipmentPlanner(false);
            setShipmentPlannerOrderId(null);
          }} 
          order={salesOrders.find((o: any) => o.orderId === shipmentPlannerOrderId)}
          salesOrders={salesOrders}
          shipments={shipments}
          allocations={shipmentAllocations}
          setAllocations={setShipmentAllocations}
          onCreateShipment={(data: any) => {
            setCreateShipmentData(data);
            setShowCreateShipmentModal(true);
            setShowShipmentPlanner(false);
          }}
        />
      )}
    </>
  );
}