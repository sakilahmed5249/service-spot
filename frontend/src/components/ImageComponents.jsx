import React from 'react';
import { FaUserCircle, FaTools, FaImage } from 'react-icons/fa';

/*
  Exports:
   - Avatar (default export)
   - ServiceImage
   - ImagePlaceholder
   - ProviderImage
*/

/* Avatar: initials fallback, optional image src, size variants */
export const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
    xl: 'w-28 h-28 text-5xl',
  };

  const getInitials = (value) => {
    if (!value) return '?';
    const parts = value.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const gradients = [
    'from-blue-500 to-cyan-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-red-600',
    'from-indigo-500 to-purple-600',
    'from-yellow-500 to-orange-600',
  ];

  const getGradient = (value) => {
    const code = value && value.length ? value.charCodeAt(0) : 0;
    return gradients[code % gradients.length];
  };

  const sizeClass = sizes[size] || sizes.md;
  const base = `${sizeClass} ${className} rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white overflow-hidden`;

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${base} object-cover`}
        onError={(e) => {
          // fallback to initials if image fails
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`${base} text-white bg-gradient-to-br ${getGradient(name || 'A')}`}
      aria-hidden
      title={name || 'Avatar'}
    >
      {getInitials(name)}
    </div>
  );
};

/* ServiceImage: placeholder card for service thumbnails */
export const ServiceImage = ({ category, className = '' }) => {
  return (
    <div
      className={`${className} bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center overflow-hidden relative`}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/12 to-purple-600/12" />
      <FaTools className="text-6xl text-blue-600/40 relative z-10" />
      <span className="sr-only">{category || 'Service image'}</span>
    </div>
  );
};

/* ImagePlaceholder: generic image placeholder with optional icon and text */
export const ImagePlaceholder = ({ icon: Icon = FaImage, className = '', text = '' }) => {
  return (
    <div
      className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center overflow-hidden p-4`}
      aria-hidden
    >
      <Icon className="text-5xl text-gray-400 mb-2" />
      {text && <span className="text-sm text-gray-500 font-medium">{text}</span>}
    </div>
  );
};

/* ProviderImage: show provided src or a stylized avatar placeholder */
export const ProviderImage = ({ name, src, className = '' }) => {
  const base = `${className} rounded-2xl object-cover shadow-xl overflow-hidden`;
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Provider'}
        className={base}
        onError={(e) => {
          // hide broken image; fall back to placeholder rendered below
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`${className} bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl`}
      aria-hidden
    >
      <FaUserCircle className="text-white text-6xl opacity-90" />
      <span className="sr-only">{name || 'Provider'}</span>
    </div>
  );
};

export default Avatar;