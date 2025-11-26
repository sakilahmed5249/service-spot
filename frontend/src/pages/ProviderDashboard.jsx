import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, serviceAPI, availabilityAPI } from '../services/api';
import { Calendar, Clock, DollarSign, Users, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { formatDate, formatTime, formatCurrency, STATUS_STYLES } from '../utils/constants';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, services, availability, profile
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch bookings
      // const bookingsResponse = await bookingAPI.getByUser(user.id, 'provider');
      // setBookings(bookingsResponse.data);

      // Mock bookings
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

      // Calculate stats
      setStats({
        totalBookings: mockBookings.length,
        pendingBookings: mockBookings.filter(b => b.status === 'PENDING').length,
        completedBookings: mockBookings.filter(b => b.status === 'COMPLETED').length,
        totalRevenue: mockBookings
          .filter(b => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + b.basePrice, 0),
      });

      // Mock services
      setServices([
        {
          id: 1,
          title: 'General Plumbing',
          category: 'Plumbing',
          basePrice: 500,
          durationMinutes: 60,
          description: 'Basic plumbing services',
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await bookingAPI.updateStatus(bookingId, newStatus);
      alert(`Booking ${newStatus.toLowerCase()} successfully`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Provider Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-blue-50 border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold text-primary">{stats.totalBookings}</p>
            </div>
            <Calendar size={40} className="text-primary opacity-50" />
          </div>
        </div>

        <div className="card bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
            </div>
            <AlertCircle size={40} className="text-yellow-500 opacity-50" />
          </div>
        </div>

        <div className="card bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedBookings}</p>
            </div>
            <CheckCircle size={40} className="text-green-500 opacity-50" />
          </div>
        </div>

        <div className="card bg-purple-50 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <DollarSign size={40} className="text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {['bookings', 'services', 'profile'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Manage Bookings</h2>
          </div>

          {bookings.length === 0 ? (
            <div className="card text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="card">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold">{booking.serviceTitle}</h3>
                          <p className="text-gray-600">Customer: {booking.customerName}</p>
                        </div>
                        <span className={`badge ${STATUS_STYLES[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>

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
                          <div className="bg-gray-50 p-3 rounded mt-2">
                            <p className="text-sm font-semibold mb-1">Customer Notes:</p>
                            <p className="text-sm">{booking.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(booking.basePrice)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      {booking.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'CONFIRMED')}
                            className="btn-primary flex items-center justify-center"
                          >
                            <CheckCircle size={18} className="mr-2" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                            className="btn-danger flex items-center justify-center"
                          >
                            <XCircle size={18} className="mr-2" />
                            Reject
                          </button>
                        </>
                      )}

                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'COMPLETED')}
                          className="btn-primary flex items-center justify-center"
                        >
                          <CheckCircle size={18} className="mr-2" />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Services</h2>
            <button className="btn-primary flex items-center">
              <Plus size={18} className="mr-2" />
              Add Service
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service.id} className="card">
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-3">{service.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Category:</span>
                    <span className="font-semibold">{service.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Price:</span>
                    <span className="font-semibold text-primary">{formatCurrency(service.basePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Duration:</span>
                    <span className="font-semibold">{service.durationMinutes} min</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 btn-secondary">Edit</button>
                  <button className="flex-1 btn-danger">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Provider Profile</h2>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <p className="text-gray-900">{user?.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <p className="text-gray-900">{user?.phone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <p className="text-gray-900">{user?.city}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <p className="text-gray-900">
                  {user?.doorNo}, {user?.addressLine}, {user?.city}, {user?.state} - {user?.pincode}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button className="btn-primary">Edit Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
