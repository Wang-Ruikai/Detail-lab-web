// src/LuxuryPackages.jsx
import React, { useMemo, useState } from "react";
import "./LuxuryPackages.css";
import BookingModal from "./components/BookingForm.jsx";

const NEW_USER_DISCOUNT = 20;

const PACKAGES = [
  {
    id: "A",
    name: "Package A",
    description: "Complete vehicle precision clean",
    price: { S: 129, M: 149, L: 179 },
    exterior: [
      "Tyre Cleaning",
      "Fender High-Pressure Rinse",
      "Tyre Wax",
      "Neutral Shampoo Full Body Wash",
      "Detailing: Grille, Door Frames, Hinges, Fuel Cap",
      "Glass & Mirror Cleaning",
      "Drying with Blower & Towel",
    ],
    interior: [
      "Interior Vacuum",
      "Plastic Trim Cleaning",
      "Trunk Vacuum",
      "Leather Conditioning",
      "Interior Glass & Piano Panel Clean",
    ],
  },
  {
    id: "B",
    name: "Package B",
    description: "Premium full-detailing service",
    price: { S: 169, M: 189, L: 219 },
    exterior: [
      "Tyre Cleaning",
      "Rim Cleaning",
      "Caliper Cleaning",
      "Fender High-Pressure Rinse",
      "Tyre Wax",
      "Neutral Shampoo Full Body Wash",
      "Detailing: Grille, Door Frames, Hinges, Fuel Cap",
      "Glass & Mirror Cleaning",
      "Drying with Blower & Towel",
    ],
    interior: [
      "Interior Vacuum",
      "Plastic Trim Cleaning",
      "Trunk Vacuum",
      "Leather Conditioning",
      "Interior Glass & Piano Panel Clean",
      "Mat Shampoo Extraction",
      "Leather Deep Clean (Horsehair Brush + Agent)",
    ],
  },
  {
    id: "C",
    name: "Package C",
    description: "Complete Shampoo Detailing",
    price: { S: 229, M: 249, L: 279 },
    exterior: [
      "Tyre Cleaning",
      "Rim Cleaning",
      "Caliper Cleaning",
      "Fender High-Pressure Rinse",
      "Tyre Wax",
      "Neutral Shampoo Full Body Wash",
      "Detailing: Grille, Door Frames, Hinges, Fuel Cap",
      "Glass & Mirror Cleaning",
      "Drying with Blower & Towel",
    ],
    interior: [
      "Interior Vacuum",
      "Plastic Trim Cleaning",
      "Trunk Vacuum",
      "Leather Conditioning",
      "Interior Glass & Piano Panel Clean",
      "Mat Shampoo Extraction",
      "Leather Deep Clean (Horsehair Brush + Agent)",
    ],
    upholstery: [
      "All Seating Areas",
      "Floor Surfaces",
      "Mats & Carpet",
      "Boot Area",
      "Door Panels (if applicable)",
    ],
  },
  {
    id: "D",
    name: "Package D",
    description: "Interior or Exterior Only (choose one)",
    price: { S: 69, M: 79, L: 99 },
    exterior: [
      "Tyre Cleaning",
      "Fender High-Pressure Rinse",
      "Tyre Wax",
      "Neutral Shampoo Full Body Wash",
      "Detailing: Grille, Door Frames, Hinges, Fuel Cap",
      "Glass & Mirror Cleaning",
      "Drying with Blower & Towel",
    ],
    interior: [
      "Interior Vacuum",
      "Plastic Trim Cleaning",
      "Trunk Vacuum",
      "Leather Conditioning",
      "Interior Glass & Piano Panel Clean",
    ],
  },
];

const SIZE_DETAILS = { S: "(Sedan)", M: "(Wagon/SUV)", L: "(7-seater / MPV)" };

