import React from 'react';
import { Plus } from 'lucide-react';

export interface Packaging {
  id: string;
  name: string;
  description: string;
  photoUrl?: string;
  dimensions?: string;
  materialCost?: number;
}

interface PackagingSelectorProps {
  selected?: string;
  onChange: (packagingId: string) => void;
  showPhotos?: boolean;
  readOnly?: boolean;
}

/**
 * Packaging selector component
 * Displays available packaging options with photos
 * Allows user to select packaging when adding/editing products
 * Includes option to create custom packaging (links to future branding section)
 */
const MOCK_PACKAGINGS: Packaging[] = [
  {
    id: 'pkg-1',
    name: 'Standard 1kg Bag',
    description: 'Premium kraft paper with oxygen barrier',
    photoUrl: 'https://via.placeholder.com/150?text=1kg+Bag',
    dimensions: '20 × 30 cm',
    materialCost: 0.45,
  },
  {
    id: 'pkg-2',
    name: 'Bulk 5kg Bag',
    description: 'Heavy-duty kraft with zipper',
    photoUrl: 'https://via.placeholder.com/150?text=5kg+Bag',
    dimensions: '30 × 45 cm',
    materialCost: 1.20,
  },
  {
    id: 'pkg-3',
    name: 'Premium Box',
    description: 'White cardboard with custom printing',
    photoUrl: 'https://via.placeholder.com/150?text=Premium+Box',
    dimensions: '25 × 25 × 10 cm',
    materialCost: 2.50,
  },
  {
    id: 'pkg-4',
    name: 'Small Sample (250g)',
    description: 'Compact pouch perfect for samples',
    photoUrl: 'https://via.placeholder.com/150?text=250g+Pouch',
    dimensions: '15 × 20 cm',
    materialCost: 0.20,
  },
];

export const PackagingSelector: React.FC<PackagingSelectorProps> = ({
  selected,
  onChange,
  showPhotos = true,
  readOnly = false,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Select Packaging</label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {MOCK_PACKAGINGS.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => !readOnly && onChange(pkg.id)}
            className={`border-2 rounded-lg p-3 cursor-pointer transition ${
              selected === pkg.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${readOnly ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md'}`}
          >
            {showPhotos && pkg.photoUrl && (
              <img
                src={pkg.photoUrl}
                alt={pkg.name}
                className="w-full h-20 object-cover rounded mb-2 bg-gray-100"
              />
            )}
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{pkg.name}</h4>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{pkg.description}</p>
            {pkg.dimensions && (
              <p className="text-xs text-gray-500 mt-1">📏 {pkg.dimensions}</p>
            )}
            {pkg.materialCost && (
              <p className="text-xs text-gray-700 mt-2 font-semibold">
                €{pkg.materialCost.toFixed(2)}
              </p>
            )}
          </div>
        ))}

        {/* Create Custom Option */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
          onClick={() => alert('Branding & custom packaging section coming soon!')}
        >
          <Plus className="w-6 h-6 text-gray-400 mb-1" />
          <p className="text-xs font-medium text-gray-600 text-center">Create your own</p>
          <p className="text-xs text-gray-500 text-center">packaging</p>
        </div>
      </div>
    </div>
  );
};

export default PackagingSelector;
