import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={`card-glass w-full ${sizeClasses[size]} max-h-[90vh] overflow-auto shadow-2xl animate-slide-in-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b-2 border-purple-100 px-6 py-5 flex justify-between items-center rounded-t-2xl z-10">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition-all hover:bg-red-50 p-2 rounded-lg transform hover:scale-110"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
