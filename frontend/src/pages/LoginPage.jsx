import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Briefcase, Mail, Lock, MapPin, Award } from 'lucide-react';
import { FaGoogle, FaFacebookF, FaApple } from 'react-icons/fa';

/*
  Upgraded LoginPage:
  - Two column layout on md+: Left visual column (illustration + benefits)
  - Right: login form with icons, social buttons, and micro-interactions
  - Social buttons are placeholders (alert) — integrate OAuth later
*/

const Illustration = ({ className = '' }) => (
  <div className={`relative ${className}`} aria-hidden>
    <svg viewBox="0 0 700 700" className="w-full h-auto" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden>
      <defs>
        <linearGradient id="lg1" x1="0" x2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="lg2" x1="0" x2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* soft background blobs */}
      <g transform="translate(20,20)">
        <path d="M170 20c80-6 180 40 260 80 80 40 120 110 110 190-10 80-90 160-170 170-80 10-190-20-250-70C40 340 40 140 170 20z"
              fill="url(#lg1)" opacity="0.12"/>
        <path d="M420 240c100-30 180 20 200 90 20 70-20 150-90 190-70 40-170 30-230-10-60-40-80-150-20-200 60-50 110-70 140-60z"
              fill="url(#lg2)" opacity="0.10"/>
      </g>

      {/* card / device + small characters */}
      <g transform="translate(90,150)">
        <rect x="140" y="40" rx="22" ry="22" width="360" height="220" fill="#0b1220" opacity="0.06"/>
        <circle cx="260" cy="150" r="40" fill="#fff" opacity="0.96"/>
        <circle cx="260" cy="140" r="18" fill="#60a5fa"/>
        <rect x="245" y="160" rx="8" width="30" height="14" fill="#a78bfa"/>
        <g transform="translate(370,110) rotate(12)" fill="#06b6d4">
          <rect x="0" y="0" width="8" height="44" rx="4" />
          <rect x="-4" y="-8" width="20" height="8" rx="4" />
          <circle cx="0" cy="44" r="6" />
        </g>
      </g>
    </svg>

    <div className="absolute left-6 top-6 bg-white/6 backdrop-blur rounded-2xl p-3 flex items-center gap-3 shadow-md">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
        <LogIn size={14} />
      </div>
      <div className="text-sm">
        <div className="font-semibold">Quick Sign In</div>
        <div className="text-xs text-slate-300">Secure & private</div>
      </div>
    </div>

    <div className="absolute right-6 bottom-6 bg-white/6 backdrop-blur rounded-2xl p-3 flex items-center gap-3 shadow-md">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-white">
        <MapPin size={14} />
      </div>
      <div className="text-sm">
        <div className="font-semibold">Local matches</div>
        <div className="text-xs text-slate-300">Find nearby pros</div>
      </div>
    </div>
  </div>
);

const SocialButton = ({ Icon, label, className = '', onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-3 px-4 py-2 rounded-xl shadow-sm transition hover:shadow-md ${className}`}
    aria-label={label}
  >
    <Icon />
    <span className="text-sm font-semibold">{label}</span>
  </button>
);

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [userType, setUserType] = useState(searchParams.get('type') || 'customer');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get redirect path from URL params or location state
  const redirectPath = searchParams.get('redirect') || location.state?.from?.pathname || null;

  React.useEffect(() => {
    if (isAuthenticated) {
      // If already authenticated, redirect to appropriate dashboard or home
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleChange = (e) => {
    setFormData(s => ({ ...s, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(formData, userType);
    if (result.success) {
      // Redirect to the intended page or dashboard
      if (redirectPath) {
        navigate(redirectPath);
      } else if (userType === 'admin') {
        navigate('/admin/dashboard');
      } else if (userType === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  const onSocial = (provider) => {
    alert(`Social sign-in (${provider}) not configured in demo.`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left visual column (hidden on small screens) */}
        <div className="md:col-span-5 lg:col-span-6 hidden md:block">
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 shadow-lg border border-blue-400/20 p-6 h-full flex flex-col justify-center">
            <Illustration className="w-full" />
            <div className="mt-6 grid gap-3">
              <div className="flex items-start gap-3">
                <div className="feature-icon !w-10 !h-10">
                  <User size={18} />
                </div>
                <div>
                  <div className="font-semibold text-white">Safe authentication</div>
                  <div className="text-sm text-slate-300">Encrypted tokens & local session</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="feature-icon !w-10 !h-10 from-green-400 to-cyan-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="font-semibold text-white">Local professionals</div>
                  <div className="text-sm text-slate-300">Find trusted talent nearby</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="feature-icon !w-10 !h-10 from-yellow-400 to-orange-400">
                  <Briefcase size={18} />
                </div>
                <div>
                  <div className="font-semibold text-white">For providers too</div>
                  <div className="text-sm text-slate-300">Dashboard & bookings management</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <SocialButton Icon={FaGoogle} label="Continue with Google" className="bg-white/10 text-white hover:bg-white/12" onClick={() => onSocial('Google')} />
              <SocialButton Icon={FaApple} label="Apple" className="bg-white/6 text-white hover:bg-white/10" onClick={() => onSocial('Apple')} />
            </div>
          </div>
        </div>

        {/* Right form column - Premium elevated card */}
        <div className="md:col-span-7 lg:col-span-6">
          <div className="bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 shadow-xl border border-gray-700/50 p-8 rounded-3xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="feature-icon mx-auto mb-4">
                <LogIn size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Welcome Back
              </h2>
              <p className="text-gray-300 mt-2">Sign in to continue your journey</p>
            </div>

            {/* User Type Toggle */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700">
              <button
                type="button"
                onClick={() => setUserType('admin')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center ${
                  userType === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                    : 'bg-transparent text-slate-200 hover:bg-white/4'
                }`}
                aria-pressed={userType === 'admin'}
              >
                <Award size={18} className="mr-2" />
                Admin
              </button>

              <button
                type="button"
                onClick={() => setUserType('customer')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center ${
                  userType === 'customer'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-transparent text-slate-200 hover:bg-white/4'
                }`}
                aria-pressed={userType === 'customer'}
              >
                <User size={18} className="mr-2" />
                Customer
              </button>

              <button
                type="button"
                onClick={() => setUserType('provider')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center ${
                  userType === 'provider'
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg transform scale-105'
                    : 'bg-transparent text-slate-200 hover:bg-white/4'
                }`}
                aria-pressed={userType === 'provider'}
              >
                <Briefcase size={18} className="mr-2" />
                Service Provider
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-start gap-3 animate-slide-in-up shadow-md">
                <span className="text-red-500 font-bold text-xl">⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Social sign-in row (small) */}
            <div className="flex gap-3 mb-4">
              <SocialButton Icon={FaGoogle} label="Google" className="flex-1 bg-white/6 text-white" onClick={() => onSocial('Google')} />
              <SocialButton Icon={FaFacebookF} label="Facebook" className="flex-1 bg-white/6 text-white" onClick={() => onSocial('Facebook')} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field pl-12"
                    placeholder="you@email.com"
                    aria-label="Email address"
                  />
                  <div className="absolute left-3 top-3 text-slate-400"><Mail size={16} /></div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input-field pl-12"
                    placeholder="••••••••"
                    aria-label="Password"
                  />
                  <div className="absolute left-3 top-3 text-slate-400"><Lock size={16} /></div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary">
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link
                to={`/signup?type=${userType}`}
                className="font-semibold text-white hover:underline"
                aria-label="Sign up for a new account"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
