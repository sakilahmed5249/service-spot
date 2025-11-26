import React from 'react';

const EmptyState = ({ icon: Icon, title, message, action }) => {
  return (
    <div className="card text-center py-12">
      {Icon && <Icon size={48} className="mx-auto text-gray-400 mb-4" />}
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {action && action}
    </div>
  );
};

export default EmptyState;
