import React, { useState, useEffect, useRef } from "react";
import "./HomePage.css";
import Carousel from "./Carousel";
import LuxuryPackages from "./LuxuryPackages";
import Pricing from "./Pricing";

const heroImages = ["/images/wash1.jpg", "/images/wash2.jpg", "/images/wash3.jpg", "/images/wash4.jpg"];

export default function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const headerRef = useRef(null);
  let lastScrollY = 0;

  // 自动轮播背景图
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 滚动隐藏导航栏
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 80) setShowHeader(false);
      else setShowHeader(true);
      lastScrollY = currentY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // logo 弹跳动画
  const handleLogoClick = () => {
    const logo = document.querySelector(".site-logo");
    if (!logo) return;
    logo.classList.remove("bounce-once");
    void logo.offsetWidth;
    logo.classList.add("bounce-once");
  };

  // 平滑滚到某个 id（考虑固定头部的高度）
  const smoothScrollTo = (id) => (e) => {
    e?.preventDefault?.();
    const target = document.getElementById(id);
    if (!target) return;

    const headerHeight = headerRef.current?.offsetHeight || 0;
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8; // 额外留点空隙
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
      <header ref={headerRef} className={`site-header ${showHeader ? "" : "hide-on-scroll"}`}>
        <div className="site-header-left">
          <img src="/logo.png" alt="Detail Lab Logo" className="site-logo" onClick={handleLogoClick} />
          <span className="brand-name">
            <span className="brand-bold">Detail Lab</span> Car Wash
          </span>
        </div>
        <nav className="site-nav">
          <a href="#services" onClick={smoothScrollTo("services")}>Services</a>
          <a href="#pricing" onClick={smoothScrollTo("pricing")}>Pricing</a>
          <a href="#contact" onClick={smoothScrollTo("contact")}>Contact</a>
        </nav>
      </header>

      <div className="homepage fade-in">
        <section
          className="hero-banner"
          style={{ backgroundImage: `url(${heroImages[currentImageIndex]})` }}
        >
          <div className="hero-overlay">
            <div className="hero-content">
              <h1 className="hero-title">Premium Mobile Car Wash</h1>
              <p className="hero-subtitle">Eco-Friendly • Hand-Finished • At Your Doorstep</p>
              {/* 这里改成跳到 LuxuryPackages 所在的 #services */}
              <a href="#services" className="hero-button" onClick={smoothScrollTo("services")}>
                Book Now
              </a>
            </div>
          </div>
        </section>

        <section id="services" className="section fade-in">
          <LuxuryPackages />
        </section>

        <Carousel />

        <section id="pricing" className="section fade-in">
          <Pricing />
        </section>

        <section id="contact" className="section contact-section fade-in">
          <h3 className="section-title">Contact Us</h3>
          <p><strong>📞 Phone:</strong> 021 056 9202</p>
          <p><strong>📧 Email:</strong> detaillabcarwash@gmail.com</p>
          <p><strong>📍 Service Area:</strong> Auckland - Mobile Car Wash</p>
        </section>
      </div>

      <footer className="site-footer">
        &copy; {new Date().getFullYear()} Detail Lab Car Wash. All rights reserved.
      </footer>
    </>
  );
}

