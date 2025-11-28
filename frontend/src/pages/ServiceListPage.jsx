import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { providerAPI } from '../services/api';
import { SERVICE_CATEGORIES, CITIES, formatCurrency } from '../utils/constants';
import { getCategoryIcon } from '../utils/categoryIcons';

/*
  Enhanced ServiceListPage
  - Left filter panel (glass) and right results grid
  - Accessible controls and aria-live results count
  - Uses existing design utility classes for a Figma-like feel
*/

export default function ServiceListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
  });

  // Sync local filters -> url
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.city, filters.category, filters.search]);

  // Fetch providers whenever search params change
  useEffect(() => {
    let cancelled = false;
    async function fetchProviders() {
      setLoading(true);
      try {
        const res = await (providerAPI?.getAll?.() ?? Promise.resolve({ data: [] }));
        const all = res.data ?? res;
        // Basic filtering client-side for now
        const filtered = all.filter(p => {
          if (filters.city && (!p.city || p.city.toLowerCase() !== filters.city.toLowerCase())) return false;
          if (filters.category) {
            const catMatch = (p.category || p.services?.[0]?.category || '').toLowerCase();
            if (!catMatch.includes(filters.category.toLowerCase())) return false;
          }
          if (filters.search) {
            const s = filters.search.toLowerCase();
            if (!(
              (p.name || '').toLowerCase().includes(s) ||
              (p.addressLine || '').toLowerCase().includes(s) ||
              (p.city || '').toLowerCase().includes(s)
            )) return false;
          }
          return true;
        });
        if (!cancelled) setProviders(filtered);
      } catch (err) {
        console.error('Error fetching providers:', err);
        if (!cancelled) setProviders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProviders();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const clearFilters = () => {
    setFilters({ city: '', category: '', search: '' });
    setSearchParams({});
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resultsLabel = useMemo(() => {
    if (loading) return 'Searching…';
    if (providers.length === 0) return 'No providers found';
    return `${providers.length} provider${providers.length !== 1 ? 's' : ''} found`;
  }, [loading, providers.length]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Browse Services</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Discover verified local professionals, compare prices, and book instantly.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Filters - left */}
        <aside className="md:col-span-4 lg:col-span-3">
          <div className="card-glass p-5 rounded-2xl sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="feature-icon !w-10 !h-10">
                <Filter size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Refine search</h2>
                <p className="text-xs text-slate-400">Filter by city, category or keyword</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-slate-400 mb-2">Search</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    id="search"
                    type="search"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search providers or address..."
                    className="input-field pl-10"
                    aria-label="Search providers"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-400 mb-2">City</label>
                <select
                  id="city"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="input-field"
                >
                  <option value="">All cities</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                <select
                  id="category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input-field"
                >
                  <option value="">All categories</option>
                  {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setFilters(prev => ({ ...prev }))} className="btn-ghost flex-1">Apply</button>
                <button onClick={clearFilters} className="btn-secondary flex-1">Clear</button>
              </div>

              <div className="mt-4">
                <div className="text-xs text-slate-400 mb-2">Quick tags</div>
                <div className="flex flex-wrap gap-2">
                  {['Same-day', 'Top-rated', 'Verified', 'Budget'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleFilterChange('search', tag)}
                      className="label-soft hover:scale-105 transition-transform"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="md:hidden mt-4">
            <div className="card-glass p-4 rounded-2xl flex gap-3 items-center">
              <div className="flex-1">
                <div className="text-sm text-slate-400">Need help finding a pro?</div>
                <div className="font-medium text-white">Chat with us</div>
              </div>
              <button className="btn-primary">Chat</button>
            </div>
          </div>
        </aside>

        {/* Results - right */}
        <main className="md:col-span-8 lg:col-span-9">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-400">Results</p>
              <div aria-live="polite" className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : (
                  <span>
                    <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mr-2">{providers.length}</span>
                    providers
                  </span>
                )}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <button className="btn-ghost">Sort: Relevance</button>
              <button className="btn-ghost">Map view</button>
            </div>
          </div>

          {/* Results grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-glass p-4 rounded-2xl animate-pulse h-44" />
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="rounded-2xl bg-slate-100 p-8 text-center dark:bg-slate-800/50">
              <div className="text-4xl mb-4">😕</div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">No providers match your filters</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Try removing filters or change city/category</p>
              <div className="flex justify-center gap-3">
                <button onClick={clearFilters} className="btn-primary">Reset filters</button>
                <Link to="/" className="btn-ghost dark:text-slate-200">Back home</Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider, index) => {
                const { Icon, color } = getCategoryIcon(provider.category || 'Other');
                return (
                  <article
                    key={provider.id}
                    className="card-glass p-4 rounded-2xl flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-2xl transition-transform duration-200"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div>
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md ${color || 'bg-gradient-to-br from-primary to-accent'}`}>
                          {Icon ? <Icon className="w-6 h-6" /> : <div className="w-6 h-6 bg-white/30 rounded" />}
                          {provider.isOnline && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">{provider.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                            <FaMapMarkerAlt /> <span className="truncate">{provider.city}, {provider.state}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          {typeof provider.rating === 'number' && provider.reviewCount > 0 ? (
                            <div className="text-sm">
                              <div className="flex items-center justify-end gap-1">
                                <Star size={16} className="text-yellow-400" />
                                <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                              </div>
                              <div className="text-xs text-slate-400">({provider.reviewCount})</div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400">No reviews</div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 bg-white/5 rounded-xl p-3">
                        <p className="text-sm text-slate-300 mb-2 line-clamp-2">{provider.shortDescription || provider.services?.[0]?.description || 'Experienced local professionals'}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <div className="label-soft">{provider.services?.[0]?.durationMinutes ?? '—'} mins</div>
                          <div className="label-soft">{provider.services?.[0] ? formatCurrency(provider.services[0].basePrice) : 'Price on request'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <Link
                        to={`/providers/${provider.id}`}
                        className="btn-ghost flex-1 text-center"
                        aria-label={`View ${provider.name}`}
                      >
                        View
                      </Link>

                      <a href={`tel:${provider.phone}`} className="btn-primary inline-flex items-center gap-2">
                        <FaPhone /> Call
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}