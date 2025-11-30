import React from 'react';

/**
 * Gaming Aesthetic Layout Components
 *
 * Implements modern gaming design with:
 * - Dark gradient backgrounds
 * - Glass morphism cards with neon glows
 * - Vibrant purple/orange accents
 * - Neon shadows and borders
 */

/**
 * Main Layout Wrapper - Gaming Style
 */
export const SurfaceLayout = ({ children, maxWidth = '7xl', className = '' }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4 ${className}`}>
      <div className={`max-w-${maxWidth} mx-auto`}>
        {children}
      </div>
    </div>
  );
};

/**
 * Content Card - Glass Morphism with Glow
 */
export const ContentCard = ({
  children,
  className = '',
  hover = false,
  padding = '6',
  glow = 'purple' // purple, orange, cyan
}) => {
  const glowColors = {
    purple: 'hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:border-purple-500',
    orange: 'hover:shadow-[0_0_30px_rgba(255,107,53,0.5)] hover:border-orange-500',
    cyan: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:border-cyan-500'
  };

  return (
    <div
      className={`
        bg-slate-800/80
        backdrop-blur-lg
        rounded-xl
        shadow-xl
        border-2 border-purple-500/30
        p-${padding}
        ${hover ? `${glowColors[glow]} hover:-translate-y-2 transition-all duration-300` : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

/**
 * Section Card - Gaming Header Style
 */
export const SectionCard = ({
  title,
  subtitle,
  children,
  className = '',
  headerActions
}) => {
  return (
    <div className={`bg-slate-800/80 backdrop-blur-lg rounded-xl shadow-xl border-2 border-purple-500/30 overflow-hidden ${className}`}>
      {(title || headerActions) && (
        <div className="px-6 py-4 border-b-2 border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-pink-900/50 flex items-center justify-between">
          <div>
            {title && <h2 className="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{title}</h2>}
            {subtitle && <p className="text-sm text-slate-300 mt-1">{subtitle}</p>}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

/**
 * Stat Card - Gaming Dashboard Style
 */
export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  className = ''
}) => {
  return (
    <ContentCard hover glow="orange" className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 font-semibold ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.5)]">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </ContentCard>
  );
};

/**
 * Grid Layout - Responsive Gaming Grid
 */
export const CardGrid = ({
  children,
  cols = { sm: 1, md: 2, lg: 3 },
  gap = 6,
  className = ''
}) => {
  return (
    <div className={`
      grid
      grid-cols-${cols.sm}
      md:grid-cols-${cols.md}
      lg:grid-cols-${cols.lg}
      gap-${gap}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default SurfaceLayout;

