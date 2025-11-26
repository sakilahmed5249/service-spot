import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, DollarSign, User } from 'lucide-react';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatTime } from '../utils/constants';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { providerId, providerName, service } = location.state || {};

  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no service data
  React.useEffect(() => {
    if (!providerId || !service) {
      navigate('/services');
    }
  }, [providerId, service, navigate]);

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.date || !bookingData.time) {
      setError('Please select both date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const slotStart = `${bookingData.date}T${bookingData.time}:00`;
      
      const payload = {
        serviceItemId: service.id,
        customerId: user.id,
        slotStart: slotStart,
        notes: bookingData.notes,
        status: 'PENDING',
      };

      await bookingAPI.create(payload);
      
      alert('Booking request sent successfully!');
      navigate('/my-bookings');
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Book Service</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Summary */}
          <div className="card bg-blue-50 border-2 border-primary">
            <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Provider</p>
                <p className="font-semibold flex items-center">
                  <User size={18} className="mr-2 text-primary" />
                  {providerName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-semibold">{service?.title}</p>
                <p className="text-sm text-gray-700">{service?.description}</p>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center text-gray-700">
                    <DollarSign size={18} className="mr-1 text-primary" />
                    Base Price
                  </span>
                  <span className="font-semibold">{formatCurrency(service?.basePrice)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-700">
                    <Clock size={18} className="mr-1 text-primary" />
                    Duration
                  </span>
                  <span className="font-semibold">{service?.durationMinutes} min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Select Date & Time</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleChange}
                  min={today}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={bookingData.time}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provider will confirm the exact time based on availability
                </p>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={bookingData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="input-field"
                  placeholder="Any specific requirements or instructions..."
                />
              </div>

              <div className="pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? 'Creating Booking...' : 'Confirm Booking'}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full btn-secondary mt-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Terms */}
        <div className="card mt-6 bg-gray-50">
          <h3 className="font-semibold mb-2">Important Information</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Your booking request will be sent to the provider for confirmation</li>
            <li>• The provider may suggest alternative times based on availability</li>
            <li>• You will be notified once the provider confirms your booking</li>
            <li>• Cancellation policy may apply after confirmation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
