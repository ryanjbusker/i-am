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
        <Link href="/" className="nav-logo">
          R &amp; E
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

      {isOpen && <div className="menu-overlay" onClick={closeMenu}></div>}

      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>
          <Link href="/rsvp" onClick={closeMenu}>
            RSVP
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
    </>
  );
}
