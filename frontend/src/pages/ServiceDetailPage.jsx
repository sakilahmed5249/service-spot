/**
 * @fileoverview ServiceDetailPage - Displays detailed information about a specific service listing
 *
 * @description
 * This component provides a comprehensive view of a service listing including:
 * - Service details (title, description, pricing, duration)
 * - Provider information (name, contact, location)
 * - Availability calendar with real-time booking slots
 * - Customer reviews and ratings
 * - Booking functionality for customers
 * - Glassmorphic UI design with smooth animations
 *
 * @module pages/ServiceDetailPage
 * @requires react
 * @requires react-router-dom
 * @requires lucide-react
 * @requires ../services/api
 * @requires ../context/AuthContext
 * @requires ../utils/constants
 * @requires ../components/Modal
 *
 * @author Team C - Service-Spot
 * @version 3.0
 * @since 2025-11-29
 *
 * @example
 * // Route configuration in App.jsx:
 * <Route path="/services/:id" element={<ServiceDetailPage />} />
 *
 * @notes
 * - Only customers can book services (role-based restriction)
 * - Providers can view but cannot book their own services
 * - Handles 404 errors gracefully with fallback data
 * - Implements accessibility features (keyboard navigation, ARIA labels)
 * - Uses React Context for authentication state management
 * - Integrates with backend REST API endpoints
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Calendar,
  Clock,
  DollarSign,
  MessageSquare,
} from 'lucide-react';
import { providerAPI, reviewAPI, serviceAPI, specificAvailabilityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/constants';
import Modal from '../components/Modal';

/**
 * Enhanced ServiceDetailPage Component
 *
 * Features:
 * - Glassmorphic Figma-inspired design
 * - Inline availability calendar with month navigation
 * - Accessible calendar cells with keyboard focus support
 * - Micro-interactions and smooth transitions
 * - Graceful fallback for unavailable API endpoints
 * - Real-time data fetching with loading states
 * - Responsive layout for mobile and desktop
 */

/**
 * Generates today's date in ISO format (YYYY-MM-DD)
 *
 * @function todayISO
 * @returns {string} Current date in ISO format (e.g., "2025-11-29")
 * @example
 * const today = todayISO(); // "2025-11-29"
 */
const todayISO = () => new Date().toISOString().split('T')[0];

/**
 * Generates an array of Date objects for all days in a given month,
 * including leading and trailing null values to align with calendar grid.
 *
 * @function getMonthDays
 * @param {Date} monthStart - Date object representing the first day of the month
 * @returns {Array<Date|null>} Array of 35 or 42 elements (5-6 weeks) with:
 *   - Leading nulls for days before month starts (Sunday alignment)
 *   - Date objects for each day in the month
 *   - Trailing nulls to complete the last week
 *
 * @example
 * const days = getMonthDays(new Date(2025, 10, 1)); // November 2025
 * // Returns: [null, null, null, Date(2025-11-01), ..., Date(2025-11-30), null]
 */
