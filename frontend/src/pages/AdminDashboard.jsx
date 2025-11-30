import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Clock,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/constants';


/**
 * Admin Dashboard Component
 * Displays system statistics, pending verifications, and user management
 */
export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [error, setError] = useState(null);
  const [showAllUsersModal, setShowAllUsersModal] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const statsRes = await adminAPI.getStatistics();
      setStatistics(statsRes.data.data);

      // Fetch pending verifications
      const pendingRes = await adminAPI.getPendingVerifications();
      setPendingVerifications(pendingRes.data.data || []);

      // Fetch recent users
      const recentUsersRes = await adminAPI.getRecentUsers(7, 5);
      setRecentUsers(recentUsersRes.data.data || []);

      // Fetch recent bookings
      const bookingsRes = await adminAPI.getAllBookings();
      const allBookings = bookingsRes.data.data || [];
      setRecentBookings(allBookings.slice(0, 10)); // Get latest 10

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true);
      console.log('📡 Fetching all users...');
      const response = await adminAPI.getAllUsers();
      console.log('📥 Received users response:', response);
      console.log('📊 Number of users received:', response.data.data?.length || 0);
      console.log('👥 Users:', response.data.data);
      setAllUsers(response.data.data || []);
    } catch (err) {
      console.error('❌ Error fetching all users:', err);
      alert('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleViewAllUsers = () => {
    setShowAllUsersModal(true);
    fetchAllUsers();
  };

  const handleVerifyUser = async (userId, userName, role) => {
    try {
      await adminAPI.verifyProvider(userId);
      alert(`${role || 'User'} "${userName}" verified successfully!`);
      fetchDashboardData(); // Refresh dashboard
      if (showAllUsersModal) {
        fetchAllUsers(); // Refresh modal if open
      }
    } catch (err) {
      console.error('Error verifying user:', err);
      alert('Failed to verify user. Please try again.');
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;

    try {
      await adminAPI.suspendUser(userId);
      alert('User suspended successfully!');
      fetchDashboardData();
      if (showAllUsersModal) {
        fetchAllUsers(); // Refresh modal if open
      }
    } catch (err) {
      console.error('Error suspending user:', err);
      alert('Failed to suspend user. Please try again.');
    }
  };

  const handleReactivateUser = async (userId) => {
    try {
      await adminAPI.reactivateUser(userId);
      alert('User reactivated successfully!');
      fetchDashboardData();
      if (showAllUsersModal) {
        fetchAllUsers(); // Refresh modal if open
      }
    } catch (err) {
      console.error('Error reactivating user:', err);
      alert('Failed to reactivate user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE ${userName}? This action cannot be undone and will remove all their data including bookings, reviews, and services.`)) {
      return;
    }

    // Double confirmation for critical action
    if (!confirm(`FINAL CONFIRMATION: Delete ${userName} permanently?`)) {
      return;
    }

    console.log('🗑️ Deleting user:', { userId, userName });
    console.log('📊 Current users count before delete:', allUsers.length);

    try {
      const response = await adminAPI.deleteUser(userId);
      console.log('✅ Delete response:', response);

      alert(`User ${userName} deleted successfully!`);

      console.log('🔄 Refreshing dashboard data...');
      await fetchDashboardData(); // Refresh dashboard summary

      if (showAllUsersModal) {
        console.log('🔄 Refreshing modal user list...');
        await fetchAllUsers(); // Refresh modal user list
        console.log('📊 Users count after refresh:', allUsers.length);
      }
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      console.error('Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data
      });
      alert(`Failed to delete user. ${err.response?.data?.message || 'Please try again.'}`);
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
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, <span className="text-primary font-semibold">{user?.name}</span>
              </p>
            </div>
            <button
              onClick={handleViewAllUsers}
              className="btn-primary flex items-center gap-2"
            >
              <Users size={18} />
              Manage All Users
            </button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Users */}
          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <Users size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {statistics?.totalUsers || 0}
            </h3>
            <p className="text-sm text-gray-600">Total Users</p>
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
              <span>Customers: {statistics?.totalCustomers || 0}</span>
              <span className="mx-2">•</span>
              <span>Providers: {statistics?.totalProviders || 0}</span>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <Calendar size={24} />
              </div>
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {statistics?.totalBookings || 0}
            </h3>
            <p className="text-sm text-gray-600">Total Bookings</p>
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
              <span>Active: {statistics?.activeBookings || 0}</span>
              <span className="mx-2">•</span>
              <span>Completed: {statistics?.completedBookings || 0}</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <DollarSign size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(statistics?.totalRevenue || 0)}
            </h3>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
              <span>This Month: {formatCurrency(statistics?.monthlyRevenue || 0)}</span>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <ShieldCheck size={24} />
              </div>
              <AlertCircle className="text-orange-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {statistics?.pendingVerifications || 0}
            </h3>
            <p className="text-sm text-gray-600">Pending Verifications</p>
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
              <span>Verified: {statistics?.verifiedProviders || 0}</span>
            </div>
          </div>
        </div>

        {/* Pending Provider Verifications */}
        {pendingVerifications.length > 0 && (
          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck size={20} className="text-primary" />
              Pending Provider Verifications
            </h2>
            <div className="space-y-3">
              {pendingVerifications.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                    <p className="text-sm text-gray-600">{provider.serviceType}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {provider.city}, {provider.state} • {provider.phone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerifyUser(provider.id, provider.name, 'Provider')}
                      className="btn-primary flex items-center gap-2 px-4 py-2"
                    >
                      <CheckCircle size={16} />
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Recent Users (Last 7 Days)
            </h2>
            <div className="space-y-3">
              {recentUsers.length > 0 ? (
                recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                      <p className="text-xs text-gray-600">{u.email}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          u.role === 'PROVIDER' ? 'bg-green-100 text-green-700' :
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role}
                        </span>
                        {!u.active && (
                          <p className="text-xs text-red-600 mt-1">Suspended</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 transition-colors"
                        title="Delete user"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">No recent users</p>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              Recent Bookings
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-gray-50 border border-gray-100 p-3 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{booking.serviceTitle}</p>
                        <p className="text-xs text-gray-600">
                          Customer: {booking.customerName}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(booking.bookingDate)}</span>
                      <span>{formatCurrency(booking.totalAmount)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">No bookings yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Today's Activity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900">{statistics?.todayBookings || 0}</p>
              <p className="text-sm text-gray-600">New Bookings</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900">{statistics?.todayRegistrations || 0}</p>
              <p className="text-sm text-gray-600">New Registrations</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics?.todayRevenue || 0)}</p>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      {showAllUsersModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users size={24} className="text-primary" />
                User Management
              </h2>
              <button
                onClick={() => setShowAllUsersModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XCircle size={24} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingUsers ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : allUsers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {allUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white">{user.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            user.role === 'PROVIDER' ? 'bg-green-500/20 text-green-400' :
                            user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                          {!user.active && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                              Suspended
                            </span>
                          )}
                          {user.verified && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">{user.email}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {user.phone} • {user.city}, {user.state}
                        </p>
                        {user.role === 'PROVIDER' && user.serviceType && (
                          <p className="text-xs text-slate-400 mt-1">
                            Service: {user.serviceType} • ₹{user.approxPrice}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {/* Show verify button for any unverified user (customer or provider), but not admin */}
                        {!user.verified && user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleVerifyUser(user.id, user.name, user.role)}
                            className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                          >
                            <CheckCircle size={14} />
                            Verify
                          </button>
                        )}

                        {user.active ? (
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            className="px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm transition-colors"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivateUser(user.id)}
                            className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
                          >
                            Reactivate
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                        >
                          <XCircle size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto text-slate-600 mb-4" size={48} />
                  <p className="text-slate-400">No users found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
