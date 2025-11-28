import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar as CalIcon, Clock, DollarSign, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { bookingAPI, availabilityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatTime } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * CalendarMonth
 * - props: year, month (0-11), providerId, serviceId, onSelectDate(selectedISODate)
 * - fetches month availability via availabilityAPI (best-effort)
 * - highlights available days; accessible keyboard navigation
 *
 * Notes: availabilityAPI may expose various endpoints; this component tries:
 * 1) availabilityAPI.getMonth({ providerId, serviceId, year, month })
 * 2) availabilityAPI.getAvailability({ providerId, serviceId, year, month })
 * 3) availabilityAPI.fetch('/availability?providerId=...&month=...')
 * Response shapes supported:
 * - { dates: ['2025-11-28', '2025-11-30'] }
 * - { availability: { '2025-11-28': { slots: [...] } } }
 * - [ '2025-11-28', ... ] or [ { date: '2025-11-28', slots: [...] }, ... ]
 */
function CalendarMonth({ year, month, providerId, serviceId, selectedDate, onSelectDate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState({}); // map 'YYYY-MM-DD' -> { count, slotsAvailable: true/false }
  const [cursor, setCursor] = useState({ year, month }); // local month cursor for navigation
  const gridRef = useRef(null);

  useEffect(() => {
    setCursor({ year, month });
  }, [year, month]);

  const fetchMonth = useCallback(async (y, m) => {
    setLoading(true);
    setError('');
    setAvailability({});
    try {
      let res;
      // try common helper names
      if (typeof availabilityAPI.getMonth === 'function') {
        res = await availabilityAPI.getMonth({ providerId, serviceId, year: y, month: m + 1 }); // month 1-12
      } else if (typeof availabilityAPI.getAvailability === 'function') {
        res = await availabilityAPI.getAvailability({ providerId, serviceId, year: y, month: m + 1 });
      } else if (typeof availabilityAPI.fetch === 'function') {
        res = await availabilityAPI.fetch(`/availability?providerId=${providerId}&serviceId=${serviceId}&year=${y}&month=${m + 1}`);
      } else if (typeof availabilityAPI.getSlots === 'function') {
        // fallback: call getSlots for each day (avoid if extreme) — here we won't poll per-day to keep efficient
        res = null;
      } else {
        throw new Error('availabilityAPI not implemented');
      }

      const raw = res?.data ?? res;
      // normalize into set/dictionary
      const map = {};

      if (!raw) {
        // nothing
      } else if (Array.isArray(raw)) {
        // array of dates or objects
        raw.forEach((r) => {
          if (typeof r === 'string') {
            map[r] = { count: 1, available: true };
          } else if (r?.date) {
            const d = r.date;
            const slots = r.slots ?? r.count ?? (Array.isArray(r.slots) ? r.slots.length : undefined);
            map[d] = { count: Array.isArray(r.slots) ? r.slots.length : (r.count ?? (slots ? slots : 1)), available: (r.available !== false) };
          }
        });
      } else if (typeof raw === 'object') {
        // maybe { dates: ['2025-11-28'] } or { availability: { '2025-11-28': {...} } }
        if (Array.isArray(raw.dates)) {
          raw.dates.forEach(d => map[d] = { count: 1, available: true });
        }
        if (raw.availability && typeof raw.availability === 'object') {
          Object.entries(raw.availability).forEach(([d, v]) => {
            if (typeof v === 'number') map[d] = { count: v, available: v > 0 };
            else if (Array.isArray(v.slots ?? v)) map[d] = { count: (v.slots ?? v).length, available: (v.slots ?? v).length > 0 };
            else map[d] = { count: (v.count ?? 1), available: v.available !== false };
          });
        }
        // maybe shape { '2025-11-28': ['10:00','11:00'] }
        else {
          Object.entries(raw).forEach(([k, v]) => {
            if (Array.isArray(v)) map[k] = { count: v.length, available: v.length > 0 };
            else if (typeof v === 'object' && (v.slots || v.count)) map[k] = { count: v.slots ? v.slots.length : (v.count || 0), available: (v.slots ? v.slots.length > 0 : (v.available !== false)) };
          });
        }
      }

      setAvailability(map);
    } catch (err) {
      console.error('Calendar fetch error', err);
      setError('Could not load availability for this month.');
    } finally {
      setLoading(false);
    }
  }, [providerId, serviceId]);

  useEffect(() => {
    fetchMonth(cursor.year, cursor.month);
  }, [cursor.year, cursor.month, fetchMonth]);

  // helpers to build month grid
  const buildMonthGrid = (y, m) => {
    const firstOfMonth = new Date(y, m, 1);
    const startDay = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const grid = [];
    // previous month filler
    const prevMonthDays = startDay; // number of blank cells before 1st
    const daysPrevMonth = new Date(y, m, 0).getDate();

    // build 6 rows of 7 days each (42 cells)
    for (let i = 0; i < 42; i++) {
      const cellIndex = i;
      const dayNumber = i - prevMonthDays + 1;
      let cell = { date: null, inMonth: false, iso: null };
      if (dayNumber <= 0) {
        // previous month
        const d = daysPrevMonth + dayNumber;
        const dt = new Date(y, m - 1, d);
        const iso = dt.toISOString().split('T')[0];
        cell = { date: d, inMonth: false, iso };
      } else if (dayNumber > daysInMonth) {
        // next month
        const d = dayNumber - daysInMonth;
        const dt = new Date(y, m + 1, d);
        const iso = dt.toISOString().split('T')[0];
        cell = { date: d, inMonth: false, iso };
      } else {
        // current month
        const dt = new Date(y, m, dayNumber);
        const iso = dt.toISOString().split('T')[0];
        cell = { date: dayNumber, inMonth: true, iso };
      }
      grid.push(cell);
    }
    return grid;
  };

  const grid = buildMonthGrid(cursor.year, cursor.month);
  const todayIso = new Date().toISOString().split('T')[0];

  // keyboard navigation within calendar grid
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const handleKey = (e) => {
      const focusable = Array.from(el.querySelectorAll('button[data-cell]'));
      if (!focusable.length) return;
      const idx = focusable.indexOf(document.activeElement);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        focusable[(idx + 1) % focusable.length]?.focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        focusable[(idx - 1 + focusable.length) % focusable.length]?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusable[(idx + 7) % focusable.length]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusable[(idx - 7 + focusable.length) % focusable.length]?.focus();
      }
    };
    el.addEventListener('keydown', handleKey);
    return () => el.removeEventListener('keydown', handleKey);
  }, [gridRef, grid]);

  const prevMonth = () => {
    setCursor((c) => {
      const date = new Date(c.year, c.month - 1, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  };
  const nextMonth = () => {
    setCursor((c) => {
      const date = new Date(c.year, c.month + 1, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  };
  const jumpToToday = () => {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
  };

  return (
    <div className="p-4 bg-white/5 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <CalIcon size={18} className="text-primary" />
          <div>
            <div className="text-sm font-semibold text-white">
              {new Date(cursor.year, cursor.month).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </div>
            <div className="text-xs text-slate-400">Pick a date to see available slots</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={prevMonth} className="p-2 rounded-md hover:bg-white/5">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={jumpToToday} className="p-2 rounded-md hover:bg-white/5 text-sm">Today</button>
          <button type="button" onClick={nextMonth} className="p-2 rounded-md hover:bg-white/5">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        <div ref={gridRef} className="grid grid-cols-7 gap-2" tabIndex={0} aria-label="Calendar">
          {loading && (
            <div className="col-span-7 flex items-center justify-center py-8">
              <LoadingSpinner size="sm" />
            </div>
          )}

          {grid.map((cell, idx) => {
            const isToday = cell.iso === todayIso;
            const isSelected = cell.iso === selectedDate;
            const info = availability[cell.iso];
            const available = info?.available || false;
            const count = info?.count ?? 0;

            // style variants
            const base = `p-2 rounded-lg min-h-[56px] flex flex-col items-center justify-between`;
            const inMonthClass = cell.inMonth ? 'opacity-100' : 'opacity-40';
            const availableClass = available ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md' : 'bg-white/3 text-slate-300';
            const selectedClass = isSelected ? 'ring-2 ring-offset-2 ring-primary/60' : '';

            return (
              <button
                key={idx}
                data-cell
                type="button"
                onClick={() => onSelectDate(cell.iso)}
                disabled={!cell.inMonth}
                aria-pressed={isSelected}
                aria-label={`${cell.iso} ${available ? `${count} slots available` : 'no slots available'}`}
                className={`${base} ${inMonthClass} ${cell.inMonth ? (available ? availableClass : 'bg-white/6') : 'bg-transparent'} ${selectedClass} transition-all hover:scale-[1.02]`}
              >
                <div className="text-sm font-medium">
                  <span className={`${isToday ? 'underline' : ''}`}>{cell.date}</span>
                </div>
                <div className="text-[11px]">
                  {loading ? null : (available ? <span className="text-white/90 text-xs">{count > 1 ? `${count} slots` : 'Available'}</span> : <span className="text-slate-400">—</span>)}
                </div>
              </button>
            );
          })}
        </div>

        {error && <div className="text-xs text-red-400 mt-2">{error}</div>}
      </div>
    </div>
  );
}

/* ---------------------------
   BookingPage (main)
   - integrates CalendarMonth and slot fetching
   --------------------------- */
export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { providerId, providerName, service } = location.state || {};

  const [bookingData, setBookingData] = useState({ date: '', time: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // availability slots for selected date
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [allowManualTime, setAllowManualTime] = useState(false);

  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!providerId || !service) {
      navigate('/services', { replace: true });
    }
  }, [providerId, service, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [user, navigate, location]);

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
    setError('');
    if (name === 'date') {
      setBookingData((p) => ({ ...p, time: '' }));
    }
  };

  // when a date is selected from calendar, set booking date and fetch slots
  const handleSelectDate = (isoDate) => {
    setBookingData((prev) => ({ ...prev, date: isoDate, time: '' }));
    setAllowManualTime(false);
  };

  // fetch slots when selected date changes
  useEffect(() => {
    let active = true;
    const date = bookingData.date;
    if (!date) {
      setSlots([]);
      setSlotsError('');
      setSlotsLoading(false);
      return;
    }

    setSlots([]);
    setSlotsError('');
    setSlotsLoading(true);
    setAllowManualTime(false);

    async function fetchSlots() {
      try {
        let res;
        if (typeof availabilityAPI.getSlots === 'function') {
          res = await availabilityAPI.getSlots({ providerId, serviceId: service?.id, date });
        } else if (typeof availabilityAPI.getDay === 'function') {
          res = await availabilityAPI.getDay({ providerId, serviceId: service?.id, date });
        } else if (typeof availabilityAPI.fetch === 'function') {
          res = await availabilityAPI.fetch(`/availability/slots?providerId=${providerId}&serviceId=${service?.id}&date=${date}`);
        } else {
          throw new Error('availabilityAPI.getSlots not implemented');
        }

        const raw = res?.data ?? res;
        let normalized = [];

        if (Array.isArray(raw)) {
          if (raw.length && typeof raw[0] === 'string') normalized = raw.map(t => ({ time: t, available: true }));
          else normalized = raw.map((r) => ({ time: r.time ?? r.slot ?? '', available: r.available !== false })).filter(s => s.time);
        } else if (raw?.slots) {
          normalized = (raw.slots || []).map(s => ({ time: s.time ?? s, available: s.available !== false }));
        } else if (raw?.data && Array.isArray(raw.data)) {
          normalized = raw.data.map(s => ({ time: s.time ?? s, available: s.available !== false }));
        } else {
          // other shapes
          normalized = [];
        }

        if (active) {
          setSlots(normalized);
          setSlotsLoading(false);
          if (!normalized.length) {
            setSlotsError('No predefined slots for this date. You may enter a preferred time manually.');
            setAllowManualTime(true);
          } else {
            setSlotsError('');
          }
        }
      } catch (err) {
        console.error('Error fetching slots', err);
        if (active) {
          setSlots([]);
          setSlotsLoading(false);
          setSlotsError('Could not load slots. You can enter a preferred time manually.');
          setAllowManualTime(true);
        }
      }
    }

    const t = setTimeout(fetchSlots, 150);
    return () => { active = false; clearTimeout(t); };
  }, [bookingData.date, providerId, service]);

  function validateDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return { ok: false, message: 'Please select both date and time.' };

    const combined = new Date(`${dateStr}T${timeStr}:00`);
    if (Number.isNaN(combined.getTime())) return { ok: false, message: 'Invalid date/time.' };

    if (combined.getTime() <= Date.now()) return { ok: false, message: 'Please choose a future date/time.' };

    return { ok: true, dateObj: combined };
  }

  function toISOStringLocal(dateObj) {
    return dateObj.toISOString();
  }

  const chooseSlot = (slotTime, available) => {
    if (!available) return;
    setBookingData((p) => ({ ...p, time: slotTime }));
    setTimeout(() => confirmBtnRef.current?.focus(), 100);
  };

  async function submitBooking() {
    const { date, time, notes } = bookingData;
    const validated = validateDateTime(date, time);
    if (!validated.ok) {
      setError(validated.message);
      return;
    }

    const slotStartIso = toISOStringLocal(validated.dateObj);
    const payload = {
      serviceItemId: service.id,
      providerId,
      customerId: user.id,
      slotStart: slotStartIso,
      notes: notes?.trim() || '',
      status: 'PENDING',
    };

    const confirmed = window.confirm(
      `Confirm booking with ${providerName}\n\nService: ${service.title}\nWhen: ${formatDate(validated.dateObj.toISOString())} ${formatTime(validated.dateObj.toISOString().split('T')[1] || '')}\nPrice: ${formatCurrency(service.basePrice)}`
    );
    if (!confirmed) return;

    setLoading(true);
    setError('');
    try {
      await bookingAPI.create(payload);
      alert('Booking request sent successfully!');
      navigate('/my-bookings');
    } catch (err) {
      console.error('Booking error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to create booking. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    submitBooking();
  };

  if (!service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-400">No service selected.</p>
          <button onClick={() => navigate('/services')} className="mt-4 btn-primary">Browse Services</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Book Service</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Summary */}
          <aside className="card bg-white/90 border border-white/10">
            <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-semibold flex items-center">
                  <User size={18} className="mr-2 text-primary" />
                  {providerName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-semibold">{service.title}</p>
                {service.description && <p className="text-sm text-gray-600 mt-1">{service.description}</p>}
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center text-gray-700">
                    <DollarSign size={18} className="mr-1 text-primary" />
                    Base Price
                  </span>
                  <span className="font-semibold">{formatCurrency(service.basePrice)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-700">
                    <Clock size={18} className="mr-1 text-primary" />
                    Duration
                  </span>
                  <span className="font-semibold">{service.durationMinutes} min</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Booking Form + Calendar */}
          <section className="space-y-4">
            <div className="card p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">Choose a Date</h2>
                  <CalendarMonth
                    year={new Date().getFullYear()}
                    month={new Date().getMonth()}
                    providerId={providerId}
                    serviceId={service?.id}
                    selectedDate={bookingData.date}
                    onSelectDate={handleSelectDate}
                  />
                </div>

                <div className="w-full md:w-80">
                  <h3 className="text-lg font-semibold mb-2">Selected</h3>
                  <div className="card p-3">
                    <p className="text-sm text-slate-500">Date</p>
                    <p className="font-semibold">{bookingData.date ? formatDate(bookingData.date) : 'No date selected'}</p>

                    <div className="mt-4">
                      <p className="text-sm text-slate-500">Time</p>

                      {/* If slots available for selected date */}
                      {slotsLoading ? (
                        <div className="mt-2"><LoadingSpinner size="sm" /></div>
                      ) : (slots && slots.length > 0 && !allowManualTime) ? (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {slots.map((s) => {
                            const isSelected = bookingData.time === s.time;
                            return (
                              <button
                                key={s.time}
                                type="button"
                                onClick={() => chooseSlot(s.time, s.available)}
                                disabled={!s.available}
                                className={`px-3 py-2 rounded-md text-sm transition ${s.available ? (isSelected ? 'bg-gradient-to-r from-primary to-accent text-white' : 'bg-white/6 hover:bg-white/10') : 'bg-gray-800 text-gray-400 cursor-not-allowed line-through'}`}
                                aria-pressed={isSelected}
                              >
                                {s.time}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="mt-2">
                          <input
                            id="time"
                            name="time"
                            type="time"
                            value={bookingData.time}
                            onChange={handleChange}
                            className="input-field"
                            disabled={!bookingData.date}
                            aria-required
                          />
                          <div className="mt-2 text-xs text-slate-500">
                            {slotsError ? slotsError : (!bookingData.date ? 'Select a date to see slots' : 'No slots — enter a preferred time')}
                          </div>

                          {slots && slots.length > 0 && (
                            <button type="button" onClick={() => setAllowManualTime(false)} className="btn-ghost mt-2 text-sm">Show available slots</button>
                          )}
                        </div>
                      )}

                      <div className="mt-4">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                        <textarea id="notes" name="notes" rows="3" value={bookingData.notes} onChange={handleChange} className="input-field" placeholder="Any requirements..." />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* submit card */}
            <form onSubmit={handleSubmit} className="card p-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

              <div className="pt-2 border-t flex flex-col gap-3">
                <button type="submit" disabled={loading} ref={confirmBtnRef} className="w-full btn-primary flex items-center justify-center gap-3">
                  {loading ? <LoadingSpinner size="sm" /> : null}
                  <span>{loading ? 'Creating Booking...' : 'Confirm Booking'}</span>
                </button>

                <button type="button" onClick={() => navigate(-1)} className="w-full btn-secondary">Cancel</button>
              </div>
            </form>
          </section>
        </div>

        <div className="card mt-6 bg-white/95">
          <h3 className="font-semibold mb-2">Important Information</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Your booking request will be sent to the provider for confirmation.</li>
            <li>• The provider may suggest alternative times based on availability.</li>
            <li>• You will be notified once the provider confirms your booking.</li>
            <li>• Cancellation policy may apply after confirmation.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}