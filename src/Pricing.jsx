import React from "react";
import "./Pricing.css";

export default function Pricing() {
  return (
    <section id="pricing" className="pricing-section">
      <h3 className="section-title">Additional Services</h3>

      {/* Desktop table view */}
      <div className="table-wrapper desktop-only">
        <table className="pricing-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Description & Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Fabric Seat Cleaning</strong></td>
              <td>$35 each seat</td>
            </tr>
            <tr>
              <td><strong>Pet Hair Removal</strong></td>
              <td>From $50 depending on condition</td>
            </tr>
            <tr>
              <td><strong>Polishing</strong></td>
              <td>From $40 (full car polishing available)</td>
            </tr>
            <tr>
              <td><strong>Headlight Polishing</strong></td>
              <td>$25 each</td>
            </tr>
            <tr>
              <td><strong>Duraseal Coating</strong></td>
              <td>From $60</td>
            </tr>
            <tr>
              <td><strong>Oil Film Removal (Glass)</strong></td>
              <td>$40</td>
            </tr>
            <tr>
              <td><strong>Vomit Cleanup</strong></td>
              <td>Price varies depending on condition</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile flat list view */}
      <div className="mobile-only flat-list-view">
        <div className="flat-list-view">
          {[
            { icon: "🧼", title: "Fabric Seat Cleaning", desc: "$35 each seat" },
            { icon: "🐾", title: "Pet Hair Removal", desc: "From $50 depending on condition" },
            { icon: "✨", title: "Polishing", desc: "From $40 (full car polishing available)" },
            { icon: "🔆", title: "Headlight Polishing", desc: "$25 each" },
            { icon: "🛡️", title: "Duraseal Coating", desc: "From $60" },
            { icon: "🪟", title: "Oil Film Removal (Glass)", desc: "$40" },
            { icon: "🧽", title: "Vomit Cleanup", desc: "Price varies depending on condition" },
          ].map((item, index) => (
            <div className="service-card" key={index}>
              <div className="service-header">
                <span className="emoji">{item.icon}</span>
                <h4>{item.title}</h4>
              </div>
              <p className="service-desc">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
