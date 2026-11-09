import { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ViewToggle } from '../components/ViewToggle';
import { DateRangeSlider } from '../components/DateRangeSlider';
import { products } from '../data/mockData';
import formatNumber from '../utils/numberFormat';
import { Store, Save, DollarSign, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

interface StoreConfig {
  enabled: boolean;
  maxKg: number;
  pricePerKg: number;
  startDate: string;
  endDate: string;
}

interface ProductStoreConfig {
  origo: StoreConfig;
  peakline: StoreConfig;
  ember: StoreConfig;
}

export function MultiStoreDistributionPanel() {
  const myProducts = products.filter(p => p.owner === 'Costa Coffee Co.');
  const [viewMode, setViewMode] = useState<'product' | 'storefront'>('product');
  
  const [configurations, setConfigurations] = useState<Record<string, ProductStoreConfig>>(
    myProducts.reduce((acc, product) => {
      acc[product.id] = {
        origo: {
          enabled: true,
          maxKg: Math.floor(product.stock * 0.5),
          pricePerKg: product.price,
          startDate: '2026-03-27',
          endDate: '2026-06-27',
        },
        peakline: {
          enabled: true,
          maxKg: Math.floor(product.stock * 0.3),
          pricePerKg: product.price * 0.9, // 10% discount
          startDate: '2026-03-27',
          endDate: '2026-06-27',
        },
        ember: {
          enabled: true,
          maxKg: Math.floor(product.stock * 0.2),
          pricePerKg: product.price * 0.85, // 15% discount for bulk
          startDate: '2026-03-27',
          endDate: '2026-06-27',
        },
      };
      return acc;
    }, {} as Record<string, ProductStoreConfig>)
  );

  const [selectedProduct, setSelectedProduct] = useState<string | null>(myProducts[0]?.id || null);
  const [selectedStorefront, setSelectedStorefront] = useState<'origo' | 'peakline' | 'ember'>('origo');

  const STOREFRONTS = [
    { key: 'origo' as const, label: 'Origo', color: 'blue', description: 'Premium B2B Coffee Exchange' },
    { key: 'peakline' as const, label: 'Peakline', color: 'slate', description: 'Emerging Markets Platform' },
    { key: 'ember' as const, label: 'Ember', color: 'emerald', description: 'Specialty Roasters & Traders' },
  ];

  const updateConfig = (
    productId: string,
    store: keyof ProductStoreConfig,
    field: keyof StoreConfig,
    value: any
  ) => {
    setConfigurations(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [store]: {
          ...prev[productId][store],
          [field]: value,
        },
      },
    }));
  };

  const getTotalAllocated = (productId: string) => {
    const config = configurations[productId];
    return (config.origo.enabled ? config.origo.maxKg : 0) +
           (config.peakline.enabled ? config.peakline.maxKg : 0) +
           (config.ember.enabled ? config.ember.maxKg : 0);
  };

  const selectedProductData = myProducts.find(p => p.id === selectedProduct);
  const selectedConfig = selectedProduct ? configurations[selectedProduct] : null;

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A] flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Sell Across Multiple Channels
          </h1>
          <p className="text-gray-600 mt-1">Set pricing and availability for each marketplace — reach different buyer segments with customized strategies</p>
        </div>
        <div className="flex items-center gap-4">
          <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
          <button className="bg-[#0B1F3A] text-white px-6 py-3 rounded-lg hover:bg-[#0B1F3A]/90 font-medium flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save All Changes
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Origo</h3>
              <p className="text-sm text-gray-700">Premium B2B Coffee Exchange</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-700 bg-white/50 rounded p-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Target Buyer:</span>
              <span className="font-medium">Specialty Roasters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Typical Order:</span>
              <span className="font-medium">500–2000 kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Strategy:</span>
              <span className="font-medium">Standard Pricing</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center text-white font-bold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Peakline</h3>
              <p className="text-sm text-gray-700">Emerging Markets Platform</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-700 bg-white/50 rounded p-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Target Buyer:</span>
              <span className="font-medium">Small Coffee Shops</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Typical Order:</span>
              <span className="font-medium">100–500 kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Strategy:</span>
              <span className="font-medium">Promotional Pricing</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Ember</h3>
              <p className="text-sm text-gray-700">Specialty Roasters & Traders</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-700 bg-white/50 rounded p-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Target Buyer:</span>
              <span className="font-medium">Volume Buyers</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Typical Order:</span>
              <span className="font-medium">1000+ kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Strategy:</span>
              <span className="font-medium">Volume Discounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-[#0B1F3A] mb-4">
          {viewMode === 'product' 
            ? 'Choose a Product to Customize Pricing & Availability' 
            : 'Choose a Marketplace to View Your Offerings'}
        </h2>
        {viewMode === 'product' ? (
          // BY PRODUCT VIEW - Product selector
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {myProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedProduct === product.id
                    ? 'border-[#0B1F3A] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-600 mt-1">{product.origin}</div>
                <div className="text-sm font-medium text-[#0B1F3A] mt-2">
                  {formatNumber(product.stock)} units available
                </div>
              </button>
            ))}
          </div>
        ) : (
          // BY STOREFRONT VIEW - Storefront selector
          <div className="grid md:grid-cols-3 gap-3">
            {STOREFRONTS.map((store) => (
              <button
                key={store.key}
                onClick={() => setSelectedStorefront(store.key)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedStorefront === store.key
                    ? `border-${store.color}-600 bg-${store.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{store.label}</div>
                <div className="text-sm text-gray-600 mt-1">{store.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {viewMode === 'product' ? (
        // BY PRODUCT VIEW CONTENT
        <>
      {/* Detailed Configuration for Selected Product */}
      {selectedProductData && selectedConfig && (
        <>
          <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1a3a5f] rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedProductData.name}</h2>
                <p className="text-gray-300">
                  Total Stock: {formatNumber(selectedProductData.stock)} units • 
                  Allocated: {formatNumber(getTotalAllocated(selectedProductData.id))} kg •
                  Available: {formatNumber(selectedProductData.stock - getTotalAllocated(selectedProductData.id))} units
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Base Price</p>
                <p className="text-3xl font-bold">€{formatNumber(selectedProductData.price.toFixed(2), 2)}/kg</p>
              </div>
            </div>
          </div>

          {/* Store Configurations */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Origo Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Store className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Origo</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedConfig.origo.enabled}
                      onChange={(e) => updateConfig(selectedProductData.id, 'origo', 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Price per kg
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedConfig.origo.pricePerKg}
                      onChange={(e) => updateConfig(selectedProductData.id, 'origo', 'pricePerKg', parseFloat(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!selectedConfig.origo.enabled}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedConfig.origo.pricePerKg === selectedProductData.price 
                      ? 'Standard price' 
                      : selectedConfig.origo.pricePerKg > selectedProductData.price
                      ? `+€${(selectedConfig.origo.pricePerKg - selectedProductData.price).toFixed(2)} premium`
                      : `-€${(selectedProductData.price - selectedConfig.origo.pricePerKg).toFixed(2)} discount`}
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    Maximum Stock (units)
                  </label>
                  <input
                    type="number"
                    value={selectedConfig.origo.maxKg}
                    onChange={(e) => updateConfig(selectedProductData.id, 'origo', 'maxKg', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedConfig.origo.enabled}
                    max={selectedProductData.stock}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <Calendar className="w-4 h-4" />
                    Availability Period
                  </label>
                  <DateRangeSlider
                    startDate={new Date(selectedConfig.origo.startDate)}
                    endDate={new Date(selectedConfig.origo.endDate)}
                    onChange={(range) => {
                      updateConfig(selectedProductData.id, 'origo', 'startDate', range.startDate.toISOString().split('T')[0]);
                      updateConfig(selectedProductData.id, 'origo', 'endDate', range.endDate?.toISOString().split('T')[0] || '2026-12-31');
                    }}
                    minDate={new Date(2026, 0, 1)}
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Potential Revenue:</span>
                    <span className="font-bold text-gray-900">€{formatNumber(selectedConfig.origo.maxKg * selectedConfig.origo.pricePerKg, 2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Peakline Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-purple-50 border-b border-purple-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Store className="w-6 h-6 text-purple-600" />
                    <h3 className="font-bold text-gray-900">Peakline</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedConfig.peakline.enabled}
                      onChange={(e) => updateConfig(selectedProductData.id, 'peakline', 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Price per kg
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedConfig.peakline.pricePerKg}
                      onChange={(e) => updateConfig(selectedProductData.id, 'peakline', 'pricePerKg', parseFloat(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={!selectedConfig.peakline.enabled}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedConfig.peakline.pricePerKg === selectedProductData.price ? 'Standard price' : selectedConfig.peakline.pricePerKg > selectedProductData.price ? `+€${(selectedConfig.peakline.pricePerKg - selectedProductData.price).toFixed(2)} premium` : `-€${(selectedProductData.price - selectedConfig.peakline.pricePerKg).toFixed(2)} discount`}
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    Maximum Stock (units)
                  </label>
                  <input
                    type="number"
                    value={selectedConfig.peakline.maxKg}
                    onChange={(e) => updateConfig(selectedProductData.id, 'peakline', 'maxKg', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={!selectedConfig.peakline.enabled}
                    max={selectedProductData.stock}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <Calendar className="w-4 h-4" />
                    Availability Period
                  </label>
                  <DateRangeSlider
                    startDate={new Date(selectedConfig.peakline.startDate)}
                    endDate={new Date(selectedConfig.peakline.endDate)}
                    onChange={(range) => {
                      updateConfig(selectedProductData.id, 'peakline', 'startDate', range.startDate.toISOString().split('T')[0]);
                      updateConfig(selectedProductData.id, 'peakline', 'endDate', range.endDate?.toISOString().split('T')[0] || '2026-12-31');
                    }}
                    minDate={new Date(2026, 0, 1)}
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Potential Revenue:</span>
                    <span className="font-bold text-gray-900">€{formatNumber(selectedConfig.peakline.maxKg * selectedConfig.peakline.pricePerKg, 2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ember Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-green-50 border-b border-green-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Store className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">Ember</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedConfig.ember.enabled}
                      onChange={(e) => updateConfig(selectedProductData.id, 'ember', 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Price per kg
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedConfig.ember.pricePerKg}
                      onChange={(e) => updateConfig(selectedProductData.id, 'ember', 'pricePerKg', parseFloat(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={!selectedConfig.ember.enabled}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedConfig.ember.pricePerKg === selectedProductData.price ? 'Standard price' : selectedConfig.ember.pricePerKg > selectedProductData.price ? `+€${(selectedConfig.ember.pricePerKg - selectedProductData.price).toFixed(2)} premium` : `-€${(selectedProductData.price - selectedConfig.ember.pricePerKg).toFixed(2)} discount`}
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    Maximum Stock (units)
                  </label>
                  <input
                    type="number"
                    value={selectedConfig.ember.maxKg}
                    onChange={(e) => updateConfig(selectedProductData.id, 'ember', 'maxKg', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={!selectedConfig.ember.enabled}
                    max={selectedProductData.stock}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <Calendar className="w-4 h-4" />
                    Availability Period
                  </label>
                  <DateRangeSlider
                    startDate={new Date(selectedConfig.ember.startDate)}
                    endDate={new Date(selectedConfig.ember.endDate)}
                    onChange={(range) => {
                      updateConfig(selectedProductData.id, 'ember', 'startDate', range.startDate.toISOString().split('T')[0]);
                      updateConfig(selectedProductData.id, 'ember', 'endDate', range.endDate?.toISOString().split('T')[0] || '2026-12-31');
                    }}
                    minDate={new Date(2026, 0, 1)}
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Potential Revenue:</span>
                    <span className="font-bold text-gray-900">€{formatNumber(selectedConfig.ember.maxKg * selectedConfig.ember.pricePerKg, 2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold text-[#0B1F3A] mb-4">Configuration Summary</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Stock:</span>
                  <span className="font-medium text-gray-900">{formatNumber(selectedProductData.stock)} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Allocated:</span>
                  <span className="font-medium text-gray-900">{formatNumber(getTotalAllocated(selectedProductData.id))} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unallocated:</span>
                  <span className={`font-medium ${selectedProductData.stock - getTotalAllocated(selectedProductData.id) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatNumber(selectedProductData.stock - getTotalAllocated(selectedProductData.id))} units
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium text-gray-900">€{selectedProductData.price.toFixed(2)}/kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Potential Revenue:</span>
                  <span className="font-bold text-green-600">€{formatNumber((selectedConfig.origo.enabled ? selectedConfig.origo.maxKg * selectedConfig.origo.pricePerKg : 0) + (selectedConfig.peakline.enabled ? selectedConfig.peakline.maxKg * selectedConfig.peakline.pricePerKg : 0) + (selectedConfig.ember.enabled ? selectedConfig.ember.maxKg * selectedConfig.ember.pricePerKg : 0), 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Stores:</span>
                  <span className="font-medium text-gray-900">{[selectedConfig.origo.enabled, selectedConfig.peakline.enabled, selectedConfig.ember.enabled].filter(Boolean).length} / 3</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-[#0B1F3A] mb-3">Pricing & Distribution Strategy Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Different pricing per store:</strong> Set competitive prices for each marketplace based on your target audience</li>
          <li>• <strong>Time-limited offers:</strong> Create urgency with promotional periods, especially useful for seasonal products</li>
          <li>• <strong>Maximum stock limits:</strong> Protect your inventory by setting caps - prevents over-allocation to discount channels</li>
          <li>• <strong>SKU tracking:</strong> All products are tracked as SKUs (stock keeping units) - already packaged and branded</li>
          <li>• <strong>Keep buffer stock:</strong> Leave some stock unallocated for flexibility and direct orders</li>
        </ul>
      </div>
        </>
      ) : (
        // BY STOREFRONT VIEW CONTENT
        <>
      {/* Storefront Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-bold text-[#0B1F3A] mb-4">Products on {STOREFRONTS.find(s => s.key === selectedStorefront)?.label}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Allocation (kg)</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Revenue Potential</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myProducts.map(p => {
                const cfg = configurations[p.id];
                const storeKey = selectedStorefront;
                const storeConfig = cfg ? cfg[storeKey] : null;
                const revenuePotential = storeConfig && storeConfig.enabled ? (storeConfig.maxKg * storeConfig.pricePerKg).toFixed(2) : '0.00';
                
                return (
                  <tr key={`${p.id}-${storeKey}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3">
                      {storeConfig?.enabled ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{storeConfig?.enabled ? `${storeConfig.maxKg} kg` : '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{storeConfig?.enabled ? `€${storeConfig.pricePerKg.toFixed(2)}/kg` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {storeConfig?.enabled ? `${storeConfig.startDate} → ${storeConfig.endDate}` : '—'}
                    </td>
                    <td className="px-4 py-3 font-bold text-green-600">€{revenuePotential}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => {setSelectedProduct(p.id); setViewMode('product');}} className="px-3 py-1 bg-[#0B1F3A] text-white rounded-md text-xs">Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Storefront Tips */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
        <h3 className="font-bold text-[#0B1F3A] mb-3">Multi-Channel Strategy Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Segment by Channel:</strong> Each marketplace serves different buyers — adjust pricing accordingly</li>
          <li>• <strong>Time-Limited Offers:</strong> Use the timeline slider to run promotional periods on specific channels</li>
          <li>• <strong>Stock Protection:</strong> Set maximum allocation caps to prevent overselling across channels</li>
          <li>• <strong>Revenue Optimization:</strong> Monitor potential revenue for each channel — it's calculated in real-time</li>
          <li>• <strong>Buffer Stock:</strong> Always keep some inventory unallocated for direct sales and opportunities</li>
        </ul>
      </div>
        </>
      )}
    </div>
  );
}

export default function MultiStoreDistribution() {
  return (
      <MultiStoreDistributionPanel />
  );
}

