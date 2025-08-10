// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// ✳️ 全局初始化 EmailJS（只调用一次）
import emailjs from '@emailjs/browser';
emailjs.init({
  publicKey: 'fpTjoSYVlbOugyUfF',     // ← 你的 Public Key
  blockHeadless: true,                 // 可选：拦截爬虫
  limitRate: { id: 'booking-otp', throttle: 10000 }, // 可选：10s 限流一次
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
