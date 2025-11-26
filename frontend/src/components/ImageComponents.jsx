import React from 'react';
import { FaUserCircle, FaTools, FaImage } from 'react-icons/fa';

// Avatar component with fallback
export const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
    xl: 'w-28 h-28 text-5xl'
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const gradients = [
    'from-blue-500 to-cyan-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-red-600',
    'from-indigo-500 to-purple-600',
    'from-yellow-500 to-orange-600'
  ];

  const getGradient = (name) => {
    const index = name ? name.charCodeAt(0) % gradients.length : 0;
    return gradients[index];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizes[size]} ${className} rounded-full object-cover shadow-lg border-2 border-white`}
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} ${className} rounded-full bg-gradient-to-br ${getGradient(name)} flex items-center justify-center text-white font-bold shadow-lg border-2 border-white`}
    >
      {getInitials(name)}
    </div>
  );
};

// Service Image Placeholder
export const ServiceImage = ({ category, className = '' }) => {
  return (
    <div className={`${className} bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center overflow-hidden relative`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20"></div>
      <FaTools className="text-6xl text-blue-600/40 relative z-10" />
    </div>
  );
};

// Generic Image Placeholder
export const ImagePlaceholder = ({ icon: Icon = FaImage, className = '', text = '' }) => {
  return (
    <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center overflow-hidden`}>
      <Icon className="text-5xl text-gray-400 mb-2" />
      {text && <span className="text-sm text-gray-500 font-medium">{text}</span>}
    </div>
  );
};

// Provider Card Image
export const ProviderImage = ({ name, src, className = '' }) => {
  if (src) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Provider'}
        className={`${className} rounded-2xl object-cover shadow-xl`}
      />
    );
  return (
    <div className={`${className} bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl`}>
      <FaUserCircle className="text-white text-8xl opacity-80" />
    </div>
  );
};

export default Avatar;
