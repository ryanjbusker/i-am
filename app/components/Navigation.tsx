"use client";

import { useState } from "react";
import Link from "next/link";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav className="main-nav">
        <Link href="/" className="nav-header">
          Ryan and Eleanor
        </Link>
        <button
          className="hamburger"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {isOpen && (
        <div className="fullscreen-menu">
          <div className="menu-image-side">
            <div className="image-placeholder">
              <div className="placeholder-flowers">
                <span className="flower-icon">🌸</span>
                <span className="flower-icon">🌺</span>
                <span className="flower-icon">🌼</span>
                <span className="flower-icon">🌻</span>
                <span className="flower-icon">🌷</span>
              </div>
              <p className="placeholder-text">Image will be placed here</p>
            </div>
          </div>
          <div className="menu-options-side">
            <button className="menu-close" onClick={closeMenu} aria-label="Close menu">
              ×
            </button>
            <div className="menu-links-container">
              <Link href="/" onClick={closeMenu}>
                Home
              </Link>
              <Link href="/photos" onClick={closeMenu}>
                Photos
              </Link>
              <Link href="/faq" onClick={closeMenu}>
                FAQ
              </Link>
              <Link href="/registry" onClick={closeMenu}>
                Registry
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
