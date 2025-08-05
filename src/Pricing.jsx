import React from "react";
import "./Pricing.css";

export default function Pricing() {
  return (
    <section id="pricing" className="pricing-section">
      <h3 className="section-title">Our Pricing</h3>

      {/* Desktop table view */}
      <div className="table-wrapper desktop-only">
        <table className="pricing-table">
  <thead>
    <tr>
      <th>Package</th>
      <th>Service Details</th>
      <th><strong>S</strong><br /><span className="sub-label">(Sedan)</span></th>
      <th><strong>M</strong><br /><span className="sub-label">(Wagon/SUV)</span></th>
      <th><strong>L</strong><br /><span className="sub-label">(7 Seater)</span></th>
      <th><strong>XL</strong><br /><span className="sub-label">(RV/MPV)</span></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Package A</strong></td>
      <td>
        <strong>Exterior:</strong><br />
        Tyre Cleaning, Fender High-Pressure Rinse, Tyre Wax,<br />
        Neutral Shampoo Full Body Wash, Detailing (Grille, Door Frames, Hinges, Fuel Cap),<br />
        Glass & Mirror Cleaning, Drying with Blower & Towel<br /><br />
        <strong>Interior:</strong><br />
        Interior Vacuum, Plastic Trim Cleaning, Trunk Vacuum,<br />
        Leather Conditioning, Interior Glass & Piano Panel Clean
      </td>
      <td><strong>$129</strong></td>
      <td><strong>$149</strong></td>
      <td><strong>$169</strong></td>
      <td><strong>$189</strong></td>
    </tr>
    <tr>
      <td><strong>Package B</strong></td>
      <td>
        <strong>Exterior Care:</strong><br />
        Tyre Cleaning, Rim Cleaning, Caliper Cleaning,<br />
        Fender High-Pressure Rinse, Tyre Wax,<br />
        Neutral Shampoo Full Body Wash,<br />
        Detailing: Grille, Door Frames, Hinges, Fuel Cap,<br />
        Glass & Mirror Cleaning, Drying with Blower & Towel<br /><br />
        <strong>Interior Care:</strong><br />
        Interior Vacuum, Plastic Trim Cleaning, Trunk Vacuum,<br />
        Leather Conditioning, Interior Glass & Piano Panel Clean,<br />
        Mat Shampoo Extraction,<br />
        Leather Deep Clean (Horsehair Brush + Agent)
      </td>
      <td><strong>$169</strong></td>
      <td><strong>$189</strong></td>
      <td><strong>$209</strong></td>
      <td><strong>$229</strong></td>
    </tr>

    <tr><td colSpan="6"><strong>Additional Services</strong></td></tr>
    <tr>
      <td><strong>Fabric Seat Cleaning</strong></td>
      <td colSpan="5">$35 each seat</td>
    </tr>
    <tr>
      <td><strong>Pet Hair Removal</strong></td>
      <td colSpan="5">From $50 depending on condition</td>
    </tr>
    <tr>
      <td><strong>Polishing</strong></td>
      <td colSpan="5">From $40 (full car polishing available)</td>
    </tr>
    <tr>
      <td><strong>Headlight Polishing</strong></td>
      <td colSpan="5">$25 each</td>
    </tr>
    <tr>
      <td><strong>Duraseal Coating</strong></td>
      <td colSpan="5">From $60</td>
    </tr>
    <tr>
      <td><strong>Oil Film Removal (Glass)</strong></td>
      <td colSpan="5">$40</td>
    </tr>
    
    <tr>
      <td><strong>Vomit Cleanup</strong></td>
      <td colSpan="5">Price varies depending on condition</td>
    </tr>

  </tbody>
</table>

      </div>

      {/* Mobile accordion view */}
      <div className="mobile-only accordion-view">
        <details>
          <summary>Package A - Exterior & Interior</summary>
          <div className="accordion-content">
            <strong>Exterior:</strong><br />
            <span className="em">Tyre Cleaning</span>, <span className="em">Fender High-Pressure Rinse</span>, <span className="em">Tyre Wax</span>,<br />
            <span className="em">Neutral Shampoo Full Body Wash</span>, <span className="em">Detailing</span> (Grille, Door Frames, Hinges, Fuel Cap),<br />
            <span className="em">Glass & Mirror Cleaning</span>, <span className="em">Drying with Blower & Towel</span><br /><br />

            <strong>Interior:</strong><br />
            <span className="em">Interior Vacuum</span>, <span className="em">Plastic Trim Cleaning</span>, <span className="em">Trunk Vacuum</span>,<br />
            <span className="em">Leather Conditioning</span>, <span className="em">Interior Glass & Piano Clean</span><br /><br />

            <strong>Pricing:</strong><br />
            <strong>S:</strong> $129 &nbsp;&nbsp;
            <strong>M:</strong> $149 &nbsp;&nbsp;
            <strong>L:</strong> $169 &nbsp;&nbsp;
            <strong>XL:</strong> $189
          </div>
        </details>

        <details>
          <summary>Package B - Deep Interior + Exterior</summary>
          <div className="accordion-content">
            <strong>Exterior Care:</strong><br />
            <span className="em">Tyre Cleaning</span>, <span className="em">Rim Cleaning</span>, <span className="em">Caliper Cleaning</span>,<br />
            <span className="em">Fender High-Pressure Rinse</span>, <span className="em">Tyre Wax</span>,<br />
            <span className="em">Neutral Shampoo Full Body Wash</span>,<br />
            <span className="em">Detailing</span>: Grille, Door Frames, Hinges, Fuel Cap,<br />
            <span className="em">Glass & Mirror Cleaning</span>, <span className="em">Drying with Blower & Towel</span><br /><br />

            <strong>Interior Care:</strong><br />
            <span className="em">Interior Vacuum</span>, <span className="em">Plastic Trim Cleaning</span>, <span className="em">Trunk Vacuum</span>,<br />
            <span className="em">Leather Conditioning</span>, <span className="em">Interior Glass & Piano Panel Clean</span>,<br />
            <span className="em">Mat Shampoo Extraction</span>,<br />
            <span className="em">Leather Deep Clean (Horsehair Brush + Agent)</span><br /><br />

            <strong>Pricing:</strong><br />
            <strong>S:</strong> $169 &nbsp;&nbsp;
            <strong>M:</strong> $189 &nbsp;&nbsp;
            <strong>L:</strong> $209 &nbsp;&nbsp;
            <strong>XL:</strong> $229
          </div>
        </details>

        <details>
          <summary>Additional Services</summary>
          <div className="accordion-content">
            <strong>Fabric Seat Cleaning:</strong> $35 each<br />
            <strong>Pet Hair Removal:</strong> From $50 depending on condition<br />
            <strong>Polishing:</strong> From $40 (full car polishing available)<br />
            <strong>Headlight Polishing:</strong> $25 each<br />
            <strong>Duraseal Coating:</strong> From $60<br />
            <strong>Oil Film Removal (Glass):</strong> $40<br />
            <strong>Vomit Cleanup:</strong> Price varies depending on condition
          </div>
        </details>

      </div>
    </section>
  );
}
