import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { 
  Search, 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag, 
  Eye, 
  Layers, 
  UserCheck, 
  Building 
} from 'lucide-react';
import { products, MOCK_SALES_ORDERS, MOCK_SHIPMENTS } from '../data/mockData';
import formatNumber from '../utils/numberFormat';
import { Navigation } from '../components/Navigation';

interface CartItem {
  productId: string;
  quantity: number;
}

// ----------------------------------------------------------------------
// Buyer Past Orders & Shipment Tracker Modal / Drawer Component
// ----------------------------------------------------------------------
function BuyerOrdersModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter sales orders for buyer view (using mock orders)
  const myOrders = MOCK_SALES_ORDERS;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fulfilled':
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle size={12} /> Delivered</span>;
      case 'partial':
      case 'in_transit':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 flex items-center gap-1"><Truck size={12} /> In Transit</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1"><Clock size={12} /> Processing</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0B1F3A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-amber-400" size={24} />
            <div>
              <h2 className="text-xl font-bold">My Orders & Shipments</h2>
              <p className="text-xs text-gray-300">Track order statuses, delivery progress, and shipment details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {myOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No order history found</p>
            </div>
          ) : (
            myOrders.map((order: any) => {
              const isExpanded = expandedOrderId === order.id;

              // Find associated shipments
              const linkedShipmentIds = new Set<string>();
              order.items?.forEach((item: any) => {
                item.linkedShipmentIds?.forEach((id: string) => linkedShipmentIds.add(id));
              });

              const orderShipments = MOCK_SHIPMENTS.filter((s: any) => 
                Array.from(linkedShipmentIds).includes(s.shipmentId) || Array.from(linkedShipmentIds).includes(s.id)
              );

              return (
                <div key={order.id} className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                  {/* Summary Bar */}
                  <div className="p-4 flex flex-wrap items-center justify-between gap-4 bg-white hover:bg-gray-50/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">#{order.orderId}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Ordered on {new Date(order.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {order.items?.length || 0} items
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total Value</p>
                        <p className="text-sm font-bold text-[#0B1F3A]">€{(order.totalValue || 0).toFixed(2)}</p>
                      </div>

                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-md transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'Track Order'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Accordion Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-slate-50 p-4 space-y-4">
                      {/* Items Purchased */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Package size={14} className="text-amber-600" /> Items in Order
                        </h4>
                        <div className="divide-y divide-gray-100">
                          {order.items?.map((item: any, idx: number) => {
                            const product = products.find(p => p.id === item.skuId);
                            const shipped = item.shippedQuantity || 0;
                            return (
                              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                                <div>
                                  <p className="font-semibold text-gray-900">{product?.name || item.skuId}</p>
                                  <p className="text-gray-500 text-[11px]">SKU: {item.skuId}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">{item.quantity} units x €{(item.price || 0).toFixed(2)}</p>
                                  <p className="text-[11px] text-green-600 font-semibold">{shipped} shipped</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Shipment Tracking Details */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Truck size={14} className="text-blue-600" /> Live Shipments & Packages ({orderShipments.length})
                        </h4>

                        {orderShipments.length === 0 ? (
                          <p className="text-xs text-gray-500 italic py-2">No active shipment dispatches assigned yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {orderShipments.map((shipment: any) => (
                              <div key={shipment.id} className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-blue-900">{shipment.shipmentId}</span>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                                      {shipment.carrier}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 mt-1 font-mono text-[11px]">
                                    Tracking: {shipment.trackingReference || shipment.trackingNumber || 'Pending'}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    shipment.status === 'in_transit' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {shipment.status}
                                  </span>
                                  <p className="text-[11px] text-gray-500 mt-1">{shipment.units || '—'} units total</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-3 bg-white flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Storefront Preview Modal Component
// ----------------------------------------------------------------------
function StorefrontPreviewModal({ isOpen, onClose, storefront, onAddToCart }: any) {
  if (!isOpen || !storefront) return null;

  const storefrontProducts = products.filter(p => p.owner === storefront.owner && p.status === 'selling');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{storefront.name}</h2>
            <p className="text-amber-100 text-sm mt-1">☕ Direct Vendor Storefront</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-amber-100">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Vendor Catalog</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storefrontProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg flex items-center justify-center mb-3">
                  <div className="text-center">
                    <div className="text-4xl mb-2">☕</div>
                    <p className="text-xs text-gray-600">{product.category}</p>
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{product.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{product.origin}</p>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="font-bold text-amber-900">€{product.price.toFixed(2)}/kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Stock</p>
                    <p className="text-sm font-medium">{formatNumber(product.stock)}</p>
                  </div>
                </div>
                <button
                  onClick={() => onAddToCart(product.id)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Marketplace Component (Buyer View)
// ----------------------------------------------------------------------
export default function MarketplaceStore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  
  // Buyer Navigation & Modals State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [showStorefrontPreview, setShowStorefrontPreview] = useState(false);
  const [selectedStorefront, setSelectedStorefront] = useState<any>(null);

  const availableProducts = products.filter(p => p.status === 'selling');
  const origins = ['all', ...new Set(products.map(p => p.origin))];
  const vendors = ['all', ...new Set(products.map(p => p.owner))];

  // Cart Handlers
  const handleAddToCart = (productId: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => {
    const prod = products.find(p => p.id === item.productId);
    return sum + (prod?.price || 0) * item.quantity;
  }, 0);

  const filteredProducts = availableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.origin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = priceFilter === 'all' ||
                        (priceFilter === 'low' && product.price < 8) ||
                        (priceFilter === 'medium' && product.price >= 8 && product.price < 10) ||
                        (priceFilter === 'high' && product.price >= 10);
    const matchesOrigin = originFilter === 'all' || product.origin === originFilter;
    const matchesVendor = vendorFilter === 'all' || product.owner === vendorFilter;
    return matchesSearch && matchesPrice && matchesOrigin && matchesVendor;
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Top Application Navigation */}
      <Navigation />

      {/* Buyer Specific Header Bar (Cart & Orders Shortcut) */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">Marketplace Storefront</span>
            <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">Buyer View</span>
          </div>

          <div className="flex items-center gap-3">
            {/* My Orders Button */}
            <button
              onClick={() => setIsOrdersModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Package size={16} className="text-[#0B1F3A]" />
              <span>My Orders & Shipments</span>
            </button>

            {/* Floating Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-1.5 bg-[#0B1F3A] hover:bg-[#122e54] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <ShoppingCart size={16} className="text-amber-400" />
              <span>Cart</span>
              {cartTotalCount > 0 && (
                <span className="ml-1 bg-amber-500 text-gray-900 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {cartTotalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#0B1F3A] to-[#1a3a5f] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Premium Coffee, Direct from Source</h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Browse our selection of high-quality green and roasted coffee beans from verified suppliers across the globe.
          </p>
        </div>
      </div>

      {/* Main Catalog View */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name or origin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="low">Under €8</option>
                <option value="medium">€8 - €10</option>
                <option value="high">Over €10</option>
              </select>
              <select
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
              >
                {origins.map(origin => (
                  <option key={origin} value={origin}>
                    {origin === 'all' ? 'All Origins' : origin}
                  </option>
                ))}
              </select>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
              >
                {vendors.map(vendor => (
                  <option key={vendor} value={vendor}>
                    {vendor === 'all' ? 'All Vendors' : vendor}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> products available for direct purchase
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square bg-gradient-to-br from-amber-50/50 to-gray-100 flex items-center justify-center p-6 relative">
                  <div className="text-center">
                    <div className="text-5xl mb-2">☕</div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{product.category}</p>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <Link to={`/marketplace/${product.id}`} className="font-bold text-gray-900 text-base hover:text-blue-600 transition-colors line-clamp-1">
                    {product.name}
                  </Link>
                  <p className="text-xs text-gray-500 font-medium">Origin: {product.origin}</p>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Unit Price</p>
                      <p className="text-lg font-bold text-[#0B1F3A]">€{product.price.toFixed(2)}<span className="text-xs text-gray-500 font-normal">/kg</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">In Stock</p>
                      <p className="text-xs font-semibold text-gray-800">{formatNumber(product.stock)} units</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 pt-0 space-y-2">
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className="w-full bg-[#0B1F3A] hover:bg-[#163866] text-white text-xs font-bold py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={14} className="text-amber-400" />
                  Add to Cart
                </button>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <span className="text-gray-400">Vendor:</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedStorefront({ name: product.owner, owner: product.owner });
                      setShowStorefrontPreview(true);
                    }}
                    className="font-semibold text-amber-800 hover:underline bg-amber-50 px-2 py-0.5 rounded"
                  >
                    {product.owner}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sliding Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
            <div className="p-4 bg-[#0B1F3A] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-amber-400" size={20} />
                <h3 className="font-bold text-base">Shopping Cart ({cartTotalCount})</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-300 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <ShoppingCart size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">Your cart is empty</p>
                </div>
              ) : (
                cartItems.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  const itemTotal = product.price * item.quantity;

                  return (
                    <div key={item.productId} className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">€{product.price.toFixed(2)} / kg</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2 bg-white rounded border border-gray-300 px-2 py-1">
                          <button onClick={() => handleUpdateCartQty(item.productId, -1)} className="text-gray-600 hover:text-black">
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold text-gray-900 px-1">{item.quantity}</span>
                          <button onClick={() => handleUpdateCartQty(item.productId, 1)} className="text-gray-600 hover:text-black">
                            <Plus size={12} />
                          </button>
                        </div>

                        <span className="font-bold text-gray-900 text-sm">€{itemTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-lg font-bold text-[#0B1F3A]">€{cartSubtotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    alert('Order submitted successfully! You can track progress under "My Orders & Shipments".');
                    setCartItems([]);
                    setIsCartOpen(false);
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg text-sm transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buyer Orders Modal */}
      <BuyerOrdersModal isOpen={isOrdersModalOpen} onClose={() => setIsOrdersModalOpen(false)} />

      {/* Storefront Modal */}
      <StorefrontPreviewModal 
        isOpen={showStorefrontPreview}
        onClose={() => setShowStorefrontPreview(false)}
        storefront={selectedStorefront}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}