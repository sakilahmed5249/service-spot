import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, X, MessageSquare, Star } from 'lucide-react';
import { bookingAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime, formatCurrency, STATUS_STYLES } from '../utils/constants';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // const response = await bookingAPI.getByUser(user.id, 'customer');
      // setBookings(response.data);
      
      // Mock bookings for now
      setBookings([
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
        },
      ]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.updateStatus(bookingId, 'CANCELLED');
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
    setReviewData({ rating: 5, comment: '' });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    try {
      await reviewAPI.create({
        bookingId: selectedBooking.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      
      alert('Review submitted successfully!');
      setShowReviewModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg mb-4">No bookings found</p>
          <Link to="/services" className="btn-primary">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="card">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  {/* Booking Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold">{booking.serviceTitle}</h3>
                      <Link
                        to={`/providers/${booking.providerId}`}
                        className="text-primary hover:underline"
                      >
                        {booking.providerName}
                      </Link>
                    </div>
                    <span className={`badge ${STATUS_STYLES[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-2 text-gray-700">
                    <div className="flex items-center">
                      <Calendar size={18} className="mr-2 text-primary" />
                      <span>{formatDate(booking.slotStart)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock size={18} className="mr-2 text-primary" />
                      <span>{formatTime(booking.slotStart.split('T')[1])}</span>
                    </div>

                    {booking.notes && (
                      <div className="flex items-start">
                        <MessageSquare size={18} className="mr-2 text-primary mt-1" />
                        <span className="text-sm">{booking.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(booking.basePrice)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  {booking.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn-danger flex items-center justify-center"
                    >
                      <X size={18} className="mr-2" />
                      Cancel
                    </button>
                  )}

                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn-secondary flex items-center justify-center"
                    >
                      <X size={18} className="mr-2" />
                      Cancel
                    </button>
                  )}

                  {booking.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleOpenReviewModal(booking)}
                      className="btn-primary flex items-center justify-center"
                    >
                      <Star size={18} className="mr-2" />
                      Write Review
                    </button>
                  )}

                  <Link
                    to={`/providers/${booking.providerId}`}
                    className="btn-secondary text-center"
                  >
                    View Provider
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Write a Review</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">
                {selectedBooking?.serviceTitle} by {selectedBooking?.providerName}
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={`${
                          star <= reviewData.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review *
                </label>
                <textarea
                  id="comment"
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  required
                  rows="4"
                  className="input-field"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 btn-primary">
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
