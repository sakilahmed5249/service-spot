import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Calendar, LayoutDashboard } from 'lucide-react';
import { MdSpaceDashboard } from 'react-icons/md';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-lg shadow-lg' 
        : 'bg-white/95 backdrop-blur-md shadow-md'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Enhanced */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white px-3 py-2 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <MdSpaceDashboard size={24} />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Service-Spot
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/services" 
              className="text-gray-700 hover:text-purple-600 transition-colors font-semibold relative group"
            >
              Browse Services
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {user ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link 
                      to="/my-bookings" 
                      className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors font-semibold relative group"
                    >
                      <Calendar size={18} />
                      My Bookings
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors font-semibold relative group"
                    >
                      <User size={18} />
                      Profile
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </>
                )}
                
                {user.role === 'provider' && (
                  <Link 
                    to="/provider/dashboard" 
                    className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors font-semibold relative group"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
                
                <div className="flex items-center gap-4 pl-4 border-l-2 border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {user.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all font-semibold"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-purple-600 transition-colors font-semibold"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X size={28} className="text-gray-700" />
            ) : (
              <Menu size={28} className="text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu - Enhanced */}
        {isOpen && (
          <div className="md:hidden pb-6 space-y-3 animate-slide-in-up">
            <Link
              to="/services"
              className="block py-3 px-4 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-semibold"
              onClick={() => setIsOpen(false)}
            >
              Browse Services
            </Link>
            
            {user ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link
                      to="/my-bookings"
                      className="flex items-center gap-2 py-3 px-4 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-semibold"
                      onClick={() => setIsOpen(false)}
                    >
                      <Calendar size={18} />
                      My Bookings
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 py-3 px-4 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-semibold"
                      onClick={() => setIsOpen(false)}
                    >
                      <User size={18} />
                      Profile
                    </Link>
                  </>
                )}
                
                {user.role === 'provider' && (
                  <Link
                    to="/provider/dashboard"
                    className="flex items-center gap-2 py-3 px-4 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-semibold"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                )}
                
                <div className="pt-3 border-t-2 border-gray-200">
                  <div className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-all font-semibold"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-3 px-4 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-center hover:shadow-lg transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
