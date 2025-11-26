import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ImageSlider = ({ images, autoplay = true, speed = 3000 }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: autoplay,
    autoplaySpeed: speed,
    pauseOnHover: true,
    fade: true,
    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        },
      },
    ],
  };

  return (
    <div 
      className="slider-container relative rounded-2xl overflow-hidden shadow-2xl"
      role="region"
      aria-label="Image carousel"
      aria-roledescription="carousel"
    >
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} className="relative h-[400px] md:h-[500px]">
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
              <div className="p-8 text-white">
                <h3 className="text-2xl md:text-4xl font-bold mb-2">{image.title}</h3>
                <p className="text-lg text-gray-200">{image.description}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageSlider;
