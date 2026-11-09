import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Navigation } from '../components/Navigation';
import { Globe, User, Mail, Lock, CheckCircle, Store, Plus, DollarSign, ArrowDownCircle, ArrowUpCircle, Building2, Star, Key, QrCode, Copy } from 'lucide-react';
import formatNumber from '../utils/numberFormat';

// ── Role Rating Card ────────────────────────────────────────────────────────

interface RoleRatingCardProps {
  role: string;
  icon: ReactNode;
  iconBg: string;
  isActive: boolean;
  isDefault?: boolean;
  rating?: number;
  reviewCount?: number;
  assignedBy?: 'system' | 'operator';
  description?: ReactNode;
}

function RoleRatingCard({
  role,
  icon,
  iconBg,
  isActive,
  isDefault = false,
  rating,
  reviewCount,
  assignedBy,
  description,
}: RoleRatingCardProps) {
  const filled = isActive && rating !== undefined ? Math.round(rating) : 0;

  return (
    <div
      className={`p-4 rounded-lg border ${
        isActive
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 bg-gray-50 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: icon + role name + description */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-gray-900">{role}</h3>
              {isActive ? (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {isDefault ? 'Active (default)' : 'Active'}
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                  Not active
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
        </div>

        {/* Right: rating — only shown when active */}
        {isActive && rating !== undefined && (
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-0.5 justify-end">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= filled
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{rating.toFixed(1)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Assigned by {assignedBy === 'operator' ? 'operator' : 'system'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

interface Storefront {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'pending' | 'inactive';
  isNetwork: boolean;
}

export default function AccountSettings() {
  const [storefronts, setStorefronts] = useState<Storefront[]>([
    {
      id: '1',
      name: 'MarketSell Marketplace',
      url: 'marketsell.com',
      status: 'active',
      isNetwork: true,
    },
    {
      id: '2',
      name: 'Origo Coffee',
      url: 'origo.com',
      status: 'active',
      isNetwork: true,
    },
    {
      id: '3',
      name: 'Ember',
      url: 'ember.com',
      status: 'inactive',
      isNetwork: true,
    },
  ]);

  // For demo: each company includes the roles the current user has for that company
  const companies = [
    { code: 'NFCOF', name: 'Northfield Coffee', taxId: 'ES-B12345678', roles: ['Seller', 'Operations'] },
    { code: 'NFCAO', name: 'Northfield Cacao', taxId: 'ES-B87654321', roles: ['Seller'] },
  ];

  const RECENT_TRANSACTIONS = [
    { id: 'TX-201', description: 'Sale: Order #ORD-9922', date: '2026-05-03', amount: 840.0, company: 'COSTA' },
    { id: 'TX-202', description: 'Storage Fee: Rotterdam WH', date: '2026-05-01', amount: -150.0, company: 'NFCOF' },
    { id: 'TX-203', description: 'Sale: Order #ORD-9880', date: '2026-04-28', amount: 2100.5, company: 'NFCOF' },
  ];

  // Bank account state persisted in localStorage (masked in UI)
  const [bankAccount, setBankAccount] = useState<{ bankName: string; iban: string; bic?: string }>(() => {
    try {
      const raw = localStorage.getItem('account_bank');
      if (!raw) return { bankName: 'Banco Mercantil', iban: 'ES12 3456 7890 1234 5678 9012', bic: 'MRCTESMM' };
      return JSON.parse(raw);
    } catch {
      return { bankName: 'Banco Mercantil', iban: 'ES12 3456 7890 1234 5678 9012', bic: 'MRCTESMM' };
    }
  });
  const [showBankModal, setShowBankModal] = useState(false);
  const [showFullBank, setShowFullBank] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('account_bank', JSON.stringify(bankAccount)); } catch {}
  }, [bankAccount]);

  const maskIBAN = (iban: string) => {
    if (!iban) return '';
    const clean = iban.replace(/\s+/g, '');
    if (clean.length <= 4) return '••••';
    const last = clean.slice(-4);
    return `•••• •••• •••• ${last}`;
  };

  // --- Demo 2FA state (client-side mock) ---
  const [twoFAEnabled, setTwoFAEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('demo_2fa_enabled') === 'true'; } catch { return false; }
  });
  const [twoFASecret, setTwoFASecret] = useState<string | null>(() => {
    try { return localStorage.getItem('demo_2fa_secret'); } catch { return null; }
  });
  const [twoFAVerifyCode, setTwoFAVerifyCode] = useState('');
  const [twoFAStatus, setTwoFAStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (twoFASecret) localStorage.setItem('demo_2fa_secret', twoFASecret);
      localStorage.setItem('demo_2fa_enabled', String(twoFAEnabled));
    } catch {}
  }, [twoFAEnabled, twoFASecret]);

  const generateSecret = () => {
    // simple random base32-like token for demo purposes
    const s = Array.from({ length: 6 }).map(() => Math.random().toString(36).substring(2, 6).toUpperCase()).join('-');
    setTwoFASecret(s);
    setTwoFAStatus('secret-generated');
  };

  const copySecret = async () => {
    if (!twoFASecret) return;
    try { await navigator.clipboard.writeText(twoFASecret); setTwoFAStatus('copied'); } catch { setTwoFAStatus('copy-failed'); }
  };

  const verifyAndEnable = () => {
    // Demo: accept any 6-digit code that equals last 6 chars of secret (not secure)
    if (!twoFASecret) { setTwoFAStatus('no-secret'); return; }
    const expected = twoFASecret.replace(/[^A-Z0-9]/gi, '').slice(-6);
    if (twoFAVerifyCode && twoFAVerifyCode === expected) {
      setTwoFAEnabled(true);
      setTwoFAStatus('enabled');
    } else {
      setTwoFAStatus('invalid');
    }
  };

  const disableTwoFA = () => {
    setTwoFAEnabled(false);
    setTwoFASecret(null);
    setTwoFAStatus('disabled');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B1F3A]">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and linked websites</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#0B1F3A]">Profile Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium text-gray-900">Costa Coffee Co.</p>
                  </div>
                </div>
                <button className="text-blue-500 hover:underline text-sm">Edit</button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">contact@costacoffee.com</p>
                  </div>
                </div>
                <button className="text-blue-500 hover:underline text-sm">Edit</button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Password</p>
                    <p className="font-medium text-gray-900">••••••••</p>
                  </div>
                </div>
                <button className="text-blue-500 hover:underline text-sm">Change</button>
              </div>
              {/* 2FA status note under profile if enabled */}
              {twoFAEnabled && (
                <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-100 rounded">
                  <Key className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Two-factor authentication is enabled</p>
                    <p className="text-xs text-green-700">Your account has an active 2FA method configured.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Two-Factor Authentication (demo) */}
            {!twoFAEnabled && (
              <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0B1F3A]">Two-Factor Authentication</h2>
                <p className="text-sm text-gray-600 mt-1">Secure your account with a second authentication factor (demo only).</p>
              </div>
              <div>
                {!twoFAEnabled ? (
                  <button onClick={() => { generateSecret(); setTwoFAStatus(null); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Set up 2FA</button>
                ) : (
                  <button onClick={disableTwoFA} className="px-4 py-2 bg-red-600 text-white rounded-lg">Disable 2FA</button>
                )}
              </div>
            </div>
            <div className="p-6">
              {!twoFAEnabled ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">Follow these steps to enable 2FA (demo):</p>
                  <ol className="list-decimal list-inside text-sm text-gray-600">
                    <li>Generate a secret and scan the QR code with your authenticator app.</li>
                    <li>Enter the 6-digit code from your app to verify and enable 2FA.</li>
                  </ol>

                  <div className="mt-4 p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <QrCode className="w-8 h-8 text-gray-600" />
                        <div>
                          <div className="text-sm text-gray-500">Authenticator QR</div>
                          <div className="text-xs text-gray-400">(demo placeholder)</div>
                        </div>
                      </div>
                      <div>
                        <button onClick={generateSecret} className="px-3 py-1 bg-gray-100 rounded">Generate Secret</button>
                      </div>
                    </div>

                    {twoFASecret && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{twoFASecret}</div>
                        <button onClick={copySecret} className="px-2 py-1 bg-white border rounded text-sm flex items-center gap-2">
                          <Copy className="w-4 h-4" /> Copy
                        </button>
                        <div className="text-sm text-gray-500">Use this in your authenticator app.</div>
                      </div>
                    )}

                    {twoFASecret && (
                      <div className="mt-3 flex items-center gap-2">
                        <input value={twoFAVerifyCode} onChange={(e) => setTwoFAVerifyCode(e.target.value)} placeholder="Enter 6-digit code" className="px-3 py-2 border rounded w-40" />
                        <button onClick={verifyAndEnable} className="px-3 py-2 bg-blue-600 text-white rounded">Verify & Enable</button>
                        {twoFAStatus && <div className="text-sm text-gray-600 ml-2">{twoFAStatus}</div>}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">Two-factor authentication is currently enabled for your account.</p>
                  <div className="flex items-center gap-3">
                    <Key className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded inline-block">{twoFASecret}</div>
                      <div className="text-xs text-gray-500">Keep this secret safe.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          )}

          {/* My Companies */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0B1F3A]">My Companies</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Companies you are registered as a seller for
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0B1F3A] text-white rounded-lg hover:bg-[#0B1F3A]/90">
                  <Plus size={16} />
                  Add Company
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {companies.map((company) => (
                  <div
                    key={company.code}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{company.name}</h3>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold bg-gray-100 text-gray-700">
                            {company.code}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{company.taxId}</p>
                        <div className="mt-2 flex items-center gap-2">
                          {(company as any).roles?.map((r: string) => (
                            <span key={r} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button className="text-blue-500 hover:underline text-sm">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* My Storefronts */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0B1F3A]">My Storefronts</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Storefronts you manage and where you can sell your products
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0B1F3A] text-white rounded-lg hover:bg-[#0B1F3A]/90">
                  <Plus size={16} />
                  Create My Storefront
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Where you can sell:</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• MarketSell Marketplace (all sellers)</li>
                  <li>• Other MarketSell storefronts (activate below)</li>
                  <li>• Your own custom storefront (create your own)</li>
                </ul>
              </div>

              <h3 className="font-semibold text-gray-900 mb-4">Available MarketSell Storefronts</h3>
              <div className="space-y-4">
                {storefronts.map((storefront) => (
                  <div
                    key={storefront.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0B1F3A] to-[#1a3a5f] rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{storefront.name}</h3>
                          {storefront.isNetwork && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                              MarketSell Network
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{storefront.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {storefront.status === 'active' ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                          <CheckCircle size={14} />
                          <span className="text-sm font-medium">Selling Here</span>
                        </div>
                      ) : (
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium">
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cash Account */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#0B1F3A]">Your Cash Account</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your funds and withdrawals</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                  <p className="text-3xl font-bold text-gray-900">€12,450.00</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <ArrowDownCircle className="w-4 h-4" />
                    Request Refund
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#0B1F3A] text-white rounded-lg hover:bg-[#0B1F3A]/90">
                    <ArrowUpCircle className="w-4 h-4" />
                    Withdraw Funds
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="text-sm text-gray-700 font-medium mb-2">Linked Bank Account</div>
                  <div className="text-sm text-gray-900 font-semibold">{bankAccount.bankName}</div>
                    <div className="text-xs text-gray-500">IBAN: {showFullBank ? bankAccount.iban : maskIBAN(bankAccount.iban)}</div>
                    <div className="text-xs text-gray-500">SWIFT/BIC: {showFullBank ? bankAccount.bic : '•••••••'}</div>
                    <div className="mt-3 space-y-2">
                      <button onClick={() => setShowBankModal(true)} className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded text-[#0B1F3A] hover:bg-gray-50">Edit Bank Account</button>
                      <button onClick={() => { window.location.href = '/seller#cash'; }} className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded text-[#0B1F3A] hover:bg-gray-50">Go to Seller Cash Account</button>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Reveal details</label>
                        <input type="checkbox" checked={showFullBank} onChange={(e)=>setShowFullBank(e.target.checked)} />
                      </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b pb-1">Recent Transactions</div>
                  {RECENT_TRANSACTIONS.slice(0,3).map((t) => (
                    <div key={t.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                      <div>
                        <div className="font-semibold text-gray-900">{t.description}</div>
                        <div className="flex items-center gap-2"><span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-1 rounded uppercase tracking-tighter">{t.company}</span><span className="text-[10px] text-gray-400 uppercase font-semibold">{t.date}</span></div>
                      </div>
                      <div className={`font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{t.amount > 0 ? '+' : ''}€{formatNumber(Math.abs(t.amount), 2)}</div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <a href="/seller#cash" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">View full statement</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bank Edit Modal */}
          {showBankModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
              <div className="bg-white rounded-lg shadow-lg w-[520px] p-6">
                <h3 className="text-lg font-semibold mb-3">Edit Bank Account</h3>
                <div className="space-y-3">
                  <label className="text-sm font-medium">Bank Name</label>
                  <input className="w-full border px-3 py-2 rounded" value={bankAccount.bankName} onChange={(e)=>setBankAccount((b)=>({...b, bankName: e.target.value}))} />
                  <label className="text-sm font-medium">IBAN</label>
                  <input className="w-full border px-3 py-2 rounded" value={bankAccount.iban} onChange={(e)=>setBankAccount((b)=>({...b, iban: e.target.value}))} />
                  <label className="text-sm font-medium">SWIFT / BIC</label>
                  <input className="w-full border px-3 py-2 rounded" value={bankAccount.bic} onChange={(e)=>setBankAccount((b)=>({...b, bic: e.target.value}))} />
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={()=>setShowBankModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                  <button onClick={()=>{ setShowBankModal(false); setShowFullBank(false); }} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                </div>
              </div>
            </div>
          )}

          {/* My Roles & Ratings */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#0B1F3A]">My Roles & Ratings</h2>
              <p className="text-sm text-gray-600 mt-1">
                Your active roles on the platform. Ratings are assigned by the system or our operators based on your activity.
              </p>
            </div>
            <div className="p-6 space-y-4">

              {/* Buyer — active by default for everyone */}
              <RoleRatingCard
                role="Buyer"
                icon={<ArrowDownCircle className="w-5 h-5 text-blue-600" />}
                iconBg="bg-blue-50"
                isActive={true}
                isDefault={true}
                rating={4.8}
                assignedBy="system"
                description="Everyone can buy from all MarketSell storefronts."
              />

              {/* Seller — active, with registered companies */}
              <RoleRatingCard
                role="Seller"
                icon={<Store className="w-5 h-5 text-green-600" />}
                iconBg="bg-green-50"
                isActive={true}
                rating={4.5}
                assignedBy="operator"
                description={
                  <span>
                    Selling as:{" "}
                    {companies.map((c) => (
                      <span
                        key={c.code}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded text-xs mr-1"
                      >
                        <span className="font-mono font-bold">{c.code}</span>
                        <span className="text-gray-600">({c.name})</span>
                      </span>
                    ))}
                  </span>
                }
              />

              {/* Agent — not active */}
              <RoleRatingCard
                role="Agent"
                icon={<User className="w-5 h-5 text-purple-600" />}
                iconBg="bg-purple-50"
                isActive={false}
                description="You are not currently active as an agent."
              />

            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#0B1F3A]">Notification Preferences</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive email updates for orders and messages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B1F3A]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Order Updates</p>
                  <p className="text-sm text-gray-500">Get notified about order status changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B1F3A]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Marketing Communications</p>
                  <p className="text-sm text-gray-500">Receive promotional emails and updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B1F3A]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
