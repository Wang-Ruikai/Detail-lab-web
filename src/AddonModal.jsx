import React, { useState, useRef } from "react";
import "./LuxuryPackages.css";

const PACKAGES = [
  {
    id: "A",
    name: "Package A",
    price: { S: 129, M: 149, L: 179 },
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
    price: { S: 169, M: 189, L: 219 },
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
  },
  {
    id: "C",
    name: "Package C",
    price: { S: 229, M: 249, L: 279 },
    description: "Complete Shampoo Detailing",
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
    ],
    upholstery: [
      "All Seating Areas",
      "Floor Surfaces",
      "Mats & Carpet",
      "Boot Area",
      "Door Panels (if applicable)"
    ]
  },
  {
    id: "D",
    name: "Package D",
    price: { S: 69, M: 79, L: 99 },
    description: "Interior or Exterior Only (choose one)",
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
  }
];

const SIZE_DETAILS = {
  S: "(Sedan)",
  M: "(Wagon/SUV)",
  L: "(7-seater / MPV)"
};

const ADDONS = [
  { name: "Fabric Seat Cleaning", price: 30 },
  { name: "Pet Hair Removal", price: 50 },
  { name: "Polishing", price: 40 },
  { name: "Headlight Polishing", price: 25 },
  { name: "Duraseal Coating", price: 60 },
  { name: "Oil Film Removal (Glass)", price: 40 },
  { name: "Vomit Cleanup", price: 0 }
];

export default function LuxuryPackages() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const detailRef = useRef(null);
  const current = PACKAGES[activeIndex];

  const basePrice = selectedSize ? current.price[selectedSize] : 0;
  const addonTotal = selectedAddons.reduce((sum, i) => sum + ADDONS[i].price, 0);
  const finalPrice = basePrice + addonTotal;

  const toggleAddon = (idx) => {
    setSelectedAddons((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleCardClick = (idx) => {
    setActiveIndex(idx);
    setSelectedAddons([]);
    setSelectedSize(null);
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

          {current.upholstery && (
            <div className="detail-block" style={{ marginTop: "24px" }}>
              <h4>Upholstery Shampoo Clean</h4>
              <ul>
                {current.upholstery.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {current.id === "D" && (
            <p className="package-note">
              <strong>Note:</strong> This package includes either <strong>Interior</strong> <strong><u>OR</u></strong> <strong>Exterior</strong> cleaning only. Please specify your choice when booking.
            </p>
          )}

          <div className="price-row">
            {Object.entries(current.price).map(([size, price], idx) => (
              <div
                key={size}
                className={`price-tag ${selectedSize === size ? "active-size" : ""}`}
                onClick={() => setSelectedSize(size)}
              >
                <img
                  src={`/images/icon_vehicle_${idx + 1}_white.png`}
                  alt={`${size} icon`}
                  className="vehicle-icon"
                />
                <div className="price-info">
                  <span className="size-label">
                    {size} {SIZE_DETAILS[size]}
                  </span>
                  <span className="price-value">${price}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedSize && (
            <div className="addon-section">
              <div className="addon-title">Add-ons</div>
              {ADDONS.map((item, i) => (
                <div
                  key={i}
                  className={`addon-item ${selectedAddons.includes(i) ? "selected" : ""}`}
                  onClick={() => toggleAddon(i)}
                >
                  <input
                    type="checkbox"
                    checked={selectedAddons.includes(i)}
                    readOnly
                  />
                  <label>
                    {item.name} {item.price > 0 ? ` - $${item.price}` : "(Varies by condition)"}
                  </label>
                </div>
              ))}
              <div className="total-price-display">Estimated Total: ${finalPrice}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
