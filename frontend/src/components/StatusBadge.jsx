import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
