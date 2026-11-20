"use client";

import { useState } from "react";
import Link from "next/link";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Photos", href: "/photos" },
    { name: "FAQ", href: "/faq" },
    { name: "Registry", href: "/registry" },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  return (
    <>
      <nav className="main-nav">
        <Link href="/" className="nav-header">
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

      {isOpen && (
        <div className="fullscreen-menu">
          <button className="menu-close" onClick={closeMenu} aria-label="Close menu">
            ×
          </button>
          <div className="menu-links-container">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenu}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
