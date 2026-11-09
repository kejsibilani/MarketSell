import React from 'react';
import { Package, FileText, Image, ChevronDown, ChevronUp } from 'lucide-react';
import { products } from '../data/mockData';

interface ShipmentDetailsProps {
  shipment: any;
  isExpanded?: boolean;
  onToggle?: () => void;
  compact?: boolean;
}

/**
 * Reusable ShipmentDetails Component
 * Displays complete shipment contents including:
 * - Products with quantities and prices
 * - Documents (if any)
 * - Pictures (if any)
 * 
 * Can be used in:
 * - Shipments page (full view)
 * - Sales Order details (inline)
 * - Restocking Order details (inline)
 * - Transformation orders (as reference)
 */
export function ShipmentDetails({
  shipment,
  isExpanded = true,
  onToggle,
  compact = false,
}: ShipmentDetailsProps) {
  if (!shipment) return null;

  const headerClass = compact ? 'text-xs' : 'text-sm';
  const contentClass = compact ? 'text-xs' : 'text-sm';

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header - Clickable if onToggle provided */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span className={`font-semibold text-gray-900 ${headerClass}`}>
              Shipment Contents
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
      )}

      {/* Content - Only show if expanded */}
      {isExpanded && (
        <div className="px-4 py-3 space-y-4 border-t border-gray-200">
          {/* Products Section */}
          {shipment.items && shipment.items.length > 0 && (
            <div>
              <h4 className={`font-semibold text-gray-700 mb-2 flex items-center gap-2 ${headerClass}`}>
                <Package className="w-4 h-4 text-blue-600" />
                Products ({shipment.items.length})
              </h4>
              <div className="space-y-2 bg-white rounded p-3 border border-gray-100">
                {shipment.items.map((item: any, idx: number) => {
                  const product = products.find((p: any) => p.id === item.skuId);
                  const productName = product?.name || item.skuId;

                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-start pb-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <p className={`font-medium text-gray-900 ${contentClass}`}>
                          {productName}
                        </p>
                        <p className={`text-gray-600 ${contentClass}`}>
                          SKU: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                            {item.skuId}
                          </code>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-gray-900 ${contentClass}`}>
                          {item.quantity} units
                        </p>
                        {item.price && (
                          <p className={`text-gray-600 ${contentClass}`}>
                            @ €{item.price.toFixed(2)}/unit
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {shipment.documents && shipment.documents.length > 0 && (
            <div>
              <h4 className={`font-semibold text-gray-700 mb-2 flex items-center gap-2 ${headerClass}`}>
                <FileText className="w-4 h-4 text-green-600" />
                Documents ({shipment.documents.length})
              </h4>
              <div className="space-y-1 bg-white rounded p-3 border border-gray-100">
                {shipment.documents.map((doc: any, idx: number) => (
                  <div key={idx} className={`flex items-center gap-2 text-gray-700 ${contentClass}`}>
                    <FileText className="w-3 h-3 text-green-600" />
                    <span>{doc.name}</span>
                    {doc.type && (
                      <span className="text-xs text-gray-500">({doc.type})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pictures Section */}
          {shipment.pictures && shipment.pictures.length > 0 && (
            <div>
              <h4 className={`font-semibold text-gray-700 mb-2 flex items-center gap-2 ${headerClass}`}>
                <Image className="w-4 h-4 text-purple-600" />
                Pictures ({shipment.pictures.length})
              </h4>
              <div className="space-y-1 bg-white rounded p-3 border border-gray-100">
                {shipment.pictures.map((pic: any, idx: number) => (
                  <div key={idx} className={`flex items-center gap-2 text-gray-700 ${contentClass}`}>
                    <Image className="w-3 h-3 text-purple-600" />
                    <span>{pic.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!shipment.items || shipment.items.length === 0) &&
            (!shipment.documents || shipment.documents.length === 0) &&
            (!shipment.pictures || shipment.pictures.length === 0) && (
              <p className={`text-gray-500 italic ${contentClass}`}>
                No shipment contents recorded yet.
              </p>
            )}
        </div>
      )}
    </div>
  );
}

export default ShipmentDetails;
