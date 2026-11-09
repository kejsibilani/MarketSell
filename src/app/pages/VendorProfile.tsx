import { useParams, Link } from 'react-router';
import { Package, MapPin, Star, TrendingUp, Award, Calendar } from 'lucide-react';
import { products } from '../data/mockData';
import formatNumber from '../utils/numberFormat';
import { Navigation } from '../components/Navigation';

export default function VendorProfile() {
  const { id } = useParams();

  // Mock vendor data
  const vendor = {
    id: id || '1',
    name: 'Costa Coffee Co.',
    type: 'Producer',
    location: 'Costa Rica',
    rating: 4.8,
    totalReviews: 127,
    yearsActive: 5,
    description: 'Family-owned coffee farm in the highlands of Costa Rica, specializing in high-altitude specialty Arabica beans. We focus on sustainable farming practices and direct trade relationships.',
    certifications: ['Organic', 'Fair Trade', 'Rainforest Alliance'],
    stats: {
      totalSales: '45,200 kg',
      activeProducts: 4,
      averageRating: 4.8,
      responseTime: '< 2 hours',
    },
  };

  const vendorProducts = products.filter(p => p.owner === vendor.name);


  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Navigation */}
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/marketplace" className="hover:text-[#0B1F3A]">Marketplace</Link>
            <span>/</span>
            <span className="text-gray-900">Vendor Profile</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Vendor Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#0B1F3A] to-[#1a3a5f] rounded-lg flex items-center justify-center text-white text-3xl font-bold">
                {vendor.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-[#0B1F3A]">{vendor.name}</h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {vendor.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{vendor.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{vendor.rating}</span>
                    <span>({vendor.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{vendor.yearsActive} years on platform</span>
                  </div>
                </div>
                <p className="text-gray-700 max-w-2xl">{vendor.description}</p>
              </div>
            </div>
            <button className="bg-[#0B1F3A] text-white px-6 py-3 rounded-lg hover:bg-[#0B1F3A]/90 font-medium">
              Contact Vendor
            </button>
          </div>

          {/* Certifications */}
          <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
            <Award className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Certifications:</span>
            <div className="flex gap-2">
              {vendor.certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Sales</div>
            <div className="text-2xl font-bold text-[#0B1F3A]">{vendor.stats.totalSales}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Active Products</div>
            <div className="text-2xl font-bold text-[#0B1F3A]">{vendor.stats.activeProducts}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Average Rating</div>
            <div className="text-2xl font-bold text-[#0B1F3A] flex items-center gap-2">
              {vendor.stats.averageRating}
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Response Time</div>
            <div className="text-2xl font-bold text-[#0B1F3A]">{vendor.stats.responseTime}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-[#0B1F3A]">Products from {vendor.name}</h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {vendorProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/marketplace/${product.id}`}
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#0B1F3A] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-8 h-8 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{product.origin}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-[#0B1F3A]">
                              €{formatNumber(product.price.toFixed(2), 2)}/kg
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatNumber(product.stock)} units available
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-[#0B1F3A]">Customer Reviews</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600">No reviews yet.</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mt-6">
              <h3 className="font-bold text-gray-900 mb-3">About Producer Partners</h3>
              <p className="text-sm text-gray-700 mb-4">
                All producers on MarketSell are verified and committed to quality and sustainability.
              </p>
              <Link to="/marketplace" className="text-[#0B1F3A] hover:underline font-medium text-sm">
                Browse More Producers →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}