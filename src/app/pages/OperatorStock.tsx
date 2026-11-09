import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DashboardLayout } from '../components/DashboardLayout';
import { products, stockMovements } from '../data/mockData';
import TableHeader from '../components/TableHeader';
import PageHeader from '../components/PageHeader';
import { Edit, Plus, ChevronDown, ChevronUp, X, Calendar, Package, Link as LinkIcon } from 'lucide-react';
import { loadFromLS, saveToLS, type Shipment, type TransformationOrder, type StockMovement, generateShipmentId, generateTransformationId, generateStockMovementId } from '../utils/workflowHelpers';

// Stock Movement Detail Modal Component
function StockMovementDetailModal({ movement, product, isOpen, onClose, onNavigate }: any) {
  if (!isOpen || !movement || !product) return null;

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'INITIAL_INVENTORY': return 'Initial Inventory';
      case 'GOODS_RECEIPT_FROM_RESTOCK': return 'Goods receipt from re-stock order';
      case 'GOODS_RECEIPT_FROM_RETURN': return 'Goods receipt from return';
      case 'GOODS_ISSUE_TO_TRANSFORMATION': return 'Goods issue to transformation order';
      case 'GOODS_ISSUE_TO_SALES': return 'Goods issue to Sales Order';
      case 'INVENTORY_CORRECTION': return 'Inventory Correction';
      default: return type;
    }
  };

  const movementType = getMovementTypeLabel(movement.type);
  
  const isIncrement = movement.quantityUnits > 0;
  const sign = isIncrement ? '+' : '−';
  
  const getTypeColors = (type: string) => {
    if (['INITIAL_INVENTORY', 'GOODS_RECEIPT_FROM_RESTOCK', 'GOODS_RECEIPT_FROM_RETURN'].includes(type)) {
      return { bg: 'bg-green-50', text: 'text-green-800' };
    } else if (['GOODS_ISSUE_TO_TRANSFORMATION', 'GOODS_ISSUE_TO_SALES'].includes(type)) {
      return { bg: 'bg-red-50', text: 'text-red-800' };
    } else {
      return { bg: 'bg-yellow-50', text: 'text-yellow-800' };
    }
  };

  const { bg: bgColor, text: textColor } = getTypeColors(movement.type);
  
  const getBadgeColors = (type: string) => {
    if (['INITIAL_INVENTORY', 'GOODS_RECEIPT_FROM_RESTOCK', 'GOODS_RECEIPT_FROM_RETURN'].includes(type)) {
      return 'bg-green-100';
    } else if (['GOODS_ISSUE_TO_TRANSFORMATION', 'GOODS_ISSUE_TO_SALES'].includes(type)) {
      return 'bg-red-100';
    } else {
      return 'bg-yellow-100';
    }
  };
  
  const badgeBg = getBadgeColors(movement.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Stock Movement Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Movement Type Badge */}
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${badgeBg} ${textColor}`}>
              {movementType}
            </span>
          </div>

          {/* Product Info */}
          <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package size={18} className="text-blue-600" />
              Product Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">SKU ID:</span>
                <span className="text-gray-900 font-mono font-medium">{product.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SKU Name:</span>
                <span className="text-gray-900 font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Producer:</span>
                <span className="text-gray-900">{product.owner}</span>
              </div>
            </div>
          </div>

          {/* Movement Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className={`text-3xl font-bold ${isIncrement ? 'text-green-600' : 'text-red-600'}`}>
                {sign} {Math.abs(movement.quantityUnits)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Units in [kg]</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <div className="flex items-center gap-2 text-gray-900">
                <Calendar size={16} className="text-gray-500" />
                {new Date(movement.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <p className="text-xs text-gray-500 mt-1">{new Date(movement.date).toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Location & Operation Info */}
          <div className={`${bgColor} rounded-lg p-4 border-l-4 ${textColor}`}>
            <h3 className="font-semibold text-gray-900 mb-3">Operation Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Warehouse:</span>
                <span className="text-gray-900 font-medium">{movement.warehouseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Link/Reference:</span>
                <span className="text-gray-900 font-mono">{movement.linkedToId || '—'}</span>
              </div>
              {movement.linkedToType && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Related to:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${movement.linkedToType === 'SHIPMENT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {movement.linkedToType === 'SHIPMENT' ? 'Shipment' : 'Transformation Order'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Destination / Details */}
          <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
            <h3 className="font-semibold text-gray-900 mb-3">Destination / Details</h3>
            <div className="text-sm">
              {movement.type === 'INITIAL_INVENTORY' && (
                <p className="text-gray-700"><span className="font-medium">Added to Stock:</span> {movement.warehouseId}</p>
              )}
              {movement.type === 'GOODS_RECEIPT_FROM_RESTOCK' && (
                <p className="text-gray-700"><span className="font-medium">Restocked:</span> {movement.warehouseId}</p>
              )}
              {movement.type === 'GOODS_RECEIPT_FROM_RETURN' && (
                <p className="text-gray-700"><span className="font-medium">Return Received:</span> {movement.warehouseId}</p>
              )}
              {movement.type === 'GOODS_ISSUE_TO_TRANSFORMATION' && (
                <p className="text-gray-700"><span className="font-medium">Transformation Order:</span> {movement.linkedToId || 'N/A'}</p>
              )}
              {movement.type === 'GOODS_ISSUE_TO_SALES' && (
                <p className="text-gray-700"><span className="font-medium">Client/Buyer:</span> {movement.linkedToId || 'N/A'}</p>
              )}
              {movement.type === 'INVENTORY_CORRECTION' && (
                <p className="text-gray-700"><span className="font-medium">Type:</span> Inventory Adjustment</p>
              )}
            </div>
          </div>

          {/* Comments */}
          {movement.comment && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-700">{movement.comment}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Close
          </button>
          {movement.linkedToId && (
            <button
              onClick={() => {
                onNavigate(movement);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={16} /> View in New Tab
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Stock Movement Modal
function CreateStockMovementModal({ isOpen, onClose, product }: any) {
  const [selectedSKU, setSelectedSKU] = useState<string>('');
  const [movementType, setMovementType] = useState<string>('INITIAL_INVENTORY');
  const [quantity, setQuantity] = useState<number>(0);
  const [warehouse, setWarehouse] = useState<string>('WH-A-001');
  const [notes, setNotes] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');

  // Pre-select product when modal opens
  React.useEffect(() => {
    if (isOpen && product?.id) {
      setSelectedSKU(product.id);
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleCreateMovement = () => {
    if (!selectedSKU || quantity === 0) {
      alert('Please select a SKU and enter a quantity');
      return;
    }

    // Determine quantity sign based on movement type
    // RECEIPTS: positive (stock coming in)
    // ISSUES: negative (stock going out)
    // CORRECTIONS: can be either
    // INITIAL: positive
    let quantityValue = Math.abs(quantity);
    
    if (['GOODS_RECEIPT_FROM_RESTOCK', 'GOODS_RECEIPT_FROM_RETURN', 'INITIAL_INVENTORY', 'GOODS_IN'].includes(movementType)) {
      quantityValue = Math.abs(quantity); // Positive for receipts/incoming
    } else if (['GOODS_ISSUE_TO_TRANSFORMATION', 'GOODS_ISSUE_TO_SALES', 'GOODS_OUT'].includes(movementType)) {
      quantityValue = -Math.abs(quantity); // Negative for issues/outgoing
    } else if (movementType === 'INVENTORY_CORRECTION') {
      // For corrections, use the signed value (user can enter + or -)
      quantityValue = quantity;
    }
    
    const newMovement: StockMovement = {
        id: generateStockMovementId(),
        skuId: selectedSKU,
        date: new Date().toISOString(),
        type: movementType as any,
        quantityUnits: quantityValue,
        warehouseId: warehouse,
        referenceNumber: referenceNumber || undefined,
        linkedToType: null,
        linkedToId: undefined,
        comment: notes,
        companyId: ''
    };

    const existingMovements = loadFromLS('stockMovements', []);
    const updatedMovements = [...existingMovements, newMovement];
    saveToLS('stockMovements', updatedMovements);

    // If this is a Sales Order issue, automatically create a linked shipment
    if (movementType === 'GOODS_ISSUE_TO_SALES') {
      const newShipment: Shipment = {
        id: generateShipmentId(),
        shipmentId: `SHP-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        date: new Date().toISOString(),
        from: warehouse,
        to: referenceNumber || 'To Be Determined',
        carrier: 'Pending',
        status: 'pending',
        items: [{ skuId: selectedSKU, quantity: Math.abs(quantityValue) }],
        relatedMovementId: newMovement.id,
        comment: notes,
      };

      // Update movement to link to shipment
      newMovement.linkedToType = 'SHIPMENT';
      newMovement.linkedToId = newShipment.id;

      const existingShipments = loadFromLS('shipments', []);
      saveToLS('shipments', [...existingShipments, newShipment]);
      
      // Update the movements array with the linked movement
      updatedMovements[updatedMovements.length - 1] = newMovement;
      saveToLS('stockMovements', updatedMovements);
      
      alert(`Stock movement and shipment created successfully! Shipment: ${newShipment.shipmentId}`);
    } else if (movementType === 'GOODS_ISSUE_TO_TRANSFORMATION') {
      // Future: link to transformation order
      alert(`Stock movement for transformation created successfully! (Transformation order linking coming soon)`);
    } else {
      alert(`${movementType === 'INITIAL_INVENTORY' ? 'Initial inventory' : 'Stock movement'} created successfully!`);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-lg">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Stock Movement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* SKU Selection - TOP PRIORITY */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📦 Product *</label>
            <select
              value={selectedSKU}
              onChange={(e) => setSelectedSKU(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">-- Select Product --</option>
              {products.map(prod => (
                <option key={prod.id} value={prod.id}>{prod.name} ({prod.id})</option>
              ))}
            </select>
          </div>

          {/* Movement Type - DROPDOWN */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📋 Movement Type *</label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="INITIAL_INVENTORY">🆕 Initial Inventory</option>
              <option value="GOODS_RECEIPT_FROM_RESTOCK">📥 Goods Receipt from Re-stock Order</option>
              <option value="GOODS_RECEIPT_FROM_RETURN">📥 Goods Receipt from Return</option>
              <option value="GOODS_ISSUE_TO_TRANSFORMATION">� Goods Issue to Transformation Order</option>
              <option value="GOODS_ISSUE_TO_SALES">📤 Goods Issue to Sales Order</option>
              <option value="INVENTORY_CORRECTION">⚠️ Inventory Correction</option>
            </select>
          </div>

          {/* Reference Number - Conditional with Search Capability */}
          {['GOODS_RECEIPT_FROM_RESTOCK', 'GOODS_RECEIPT_FROM_RETURN', 'GOODS_ISSUE_TO_TRANSFORMATION', 'GOODS_ISSUE_TO_SALES'].includes(movementType) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {movementType === 'GOODS_RECEIPT_FROM_RESTOCK' ? 'Re-stock Order #' :
                 movementType === 'GOODS_RECEIPT_FROM_RETURN' ? 'Sales Order #' :
                 movementType === 'GOODS_ISSUE_TO_TRANSFORMATION' ? 'Transformation Order #' :
                 'Sales Order #'}
              </label>
              <input
                type="text"
                placeholder="Enter or search order number"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Two Column Layout for Quantity & Warehouse */}
          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qty (Units) *</label>
              <input
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="WH-A-001">WH-A-001 (San Salvador)</option>
                <option value="WH-B-002">WH-B-002 (Bogotá)</option>
                <option value="WH-C-003">WH-C-003 (São Paulo)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              placeholder="Add any comments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateMovement}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Movement
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Related Order Modal
function CreateRelatedOrderModal({ isOpen, onClose, movement, product }: any) {
  const [orderType, setOrderType] = useState<'shipment' | 'transformation'>('shipment');
  const [shipmentData, setShipmentData] = useState({
    carrier: '',
    toLocation: '',
    notes: '',
  });
  const [transformationData, setTransformationData] = useState({
    transformationType: 'Blending',
    outputSKU: '',
    notes: '',
  });

  if (!isOpen || !movement || !product) return null;

  const handleCreateShipment = () => {
    const shipment: Shipment = {
      id: generateShipmentId(),
      shipmentId: `SHP-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      date: new Date().toISOString(),
      from: movement.warehouseId,
      to: shipmentData.toLocation,
      carrier: shipmentData.carrier,
      status: 'pending',
      items: [{ skuId: product.id, quantity: Math.abs(movement.quantityUnits) }],
      relatedMovementId: movement.id,
      comment: shipmentData.notes,
    };
    
    const existingShipments = loadFromLS('shipments', []);
    saveToLS('shipments', [...existingShipments, shipment]);
    alert(`Shipment ${shipment.shipmentId} created successfully!`);
    onClose();
  };

  const handleCreateTransformation = () => {
    const transformation: TransformationOrder = {
      id: generateTransformationId(),
      orderId: `TRF-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      date: new Date().toISOString(),
      type: transformationData.transformationType as any,
      status: 'pending',
      inputItems: [{ skuId: product.id, quantity: Math.abs(movement.quantityUnits) }],
      outputItems: [{ skuId: transformationData.outputSKU || product.id, quantity: Math.abs(movement.quantityUnits) }],
      relatedMovementId: movement.id,
      comment: transformationData.notes,
    };
    
    const existingTransformations = loadFromLS('transformations', []);
    saveToLS('transformations', [...existingTransformations, transformation]);
    alert(`Transformation ${transformation.orderId} created successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-lg">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create Related Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Order Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setOrderType('shipment')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  orderType === 'shipment'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                📦 Shipment
              </button>
              <button
                onClick={() => setOrderType('transformation')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  orderType === 'transformation'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                ⚙️ Transformation
              </button>
            </div>
          </div>

          {/* Movement Info Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Linked Movement:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Product:</span>
                <p className="text-gray-900 font-medium">{product.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Quantity:</span>
                <p className="text-gray-900 font-medium">{Math.abs(movement.quantityUnits)} units</p>
              </div>
            </div>
          </div>

          {/* Shipment Form */}
          {orderType === 'shipment' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                <input
                  type="text"
                  placeholder="e.g., FedEx, DHL, Local Courier"
                  value={shipmentData.carrier}
                  onChange={(e) => setShipmentData(d => ({ ...d, carrier: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ship To Location</label>
                <input
                  type="text"
                  placeholder="Destination address or warehouse"
                  value={shipmentData.toLocation}
                  onChange={(e) => setShipmentData(d => ({ ...d, toLocation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  placeholder="Additional shipment details..."
                  value={shipmentData.notes}
                  onChange={(e) => setShipmentData(d => ({ ...d, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Transformation Form */}
          {orderType === 'transformation' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transformation Type</label>
                <select
                  value={transformationData.transformationType}
                  onChange={(e) => setTransformationData(d => ({ ...d, transformationType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['Blending', 'Bottling', 'Packaging', 'Labeling', 'Fermentation', 'Aging'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Output SKU (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave blank to use same SKU"
                  value={transformationData.outputSKU}
                  onChange={(e) => setTransformationData(d => ({ ...d, outputSKU: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  placeholder="Transformation details..."
                  value={transformationData.notes}
                  onChange={(e) => setTransformationData(d => ({ ...d, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={orderType === 'shipment' ? handleCreateShipment : handleCreateTransformation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create {orderType === 'shipment' ? 'Shipment' : 'Transformation'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OperatorStock() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showCreateMovementModal, setShowCreateMovementModal] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const statuses = Array.from(new Set(products.map(p => p.status)));
  const warehouses = Array.from(new Set(products.map(p => p.warehouse)));

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      (filterStatus === 'all' || p.status === filterStatus) &&
      (search === '' || p.id.toLowerCase().includes(search.toLowerCase()) ||
       p.name.toLowerCase().includes(search.toLowerCase()) ||
       p.owner.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, filterStatus]);

  const handleMovementClick = (movement: any, product: any) => {
    setSelectedMovement(movement);
    setSelectedProduct(product);
    setShowMovementModal(true);
  };

  const handleNavigateToMovement = (movement: any) => {
    const href = movement.linkedToType === 'TRANSFORMATION_ORDER' 
      ? `/operator/transformations#${movement.linkedToId}`
      : movement.linkedToType === 'SHIPMENT'
      ? `/operator/shipments#${movement.linkedToId}`
      : null;
    if (href) window.open(href, '_blank');
  };

  return (
      <div className="space-y-6">
        <PageHeader
          title="Stock"
          description="Monitor inventory across warehouses and locations"
          onAddNew={() => {
                            setSelectedMovement(null);
                            setSelectedProduct(null);
                            setShowCreateMovementModal(true);
                        }}
          addNewLabel="New Stock Movement"
        />

        {/* Status filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
            {['all', ...statuses].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-[#0B1F3A] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button onClick={() => { setSearch(''); setFilterStatus('all'); }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
            <div className="text-sm text-gray-600">Total SKUs</div>
            <div className="text-2xl font-bold text-gray-900">{filteredProducts.length}</div>
            <div className="text-xs text-gray-500 mt-1">All stock items</div>
          </button>
          <button onClick={() => { setSearch(''); setFilterStatus('selling'); }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
            <div className="text-sm text-gray-600">Selling</div>
            <div className="text-2xl font-bold text-green-600">{filteredProducts.filter(p => p.status === 'selling').length}</div>
            <div className="text-xs text-gray-500 mt-1">Active inventory</div>
          </button>
          <button onClick={() => { setSearch(''); setFilterStatus('pending'); }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
            <div className="text-sm text-gray-600">Warehouses</div>
            <div className="text-2xl font-bold text-orange-600">{warehouses.length}</div>
            <div className="text-xs text-gray-500 mt-1">Warehouse locations</div>
          </button>
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="text-sm text-gray-600">Movements</div>
            <div className="text-2xl font-bold text-blue-600">{stockMovements.length}</div>
            <div className="text-xs text-gray-500 mt-1">Total transactions</div>
          </div>
        </div>

        {/* Table header + table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <TableHeader
            title="Stock Inventory"
            count={filteredProducts.length}
            query={search}
            setQuery={setSearch}
            status={filterStatus}
            setStatus={setFilterStatus}
            statusOptions={statuses.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
          />
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-12"></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 sticky left-0 z-10 bg-gray-50">SKU ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">SKU Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Owner</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Stock (units)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Warehouse</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Lot Number</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 sticky right-0 z-10 bg-gray-50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, idx) => {
                    const isExpanded = expandedProductId === String(product.id);
                    return (
                      <React.Fragment key={idx}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setExpandedProductId(prev => prev === String(product.id) ? null : String(product.id))}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 sticky left-0 z-10 bg-white hover:bg-gray-50 font-mono font-semibold">{product.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{product.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{product.owner}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{product.stock.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{product.warehouse}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">{product.lot}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              product.status === 'selling' ? 'bg-green-100 text-green-800' :
                              product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm sticky right-0 z-10 bg-white hover:bg-gray-50">
                            <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                              <Edit size={16} />
                              Edit
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={9} className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-sm font-semibold text-gray-700">Activity Log</p>
                                  <button
                                    onClick={() => {
                                      setSelectedMovement(null);
                                      setSelectedProduct(product);
                                      setShowCreateMovementModal(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-xs font-medium"
                                    title="Add new stock movement"
                                  >
                                    <Plus size={14} />
                                    Add Movement
                                  </button>
                                </div>
                                {(() => {
                                  const relevantMovements = stockMovements
                                    .filter(m => m.skuId === product.id)
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                                  
                                  // Calculate remaining units from last operation
                                  let remainingUnits = 0;
                                  if (relevantMovements.length > 0) {
                                    const lastMovement = relevantMovements[0];
                                    remainingUnits = Math.abs(lastMovement.quantityUnits);
                                  } else {
                                    remainingUnits = product.stock;
                                  }
                                  
                                  if (relevantMovements.length === 0) {
                                    return (
                                      <div className="text-xs text-gray-500">No activity recorded for this product. Current stock: {product.stock} units</div>
                                    );
                                  }
                                  
                                  return (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Date</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Type</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Units</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Document</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Link</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Description</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Comment</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {relevantMovements.map(movement => {
                                            const date = new Date(movement.date);
                                            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
                                            
                                            // Map movement types to display labels (simplified for Type column)
                                            const typeLabels: Record<string, string> = {
                                              'INITIAL_INVENTORY': 'Initial Inventory',
                                              'GOODS_RECEIPT_FROM_RESTOCK': 'Goods In',
                                              'GOODS_RECEIPT_FROM_RETURN': 'Goods In',
                                              'GOODS_ISSUE_TO_TRANSFORMATION': 'Goods Out',
                                              'GOODS_ISSUE_TO_SALES': 'Goods Out',
                                              'INVENTORY_CORRECTION': 'Inventory Correction'
                                            };
                                            
                                            const movementType = typeLabels[movement.type] || movement.type;
                                            
                                            // Determine if this is a receipt movement
                                            const isReceiptMovement = movement.type === 'GOODS_RECEIPT_FROM_RESTOCK' || movement.type === 'GOODS_RECEIPT_FROM_RETURN';
                                            const receiptLabel = isReceiptMovement 
                                              ? (movement.type === 'GOODS_RECEIPT_FROM_RESTOCK' ? 'Receipt from Re-stock Order' : 'Receipt from Return')
                                              : '-';
                                            
                                            // Function to download receipt
                                            const downloadReceipt = () => {
                                              if (!isReceiptMovement) return;
                                              
                                              // Create receipt content
                                              const receiptContent = `RECEIPT DOCUMENT
                                                =====================================
                                                Date: ${dateStr}
                                                Receipt Type: ${receiptLabel}
                                                SKU: ${product.id} - ${product.name}
                                                Quantity: ${Math.abs(movement.quantityUnits)} units
                                                Warehouse: ${movement.warehouseId}
                                                Reference: ${movement.referenceNumber || 'N/A'}
                                                Linked ID: ${movement.linkedToId || 'N/A'}
                                                Comment: ${movement.comment || 'N/A'}
                                                =====================================`;
                                              
                                              // Create and trigger download
                                              const element = document.createElement('a');
                                              element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
                                              element.setAttribute('download', `Receipt_${product.id}_${movement.id}.txt`);
                                              element.style.display = 'none';
                                              document.body.appendChild(element);
                                              element.click();
                                              document.body.removeChild(element);
                                            };
                                            
                                            return (
                                              <tr
                                                key={movement.id}
                                                onClick={() => handleMovementClick(movement, product)}
                                                className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                                              >
                                                <td className="px-3 py-2 text-gray-700">{dateStr}</td>
                                                <td className="px-3 py-2">
                                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    movement.type === 'INITIAL_INVENTORY' || movement.type === 'GOODS_RECEIPT_FROM_RESTOCK' || movement.type === 'GOODS_RECEIPT_FROM_RETURN'
                                                      ? 'bg-green-100 text-green-800'
                                                      : movement.type === 'GOODS_ISSUE_TO_TRANSFORMATION' || movement.type === 'GOODS_ISSUE_TO_SALES'
                                                      ? 'bg-red-100 text-red-800'
                                                      : 'bg-yellow-100 text-yellow-800'
                                                  }`}>
                                                    {movementType}
                                                  </span>
                                                </td>
                                                <td className={`px-3 py-2 font-semibold ${
                                                  movement.quantityUnits > 0 ? 'text-green-700' : 'text-red-700'
                                                }`}>
                                                  {movement.quantityUnits > 0 ? '+' : '−'} {Math.abs(movement.quantityUnits)}
                                                </td>
                                                <td className="px-3 py-2">
                                                  {isReceiptMovement ? (
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        downloadReceipt();
                                                      }}
                                                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-xs"
                                                      title="Click to download receipt"
                                                    >
                                                      {receiptLabel}
                                                    </button>
                                                  ) : (
                                                    <span className="text-gray-500">−</span>
                                                  )}
                                                </td>
                                                <td className="px-3 py-2 text-gray-700">{movement.linkedToId || '—'}</td>
                                                <td className="px-3 py-2">
                                                  {movement.type === 'INITIAL_INVENTORY' && (
                                                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">Added to Stock ({movement.warehouseId})</span>
                                                  )}
                                                  {movement.type === 'GOODS_RECEIPT_FROM_RESTOCK' && (
                                                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">Restocked ({movement.warehouseId})</span>
                                                  )}
                                                  {movement.type === 'GOODS_RECEIPT_FROM_RETURN' && (
                                                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 font-medium">Return Received ({movement.warehouseId})</span>
                                                  )}
                                                  {movement.type === 'GOODS_ISSUE_TO_TRANSFORMATION' && (
                                                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 font-medium">Transformation Order ({movement.linkedToId || 'N/A'})</span>
                                                  )}
                                                  {movement.type === 'GOODS_ISSUE_TO_SALES' && (
                                                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 font-medium">Client/Buyer ({movement.linkedToId || 'N/A'})</span>
                                                  )}
                                                  {movement.type === 'INVENTORY_CORRECTION' && (
                                                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 font-medium">Inventory Adjustment</span>
                                                  )}
                                                </td>
                                                <td className="px-3 py-2 text-gray-700">{movement.comment || '—'}</td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  );
                                })()}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No stock found
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <StockMovementDetailModal
          movement={selectedMovement}
          product={selectedProduct}
          isOpen={showMovementModal}
          onClose={() => setShowMovementModal(false)}
          onNavigate={handleNavigateToMovement}
        />
        <CreateStockMovementModal
          isOpen={showCreateMovementModal}
          onClose={() => setShowCreateMovementModal(false)}
          product={selectedProduct}
        />
        <CreateRelatedOrderModal
          isOpen={showCreateOrderModal}
          onClose={() => setShowCreateOrderModal(false)}
          movement={selectedMovement}
          product={selectedProduct}
        />
      </div>
  );
}
