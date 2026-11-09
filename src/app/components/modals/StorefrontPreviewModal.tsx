import React, { useState } from 'react';
import { X, ShoppingCart, Minus, Plus, MapPin } from 'lucide-react';
import { products } from '../../data/mockData';

interface StorefrontPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  storefront: any;
  config?: any;
}

export function StorefrontPreviewModal({
  isOpen,
  onClose,
  storefront,
  config = {}
}: StorefrontPreviewModalProps) {
  const [cartItems, setCartItems] = useState<Array<{ productId: string; quantity: number }>>([]);

  if (!isOpen || !storefront) return null;

  const primaryColor = config?.primaryColor || '#8B4513';
  const accentColor = config?.accentColor || '#D2B48C';

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '139, 69, 19';
  };

  const storefrontProducts = products.filter(
    p => p.owner === storefront.owner && p.status === 'selling'
  );

  const handleAddToCart = (productId: string) => {
    const existing = cartItems.find(item => item.productId === productId);
    if (existing) {
      setCartItems(
        cartItems.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { productId, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCartItems(
        cartItems.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const product = storefrontProducts.find(p => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className="text-white px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: primaryColor }}
        >
          <div>
            <h2 className="text-2xl font-bold">{storefront.name}</h2>
            <p className="text-sm mt-1" style={{ color: accentColor }}>
              {storefront.description || 'Premium Products'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-80 transition-opacity"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Products */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Available Products
              </h3>
              <div className="space-y-3">
                {storefrontProducts.length === 0 ? (
                  <p className="text-gray-500">No products available</p>
                ) : (
                  storefrontProducts.map(product => (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      style={{ borderTopColor: accentColor, borderTopWidth: '3px' }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            €{product.price?.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          className="p-2 rounded hover:bg-gray-100 transition-colors"
                          style={{ color: primaryColor }}
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                      {(product as any).description && (
                        <p className="text-xs text-gray-600">
                          {(product as any).description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Shopping Cart
              </h3>
              <div
                className="border rounded-lg p-4"
                style={{ backgroundColor: `rgba(${hexToRgb(accentColor)}, 0.05)` }}
              >
                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Cart is empty
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {cartItems.map(cartItem => {
                        const product = storefrontProducts.find(
                          p => p.id === cartItem.productId
                        );
                        const itemTotal =
                          (product?.price || 0) * cartItem.quantity;

                        return (
                          <div
                            key={cartItem.productId}
                            className="flex items-center justify-between bg-white p-3 rounded"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {product?.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                €{itemTotal.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    cartItem.productId,
                                    cartItem.quantity - 1
                                  )
                                }
                                className="p-1 hover:bg-gray-100 rounded"
                                style={{ color: primaryColor }}
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    cartItem.productId,
                                    cartItem.quantity + 1
                                  )
                                }
                                className="p-1 hover:bg-gray-100 rounded"
                                style={{ color: primaryColor }}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-900">
                          Total:
                        </span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: primaryColor }}
                        >
                          €{cartTotal.toFixed(2)}
                        </span>
                      </div>
                      <button
                        className="w-full py-2 rounded font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <ShoppingCart className="inline mr-2" size={18} />
                        Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
