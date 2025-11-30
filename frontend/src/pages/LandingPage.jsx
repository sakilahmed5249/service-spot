import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, TrendingUp } from 'lucide-react';
import { SERVICE_CATEGORIES, CITIES } from '../utils/constants';
import { getCategoryIcon } from '../utils/categoryIcons';
import ImageSlider from '../components/ImageSlider';
import { providerAPI } from '../services/api';

/* Why: Single-file landing page improved with glassy hero, CTA, and accessible search */
export default function LandingPage() {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  // Dynamic data from database
  const [availableCities, setAvailableCities] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle hash navigation to scroll to Popular Businesses section
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#popular-businesses') {
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById('popular-businesses');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  // Fetch available cities and services on component mount
  useEffect(() => {
    const fetchAvailableData = async () => {
      try {
        setLoading(true);

        // Fetch available cities from providers using centralized API
        const citiesResponse = await providerAPI.getAvailableCities();
        const cities = citiesResponse.data.data || [];

        // Fetch available service types from providers using centralized API
        const servicesResponse = await providerAPI.getAvailableServiceTypes();
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
      url: 'https://www.nuflowmidwest.com/wp-content/uploads/2023/09/The-8-Advantages-of-Hiring-a-Professional-Plumbing-Service-for-Your-Property-Management-Needs-1-1080x675.png',
      alt: 'Professional Plumbing Services',
      title: 'Expert Plumbing',
      subtitle: 'Fast & Reliable Solutions'
    },
    {
      url: 'https://www.cannyelectrics.com.au/wp-content/uploads/2023/08/electrician-working-power-box.jpg',
      alt: 'Electrical Services',
      title: 'Certified Electricians',
      subtitle: 'Safe & Professional'
    },
    {
      url: 'https://www.pritchardindustries.com/wp-content/uploads/2023/01/janitorial.jpg',
      alt: 'Cleaning Services',
      title: 'Premium Cleaning',
      subtitle: 'Spotless Results'
    },
    {
      url: 'https://www.jaipurhomeservice.com/upload/carpenter-online-services-in-jaipur.jpg',
      alt: 'Carpentry Services',
      title: 'Skilled Carpenters',
      subtitle: 'Quality Craftsmanship'
    },
    {
      url: 'https://emergenttutoring.com/wp-content/uploads/2021/06/benefits-of-tutoring-in-college-1024x563.jpg',
      alt: 'Professional Tutoring Services',
      title: 'Expert Tutors',
      subtitle: 'Personalized Learning'
    },
    {
      url: 'https://www.ugaoo.com/cdn/shop/articles/d411a14006_3d31861e-e3d2-4d17-94b2-0de6fbf7681a.jpg?v=1698835017&width=1500',
      alt: 'Professional Gardening Services',
      title: 'Garden Experts',
      subtitle: 'Beautiful Landscapes'
    },
    {
      url: 'https://jasleenbeautysalon.com/wp-content/uploads/2024/12/pexels-cottonbro-3992863-1024x682.jpg.webp',
      alt: 'Professional Hair Styling Services',
      title: 'Expert Stylists',
      subtitle: 'Look Your Best'
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
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500 bg-slate-700/50 backdrop-blur-sm transition-all duration-300 appearance-none cursor-pointer font-medium hover:border-purple-500/50"
                  disabled={loading}
                >
                  <option value="" className="bg-slate-800">
                    {loading ? '⏳ Loading cities...' : availableCities.length > 0 ? '📍 Select City' : '📍 No cities available - Register as provider first'}
                  </option>
                  {availableCities.map((city) => (
                    <option key={city} value={city} className="bg-slate-800">{city}</option>
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

      {/* Categories Section - Gaming Dark Theme */}
      <section id="popular-businesses" className="py-16 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Businesses</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {featuredCategories.map((category) => {
              const { Icon, color, bg } = getCategoryIcon(category);
              return (
                <Link
                  key={category}
                  to={`/services?category=${category}`}
                  className="bg-slate-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border-2 border-purple-500/30 hover:border-orange-500 hover:shadow-[0_0_30px_rgba(255,107,53,0.5)] transition-all duration-300 text-center group hover:-translate-y-2"
                >
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3 bg-gradient-to-br from-orange-500 to-pink-500 shadow-[0_0_20px_rgba(255,107,53,0.5)] group-hover:scale-110 transition-transform">
                    <Icon className="text-3xl text-white" />
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors drop-shadow-lg">
                    {category}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section - Gaming Dark Theme with more padding */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white font-display drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Are You a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Service Provider</span>?
            </h2>
            <p className="text-lg text-white mb-8 drop-shadow-lg">
              Join our platform and grow your business
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup?type=provider"
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/50 inline-flex items-center justify-center gap-2"
              >
                Register as Provider
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/services"
                className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-3 rounded-full font-semibold hover:bg-white/20 hover:border-white/50 transition-all inline-flex items-center justify-center gap-2"
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
