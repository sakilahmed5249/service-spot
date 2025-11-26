import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { MdVerified, MdTrendingUp } from 'react-icons/md';
import { providerAPI } from '../services/api';
import { SERVICE_CATEGORIES, CITIES, formatCurrency } from '../utils/constants';
import { getCategoryIcon } from '../utils/categoryIcons';

const ServiceListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    fetchProviders();
  }, [searchParams]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await providerAPI.getAll();
      let filteredProviders = response.data;

      // Apply filters
      if (filters.city) {
        filteredProviders = filteredProviders.filter(p => 
          p.city?.toLowerCase() === filters.city.toLowerCase()
        );
      }

      if (filters.category) {
        // This assumes providers have a category or service field
        filteredProviders = filteredProviders.filter(p => 
          p.category?.toLowerCase() === filters.category.toLowerCase()
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProviders = filteredProviders.filter(p => 
          p.name?.toLowerCase().includes(searchLower) ||
          p.addressLine?.toLowerCase().includes(searchLower)
        );
      }

      setProviders(filteredProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ city: '', category: '', search: '' });
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Browse Services</h1>
        <p className="text-gray-600 text-xl">Discover trusted service providers near you</p>
      </div>

      {/* Filters */}
      <div className="card-gradient mb-12 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="feature-icon !w-12 !h-12">
            <Filter size={20} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Find Your Perfect Service</h2>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🔍 Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name..."
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📍 City
            </label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="input-field"
            >
              <option value="">All Cities</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🏷️ Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {SERVICE_CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="btn-secondary w-full"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-700 font-semibold text-lg">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></span>
              Loading amazing services...
            </span>
          ) : (
            <>
              <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {providers.length}
              </span>
              <span className="ml-2">provider{providers.length !== 1 ? 's' : ''} found</span>
            </>
          )}
        </p>
      </div>

      {/* Provider List */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="card-gradient text-center py-16 shadow-xl">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-700 text-2xl font-bold mb-4">No providers found</p>
          <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
          <button onClick={clearFilters} className="btn-primary">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.map((provider, index) => {
            const { Icon, color, bg } = getCategoryIcon(provider.category || 'Other');
            return (
              <Link
                key={provider.id}
                to={`/providers/${provider.id}`}
                className="card-gradient group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Provider Header with Avatar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg relative`}>
                      <Icon className="text-3xl" />
                      {provider.isOnline && (
                        <div className="absolute -top-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-gray-800 group-hover:text-purple-600 transition-colors">{provider.name}</h3>
                        {provider.isVerified && (
                          <MdVerified className="text-blue-600 text-xl" title="Verified Provider" />
                        )}                      </div>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <FaMapMarkerAlt className="mr-1 text-red-500" />
                        {provider.city}, {provider.state}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-white/50 rounded-xl p-3 mb-3">
                  <p className="text-gray-700 text-sm font-medium flex items-start gap-2">
                    <MapPin size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>{provider.doorNo}, {provider.addressLine}</span>
                  </p>
                </div>

                {/* Contact */}
                <div className="text-sm text-gray-700 mb-4 space-y-2">
                  <p className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                    <FaEnvelope className="text-blue-500" />
                    <span className="truncate">{provider.email}</span>
                  </p>
                  <p className="flex items-center gap-2 hover:text-green-600 transition-colors">
                    <FaPhone className="text-green-500" />
                    <span>{provider.phone}</span>
                  </p>
                </div>

                {/* Rating & CTA */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-purple-100">
                  <div className="flex items-center gap-2">
                    {typeof provider.rating === 'number' && provider.reviewCount > 0 ? (
                      <>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-lg ${i < Math.floor(provider.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-gray-800">{provider.rating.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm">({provider.reviewCount})</span>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">No reviews yet</span>
                    )}
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-black group-hover:scale-110 transition-transform inline-block">
                    View →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceListPage;
