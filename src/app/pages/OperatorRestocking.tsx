import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import TableHeader from '../components/TableHeader';
import QuickActions from '../components/QuickActions';
import PageHeader from '../components/PageHeader';
import { Plus, X, ChevronDown, ChevronUp, Truck, Package, TrendingUp } from 'lucide-react';
import { loadFromLS, saveToLS, type RestockingOrder, generateRestockingId } from '../utils/workflowHelpers';
import { products, COMPANIES } from '../data/mockData';
import { writeCollection } from '../../lib/backend/storage';

// Create/Edit Restocking Order Modal
function CreateRestockingOrderModal({ isOpen, onClose, onSave, editingOrder }: any) {
  const [productSku, setProductSku] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [warehouse, setWarehouse] = useState('Rotterdam WH');
  const [requestedDate, setRequestedDate] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'awaiting' | 'received' | 'rejected'>('pending');

  useEffect(() => {
    if (editingOrder) {
      setProductSku(editingOrder.sku);
      setQuantity(editingOrder.qty);
      setWarehouse(editingOrder.warehouse);
      setRequestedDate(editingOrder.requestedDate);
      setCompany(editingOrder.company);
      setNotes(editingOrder.notes || '');
      setStatus(editingOrder.status);
    } else {
      setProductSku('');
      setQuantity(0);
      setWarehouse('Rotterdam WH');
      setRequestedDate('');
      setCompany('');
      setNotes('');
      setStatus('pending');
    }
  }, [editingOrder, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!productSku || !quantity || !company || !requestedDate) {
      alert('Please fill in all required fields');
      return;
    }

    const product = products.find(p => p.id === productSku);
    const productName = product?.name || productSku;

    onSave({
      sku: productSku,
      product: productName,
      qty: quantity,
      warehouse,
      requestedDate,
      company,
      notes,
      status,
    });

    // Reset form
    setProductSku('');
    setQuantity(0);
    setWarehouse('Rotterdam WH');
    setRequestedDate('');
    setCompany('');
    setNotes('');
    setStatus('pending');
    onClose();
  };

  const warehouses = ['Rotterdam WH', 'Madrid WH', 'Lisbon WH', 'Valencia WH', 'Seville WH'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {editingOrder ? 'Edit Restocking Order' : 'Create Restocking Order'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Company --</option>
              {COMPANIES.map(c => (
                <option key={c.companyId} value={c.shortName}>{c.shortName}</option>
              ))}
            </select>
          </div>

          {/* Product SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product SKU *</label>
            <select
              value={productSku}
              onChange={(e) => setProductSku(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (units) *</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse *</label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {warehouses.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Requested Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requested Date *</label>
            <input
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="awaiting">Awaiting Shipment</option>
              <option value="received">Received</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            {editingOrder ? 'Update' : 'Create'} Order
          </button>
        </div>
      </div>
    </div>
  );
}

const MOCK_RESTOCKING_ORDERS = [
  {
    id: 'RST-2026-001',
    date: '2026-06-20',
    company: 'RoastCo',
    sku: 'GC-ETH-001-60KG',
    product: 'Ethiopian — 60kg',
    qty: 50,
    warehouse: 'Rotterdam WH',
    requestedDate: '2026-07-15',
    status: 'approved' as const,
    notes: 'Standard monthly restock',
    linkedShipmentIds: ['SHP-0001'],
    linkedTransformations: [],
  },
  {
    id: 'RST-2026-002',
    date: '2026-06-18',
    company: 'Espresso Italia',
    sku: 'RC-COL-001-1KG',
    product: 'Colombian — 1kg',
    qty: 200,
    warehouse: 'Madrid WH',
    requestedDate: '2026-07-10',
    status: 'received' as const,
    notes: 'Urgent restock - low inventory',
    linkedShipmentIds: ['SHP-0002', 'SHP-0003'],
    linkedTransformations: [],
  },
  {
    id: 'RST-2026-003',
    date: '2026-06-22',
    company: 'Nordic Coffee',
    sku: 'GC-KEN-001-60KG',
    product: 'Kenyan — 60kg',
    qty: 75,
    warehouse: 'Valencia WH',
    requestedDate: '2026-07-20',
    status: 'pending' as const,
    notes: '',
    linkedShipmentIds: [],
    linkedTransformations: [],
  },
  {
    id: 'RST-2026-004',
    date: '2026-06-15',
    company: 'Café Berlin',
    sku: 'RC-BRA-001-1KG',
    product: 'Brazilian — 1kg',
    qty: 100,
    warehouse: 'Lisbon WH',
    requestedDate: '2026-07-05',
    status: 'awaiting' as const,
    notes: 'In transit from supplier',
    linkedShipmentIds: ['SHP-0004'],
    linkedTransformations: [],
  },
];

export default function OperatorRestocking() {
  const [restockingOrders, setRestockingOrders] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [openShipment, setOpenShipment] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const saved = localStorage.getItem('marketsell_restocking_orders');
    if (saved && saved.length > 0) {
      setRestockingOrders(JSON.parse(saved));
    } else {
      // Load mock data on first load
      setRestockingOrders(MOCK_RESTOCKING_ORDERS);
      writeCollection('marketsell_restocking_orders', MOCK_RESTOCKING_ORDERS);
    }
  }, []);

  const stats = useMemo(() => {
    const total = restockingOrders.length;
    const pending = restockingOrders.filter(o => o.status === 'pending').length;
    const approved = restockingOrders.filter(o => o.status === 'approved').length;
    const awaiting = restockingOrders.filter(o => o.status === 'awaiting').length;
    const received = restockingOrders.filter(o => o.status === 'received').length;

    return { total, pending, approved, awaiting, received };
  }, [restockingOrders]);

  const filteredOrders = useMemo(() => {
    return restockingOrders.filter(order => {
      if (filterStatus !== 'all' && order.status !== filterStatus) return false;
      if (query && !order.id?.toLowerCase().includes(query.toLowerCase()) && 
          !order.company?.toLowerCase().includes(query.toLowerCase()) &&
          !order.product?.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [restockingOrders, query, filterStatus]);

  const handleCreateOrder = (formData: any) => {
    const newOrder = {
      id: generateRestockingId(),
      date: new Date().toISOString().split('T')[0],
      ...formData,
      linkedShipmentIds: [],
      linkedTransformations: [],
    };

    const updated = [...restockingOrders, newOrder];
    setRestockingOrders(updated);
    writeCollection('marketsell_restocking_orders', updated);
  };

  const handleUpdateOrder = (formData: any) => {
    const updated = restockingOrders.map(o =>
      o.id === editingOrder.id ? { ...o, ...formData } : o
    );
    setRestockingOrders(updated);
    writeCollection('marketsell_restocking_orders', updated);
    setEditingOrder(null);
  };

  const handleDeleteOrder = (id: string) => {
    const order = restockingOrders.find(o => o.id === id);
    if (!order) return;

    // Only allow deletion if order is in pending status
    if (order.status !== 'pending') {
      alert('Cannot delete. This restocking order has already been processed. Only pending orders can be deleted.');
      return;
    }

    if (confirm('Delete this restocking order?')) {
      const updated = restockingOrders.filter(o => o.id !== id);
      setRestockingOrders(updated);
      writeCollection('marketsell_restocking_orders', updated);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'awaiting':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'awaiting':
        return 'Awaiting Shipment';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
      <div className="space-y-6">
        <PageHeader
          title="Restocking Orders"
          description="Manage supplier restocking orders and track fulfillment"
          onAddNew={() => {
            setEditingOrder(null);
            setShowCreateModal(true);
          }}
          addNewLabel="New Restocking Order"
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Total Orders</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-2">All restocking orders</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</div>
            <div className="text-xs text-gray-500 mt-2">Awaiting approval</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-3xl font-bold text-purple-600 mt-1">{stats.approved}</div>
            <div className="text-xs text-gray-500 mt-2">Approved orders</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Awaiting</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">{stats.awaiting}</div>
            <div className="text-xs text-gray-500 mt-2">In transit</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Received</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{stats.received}</div>
            <div className="text-xs text-gray-500 mt-2">Received & stocked</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <TableHeader
            title="Restocking Orders"
            count={filteredOrders.length}
            query={query}
            setQuery={setQuery}
            status={filterStatus}
            setStatus={setFilterStatus}
            statusOptions={[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'awaiting', label: 'Awaiting Shipment' },
              { value: 'received', label: 'Received' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 w-12"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product (SKU)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Req. Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                      No restocking orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;

                    return (
                      <React.Fragment key={order.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">{order.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{order.company}</td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{order.product}</div>
                            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{order.sku}</code>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">{order.qty}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{order.warehouse}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{order.requestedDate}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2 flex">
                            <button
                              onClick={() => {
                                setEditingOrder(order);
                                setShowCreateModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                              title="Edit order"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                              title="Delete order"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={10} className="px-6 py-0 bg-[#F5F7FA]">
                              <div className="py-4 space-y-2">
                                {/* Order Details */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                                    <Package className="w-4 h-4 text-blue-600" /> Order Details
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">SKU</span>
                                      <div className="font-medium mt-0.5">{order.sku}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Quantity</span>
                                      <div className="font-medium mt-0.5">{order.qty} units</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Warehouse</span>
                                      <div className="font-medium mt-0.5">{order.warehouse}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Requested Date</span>
                                      <div className="font-medium mt-0.5">{order.requestedDate}</div>
                                    </div>
                                  </div>
                                  {order.notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                      <p className="text-xs text-gray-600"><span className="font-medium">Notes:</span> {order.notes}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Shipments Section */}
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                  <div className="px-4 py-3 flex items-center gap-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
                                    <Truck className="w-4 h-4 text-blue-600" />
                                    Shipments ({(order.linkedShipmentIds || []).length})
                                  </div>
                                  {(order.linkedShipmentIds || []).length === 0 ? (
                                    <p className="px-4 py-3 text-sm text-gray-400">No shipments linked yet.</p>
                                  ) : (
                                    <p className="px-4 py-3 text-sm text-gray-600">{(order.linkedShipmentIds || []).length} shipment(s) associated with this order.</p>
                                  )}
                                </div>

                                {/* Transformations Section */}
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                  <div className="px-4 py-3 flex items-center gap-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
                                    <TrendingUp className="w-4 h-4 text-purple-600" />
                                    Transformations ({(order.linkedTransformations || []).length})
                                  </div>
                                  {(order.linkedTransformations || []).length === 0 ? (
                                    <p className="px-4 py-3 text-sm text-gray-400">No transformations applied yet.</p>
                                  ) : (
                                    <p className="px-4 py-3 text-sm text-gray-600">{(order.linkedTransformations || []).length} transformation(s) applied to this order.</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <CreateRestockingOrderModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingOrder(null);
          }}
          onSave={editingOrder ? handleUpdateOrder : handleCreateOrder}
          editingOrder={editingOrder}
        />
      </div>
  );
}
