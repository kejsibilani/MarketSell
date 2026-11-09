import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { CheckCircle, Clock } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import SellerOnboarding from '../components/SellerOnboarding';
import { signIn, signUp, requestPasswordReset, homePathFor } from '../../lib/backend/auth';
import { isSupabaseConfigured } from '../../lib/backend/client';

export default function SignUp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'buyer' | 'confirm-email' | 'pending' | 'approved'>('form');
  const [role, setRole] = useState<'seller' | 'agent' | 'buyer'>('seller');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const afterSignUp = (needsConfirmation: boolean) => {
    if (needsConfirmation) {
      setStep('confirm-email');
    } else if (isSupabaseConfigured) {
      setStep(role === 'buyer' ? 'approved' : 'pending');
    } else {
      setStep('pending');
      setTimeout(() => setStep('approved'), 2000);
    }
  };

  // Determine if this is signup or signin
  const isSignIn = location.pathname.startsWith('/signin');

  // Determine if showing onboarding (signup for seller/agent)
  const isOnboarding = !isSignIn && (location.pathname.includes('/seller') || location.pathname.includes('/agent'));

  // Auto-detect role from URL
  useEffect(() => {
    if (location.pathname.includes('/seller')) {
      setRole('seller');
    } else if (location.pathname.includes('/agent')) {
      setRole('agent');
    }
  }, [location.pathname]);

  const handleOnboardingComplete = (data: any) => run(async () => {
    const { needsConfirmation } = await signUp({
      email: data.contactEmail,
      password: data.password,
      name: data.contactName,
      role: data.userType ?? role,
      companyName: data.companyName,
      companyDetails: {
        productCategories: data.productCategories,
        shippingCountries: data.shippingCountries,
        additionalCompanies: data.additionalCompanies,
      },
    });
    afterSignUp(needsConfirmation);
  });

  const handleBuyerSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const { needsConfirmation } = await signUp({ email, password, name, role: 'buyer' });
      afterSignUp(needsConfirmation);
    });
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const member = await signIn(email, password);
      navigate(isSupabaseConfigured ? homePathFor(member) : `/${role}`);
    });
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Enter your email above first.');
      return;
    }
    run(async () => {
      await requestPasswordReset(email);
      setNotice('If an account exists for that email, a reset link is on its way.');
    });
  };

  const inputClass = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent';
  const messages = (
    <>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>}
    </>
  );

  if (step === 'confirm-email') {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <Navigation />
        <div className="flex items-center justify-center p-6 pt-24">
          <div className="bg-white rounded-lg border border-gray-200 p-12 max-w-md text-center">
            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-4">Check your inbox</h2>
            <p className="text-gray-600 mb-6">
              We've sent you a confirmation link. Open it to activate your account, then sign in.
            </p>
            <Link to="/signin" className="text-[#0B1F3A] hover:underline font-medium">Go to Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'buyer') {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <div className="max-w-md mx-auto py-12 px-6">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-bold text-[#0B1F3A]">MarketSell</Link>
            <h1 className="text-3xl font-bold text-[#0B1F3A] mt-8 mb-2">Create a Buyer Account</h1>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            {messages}
            <form onSubmit={handleBuyerSignUp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Full name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
              </div>
              <button type="submit" disabled={busy} className="w-full bg-[#0B1F3A] text-white py-3 rounded-lg hover:bg-[#0B1F3A]/90 font-medium disabled:opacity-60">
                {busy ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
            <button type="button" onClick={() => setStep('form')} className="mt-6 w-full text-center text-sm text-gray-600 hover:underline">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'pending') {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <Navigation />
        <div className="flex items-center justify-center p-6 pt-24">
          <div className="bg-white rounded-lg border border-gray-200 p-12 max-w-md text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-orange-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-4">Application Pending</h2>
            <p className="text-gray-600 mb-6">
              We're reviewing your application. This usually takes 1-2 business days.
              You'll receive an email once your account is approved.
            </p>
            <Link to="/" className="text-[#0B1F3A] hover:underline font-medium">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'approved') {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <Navigation />
        <div className="flex items-center justify-center p-6 pt-24">
          <div className="bg-white rounded-lg border border-gray-200 p-12 max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-4">Account Approved!</h2>
            <p className="text-gray-600 mb-6">
              Your account has been approved. You can now start using the platform.
            </p>
            <Link
              to={`/${role}`}
              className="inline-block bg-[#0B1F3A] text-white px-8 py-3 rounded-lg hover:bg-[#0B1F3A]/90 font-medium"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding directly for signup seller/agent
  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50">
        {(error || busy) && (
          <div className="max-w-3xl mx-auto px-6 pt-6">
            {busy ? <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">Creating your account…</div> : messages}
          </div>
        )}
        <SellerOnboarding
          onComplete={handleOnboardingComplete}
          userType={role as 'seller' | 'agent'}
        />
      </div>
    );
  }

  // Sign In Page - Only Email and Password
  if (isSignIn) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <div className="max-w-md mx-auto py-12 px-6">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-bold text-[#0B1F3A]">
              MarketSell
            </Link>
            <h1 className="text-3xl font-bold text-[#0B1F3A] mt-8 mb-2">Sign In</h1>
            <p className="text-gray-600">Welcome back to MarketSell</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            {messages}
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a href="#" onClick={handleForgotPassword} className="text-[#0B1F3A] hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#0B1F3A] text-white py-3 rounded-lg hover:bg-[#0B1F3A]/90 font-medium disabled:opacity-60"
              >
                {busy ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#0B1F3A] hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign Up Page - Role Selection
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-[#0B1F3A]">
            MarketSell
          </Link>
          <h1 className="text-3xl font-bold text-[#0B1F3A] mt-8 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Join the MarketSell marketplace ecosystem</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                I want to:
              </label>
              <div className="grid grid-cols-3 gap-4">
                <Link
                  to="/signup/seller"
                  className="p-4 border-2 border-gray-200 hover:border-[#0B1F3A] hover:bg-[#0B1F3A]/5 rounded-lg text-center transition-colors"
                >
                  <div className="font-medium text-gray-900">Sell</div>
                  <div className="text-xs text-gray-600 mt-1">I'm a producer</div>
                </Link>
                <Link
                  to="/signup/agent"
                  className="p-4 border-2 border-gray-200 hover:border-[#0B1F3A] hover:bg-[#0B1F3A]/5 rounded-lg text-center transition-colors"
                >
                  <div className="font-medium text-gray-900">Be an Agent</div>
                  <div className="text-xs text-gray-600 mt-1">Earn commissions</div>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setRole('buyer');
                    setStep('buyer');
                  }}
                  className="p-4 border-2 border-gray-200 hover:border-[#0B1F3A] hover:bg-[#0B1F3A]/5 rounded-lg text-center transition-colors"
                >
                  <div className="font-medium text-gray-900">Buy</div>
                  <div className="text-xs text-gray-600 mt-1">I'm a buyer</div>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Select your role above to continue with registration
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/signin" className="text-[#0B1F3A] hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
