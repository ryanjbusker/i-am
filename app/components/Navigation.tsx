"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredImage, setHoveredImage] = useState("/images/120402bc-c76e-4ea3-87e9-106d517f0ef7.jpg");

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const menuItems = [
    { name: "Home", href: "/", image: "/images/120402bc-c76e-4ea3-87e9-106d517f0ef7.jpg" },
    { name: "Schedule", href: "/schedule", image: "/images/91975f14-4bdf-4db3-bf0d-92949cf315ef.jpg" },
    { name: "Photos", href: "/photos", image: "/images/49bf1c0c-2c84-4f33-b4ca-92a0cf1427dd.jpg" },
    { name: "FAQ", href: "/faq", image: "/images/d92414f4-53d8-4fae-895a-a35d15e94606.jpg" },
    { name: "Registry", href: "/registry", image: "/images/8a44eb89-d550-4a0f-97f4-580de7e01b13.jpg" },
  ];

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
          <div className="menu-image-side">
            <Image
              src={hoveredImage}
              alt="Ryan and Eleanor"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <div className="menu-options-side">
            <button className="menu-close" onClick={closeMenu} aria-label="Close menu">
              ×
            </button>
            <div className="menu-links-container">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  onMouseEnter={() => setHoveredImage(item.image)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
