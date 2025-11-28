import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Briefcase, Lock, MapPin, Phone } from 'lucide-react';
import { FaGoogle, FaFacebookF, FaApple } from 'react-icons/fa';
import {
  CITIES,
  STATES,
  isValidEmail,
  isValidPhone,
  isValidPincode,
} from '../utils/constants';

/*
  SignupPage — upgraded with illustrations, icons, social buttons, and Figma-like layout.
  - Left column: SVG illustration + benefits
  - Right column: existing form (unchanged logic) with small inline icon accents
  - Responsive: stacks vertically on small screens
*/

const Illustration = ({ className = '' }) => (
  <div className={`relative ${className}`} aria-hidden>
    {/* Decorative blurred blobs */}
    <svg viewBox="0 0 700 700" className="w-full h-auto" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="g2" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Soft background blob */}
      <g transform="translate(100,80)">
        <path fill="url(#g1)" opacity="0.16" d="M200,20 C320,10 420,90 480,180 C540,270 520,380 440,420 C360,460 220,440 140,380 C60,320 80,140 200,120 Z"/>
        <path fill="url(#g2)" opacity="0.14" d="M420,260 C520,240 600,300 620,380 C640,460 580,530 480,540 C380,550 300,500 260,420 C220,340 320,300 420,260 Z"/>
      </g>

      {/* Illustration: friendly technician + user icons (simple geometric) */}
      <g transform="translate(60,160)" >
        {/* device / card */}
        <rect x="210" y="60" rx="18" ry="18" width="320" height="200" fill="#0f1724" opacity="0.06" />
        {/* person circle (provider) */}
        <circle cx="320" cy="160" r="40" fill="#fff" opacity="0.95" />
        <circle cx="320" cy="150" r="18" fill="#60a5fa" />
        <rect x="295" y="170" rx="8" ry="8" width="50" height="24" fill="#a78bfa" />
        {/* wrench-like shape */}
        <g transform="translate(420,120) rotate(18)" fill="#06b6d4" opacity="0.95">
          <rect x="0" y="0" width="8" height="48" rx="4" />
          <rect x="-4" y="-8" width="20" height="8" rx="4" />
          <circle cx="0" cy="48" r="6" />
        </g>
      </g>
    </svg>

    {/* Floating badges */}
    <div className="absolute left-6 top-6 bg-white/6 backdrop-blur rounded-2xl p-3 flex items-center gap-3 shadow-md">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
        <UserPlus size={16} />
      </div>
      <div className="text-sm">
        <div className="font-semibold">Verified Pros</div>
        <div className="text-xs text-slate-300">Background checked</div>
      </div>
    </div>

    <div className="absolute right-6 bottom-6 bg-white/6 backdrop-blur rounded-2xl p-3 flex items-center gap-3 shadow-md">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-white">
        <MapPin size={14} />
      </div>
      <div className="text-sm">
        <div className="font-semibold">Local to you</div>
        <div className="text-xs text-slate-300">Fast arrival</div>
      </div>
    </div>
  </div>
);

