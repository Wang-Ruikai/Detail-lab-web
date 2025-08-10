// src/components/BookingForm.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import emailjs from "@emailjs/browser";

/**
 * BookingModal
 * - 邮箱验证码（10分钟有效）
 * - 只显示营业时间 09:00–17:00（15 分钟步进）
 * - Address 必填
 * - 提交后发送：客户确认 + 管理员通知
 *
 * 重要：
 * - main.jsx 里务必已 init： emailjs.init({ publicKey: "fpTjoSYVIbOugyUfF" })
 * - EmailJS Security → Domains 包含：本地 http://localhost:5173 和线上两域名
 */

// ===== EmailJS 配置（你的实际值）=====
const SERVICE_ID = "service_g9dym5v";
const TEMPLATE_ID_CODE = "template_noiq6ou";     // 验证码（模板 To Email = {{to_email}})
const TEMPLATE_ID_CUSTOMER = "template_9jahz8r"; // 客户确认（模板 To Email = {{email}})
const TEMPLATE_ID_ADMIN = "template_o7gjjgh";    // 管理员通知（模板里 To Email 写死为 admin 邮箱）

export default function BookingModal({
  open,
  onClose,
  onSubmit,
  grandTotal = 0,
  orderLines = [],
}) {
  // ===== 表单字段 =====
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // 默认不选时间（输入框为空）
  const [dateTime, setDateTime] = useState(null);

  // ===== 验证码状态 =====
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [resendIn, setResendIn] = useState(0); // 60s 倒计时
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [verified, setVerified] = useState(false);
  const [emailForCode, setEmailForCode] = useState(""); // 发码时的邮箱
  const [codeSentAt, setCodeSentAt] = useState(null);   // 发码时间戳

  // 60s 倒计时
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  // 弹窗定位
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

  // ===== 校验 =====
  const phoneOk = useMemo(() => /^\+?[0-9()\-\s]{6,}$/.test(phone.trim()), [phone]);
  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);
  const addressOk = useMemo(() => address.trim().length >= 4, [address]);

  const isValid = useMemo(() => {
    return (
      name.trim() &&
      phoneOk &&
      emailOk &&
      addressOk &&
      dateTime && dateTime instanceof Date && !isNaN(dateTime.getTime()) &&
      verified
    );
  }, [name, phoneOk, emailOk, addressOk, dateTime, verified]);

  if (!open) return null;

  // ===== 仅生成营业时间（09:00–17:00，15 分钟步进）=====
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

  // ===== 客户邮件的订单明细 HTML（注入 {{{order_table}}}）=====
  function buildOrderTable(lines = []) {
    const rows = (lines || [])
      .filter(l => l.ready)
      .map(l => {
        const addons = (l.addons || [])
          .map(a => `
            <tr>
              <td style="padding:2px 4px 2px 16px;color:#374151;">• ${a.label}${a.qty>1?` × ${a.qty}`:""}</td>
              <td style="padding:2px 4px;text-align:right;white-space:nowrap;color:#374151;">$${a.total}</td>
            </tr>`).join("");

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
            ${l.discount>0 ? `
              <tr>
                <td style="padding:2px 4px;color:#0a7a1f">New customer discount</td>
                <td style="padding:2px 4px;text-align:right;white-space:nowrap;color:#0a7a1f">- $${l.discount}</td>
              </tr>` : ""}
            ${addons}
          </table>`;
      }).join("");

    return rows || `<div style="color:#6b7280">No items</div>`;
  }

  // ===== 发送验证码（模板 To Email = {{to_email}}）=====
  const handleSendCode = async () => {
    if (!emailOk) {
      alert("Please enter a valid email first.");
      return;
    }
    setSendingCode(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID_CODE,
        {
          to_email: email.trim(),
          name: name || "Customer",
          code,
        }
      );

      setGeneratedCode(code);
      setEmailForCode(email.trim());
      setCodeSent(true);
      setVerified(false);
      setResendIn(60);
      setCodeSentAt(Date.now());
      alert("Verification code sent. Please check your inbox (or Spam/Promotions).");
    } catch (err) {
      console.error("EmailJS error:", err?.status, err?.text || err?.message, err);
      alert("Failed to send the code. Please try again.");
    } finally {
      setSendingCode(false);
    }
  };

  // ===== 校验验证码（10分钟有效）=====
  const handleVerify = () => {
    if (!codeSent) return;
    if (email.trim() !== emailForCode) {
      alert("The email has changed. Please send the code again.");
      return;
    }
    if (!codeSentAt || Date.now() - codeSentAt > 10 * 60 * 1000) {
      alert("The code has expired. Please resend a new one.");
      setVerified(false);
      return;
    }
    if (codeInput.trim() === generatedCode && generatedCode) {
      setVerified(true);
      alert("Email verified successfully.");
    } else {
      setVerified(false);
      alert("Invalid code. Please try again.");
    }
  };

  // ===== 提交：发两封邮件（客户 + 管理员）=====
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
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
    const map_link = address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : "";
    const order_id = `DL-${Date.now()}`;
    const order_table = buildOrderTable(orderLines);

    try {
      // ① 客户确认（模板 To Email = {{email}}）
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID_CUSTOMER,
        {
          email: email.trim(),
          name,
          phone,
          date_time_human,
          address,
          map_link,
          order_id,
          grand_total: grandTotal,
          order_table,
        }
      );

      // ② 管理员通知（模板 To Email 已写死）
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID_ADMIN,
        {
          email: email.trim(), // 作为 Reply-To 等变量
          name,
          phone,
          date_time_human,
          address,
          map_link,
          order_id,
          grand_total: grandTotal,
          order_table,
        }
      );

      alert("Booking submitted! Emails have been sent.");
      onClose?.();
    } catch (err) {
      console.error("EmailJS send failed:", err?.status, err?.text || err?.message, err);
      alert("Failed to send emails. Please try again.");
    }
  };

  return (
    <div className="bk-overlay" role="dialog" aria-modal="true" aria-label="Booking form">
      <div className="bk-modal" ref={modalRef}>
        {/* 头部 */}
        <div className="bk-head">
          <h3>Booking Information</h3>
          <button className="bk-close" onClick={onClose} aria-label="Close booking">
            ×
          </button>
        </div>

        {/* 订单摘要 */}
        <div className="bk-summary">
          <div className="bk-summary-title">Order summary</div>
          {orderLines.filter(l => l.ready).map((l) => (
            <div className="bk-line" key={l.key}>
              <div className="bk-line-top">
                <span className="bk-line-title">{l.title}</span>
                <span className="bk-line-amount">${l.subtotal}</span>
              </div>
              <div className="bk-line-sub">
                <span>{l.pkgName} — {l.size}</span>
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
              {l.addons?.length > 0 && l.addons.map((a, i) => (
                <div className="bk-line-sub" key={i}>
                  <span>{a.label}{a.qty > 1 ? ` × ${a.qty}` : ""}</span>
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

        {/* 表单 */}
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
                  setVerified(false); // 改邮箱需重新验证
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
              <div style={{ marginTop: 6, color: "#0a7a1f", fontWeight: 600 }}>
                ✅ Email verified
              </div>
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
              selected={dateTime}                                // 为空时显示为空
              onChange={(d) => d && setDateTime(d)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy HH:mm"
              className="bk-input"
              minDate={new Date()}
              includeTimes={generateBusinessTimes(dateTime || new Date())} // 仅显示营业时间
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
  );
}
