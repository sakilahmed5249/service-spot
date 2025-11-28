import React from "react";
import PropTypes from "prop-types";

/*
  ServiceCard
  - Supports both:
      service.icon (React element) 
      OR service.iconPath (SVG path string)
  - Modern glass card with hover elevation + subtle animations
*/

export function ServiceCard({ service, onBook, onDetails }) {
  const Icon = service.icon; // optional React component icon

  return (
    <article
      role="article"
      className="
        glass card-hover rounded-2xl p-5 border border-white/5
        flex flex-col gap-4 min-w-[260px] transition-all
        hover:shadow-glow-lg hover:-translate-y-1
      "
    >
      {/* Top Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="
              w-12 h-12 rounded-lg flex items-center justify-center
              bg-gradient-to-br from-primary to-accent text-white shadow-md
            "
          >
            {Icon ? (
              <Icon className="w-6 h-6" />
            ) : service.iconPath ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d={service.iconPath} />
              </svg>
            ) : (
              <span className="text-lg font-bold">•</span>
            )}
          </div>

          <div>
            <h3 className="text-white font-display text-base leading-tight">
              {service.title}
            </h3>
            <p className="text-xs text-slate-300">{service.subtitle}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="text-right">
          <span className="text-sm font-semibold text-white">
            ₹{service.price}
          </span>
          <p className="text-[10px] text-slate-400">starting</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300/90 line-clamp-2">
        {service.description}
      </p>

      {/* Badges + Actions */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className="label-soft">⭐ {service.rating}</span>
          <span className="label-soft">{service.duration} mins</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDetails}
            className="btn-ghost px-3 py-1 rounded-md text-sm"
          >
            Details
          </button>
          <button
            onClick={onBook}
            className="btn-primary px-4 py-1.5 rounded-md text-sm"
          >
            Book
          </button>
        </div>
      </div>
    </article>
  );
}

ServiceCard.propTypes = {
  service: PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    price: PropTypes.number.isRequired,
    rating: PropTypes.number,
    duration: PropTypes.number,
    description: PropTypes.string,
    icon: PropTypes.elementType,     // React component icon
    iconPath: PropTypes.string,       // SVG path fallback
  }).isRequired,
  onBook: PropTypes.func,
  onDetails: PropTypes.func,
};

ServiceCard.defaultProps = {
  onBook: () => {},
  onDetails: () => {},
};