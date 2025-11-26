import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, maxRating = 5, size = 20, showValue = true, onRate = null }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => (
        <button
          key={index}
          onClick={() => onRate && onRate(index + 1)}
          disabled={!onRate}
          className={`${onRate ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            size={size}
            className={`${
              index < rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      {showValue && <span className="ml-2 font-semibold">{rating.toFixed(1)}</span>}
    </div>
  );
};

export default StarRating;
