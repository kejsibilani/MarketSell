import React, { useState, useMemo } from 'react';
import ShippingTable, { OPERATOR_ROWS } from '../components/ShippingTable';
import { DashboardLayout } from '../components/DashboardLayout';
import TableHeader from '../components/TableHeader';
import QuickActions from '../components/QuickActions';
import PageHeader from '../components/PageHeader';
import { X, Plus, AlertCircle, CheckCircle, ExternalLink, Package, FileText, Eye, ArrowRight } from 'lucide-react';
import { loadFromLS, saveToLS, type Shipment, generateShipmentId } from '../utils/workflowHelpers';
import { products, stockMovements, COMPANIES } from '../data/mockData';

// Mock buyer/client database
const MOCK_BUYERS = [
  { id: 'B001', email: 'buyer1@company.com', name: 'Premium Coffee Imports', country: 'Colombia', accountNumber: 'ACC-2024-001', status: 'active' },
  { id: 'B002', email: 'buyer2@distribution.com', name: 'Global Distribution Ltd', country: 'Brazil', accountNumber: 'ACC-2024-002', status: 'active' },
  { id: 'B003', email: 'buyer3@retail.com', name: 'Regional Retail Chain', country: 'Mexico', accountNumber: 'ACC-2024-003', status: 'active' },
  { id: 'B004', email: 'buyer4@wholesale.com', name: 'Wholesale Partners Inc', country: 'USA', accountNumber: 'ACC-2024-004', status: 'active' },
  { id: 'B005', email: 'buyer5@cafe.com', name: 'Specialty Cafe Network', country: 'Peru', accountNumber: 'ACC-2024-005', status: 'inactive' },
];

