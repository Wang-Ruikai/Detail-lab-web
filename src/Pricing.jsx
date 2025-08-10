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
              <td>$30 each seat</td>
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
          <div className="service-card">
            <div className="service-header">
              <span className="emoji">🧼</span>
            </div>
            <div className="service-content">
              <h4>Fabric Seat Cleaning</h4>
              <p className="service-desc">$30 each seat</p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-header">
              <span className="emoji">🐾</span>
            </div>
            <div className="service-content">
              <h4>Pet Hair Removal</h4>
              <p className="service-desc">From $50 depending on condition</p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-header">
              <span className="emoji">✨</span>
            </div>
            <div className="service-content">
              <h4>Polishing</h4>
              <p className="service-desc">From $40 (full car polishing available)</p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-header">
              <span className="emoji">🔆</span>
            </div>
            <div className="service-content">
              <h4>Headlight Polishing</h4>
              <p className="service-desc">$25 each</p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-header">
              <span className="emoji">🛡️</span>
            </div>
            <div className="service-content">
              <h4>Duraseal Coating</h4>
              <p className="service-desc">From $60</p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-header">
              <span className="emoji">🪟</span>
            </div>
            <div className="service-content">
              <h4>Oil Film Removal (Glass)</h4>
              <p className="service-desc">$40</p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-header">
              <span className="emoji">🧽</span>
            </div>
            <div className="service-content">
              <h4>Vomit Cleanup</h4>
              <p className="service-desc">Price varies depending on condition</p>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
