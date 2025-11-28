import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

const StarRating = ({
  rating,
  maxRating = 5,
  size = 20,
  showValue = true,
  onRate = null,
  allowHalf = false,        // enable half-star interactions
  readOnly = false,
  className = '',
}) => {
  const interactive = !!onRate && !readOnly;

  // Handle keyboard rating
  const handleKey = useCallback(
    (e) => {
      if (!interactive) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = Math.min(maxRating, rating + (allowHalf ? 0.5 : 1));
        onRate(next);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = Math.max(0, rating - (allowHalf ? 0.5 : 1));
        onRate(prev);
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onRate(rating);
      }
    },
    [rating, maxRating, allowHalf, interactive, onRate]
  );

  // Determine fill state
  const getFillState = (index) => {
    const starIndex = index + 1;
    if (rating >= starIndex) return 'full';
    if (allowHalf && rating >= starIndex - 0.5) return 'half';
    return 'empty';
  };

  return (
    <div
      className={`flex items-center gap-1 ${interactive ? 'focus:outline-none' : ''} ${className}`}
      role={interactive ? 'slider' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? maxRating : undefined}
      aria-valuenow={interactive ? rating : undefined}
      aria-label={interactive ? 'Star rating' : undefined}
      onKeyDown={handleKey}
    >
      {[...Array(maxRating)].map((_, index) => {
        const fill = getFillState(index);

        return (
          <button
            key={index}
            onClick={() => interactive && onRate(index + 1)}
            disabled={!interactive}
            className={`
              relative transition-all
              ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
            `}
            aria-label={`Rate ${index + 1} star`}
          >
            {fill === 'half' ? (
              <div className="relative">
                <Star
                  size={size}
                  className="text-gray-300 absolute left-0 top-0"
                />
                <Star
                  size={size}
                  className="text-yellow-400 fill-current clip-half"
                />
              </div>
            ) : (
              <Star
                size={size}
                className={`
                  transition-colors
                  ${fill === 'full'
                    ? 'text-yellow-400 fill-current drop-shadow-[0_0_4px_rgba(255,200,50,0.4)]'
                    : 'text-gray-300'
                  }
                `}
              />
            )}
          </button>
        );
      })}

      {showValue && (
        <span className="ml-2 font-semibold text-white/90">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// Half-star clipping utility
// Add this to index.css (or a global CSS file):
// .clip-half { clip-path: inset(0 50% 0 0); }

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  maxRating: PropTypes.number,
  size: PropTypes.number,
  showValue: PropTypes.bool,
  onRate: PropTypes.func,
  allowHalf: PropTypes.bool,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
};

export default StarRating;