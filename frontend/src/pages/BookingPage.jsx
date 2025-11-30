import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar as CalIcon, Clock, DollarSign, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { bookingAPI, specificAvailabilityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/constants';
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
      // Helper to format date locally
      const getLocalDate = (year, month, day) => {
        const yStr = String(year).padStart(4, '0');
        const mStr = String(month + 1).padStart(2, '0');
        const dStr = String(day).padStart(2, '0');
        return `${yStr}-${mStr}-${dStr}`;
      };

      // Calculate month date range without timezone conversion
      const startDate = getLocalDate(y, m, 1);
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const endDate = getLocalDate(y, m, daysInMonth);

      // Fetch provider's specific availability for this month
      const res = await specificAvailabilityAPI.getAvailableDates(providerId, startDate, endDate);
      const availableDates = res?.data?.data || res?.data || [];

      console.log('Provider specific availability (dates):', availableDates);

      // Build map of available dates
      const map = {};
      const today = new Date();
      const todayStr = getLocalDate(today.getFullYear(), today.getMonth(), today.getDate());

      // Mark each available date (only future dates)
      availableDates.forEach(dateStr => {
        // Simple string comparison works for YYYY-MM-DD format
        if (dateStr >= todayStr) {
          map[dateStr] = {
            count: 1, // Will be updated with actual slot count
            available: true,
            hasExplicitSlots: true,
            slots: []
          };
        }
      });

      // If no specific dates, show message
      if (availableDates.length === 0) {
        setError('Provider has not set any availability for this month. Please contact the provider.');
      }

      setAvailability(map);
    } catch (err) {
      console.error('Calendar fetch error', err);
      setError('Could not load provider availability. Please try again later.');
      setAvailability({});
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchMonth(cursor.year, cursor.month);
  }, [cursor.year, cursor.month, fetchMonth]);

  // Helper to get YYYY-MM-DD without timezone conversion
  const getLocalISODate = (year, month, day) => {
    const y = String(year).padStart(4, '0');
    const m = String(month + 1).padStart(2, '0'); // month is 0-indexed
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

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
        const iso = getLocalISODate(y, m - 1, d);
        cell = { date: d, inMonth: false, iso };
      } else if (dayNumber > daysInMonth) {
        // next month
        const d = dayNumber - daysInMonth;
        const iso = getLocalISODate(y, m + 1, d);
        cell = { date: d, inMonth: false, iso };
      } else {
        // current month
        const iso = getLocalISODate(y, m, dayNumber);
        cell = { date: dayNumber, inMonth: true, iso };
      }
      grid.push(cell);
    }
    return grid;
  };

  const grid = buildMonthGrid(cursor.year, cursor.month);
  const today = new Date();
  const todayIso = getLocalISODate(today.getFullYear(), today.getMonth(), today.getDate());

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
    <div className="p-5 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-white/10 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <CalIcon size={20} className="text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-white">
              {new Date(cursor.year, cursor.month).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </div>
            <div className="text-xs text-slate-300">Pick a date to see available time slots</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 transition bg-white/5">
            <ChevronLeft size={18} className="text-white" />
          </button>
          <button type="button" onClick={jumpToToday} className="px-3 py-2 rounded-lg hover:bg-white/10 transition bg-white/5 text-sm font-medium text-white">
            Today
          </button>
          <button type="button" onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 transition bg-white/5">
            <ChevronRight size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-3 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-pink-500"></div>
          <span className="text-slate-300">Provider's time slots</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-400 to-teal-500"></div>
          <span className="text-slate-300">Available for booking</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-300 mb-3">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="py-2 bg-white/5 rounded">{d}</div>
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
            const hasExplicitSlots = info?.hasExplicitSlots || false;
            const count = info?.count ?? 0;

            // style variants
            const base = `p-2 rounded-lg min-h-[56px] flex flex-col items-center justify-between transition-all hover:scale-105`;
            const inMonthClass = cell.inMonth ? 'opacity-100' : 'opacity-30';

            // Different colors for dates with explicit slots vs manual booking
            let availableClass = 'bg-white/5 text-slate-400 hover:bg-white/10';
            if (available && hasExplicitSlots) {
              // Provider has set specific time slots - show vibrant gradient
              availableClass = 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl';
            } else if (available && !hasExplicitSlots) {
              // Manual booking available - show subtle gradient
              availableClass = 'bg-gradient-to-br from-emerald-400/60 to-teal-500/60 text-white shadow-md hover:shadow-lg';
            }

            const selectedClass = isSelected ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900 scale-105' : '';
            const todayClass = isToday ? 'border-2 border-yellow-300' : '';

            return (
              <button
                key={idx}
                data-cell
                type="button"
                onClick={() => onSelectDate(cell.iso)}
                disabled={!cell.inMonth || !available}
                aria-pressed={isSelected}
                aria-label={`${cell.iso} ${available ? (hasExplicitSlots ? `${count} time slots available` : 'available for booking') : 'not available'}`}
                className={`${base} ${inMonthClass} ${cell.inMonth ? availableClass : 'bg-transparent'} ${selectedClass} ${todayClass}`}
              >
                <div className="text-sm font-semibold">
                  <span>{cell.date}</span>
                </div>
                <div className="text-[10px] font-medium">
                  {loading ? null : available ? (
                    hasExplicitSlots ?
                      <span className="text-white/95">{count} slot{count > 1 ? 's' : ''}</span> :
                      <span className="text-white/80">Open</span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
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

  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: '',
    serviceDoorNo: '',
    serviceAddressLine: '',
    serviceCity: '',
    serviceState: '',
    servicePincode: ''
  });
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
        console.log('Fetching time slots for:', { date, providerId });

        // Fetch provider's specific time slots for this date
        const res = await specificAvailabilityAPI.getTimeSlots(providerId, date);
        const timeSlots = res?.data?.data || res?.data || [];

        console.log('Available time slots response:', timeSlots);

        if (timeSlots.length === 0) {
          if (active) {
            setSlots([]);
            setSlotsLoading(false);
            setSlotsError('No time slots available for this date. Please select another date.');
            setAllowManualTime(false); // Don't allow manual time - provider must set specific slots
          }
          return;
        }

        // Convert to time slot format
        const normalized = timeSlots.map(slot => ({
          time: slot.startTime.substring(0, 5), // "10:00:00" -> "10:00"
          available: slot.isAvailable && !slot.availableSlots || slot.availableSlots > 0,
          slotId: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          availableSlots: slot.availableSlots,
          maxBookings: slot.maxBookings
        }));

        if (active) {
          setSlots(normalized);
          setSlotsLoading(false);
          setSlotsError('');
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
    const { date, time, notes, serviceDoorNo, serviceAddressLine, serviceCity, serviceState, servicePincode } = bookingData;

    // Validate required fields
    if (!serviceDoorNo?.trim()) {
      setError('Please enter the door/flat number');
      return;
    }
    if (!serviceAddressLine?.trim()) {
      setError('Please enter the service address');
      return;
    }
    if (!serviceCity?.trim()) {
      setError('Please enter the city');
      return;
    }
    if (!serviceState?.trim()) {
      setError('Please enter the state');
      return;
    }
    if (!servicePincode || servicePincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    const validated = validateDateTime(date, time);
    if (!validated.ok) {
      setError(validated.message);
      return;
    }

    // Split the datetime into date and time for backend
    const bookingDate = validated.dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = time.padEnd(8, ':00'); // HH:mm or HH:mm:ss

    const payload = {
      customerId: user.id,
      serviceListingId: service.id,
      bookingDate: bookingDate,
      bookingTime: timeStr,
      durationMinutes: service.durationMinutes || 60,
      serviceDoorNo: serviceDoorNo.trim(),
      serviceAddressLine: serviceAddressLine.trim(),
      serviceCity: serviceCity.trim(),
      serviceState: serviceState.trim(),
      servicePincode: parseInt(servicePincode, 10),
      customerNotes: notes?.trim() || '',
      paymentMethod: 'Cash' // Default to Cash, can be made selectable later
    };

    const confirmed = window.confirm(
      `Confirm booking with ${providerName}\n\nService: ${service.title}\nWhen: ${formatDate(bookingDate)} ${time}\nLocation: ${serviceDoorNo}, ${serviceAddressLine}, ${serviceCity}\nPrice: ${formatCurrency(service.price || service.basePrice || 0)}`
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Book Your Service
            </h1>
            <p className="text-slate-400">Select your preferred date, time, and enter service location</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Booking Summary - Left Sidebar */}
            <aside className="lg:col-span-2 card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-white/20 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <User size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Booking Summary</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Provider</p>
                  <p className="font-bold text-white text-lg">{providerName}</p>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Service</p>
                  <p className="font-bold text-white text-lg">{service.title}</p>
                  {service.description && (
                    <p className="text-sm text-slate-300 mt-2 line-clamp-2">{service.description}</p>
                  )}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <span className="flex items-center text-white font-medium">
                      <DollarSign size={20} className="mr-2 text-green-400" />
                      Base Price
                    </span>
                    <span className="font-bold text-xl text-green-400">
                      {formatCurrency(service.price || service.basePrice || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="flex items-center text-slate-300">
                      <Clock size={18} className="mr-2 text-blue-400" />
                      Duration
                    </span>
                    <span className="font-semibold text-white">{service.durationMinutes || 60} minutes</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Booking Form + Calendar - Main Content */}
            <section className="lg:col-span-3 space-y-6">
            {/* Calendar Section */}
            <div className="card bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-white/10 shadow-2xl backdrop-blur-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                <CalIcon className="text-purple-400" size={24} />
                Choose Date & Time
              </h2>
              <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1">
                  <CalendarMonth
                    year={new Date().getFullYear()}
                    month={new Date().getMonth()}
                    providerId={providerId}
                    serviceId={service?.id}
                    selectedDate={bookingData.date}
                    onSelectDate={handleSelectDate}
                  />
                </div>

                <div className="xl:w-80">
                  <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 shadow-xl">
                    <h3 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                      <Clock className="text-purple-400" size={20} />
                      Selected Booking
                    </h3>

                    <div className="space-y-4">
                      {/* Date Display */}
                      <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Date</p>
                        <p className="font-bold text-white">
                          {bookingData.date ? formatDate(bookingData.date) : 'No date selected'}
                        </p>
                      </div>

                      {/* Time Selection */}
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Time</p>

                        {/* If slots available for selected date */}
                        {slotsLoading ? (
                          <div className="mt-2 flex justify-center"><LoadingSpinner size="sm" /></div>
                        ) : (slots && slots.length > 0 && !allowManualTime) ? (
                          <div className="grid grid-cols-2 gap-2">
                            {slots.map((s) => {
                              const isSelected = bookingData.time === s.time;
                              return (
                                <button
                                  key={s.time}
                                  type="button"
                                  onClick={() => chooseSlot(s.time, s.available)}
                                  disabled={!s.available}
                                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                    s.available ? (
                                      isSelected ?
                                        'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg scale-105' :
                                        'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 shadow-md'
                                    ) :
                                    'bg-gray-800 text-gray-500 cursor-not-allowed line-through opacity-50'
                                  }`}
                                  aria-pressed={isSelected}
                                >
                                  {s.time}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div>
                            <input
                              id="time"
                              name="time"
                              type="time"
                              value={bookingData.time}
                              onChange={handleChange}
                              className="input-field w-full bg-black/30 border-white/20 text-white"
                              disabled={!bookingData.date}
                              aria-required
                            />
                            <div className="mt-2 text-xs text-slate-400 bg-blue-500/10 border border-blue-500/30 rounded p-2">
                              {slotsError ? slotsError : (!bookingData.date ? '👆 Select a date first' : '⏰ Enter your preferred time')}
                            </div>

                            {slots && slots.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setAllowManualTime(false)}
                                className="btn-ghost mt-2 text-sm w-full"
                              >
                                Show available slots
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div>
                        <label htmlFor="notes" className="block text-xs text-slate-400 uppercase tracking-wide mb-2">
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows="3"
                          value={bookingData.notes}
                          onChange={handleChange}
                          className="input-field w-full bg-black/30 border-white/20 text-white placeholder-slate-500"
                          placeholder="Any special requirements..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Address Section */}
            <div className="card bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30 shadow-2xl backdrop-blur-md p-6">
              <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Service Location
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="serviceDoorNo" className="block text-sm font-semibold text-slate-300 mb-2">
                      Door/Flat Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="serviceDoorNo"
                      name="serviceDoorNo"
                      type="text"
                      value={bookingData.serviceDoorNo}
                      onChange={handleChange}
                      className="input-field w-full bg-black/30 border-white/20 text-white placeholder-slate-500"
                      placeholder="e.g., 123, Flat 4B"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="servicePincode" className="block text-sm font-semibold text-slate-300 mb-2">
                      Pincode <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="servicePincode"
                      name="servicePincode"
                      type="text"
                      value={bookingData.servicePincode}
                      onChange={handleChange}
                      className="input-field w-full bg-black/30 border-white/20 text-white placeholder-slate-500"
                      placeholder="e.g., 560001"
                      maxLength="6"
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="serviceAddressLine" className="block text-sm font-semibold text-slate-300 mb-2">
                    Address Line <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="serviceAddressLine"
                    name="serviceAddressLine"
                    type="text"
                    value={bookingData.serviceAddressLine}
                    onChange={handleChange}
                    className="input-field w-full bg-black/30 border-white/20 text-white placeholder-slate-500"
                    placeholder="Street, Area, Landmark"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="serviceCity" className="block text-sm font-semibold text-slate-300 mb-2">
                      City <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="serviceCity"
                      name="serviceCity"
                      type="text"
                      value={bookingData.serviceCity}
                      onChange={handleChange}
                      className="input-field w-full bg-black/30 border-white/20 text-white placeholder-slate-500"
                      placeholder="e.g., Bangalore"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="serviceState" className="block text-sm font-semibold text-slate-300 mb-2">
                      State <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="serviceState"
                      name="serviceState"
                      type="text"
                      value={bookingData.serviceState}
                      onChange={handleChange}
                      className="input-field w-full bg-black/30 border-white/20 text-white placeholder-slate-500"
                      placeholder="e.g., Karnataka"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* submit card */}
            <form onSubmit={handleSubmit} className="card bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 shadow-2xl backdrop-blur-md p-6">
              {error && (
                <div className="bg-red-500/20 border-2 border-red-400 text-red-200 px-5 py-4 rounded-xl mb-6 font-semibold flex items-center gap-3">
                  <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  ref={confirmBtnRef}
                  className="w-full py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Creating Booking...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Confirm Booking</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border-2 border-white/20 transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
            </section>
          </div>

          {/* Important Information Card */}
          <div className="card mt-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/30 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h3 className="font-bold text-lg text-white">Important Information</h3>
            </div>
            <ul className="text-sm text-slate-300 space-y-2.5">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Your booking request will be sent to the provider for confirmation.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>The provider may suggest alternative times based on availability.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>You will be notified once the provider confirms your booking.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Cancellation policy may apply after confirmation.</span>
            </li>
          </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
