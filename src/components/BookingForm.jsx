// src/components/BookingForm.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import emailjs from "@emailjs/browser";
import { getAvailableSlots } from "../utils/availabilityClient"; // ✅ 返回本地时间的 Date[]

/* ===== EmailJS ===== */
const SERVICE_ID = "service_g9dym5v";
const TEMPLATE_ID_CODE = "template_noiq6ou";
const TEMPLATE_ID_CUSTOMER = "template_9jahz8r";

/* ===== Toast ===== */
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        background: toast.type === "error" ? "#fee2e2" : "#ecfdf5",
        color: toast.type === "error" ? "#991b1b" : "#065f46",
        border: `1px solid ${toast.type === "error" ? "#fecaca" : "#a7f3d0"}`,
        boxShadow: "0 10px 25px rgba(0,0,0,.15)",
        borderRadius: 12,
        padding: "12px 14px",
        maxWidth: 360,
        fontWeight: 600,
        cursor: "pointer",
      }}
      title="Click to dismiss"
    >
      {toast.message}
    </div>
  );
}

/* ===== 提交结果弹窗 ===== */
function ResultModal({ data, onClose }) {
  const modalRef = useRef(null);
  useEffect(() => {
    if (data && modalRef.current) {
      try {
        modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {}
    }
  }, [data]);

  if (!data) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 9998,
      }}
    >
      <div
        ref={modalRef}
        id="result-modal"
        style={{
          width: "min(520px, 92vw)",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 30px 80px rgba(0,0,0,.35)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderTop: "6px solid #1e3a8a",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>
            Booking submitted!
          </div>
        </div>

        <div style={{ padding: "14px 20px 2px", color: "#374151", lineHeight: 1.65 }}>
          <p style={{ margin: "6px 0" }}>
            Thanks <strong>{data.name}</strong>! We’ve received your booking for:
          </p>
          <p style={{ margin: "6px 0", fontWeight: 700 }}>{data.when}</p>
          <p style={{ margin: "6px 0" }}>
            A confirmation email has been sent to <strong>{data.email}</strong>.
          </p>
          {data.address && (
            <p style={{ margin: "6px 0" }}>
              Address: <strong>{data.address}</strong>{" "}
              {data.map_link && (
                <a
                  href={data.map_link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#1e3a8a", textDecoration: "none" }}
                >
                  (View on Google Maps)
                </a>
              )}
            </p>
          )}
          <p style={{ marginTop: 10 }}>
            Order ID: <strong>{data.order_id}</strong> ・ Grand Total:{" "}
            <strong>${data.grand_total}</strong>
          </p>
        </div>

        <div
          style={{
            padding: 16,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            background: "#fafafa",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <button
            onClick={onClose}
            className="bk-btn primary"
            style={{
              background: "#1e3a8a",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingModal({
  open,
  onClose,
  onSubmit,
  grandTotal = 0,
  orderLines = [],
}) {
  /* ===== 表单字段 ===== */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // 分离“日期（当天00:00） / 具体时间”
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateTime, setDateTime] = useState(null);

  /* ===== 可用时段 ===== */
  const [availableTimes, setAvailableTimes] = useState([]); // Date[]
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");

  /* ===== 验证码 ===== */
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [verified, setVerified] = useState(false);
  const [emailForCode, setEmailForCode] = useState("");
  const [codeSentAt, setCodeSentAt] = useState(null);
  const [verifyError, setVerifyError] = useState(""); // ✅ 新增：验证码错误内联提示

  const conversionFiredRef = useRef(false);

  /* ===== Toast / 结果弹窗 ===== */
  const [toast, setToast] = useState(null);
  const [resultModal, setResultModal] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (message, type = "ok", ms = 2400) => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  };

  /* ===== 倒计时 ===== */
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  /* ===== 弹窗定位 ===== */
  const modalRef = useRef(null);
  useEffect(() => {
    if (open && modalRef.current) {
      const t = setTimeout(() => {
        try {
          modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {}
      }, 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* ===== 校验 ===== */
  const phoneOk = useMemo(() => /^\+?[0-9()\-\s]{6,}$/.test(phone.trim()), [phone]);
  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);
  const addressOk = useMemo(() => address.trim().length >= 4, [address]);

  // 👉 强化：所选时间必须是“可用 slot”
  const isValid = useMemo(() => {
    const dtOk =
      dateTime &&
      dateTime instanceof Date &&
      !isNaN(dateTime.getTime());
    return (
      name.trim() &&
      phoneOk &&
      emailOk &&
      addressOk &&
      dtOk &&
      verified &&
      availableTimes.some((t) => t.getTime() === dateTime?.getTime())
    );
  }, [name, phoneOk, emailOk, addressOk, dateTime, verified, availableTimes]);

  /* ===== 预约时长（可按订单换算） ===== */
  const durationMin = useMemo(() => 90, [orderLines]);

  /* ===== 选中的 yyyy-mm-dd（本地时区） ===== */
  const selectedYmd = useMemo(() => {
    if (!selectedDate) return null;
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  /* ===== 生成营业时间 09:00–16:00 ===== */
  function genBusinessTimes(ymd, stepMin = 15, openHour = 9, closeHour = 16) {
    const [y, m, d] = ymd.split("-").map(Number);
    const start = new Date(y, m - 1, d, openHour, 0, 0, 0);
    const end = new Date(y, m - 1, d, closeHour, 0, 0, 0);
    const out = [];
    for (let t = new Date(start); t <= end; t = new Date(t.getTime() + stepMin * 60000)) {
      out.push(new Date(t));
    }
    return out;
  }

  // 当天营业时间白名单
  const businessTimes = useMemo(() => {
    if (!selectedYmd) return [];
    return genBusinessTimes(selectedYmd);
  }, [selectedYmd]);

  // 当天营业时间最小/最大（多一层保险）
  const { minTime, maxTime } = useMemo(() => {
    if (!selectedDate) return { minTime: null, maxTime: null };
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth();
    const d = selectedDate.getDate();
    return {
      minTime: new Date(y, m, d, 9, 0, 0, 0),
      maxTime: new Date(y, m, d, 16, 0, 0, 0),
    };
  }, [selectedDate]);

  /* === 隐藏营业时间外的时间项（沿用你已验证可行的做法） === */
  useEffect(() => {
    const STYLE_ID = "dp-out-of-hours-hide";
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `.react-datepicker__time-list-item.dp-out-of-hours{display:none !important;}`;
    document.head.appendChild(style);
  }, []);
  const isOutOfBusiness = (t) => {
    const h = t.getHours();
    const m = t.getMinutes();
    if (h < 9) return true;
    if (h > 16) return true;
    if (h === 16 && m > 0) return true;
    return false;
  };

  // 拉取可用时段
  useEffect(() => {
    if (!open || !selectedYmd) return;
    setLoadingSlots(true);
    setSlotError("");
    setAvailableTimes([]);

    getAvailableSlots(selectedYmd, durationMin)
      .then((slots) => setAvailableTimes(slots || []))
      .catch((e) => {
        console.error(e);
        setSlotError("Failed to load availability.");
      })
      .finally(() => setLoadingSlots(false));
  }, [open, selectedYmd, durationMin]);

  // 计算“禁用的（已占用）时间”
  const availableSet = useMemo(
    () => new Set(availableTimes.map((d) => d.getTime())),
    [availableTimes]
  );
  const excludeTimes = useMemo(
    () => businessTimes.filter((t) => !availableSet.has(t.getTime())),
    [businessTimes, availableSet]
  );

  // ✅ 新增：当天是否“全满”
  const fullyBooked = useMemo(() => {
    if (!selectedYmd || loadingSlots) return false;
    return businessTimes.length > 0 && availableTimes.length === 0;
  }, [selectedYmd, loadingSlots, businessTimes.length, availableTimes.length]);

  // ✅ 新增守护：一旦全满，清空残留的时间，避免 9:00 留存
  useEffect(() => {
    if (fullyBooked && dateTime) {
      setDateTime(null);
    }
  }, [fullyBooked, dateTime]);

  // 选日后自动选当天最早可约时间（避免 00:00 / 双击）
  const autoPickedDayRef = useRef(null);
  useEffect(() => {
    if (!open || !selectedYmd || !businessTimes.length) return;
    if (fullyBooked) {
      setDateTime(null);
      return;
    }

    const firstAvail = businessTimes.find((t) => availableSet.has(t.getTime()));

    const sameDaySelected =
      dateTime &&
      selectedDate &&
      dateTime.getFullYear() === selectedDate.getFullYear() &&
      dateTime.getMonth() === selectedDate.getMonth() &&
      dateTime.getDate() === selectedDate.getDate();

    if (sameDaySelected && availableSet.has(dateTime.getTime())) return;

    if (firstAvail && autoPickedDayRef.current !== selectedYmd) {
      setDateTime(new Date(firstAvail));
      autoPickedDayRef.current = selectedYmd;
    }
  }, [open, selectedYmd, businessTimes, availableSet, dateTime, selectedDate, fullyBooked]);

  /* ===== 订单表 HTML ===== */
  function buildOrderTable(lines = []) {
    const rows = (lines || [])
      .filter((l) => l.ready)
      .map((l) => {
        const addons = (l.addons || [])
          .map(
            (a) => `
            <tr>
              <td style="padding:2px 4px 2px 16px;color:#374151;">• ${a.label}${
              a.qty > 1 ? ` × ${a.qty}` : ""
            }</td>
              <td style="padding:2px 4px;text-align:right;white-space:nowrap;color:#374151;">$${a.total}</td>
            </tr>`
          )
          .join("");

        return `
          <table style="width:100%;border-collapse:collapse;margin:8px 0;border-bottom:1px solid #eee">
            <tr>
              <td style="padding:6px 4px;font-weight:700;color:#1e3a8a">
                ${l.title} — ${l.pkgName} (${l.size}) ${l.dChoice ? `· ${l.dChoice}` : ""}
              </td>
              <td style="padding:6px 4px;text-align:right;white-space:nowrap;color:#1e3a8a;font-weight:700">$${l.subtotal}</td>
            </tr>
            <tr>
              <td style="padding:2px 4px;color:#6b7280">Base</td>
              <td style="padding:2px 4px;text-align:right;white-space:nowrap;color:#6b7280">$${l.base}</td>
            </tr>
            ${addons}
          </table>`;
      })
      .join("");

    return rows || `<div style="color:#6b7280">No items</div>`;
  }

  /* ===== 发送验证码 ===== */
  const handleSendCode = async () => {
    if (!emailOk) {
      showToast("Please enter a valid email first.", "error");
      return;
    }
    setSendingCode(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      await emailjs.send(SERVICE_ID, TEMPLATE_ID_CODE, {
        to_email: email.trim(),
        name: name || "Customer",
        code,
      });

      setGeneratedCode(code);
      setEmailForCode(email.trim());
      setCodeSent(true);
      setVerified(false);
      setResendIn(60);
      setCodeSentAt(Date.now());
      setVerifyError(""); // ✅ 清空错误
      showToast("Verification code sent. Check inbox / spam.");
    } catch (err) {
      console.error("EmailJS error:", err?.status, err?.text || err?.message, err);
      showToast("Failed to send the code. Please try again.", "error");
    } finally {
      setSendingCode(false);
    }
  };

  /* ===== 校验验证码 ===== */
  const handleVerify = () => {
    if (!codeSent) return;

    if (email.trim() !== emailForCode) {
      setVerified(false);
      setVerifyError("Email changed. Please send the code again.");
      showToast("Email changed. Please send the code again.", "error");
      return;
    }

    if (!codeSentAt || Date.now() - codeSentAt > 10 * 60 * 1000) {
      setVerified(false);
      setVerifyError("The code expired. Please resend.");
      showToast("The code expired. Please resend.", "error");
      return;
    }

    if (codeInput.trim() === generatedCode && generatedCode) {
      setVerified(true);
      setVerifyError("");
      showToast("Email verified.");
    } else {
      setVerified(false);
      setVerifyError("Invalid code. Please try again.");
      showToast("Invalid code. Please try again.", "error");
    }
  };

  /* ===== 提交 ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    onSubmit?.({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      dateTimeISO: dateTime.toISOString(),
      grandTotal,
      orderLines,
    });

    const date_time_human = new Date(dateTime).toLocaleString("en-NZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const map_link = address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : "";
    const order_id = `DL-${Date.now()}`;
    const order_table = buildOrderTable(orderLines);

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID_CUSTOMER, {
        email: email.trim(),
        name,
        phone,
        date_time_human,
        address,
        map_link,
        order_id,
        grand_total: grandTotal,
        order_table,
      });

      // Google Ads 转化上报
      if (!conversionFiredRef.current) {
        try {
          if (typeof window !== "undefined" && typeof window.gtag === "function") {
            window.gtag("event", "conversion", {
              send_to: "AW-17460884767/X3BoCIui3oQbEJ_q_4VB",
            });
          }
          conversionFiredRef.current = true;
        } catch (e2) {
          console.warn("Conversion report failed:", e2);
        }
      }

      setResultModal({
        name,
        email,
        address,
        map_link,
        when: date_time_human,
        order_id,
        grand_total: grandTotal,
      });

      try {
        window.history.pushState({}, "", "/booking-confirmed");
      } catch {}

      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {}
    } catch (err) {
      console.error("EmailJS send failed:", err?.status, err?.text || err?.message, err);
      showToast("Failed to send emails. Please try again.", "error");
    }
  };

  /* ===== DatePicker 选择值（用于显示） ===== */
  const pickerSelected = dateTime || selectedDate || null;

  const todayStart = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0, 0);
  }, []);

  const bookingVisibility = resultModal ? "hidden" : "visible";

  if (!open) return null;

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ResultModal
        data={resultModal}
        onClose={() => {
          setResultModal(null);
          onClose?.();
          try {
            window.history.pushState({}, "", "/");
          } catch {}
          window.location.reload();
        }}
      />

      <div
        className="bk-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Booking form"
        style={{ visibility: bookingVisibility }}
      >
        <div className="bk-modal" ref={modalRef}>
          <div className="bk-head">
            <h3>Booking Information</h3>
            <button className="bk-close" onClick={onClose} aria-label="Close booking">
              ×
            </button>
          </div>

          <div className="bk-summary">
            <div className="bk-summary-title">Order summary</div>
            {orderLines
              .filter((l) => l.ready)
              .map((l) => (
                <div className="bk-line" key={l.key}>
                  <div className="bk-line-top">
                    <span className="bk-line-title">{l.title}</span>
                    <span className="bk-line-amount">${l.subtotal}</span>
                  </div>
                  <div className="bk-line-sub">
                    <span>
                      {l.pkgName} — {l.size}
                    </span>
                    <span>${l.base}</span>
                  </div>
                  {l.dChoice && (
                    <div className="bk-line-sub">
                      <span>Cleaning focus</span>
                      <span>{l.dChoice}</span>
                    </div>
                  )}
                  {l.addons?.length > 0 &&
                    l.addons.map((a, i) => (
                      <div className="bk-line-sub" key={i}>
                        <span>
                          {a.label}
                          {a.qty > 1 ? ` × ${a.qty}` : ""}
                        </span>
                        <span>${a.total}</span>
                      </div>
                    ))}
                </div>
              ))}
            <div className="bk-grand">
              <span>Grand Total</span>
              <span>${grandTotal}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bk-form">
            <label className="bk-label">
              Name
              <input
                className={`bk-input ${name.trim() ? "" : "is-invalid"}`}
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label className="bk-label">
              Phone
              <input
                className={`bk-input ${phone ? (phoneOk ? "" : "is-invalid") : ""}`}
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </label>

            <label className="bk-label" style={{ gridColumn: "1 / -1" }}>
              Email
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className={`bk-input ${email ? (emailOk ? "" : "is-invalid") : ""}`}
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setVerified(false);
                    setVerifyError(""); // 改邮箱时清理错误
                  }}
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="bk-btn ghost"
                  onClick={handleSendCode}
                  disabled={!emailOk || sendingCode || resendIn > 0}
                  title={!emailOk ? "Enter a valid email first" : ""}
                >
                  {sendingCode ? "Sending..." : resendIn > 0 ? `Resend (${resendIn}s)` : "Send code"}
                </button>
              </div>

              {codeSent && (
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className={`bk-input ${verifyError ? "is-invalid" : ""}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={codeInput}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        setCodeInput(v);
                        setVerifyError("");
                        setVerified(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && codeInput?.length === 6 && codeSent) {
                          handleVerify();
                        }
                      }}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="bk-btn primary"
                      onClick={handleVerify}
                      disabled={!codeInput || codeInput.length < 6 || !codeSent}
                    >
                      Verify
                    </button>
                  </div>
                  {verifyError && (
                    <div className="bk-error" style={{ marginTop: 4 }}>
                      {verifyError}
                    </div>
                  )}
                </div>
              )}
              {verified && (
                <div style={{ marginTop: 6, color: "#0a7a1f", fontWeight: 600 }}>✅ Email verified</div>
              )}
            </label>

            <label className="bk-label" style={{ gridColumn: "1 / -1" }}>
              Address
              <input
                className={`bk-input ${address ? (addressOk ? "" : "is-invalid") : ""}`}
                type="text"
                placeholder="Enter the address for the service"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </label>

            <label className="bk-label">
              Preferred date &amp; time
              <DatePicker
                selected={pickerSelected}
                onChange={(d) => {
                  if (!d) return;
                  const isChoosingTime = d.getHours() !== 0 || d.getMinutes() !== 0;
                  const dayOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
                  // 单击日期：立即切换日期
                  setSelectedDate(dayOnly);
                  if (isChoosingTime) {
                    // 直接点了时间
                    setDateTime(new Date(d));
                  } else {
                    // 只换了日期 → 等自动选“当天最早可约”
                    setDateTime(null);
                    autoPickedDayRef.current = null;
                  }
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy HH:mm"
                className="bk-input"
                minDate={todayStart}
                placeholderText={
                  !selectedYmd
                    ? "Pick date & time"
                    : loadingSlots
                    ? "Checking availability..."
                    : fullyBooked
                    ? "Fully booked"
                    : "Pick time"
                }
                // 营业时间白名单 + 已占用置灰
                includeTimes={businessTimes}
                excludeTimes={excludeTimes}
                minTime={minTime}
                maxTime={maxTime}
                popperClassName="bk-datepicker-popper"
                // 隐藏营业时间外的选项
                timeClassName={(t) => (isOutOfBusiness(t) ? "dp-out-of-hours" : undefined)}
              />
              {slotError && <div className="bk-error">{slotError}</div>}
            </label>

            <div className="bk-actions" style={{ gridColumn: "1 / -1" }}>
              <button type="button" className="bk-btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="bk-btn primary" disabled={!isValid}>
                Submit booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