// Shipment Detail Modal
function ShipmentDetailModal({ isOpen, onClose, shipment }: any) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'receipts' | 'documents'>('overview');

  if (!isOpen || !shipment) return null;

  // Separate documents into receipts and other documents
  const receipts = shipment.documents?.filter((d: any) => d.type?.toLowerCase().includes('receipt')) || [];
  const otherDocuments = shipment.documents?.filter((d: any) => !d.type?.toLowerCase().includes('receipt')) || [];
  
  // Calculate shipment totals
  const shipmentItems = shipment.items || [];
  const totalQty = shipmentItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  const totalPrice = shipmentItems.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.price || 0)), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{shipment.shipmentId}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-gray-600">{shipment.carrier}</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                shipment.latestStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                shipment.latestStatus === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {shipment.latestStatus || 'Pending'}
              </span>
              {shipment.linkedOrderId && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  {shipment.linkedOrderType === 'sales' ? '📦 Sales' : shipment.linkedOrderType === 'transformation' ? '🔄 Transform' : '📥 Restock'} 
                  <span className="font-mono"> {shipment.linkedOrderId}</span>
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50 px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Overview
            </button>
            {shipment.pictures && shipment.pictures.length > 0 && (
              <button
                onClick={() => setActiveTab('photos')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'photos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📸 Photos ({shipment.pictures.length})
              </button>
            )}
            {receipts.length > 0 && (
              <button
                onClick={() => setActiveTab('receipts')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'receipts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                🧾 Receipts ({receipts.length})
              </button>
            )}
            {otherDocuments.length > 0 && (
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'documents'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📄 Documents ({otherDocuments.length})
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Shipment Header Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div>
                  <span className="text-gray-600 text-xs font-semibold uppercase">Shipment ID</span>
                  <p className="font-mono font-bold text-gray-900 mt-1 text-lg">{shipment.shipmentId}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-xs font-semibold uppercase">Carrier</span>
                  <p className="font-medium text-gray-900 mt-1">{shipment.carrier || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-xs font-semibold uppercase">Status</span>
                  <p className="mt-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      shipment.latestStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                      shipment.latestStatus === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {shipment.latestStatus || 'Pending'}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-xs font-semibold uppercase">Date</span>
                  <p className="font-medium text-gray-900 mt-1">{shipment.date}</p>
                </div>
              </div>

              {/* Shipment Items Table */}
              {shipmentItems.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-green-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-green-600" />
                      Shipment Items ({shipmentItems.length})
                    </h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">SKU</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Product</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Owner</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Quantity</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Unit Price</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {shipmentItems.map((item: any, idx: number) => {
                        const product = products.find((p: any) => p.id === item.skuId);
                        const itemTotal = (item.quantity || 0) * (item.price || 0);
                        return (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-mono text-gray-700 font-semibold">{item.skuId}</td>
                            <td className="px-4 py-3 text-gray-900 font-medium">{product?.name || 'Unknown Product'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.ownerOfStock || 'Not specified'}</td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">{item.quantity}</span>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">€{item.price?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">€{itemTotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-200">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 font-semibold text-gray-900">TOTAL</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">{totalQty}</td>
                        <td colSpan={1}></td>
                        <td className="px-4 py-3 text-right font-bold text-green-700 text-lg">€{totalPrice.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Tracking Information */}
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
                    <span className="text-gray-600 text-xs font-semibold">Internal Tracking #</span>
                    <p className="font-mono text-sm font-medium text-gray-900 mt-1">
                      {shipment.internalTrackingNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Route</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <span className="text-gray-600 text-xs font-semibold">From</span>
                    <p className="font-medium text-gray-900 mt-1">{shipment.from || 'N/A'}</p>
                  </div>
                  <ArrowRight className="text-gray-400 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <span className="text-gray-600 text-xs font-semibold">To</span>
                    <p className="font-medium text-gray-900 mt-1">{shipment.to || 'N/A'}</p>
                  </div>
                </div>
                {shipment.units && (
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-gray-600 text-xs font-semibold">Units</span>
                    <p className="font-medium text-gray-900 mt-1">{shipment.units} units</p>
                  </div>
                )}
              </div>

              {/* Images Gallery in Overview */}
              {shipment.pictures && shipment.pictures.length > 0 && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900">📸 Shipment Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {shipment.pictures.map((pic: any, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(pic.name)}
                        className="relative group cursor-pointer"
                      >
                        <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg border-2 border-purple-200 p-4 aspect-square flex items-center justify-center hover:border-purple-400 hover:shadow-xl transition-all transform hover:scale-105">
                          <div className="text-center">
                            <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <p className="text-xs text-purple-700 font-medium line-clamp-2">{pic.name}</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History */}
              {shipment.history && shipment.history.length > 0 && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900">� Tracking History</h3>
                  <div className="space-y-2">
                    {shipment.history.map((event: any, idx: number) => (
                      <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-600">{event.timestamp}</p>
                          <p className="font-medium text-gray-900 mt-0.5">{event.statusDescription}</p>
                          <p className="text-sm text-gray-600 mt-0.5">{event.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && shipment.pictures && shipment.pictures.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">📸 Shipment Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {shipment.pictures.map((pic: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewImage(pic.name)}
                    className="relative group cursor-pointer"
                  >
                    <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg border-2 border-purple-200 p-4 aspect-square flex items-center justify-center hover:border-purple-400 hover:shadow-xl transition-all transform hover:scale-105">
                      <div className="text-center">
                        <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-xs text-purple-700 font-medium line-clamp-2">{pic.name}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Receipts Tab */}
          {activeTab === 'receipts' && receipts.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">🧾 Receipts</h3>
              <div className="space-y-3">
                {receipts.map((doc: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <FileText className="w-6 h-6 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                      {doc.type && <p className="text-xs text-gray-600 mt-1">{doc.type}</p>}
                    </div>
                    <div className="flex-shrink-0 p-2 bg-white rounded-lg group-hover:bg-gray-100 transition-colors">
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && otherDocuments.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">📄 Documents</h3>
              <div className="space-y-3">
                {otherDocuments.map((doc: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <FileText className="w-6 h-6 text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                      {doc.type && <p className="text-xs text-gray-600 mt-1">{doc.type}</p>}
                    </div>
                    <div className="flex-shrink-0 p-2 bg-white rounded-lg group-hover:bg-gray-100 transition-colors">
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Photo Preview</h3>
              <button onClick={() => setPreviewImage(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 p-8 text-center">
              <Package className="w-20 h-20 text-purple-600 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900">{previewImage}</p>
              <p className="text-sm text-gray-600 mt-2">📷 Image file preview</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SmartShipmentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // HEADER-LEVEL STATE
  const [selectedBuyer, setSelectedBuyer] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [carrier, setCarrier] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('WH-A-001');
  const [linkedOrderId, setLinkedOrderId] = useState<string>(''); // Link to sales/transformation/restock order
  const [linkedOrderType, setLinkedOrderType] = useState<'sales' | 'transformation' | 'restock'>('sales');

  // PRODUCTS SUB-TABLE STATE
  const [shipmentItems, setShipmentItems] = useState<Array<{ id: string; skuId: string; quantity: number }>>([
    { id: '1', skuId: '', quantity: 0 }
  ]);

  // DOCUMENTS SUB-TABLE STATE
  const [documents, setDocuments] = useState<Array<{ id: string; name: string; type: string; file?: File }>>([]);

  // PICTURES SUB-TABLE STATE
  const [pictures, setPictures] = useState<Array<{ id: string; name: string; file?: File }>>([]);

  const [showStockDetail, setShowStockDetail] = useState(false);

  // Get available units for selected SKU
  const getAvailableUnits = (skuId: string): number => {
    const relevantMovements = stockMovements
      .filter(m => m.skuId === skuId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (relevantMovements.length > 0) {
      const lastMovement = relevantMovements[0];
      return Math.abs(lastMovement.quantityUnits);
    }
    
    const product = products.find(p => p.id === skuId);
    return product?.stock || 0;
  };

  const selectedBuyerData = MOCK_BUYERS.find(b => b.id === selectedBuyer);

  if (!isOpen) return null;

  // Add new item to shipment
  const addShipmentItem = () => {
    const newId = String(Math.max(...shipmentItems.map(i => parseInt(i.id) || 0), 0) + 1);
    setShipmentItems([...shipmentItems, { id: newId, skuId: '', quantity: 0 }]);
  };

  // Remove item from shipment
  const removeShipmentItem = (id: string) => {
    if (shipmentItems.length > 1) {
      setShipmentItems(shipmentItems.filter(item => item.id !== id));
    }
  };

  // Update item in shipment
  const updateShipmentItem = (id: string, field: 'skuId' | 'quantity', value: any) => {
    setShipmentItems(shipmentItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Add document
  const addDocument = () => {
    const newId = String(Math.max(...documents.map(d => parseInt(d.id) || 0), 0) + 1);
    setDocuments([...documents, { id: newId, name: '', type: 'label' }]);
  };

  // Remove document
  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  // Update document
  const updateDocument = (id: string, field: 'name' | 'type', value: any) => {
    setDocuments(documents.map(doc =>
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  // Add picture
  const addPicture = () => {
    const newId = String(Math.max(...pictures.map(p => parseInt(p.id) || 0), 0) + 1);
    setPictures([...pictures, { id: newId, name: '' }]);
  };

  // Remove picture
  const removePicture = (id: string) => {
    setPictures(pictures.filter(pic => pic.id !== id));
  };

  // Update picture
  const updatePicture = (id: string, field: 'name', value: any) => {
    setPictures(pictures.map(pic =>
      pic.id === id ? { ...pic, [field]: value } : pic
    ));
  };

  const handleCreateShipment = () => {
    // Validate header
    if (!selectedWarehouse || !selectedBuyer || !carrier) {
      alert('Please complete header information (Warehouse, Carrier, Buyer)');
      return;
    }

    // Validate items
    const validItems = shipmentItems.filter(item => item.skuId && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Please add at least one product with quantity');
      return;
    }

    // Check quantities
    for (const item of validItems) {
      const available = getAvailableUnits(item.skuId);
      if (item.quantity > available) {
        alert(`Insufficient stock for SKU. Available: ${available}, Requested: ${item.quantity}`);
        return;
      }
    }

    if (selectedBuyerData?.status === 'inactive') {
      alert('Cannot ship to inactive buyer account');
      return;
    }

    // Create shipment with all details
    const newShipment: Shipment = {
      id: generateShipmentId(),
      shipmentId: `SHP-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      date: new Date().toISOString(),
      from: selectedWarehouse,
      to: selectedBuyerData?.country || 'Unknown',
      carrier: carrier,
      status: 'pending',
      items: validItems.map(item => ({ skuId: item.skuId, quantity: item.quantity })),
      buyerId: selectedBuyer,
      buyerEmail: selectedBuyerData?.email,
      buyerName: selectedBuyerData?.name,
      buyerAccountNumber: selectedBuyerData?.accountNumber,
      comment: specialNotes,
      linkedOrderId: linkedOrderId || undefined,
      linkedOrderType: linkedOrderId ? linkedOrderType : undefined,
      documents: documents.filter(d => d.name).map(d => ({ name: d.name, type: d.type })),
      pictures: pictures.filter(p => p.name).map(p => ({ name: p.name })),
    };

    const existingShipments = loadFromLS('shipments', []);
    saveToLS('shipments', [...existingShipments, newShipment]);
    alert(`✅ Shipment ${newShipment.shipmentId} created successfully!\n\nProducts: ${validItems.length}\nBuyer: ${selectedBuyerData?.name}`);
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full shadow-xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Shipment</h2>
            <p className="text-sm text-gray-500 mt-1">Multi-product shipment with documents & pictures</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* ===== HEADER SECTION ===== */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              Header Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Warehouse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse *</label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="WH-A-001">WH-A-001 - San Salvador</option>
                  <option value="WH-B-002">WH-B-002 - Bogotá</option>
                  <option value="WH-C-003">WH-C-003 - São Paulo</option>
                </select>
              </div>

              {/* Carrier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Carrier *</label>
                <input
                  type="text"
                  placeholder="e.g., DHL, FedEx, UPS"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buyer Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Buyer by Email or Name *</label>
                <input
                  type="text"
                  placeholder="Enter buyer email or name..."
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buyer Selection */}
              {buyerEmail && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Matching Buyers</label>
                  <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2 bg-white">
                    {MOCK_BUYERS
                      .filter(b => b.email.toLowerCase().includes(buyerEmail.toLowerCase()) || b.name.toLowerCase().includes(buyerEmail.toLowerCase()))
                      .map(buyer => (
                        <button
                          key={buyer.id}
                          onClick={() => setSelectedBuyer(buyer.id)}
                          disabled={buyer.status === 'inactive'}
                          className={`w-full p-2 rounded-lg border text-left transition-all text-sm ${
                            selectedBuyer === buyer.id
                              ? 'border-green-500 bg-green-50'
                              : buyer.status === 'inactive'
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{buyer.name}</div>
                          <div className="text-xs text-gray-600">{buyer.email}</div>
                        </button>
                      ))}
                    {MOCK_BUYERS.filter(b => b.email.toLowerCase().includes(buyerEmail.toLowerCase()) || b.name.toLowerCase().includes(buyerEmail.toLowerCase())).length === 0 && (
                      <div className="p-3 text-center text-sm text-gray-500">No buyers found</div>
                    )}
                  </div>
                </div>
              )}

              {/* Link to Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link to Order (Optional)</label>
                <select
                  value={linkedOrderType}
                  onChange={(e) => setLinkedOrderType(e.target.value as 'sales' | 'transformation' | 'restock')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                >
                  <option value="sales">Sales Order</option>
                  <option value="transformation">Transformation Order</option>
                  <option value="restock">Restock Order</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order ID / Number</label>
                <input
                  type="text"
                  placeholder="e.g., SO-2024-001"
                  value={linkedOrderId}
                  onChange={(e) => setLinkedOrderId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Special Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Notes (Optional)</label>
                <textarea
                  placeholder="Add any special instructions..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>

            {/* Selected Buyer Info */}
            {selectedBuyerData && (
              <div className="mt-4 p-3 bg-white rounded-lg border-l-4 border-green-500">
                <p className="text-sm"><strong>Buyer:</strong> {selectedBuyerData.name}</p>
                <p className="text-sm"><strong>Email:</strong> {selectedBuyerData.email}</p>
                <p className="text-sm"><strong>Account:</strong> {selectedBuyerData.accountNumber}</p>
              </div>
            )}
          </div>

          {/* ===== PRODUCTS SUB-TABLE ===== */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package size={20} className="text-green-600" />
                Products ({shipmentItems.filter(i => i.skuId && i.quantity > 0).length})
              </span>
            </h3>

            <div className="space-y-3">
              {shipmentItems.map((item, idx) => (
                <div key={item.id} className="flex gap-3 items-end">
                  {/* SKU Selection */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Product SKU</label>
                    <select
                      value={item.skuId}
                      onChange={(e) => updateShipmentItem(item.id, 'skuId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">-- Select --</option>
                      {products.map(p => {
                        const avail = getAvailableUnits(p.id);
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.id}) - {avail} avail
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={item.quantity}
                      onChange={(e) => updateShipmentItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeShipmentItem(item.id)}
                    disabled={shipmentItems.length === 1}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addShipmentItem}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>

          {/* ===== DOCUMENTS SUB-TABLE ===== */}
          <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-orange-600" />
              Documents ({documents.filter(d => d.name).length})
            </h3>

            <div className="space-y-3">
              {documents.map((doc, idx) => (
                <div key={doc.id} className="flex gap-3 items-end">
                  {/* Document Name */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Document Name</label>
                    <input
                      type="text"
                      placeholder="e.g., DHL Label, Invoice"
                      value={doc.name}
                      onChange={(e) => updateDocument(doc.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Document Type */}
                  <div className="w-32">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={doc.type}
                      onChange={(e) => updateDocument(doc.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="label">Label</option>
                      <option value="invoice">Invoice</option>
                      <option value="customs">Customs</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addDocument}
              className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Document
            </button>
          </div>

          {/* ===== PICTURES SUB-TABLE ===== */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-purple-600" />
              Pictures ({pictures.filter(p => p.name).length})
            </h3>

            <div className="space-y-3">
              {pictures.map((pic, idx) => (
                <div key={pic.id} className="flex gap-3 items-end">
                  {/* Picture Name */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Picture Description</label>
                    <input
                      type="text"
                      placeholder="e.g., Packing, Label, Shipment Proof"
                      value={pic.name}
                      onChange={(e) => updatePicture(pic.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removePicture(pic.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addPicture}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Picture
            </button>
          </div>

          {/* ===== ACTION BUTTONS ===== */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateShipment}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Create Shipment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shipment vs Sales Order Comparison Modal
function ShipmentComparisonModal({ isOpen, onClose, orderId }: { isOpen: boolean; onClose: () => void; orderId?: string }) {
  const salesOrders = loadFromLS('salesOrders', []) as any[];
  const shipments = loadFromLS('shipments', []) as any[];

  if (!isOpen || !orderId) return null;

  const order = salesOrders.find((o: any) => o.id === orderId);
  if (!order) return null;

  const linkedShipments = shipments.filter((s: any) => order.linkedShipmentIds?.includes(s.id));

  // Calculate fulfillment per item
  const itemComparison = order.items.map((item: any) => {
    const shippedQty = linkedShipments.reduce((sum, s: any) => {
      const shipItem = s.items?.find((si: any) => si.skuId === item.skuId);
      return sum + (shipItem?.quantity || 0);
    }, 0);
    const pendingQty = Math.max(0, item.quantity - shippedQty);
    const fulfillmentPct = item.quantity > 0 ? Math.round((shippedQty / item.quantity) * 100) : 0;

    return {
      skuId: item.skuId,
      orderedQty: item.quantity,
      shippedQty,
      pendingQty,
      fulfillmentPct,
    };
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Order vs Shipments Comparison</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-3">Order: {order.orderId}</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Buyer</p>
                <p className="font-semibold text-gray-900">{order.buyerName}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Items</p>
                <p className="font-semibold text-gray-900">{order.items.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-semibold text-gray-900">{new Date(order.createdDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Shipments Linked */}
          {linkedShipments.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-bold text-gray-900 mb-3">Linked Shipments: {linkedShipments.length}</h3>
              <div className="space-y-2">
                {linkedShipments.map((shipment: any) => (
                  <div key={shipment.id} className="bg-white p-3 rounded border border-green-100 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{shipment.shipmentId}</p>
                      <p className="text-xs text-gray-600">{shipment.carrier} • {new Date(shipment.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {shipment.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Item-by-Item Comparison */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Fulfillment Per Item</h3>
            <div className="space-y-3">
              {itemComparison.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.skuId}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        item.fulfillmentPct === 100 ? 'bg-green-100 text-green-800' :
                        item.fulfillmentPct >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.fulfillmentPct}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-gray-600 text-xs">Ordered</p>
                      <p className="font-bold text-gray-900 text-lg">{item.orderedQty}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-gray-600 text-xs">Shipped</p>
                      <p className="font-bold text-green-700 text-lg">{item.shippedQty}</p>
                    </div>
                    <div className={`${item.pendingQty > 0 ? 'bg-red-50' : 'bg-gray-50'} p-2 rounded`}>
                      <p className="text-gray-600 text-xs">Pending</p>
                      <p className={`font-bold text-lg ${item.pendingQty > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        {item.pendingQty}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.fulfillmentPct === 100 ? 'bg-green-600' :
                        item.fulfillmentPct >= 50 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${item.fulfillmentPct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">Overall Summary</h3>
            <div className="grid grid-cols-4 gap-3 text-sm">
              {(() => {
                const totalOrdered = itemComparison.reduce((sum, item) => sum + item.orderedQty, 0);
                const totalShipped = itemComparison.reduce((sum, item) => sum + item.shippedQty, 0);
                const totalPending = itemComparison.reduce((sum, item) => sum + item.pendingQty, 0);
                const overallPct = totalOrdered > 0 ? Math.round((totalShipped / totalOrdered) * 100) : 0;

                return (
                  <>
                    <div>
                      <p className="text-gray-600">Total Ordered</p>
                      <p className="font-bold text-gray-900 text-lg">{totalOrdered}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Shipped</p>
                      <p className="font-bold text-green-700 text-lg">{totalShipped}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Pending</p>
                      <p className={`font-bold text-lg ${totalPending > 0 ? 'text-red-700' : 'text-green-700'}`}>{totalPending}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fulfillment</p>
                      <p className={`font-bold text-lg ${overallPct === 100 ? 'text-green-700' : overallPct >= 50 ? 'text-yellow-700' : 'text-red-700'}`}>
                        {overallPct}%
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
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

export default function OperatorShipments() {
  const total = OPERATOR_ROWS.length;
  const delivered = OPERATOR_ROWS.filter(r => (r.latestStatus || '').toLowerCase().includes('deliver')).length;
  const inTransit = OPERATOR_ROWS.filter(r => (r.latestStatus || '').toLowerCase().includes('transit')).length;
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [showNewShipmentModal, setShowNewShipmentModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>();
  const [showShipmentDetailModal, setShowShipmentDetailModal] = useState(false);
  const [selectedShipmentDetail, setSelectedShipmentDetail] = useState<any>(null);

  const handleOpenComparison = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowComparisonModal(true);
  };

  const handleViewShipmentDetails = (shipment: any) => {
    setSelectedShipmentDetail(shipment);
    setShowShipmentDetailModal(true);
  };

  return (
      <div className="space-y-6">
        <PageHeader
          title="Shipments"
          description="Manage your shipments efficiently"
          onAddNew={() => setShowNewShipmentModal(true)}
          addNewLabel="New Shipment"
        />
        {/* Status filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
            {['all','Delivered','In Transit'].map(s => (
              <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button onClick={() => { setQuery(''); setStatus('all'); }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
            <div className="text-sm text-gray-600">Total Shipments</div>
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-500 mt-1">All operator shipments</div>
          </button>
          <button onClick={() => { setQuery(''); setStatus('Delivered'); }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
            <div className="text-sm text-gray-600">Delivered</div>
            <div className="text-2xl font-bold text-green-600">{delivered}</div>
            <div className="text-xs text-gray-500 mt-1">Completed deliveries</div>
          </button>
          <button onClick={() => { setQuery(''); setStatus('In Transit'); }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
            <div className="text-sm text-gray-600">In Transit</div>
            <div className="text-2xl font-bold text-orange-600">{inTransit}</div>
            <div className="text-xs text-gray-500 mt-1">Currently moving</div>
          </button>
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="text-sm text-gray-600">Actions</div>
            <div className="text-2xl font-bold text-gray-900">Quick</div>
            <div className="text-xs text-gray-500 mt-1">Copy, export, update status</div>
          </div>
        </div>

        {/* Table header + table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <TableHeader title="Shipments" count={total} query={query} setQuery={setQuery} status={status} setStatus={setStatus}
            statusOptions={[{ value: 'Delivered', label: 'Delivered' }, { value: 'In Transit', label: 'In Transit' }]} />
          <div className="p-4">
            <ShippingTable role="operator" queryProp={query} setQueryProp={setQuery} statusProp={status} setStatusProp={setStatus} onViewDetails={handleViewShipmentDetails} />
          </div>
        </div>

        <SmartShipmentModal isOpen={showNewShipmentModal} onClose={() => setShowNewShipmentModal(false)} />
        <ShipmentComparisonModal isOpen={showComparisonModal} onClose={() => setShowComparisonModal(false)} orderId={selectedOrderId} />
        <ShipmentDetailModal isOpen={showShipmentDetailModal} onClose={() => setShowShipmentDetailModal(false)} shipment={selectedShipmentDetail} />
      </div>
  );
}
