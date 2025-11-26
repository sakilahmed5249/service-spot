import React from 'react';

const LoadingSpinner = ({ size = 'md', fullScreen = false, message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-20 w-20',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className={`animate-spin rounded-full border-4 border-purple-200 ${sizeClasses[size]}`}></div>
        <div className={`absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 ${sizeClasses[size]}`} style={{ animationDuration: '1s' }}></div>
      </div>
      {fullScreen && (
        <p className="text-gray-600 font-semibold text-lg animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
