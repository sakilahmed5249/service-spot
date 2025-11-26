import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Briefcase } from 'lucide-react';
import { CITIES, STATES, isValidEmail, isValidPhone, isValidPincode } from '../utils/constants';

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

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.pwd.length < 6) {
      newErrors.pwd = 'Password must be at least 6 characters';
    }

    if (formData.pwd !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number (10 digits)';
    }

    if (!formData.doorNo.trim()) {
      newErrors.doorNo = 'Door number is required';
    }

    if (!formData.addressLine.trim()) {
      newErrors.addressLine = 'Address is required';
    }

    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!isValidPincode(formData.pincode)) {
      newErrors.pincode = 'Invalid pincode (6 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...signupData } = formData;

    const result = await signup(signupData, userType);

    if (result.success) {
      // Show success message and redirect to login
      alert('Account created successfully! Please login.');
      navigate(`/login?type=${userType}`);
    } else {
      setErrors({ general: result.error });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-2xl mx-auto">
        <div className="card-glass shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="feature-icon mx-auto mb-4">
              <UserPlus size={32} />
            </div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Account</h2>
            <p className="text-gray-600 mt-2 text-lg">Start your journey with Service-Spot</p>
          </div>

          {/* User Type Toggle */}
          <div className="flex gap-3 mb-8 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setUserType('customer')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center ${
                userType === 'customer'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-transparent text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User size={20} className="mr-2" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => setUserType('provider')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center ${
                userType === 'provider'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-transparent text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Briefcase size={20} className="mr-2" />
              Provider
            </button>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-start gap-3 animate-slide-in-up shadow-md">
              <span className="text-red-500 font-bold text-xl">⚠️</span>
              <span className="font-medium">{errors.general}</span>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="9876543210"
                  maxLength="10"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pwd" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  id="pwd"
                  name="pwd"
                  value={formData.pwd}
                  onChange={handleChange}
                  className={`input-field ${errors.pwd ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                {errors.pwd && <p className="text-red-500 text-sm mt-1">{errors.pwd}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Address */}
            <div className="border-t-2 border-purple-100 pt-6 mt-6">
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Address Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="doorNo" className="block text-sm font-medium text-gray-700 mb-1">
                    Door/Flat Number *
                  </label>
                  <input
                    type="text"
                    id="doorNo"
                    name="doorNo"
                    value={formData.doorNo}
                    onChange={handleChange}
                    className={`input-field ${errors.doorNo ? 'border-red-500' : ''}`}
                    placeholder="123"
                  />
                  {errors.doorNo && <p className="text-red-500 text-sm mt-1">{errors.doorNo}</p>}
                </div>

                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={`input-field ${errors.pincode ? 'border-red-500' : ''}`}
                    placeholder="400001"
                    maxLength="6"
                  />
                  {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="addressLine" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line *
                </label>
                <input
                  type="text"
                  id="addressLine"
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleChange}
                  className={`input-field ${errors.addressLine ? 'border-red-500' : ''}`}
                  placeholder="Street, Area, Landmark"
                />
                {errors.addressLine && <p className="text-red-500 text-sm mt-1">{errors.addressLine}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select City</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select State</option>
                    {STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-lg">
              Already have an account?{' '}
              <Link
                to={`/login?type=${userType}`}
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold hover:underline"
              >
                Sign In Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
