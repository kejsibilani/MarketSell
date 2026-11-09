import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Save, Image, Palette, CheckCircle, Clock, AlertCircle, Zap, Link as LinkIcon, Eye, Search, LayoutGrid, ListFilter, TrendingUp, ArrowUpDown } from 'lucide-react';
import formatNumber from '../utils/numberFormat';
import { products } from '../data/mockData';

type StoreKey = 'origo' | 'peakline' | 'ember' | 'amazon' | 'ebay' | 'marketsell';
type StoreType = 'own' | 'thirdparty';

const OWN_STORES: { key: StoreKey; label: string; description: string }[] = [
  { key: 'origo', label: 'Origo', description: 'Premium B2B marketplace' },
  { key: 'peakline', label: 'Peakline', description: 'Emerging markets' },
  { key: 'ember', label: 'Ember', description: 'Bulk / raw materials' },
];

const THIRD_PARTY_STORES: { key: StoreKey; label: string; description: string }[] = [
  { key: 'marketsell', label: 'MarketSell', description: 'Products only, no branding' },
  { key: 'origo', label: 'Origo', description: 'Products only, no branding' },
];

function BrandForm({ storeKey, config, onChange, onNavigateToFees, onPreview }: { storeKey: StoreKey; config: any; onChange: (patch: any) => void; onNavigateToFees: () => void; onPreview?: () => void }) {
  const pricingStatus = config.pricingStatus || 'inactive';
  const promotionActive = config.promotionActive || false;

  const getPricingStatusUI = () => {
    switch (pricingStatus) {
      case 'set':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          title: 'Pricing Configured',
          subtitle: 'Prices are set and ready',
          badge: 'bg-green-50 text-green-700 border-green-200',
          badgeText: 'Active'
        };
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5 text-amber-600" />,
          title: 'Pricing Pending',
          subtitle: 'Review and activate pricing',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          badgeText: 'Pending'
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-gray-500" />,
          title: 'No Pricing Set',
          subtitle: 'Configure pricing to enable sales',
          badge: 'bg-gray-50 text-gray-700 border-gray-200',
          badgeText: 'Inactive'
        };
    }
  };

  const statusUI = getPricingStatusUI();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Store Display Name</label>
        <input value={config.name} onChange={e => onChange({ name: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-lg" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tagline</label>
        <input value={config.tagline} onChange={e => onChange({ tagline: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-lg" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Primary Color</label>
        <input type="color" value={config.primaryColor} onChange={e => onChange({ primaryColor: e.target.value })} className="mt-1 h-10 w-20 p-0 border rounded" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Logo URL</label>
        <input value={config.logoUrl} onChange={e => onChange({ logoUrl: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-lg" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Theme</label>
        <select value={config.theme} onChange={e => onChange({ theme: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-lg">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Pricing Status Indicator */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Status</label>
        <div className={`border rounded-lg p-4 ${statusUI.badge} flex items-start gap-3`}>
          <div className="flex-shrink-0 mt-0.5">{statusUI.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">{statusUI.title}</div>
            <p className="text-sm opacity-80">{statusUI.subtitle}</p>
          </div>
          <button 
            onClick={onNavigateToFees} 
            className="flex-shrink-0 px-3 py-1 text-sm font-medium bg-white rounded hover:bg-gray-100 transition whitespace-nowrap"
          >
            Configure →
          </button>
        </div>
      </div>

      {/* Promotion Toggle */}
      {pricingStatus === 'set' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Promotions</label>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Zap className={`w-5 h-5 ${promotionActive ? 'text-purple-600' : 'text-gray-400'}`} />
            <div className="flex-1">
              <div className="font-semibold text-sm">Active Promotions</div>
              <p className="text-xs text-gray-600">{promotionActive ? 'Promotions are currently active' : 'No active promotions'}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={promotionActive} 
                onChange={e => onChange({ promotionActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        {onPreview && (
          <button 
            onClick={onPreview}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Eye className="w-4 h-4"/>
            Preview
          </button>
        )}
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0B1F3A] text-white rounded-lg hover:bg-[#0a1628] transition"><Save className="w-4 h-4"/> Save</button>
      </div>
    </div>
  );
}

function ThirdPartyProductList({ storeKey }: { storeKey: StoreKey }) {
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const assignedProducts = products.filter(p => p.owner === 'Costa Coffee Co.').slice(0, 8);

  const requestApproval = (productId: string) => setPending(prev => ({ ...prev, [productId]: true }));

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        <p>Products need approval before appearing on {storeKey === 'marketsell' ? 'MarketSell' : 'Origo'}.</p>
      </div>
      {assignedProducts.map(p => (
        <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-gray-500">{p.origin} • {formatNumber(p.stock)} units • €{p.price.toFixed(2)}</div>
          </div>
          <div className="flex items-center gap-2">
            {pending[p.id] ? (
              <span className="flex items-center gap-1 text-xs text-amber-600"><Clock className="w-4 h-4"/> Pending</span>
            ) : (
              <button onClick={() => requestApproval(p.id)} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Request Approval</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Storefront Performance (derived, deterministic mock metrics) ────────────
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function getStorefrontPerformance(productId: string, storeKey: StoreKey, price: number) {
  const rand = seededRandom(`${productId}-${storeKey}`);
  const unitsSold = Math.round(15 + rand() * 485);
  const views = Math.round(unitsSold * (6 + rand() * 14));
  const conversionRate = +((unitsSold / views) * 100).toFixed(1);
  const revenue = +(unitsSold * price).toFixed(2);
  const trend = rand() > 0.5 ? 'up' : 'down';
  const trendPct = +(rand() * 18 + 1).toFixed(1);
  return { unitsSold, views, conversionRate, revenue, trend, trendPct };
}

function PerformanceMatrix({ storefronts }: { storefronts: { key: StoreKey; label: string; description: string }[] }) {
  const myProducts = products.filter(p => p.owner === 'Costa Coffee Co.');
  const categories = Array.from(new Set(myProducts.map(p => p.category)));

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [demand, setDemand] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'revenue'>('revenue');
  const [visibleStores, setVisibleStores] = useState<StoreKey[]>(storefronts.map(s => s.key));

  const toggleStore = (key: StoreKey) => {
    setVisibleStores(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const activeStorefronts = storefronts.filter(s => visibleStores.includes(s.key));

  const rows = myProducts
    .filter(p => (category === 'all' || p.category === category))
    .filter(p => (demand === 'all' || p.demand === demand))
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .map(p => {
      const perf = Object.fromEntries(
        activeStorefronts.map(s => [s.key, getStorefrontPerformance(p.id, s.key, p.price)])
      ) as Record<string, ReturnType<typeof getStorefrontPerformance>>;
      const totalRevenue = Object.values(perf).reduce((sum, v) => sum + v.revenue, 0);
      const bestStore = activeStorefronts.reduce((best, s) => (!best || perf[s.key].revenue > perf[best.key].revenue) ? s : best, null as null | { key: StoreKey; label: string; description: string });
      return { product: p, perf, totalRevenue, bestStore };
    })
    .sort((a, b) => sortBy === 'revenue' ? b.totalRevenue - a.totalRevenue : a.product.name.localeCompare(b.product.name));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
          <ListFilter className="w-4 h-4" /> Filters
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={demand} onChange={e => setDemand(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="all">All Demand Levels</option>
            <option value="high">High Demand</option>
            <option value="medium">Medium Demand</option>
            <option value="low">Low Demand</option>
          </select>
          <button
            onClick={() => setSortBy(prev => prev === 'revenue' ? 'name' : 'revenue')}
            className="flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort: {sortBy === 'revenue' ? 'Revenue' : 'Name'}
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-500 mr-1">Storefronts:</span>
          {storefronts.map(s => (
            <button
              key={s.key}
              onClick={() => toggleStore(s.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                visibleStores.includes(s.key)
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                  : 'bg-white text-gray-500 border-gray-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Product</th>
                {activeStorefronts.map(s => (
                  <th key={s.key} className="px-4 py-3 text-center font-semibold text-gray-700 min-w-[140px]">{s.label}</th>
                ))}
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Best Performer</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 && (
                <tr><td colSpan={activeStorefronts.length + 3} className="px-4 py-8 text-center text-gray-500">No products match these filters</td></tr>
              )}
              {rows.map(({ product, perf, totalRevenue, bestStore }) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.category} • {product.origin}</div>
                  </td>
                  {activeStorefronts.map(s => {
                    const p = perf[s.key];
                    return (
                      <td key={s.key} className="px-4 py-3 text-center">
                        <div className="font-semibold text-gray-900">€{formatNumber(p.revenue)}</div>
                        <div className="text-xs text-gray-500">{p.unitsSold} units • {p.conversionRate}% conv.</div>
                        <div className={`text-xs flex items-center justify-center gap-1 mt-0.5 ${p.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                          <TrendingUp className={`w-3 h-3 ${p.trend === 'down' ? 'rotate-180' : ''}`} />
                          {p.trend === 'up' ? '+' : '-'}{p.trendPct}%
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center">
                    {bestStore && (
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        {bestStore.label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">€{formatNumber(totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function StorefrontBuilder() {
  const navigate = useNavigate();
  const myProducts = products.filter(p => p.owner === 'Costa Coffee Co.');

  const initialOwn = OWN_STORES.reduce((acc, s) => {
    acc[s.key] = { name: s.label, tagline: s.description, primaryColor: '#0b1f3a', logoUrl: '', theme: 'light', pricingStatus: 'set', promotionActive: false };
    return acc;
  }, {} as Record<StoreKey, any>);

  const initialThird = THIRD_PARTY_STORES.reduce((acc, s) => {
    acc[s.key] = { name: s.label, approved: 0, pending: 0, rejected: 0 };
    return acc;
  }, {} as Record<StoreKey, any>);

  const [tab, setTab] = useState<StoreType>('own');
  const [ownView, setOwnView] = useState<'editor' | 'matrix'>('editor');
  const [activeOwn, setActiveOwn] = useState<StoreKey>('origo');
  const [activeThird, setActiveThird] = useState<StoreKey>('marketsell');
  const [ownConfigs, setOwnConfigs] = useState<Record<StoreKey, any>>(initialOwn);
  const [thirdConfigs, setThirdConfigs] = useState<Record<StoreKey, any>>(initialThird);
  const [showPreview, setShowPreview] = useState(false);

  const updateOwn = (storeKey: StoreKey, patch: any) => setOwnConfigs(prev => ({ ...prev, [storeKey]: { ...prev[storeKey], ...patch } }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3A]">Storefront Builder</h1>
          <p className="text-sm text-gray-600">Manage your branded storefronts and 3rd-party marketplace presence.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setTab('own')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === 'own' ? 'bg-white shadow' : 'text-gray-600'}`}>My Own Storefronts</button>
        <button onClick={() => setTab('thirdparty')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === 'thirdparty' ? 'bg-white shadow' : 'text-gray-600'}`}>3rd Party Marketplaces</button>
      </div>

      {/* Own Storefronts Tab */}
      {tab === 'own' && (
        <div className="space-y-4">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setOwnView('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${ownView === 'editor' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              <Palette className="w-4 h-4" /> Storefront Editor
            </button>
            <button
              onClick={() => setOwnView('matrix')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${ownView === 'matrix' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Performance Matrix
            </button>
          </div>

          {ownView === 'matrix' ? (
            <PerformanceMatrix storefronts={OWN_STORES} />
          ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-bold mb-3">My Storefronts</h3>
            <div className="space-y-2">
              {OWN_STORES.map(s => (
                <button key={s.key} onClick={() => setActiveOwn(s.key)} className={`w-full text-left px-3 py-2 rounded-lg ${activeOwn===s.key?'bg-[#0B1F3A] text-white':'hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{s.label}</div>
                      <div className="text-xs text-gray-500">{s.description}</div>
                    </div>
                    <Palette className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{ownConfigs[activeOwn].name} — Preview</h2>
                  <p className="text-sm text-gray-500">{ownConfigs[activeOwn].tagline}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded flex items-center justify-center" style={{ background: ownConfigs[activeOwn].primaryColor }}>
                    {ownConfigs[activeOwn].logoUrl ? <img src={ownConfigs[activeOwn].logoUrl} alt="logo" className="w-10 h-10 object-contain" /> : <Image className="w-6 h-6 text-white" />}
                  </div>
                  <div className="text-sm text-gray-500">Theme: {ownConfigs[activeOwn].theme}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <BrandForm 
                    storeKey={activeOwn} 
                    config={ownConfigs[activeOwn]} 
                    onChange={(patch)=>updateOwn(activeOwn, patch)} 
                    onNavigateToFees={() => navigate('/seller/pricing')} 
                    onPreview={() => setShowPreview(true)}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Product Showcase</h3>
                  <div className="space-y-2">
                    {myProducts.slice(0,6).map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.origin} • {formatNumber(p.stock)} units</div>
                        </div>
                        <div className="text-sm font-semibold">€{p.price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-bold mb-3">Advanced Settings</h3>
              <p className="text-sm text-gray-600">Add custom CSS, meta tags, or configure domain mapping for each storefront (coming soon).</p>
            </div>
          </div>
        </div>
          )}
        </div>
      )}

      {/* 3rd Party Tab */}
      {tab === 'thirdparty' && (
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-bold mb-3">Marketplaces</h3>
            <div className="space-y-2">
              {THIRD_PARTY_STORES.map(s => (
                <button key={s.key} onClick={() => setActiveThird(s.key)} className={`w-full text-left px-3 py-2 rounded-lg ${activeThird===s.key?'bg-[#0B1F3A] text-white':'hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{s.label}</div>
                      <div className="text-xs text-gray-500">{s.description}</div>
                    </div>
                    <LinkIcon className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">{thirdConfigs[activeThird].name} — Product Approval Workflow</h2>
              <p className="text-sm text-gray-500">Products require platform approval before appearing live.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{thirdConfigs[activeThird].approved}</div>
                <div className="text-sm text-green-600">Approved</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-700">{thirdConfigs[activeThird].pending}</div>
                <div className="text-sm text-amber-600">Pending Review</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{thirdConfigs[activeThird].rejected}</div>
                <div className="text-sm text-red-600">Rejected</div>
              </div>
            </div>

            <ThirdPartyProductList storeKey={activeThird} />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Preview Header */}
            <div style={{ backgroundColor: ownConfigs[activeOwn].primaryColor }} className="text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{ownConfigs[activeOwn].name}</h2>
                <p className="text-sm mt-1 opacity-90">{ownConfigs[activeOwn].tagline}</p>
              </div>
              <button onClick={() => setShowPreview(false)} className="text-white hover:opacity-80 transition">
                ✕
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-3 gap-4">
                {myProducts.slice(0, 6).map(p => (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-3">
                      <div className="text-4xl">☕</div>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{p.name}</h4>
                    <p className="text-xs text-gray-600 mb-3">{p.origin}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p style={{ color: ownConfigs[activeOwn].primaryColor }} className="font-bold">€{p.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Stock</p>
                        <p className="text-sm font-medium">{formatNumber(p.stock)}</p>
                      </div>
                    </div>
                    <button
                      style={{ backgroundColor: ownConfigs[activeOwn].primaryColor }}
                      className="w-full text-white font-medium py-2 px-3 rounded text-sm transition hover:opacity-90"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
