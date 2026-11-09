import { useState } from 'react';
import { Truck, MapPin, FileText, Edit2, Trash2, Plus, Eye, ExternalLink, Package } from 'lucide-react';
import formatNumber from '../utils/numberFormat';

interface Document {
  id: string;
  type: string;
  name: string;
  uploadedDate: string;
}

interface CarrierData {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  serviceRegions: string[];
  vehicleTypes: string[];
  documents: Document[];
  websiteUrl: string;
  isActive: boolean;
  shipmentsCount: number;
  averageRating: number;
  insuranceCoverage: string;
}

const MOCK_CARRIERS: CarrierData[] = [
  {
    id: '1',
    name: 'TransEuropa Logistics',
    contactPerson: 'María García',
    phone: '+34 912 345 678',
    email: 'maria.garcia@transeuropa.com',
    address: 'Calle Mayor 123, 28013 Madrid, Spain',
    serviceRegions: ['Spain', 'France', 'Portugal', 'Italy'],
    vehicleTypes: ['Refrigerated Truck', 'Standard Truck', 'Van'],
    documents: [
      { id: 'd1', type: 'Insurance Certificate', name: 'insurance-2026.pdf', uploadedDate: '2026-01-10' },
      { id: 'd2', type: 'Operating License', name: 'license-spain.pdf', uploadedDate: '2026-01-15' },
    ],
    websiteUrl: 'https://transeuropa.com',
    isActive: true,
    shipmentsCount: 1247,
    averageRating: 4.8,
    insuranceCoverage: '€500,000',
  },
  {
    id: '2',
    name: 'Deutsche Fracht GmbH',
    contactPerson: 'Hans Mueller',
    phone: '+49 30 9876 5432',
    email: 'h.mueller@deutschefracht.de',
    address: 'Berliner Straße 45, 10715 Berlin, Germany',
    serviceRegions: ['Germany', 'Austria', 'Switzerland', 'Poland'],
    vehicleTypes: ['Refrigerated Truck', 'Container Truck'],
    documents: [
      { id: 'd3', type: 'Insurance Certificate', name: 'insurance-de.pdf', uploadedDate: '2026-02-01' },
      { id: 'd4', type: 'Operating License', name: 'license-germany.pdf', uploadedDate: '2026-02-05' },
      { id: 'd5', type: 'Safety Certificate', name: 'safety-cert.pdf', uploadedDate: '2026-01-20' },
    ],
    websiteUrl: 'https://deutschefracht.de',
    isActive: true,
    shipmentsCount: 892,
    averageRating: 4.6,
    insuranceCoverage: '€750,000',
  },
  {
    id: '3',
    name: 'Med Express',
    contactPerson: 'Giuseppe Rossi',
    phone: '+39 06 1234 5678',
    email: 'g.rossi@medexpress.it',
    address: 'Via Roma 88, 00184 Rome, Italy',
    serviceRegions: ['Italy', 'France', 'Spain'],
    vehicleTypes: ['Van', 'Standard Truck'],
    documents: [
      { id: 'd6', type: 'Insurance Certificate', name: 'insurance-italy.pdf', uploadedDate: '2025-12-15' },
    ],
    websiteUrl: 'https://medexpress.it',
    isActive: false,
    shipmentsCount: 234,
    averageRating: 4.2,
    insuranceCoverage: '€300,000',
  },
];

export default function CarrierManagement() {
  const [carriers, setCarriers] = useState<CarrierData[]>(MOCK_CARRIERS);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierData | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  const handleAction = (carrierId: string, action: string) => {
    console.log(`Action ${action} for carrier ${carrierId}`);
    setShowActions(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Carrier Management</h1>
          <p className="text-gray-600">Manage shipping carriers, service regions, and documentation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Carrier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {carriers.map(carrier => (
          <div
            key={carrier.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{carrier.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        carrier.isActive ? 'bg-green-400/30 text-white' : 'bg-gray-400/30 text-white'
                      }`}>
                        {carrier.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-white/80">★ {carrier.averageRating}/5</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowActions(showActions === carrier.id ? null : carrier.id)}
                  className="text-white hover:bg-white/20 rounded p-1"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Contact Info */}
              <div>
                <div className="text-xs text-gray-500 mb-1">Contact Person</div>
                <div className="text-sm font-medium text-gray-900">{carrier.contactPerson}</div>
                <div className="text-xs text-gray-600">{carrier.phone}</div>
                <div className="text-xs text-gray-600">{carrier.email}</div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">{carrier.address}</div>
              </div>

              {/* Service Regions */}
              <div>
                <div className="text-xs text-gray-500 mb-1">Service Regions</div>
                <div className="flex flex-wrap gap-1">
                  {carrier.serviceRegions.map((region, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vehicle Types */}
              <div>
                <div className="text-xs text-gray-500 mb-1">Vehicle Types</div>
                <div className="flex flex-wrap gap-1">
                  {carrier.vehicleTypes.map((vehicle, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {vehicle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <div className="text-xs text-gray-500">Total Shipments</div>
                  <div className="text-lg font-bold text-gray-900">{formatNumber(carrier.shipmentsCount)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Insurance</div>
                  <div className="text-lg font-bold text-gray-900">{carrier.insuranceCoverage}</div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FileText className="w-3 h-3" />
                    <span>Documents ({carrier.documents.length})</span>
                  </div>
                </div>
                {carrier.documents.length > 0 ? (
                  <div className="space-y-1">
                    {carrier.documents.slice(0, 2).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                        <span className="text-gray-700 truncate">{doc.type}</span>
                        <span className="text-gray-500 text-xs">{doc.uploadedDate}</span>
                      </div>
                    ))}
                    {carrier.documents.length > 2 && (
                      <div className="text-xs text-blue-600 text-center">
                        +{carrier.documents.length - 2} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 text-center py-2">No documents</div>
                )}
              </div>

              {/* Website Link */}
              {carrier.websiteUrl && (
                <a
                  href={carrier.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit Website
                </a>
              )}
            </div>

            {/* Actions */}
            {showActions === carrier.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-3 flex gap-2">
                <button
                  onClick={() => handleAction(carrier.id, 'edit')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleAction(carrier.id, 'view')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  <Package className="w-4 h-4" />
                  Shipments
                </button>
                <button
                  onClick={() => handleAction(carrier.id, 'delete')}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
