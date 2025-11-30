import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { providerAPI } from '../services/api';
import { User, Mail, Phone, MapPin, Edit, Save, X, Check, Briefcase, DollarSign, Award, Trash2 } from 'lucide-react';
import { isValidPhone, isValidPincode } from '../utils/constants';

/* Minimal toast */
const Toast = ({ message, tone = 'success', onClose }) => (
  <div
    role="status"
    aria-live="polite"
    className={`fixed right-6 bottom-6 z-50 rounded-lg px-4 py-3 shadow-lg transform transition ${
      tone === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      {tone === 'success' ? <Check size={16} /> : <X size={16} />}
      <div className="text-sm">{message}</div>
      <button className="ml-2 opacity-80" onClick={onClose} aria-label="Dismiss">✕</button>
    </div>
  </div>
);

export default function ProviderProfile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // form state
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    doorNo: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    serviceType: '',
    approxPrice: '',
    description: '',
    yearsExperience: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // initialize form from user when user changes
  useEffect(() => {
    setForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      doorNo: user?.doorNo ?? '',
      addressLine: user?.addressLine ?? '',
      city: user?.city ?? '',
      state: user?.state ?? '',
      pincode: user?.pincode ?? '',
      serviceType: user?.serviceType ?? '',
      approxPrice: user?.approxPrice ?? '',
      description: user?.description ?? '',
      yearsExperience: user?.yearsExperience ?? '',
    });
    setErrors({});
    setIsEditing(false);
  }, [user]);

  // track "dirty" state (has changes)
  const isDirty = useMemo(() => {
    if (!user) return false;
    return (
      form.name !== (user.name ?? '') ||
      form.phone !== (user.phone ?? '') ||
      form.doorNo !== (user.doorNo ?? '') ||
      form.addressLine !== (user.addressLine ?? '') ||
      form.city !== (user.city ?? '') ||
      form.state !== (user.state ?? '') ||
      form.pincode !== (user.pincode ?? '') ||
      form.serviceType !== (user.serviceType ?? '') ||
      form.approxPrice !== (user.approxPrice ?? '') ||
      form.description !== (user.description ?? '') ||
      form.yearsExperience !== (user.yearsExperience ?? '')
    );
  }, [form, user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!isValidPhone(form.phone)) newErrors.phone = 'Invalid phone number.';
    if (!form.doorNo.trim()) newErrors.doorNo = 'Door number is required.';
    if (!form.addressLine.trim()) newErrors.addressLine = 'Address is required.';
    if (!form.city.trim()) newErrors.city = 'City is required.';
    if (!form.state.trim()) newErrors.state = 'State is required.';
    if (!isValidPincode(form.pincode)) newErrors.pincode = 'Invalid pincode.';
    if (!form.serviceType.trim()) newErrors.serviceType = 'Service type is required.';
    if (!form.approxPrice || parseFloat(form.approxPrice) <= 0) {
      newErrors.approxPrice = 'Price must be greater than 0.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    if (!isDirty) {
      setToast({ message: 'No changes to save', tone: 'success' });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    setLoading(true);
    try {
      // build payload only with updatable fields
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        doorNo: form.doorNo.trim(),
        addressLine: form.addressLine.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: parseInt(form.pincode),
        serviceType: form.serviceType.trim(),
        approxPrice: parseFloat(form.approxPrice),
        description: form.description?.trim() || '',
        yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : 0,
      };

      console.log('Updating provider profile:', payload);

      const resp = await providerAPI.update(user.id, payload);
      console.log('Update response:', resp);

      // optimistic update of local auth user
      updateUser(payload);

      setIsEditing(false);
      setToast({ message: 'Profile updated successfully', tone: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Profile save error', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to save profile';
      setErrors((prev) => ({ ...prev, general: msg }));
      setToast({ message: msg, tone: 'error' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    // revert to user state
    setForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      doorNo: user?.doorNo ?? '',
      addressLine: user?.addressLine ?? '',
      city: user?.city ?? '',
      state: user?.state ?? '',
      pincode: user?.pincode ?? '',
      serviceType: user?.serviceType ?? '',
      approxPrice: user?.approxPrice ?? '',
      description: user?.description ?? '',
      yearsExperience: user?.yearsExperience ?? '',
    });
    setErrors({});
    setIsEditing(false);
  }

  async function handleDeleteProfile() {
    try {
      setLoading(true);

      // Call delete endpoint
      await axios.delete(`http://localhost:8080/api/users/${user.id}/delete-profile`);

      // Show success message
      setToast({ message: 'Profile deleted successfully', tone: 'success' });

      // Wait a moment to show the message
      setTimeout(() => {
        // Logout and redirect
        logout();
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error('Error deleting profile:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to delete profile. Please try again.',
        tone: 'error'
      });
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-slate-400">
          <div className="mb-2 text-lg">No user data</div>
          <div className="text-sm">Please log in.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Provider Profile</h1>
          <p className="text-slate-400">Manage your professional information and service details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg border border-gray-200 p-8 rounded-2xl">
          {/* Header with Edit/Save buttons */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Profile Information</h2>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit size={16} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary flex items-center gap-2"
                  disabled={loading}
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={loading || !isDirty}
                >
                  <Save size={16} />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  <User size={16} className="inline mr-2" />
                  Business Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email (read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  disabled
                  className="input-field bg-slate-800/50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                <Phone size={16} className="inline mr-2" />
                Phone *
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="9876543210"
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Service Information Section */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase size={18} />
                Service Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Service Type */}
                <div>
                  <label htmlFor="serviceType" className="block text-sm font-medium text-slate-300 mb-2">
                    Service Type *
                  </label>
                  <input
                    id="serviceType"
                    name="serviceType"
                    type="text"
                    value={form.serviceType}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input-field ${errors.serviceType ? 'border-red-500' : ''}`}
                    placeholder="e.g., Plumbing, Electrical"
                  />
                  {errors.serviceType && <p className="text-red-400 text-sm mt-1">{errors.serviceType}</p>}
                </div>

                {/* Approximate Price */}
                <div>
                  <label htmlFor="approxPrice" className="block text-sm font-medium text-slate-300 mb-2">
                    <DollarSign size={16} className="inline mr-2" />
                    Approximate Price (₹) *
                  </label>
                  <input
                    id="approxPrice"
                    name="approxPrice"
                    type="number"
                    value={form.approxPrice}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input-field ${errors.approxPrice ? 'border-red-500' : ''}`}
                    placeholder="500.00"
                    min="0"
                    step="0.01"
                  />
                  {errors.approxPrice && <p className="text-red-400 text-sm mt-1">{errors.approxPrice}</p>}
                </div>
              </div>

              {/* Years of Experience */}
              <div className="mt-6">
                <label htmlFor="yearsExperience" className="block text-sm font-medium text-slate-300 mb-2">
                  <Award size={16} className="inline mr-2" />
                  Years of Experience
                </label>
                <input
                  id="yearsExperience"
                  name="yearsExperience"
                  type="number"
                  value={form.yearsExperience}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="5"
                  min="0"
                  max="50"
                />
              </div>

              {/* Description */}
              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                  Service Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field"
                  rows="4"
                  maxLength="1000"
                  placeholder="Describe your services and expertise..."
                />
                <div className="text-xs text-slate-400 mt-1 text-right">
                  {form.description.length}/1000 characters
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin size={18} />
                Address
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Door No */}
                <div>
                  <label htmlFor="doorNo" className="block text-sm font-medium text-slate-300 mb-2">
                    Door/Flat Number *
                  </label>
                  <input
                    id="doorNo"
                    name="doorNo"
                    type="text"
                    value={form.doorNo}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input-field ${errors.doorNo ? 'border-red-500' : ''}`}
                    placeholder="123"
                  />
                  {errors.doorNo && <p className="text-red-400 text-sm mt-1">{errors.doorNo}</p>}
                </div>

                {/* Pincode */}
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-slate-300 mb-2">
                    Pincode *
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    value={form.pincode}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input-field ${errors.pincode ? 'border-red-500' : ''}`}
                    placeholder="400001"
                    maxLength="6"
                  />
                  {errors.pincode && <p className="text-red-400 text-sm mt-1">{errors.pincode}</p>}
                </div>
              </div>

              {/* Address Line */}
              <div className="mt-6">
                <label htmlFor="addressLine" className="block text-sm font-medium text-slate-300 mb-2">
                  Address Line *
                </label>
                <input
                  id="addressLine"
                  name="addressLine"
                  type="text"
                  value={form.addressLine}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input-field ${errors.addressLine ? 'border-red-500' : ''}`}
                  placeholder="Street, Area, Landmark"
                />
                {errors.addressLine && <p className="text-red-400 text-sm mt-1">{errors.addressLine}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-2">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                    placeholder="Mumbai"
                  />
                  {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-slate-300 mb-2">
                    State *
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={form.state}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                    placeholder="Maharashtra"
                  />
                  {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
                </div>
              </div>

              {/* Full Address Display */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">Full Address:</div>
                <div className="text-white">
                  {form.doorNo && form.addressLine && form.city && form.state && form.pincode
                    ? `${form.doorNo}, ${form.addressLine}, ${form.city}, ${form.state} - ${form.pincode}`
                    : 'Complete the address fields above'}
                </div>
              </div>
            </div>
          </div>

          {/* Delete Profile Section */}
          <div className="mt-8 pt-6 border-t border-red-500/30">
            <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
              <Trash2 size={20} />
              Danger Zone
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Once you delete your profile, there is no going back. This will permanently delete your account,
              all your services, bookings, reviews, and availability settings.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
            >
              <Trash2 size={18} />
              Delete My Profile Permanently
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-500/30">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="text-red-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Delete Your Profile?</h2>
              <p className="text-slate-400">
                This action cannot be undone. This will permanently delete your provider account and remove all your data.
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-300 mb-2">This will permanently delete:</h3>
              <ul className="text-sm text-red-200 space-y-1">
                <li>• Your provider profile and account</li>
                <li>• All your services and listings</li>
                <li>• All your bookings (past and upcoming)</li>
                <li>• All reviews you've received</li>
                <li>• Your availability settings</li>
                <li>• Your earnings history</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-colors text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? 'Deleting...' : 'Yes, Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}

