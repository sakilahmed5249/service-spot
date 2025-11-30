import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, serviceAPI, specificAvailabilityAPI } from '../services/api';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
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
      className="bg-white shadow-lg border border-gray-200 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-start"
      aria-labelledby={`booking-${booking.id}-title`}
      role="region"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 id={`booking-${booking.id}-title`} className="text-lg font-semibold text-gray-900 truncate">
              {booking.serviceTitle}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Customer: <span className="font-medium text-gray-900">{booking.customerName}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={booking.status} />
            <div className="text-xs text-gray-500">{formatDate(booking.slotStart)}</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <span>{formatDate(booking.slotStart)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <span>{formatTime(booking.slotStart)}</span>
          </div>

          {booking.notes && (
            <div className="sm:col-span-2 bg-gray-50 p-3 rounded-md mt-2 text-sm border border-gray-200">
              <div className="font-medium text-sm text-gray-900 mb-1">Customer Notes</div>
              <div className="text-sm text-gray-700">{booking.notes}</div>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-lg font-bold text-primary">{formatCurrency(booking.basePrice)}</div>
          <div className="text-xs text-gray-500">Booked on {formatDate(booking.createdAt)}</div>
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings'); // bookings | services | profile
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // booking id under update
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    durationMinutes: '60',
    availabilitySlots: [], // Array of {date, startTime, endTime, maxBookings}
  });
  const [serviceFormErrors, setServiceFormErrors] = useState({});
  const [savingService, setSavingService] = useState(false);
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

  /* Handler for Add Service button */
  const handleAddService = () => {
    setSelectedService(null);
    const today = new Date().toISOString().split('T')[0];
    setServiceForm({
      title: '',
      description: '',
      price: '',
      category: '',
      durationMinutes: '60',
      availabilitySlots: [
        // Start with one empty slot
        { date: today, startTime: '09:00', endTime: '17:00', maxBookings: '1' }
      ],
    });
    setServiceFormErrors({});
    setShowServiceModal(true);
  };

  /* Handler for Edit Profile button */
  const handleEditProfile = () => {
    // Navigate to the profile page where editing is already implemented
    navigate('/profile');
  };

  /* Handler for Edit Service button */
  const handleEditService = async (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(service);

    // Load existing availability slots for this service
    try {
      const availabilityResponse = await specificAvailabilityAPI.getByService(serviceId, false); // Get all, not just future
      const existingSlots = availabilityResponse.data?.data || [];

      // Convert backend format to form format
      const formattedSlots = existingSlots.map(slot => ({
        id: slot.id, // Keep track of existing slot IDs
        date: slot.availableDate,
        startTime: slot.startTime?.substring(0, 5) || '09:00', // Remove seconds
        endTime: slot.endTime?.substring(0, 5) || '17:00',
        maxBookings: slot.maxBookings || '1'
      }));

      console.log('Loaded existing availability slots:', formattedSlots);

      setServiceForm({
        title: service.title || '',
        description: service.description || '',
        price: service.price || service.basePrice || '',
        category: service.category?.name || service.categoryName || '',
        durationMinutes: service.durationMinutes || '60',
        availabilitySlots: formattedSlots.length > 0 ? formattedSlots : [
          // Add one empty slot if no existing slots
          { date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '17:00', maxBookings: '1' }
        ],
      });
    } catch (error) {
      console.error('Error loading availability slots:', error);
      // Fallback if loading fails
      setServiceForm({
        title: service.title || '',
        description: service.description || '',
        price: service.price || service.basePrice || '',
        category: service.category?.name || service.categoryName || '',
        durationMinutes: service.durationMinutes || '60',
        availabilitySlots: [
          { date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '17:00', maxBookings: '1' }
        ],
      });
    }

    setServiceFormErrors({});
    setShowServiceModal(true);
  };

  /* Availability Slot Handlers */
  const handleAddAvailabilitySlot = () => {
    const today = new Date().toISOString().split('T')[0];
    setServiceForm(prev => ({
      ...prev,
      availabilitySlots: [
        ...prev.availabilitySlots,
        { date: today, startTime: '09:00', endTime: '17:00', maxBookings: '1', isNew: true }
      ]
    }));
  };

  const handleRemoveAvailabilitySlot = async (index) => {
    const slot = serviceForm.availabilitySlots[index];

    // If slot has an ID, it's an existing slot - delete from backend
    if (slot.id) {
      if (!window.confirm('This will permanently delete this availability slot. Are you sure?')) {
        return;
      }

      try {
        await specificAvailabilityAPI.delete(slot.id);
        console.log('Deleted availability slot:', slot.id);
        alert('Availability slot deleted successfully!');
      } catch (error) {
        console.error('Error deleting availability slot:', error);
        alert('Failed to delete availability slot. Please try again.');
        return; // Don't remove from UI if backend deletion failed
      }
    }

    // Remove from form state
    setServiceForm(prev => ({
      ...prev,
      availabilitySlots: prev.availabilitySlots.filter((_, i) => i !== index)
    }));
  };

  const handleAvailabilitySlotChange = (index, field, value) => {
    setServiceForm(prev => ({
      ...prev,
      availabilitySlots: prev.availabilitySlots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  /* Handle service form input changes */
  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({ ...prev, [name]: value }));
    if (serviceFormErrors[name]) {
      setServiceFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /* Validate service form */
  const validateServiceForm = () => {
    const errors = {};
    if (!serviceForm.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!serviceForm.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!serviceForm.price || parseFloat(serviceForm.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (!serviceForm.category.trim()) {
      errors.category = 'Category is required';
    }

    if (!serviceForm.durationMinutes || parseInt(serviceForm.durationMinutes) <= 0) {
      errors.durationMinutes = 'Duration must be greater than 0';
    }

    setServiceFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* Submit service form */
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!validateServiceForm()) return;

    setSavingService(true);
    try {
      // Backend accepts flexible category - can be any text
      const serviceData = {
        categoryName: serviceForm.category.trim(), // Use category name instead of ID
        title: serviceForm.title.trim(),
        description: serviceForm.description.trim(),
        price: parseFloat(serviceForm.price),
        priceUnit: 'per hour',
        durationMinutes: parseInt(serviceForm.durationMinutes),
        serviceLocation: user.city || 'On-site',
        serviceRadiusKm: 10, // Default 10km service radius
        city: user.city || 'Not specified',
        state: user.state || 'Not specified',
        pincode: user.pincode || 400001,
        imageUrl: null,
        additionalImages: null,
      };

      console.log('Submitting service data:', serviceData);

      let createdServiceId = selectedService?.id;

      if (selectedService) {
        // Update existing service
        await serviceAPI.update(selectedService.id, serviceData, user.id);
        console.log('Service updated successfully');
      } else {
        // Create new service - pass providerId as second parameter
        const response = await serviceAPI.create(serviceData, user.id);
        createdServiceId = response.data?.data?.id || response.data?.id;
        console.log('Service created successfully with ID:', createdServiceId);
      }

      // Create/Update availability slots for both new and edited services
      if (serviceForm.availabilitySlots.length > 0 && createdServiceId) {
        console.log('Processing availability slots for service:', createdServiceId);

        let successCount = 0;
        let failCount = 0;
        let updateCount = 0;

        for (const slot of serviceForm.availabilitySlots) {
          // Validate slot has required fields
          if (!slot.date || !slot.startTime || !slot.endTime) {
            console.warn('Skipping invalid slot:', slot);
            failCount++;
            continue;
          }

          try {
            const availabilityData = {
              providerId: user.id,
              serviceListingId: createdServiceId,
              availableDate: slot.date,
              startTime: slot.startTime + ':00',
              endTime: slot.endTime + ':00',
              maxBookings: slot.maxBookings ? parseInt(slot.maxBookings) : null,
            };

            if (slot.id) {
              // Update existing slot
              await specificAvailabilityAPI.update(slot.id, availabilityData);
              console.log('Updated availability slot:', slot.id, availabilityData);
              updateCount++;
            } else {
              // Create new slot
              await specificAvailabilityAPI.create(availabilityData);
              console.log('Created availability slot:', availabilityData);
              successCount++;
            }
          } catch (slotError) {
            console.error('Error processing availability slot:', slotError);
            console.error('Slot data:', slot);
            console.error('Error response:', slotError.response?.data);
            failCount++;
            // Continue with other slots even if one fails
          }
        }

        // Show detailed result message
        const totalSuccess = successCount + updateCount;
        if (totalSuccess > 0 && failCount === 0) {
          const msg = [];
          if (successCount > 0) msg.push(`✅ ${successCount} new slot(s) added`);
          if (updateCount > 0) msg.push(`✅ ${updateCount} slot(s) updated`);
          alert(`${selectedService ? 'Service updated' : 'Service created'} successfully!\n${msg.join('\n')}`);
        } else if (totalSuccess > 0 && failCount > 0) {
          const msg = [];
          if (successCount > 0) msg.push(`✅ ${successCount} new slot(s) added`);
          if (updateCount > 0) msg.push(`✅ ${updateCount} slot(s) updated`);
          msg.push(`⚠️ ${failCount} slot(s) failed (check console)`);
          alert(`${selectedService ? 'Service updated' : 'Service created'} successfully!\n${msg.join('\n')}`);
        } else if (failCount > 0) {
          alert(`${selectedService ? 'Service updated' : 'Service created'} successfully!\n⚠️ All ${failCount} slot(s) failed (check console for details)`);
        }
      } else {
        // No slots provided
        alert(selectedService ? 'Service updated successfully!' : 'Service created successfully!\n⚠️ No availability slots added. Add slots to allow bookings.');
      }

      setShowServiceModal(false);
      fetchDashboardData(); // Refresh the services list
    } catch (error) {
      console.error('Error saving service:', error);
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to save service';

      // Show detailed validation errors if available
      if (error?.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
        alert('Validation errors:\n' + JSON.stringify(error.response.data.errors, null, 2));
      } else {
        alert(errorMsg);
      }
    } finally {
      setSavingService(false);
    }
  };

  /* Handler for Delete Service button */
  const handleDeleteService = async (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    const serviceName = service?.title || 'this service';

    console.log('🗑️ Attempting to delete service:', { serviceId, serviceName, currentServicesCount: services.length });

    if (!window.confirm(`Are you sure you want to permanently delete "${serviceName}"?\n\nThis action cannot be undone and will:\n• Remove the service from your listings\n• Cancel any pending bookings for this service\n• Remove the service from customer search results`)) {
      console.log('❌ Deletion cancelled by user (first confirmation)');
      return;
    }

    // Double confirmation for critical action
    if (!window.confirm(`FINAL CONFIRMATION: Delete "${serviceName}" permanently?`)) {
      console.log('❌ Deletion cancelled by user (second confirmation)');
      return;
    }

    // Store original services for rollback
    const originalServices = [...services];

    try {
      // Optimistically remove from UI immediately
      console.log('⚡ Optimistically removing service from UI...');
      setServices(prevServices => {
        const updated = prevServices.filter(s => s.id !== serviceId);
        console.log('📊 Services after optimistic removal:', { before: prevServices.length, after: updated.length });
        return updated;
      });

      // Call API to delete service
      console.log('🌐 Calling API to delete service...');
      const response = await serviceAPI.delete(serviceId, user.id);
      console.log('✅ API delete successful:', response);

      // Show success message
      alert(`Service "${serviceName}" deleted successfully!`);

      // Fetch fresh data to ensure sync with backend
      console.log('🔄 Fetching fresh dashboard data...');
      await fetchDashboardData();
      console.log('✅ Dashboard data refreshed. New services count:', services.length);
    } catch (error) {
      console.error('❌ Error deleting service:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Restore original services on error
      console.log('↩️ Restoring original services...');
      setServices(originalServices);

      const errorMessage = error.response?.data?.message || error.message || 'Please try again.';
      alert(`Failed to delete service: ${errorMessage}`);
    }
  };


  const fetchDashboardData = async () => {
    console.log('🔄 fetchDashboardData started for user:', user.id);
    setLoading(true);
    try {
      // Fetch real bookings from API
      let fetchedBookings = [];
      try {
        if (bookingAPI?.getByUser) {
          const bookingsResponse = await bookingAPI.getByUser(user.id, 'provider');
          const rawBookings = bookingsResponse.data?.data || bookingsResponse.data || [];
          console.log('📦 Fetched raw bookings:', rawBookings.length, rawBookings);

          // Map backend fields to frontend expected fields
          fetchedBookings = rawBookings.map(booking => ({
            id: booking.id,
            bookingReference: booking.bookingReference,
            // Combine date and time for slotStart field
            slotStart: `${booking.bookingDate}T${booking.bookingTime || '00:00:00'}`,
            status: booking.status,
            // Map price field
            basePrice: booking.totalAmount || booking.basePrice || 0,
            // Extract service and customer names from nested objects
            serviceTitle: booking.serviceListing?.title || booking.serviceTitle || 'Unknown Service',
            customerName: booking.customer?.name || booking.customerName || 'Unknown Customer',
            customerId: booking.customer?.id || booking.customerId,
            serviceListingId: booking.serviceListing?.id || booking.serviceListingId,
            // Notes
            notes: booking.customerNotes || booking.notes || '',
            // Timestamps
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            // Location
            serviceCity: booking.serviceCity,
            fullServiceAddress: booking.fullServiceAddress,
            // Additional fields
            durationMinutes: booking.durationMinutes,
            paymentStatus: booking.paymentStatus,
          }));

          console.log('✅ Mapped bookings:', fetchedBookings.length, fetchedBookings);
        }
      } catch (error) {
        console.log('No bookings found or API not available:', error.message);
        fetchedBookings = [];
      }

      setBookings(fetchedBookings);

      // Fetch real services from API
      let fetchedServices = [];
      try {
        console.log('🔍 Fetching services for provider:', user.id);
        const servicesResponse = await serviceAPI.getByProvider(user.id);
        fetchedServices = servicesResponse.data?.data || servicesResponse.data || [];
        console.log('✅ Fetched services:', fetchedServices.length, fetchedServices);
      } catch (error) {
        console.error('❌ Error fetching services:', error);
        console.log('No services found or API not available:', error.message);
        fetchedServices = [];
      }

      console.log('📝 Setting services state with:', fetchedServices.length, 'services');
      setServices(fetchedServices);


      // compute stats from real data
      const totalBookings = fetchedBookings.length;
      const pendingBookings = fetchedBookings.filter(b => b.status === 'PENDING').length;
      const completedBookings = fetchedBookings.filter(b => b.status === 'COMPLETED').length;
      const totalRevenue = fetchedBookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((s, b) => s + (b.basePrice || b.price || 0), 0);

      setStats({ totalBookings, pendingBookings, completedBookings, totalRevenue });
      console.log('✅ Dashboard data fetch complete');
    } catch (err) {
      console.error('❌ fetchDashboardData error', err);
      // Set empty data on error
      setBookings([]);
      setServices([]);
      setStats({ totalBookings: 0, pendingBookings: 0, completedBookings: 0, totalRevenue: 0 });
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
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Manage bookings, services and profile</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <div className="card p-4 rounded-2xl glass flex items-center justify-between gap-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <div>
              <p className="text-sm text-blue-700">Total</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalBookings}</p>
            </div>
            <Users size={32} className="text-blue-600 opacity-60" />
          </div>

          <div className="card p-4 rounded-2xl glass flex items-center justify-between gap-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
            <div>
              <p className="text-sm text-yellow-700">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pendingBookings}</p>
            </div>
            <AlertCircle size={32} className="text-yellow-600 opacity-60" />
          </div>

          <div className="card p-4 rounded-2xl glass flex items-center justify-between gap-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <div>
              <p className="text-sm text-green-700">Completed</p>
              <p className="text-2xl font-bold text-green-900">{stats.completedBookings}</p>
            </div>
            <CheckCircle size={32} className="text-green-600 opacity-60" />
          </div>

          <div className="card p-4 rounded-2xl glass flex items-center justify-between gap-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <div>
              <p className="text-sm text-purple-700">Revenue</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <DollarSign size={32} className="text-purple-600 opacity-60" />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 border-b border-gray-300 pb-2">
          {['bookings', 'services', 'profile'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-semibold text-sm ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'}`}
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
            <h2 className="text-xl font-semibold text-gray-900">Manage Bookings</h2>
            <div className="text-sm text-gray-600">Showing <span className="text-gray-900 font-medium">{bookings.length}</span> requests</div>
          </div>

          {bookings.length === 0 ? (
            <div className="card p-8 text-center bg-white border border-gray-200 rounded-2xl">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">You have no bookings yet — share your availability to receive requests.</p>
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
            <h2 className="text-xl font-semibold text-gray-900">My Services</h2>
            <button
              onClick={handleAddService}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={16} /> Add Service
            </button>
          </div>

          {services.length === 0 ? (
            <div className="bg-white shadow-lg border border-gray-200 p-12 rounded-2xl text-center">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Plus size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start by adding your first service. Let customers know what you offer!
              </p>
              <button
                onClick={handleAddService}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={16} /> Add Your First Service
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">{/* ...existing services grid... */}
            {services.map(s => (
              <div key={s.id} className="bg-white shadow-lg border border-gray-200 p-5 rounded-2xl hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">{s.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{s.description}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                      <div className="text-gray-600">
                        Category: <span className="font-medium text-gray-900 ml-1">{s.category?.name || s.categoryName || 'Uncategorized'}</span>
                      </div>
                      <div className="text-gray-600">
                        Duration: <span className="font-medium text-gray-900 ml-1">{s.durationMinutes}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 items-end">
                    <div className="text-xl font-bold text-primary whitespace-nowrap">
                      {formatCurrency(s.price || s.basePrice || 0)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditService(s.id)}
                        className="btn-secondary px-3 py-2 flex items-center gap-1.5 text-sm"
                        title="Edit service"
                      >
                        <Edit size={16} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteService(s.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors text-sm"
                        title="Delete service permanently"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </section>
      )}


      {activeTab === 'profile' && (
        <section className="card p-6 rounded-2xl bg-white border border-gray-200 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Provider Profile</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Business Name</label>
              <div className="mt-1 font-medium text-gray-900">{user?.name}</div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Email</label>
              <div className="mt-1 font-medium text-gray-900">{user?.email}</div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Phone</label>
              <div className="mt-1 font-medium text-gray-900">{user?.phone}</div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">City</label>
              <div className="mt-1 font-medium text-gray-900">{user?.city}</div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600">Address</label>
              <div className="mt-1 text-gray-900">
                {user?.doorNo}, {user?.addressLine}, {user?.city}, {user?.state} - {user?.pincode}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleEditProfile}
              className="btn-primary"
            >
              Edit Profile
            </button>
          </div>
        </section>
      )}

      {/* Service Creation/Edit Modal */}
      <Modal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        title={selectedService ? 'Edit Service' : 'Add New Service'}
        size="lg"
      >
        <form onSubmit={handleServiceSubmit} className="space-y-4">
          {/* Service Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
              Service Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={serviceForm.title}
              onChange={handleServiceFormChange}
              className={`input-field ${serviceFormErrors.title ? 'border-red-500' : ''}`}
              placeholder="e.g., Kitchen Sink Repair"
            />
            {serviceFormErrors.title && (
              <p className="text-red-400 text-sm mt-1">{serviceFormErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={serviceForm.description}
              onChange={handleServiceFormChange}
              rows="4"
              className={`input-field ${serviceFormErrors.description ? 'border-red-500' : ''}`}
              placeholder="Describe your service..."
            />
            {serviceFormErrors.description && (
              <p className="text-red-400 text-sm mt-1">{serviceFormErrors.description}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                Category *
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={serviceForm.category}
                onChange={handleServiceFormChange}
                className={`input-field ${serviceFormErrors.category ? 'border-red-500' : ''}`}
                placeholder="e.g., Plumbing"
              />
              {serviceFormErrors.category && (
                <p className="text-red-400 text-sm mt-1">{serviceFormErrors.category}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-300 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={serviceForm.price}
                onChange={handleServiceFormChange}
                className={`input-field ${serviceFormErrors.price ? 'border-red-500' : ''}`}
                placeholder="500"
                min="0"
                step="0.01"
              />
              {serviceFormErrors.price && (
                <p className="text-red-400 text-sm mt-1">{serviceFormErrors.price}</p>
              )}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="durationMinutes" className="block text-sm font-medium text-slate-300 mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              id="durationMinutes"
              name="durationMinutes"
              value={serviceForm.durationMinutes}
              onChange={handleServiceFormChange}
              className={`input-field ${serviceFormErrors.durationMinutes ? 'border-red-500' : ''}`}
              placeholder="60"
              min="1"
            />
            {serviceFormErrors.durationMinutes && (
              <p className="text-red-400 text-sm mt-1">{serviceFormErrors.durationMinutes}</p>
            )}
          </div>

          {/* Availability Slots Section */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Availability Schedule</h3>
                <p className="text-xs text-slate-400 mt-1">Set specific dates and times when you're available for this service</p>
              </div>
              <button
                type="button"
                onClick={handleAddAvailabilitySlot}
                className="btn-primary text-sm py-2 px-3 flex items-center gap-1"
              >
                <Plus size={14} /> Add Slot
              </button>
            </div>

            {serviceForm.availabilitySlots.length === 0 ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                <p className="text-sm text-yellow-300">
                  ⚠️ No availability slots added. Customers won't see any available dates for booking!
                </p>
                <button
                  type="button"
                  onClick={handleAddAvailabilitySlot}
                  className="mt-2 text-sm text-yellow-300 underline hover:text-yellow-200"
                >
                  Add your first availability slot
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {serviceForm.availabilitySlots.map((slot, index) => (
                  <div
                    key={slot.id || index}
                    className={`${slot.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'} border rounded-lg p-3`}
                  >
                    {/* Existing slot indicator */}
                    {slot.id && (
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                          📅 Existing Slot (ID: {slot.id})
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                        {/* Date */}
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Date *</label>
                          <input
                            type="date"
                            value={slot.date}
                            onChange={(e) => handleAvailabilitySlotChange(index, 'date', e.target.value)}
                            className="input-field text-sm py-1.5"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>

                        {/* Start Time */}
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Start Time *</label>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => handleAvailabilitySlotChange(index, 'startTime', e.target.value)}
                            className="input-field text-sm py-1.5"
                          />
                        </div>

                        {/* End Time */}
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">End Time *</label>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => handleAvailabilitySlotChange(index, 'endTime', e.target.value)}
                            className="input-field text-sm py-1.5"
                          />
                        </div>

                        {/* Max Bookings */}
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Max Bookings</label>
                          <input
                            type="number"
                            value={slot.maxBookings}
                            onChange={(e) => handleAvailabilitySlotChange(index, 'maxBookings', e.target.value)}
                            className="input-field text-sm py-1.5"
                            min="1"
                            placeholder="1"
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveAvailabilitySlot(index)}
                        className="mt-5 bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded transition-colors"
                        title={slot.id ? "Delete this slot from database" : "Remove this slot"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowServiceModal(false)}
              className="btn-secondary flex-1"
              disabled={savingService}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={savingService}
            >
              {savingService ? (
                <>
                  <InlineSpinner />
                  {selectedService ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                selectedService ? 'Update Service' : 'Create Service'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProviderDashboard;
