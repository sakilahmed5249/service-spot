import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { customerAPI } from '../services/api';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Search,
  Star,
  MapPin,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate, formatTime } from '../utils/constants';


/**
 * Customer Dashboard Component
 * Shows personalized statistics, upcoming bookings, and quick actions
 */
export default function CustomerDashboard() {
  const { user, isCustomer } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isCustomer) {
      navigate('/');
      return;
    }
    if (user?.id) {
      fetchDashboardData();
    }
  }, [isCustomer, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch customer statistics
      const statsRes = await customerAPI.getStatistics(user.id);
      setStatistics(statsRes.data.data);

      // Fetch recent bookings
      const recentRes = await customerAPI.getRecentBookings(user.id, 5);
      setRecentBookings(recentRes.data.data || []);

      // Fetch upcoming bookings
      const upcomingRes = await customerAPI.getUpcomingBookings(user.id);
      setUpcomingBookings(upcomingRes.data.data || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white shadow-lg border border-gray-200 p-8 rounded-2xl text-center max-w-md">
          <XCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner - Premium white card */}
        <div className="bg-white p-8 rounded-3xl mb-8 shadow-lg border border-gray-200">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mb-4">
            Member since {statistics?.memberSince || 'recently'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/services" className="btn-primary flex items-center gap-2">
              <Search size={18} />
              Browse Services
            </Link>
            <Link to="/my-bookings" className="btn-secondary flex items-center gap-2">
              <Calendar size={18} />
              View All Bookings
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Bookings */}
          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="feature-icon">
                <Calendar size={24} />
              </div>
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {statistics?.totalBookings || 0}
            </h3>
            <p className="text-sm text-gray-600">Total Bookings</p>
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              <span>Completed: {statistics?.completedBookings || 0}</span>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="feature-icon from-purple-500 to-pink-500">
                <Clock size={24} />
              </div>
              <CheckCircle className="text-green-400" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {statistics?.activeBookings || 0}
            </h3>
            <p className="text-sm text-gray-600">Active Bookings</p>
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              <span>Upcoming: {statistics?.upcomingBookings || 0}</span>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="feature-icon from-green-500 to-teal-500">
                <DollarSign size={24} />
              </div>
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(statistics?.totalSpent || 0)}
            </h3>
            <p className="text-sm text-gray-600">Total Spent</p>
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              <span>This Month: {formatCurrency(statistics?.thisMonthSpent || 0)}</span>
            </div>
          </div>

          {/* Average Booking */}
          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="feature-icon from-orange-500 to-red-500">
                <Star size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(statistics?.averageBookingValue || 0)}
            </h3>
            <p className="text-sm text-gray-600">Avg. Booking Value</p>
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              <span>Services Used: {statistics?.uniqueServicesBooked || 0}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Bookings - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                Upcoming Appointments
              </h2>
              <Link to="/my-bookings" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>

            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {booking.serviceTitle}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Provider: {booking.providerName}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={16} className="text-primary" />
                        <span>{formatDate(booking.bookingDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={16} className="text-primary" />
                        <span>{formatTime(booking.bookingTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={16} className="text-primary" />
                        <span>{booking.serviceCity}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign size={16} className="text-primary" />
                        <span className="font-semibold">{formatCurrency(booking.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                      <Link
                        to={`/services/${booking.serviceListingId}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        View Details <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-4">No upcoming appointments</p>
                <Link to="/services" className="btn-primary inline-flex items-center gap-2">
                  <Search size={18} />
                  Book a Service
                </Link>
              </div>
            )}
          </div>

          {/* Quick Stats & Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  to="/services"
                  className="w-full btn-primary flex items-center justify-between"
                >
                  <span>Browse Services</span>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/my-bookings"
                  className="w-full btn-secondary flex items-center justify-between"
                >
                  <span>My Bookings</span>
                  <Calendar size={18} />
                </Link>
                <Link
                  to="/profile"
                  className="w-full btn-secondary flex items-center justify-between"
                >
                  <span>Edit Profile</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Spending Summary */}
            <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Spending Summary</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(statistics?.thisMonthSpent || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Month</span>
                  <span className="font-semibold text-gray-700">
                    {formatCurrency(statistics?.lastMonthSpent || 0)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total All Time</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(statistics?.totalSpent || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings History */}
        <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              Recent Bookings
            </h2>
            <Link to="/my-bookings" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{booking.serviceTitle}</h3>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{booking.providerName}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(booking.bookingDate)}</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No recent bookings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

