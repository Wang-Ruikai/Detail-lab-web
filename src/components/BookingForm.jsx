// src/components/BookingForm.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import emailjs from "@emailjs/browser";

// ---- EmailJS（与你项目一致）----
const SERVICE_ID = "service_g9dym5v";
const TEMPLATE_ID_CODE = "template_noiq6ou";
const TEMPLATE_ID_CUSTOMER = "template_9jahz8r";
const TEMPLATE_ID_ADMIN = "template_o7gjjgh";

// ---------- Toast（不改页面布局） ----------
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

// ---------- 提交成功弹窗（不改原主弹窗结构） ----------
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
  // 表单字段
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [dateTime, setDateTime] = useState(null); // 默认空

  // 验证码状态
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [verified, setVerified] = useState(false);
  const [emailForCode, setEmailForCode] = useState("");
  const [codeSentAt, setCodeSentAt] = useState(null);

  // ✅ 防止重复上报转化
  const conversionFiredRef = useRef(false);

  // Toast / 结果弹窗
  const [toast, setToast] = useState(null);
  const [resultModal, setResultModal] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (message, type = "ok", ms = 2400) => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  };

  // 倒计时
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  // 弹窗定位（保持你原来的滚动定位）
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

  // 校验
  const phoneOk = useMemo(() => /^\+?[0-9()\-\s]{6,}$/.test(phone.trim()), [phone]);
  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);
  const addressOk = useMemo(() => address.trim().length >= 4, [address]);

  const isValid = useMemo(() => {
    return (
      name.trim() &&
      phoneOk &&
      emailOk &&
      addressOk &&
      dateTime &&
      dateTime instanceof Date &&
      !isNaN(dateTime.getTime()) &&
      verified
    );
  }, [name, phoneOk, emailOk, addressOk, dateTime, verified]);

  if (!open) return null;

  // 营业时间 09:00–17:00（15 分钟步进）
  const generateBusinessTimes = (baseDate) => {
    const base = baseDate || new Date();
    const times = [];
    const start = new Date(base);
    start.setHours(9, 0, 0, 0);
    const end = new Date(base);
    end.setHours(17, 0, 0, 0);
    while (start <= end) {
      times.push(new Date(start));
      start.setMinutes(start.getMinutes() + 15);
    }
    return times;
  };

  // 订单表 HTML 注入
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
            ${
              l.discount > 0
                ? `
              <tr>
                <td style="padding:2px 4px;color:#0a7a1f">New customer discount</td>
                <td style="padding:2px 4px;text-align:right;white-space:nowrap;color:#0a7a1f">- $${l.discount}</td>
              </tr>`
                : ""
            }
            ${addons}
          </table>`;
      })
      .join("");

    return rows || `<div style="color:#6b7280">No items</div>`;
  }

  // 发送验证码
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
      showToast("Verification code sent. Check inbox / spam.");
    } catch (err) {
      console.error("EmailJS error:", err?.status, err?.text || err?.message, err);
      showToast("Failed to send the code. Please try again.", "error");
    } finally {
      setSendingCode(false);
    }
  };

  // 校验验证码（10分钟有效）
  const handleVerify = () => {
    if (!codeSent) return;
    if (email.trim() !== emailForCode) {
      showToast("Email changed. Please send the code again.", "error");
      return;
    }
    if (!codeSentAt || Date.now() - codeSentAt > 10 * 60 * 1000) {
      setVerified(false);
      showToast("The code expired. Please resend.", "error");
      return;
    }
    if (codeInput.trim() === generatedCode && generatedCode) {
      setVerified(true);
      showToast("Email verified.");
    } else {
      setVerified(false);
      showToast("Invalid code. Please try again.", "error");
    }
  };

  // 提交（两封邮件）
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

      await emailjs.send(SERVICE_ID, TEMPLATE_ID_ADMIN, {
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

      // ✅ 两封邮件都成功后：上报 Google Ads 转化（只触发一次）
      if (!conversionFiredRef.current) {
        try {
          if (typeof window !== "undefined" && typeof window.gtag === "function") {
            window.gtag("event", "conversion", {
              send_to: "AW-17460884767/X3BoCIui3oQbEJ_q_4VB",
            });
          }
          conversionFiredRef.current = true;
        } catch (e) {
          console.warn("Conversion report failed:", e);
        }
      }

      // 显示结果弹窗
      setResultModal({
        name,
        email,
        address,
        map_link,
        when: date_time_human,
        order_id,
        grand_total: grandTotal,
      });

      // 修改地址栏为“确认页”URL（不跳转）
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

  // 当显示结果弹窗时，隐藏背后的预约弹窗（不改变原样式类）
  const bookingVisibility = resultModal ? "hidden" : "visible";

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ResultModal
        data={resultModal}
        onClose={() => {
          setResultModal(null);
          onClose?.();
          // 关闭时把 URL 改回首页，再刷新
          try {
            window.history.pushState({}, "", "/");
          } catch {}
          window.location.reload();
        }}
      />

      {/* 预约弹窗（保持原布局 class），仅在结果弹窗出现时可见性隐藏 */}
      <div
        className="bk-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Booking form"
        style={{ visibility: bookingVisibility }}
      >
        <div className="bk-modal" ref={modalRef}>
          {/* 头部 */}
          <div className="bk-head">
            <h3>Booking Information</h3>
            <button className="bk-close" onClick={onClose} aria-label="Close booking">
              ×
            </button>
          </div>

          {/* 订单摘要（结构不变） */}
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
                  {l.discount > 0 && (
                    <div className="bk-line-sub bk-discount">
                      <span>New customer discount</span>
                      <span>- ${l.discount}</span>
                    </div>
                  )}
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

          {/* 表单（结构不变） */}
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
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input
                    className="bk-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ""))}
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
                selected={dateTime}
                onChange={(d) => {
                  if (!d) return;
                  const next = new Date(d);
                  // 如果用户第一次只点了日期（时间=00:00），或之前没选过时间，则默认 09:00
                  if (!dateTime || (d.getHours() === 0 && d.getMinutes() === 0)) {
                    next.setHours(9, 0, 0, 0);
                  }
                  setDateTime(next);
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy HH:mm"
                className="bk-input"
                minDate={new Date()}
                includeTimes={generateBusinessTimes(dateTime || new Date())}
                placeholderText="Pick date & time"
              />
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
