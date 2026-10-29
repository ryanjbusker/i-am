"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredImage, setHoveredImage] = useState("/images/120402bc-c76e-4ea3-87e9-106d517f0ef7.webp");
  const [decodedImages, setDecodedImages] = useState<Set<string>>(new Set());
  const imageRefs = useRef<Map<string, HTMLImageElement>>(new Map());

  const menuItems = [
    { name: "Home", href: "/", image: "/images/120402bc-c76e-4ea3-87e9-106d517f0ef7.webp" },
    { name: "Photos", href: "/photos", image: "/images/49bf1c0c-2c84-4f33-b4ca-92a0cf1427dd.webp" },
    { name: "FAQ", href: "/faq", image: "/images/d92414f4-53d8-4fae-895a-a35d15e94606.webp" },
    { name: "Registry", href: "/registry", image: "/images/8a44eb89-d550-4a0f-97f4-580de7e01b13.webp" },
  ];

  useEffect(() => {
    const decodeImages = async () => {
      const decoded = new Set<string>();
      
      for (const item of menuItems) {
        const img = imageRefs.current.get(item.image);
        if (img && img.complete) {
          try {
            await img.decode();
            decoded.add(item.image);
          } catch (err) {
            console.error(`Failed to decode ${item.image}:`, err);
          }
        }
      }
      
      setDecodedImages(decoded);
    };

    decodeImages();
  }, []);

  const handleHover = (image: string) => {
    if (decodedImages.has(image)) {
      setHoveredImage(image);
    }
  };

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

      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        {menuItems.map((item) => (
          <img
            key={item.image}
            ref={(el) => {
              if (el) imageRefs.current.set(item.image, el);
            }}
            src={item.image}
            alt=""
            decoding="sync"
            style={{ width: "1px", height: "1px" }}
          />
        ))}
      </div>

      {isOpen && (
        <div className="fullscreen-menu">
          <div className="menu-image-side">
            {menuItems.map((item) => (
              <img
                key={item.image}
                src={item.image}
                alt="Ryan and Eleanor"
                decoding="sync"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: hoveredImage === item.image && decodedImages.has(item.image) ? 1 : 0,
                  transition: "none",
                  pointerEvents: "none",
                }}
              />
            ))}
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
                  onMouseEnter={() => handleHover(item.image)}
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
