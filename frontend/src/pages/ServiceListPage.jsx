import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import { providerAPI } from '../services/api';
import { SERVICE_CATEGORIES, CITIES, formatCurrency } from '../utils/constants';

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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Services</h1>
        <p className="text-gray-600">Find the perfect service provider for your needs</p>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-primary" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
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
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          {loading ? 'Loading...' : `${providers.length} provider${providers.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Provider List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : providers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg">No providers found matching your criteria</p>
          <button onClick={clearFilters} className="btn-primary mt-4">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <Link
              key={provider.id}
              to={`/providers/${provider.id}`}
              className="card hover:shadow-xl transition-shadow"
            >
              {/* Provider Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{provider.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin size={14} className="mr-1" />
                    {provider.city}, {provider.state}
                  </div>
                </div>
              </div>

              {/* Address */}
              <p className="text-gray-600 text-sm mb-3">
                {provider.doorNo}, {provider.addressLine}
              </p>

              {/* Contact */}
              <div className="text-sm text-gray-600 mb-3">
                <p>📧 {provider.email}</p>
                <p>📱 {provider.phone}</p>
              </div>

              {/* Rating (Mock for now) */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-400 fill-current mr-1" />
                  <span className="font-semibold">4.5</span>
                  <span className="text-gray-500 text-sm ml-1">(12 reviews)</span>
                </div>
                <span className="text-primary font-semibold">View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceListPage;
