import React from 'react';

const EmptyState = ({ icon: Icon, title, message, action }) => {
  return (
    <div className="card-gradient text-center py-16 shadow-xl animate-fade-in">
      {Icon && (
        <div className="feature-icon mx-auto mb-6 animate-float">
          <Icon size={40} strokeWidth={2} />
        </div>
      )}
      <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
        {title}
      </h3>
      <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
