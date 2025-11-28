import React from 'react';
import PropTypes from 'prop-types';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

/*
  StatusBadge – Modern SaaS Badge Component
  Supports:
  - PENDING
  - CONFIRMED
  - CANCELLED
  - COMPLETED

  Adds:
  - ARIA role
  - hover micro-interactions
  - elegant gradient badges
  - dark mode contrast-safe colors
*/

const STATUS_STYLES = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    gradient: 'from-yellow-400 to-orange-500',
  },
  CONFIRMED: {
    label: 'Confirmed',
    icon: CheckCircle,
    gradient: 'from-blue-500 to-cyan-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    gradient: 'from-red-500 to-pink-600',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle,
    gradient: 'from-emerald-500 to-green-600',
  },
};

export default function StatusBadge({ status, className = '' }) {
  const config = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  const Icon = config.icon;

  return (
    <span
      role="status"
      aria-label={config.label}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        text-xs font-bold uppercase tracking-wide
        bg-gradient-to-r ${config.gradient} text-white shadow-md
        transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5
        dark:shadow-black/40
        ${className}
      `}
    >
      <Icon size={14} className="drop-shadow-sm" />
      {config.label}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  className: PropTypes.string,
};