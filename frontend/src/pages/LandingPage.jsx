import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, TrendingUp, Shield, Clock } from 'lucide-react';
import { SERVICE_CATEGORIES, CITIES } from '../utils/constants';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.append('city', searchCity);
    if (searchCategory) params.append('category', searchCategory);
    navigate(`/services?${params.toString()}`);
  };

  const featuredCategories = SERVICE_CATEGORIES.slice(0, 8);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Local Services Near You
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Connect with trusted service providers in your area. Book appointments instantly.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select City</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Service</option>
                  {SERVICE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary flex items-center justify-center">
                <Search size={20} className="mr-2" />
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Service-Spot?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Providers</h3>
              <p className="text-gray-600">
                All service providers are verified and reviewed by customers
              </p>
            </div>
            <div className="card text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quick Booking</h3>
              <p className="text-gray-600">
                Book services in minutes with real-time availability
              </p>
            </div>
            <div className="card text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Service</h3>
              <p className="text-gray-600">
                Read reviews and ratings before booking any service
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredCategories.map((category) => (
              <Link
                key={category}
                to={`/services?category=${category}`}
                className="card hover:shadow-xl transition-shadow text-center group"
              >
                <div className="bg-blue-100 text-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <TrendingUp size={32} />
                </div>
                <h3 className="font-semibold">{category}</h3>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/services" className="btn-primary">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Are You a Service Provider?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join our platform and grow your business by reaching more customers
          </p>
          <Link to="/signup?type=provider" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block">
            Register as Provider
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-gray-600">Service Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5000+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">20+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15+</div>
              <div className="text-gray-600">Service Categories</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
