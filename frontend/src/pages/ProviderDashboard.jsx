import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI /*, serviceAPI, availabilityAPI */ } from '../services/api';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  formatDate,
  formatTime,
  formatCurrency,
  STATUS_STYLES,
} from '../utils/constants';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

/* Inline spinner used for button loading */
const InlineSpinner = ({ size = 16 }) => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    style={{ width: size, height: size }}
    aria-hidden
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

/* BookingItem: presentational, keyboard + screenreader friendly */
function BookingItem({ booking, updatingId, onUpdate }) {
  const statusClass = STATUS_STYLES[booking.status] || 'bg-gray-200 text-gray-800';

  return (
    <article
      className="card-glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-start"
      aria-labelledby={`booking-${booking.id}-title`}
      role="region"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 id={`booking-${booking.id}-title`} className="text-lg font-semibold text-[var(--text-primary)] truncate">
              {booking.serviceTitle}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Customer: <span className="font-medium text-white">{booking.customerName}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={booking.status} />
            <div className="text-xs text-slate-400">{formatDate(booking.slotStart)}</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <span>{formatDate(booking.slotStart)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <span>{formatTime(booking.slotStart)}</span>
          </div>

          {booking.notes && (
            <div className="sm:col-span-2 bg-white/5 p-3 rounded-md mt-2 text-sm">
              <div className="font-medium text-sm text-white mb-1">Customer Notes</div>
              <div className="text-sm text-slate-300">{booking.notes}</div>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="text-lg font-bold text-primary">{formatCurrency(booking.basePrice)}</div>
          <div className="text-xs text-slate-400">Booked on {formatDate(booking.createdAt)}</div>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full md:w-auto">
        {booking.status === 'PENDING' && (
          <>
            <button
              onClick={() => onUpdate(booking.id, 'CONFIRMED')}
              disabled={updatingId === booking.id}
              className="btn-primary flex items-center justify-center gap-2"
              aria-label={`Accept booking ${booking.id}`}
            >
              {updatingId === booking.id ? <InlineSpinner /> : <CheckCircle size={16} />}
              <span>Accept</span>
            </button>

            <button
              onClick={() => onUpdate(booking.id, 'CANCELLED')}
              disabled={updatingId === booking.id}
              className="btn-danger flex items-center justify-center gap-2"
              aria-label={`Reject booking ${booking.id}`}
            >
              {updatingId === booking.id ? <InlineSpinner /> : <XCircle size={16} />}
              <span>Reject</span>
            </button>
          </>
        )}

        {booking.status === 'CONFIRMED' && (
          <button
            onClick={() => onUpdate(booking.id, 'COMPLETED')}
            disabled={updatingId === booking.id}
            className="btn-primary flex items-center justify-center gap-2"
            aria-label={`Mark booking ${booking.id} complete`}
          >
            {updatingId === booking.id ? <InlineSpinner /> : <CheckCircle size={16} />}
            <span>Mark Complete</span>
          </button>
        )}
      </div>
    </article>
  );
}

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // bookings | services | profile
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // booking id under update
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: swap in real API; kept mocks for now
      // const bookingsResponse = await bookingAPI.getByUser(user.id, 'provider');
      // setBookings(bookingsResponse.data);

      const mockBookings = [
        {
          id: 1,
          serviceTitle: 'Plumbing Repair',
          customerName: 'John Doe',
          customerId: 1,
          slotStart: '2025-11-28T10:00:00',
          status: 'PENDING',
          basePrice: 500,
          notes: 'Kitchen sink leaking',
          createdAt: '2025-11-25T14:30:00',
        },
        {
          id: 2,
          serviceTitle: 'Plumbing Installation',
          customerName: 'Jane Smith',
          customerId: 2,
          slotStart: '2025-11-30T14:00:00',
          status: 'CONFIRMED',
          basePrice: 800,
          notes: 'Install new faucets',
          createdAt: '2025-11-26T09:15:00',
        },
        {
          id: 3,
          serviceTitle: 'Emergency Repair',
          customerName: 'Bob Wilson',
          customerId: 3,
          slotStart: '2025-11-20T09:00:00',
          status: 'COMPLETED',
          basePrice: 1200,
          notes: 'Urgent pipe burst',
          createdAt: '2025-11-18T11:20:00',
        },
      ];

      setBookings(mockBookings);

      setServices([
        {
          id: 1,
          title: 'General Plumbing',
          category: 'Plumbing',
          basePrice: 500,
          durationMinutes: 60,
          description: 'Basic plumbing services',
        },
      ]);

      // compute stats
      const totalBookings = mockBookings.length;
      const pendingBookings = mockBookings.filter(b => b.status === 'PENDING').length;
      const completedBookings = mockBookings.filter(b => b.status === 'COMPLETED').length;
      const totalRevenue = mockBookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + b.basePrice, 0);

      setStats({ totalBookings, pendingBookings, completedBookings, totalRevenue });
    } catch (err) {
      console.error('fetchDashboardData error', err);
    } finally {
      setLoading(false);
    }
  };

  /* optimistic update for booking status */
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    const actionLabel = newStatus === 'CONFIRMED' ? 'accept' : newStatus === 'COMPLETED' ? 'mark complete' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this booking?`)) return;

    setUpdating(bookingId);
    const original = bookings;
    // optimistic local change
    setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b)));

    try {
      // call real API when available:
      if (bookingAPI?.updateStatus) {
        await bookingAPI.updateStatus(bookingId, newStatus);
      } else {
        // simulate latency
        await new Promise(r => setTimeout(r, 700));
      }

      // update stats locally
      const updated = bookings.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b));
      const totalBookings = updated.length;
      const pendingBookings = updated.filter(b => b.status === 'PENDING').length;
      const completedBookings = updated.filter(b => b.status === 'COMPLETED').length;
      const totalRevenue = updated.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + b.basePrice, 0);
      setStats({ totalBookings, pendingBookings, completedBookings, totalRevenue });

      // you may also call fetchDashboardData() here to refresh from server
    } catch (err) {
      console.error('updateBookingStatus error', err);
      alert('Failed to update booking. Please try again.');
      // rollback
      setBookings(original);
    } finally {
      setUpdating(null);
    }
  };

  const bookingsByStatus = useMemo(() => {
    return {
      all: bookings,
      pending: bookings.filter(b => b.status === 'PENDING'),
      confirmed: bookings.filter(b => b.status === 'CONFIRMED'),
      completed: bookings.filter(b => b.status === 'COMPLETED'),
      cancelled: bookings.filter(b => b.status === 'CANCELLED'),
    };
  }, [bookings]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <div className="text-sm text-slate-400">Loading dashboard…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Provider Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Manage bookings, services and profile</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <div className="card p-4 rounded-2xl glass flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Total</p>
              <p className="text-2xl font-bold text-primary">{stats.totalBookings}</p>
            </div>
            <Users size={32} className="text-primary opacity-60" />
          </div>

          <div className="card p-4 rounded-2xl glass flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
            </div>
            <AlertCircle size={32} className="text-yellow-500 opacity-60" />
          </div>

          <div className="card p-4 rounded-2xl glass flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedBookings}</p>
            </div>
            <CheckCircle size={32} className="text-green-500 opacity-60" />
          </div>

          <div className="card p-4 rounded-2xl glass flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Revenue</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <DollarSign size={32} className="text-purple-500 opacity-60" />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 border-b pb-2">
          {['bookings', 'services', 'profile'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-semibold text-sm ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-primary'}`}
              aria-pressed={activeTab === tab}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {activeTab === 'bookings' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Manage Bookings</h2>
            <div className="text-sm text-slate-400">Showing <span className="text-white font-medium">{bookings.length}</span> requests</div>
          </div>

          {bookings.length === 0 ? (
            <div className="card p-8 text-center">
              <Calendar size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-400">You have no bookings yet — share your availability to receive requests.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map(b => (
                <BookingItem key={b.id} booking={b} updatingId={updating} onUpdate={handleUpdateBookingStatus} />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'services' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Services</h2>
            <button className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Add Service
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {services.map(s => (
              <div key={s.id} className="card p-5 rounded-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{s.description}</p>
                    <div className="mt-3 flex gap-3 text-sm">
                      <div className="text-slate-500">Category: <span className="font-medium text-white ml-1">{s.category}</span></div>
                      <div className="text-slate-500">Duration: <span className="font-medium text-white ml-1">{s.durationMinutes}m</span></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <div className="text-lg font-bold text-primary">{formatCurrency(s.basePrice)}</div>
                    <div className="flex gap-2">
                      <button className="btn-secondary px-3 py-2">Edit</button>
                      <button className="btn-danger px-3 py-2">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'profile' && (
        <section className="card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Provider Profile</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400">Business Name</label>
              <div className="mt-1 font-medium text-white">{user?.name}</div>
            </div>

            <div>
              <label className="block text-sm text-slate-400">Email</label>
              <div className="mt-1 font-medium text-white">{user?.email}</div>
            </div>

            <div>
              <label className="block text-sm text-slate-400">Phone</label>
              <div className="mt-1 font-medium text-white">{user?.phone}</div>
            </div>

            <div>
              <label className="block text-sm text-slate-400">City</label>
              <div className="mt-1 font-medium text-white">{user?.city}</div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400">Address</label>
              <div className="mt-1 text-slate-200">
                {user?.doorNo}, {user?.addressLine}, {user?.city}, {user?.state} - {user?.pincode}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button className="btn-primary">Edit Profile</button>
          </div>
        </section>
      )}

      {/* placeholder for future modals (availability, messages) */}
      <Modal isOpen={false} onClose={() => {}} title="Placeholder" size="md">
        <div />
      </Modal>
    </div>
  );
};

export default ProviderDashboard;