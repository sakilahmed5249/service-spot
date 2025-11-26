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
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} />
            </div>
            <h2 className="text-3xl font-bold">Create Account</h2>
            <p className="text-gray-600 mt-2">Join Service-Spot today</p>
          </div>

          {/* User Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setUserType('customer')}
              className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center ${
                userType === 'customer'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User size={18} className="mr-2" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => setUserType('provider')}
              className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center ${
                userType === 'provider'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Briefcase size={18} className="mr-2" />
              Provider
            </button>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {errors.general}
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
            <div className="border-t pt-4 mt-6">
              <h3 className="text-lg font-semibold mb-4">Address Information</h3>
              
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
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to={`/login?type=${userType}`}
                className="text-primary font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
