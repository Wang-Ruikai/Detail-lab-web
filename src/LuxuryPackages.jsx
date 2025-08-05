// src/LuxuryPackages.jsx
import React, { useState, useRef } from "react";
import "./LuxuryPackages.css";

const PACKAGES = [
  {
    id: "A",
    name: "Package A",
    price: { S: "$129", M: "$149", L: "$169", XL: "$189" },
    description: "Complete vehicle precision clean",
    exterior: [
      "Tyre Cleaning",
      "Fender High-Pressure Rinse",
      "Tyre Wax",
      "Neutral Shampoo Full Body Wash",
      "Detailing: Grille, Door Frames, Hinges, Fuel Cap",
      "Glass & Mirror Cleaning",
      "Drying with Blower & Towel"
    ],
    interior: [
      "Interior Vacuum",
      "Plastic Trim Cleaning",
      "Trunk Vacuum",
      "Leather Conditioning",
      "Interior Glass & Piano Panel Clean"
    ]
  },
  {
    id: "B",
    name: "Package B",
    price: { S: "$169", M: "$189", L: "$209", XL: "$229" },
    description: "Premium full-detailing service",
    exterior: [
      "Tyre Cleaning",
      "Rim Cleaning",
      "Caliper Cleaning",
      "Fender High-Pressure Rinse",
      "Tyre Wax",
      "Neutral Shampoo Full Body Wash",
      "Detailing: Grille, Door Frames, Hinges, Fuel Cap",
      "Glass & Mirror Cleaning",
      "Drying with Blower & Towel"
    ],
    interior: [
      "Interior Vacuum",
      "Plastic Trim Cleaning",
      "Trunk Vacuum",
      "Leather Conditioning",
      "Interior Glass & Piano Panel Clean",
      "Mat Shampoo Extraction",
      "Leather Deep Clean (Horsehair Brush + Agent)"
    ]
  }
];

const SIZE_DETAILS = {
  S: "(Sedan)",
  M: "(Wagon/SUV)",
  L: "(7 seater)",
  XL: "(RV/MPV)"
};

export default function LuxuryPackages() {
  const [activeIndex, setActiveIndex] = useState(0);
  const detailRef = useRef(null);
  const current = PACKAGES[activeIndex];

  const handleCardClick = (idx) => {
    setActiveIndex(idx);
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        if (detailRef.current) {
          const headerOffset = 100;
          const elementTop =
            detailRef.current.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: elementTop - headerOffset, behavior: "smooth" });
        }
      }, 50);
    }
  };

  return (
    <section className="luxury-section">
      <div className="luxury-container">
        <h2 className="section-title">Our Premium Packages</h2>

        <div className="slider">
          {PACKAGES.map((pkg, idx) => (
            <div
              key={pkg.id}
              className={`package-card ${idx === activeIndex ? "active" : ""}`}
              onClick={() => handleCardClick(idx)}
            >
              <h3 className="package-name">{pkg.name}</h3>
              <p className="package-desc">{pkg.description}</p>
            </div>
          ))}
        </div>

        <div className="package-details" ref={detailRef}>
          <div className="columns">
            <div className="detail-block">
              <h4>Exterior Care</h4>
              <ul>
                {current.exterior.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="detail-block">
              <h4>Interior Care</h4>
              <ul>
                {current.interior.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="price-row">
            {Object.entries(current.price).map(([size, price], idx) => (
              <div className="price-tag" key={size}>
                <img
                  src={`/images/icon_vehicle_${idx + 1}_white.png`}
                  alt={`${size} icon`}
                  className="vehicle-icon"
                />
                <div className="price-info">
                  <span className="size-label">{size} {SIZE_DETAILS[size]}</span>
                  <span className="price-value">{price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
