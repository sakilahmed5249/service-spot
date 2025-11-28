import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerAPI } from '../services/api';
import { User, Mail, Phone, MapPin, Edit, Save, X, Check } from 'lucide-react';
import { CITIES, STATES, isValidPhone, isValidPincode } from '../utils/constants';
import PropTypes from 'prop-types';

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

export default function CustomerProfile() {
  const { user, updateUser } = useAuth();

  // form state
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    doorNo: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
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
      form.pincode !== (user.pincode ?? '')
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
    if (!form.city) newErrors.city = 'City is required.';
    if (!form.state) newErrors.state = 'State is required.';
    if (!isValidPincode(form.pincode)) newErrors.pincode = 'Invalid pincode.';
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
        city: form.city,
        state: form.state,
        pincode: form.pincode.trim(),
      };

      const resp = await customerAPI.update(user.id, payload);
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
    });
    setErrors({});
    setIsEditing(false);
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center card p-8">
          <p className="text-lg">You must be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-sm text-slate-400 mt-1">Manage your contact and address details</p>
            </div>

            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex items-center gap-2"
                  aria-label="Edit profile"
                >
                  <Edit size={16} /><span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={!isDirty || loading}
                    className={`btn-primary flex items-center gap-2 ${!isDirty || loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    aria-label="Save profile"
                  >
                    <Save size={16} /> <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>

                  <button
                    onClick={handleCancel}
                    className="btn-secondary flex items-center gap-2"
                    aria-label="Cancel editing"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {errors.general && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} aria-label="Customer profile form" className="space-y-6">
            {/* Personal */}
            <section aria-labelledby="personal-heading">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <h2 id="personal-heading" className="text-lg font-semibold">Personal Information</h2>
                  <p className="text-xs text-slate-400">Name and phone used for bookings</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                  {isEditing ? (
                    <>
                      <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && <p id="name-error" className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{user.email}</p>
                  {isEditing && <p className="text-xs text-slate-400 mt-1">Email cannot be changed here</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <>
                      <input
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                        inputMode="tel"
                        maxLength={10}
                      />
                      {errors.phone && <p id="phone-error" className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.phone}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Address */}
            <section aria-labelledby="address-heading" className="pt-4 border-t">
              <h2 id="address-heading" className="text-lg font-semibold mb-3">Address</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="doorNo" className="block text-sm font-medium text-gray-700 mb-1">Door / Flat No.</label>
                  {isEditing ? (
                    <>
                      <input id="doorNo" name="doorNo" value={form.doorNo} onChange={handleChange} className={`input-field ${errors.doorNo ? 'border-red-500' : ''}`} aria-invalid={!!errors.doorNo} />
                      {errors.doorNo && <p className="text-red-500 text-sm mt-1">{errors.doorNo}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.doorNo}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  {isEditing ? (
                    <>
                      <input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} className={`input-field ${errors.pincode ? 'border-red-500' : ''}`} maxLength={6} aria-invalid={!!errors.pincode} />
                      {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.pincode}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="addressLine" className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
                  {isEditing ? (
                    <>
                      <input id="addressLine" name="addressLine" value={form.addressLine} onChange={handleChange} className={`input-field ${errors.addressLine ? 'border-red-500' : ''}`} aria-invalid={!!errors.addressLine} />
                      {errors.addressLine && <p className="text-red-500 text-sm mt-1">{errors.addressLine}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.addressLine}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  {isEditing ? (
                    <>
                      <select id="city" name="city" value={form.city} onChange={handleChange} className={`input-field ${errors.city ? 'border-red-500' : ''}`}>
                        <option value="">Select city</option>
                        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  {isEditing ? (
                    <>
                      <select id="state" name="state" value={form.state} onChange={handleChange} className={`input-field ${errors.state ? 'border-red-500' : ''}`}>
                        <option value="">Select state</option>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.state}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Actions (for small screens show save/cancel in form) */}
            {isEditing && (
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={handleCancel} className="btn-secondary flex items-center gap-2">
                  <X size={16} /> Cancel
                </button>
                <button type="submit" disabled={!isDirty || loading} className={`btn-primary flex items-center gap-2 ${(!isDirty || loading) ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}

CustomerProfile.propTypes = {
  // component uses useAuth — no props required
};