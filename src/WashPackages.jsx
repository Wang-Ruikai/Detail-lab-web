import React, { useState } from "react";
import "./WashPackages.css";

const SERVICES = [
  { id: "hand_shampoo", label: "Hand Shampoo" },
  { id: "tyre_dry", label: "Tyre Dry" },
  { id: "chamois_dry", label: "Chamois Dry" },
  { id: "interior_vacuum", label: "Complete Interior Vacuum" },
  { id: "high_pressure", label: "High Pressure Rinse" },
  { id: "leather_protect", label: "Leather Conditioning" },
  { id: "mat_cleaning", label: "Mat Shampoo Cleaning" },
  { id: "engine_bay", label: "Engine Bay Cleaning" },
  { id: "dashboard", label: "Dashboard Clean" },
  { id: "glass_clean", label: "Glass Clean" }
];

const PACKAGES = [
  {
    id: "A",
    name: "Package A",
    price: "$129",
    recommended: false,
    services: ["hand_shampoo", "tyre_dry", "chamois_dry", "interior_vacuum"]
  },
  {
    id: "B",
    name: "Package B",
    price: "$169",
    recommended: true,
    services: [
      "hand_shampoo",
      "tyre_dry",
      "chamois_dry",
      "interior_vacuum",
      "leather_protect",
      "mat_cleaning"
    ]
  },
  {
    id: "C",
    name: "Package C",
    price: "$199",
    recommended: false,
    services: [
      "hand_shampoo",
      "engine_bay",
      "glass_clean",
      "dashboard"
    ]
  },
  {
    id: "D",
    name: "Package D",
    price: "$229",
    recommended: false,
    services: [
      "hand_shampoo",
      "interior_vacuum",
      "high_pressure",
      "glass_clean"
    ]
  }
];

export default function WashPackages() {
  const [selected, setSelected] = useState("B");

  const currentPackage = PACKAGES.find((pkg) => pkg.id === selected);

  return (
    <div className="wash-packages">
      <h2 className="section-title">What We Do</h2>

      <div className="package-tabs">
        {PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => setSelected(pkg.id)}
            className={`tab-btn ${selected === pkg.id ? "active" : ""} ${pkg.recommended ? "recommended" : ""}`}
          >
            {pkg.name}
            {pkg.recommended && <span className="badge">★ Recommended</span>}
          </button>
        ))}
      </div>

      <div className="services-list">
        {SERVICES.map((service) => (
          <div
            key={service.id}
            className={`service-item ${currentPackage.services.includes(service.id) ? "included" : "not-included"}`}
          >
            <span className="checkmark">
              {currentPackage.services.includes(service.id) ? "✅" : "⬜"}
            </span>
            <span className="label">{service.label}</span>
          </div>
        ))}
      </div>

      <div className="package-price">FROM <strong>{currentPackage.price}</strong></div>
    </div>
  );
}

