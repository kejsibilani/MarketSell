import { useState } from 'react';
import { Warehouse, MapPin, FileText, Package, Edit2, Trash2, Plus, Eye, ExternalLink } from 'lucide-react';

interface Document {
  id: string;
  type: string;
  name: string;
  uploadedDate: string;
}

interface WarehouseData {
  id: string;
  name: string;
  address: string;
  allowedCategories: string[];
  documents: Document[];
  googleMapsUrl: string;
  entrancePicture: string;
  isUsed: boolean;
  productTypesInStock: number;
  capacity: number;
  currentUtilization: number;
}

const MOCK_WAREHOUSES: WarehouseData[] = [
  {
    id: '1',
    name: 'Rotterdam Warehouse',
    address: 'Carrer de la Marina, 123, 08018 Rotterdam, Spain',
    allowedCategories: ['Green Coffee', 'Roasted Coffee', 'Specialty Coffee'],
    documents: [
      { id: 'd1', type: 'Safety Certificate', name: 'safety-cert-2026.pdf', uploadedDate: '2026-01-15' },
      { id: 'd2', type: 'Health Certificate', name: 'health-inspection.pdf', uploadedDate: '2026-02-20' },
    ],
    googleMapsUrl: 'https://maps.google.com/?q=Rotterdam+Warehouse',
    entrancePicture: '/warehouse-entrance-bcn.jpg',
    isUsed: true,
    productTypesInStock: 122,
    capacity: 5000,
    currentUtilization: 3200,
  },
  {
    id: '2',
    name: 'Muhlenberg Warehouse',
    address: 'Hauptstraße 45, 77761 Schiltach, Germany',
    allowedCategories: ['Green Coffee', 'Organic Coffee'],
    documents: [
      { id: 'd3', type: 'Safety Certificate', name: 'safety-2026.pdf', uploadedDate: '2026-03-10' },
    ],
    googleMapsUrl: 'https://maps.google.com/?q=Muhlenberg+Warehouse',
    entrancePicture: '/warehouse-entrance-de.jpg',
    isUsed: true,
    productTypesInStock: 45,
    capacity: 2000,
    currentUtilization: 800,
  },
  {
    id: '3',
    name: 'Kishinev Warehouse',
    address: 'Strada Armenească 25, Chișinău, Moldova',
    allowedCategories: ['Green Coffee', 'Roasted Coffee'],
    documents: [],
    googleMapsUrl: 'https://maps.google.com/?q=Kishinev+Warehouse',
    entrancePicture: '/warehouse-entrance-md.jpg',
    isUsed: false,
    productTypesInStock: 0,
    capacity: 1500,
    currentUtilization: 0,
  },
];

export default function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>(MOCK_WAREHOUSES);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseData | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  const handleAction = (warehouseId: string, action: string) => {
    console.log(`Action ${action} for warehouse ${warehouseId}`);
    setShowActions(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Warehouse Management</h1>
          <p className="text-gray-600">Manage warehouse locations, capacity, and configuration</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {warehouses.map(warehouse => (
          <div
            key={warehouse.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Warehouse Header */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Warehouse className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{warehouse.name}</h3>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${
                      warehouse.isUsed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {warehouse.isUsed ? 'Active' : 'Not Used'}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowActions(showActions === warehouse.id ? null : warehouse.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  {showActions === warehouse.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => handleAction(warehouse.id, 'edit')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Details
                      </button>
                      <button
                        onClick={() => handleAction(warehouse.id, 'view-stock')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        View Stock
                      </button>
                      <button
                        onClick={() => handleAction(warehouse.id, 'documents')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Manage Documents
                      </button>
                      <button
                        onClick={() => handleAction(warehouse.id, 'delete')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">{warehouse.productTypesInStock}</div>
                  <div className="text-xs text-gray-600 mt-1">Product types in stock</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {warehouse.capacity > 0 ? Math.round((warehouse.currentUtilization / warehouse.capacity) * 100) : 0}%
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Capacity used</div>
                </div>
              </div>
            </div>

            {/* Warehouse Details */}
            <div className="p-5 space-y-4">
              {/* Address */}
              <div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Address</p>
                    <p className="text-gray-900">{warehouse.address}</p>
                  </div>
                </div>
              </div>

              {/* Allowed Categories */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Allowed Product Categories</p>
                <div className="flex flex-wrap gap-2">
                  {warehouse.allowedCategories.map((category, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Documents ({warehouse.documents.length})</p>
                {warehouse.documents.length > 0 ? (
                  <div className="space-y-2">
                    {warehouse.documents.slice(0, 2).map(doc => (
                      <div key={doc.id} className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 flex-1 truncate">{doc.name}</span>
                      </div>
                    ))}
                    {warehouse.documents.length > 2 && (
                      <button className="text-xs text-blue-600 hover:text-blue-700">
                        +{warehouse.documents.length - 2} more
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No documents uploaded</p>
                )}
              </div>

              {/* Google Maps Location */}
              <div>
                <a
                  href={warehouse.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Google Maps
                </a>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setSelectedWarehouse(warehouse)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                View Full Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedWarehouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedWarehouse.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedWarehouse.address}</p>
                </div>
                <button
                  onClick={() => setSelectedWarehouse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Capacity</h3>
                  <p className="text-2xl font-bold text-gray-900">{selectedWarehouse.capacity} kg</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Current Stock</h3>
                  <p className="text-2xl font-bold text-gray-900">{selectedWarehouse.currentUtilization} kg</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Allowed Product Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWarehouse.allowedCategories.map((category, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded">
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Documents</h3>
                <div className="space-y-2">
                  {selectedWarehouse.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type} • Uploaded {doc.uploadedDate}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Location</h3>
                <a
                  href={selectedWarehouse.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <MapPin className="w-4 h-4" />
                  Open in Google Maps
                </a>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Warehouse
              </button>
              <button
                onClick={() => setSelectedWarehouse(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
