import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Briefcase } from 'lucide-react';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [userType, setUserType] = useState(searchParams.get('type') || 'customer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
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
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData, userType);

    if (result.success) {
      // Redirect based on user type
      if (userType === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/services');
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-md w-full">
        <div className="card-glass shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="feature-icon mx-auto mb-4">
              <LogIn size={32} />
            </div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome Back</h2>
            <p className="text-gray-600 mt-2 text-lg">Sign in to continue your journey</p>
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
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-start gap-3 animate-slide-in-up shadow-md">
              <span className="text-red-500 font-bold text-xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-lg">
              Don't have an account?{' '}
              <Link
                to={`/signup?type=${userType}`}
                className="font-bold text-blue-700 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 hover:text-purple-700 visited:text-blue-900 transition-colors duration-200 underline-offset-2 hover:underline"
                style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text', color: '#1D4ED8' }}
                aria-label="Sign up for a new account"
              >
                Sign Up Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
