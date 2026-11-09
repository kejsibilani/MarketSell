import { Link, useNavigate } from 'react-router';
import {
  ChevronDown,
  Globe,
  DollarSign,
  User,
  UserCircle,
  Lock,
  Settings,
  Star,
  ArrowDownCircle,
  Store,
  Zap,
  LogOut,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { colors } from '../styles/designSystem';
import { useAuth, signOut } from '../../lib/backend/auth';

export function Navigation() {
  const { isSignedIn: isLoggedIn, member } = useAuth();
  const navigate = useNavigate();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');

  const menuRef = useRef<HTMLDivElement | null>(null);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const currencyMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {

    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(e.target as Node)) {
        setShowLanguageMenu(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(e.target as Node)) {
        setShowCurrencyMenu(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const currencies = [
    { code: 'EUR', symbol: '€' },
    { code: 'USD', symbol: '$' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold" style={{ color: colors.primary }}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span>MarketSell</span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <Link to="/marketplace" className="text-gray-700 font-medium" style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Buy</Link>
              {isLoggedIn ? (
                <>
                  <Link to="/seller" className="text-gray-700 font-medium" style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Sell</Link>
                  <Link to="/agent" className="text-gray-700 font-medium" style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Agents</Link>
                </>
              ) : (
                <>
                  <Link to="/become-seller" className="text-gray-700 font-medium" style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Sell</Link>
                  <Link to="/become-agent" className="text-gray-700 font-medium" style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Agent</Link>
                </>
              )}
              {/* Keep admin links visible to all users in the main nav */}
              <Link to="/business-admin" className="text-gray-700 font-medium" style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Business Admin</Link>
              <Link to="/system-admin" className="text-gray-700 font-medium" style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = ''}>System Admin</Link>
              <Link to="/operator" className="text-gray-700 font-medium" style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Operator</Link>
            </div>

            <div className="w-px h-6 bg-gray-300" />

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowAccountMenu((s) => !s)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{member?.name ?? 'Account'}</p>
                  <p className="text-xs text-gray-500">{member?.email ?? 'Costa Coffee Co.'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500 mt-1">{member?.email ?? 'Costa Coffee Co.'}</p>
                  </div>

                  {/* Roles summary with compact ratings */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Roles</p>
                    <div className="mt-2 space-y-3">
                      {/* Buyer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                            <ArrowDownCircle className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Buyer</p>
                            <p className="text-xs text-gray-500">Active</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Star className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium">4.8</span>
                          </div>
                        </div>
                      </div>

                      {/* Seller */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-50 rounded flex items-center justify-center">
                            <Store className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Seller</p>
                            <p className="text-xs text-gray-500">Active • Costa Coffee Co.</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Star className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium">4.5</span>
                          </div>
                        </div>
                      </div>

                      {/* Agent */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-50 rounded flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Agent</p>
                            <p className="text-xs text-gray-500">Not active</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Link
                            to="/signup/agent"
                            onClick={() => setShowAccountMenu(false)}
                            className="text-xs font-medium text-[#0B1F3A] hover:underline"
                          >
                            Apply as Agent
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button onClick={() => { setShowAccountMenu(false); alert('Change password'); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <Lock className="w-4 h-4 text-gray-400" /> Change Password
                    </button>
                    <Link to="/account-settings" onClick={() => setShowAccountMenu(false)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <Settings className="w-4 h-4 text-gray-400" /> Account Settings
                    </Link>
                    {isLoggedIn && (
                      <button
                        onClick={async () => { setShowAccountMenu(false); await signOut(); navigate('/'); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <LogOut className="w-4 h-4 text-gray-400" /> Sign Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-300" />

            <div className="relative" ref={languageMenuRef}>
              <button onClick={() => setShowLanguageMenu((s) => !s)} className="p-2 rounded-lg hover:bg-gray-100">
                <Globe className="w-5 h-5 text-gray-700" />
              </button>
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  {languages.map((l) => (
                    <button key={l.code} onClick={() => setSelectedLanguage(l.name)} className="w-full text-left px-4 py-2 hover:bg-gray-50">
                      <span className="mr-2">{l.flag}</span>
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={currencyMenuRef}>
              <button onClick={() => setShowCurrencyMenu((s) => !s)} className="p-2 rounded-lg hover:bg-gray-100">
                <DollarSign className="w-5 h-5 text-gray-700" />
              </button>
              {showCurrencyMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  {currencies.map((c) => (
                    <button key={c.code} onClick={() => setSelectedCurrency(c.code)} className="w-full text-left px-4 py-2 hover:bg-gray-50">
                      {c.symbol} {c.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!isLoggedIn && <Link to="/signin" className="text-white px-4 py-2 rounded-lg" style={{ backgroundColor: colors.primary, cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Sign In</Link>}
          </div>
        </div>
      </div>
    </nav>
  );
}