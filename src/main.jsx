// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// ---- ① 注入 Google Ads 全局代码（gtag.js） ----
(function injectGtag() {
  // 避免重复注入
  if (window.__gtagInjected) return;
  window.__gtagInjected = true;

  // 加载 gtag.js
  const s1 = document.createElement('script');
  s1.async = true;
  s1.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17460884767';
  document.head.appendChild(s1);

  // 初始化 gtag
  const s2 = document.createElement('script');
  s2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'AW-17460884767');
  `;
  document.head.appendChild(s2);
})();

// ---- ② 全局初始化 EmailJS（只调用一次）----
import emailjs from '@emailjs/browser';
emailjs.init({
  publicKey: 'fpTjoSYVlbOugyUfF',
  blockHeadless: true,
  limitRate: { id: 'booking-otp', throttle: 10000 },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
