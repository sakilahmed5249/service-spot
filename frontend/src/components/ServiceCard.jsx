import React from "react";
import PropTypes from "prop-types";

/*
  REDESIGNED ServiceCard - Premium Floating Card Design

  BEFORE: Flat glass card with minimal elevation
  AFTER: Premium white surface floating on gray background with:
    - Strong elevation shadows
    - Clear visual hierarchy
    - Professional hover states
    - Brand color accents
*/

export function ServiceCard({ service, onBook, onDetails }) {
  const Icon = service.icon;

  return (
    <article
      role="article"
      className="
        group relative
        bg-white rounded-2xl p-6
        border border-gray-200
        shadow-md hover:shadow-xl
        transition-all duration-300 ease-out
        hover:-translate-y-2
        flex flex-col gap-5
        min-w-[280px]
        cursor-pointer
      "
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Icon with premium styling */}
            <div
              className="
                w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                bg-gradient-to-br from-primary to-accent
                shadow-primary
                group-hover:scale-110 transition-transform duration-300
              "
            >
              {Icon ? (
                <Icon className="w-7 h-7 text-white" />
              ) : service.iconPath ? (
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d={service.iconPath} />
                </svg>
              ) : (
                <span className="text-2xl font-bold text-white">•</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 truncate">
                {service.title}
              </h3>
              <p className="text-sm text-gray-600 truncate">{service.subtitle}</p>
            </div>
          </div>

          {/* Pricing Badge */}
          <div className="flex flex-col items-end ml-3">
            <span className="text-xl font-bold text-primary">
              ₹{service.price}
            </span>
            <span className="text-xs text-gray-500 font-medium">starting</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
          {service.description}
        </p>

        {/* Metadata Row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg">
            <svg className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-amber-700">{service.rating}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-blue-700">{service.duration}m</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onDetails}
            className="
              flex-1 px-4 py-2.5
              border-2 border-gray-200 rounded-lg
              text-sm font-semibold text-gray-700
              hover:border-primary hover:text-primary hover:bg-primary/5
              transition-all duration-200
            "
          >
            View Details
          </button>
          <button
            onClick={onBook}
            className="
              flex-1 px-4 py-2.5
              bg-gradient-to-r from-primary to-accent
              rounded-lg shadow-primary
              text-sm font-semibold text-white
              hover:shadow-primary-lg hover:-translate-y-0.5
              transition-all duration-200
            "
          >
            Book Now
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
