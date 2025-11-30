import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

/* Accessible, performant ImageSlider:
   - lazyLoad 'ondemand', image loading="lazy"
   - custom arrows with aria-labels
   - pause on hover/focus and when user interacts
   - keyboard left/right navigation
*/

const Arrow = ({ onClick, label, className, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`absolute z-20 top-1/2 transform -translate-y-1/2 p-2 rounded-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${className}`}
  >
    {children}
  </button>
);

export default function ImageSlider({
  images = [],
  autoplay = true,
  speed = 4000,
  transitionMs = 800,
  height = { mobile: 320, desktop: 520 },
  showArrows = true,
  lazyLoad = true,
  dots = true,
  className = '',
}) {
  const sliderRef = useRef(null);

  const settings = {
    dots,
    infinite: true,
    speed: transitionMs,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay,
    autoplaySpeed: speed,
    pauseOnHover: true,
    pauseOnFocus: true,
    fade: true,
    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    arrows: false, // we render custom arrows
    lazyLoad: lazyLoad ? 'ondemand' : undefined,
    adaptiveHeight: false,
    responsive: [
      {
        breakpoint: 768,
        settings: { arrows: false, dots: true },
      },
    ],
    appendDots: (dotsElems) => (
      <ul className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2 z-30">
        {dotsElems}
      </ul>
    ),
    customPaging: (i) => (
      <button
        aria-label={`Go to slide ${i + 1}`}
        className="w-3 h-3 rounded-full bg-white/40 hover:bg-white/70"
        type="button"
      />
    ),
  };

  const onKeyDown = useCallback((e) => {
    if (!sliderRef.current) return;
    if (e.key === 'ArrowLeft') sliderRef.current.slickPrev();
    if (e.key === 'ArrowRight') sliderRef.current.slickNext();
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className={`w-full rounded-2xl overflow-hidden ${className}`} style={{ minHeight: height.mobile }}>
        <div className="skeleton w-full h-full" />
      </div>
    );
  }

  return (
    <div
      className={`slider-container relative rounded-2xl overflow-hidden ${className}`}
      role="region"
      aria-label="Image carousel"
      onKeyDown={onKeyDown}
      tabIndex={0} // make focusable to receive keyboard events
    >
      {/* Custom Prev */}
      {showArrows && (
        <Arrow
          onClick={() => sliderRef.current?.slickPrev()}
          label="Previous slide"
          className="left-3 text-white/90 hover:text-white"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Arrow>
      )}

      {/* Custom Next */}
      {showArrows && (
        <Arrow
          onClick={() => sliderRef.current?.slickNext()}
          label="Next slide"
          className="right-3 text-white/90 hover:text-white"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Arrow>
      )}

      <Slider ref={sliderRef} {...settings}>
        {images.map((image, index) => (
          <figure
            key={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${image.title ?? image.alt ?? `Slide ${index + 1}`}`}
            className="relative"
            style={{
              minHeight: height.mobile,
            }}
          >
            <img
              src={image.url}
              alt={image.alt || image.title || `Slide ${index + 1}`}
              loading="lazy"
              className={`w-full h-[${height.mobile}px] md:h-[${height.desktop}px] object-cover block`}
              style={{ minHeight: height.mobile }}
            />

            {/* Caption (if provided) */}
            {(image.title || image.subtitle || image.description) && (
              <figcaption className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/20 to-transparent p-6 md:p-10 pointer-events-none">
                <div className="max-w-2xl text-white pointer-events-auto">
                  {image.title && <h3 className="text-2xl md:text-4xl font-bold leading-tight">{image.title}</h3>}
                  {image.subtitle && <p className="mt-2 text-sm md:text-lg text-white/90">{image.subtitle}</p>}
                  {image.description && <p className="mt-3 text-sm text-white/80">{image.description}</p>}
                </div>
              </figcaption>
            )}
          </figure>
        ))}
      </Slider>
    </div>
  );
}

ImageSlider.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      alt: PropTypes.string,
      title: PropTypes.string,
      subtitle: PropTypes.string,
      description: PropTypes.string,
    })
  ),
  autoplay: PropTypes.bool,
  speed: PropTypes.number,
  transitionMs: PropTypes.number,
  height: PropTypes.oneOfType([
    PropTypes.shape({ mobile: PropTypes.number, desktop: PropTypes.number }),
    PropTypes.number,
  ]),
  showArrows: PropTypes.bool,
  lazyLoad: PropTypes.bool,
  dots: PropTypes.bool,
  className: PropTypes.string,
};

// Default props removed - using default parameters in function signature instead