const SocialButton = ({ label, Icon, className = '', onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 justify-center px-4 py-2 rounded-xl shadow-sm transition hover:shadow-md ${className}`}
    aria-label={label}
    type="button"
  >
    <Icon />
    <span className="text-sm font-semibold">{label}</span>
  </button>
);

const SignupPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();

  const [userType, setUserType] = useState(searchParams.get('type') || 'customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pwd: '',
    confirmPassword: '',
    phone: '',
    doorNo: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email address';
    if (formData.pwd.length < 6) newErrors.pwd = 'Password must be at least 6 characters';
    if (formData.pwd !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!isValidPhone(formData.phone)) newErrors.phone = 'Invalid phone number (10 digits)';
    if (!formData.doorNo.trim()) newErrors.doorNo = 'Door number is required';
    if (!formData.addressLine.trim()) newErrors.addressLine = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!isValidPincode(formData.pincode)) newErrors.pincode = 'Invalid pincode (6 digits)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const { confirmPassword, ...signupData } = formData;
    const result = await signup(signupData, userType);
    if (result.success) {
      alert('Account created successfully! Please login.');
      navigate(`/login?type=${userType}`);
    } else {
      setErrors({ general: result.error });
    }
    setLoading(false);
  };

  const onSocial = (provider) => {
    // placeholder: integrate social auth later
    alert(`Social sign-up (${provider}) not wired in demo.`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left visual column (illustration + benefits) */}
        <div className="md:col-span-5 lg:col-span-6 hidden md:block">
          <div className="rounded-3xl overflow-hidden shadow-2xl card-glass p-6 h-full flex flex-col justify-center">
            <Illustration className="w-full" />
            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3">
                <div className="feature-icon !w-10 !h-10">
                  <User size={18} />
                </div>
                <div>
                  <div className="font-semibold text-white">Trusted professionals</div>
                  <div className="text-sm text-slate-300">Background checked & rated</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="feature-icon !w-10 !h-10 from-green-400 to-cyan-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="font-semibold text-white">Local & fast</div>
                  <div className="text-sm text-slate-300">Same-day options available</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="feature-icon !w-10 !h-10 from-yellow-400 to-orange-400">
                  <Briefcase size={18} />
                </div>
                <div>
                  <div className="font-semibold text-white">Grow your business</div>
                  <div className="text-sm text-slate-300">Tools for providers too</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <SocialButton label="Sign up with Google" Icon={FaGoogle} className="bg-white/10 text-white hover:bg-white/12" onClick={() => onSocial('Google')} />
              <SocialButton label="Apple" Icon={FaApple} className="bg-white/6 text-white hover:bg-white/10" onClick={() => onSocial('Apple')} />
            </div>
          </div>
        </div>

        {/* Right form column */}
        <div className="md:col-span-7 lg:col-span-6">
          <div className="card-glass shadow-2xl p-8 rounded-3xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="feature-icon mx-auto mb-4">
                <UserPlus size={28} />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                Create Account
              </h2>
              <p className="text-slate-400 mt-2">Start your journey with ServiceSpot</p>
            </div>

            {/* User Type Toggle */}
            <div className="flex gap-3 mb-6 p-1 bg-white/6 rounded-xl">
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
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-transparent text-slate-200 hover:bg-white/4'
                }`}
                aria-pressed={userType === 'provider'}
              >
                <Briefcase size={18} className="mr-2" />
                Provider
              </button>
            </div>

            {/* Error */}
            {errors.general && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-start gap-3">
                <span className="text-red-500 font-bold text-xl">⚠️</span>
                <span className="font-medium">{errors.general}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <input name="name" id="name" value={formData.name} onChange={handleChange}
                      className={`input-field pl-12 ${errors.name ? 'border-red-500' : ''}`} placeholder="John Doe" />
                    <div className="absolute left-3 top-3 text-slate-400"><User size={16} /></div>
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">Phone Number *</label>
                  <div className="relative">
                    <input name="phone" id="phone" value={formData.phone} onChange={handleChange}
                      className={`input-field pl-12 ${errors.phone ? 'border-red-500' : ''}`} placeholder="9876543210" maxLength="10" />
                    <div className="absolute left-3 top-3 text-slate-400"><Phone size={16} /></div>
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email Address *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`} placeholder="you@email.com" />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pwd" className="block text-sm font-medium text-slate-300 mb-1">Password *</label>
                  <div className="relative">
                    <input type="password" id="pwd" name="pwd" value={formData.pwd} onChange={handleChange}
                      className={`input-field pl-12 ${errors.pwd ? 'border-red-500' : ''}`} placeholder="••••••••" />
                    <div className="absolute left-3 top-3 text-slate-400"><Lock size={16} /></div>
                  </div>
                  {errors.pwd && <p className="text-red-500 text-sm mt-1">{errors.pwd}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">Confirm Password *</label>
                  <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`} placeholder="••••••••" />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-white/6 pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-slate-300" /> Address Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="doorNo" className="block text-sm text-slate-300 mb-1">Door/Flat Number *</label>
                    <input id="doorNo" name="doorNo" value={formData.doorNo} onChange={handleChange} className={`input-field ${errors.doorNo ? 'border-red-500' : ''}`} placeholder="123" />
                    {errors.doorNo && <p className="text-red-500 text-sm mt-1">{errors.doorNo}</p>}
                  </div>

                  <div>
                    <label htmlFor="pincode" className="block text-sm text-slate-300 mb-1">Pincode *</label>
                    <input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} className={`input-field ${errors.pincode ? 'border-red-500' : ''}`} placeholder="400001" maxLength="6" />
                    {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="addressLine" className="block text-sm text-slate-300 mb-1">Address Line *</label>
                  <input id="addressLine" name="addressLine" value={formData.addressLine} onChange={handleChange} className={`input-field ${errors.addressLine ? 'border-red-500' : ''}`} placeholder="Street, Area, Landmark" />
                  {errors.addressLine && <p className="text-red-500 text-sm mt-1">{errors.addressLine}</p>}
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm text-slate-300 mb-1">City *</label>
                    <select id="city" name="city" value={formData.city} onChange={handleChange} className={`input-field ${errors.city ? 'border-red-500' : ''}`}>
                      <option value="">Select City</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm text-slate-300 mb-1">State *</label>
                    <select id="state" name="state" value={formData.state} onChange={handleChange} className={`input-field ${errors.state ? 'border-red-500' : ''}`}>
                      <option value="">Select State</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary mt-6">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to={`/login?type=${userType}`} className="font-semibold text-white hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;