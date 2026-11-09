import { useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  ShoppingCart,
  Package,
  MapPin,
  TrendingUp,
  ArrowLeft,
  Star,
  Store,
} from 'lucide-react';
import { products } from '../data/mockData';
import { Navigation } from '../components/Navigation';
import { StorefrontPreviewModal } from '../components/modals';
import formatNumber from '../utils/numberFormat';
import { loadStorefrontConfig } from '../utils/storefrontConfig';

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const [showStorefrontPreview, setShowStorefrontPreview] = useState(false);
  const [selectedStorefront, setSelectedStorefront] = useState<any>(null);
  const [storefrontConfig, setStorefrontConfig] = useState<any>({});

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
            <Link
              to="/marketplace"
              className="text-blue-600 hover:underline mt-4 inline-block"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice =
    product.price * ((product as any).moq || 1) * ((product as any).minOrderQty || 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link to="/marketplace" className="text-blue-600 hover:underline">
            Marketplace
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Image */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
              <div className="aspect-square bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">☕</div>
                  <p className="text-gray-600">{product.category}</p>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {product.name}
                  </h1>
                  <p className="text-gray-600 mt-2 flex items-center gap-2">
                    <MapPin size={18} />
                    {product.origin}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < 4
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price per Unit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{product.price.toFixed(2)}/kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available Stock</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(product.stock)} kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Minimum Order
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(product as any).moq || 100} kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {product.category}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-gray-900">
                      Warehouse:
                    </span>{' '}
                    {product.warehouse}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Status:</span>{' '}
                    {product.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium text-gray-900">
                    €{product.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Order:</span>
                  <span className="font-medium text-gray-900">
                    {(product as any).moq || 100} kg
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    €
                    {formatNumber(totalPrice.toFixed(2), 2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping:</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <button className="w-full bg-[#0B1F3A] text-white py-4 rounded-lg hover:bg-[#0B1F3A]/90 font-medium flex items-center justify-center gap-2 mb-3">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="w-full border border-[#0B1F3A] text-[#0B1F3A] py-4 rounded-lg hover:bg-[#0B1F3A]/5 font-medium">
                Request Sample
              </button>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-3">
              Seller Information
            </h3>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-[#0B1F3A] rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{product.owner}</p>
                <p className="text-sm text-gray-600">Verified Supplier</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    98% Positive Rating
                  </span>
                </div>
              </div>
            </div>

            {/* Visit Store Button */}
            <button
              onClick={() => {
                const config = loadStorefrontConfig(product.owner);
                setSelectedStorefront({ name: product.owner, owner: product.owner });
                setStorefrontConfig(config);
                setShowStorefrontPreview(true);
              }}
              style={{
                backgroundColor: loadStorefrontConfig(product.owner)
                  .primaryColor,
              }}
              className="w-full hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Store size={20} />
              Visit Store
            </button>
          </div>
        </div>

        {/* Product Description */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Description
          </h2>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              This premium {product.name} is sourced directly from{' '}
              {product.origin}, ensuring the highest quality and traceability.
              Perfect for specialty roasters and coffee enthusiasts looking for
              exceptional flavor profiles and consistent quality.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Flavor Profile
            </h3>
            <p className="mb-4">
              Known for its distinctive characteristics typical of{' '}
              {product.origin} beans, this coffee offers a unique tasting
              experience that will delight your customers.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Storage & Handling
            </h3>
            <p>
              Stored in our climate-controlled warehouse in {product.warehouse}
              , maintaining optimal conditions for freshness. All shipments are
              packaged in food-grade materials to preserve quality during
              transit.
            </p>
          </div>
        </div>
      </div>

      {/* Storefront Preview Modal */}
      <StorefrontPreviewModal
        isOpen={showStorefrontPreview}
        onClose={() => setShowStorefrontPreview(false)}
        storefront={selectedStorefront}
        config={storefrontConfig}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2026 MarketSell / Origo Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
