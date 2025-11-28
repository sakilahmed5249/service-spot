import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, X, MessageSquare, Star } from 'lucide-react';
import { bookingAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime, formatCurrency } from '../utils/constants';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';

/*
  MyBookingsPage
  - Polished version: glass cards, accessible modal, optimistic cancel, review flow.
  - Uses existing utilities: card-glass, btn-primary, btn-secondary, btn-danger, input-field.
*/

const STATUS_ORDER = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState('all'); // all | pending | confirmed | completed | cancelled
  const [query, setQuery] = useState('');

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const [isCancelling, setIsCancelling] = useState({}); // { [id]: true }

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchBookings() {
    setLoading(true);
    try {
      // Replace the mock with a real API call if available:
      // const res = await bookingAPI.getByUser(user.id, 'customer');
      // setBookings(res.data);
      // --- mocked data (keeps current app behavior) ---
      const mock = [
        {
          id: 1,
          serviceTitle: 'Plumbing Repair',
          providerName: 'ABC Services',
          providerId: 1,
          slotStart: '2025-11-28T10:00:00',
          status: 'CONFIRMED',
          basePrice: 500,
          notes: 'Kitchen sink leaking',
          createdAt: '2025-11-25T14:30:00',
          reviewed: false,
        },
        {
          id: 2,
          serviceTitle: 'Electrical Work',
          providerName: 'XYZ Electricians',
          providerId: 2,
          slotStart: '2025-11-30T14:00:00',
          status: 'PENDING',
          basePrice: 800,
          notes: 'Install new light fixtures',
          createdAt: '2025-11-26T09:15:00',
          reviewed: false,
        },
        {
          id: 3,
          serviceTitle: 'Home Cleaning',
          providerName: 'Clean Pro',
          providerId: 3,
          slotStart: '2025-11-20T09:00:00',
          status: 'COMPLETED',
          basePrice: 1200,
          notes: 'Full house cleaning',
          createdAt: '2025-11-18T11:20:00',
          reviewed: false,
        },
      ];
      // sort by upcoming date (most recent first)
      mock.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(mock);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      // Optionally show toast/alert
    } finally {
      setLoading(false);
    }
  }

  // optimistic cancel
  const handleCancelBooking = async (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    const confirmText = `Cancel booking for "${booking.serviceTitle}" on ${formatDate(booking.slotStart)}?`;
    if (!window.confirm(confirmText)) return;

    // optimistic UI update
    setIsCancelling(prev => ({ ...prev, [bookingId]: true }));
    const original = bookings;
    setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)));

    try {
      // call API
      await bookingAPI.updateStatus?.(bookingId, 'CANCELLED');
      // success — keep current state
    } catch (err) {
      console.error('Cancel failed:', err);
      // rollback
      setBookings(original);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setIsCancelling(prev => {
        const copy = { ...prev }; delete copy[bookingId]; return copy;
      });
    }
  };

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReview({ rating: 5, comment: '' });
    setIsReviewOpen(true);
  };

  const submitReview = async (e) => {
    e?.preventDefault?.();
    if (!selectedBooking) return;
    try {
      // real API:
      await reviewAPI.create?.({
        bookingId: selectedBooking.id,
        rating: review.rating,
        comment: review.comment,
      });
      // optimistic update to mark reviewed
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, reviewed: true } : b));
      setIsReviewOpen(false);
      setSelectedBooking(null);
      alert('Review submitted — thank you!');
    } catch (err) {
      console.error('Review submit error:', err);
      alert('Failed to submit review. Try again later.');
    }
  };

  const filtered = bookings.filter(b => {
    if (filter && filter !== 'all' && String(b.status).toLowerCase() !== filter.toLowerCase()) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const matches = (b.serviceTitle || '').toLowerCase().includes(q)
        || (b.providerName || '').toLowerCase().includes(q);
      return matches;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">My Bookings</h1>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="hidden sm:flex gap-2 bg-white/3 rounded-lg p-1">
            {STATUS_ORDER.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition ${
                  filter === s ? 'bg-primary text-white' : 'text-slate-300 hover:bg-white/5'
                }`}
                aria-pressed={filter === s}
                aria-label={`Show ${s} bookings`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="search" className="sr-only">Search bookings</label>
            <input
              id="search"
              type="search"
              placeholder="Search by service or provider"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field w-56"
              aria-label="Search bookings by service or provider"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-glass text-center py-12">
          <Calendar size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-300 text-lg mb-4">No bookings found</p>
          <Link to="/services" className="btn-primary inline-flex items-center gap-2">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => (
            <article key={booking.id} className="card-glass p-5 rounded-2xl shadow-md flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{booking.serviceTitle}</h3>
                    <Link to={`/providers/${booking.providerId}`} className="text-slate-300 hover:underline">
                      {booking.providerName}
                    </Link>
                    <div className="mt-2 flex items-center gap-3 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-primary" />
                        <span>{formatDate(booking.slotStart)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-primary" />
                        <span>{formatTime(booking.slotStart.split('T')[1] || '')}</span>
                      </div>
                      {booking.notes && (
                        <div className="flex items-start gap-2">
                          <MessageSquare size={16} className="text-primary mt-0.5" />
                          <span className="text-sm">{booking.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <StatusBadge status={booking.status} />
                    <div className="text-lg font-bold text-slate-100">{formatCurrency(booking.basePrice)}</div>
                  </div>
                </div>

                {/* meta */}
                <div className="mt-3 text-xs text-slate-400">
                  Booked on {formatDate(booking.createdAt)}
                </div>
              </div>

              {/* actions */}
              <div className="w-full md:w-auto flex flex-col items-stretch gap-2 md:items-end">
                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="btn-danger flex items-center justify-center gap-2"
                    disabled={!!isCancelling[booking.id]}
                    aria-label={`Cancel booking ${booking.id}`}
                  >
                    {isCancelling[booking.id] ? <span className="animate-spin inline-block w-4 h-4 border-b-2 border-white rounded-full" /> : <X size={16} />}
                    Cancel
                  </button>
                )}

                {booking.status === 'COMPLETED' && !booking.reviewed && (
                  <button
                    onClick={() => openReviewModal(booking)}
                    className="btn-primary flex items-center justify-center gap-2"
                    aria-label={`Write review for booking ${booking.id}`}
                  >
                    <Star size={16} /> Write Review
                  </button>
                )}

                <Link
                  to={`/providers/${booking.providerId}`}
                  className="btn-secondary text-center mt-1"
                  aria-label={`View provider ${booking.providerId}`}
                >
                  View Provider
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => { setIsReviewOpen(false); setSelectedBooking(null); }}
        title={selectedBooking ? `Review — ${selectedBooking.serviceTitle}` : 'Write a review'}
        size="md"
      >
        {selectedBooking ? (
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Provider: <strong>{selectedBooking.providerName}</strong></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
              <StarRating
                rating={review.rating}
                showValue={false}
                onRate={(r) => setReview(prev => ({ ...prev, rating: r }))}
              />
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">Your review</label>
              <textarea
                id="comment"
                rows={4}
                required
                value={review.comment}
                onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                className="input-field"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setIsReviewOpen(false); setSelectedBooking(null); }} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">Submit Review</button>
            </div>
          </form>
        ) : (
          <div className="py-8 text-center">
            <LoadingSpinner size="md" fullScreen={false} message="Preparing..." />
          </div>
        )}
      </Modal>
    </div>
  );
}