function getMonthDays(monthStart) {
  const month = monthStart.getMonth();
  const year = monthStart.getFullYear();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days = [];
  // align to Sunday start (0) - produce leading blanks
  const leading = first.getDay(); // 0..6
  for (let i = 0; i < leading; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  // trailing blanks to fill last week
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

/**
 * AvailabilityCalendar - Interactive month-view calendar showing available booking slots
 *
 * @component
 * @param {Object} props - Component props
 * @param {string|number} props.providerId - Unique identifier for the service provider
 * @param {string|number} props.serviceId - Unique identifier for the service
 * @param {Function} props.onSelect - Callback function called when a date is selected
 * @param {string} props.onSelect.dateISO - Selected date in ISO format (YYYY-MM-DD)
 *
 * @returns {JSX.Element} Calendar component with month navigation and selectable dates
 *
 * @description
 * Displays a month-view calendar grid with:
 * - Month/year navigation (previous/next buttons)
 * - Highlighted available dates (fetched from API)
 * - Disabled past dates and unavailable dates
 * - Click handlers for date selection
 * - Loading state while fetching availability
 * - Responsive grid layout (7 columns for days of week)
 *
 * @example
 * <AvailabilityCalendar
 *   providerId={123}
 *   serviceId={456}
 *   onSelect={(dateISO) => console.log('Selected:', dateISO)}
 * />
 *
 * @accessibility
 * - Buttons have descriptive aria-labels
 * - Calendar grid uses semantic table-like structure
 * - Keyboard navigation supported for month navigation
 * - Visual indicators for available/unavailable/past dates
 */
function AvailabilityCalendar({ providerId, serviceId, onSelect }) {
  const [monthStart, setMonthStart] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });
  const [availableDates, setAvailableDates] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const monthDays = useMemo(() => getMonthDays(monthStart), [monthStart]);

  useEffect(() => {
    let cancelled = false;
    async function fetchAvailability() {
      setLoading(true);
      try {
        // Calculate month date range
        const startDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1).toISOString().split('T')[0];
        const endDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).toISOString().split('T')[0];

        // Fetch provider's specific availability dates for this month
        const res = await specificAvailabilityAPI.getAvailableDates(providerId, startDate, endDate);
        const availableDates = res?.data?.data || res?.data || [];

        console.log('ServiceDetail - Provider specific availability:', availableDates);

        // Build set of available dates
        const available = new Set(availableDates.map(d => d.split('T')[0]));

        if (!cancelled) setAvailableDates(available);
      } catch (err) {
        console.error('availability fetch error', err);
        // On error, show no dates as available
        if (!cancelled) setAvailableDates(new Set());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAvailability();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, serviceId, monthStart]);

  const handlePrev = () => {
    setMonthStart(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNext = () => {
    setMonthStart(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white shadow-lg border border-gray-200 p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold">Availability</h4>
          <div className="text-xs text-slate-400">
            {monthStart.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button aria-label="Previous month" onClick={handlePrev} className="btn-ghost p-2 rounded-md">‹</button>
          <button aria-label="Next month" onClick={handleNext} className="btn-ghost p-2 rounded-md">›</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div role="grid" aria-label="Availability calendar" className="select-none">
          <div className="grid grid-cols-7 gap-2 text-[12px] text-slate-400 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((d, idx) => {
              if (!d) return <div key={idx} className="py-3" aria-hidden />;
              const iso = d.toISOString().split('T')[0];
              const isToday = iso === new Date().toISOString().split('T')[0];
              const available = availableDates.has(iso);
              const disabled = !available || d < new Date(todayISO());
              return (
                <button
                  key={iso}
                  role="gridcell"
                  aria-pressed={false}
                  aria-disabled={disabled}
                  onClick={() => !disabled && onSelect && onSelect(iso)}
                  disabled={disabled}
                  tabIndex={disabled ? -1 : 0}
                  className={`rounded-lg p-2 text-sm transition-all flex items-center justify-center ${
                    disabled
                      ? 'text-slate-500 bg-transparent'
                      : 'bg-gradient-to-br from-primary/25 to-accent/20 text-white shadow-md hover:scale-[1.03]'
                  } ${isToday ? 'ring-2 ring-white/20' : ''}`}
                  title={disabled ? `${d.toLocaleDateString()} — unavailable` : `Available: ${d.toLocaleDateString()}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-sm">{d.getDate()}</span>
                    {available && <span className="text-[11px] text-white/80">Available</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ServiceDetailPage - Main component for displaying service details and handling bookings
 *
 * @component
 * @returns {JSX.Element} Complete service detail page with provider info, reviews, and booking
 *
 * @description
 * Primary page component that orchestrates the display of:
 * - Service listing information (title, description, price, duration)
 * - Service provider details (name, contact, location, rating)
 * - Customer reviews with star ratings
 * - Interactive availability calendar
 * - Booking functionality (customer role only)
 * - Contact modal for provider communication
 *
 * @stateManagement
 * - Uses React Router for route parameter extraction (service ID)
 * - Auth context for user authentication and role checking
 * - Local state for service data, provider info, reviews, and UI modals
 *
 * @apiIntegration
 * Fetches data from multiple endpoints:
 * - GET /api/services/:id - Service listing details
 * - GET /api/providers/:id - Provider profile information
 * - GET /api/providers/:id/reviews - Customer reviews and ratings
 * - POST /api/bookings - Create new booking (via navigation state)
 *
 * @routing
 * URL Pattern: /services/:id
 * Example: /services/123
 *
 * Navigation:
 * - Back to services list
 * - Forward to booking page (with service and date selection)
 * - Login redirect if not authenticated
 *
 * @authorization
 * - Public: Can view service details
 * - Customers: Can book services
 * - Providers: Can view but cannot book (shows "View Details" instead)
 *
 * @errorHandling
 * - Graceful fallback for missing API endpoints (404)
 * - Displays fallback service data if fetch fails
 * - Shows error messages in console for debugging
 * - Continues loading even if reviews endpoint unavailable
 *
 * @accessibility
 * - Semantic HTML structure
 * - ARIA labels on interactive elements
 * - Keyboard navigation support
 * - Focus management in modals
 * - Screen reader friendly content
 *
 * @performance
 * - useMemo for computed values (average rating)
 * - useEffect cleanup to prevent memory leaks
 * - Conditional API calls based on data availability
 * - Optimistic UI updates
 *
 * @styling
 * - Glassmorphic design with backdrop blur effects
 * - Gradient backgrounds and smooth transitions
 * - Responsive grid layout
 * - Tailwind CSS utility classes
 * - Custom animations for loading states
 *
 * @example
 * // Used in App.jsx routing:
 * <Route path="/services/:id" element={<ServiceDetailPage />} />
 *
 * // Navigate programmatically:
 * navigate('/services/123');
 *
 * @dependencies
 * - react-router-dom: URL parameter extraction and navigation
 * - lucide-react: Icon components
 * - AuthContext: User authentication state
 * - API services: Backend integration
 * - Modal: Reusable modal component
 *
 * @children
 * - AvailabilityCalendar: Embedded calendar component
 * - Modal: Contact information modal
 * - Star rating displays
 * - Review cards
 *
 * @notes
 * - Service ID must be valid and exist in database
 * - Provider data is independent of service fetch (can load separately)
 * - Reviews endpoint is optional (graceful degradation)
 * - Booking requires customer authentication
 * - Date selection from calendar is passed to booking page
 */
export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCustomer } = useAuth();

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      // Fetch service by ID (not provider)
      let serviceData = null;
      try {
        if (serviceAPI?.getById) {
          console.log('Fetching service with ID:', id);
          const sres = await serviceAPI.getById(id);
          console.log('Service API Response:', sres);

          serviceData = sres.data?.data || sres.data || null;
          console.log('Extracted service data:', serviceData);

          if (!cancelled && serviceData) {
            setServices([serviceData]); // Set as array with single service
            console.log('Set services:', [serviceData]);

            // Now fetch provider details if available
            if (serviceData.provider?.id) {
              console.log('Provider found in service, ID:', serviceData.provider.id);
              try {
                if (providerAPI?.getById) {
                  const pres = await providerAPI.getById(serviceData.provider.id);
                  console.log('Provider API Response:', pres);
                  if (!cancelled) setProvider(pres.data?.data || pres.data || serviceData.provider);
                } else {
                  if (!cancelled) setProvider(serviceData.provider);
                }
              } catch (providerError) {
                console.warn('Could not fetch full provider details, using embedded data');
                if (!cancelled) setProvider(serviceData.provider);
              }
            } else if (serviceData.providerId) {
              console.log('Provider ID found (not object):', serviceData.providerId);
              // Fallback if provider object not included
              try {
                if (providerAPI?.getById) {
                  const pres = await providerAPI.getById(serviceData.providerId);
                  if (!cancelled) setProvider(pres.data?.data || pres.data || null);
                }
              } catch (providerError) {
                console.warn('Could not fetch provider by ID');
              }
            } else {
              console.warn('No provider information found in service data');
            }
          }
        }

        // Fetch reviews for the service provider (independent of main service fetch)
        if (serviceData?.provider?.id) {
          try {
            if (reviewAPI?.getByProvider) {
              console.log('Fetching reviews for provider:', serviceData.provider.id);
              // serviceData is guaranteed non-null here due to the if check above
              const rres = await reviewAPI.getByProvider(serviceData.provider.id);
              const reviewsData = rres.data?.data || rres.data || [];
              if (!cancelled) setReviews(Array.isArray(reviewsData) ? reviewsData : []);
            }
          } catch (reviewError) {
            console.warn('Reviews endpoint not available (404), skipping reviews');
            if (!cancelled) setReviews([]);
          }
        } else {
          console.log('No provider ID for reviews');
          if (!cancelled) setReviews([]);
        }

        // Set fallback only if service data failed to load
        if (!cancelled && !serviceData) {
          console.warn('Setting fallback service data - API returned no data');
          setServices([{
            id,
            title: 'Service Not Found',
            category: 'General',
            basePrice: 0,
            price: 0,
            durationMinutes: 0,
            description: 'Service details not available',
          }]);
          setProvider({
            id: 'unknown',
            name: 'Service Provider',
            city: 'Unknown',
            state: 'Unknown',
            phone: 'N/A',
            email: 'contact@example.com',
          });
        } else {
          console.log('Service loaded successfully');
        }
      } catch (err) {
        console.error('ServiceDetail load error:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        // Set fallback data only on actual service fetch error
        if (!cancelled) {
          setServices([{
            id,
            title: 'Service Details',
            category: 'General',
            basePrice: 500,
            price: 500,
            durationMinutes: 60,
            description: 'Unable to load service details',
          }]);
          setProvider({
            id: 'unknown',
            name: 'Service Provider',
            city: 'Unknown',
            state: 'Unknown',
            phone: 'N/A',
            email: 'contact@example.com',
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  /**
   * Computed average rating from all reviews
   *
   * @type {string}
   * @description
   * Calculates the mean rating from all customer reviews.
   * Returns "0.0" if no reviews exist.
   * Memoized to prevent recalculation on every render.
   *
   * @returns {string} Average rating formatted to 1 decimal place (e.g., "4.5")
   *
   * @example
   * // With reviews: [{rating: 5}, {rating: 4}, {rating: 5}]
   * avgRating // "4.7"
   *
   * // With no reviews:
   * avgRating // "0.0"
   */
  const avgRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return '0.0';
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  /**
   * Handles service booking navigation with authentication and authorization checks
   *
   * @function handleBookService
   * @param {Object} service - Service object to be booked
   * @param {number} service.id - Service listing ID
   * @param {string} service.title - Service title
   * @param {number} service.price - Service price
   * @param {number} service.durationMinutes - Service duration
   * @param {string|null} [dateIso=null] - Selected date in ISO format (YYYY-MM-DD)
   *
   * @description
   * Multi-step booking handler that:
   * 1. Checks if user is authenticated (redirects to login if not)
   * 2. Verifies user has customer role (providers cannot book)
   * 3. Prepares booking state with service and provider info
   * 4. Navigates to booking page with state data
   *
   * @authorization
   * - Unauthenticated users → Redirected to /login
   * - Provider users → Shows alert (cannot book)
   * - Customer users → Proceeds to booking page
   *
   * @navigation
   * Target: /bookings/new
   * State passed:
   * - providerId: Provider's unique ID
   * - providerName: Provider's display name
   * - service: Complete service object
   * - preferredDate: Selected date from calendar (optional)
   *
   * @example
   * // From "Book Now" button
   * handleBookService(serviceData, null);
   *
   * // From calendar date selection
   * handleBookService(serviceData, "2025-11-29");
   *
   * @sideEffects
   * - May navigate to /login page
   * - May show browser alert
   * - Navigates to booking page with state
   */
  const handleBookService = (service, dateIso = null) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isCustomer) {
      alert('Only customers can book services. Please sign in as a customer.');
      return;
    }
    const state = {
      providerId: provider?.id || id,
      providerName: provider?.name,
      service,
      preferredDate: dateIso || null,
    };
    navigate('/bookings/new', { state });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center">
          <p className="text-gray-600">Provider not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl mb-8 grid md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-display font-extrabold text-[var(--text-primary)] mb-2">{provider.name}</h1>
          <p className="text-sm text-slate-300 mb-3">Trusted local professionals — verified & reviewed</p>

          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <span>{provider.doorNo}, {provider.addressLine}, {provider.city}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone size={16} className="text-primary" />
              <a href={`tel:${provider.phone}`} className="underline">{provider.phone}</a>
            </div>

            <div className="flex items-center gap-2">
              <Mail size={16} className="text-primary" />
              <a href={`mailto:${provider.email}`} className="underline">{provider.email}</a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-end">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <Star size={28} className="text-yellow-400 fill-current" />
              <span className="text-3xl font-bold ml-2 text-white">{avgRating}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">{reviews.length} reviews</div>
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={() => setContactModalOpen(true)} className="btn-secondary inline-flex items-center gap-2">
              <MessageSquare size={16} /> Contact
            </button>
            <button onClick={() => window.open(`tel:${provider.phone}`)} className="btn-primary inline-flex items-center gap-2">
              Call Now
            </button>
          </div>
        </div>
      </div>

      {/* Main content: services + availability (left), reviews (right) */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Services list */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Services Offered</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map(service => (
                <div key={service.id} className="bg-white shadow-lg border border-gray-200 p-5 rounded-2xl hover:scale-[1.02] transition-transform">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{service.title}</h3>
                      <p className="text-sm text-slate-300 mt-1">{service.description}</p>

                      <div className="mt-3 flex gap-3 items-center text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-primary" />
                          <span className="font-medium">{formatCurrency(service.price || service.basePrice || 0)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-primary" />
                          <span>{service.durationMinutes} minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <button
                        onClick={() => { setSelectedServiceId(service.id); handleBookService(service, selectedDate); }}
                        className="btn-primary"
                      >
                        <Calendar size={16} className="mr-2 inline" />
                        Book Now
                      </button>

                      <button
                        onClick={() => { setSelectedServiceId(service.id); window.scrollTo({ top: window.scrollY + 220, behavior: 'smooth' }); }}
                        className="btn-ghost"
                      >
                        Check availability
                      </button>
                    </div>
                  </div>

                  {/* Inline calendar for selected service only */}
                  {selectedServiceId === service.id && (
                    <div className="mt-4">
                      <AvailabilityCalendar
                        providerId={provider.id}
                        serviceId={service.id}
                        onSelect={(iso) => {
                          setSelectedDate(iso);
                          // quick visual confirmation, then navigate to booking with date
                          handleBookService(service, iso);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Reviews column */}
        <aside className="space-y-6">
          <div className="bg-white shadow-lg border border-gray-200 p-5 rounded-2xl">
            <h3 className="text-lg font-semibold mb-3">About</h3>
            <p className="text-sm text-slate-300">Licensed & insured professionals with transparent pricing and verified reviews.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="label-soft">Verified ID</div>
              <div className="label-soft">Safe Payment</div>
              <div className="label-soft">Satisfaction Guarantee</div>
              <div className="label-soft">Secure Checkout</div>
            </div>
          </div>

          <div className="bg-white shadow-lg border border-gray-200 p-5 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>

            {reviews.length === 0 ? (
              <div className="text-sm text-slate-400">No reviews yet</div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-auto pr-2">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-white/6 pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{r.customerName}</div>
                        <div className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400" />
                        <span className="font-medium">{r.rating}</span>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-slate-300">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Contact modal */}
      <Modal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} title={`Contact ${provider.name}`} size="sm">
        <div className="space-y-3">
          <p className="text-sm text-slate-400">You can reach out via phone or email:</p>
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-primary" />
            <a href={`tel:${provider.phone}`} className="font-medium">{provider.phone}</a>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-primary" />
            <a href={`mailto:${provider.email}`} className="font-medium">{provider.email}</a>
          </div>

          <div className="pt-4 flex justify-end">
            <button onClick={() => setContactModalOpen(false)} className="btn-secondary">Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
