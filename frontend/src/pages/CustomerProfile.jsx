import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerAPI } from '../services/api';
import { User, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';
import { CITIES, STATES, isValidPhone, isValidPincode } from '../utils/constants';

const CustomerProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    doorNo: user?.doorNo || '',
    addressLine: user?.addressLine || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!formData.doorNo.trim()) {
      newErrors.doorNo = 'Door number is required';
    }

    if (!formData.addressLine.trim()) {
      newErrors.addressLine = 'Address is required';
    }

    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!isValidPincode(formData.pincode)) {
      newErrors.pincode = 'Invalid pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await customerAPI.update(user.id, formData);
      updateUser(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      doorNo: user?.doorNo || '',
      addressLine: user?.addressLine || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="card">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary flex items-center"
              >
                <Edit size={18} className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <User size={20} className="mr-2 text-primary" />
                Personal Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user?.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{user?.email}</p>
                  {isEditing && <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength="10"
                        className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user?.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin size={20} className="mr-2 text-primary" />
                Address
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Door/Flat Number
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="doorNo"
                        value={formData.doorNo}
                        onChange={handleChange}
                        className={`input-field ${errors.doorNo ? 'border-red-500' : ''}`}
                      />
                      {errors.doorNo && <p className="text-red-500 text-sm mt-1">{errors.doorNo}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user?.doorNo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        maxLength="6"
                        className={`input-field ${errors.pincode ? 'border-red-500' : ''}`}
                      />
                      {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user?.pincode}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="addressLine"
                        value={formData.addressLine}
                        onChange={handleChange}
                        className={`input-field ${errors.addressLine ? 'border-red-500' : ''}`}
                      />
                      {errors.addressLine && <p className="text-red-500 text-sm mt-1">{errors.addressLine}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user?.addressLine}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  {isEditing ? (
                    <>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select City</option>
                        {CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user?.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  {isEditing ? (
                    <>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select State</option>
                        {STATES.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{user?.state}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 mt-6 pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center justify-center flex-1"
                >
                  <Save size={18} className="mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary flex items-center justify-center flex-1"
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
