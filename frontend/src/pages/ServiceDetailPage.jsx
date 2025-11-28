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
import { providerAPI, reviewAPI, serviceAPI, availabilityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/constants';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

/*
  Enhanced ServiceDetailPage
  - Glassy Figma-like layout
  - Inline availability month timeline (AvailabilityCalendar)
  - Accessible cells, keyboard focus, and micro-interactions
  - Mock fallbacks for APIs if unavailable
*/

const todayISO = () => new Date().toISOString().split('T')[0];

/* Utility: returns array of Date objects for given month (monthStart = Date) */
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

/* AvailabilityCalendar: shows a single-month grid; highlights available days */
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
        if (availabilityAPI?.getAvailability) {
          // API should return array of ISO dates ['2025-11-20', ...]
          const res = await availabilityAPI.getAvailability(providerId, serviceId, monthStart.toISOString());
          const list = res?.data ?? res;
          if (!cancelled) setAvailableDates(new Set((list || []).map(d => d.split('T')[0] || d)));
        } else {
          // Fallback mock: randomly mark some future days as available
          const available = new Set();
          const today = new Date();
          monthDays.forEach((d) => {
            if (d && d >= today) {
              // simple deterministic pseudo-random using date number
              const seed = d.getDate() + monthStart.getMonth();
              if ((seed * 37) % 5 < 2) available.add(d.toISOString().split('T')[0]);
            }
          });
          if (!cancelled) setAvailableDates(available);
        }
      } catch (err) {
        console.error('availability fetch error', err);
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
    <div className="card-glass p-4 rounded-2xl">
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
      try {
        if (providerAPI?.getById) {
          const res = await providerAPI.getById(id);
          if (!cancelled) setProvider(res.data || res);
        } else {
          // fallback mock provider
          if (!cancelled) setProvider({
            id,
            name: 'Reliable Home Services',
            doorNo: '12A',
            addressLine: 'Service Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            phone: '+91 1234567890',
            email: 'hello@servicespot.com',
          });
        }

        if (serviceAPI?.getByProvider) {
          const sres = await serviceAPI.getByProvider(id);
          if (!cancelled) setServices(sres.data || sres);
        } else {
          if (!cancelled) setServices([{
            id: 's1',
            title: 'General Service',
            category: 'Plumbing',
            basePrice: 500,
            durationMinutes: 60,
            description: 'Basic plumbing services including repairs and installations',
          }]);
        }

        if (reviewAPI?.getByProvider) {
          const rres = await reviewAPI.getByProvider(id);
          if (!cancelled) setReviews(rres.data || rres);
        } else {
          if (!cancelled) setReviews([
            { id: 'r1', customerName: 'John Doe', rating: 5, comment: 'Excellent service!', createdAt: '2025-11-20' },
            { id: 'r2', customerName: 'Jane Smith', rating: 4, comment: 'Good work, would recommend.', createdAt: '2025-11-18' },
          ]);
        }
      } catch (err) {
        console.error('ServiceDetail load error', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const avgRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return '0.0';
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

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
      <div className="card-glass p-6 rounded-2xl mb-8 grid md:grid-cols-3 gap-6 items-center">
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
                <div key={service.id} className="card-glass p-5 rounded-2xl hover:scale-[1.02] transition-transform">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{service.title}</h3>
                      <p className="text-sm text-slate-300 mt-1">{service.description}</p>

                      <div className="mt-3 flex gap-3 items-center text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-primary" />
                          <span className="font-medium">{formatCurrency(service.basePrice)}</span>
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
          <div className="card-glass p-5 rounded-2xl">
            <h3 className="text-lg font-semibold mb-3">About</h3>
            <p className="text-sm text-slate-300">Licensed & insured professionals with transparent pricing and verified reviews.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="label-soft">Verified ID</div>
              <div className="label-soft">Safe Payment</div>
              <div className="label-soft">Satisfaction Guarantee</div>
              <div className="label-soft">Secure Checkout</div>
            </div>
          </div>

          <div className="card-glass p-5 rounded-2xl">
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