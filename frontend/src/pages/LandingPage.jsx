import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, TrendingUp } from 'lucide-react';
import { SERVICE_CATEGORIES, CITIES } from '../utils/constants';
import { getCategoryIcon } from '../utils/categoryIcons';
import ImageSlider from '../components/ImageSlider';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

/* Why: Single-file landing page improved with glassy hero, CTA, and accessible search */
export default function LandingPage() {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  // Dynamic data from database
  const [availableCities, setAvailableCities] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch available cities and services on component mount
  useEffect(() => {
    const fetchAvailableData = async () => {
      try {
        setLoading(true);

        // Fetch available cities from providers
        const citiesResponse = await axios.get(`${API_BASE_URL}/users/providers/locations/cities`);
        const cities = citiesResponse.data.data || [];

        // Fetch available service types from providers
        const servicesResponse = await axios.get(`${API_BASE_URL}/users/providers/service-types`);
        const services = servicesResponse.data.data || [];

        // Show ONLY database data - truly dynamic
        setAvailableCities(cities);
        setAvailableServices(services);

        console.log('Fetched cities:', cities);
        console.log('Fetched services:', services);
      } catch (error) {
        console.error('Error fetching available data:', error);
        // Show empty arrays on error - no data available
        setAvailableCities([]);
        setAvailableServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableData();
  }, []);

  const heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1800&auto=format&fit=crop',
      alt: 'Professional Plumbing Services',
      title: 'Expert Plumbing',
      subtitle: 'Fast & Reliable Solutions'
    },
    {
      url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1800&auto=format&fit=crop',
      alt: 'Electrical Services',
      title: 'Certified Electricians',
      subtitle: 'Safe & Professional'
    },
    {
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1800&auto=format&fit=crop',
      alt: 'Cleaning Services',
      title: 'Premium Cleaning',
      subtitle: 'Spotless Results'
    },
    {
      url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1800&auto=format&fit=crop',
      alt: 'Carpentry Services',
      title: 'Skilled Carpenters',
      subtitle: 'Quality Craftsmanship'
    }
  ];

  const handleSearch = (e) => {
    e?.preventDefault?.();
    const params = new URLSearchParams();
    if (searchCity) params.append('city', searchCity);
    if (searchCategory) params.append('category', searchCategory);
    navigate(`/services?${params.toString()}`);
  };

  // Show available services from database (up to 8)
  // If no data, show fallback categories for better UX
  const featuredCategories = availableServices.length > 0
    ? availableServices.slice(0, 8)
    : SERVICE_CATEGORIES.slice(0, 8);

  return (
    <div className="bg-white">
      {/* Hero Section - Clean and Simple with Image Slider */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Image Slider */}
        <div className="absolute inset-0 z-0">
          <ImageSlider images={heroImages} />
        </div>

        {/* Light Overlay for text readability */}
        <div className="absolute inset-0 bg-white/80 z-[1]"></div>

        {/* Gradient Overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/60 z-[1]"></div> */}

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900 font-display">
              Find Home <span className="text-primary">Service/Repair</span>
              <br />Near You
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Explore Best Home Service & Repair near you
            </p>

            {/* Enhanced Search Form */}
            <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-sm p-6 flex flex-col md:flex-row gap-4 rounded-2xl shadow-2xl border border-white/50">
              <div className="flex-1 relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white transition-all duration-300 appearance-none cursor-pointer font-medium"
                  disabled={loading}
                >
                  <option value="">
                    {loading ? '⏳ Loading cities...' : availableCities.length > 0 ? '📍 Select City' : '📍 No cities available - Register as provider first'}
                  </option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 relative group">
                <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white transition-all duration-300 appearance-none cursor-pointer font-medium"
                  disabled={loading}
                >
                  <option value="">
                    {loading ? '⏳ Loading services...' : availableServices.length > 0 ? '🔍 Select Service' : '🔍 No services available - Register as provider first'}
                  </option>
                  {availableServices.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary flex items-center justify-center gap-2 min-w-[140px]">
                <Search size={20} />
                <span className="font-bold">Search</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section - Clean Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display mb-2">
              Popular Businesses            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {featuredCategories.map((category) => {
              const { Icon, color, bg } = getCategoryIcon(category);
              return (
                <Link
                  key={category}
                  to={`/services?category=${category}`}
                  className="bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100 text-center group"
                >
                  <div className={`${bg} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="text-3xl" style={{ color: color.includes('from-') ? undefined : color }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {category}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section - Simple and Clean */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 font-display">
              Are You a Service Provider?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join our platform and grow your business
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup?type=provider"
                className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-600 transition-colors inline-flex items-center justify-center gap-2"
              >
                Register as Provider
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/services"
                className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-full font-semibold hover:bg-primary-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
