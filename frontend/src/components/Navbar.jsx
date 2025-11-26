import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Calendar, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary flex items-center">
            <span className="bg-primary text-white px-2 py-1 rounded mr-2">SS</span>
            Service-Spot
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/services" 
              className="text-gray-700 hover:text-primary transition flex items-center"
            >
              Browse Services
            </Link>
            
            {user ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link 
                      to="/my-bookings" 
                      className="text-gray-700 hover:text-primary transition flex items-center"
                    >
                      <Calendar size={18} className="mr-1" />
                      My Bookings
                    </Link>
                    <Link 
                      to="/profile" 
                      className="text-gray-700 hover:text-primary transition flex items-center"
                    >
                      <User size={18} className="mr-1" />
                      Profile
                    </Link>
                  </>
                )}
                
                {user.role === 'provider' && (
                  <Link 
                    to="/provider/dashboard" 
                    className="text-gray-700 hover:text-primary transition flex items-center"
                  >
                    <LayoutDashboard size={18} className="mr-1" />
                    Dashboard
                  </Link>
                )}
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    Hello, <span className="font-semibold">{user.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-700 hover:text-red-500 transition"
                  >
                    <LogOut size={18} className="mr-1" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary transition"
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
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/services"
              className="block py-2 text-gray-700 hover:text-primary transition"
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
                      className="block py-2 text-gray-700 hover:text-primary transition"
                      onClick={() => setIsOpen(false)}
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/profile"
                      className="block py-2 text-gray-700 hover:text-primary transition"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                  </>
                )}
                
                {user.role === 'provider' && (
                  <Link
                    to="/provider/dashboard"
                    className="block py-2 text-gray-700 hover:text-primary transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 mb-2">
                    Hello, <span className="font-semibold">{user.name}</span>
                  </p>
                  <button
                    onClick={handleLogout}
                    className="block py-2 text-red-500 hover:text-red-700 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-gray-700 hover:text-primary transition"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 text-primary font-semibold"
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
