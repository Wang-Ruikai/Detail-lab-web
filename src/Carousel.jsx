import React, { useState, useEffect } from 'react';
import './Carousel.css';

const images = [
  '/images/wash1.jpg',
  '/images/wash2.jpg',
  '/images/wash3.jpg',
  '/images/wash4.jpg',
  '/images/wash5.jpg',
  '/images/wash6.jpg',
  '/images/wash7.jpg',
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="carousel">
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Slide ${index + 1}`}
          className={`carousel-image ${index === current ? 'active' : ''}`}
        />
      ))}
    </div>
  );
}
