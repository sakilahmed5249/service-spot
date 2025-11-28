import React from 'react';

const LoadingSpinner = ({
  size = 'md',
  fullScreen = false,
  label = null,
  message = 'Loading...',
  className = '',
}) => {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4',
    xl: 'h-24 w-24 border-4',
  };

  const spinnerSize = sizes[size] || sizes.md;

  const spinner = (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center gap-3 ${className}`}
    >
      {/* Outer Spinner */}
      <div className="relative flex items-center justify-center">
        <div
          className={`
            ${spinnerSize}
            rounded-full
            border-gray-300/30 
            border-t-primary border-l-accent
            animate-spin
            shadow-sm
          `}
          style={{ animationDuration: '0.9s' }}
        />

        {/* Inner Glow Ring */}
        <div
          className={`
            absolute 
            ${spinnerSize}
            rounded-full
            border-2 
            border-transparent 
            border-t-purple-500/30 
            animate-spin
          `}
          style={{ animationDuration: '1.6s' }}
        />
      </div>

      {/* Label (optional, not only for fullscreen) */}
      {label && (
        <p className="text-sm text-gray-500 animate-pulse">{label}</p>
      )}

      {/* SR-only fallback text */}
      <span className="sr-only">{message}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="
          fixed inset-0 z-[9999] 
          flex items-center justify-center 
          backdrop-blur-md
          bg-white/40 dark:bg-black/30
        "
      >
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-gray-700 dark:text-gray-200 font-medium text-lg animate-pulse">
            {message}
          </p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;