const ADDONS = [
  { key: "fabric", name: "Fabric Seat Cleaning", price: 30, quantity: true, max: 4 },
  { key: "pet", name: "Pet Hair Removal", price: 50, label: "Pet Hair Removal (from $50, depends on condition)" },
  { key: "polish", name: "Polishing", price: 40 },
  { key: "headlight", name: "Headlight Polishing", price: 25, quantity: true, max: 2 },
  { key: "duraseal", name: "Duraseal Coating", price: 60 },
  { key: "oilfilm", name: "Oil Film Removal (Glass)", price: 40 },
  { key: "vomit", name: "Vomit Cleanup", price: 0 },
];

/* ===================== 单车卡片 ===================== */
function VehicleCard({ value, onChange, showDiscountOnCards }) {
  const pkg = PACKAGES.find((p) => p.id === value.packageId);

  const basePriceRaw = pkg && value.size ? pkg.price[value.size] : 0;
  const discountedBase = Math.max(
    0,
    basePriceRaw - (showDiscountOnCards ? NEW_USER_DISCOUNT : 0)
  );

  const addonEntries = Object.entries(value.addons || {});
  const addonLines = addonEntries
    .filter(([, v]) => v?.selected)
    .map(([k, v]) => {
      const meta = ADDONS.find((a) => a.key === k);
      const qty = meta?.quantity ? (v.qty || 1) : 1;
      const lineTotal = (meta?.price || 0) * qty;
      return {
        key: k,
        label: meta?.label || meta?.name,
        qty,
        price: meta?.price || 0,
        lineTotal,
      };
    });

  const addonsSubtotal = addonLines.reduce((s, l) => s + l.lineTotal, 0);
  const vehicleTotal = discountedBase + addonsSubtotal;

  const setPackage = (id) =>
    onChange({
      ...value,
      packageId: id,
      size: null,
      detailChoice: null,
      addons: {},
    });

  const setSize = (size) => onChange({ ...value, size });

  const toggleAddon = (key) => {
    const prev = value.addons || {};
    const cur = prev[key] || { selected: false, qty: 1 };
    const next = {
      ...prev,
      [key]: {
        ...cur,
        selected: !cur.selected,
        qty: cur.selected ? 1 : cur.qty || 1,
      },
    };
    onChange({ ...value, addons: next });
  };

  const changeQty = (key, delta) => {
    const meta = ADDONS.find((a) => a.key === key);
    const max = meta?.max || 4;
    const prev = value.addons || {};
    const cur = prev[key] || { selected: true, qty: 1 };
    const newQty = Math.min(Math.max(1, (cur.qty || 1) + delta), max);
    onChange({
      ...value,
      addons: { ...prev, [key]: { ...cur, selected: true, qty: newQty } },
    });
  };

  // ✅ 只有非 D 套餐，或 D 套餐已选择 Interior/Exterior 才显示“Add-ons + 明细”
  const canShowExtras = pkg && value.size && (pkg.id !== "D" || !!value.detailChoice);

  // 👉 “座椅清洗在非 C 套餐被选中时”的推荐提示
  const fabricSelectedOnNonC =
    pkg?.id !== "C" && Boolean(value.addons?.fabric?.selected);

  // 切换到 C 套餐（保留已选尺寸，清空附加项与 D 的内/外选择）
  const switchToC = () =>
    onChange({
      ...value,
      packageId: "C",
      // 保留 size 更符合用户预期
      size: value.size || null,
      detailChoice: null,
      addons: {}, // C 已包含全车织物清洗，清空附加项避免重复
    });

  // “卡片式”内/外选择样式
  const focusCardBase = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 10,
    border: "2px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    color: "#1e3a8a",
    userSelect: "none",
  };
  const focusCardActive = {
    borderColor: "#1e3a8a",
    boxShadow: "0 6px 16px rgba(30,58,138,.15)",
    background: "#ecf3ff",
  };

  return (
    <div className="package-details" style={{ marginTop: 16 }}>
      {/* 套餐切换（含介绍，移动端也显示） */}
      <div className="slider" style={{ marginTop: 8 }}>
        {PACKAGES.map((p) => (
          <div
            key={p.id}
            className={`package-card ${value.packageId === p.id ? "active" : ""}`}
            onClick={() => setPackage(p.id)}
          >
            <h3 className="package-name">{p.name}</h3>
            <p className="package-desc">{p.description}</p>
          </div>
        ))}
      </div>

      {/* 服务清单 */}
      <div className="columns">
        <div className="detail-block">
          <h4>Exterior Care</h4>
          <ul>
            {(pkg?.id === "D" && value.detailChoice === "Interior"
              ? []
              : pkg?.exterior || []
            ).map((item, i) => (
              <li key={`ext-${i}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="detail-block">
          <h4>Interior Care</h4>
          <ul>
            {(pkg?.id === "D" && value.detailChoice === "Exterior"
              ? []
              : pkg?.interior || []
            ).map((item, i) => (
              <li key={`int-${i}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 尺寸/价格 */}
      {pkg && (
        <div className="price-row">
          {Object.entries(pkg.price).map(([size, price], idx) => {
            const discounted = Math.max(
              0,
              price - (showDiscountOnCards ? NEW_USER_DISCOUNT : 0)
            );
            return (
              <div
                key={size}
                className={`price-tag ${value.size === size ? "active-size" : ""}`}
                onClick={() => setSize(size)}
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
                  <div className="price-line">
                    {showDiscountOnCards ? (
                      <>
                        <span className="old-price">${price}</span>
                        <span className="new-price">${discounted}</span>
                      </>
                    ) : (
                      <span className="new-price">${price}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* D 套餐：内/外选择 */}
      {pkg?.id === "D" && value.size && (
        <div className="detail-block" style={{ marginTop: 14 }}>
          <h4 style={{ marginBottom: 8 }}>Please select your cleaning focus:</h4>

          <div className="choice-row" style={{ gap: 12 }}>
            <label
              style={{
                ...focusCardBase,
                ...(value.detailChoice === "Interior" ? focusCardActive : {}),
              }}
            >
              <input
                type="radio"
                name={`detailChoice-${value.uid}`}
                value="Interior"
                checked={value.detailChoice === "Interior"}
                onChange={(e) => onChange({ ...value, detailChoice: e.target.value })}
                style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
              />
              <span role="img" aria-label="interior">🧼</span> Interior
            </label>

            <label
              style={{
                ...focusCardBase,
                ...(value.detailChoice === "Exterior" ? focusCardActive : {}),
              }}
            >
              <input
                type="radio"
                name={`detailChoice-${value.uid}`}
                value="Exterior"
                checked={value.detailChoice === "Exterior"}
                onChange={(e) => onChange({ ...value, detailChoice: e.target.value })}
                style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
              />
              <span role="img" aria-label="exterior">🚿</span> Exterior
            </label>
          </div>

          {!value.detailChoice && (
            <div style={{ marginTop: 10, color: "#9ca3af", fontSize: 14 }}>
              Select <strong>Interior</strong> or <strong>Exterior</strong> to continue…
            </div>
          )}
        </div>
      )}

      {/* Add-ons（两列布局）+ 小计 */}
      {canShowExtras && (
        <div className="addon-section">
          <div className="addon-title">Add-ons</div>

          {/* 👉 推荐 C 的提示条 */}
          {fabricSelectedOnNonC && (
            <div
              style={{
                marginBottom: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: "#fff7ed",         // 温和橙
                border: "1px solid #fed7aa",
                color: "#92400e",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span>For a full upholstery shampoo, we recommend <strong>Package C – Complete Shampoo Detailing</strong>.</span>
              <button
                type="button"
                onClick={switchToC}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #2563eb",
                  background: "#2563eb",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Switch to Package C
              </button>
            </div>
          )}

          <div className="addon-grid">
            {ADDONS.map((a) => {
              if (a.key === "fabric" && pkg.id === "C") return null; // C 不显示座椅清洗
              const selected = value.addons?.[a.key]?.selected;
              const qty = value.addons?.[a.key]?.qty || 1;
              return (
                <div
                  key={a.key}
                  className={`addon-item ${selected ? "selected" : ""}`}
                  onClick={() => toggleAddon(a.key)}
                >
                  <input type="checkbox" checked={!!selected} readOnly />
                  <label>
                    {a.label || a.name} {a.price > 0 ? ` - $${a.price}` : "(Varies by condition)"}
                  </label>
                  {a.quantity && selected && (
                    <div className="quantity-controls" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => changeQty(a.key, -1)}>-</button>
                      <span>{qty}</span>
                      <button onClick={() => changeQty(a.key, 1)}>+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 小计 */}
          <div className="total-price-display">
            <div className="total-row">
              <span>Base price</span>
              <span>${basePriceRaw}</span>
            </div>

            {showDiscountOnCards && (
              <div className="total-row discount">
                <span>New customer discount</span>
                <span>- ${NEW_USER_DISCOUNT}</span>
              </div>
            )}

            {pkg?.id === "D" && (
              <div className="total-row">
                <span>Cleaning focus</span>
                <span>{value.detailChoice || "-"}</span>
              </div>
            )}

            {addonLines.length > 0 && (
              <>
                <div className="total-row" style={{ marginTop: 6, fontWeight: 600 }}>
                  <span>Add-ons</span>
                  <span></span>
                </div>
                {addonLines.map((l) => (
                  <div className="total-row addon-line" key={l.key}>
                    <span>
                      {l.label}
                      {l.qty > 1 ? ` × ${l.qty}` : ""}
                    </span>
                    <span>${l.lineTotal}</span>
                  </div>
                ))}
              </>
            )}

            <div className="total-row grand">
              <span>Vehicle total</span>
              <span>${vehicleTotal}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== 多车总控（主组件） ===================== */
export default function LuxuryPackages() {
  const [vehicles, setVehicles] = useState(() => [
    {
      uid: crypto.randomUUID(),
      name: "",
      packageId: "A",
      size: null,
      detailChoice: null,
      addons: {},
    },
  ]);

  const [showBooking, setShowBooking] = useState(false);

  const addVehicle = () => {
    setVehicles((v) => [
      ...v,
      {
        uid: crypto.randomUUID(),
        name: "",
        packageId: "A",
        size: null,
        detailChoice: null,
        addons: {},
      },
    ]);
  };
  const removeVehicle = (uid) => setVehicles((v) => v.filter((x) => x.uid !== uid));
  const updateVehicle = (uid, next) => setVehicles((v) => v.map((x) => (x.uid === uid ? next : x)));

  // 真折扣车：第一辆“已选尺寸”的车辆
  const discountUid = useMemo(() => {
    const firstReady = vehicles.find((v) => v.size);
    return firstReady?.uid || null;
  }, [vehicles]);

  // 展示层：如果还没人选尺寸，就把折后价展示在第一辆卡片
  const displayDiscountUid = useMemo(
    () => discountUid ?? vehicles[0]?.uid ?? null,
    [discountUid, vehicles]
  );

  // 合计
  const grandTotal = useMemo(() => {
    return vehicles.reduce((sum, v) => {
      const pkg = PACKAGES.find((p) => p.id === v.packageId);
      if (!pkg || !v.size) return sum;
      const base = pkg.price[v.size];
      const isDiscounted = v.uid === discountUid;
      const discountedBase = Math.max(0, base - (isDiscounted ? NEW_USER_DISCOUNT : 0));
      const addonSum = Object.entries(v.addons || {}).reduce((s, [key, val]) => {
        if (!val.selected) return s;
        const meta = ADDONS.find((a) => a.key === key);
        const qty = meta?.quantity ? (val.qty || 1) : 1;
        return s + (meta?.price || 0) * qty;
      }, 0);
      return sum + discountedBase + addonSum;
    }, 0);
  }, [vehicles, discountUid]);

  // 订单行（给 BookingModal 摘要用）
  const orderLines = useMemo(() => {
    return vehicles.map((v, idx) => {
      const pkg = PACKAGES.find((p) => p.id === v.packageId);
      if (!pkg || !v.size) {
        return { key: v.uid, title: `Vehicle ${idx + 1}`, ready: false };
      }
      const base = pkg.price[v.size];
      const isDiscounted = v.uid === discountUid;
      const discount = isDiscounted ? Math.min(NEW_USER_DISCOUNT, base) : 0;
      const addonList = Object.entries(v.addons || {})
        .filter(([, val]) => val?.selected)
        .map(([key, val]) => {
          const meta = ADDONS.find((a) => a.key === key);
          const qty = meta?.quantity ? (val.qty || 1) : 1;
          const total = (meta?.price || 0) * qty;
          return { label: meta?.label || meta?.name, qty, total };
        });
      const addonsTotal = addonList.reduce((s, a) => s + a.total, 0);
      const subtotal = Math.max(0, base - discount) + addonsTotal;

      return {
        key: v.uid,
        title: v.name?.trim() ? v.name : `Vehicle ${idx + 1}`,
        pkgName: pkg.name,
        size: v.size,
        dChoice: pkg.id === "D" ? (v.detailChoice || "-") : null,
        base,
        discount,
        addons: addonList,
        subtotal,
        ready: true,
      };
    });
  }, [vehicles, discountUid]);

  const handleCheckout = () => {
    if (grandTotal <= 0) return;
    setShowBooking(true);
  };

  const handleBookingSubmit = (payload) => {
    console.log("BOOKING_PAYLOAD", payload);
    // 这里不再用 alert，交给 BookingForm 的 toast
  };

  return (
    <section className="luxury-section" style={{ paddingTop: 32 }}>
      <div className="luxury-container">
        <h2 className="section-title">Our Premium Packages</h2>
        <p className="section-subtitle">🎉 New customers enjoy $20 off their first vehicle</p>

        <div className="top-actions">
          <button className="open-addon-btn" onClick={addVehicle}>
            + Add another vehicle
          </button>
        </div>

        <div className="discount-banner" style={{ marginBottom: 20 }}>
          New customer discount <strong>$-{NEW_USER_DISCOUNT}</strong> applies to the first eligible vehicle only.
        </div>

        {vehicles.map((v, idx) => (
          <div key={v.uid} className="vehicle-block">
            <div className="vehicle-header">
              <div style={{ fontWeight: 700, color: "#1e3a8a" }}>
                {v.name ? v.name : `Vehicle ${idx + 1}`}
                {v.uid === discountUid ? "  •  New customer -$20" : ""}
              </div>
              {vehicles.length > 1 && (
                <button className="btn-ghost" onClick={() => removeVehicle(v.uid)}>
                  Remove
                </button>
              )}
            </div>

            <VehicleCard
              value={v}
              onChange={(next) => updateVehicle(v.uid, next)}
              showDiscountOnCards={v.uid === displayDiscountUid}
            />
          </div>
        ))}

        <div className="action-row">
          <button className="open-addon-btn" onClick={addVehicle}>
            + Add another vehicle
          </button>

          <div className="checkout-box">
            <div className="grand-total-label">Grand Total</div>
            <div className="grand-total-amount">${grandTotal}</div>
            <button
              className="primary-cta"
              disabled={grandTotal <= 0}
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      <BookingModal
        open={showBooking}
        onClose={() => setShowBooking(false)}
        onSubmit={handleBookingSubmit}
        grandTotal={grandTotal}
        orderLines={orderLines}
      />
    </section>
  );
}
