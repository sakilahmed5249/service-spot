import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: { 
      gradient: 'bg-gradient-to-r from-yellow-400 to-orange-500', 
      text: 'text-white', 
      label: 'Pending',
      icon: Clock
    },
    CONFIRMED: { 
      gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500', 
      text: 'text-white', 
      label: 'Confirmed',
      icon: CheckCircle
    },
    CANCELLED: { 
      gradient: 'bg-gradient-to-r from-red-500 to-pink-600', 
      text: 'text-white', 
      label: 'Cancelled',
      icon: XCircle
    },
    COMPLETED: { 
      gradient: 'bg-gradient-to-r from-emerald-500 to-green-600', 
      text: 'text-white', 
      label: 'Completed',
      icon: CheckCircle
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${config.gradient} ${config.text} shadow-md uppercase tracking-wide`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
