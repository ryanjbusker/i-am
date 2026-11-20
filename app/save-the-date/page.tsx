"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SaveTheDatePage() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <div className="save-the-date-container">
      <div className={`envelope-wrapper ${isOpen ? 'opened' : ''}`}>
        <button 
          className="envelope-button" 
          onClick={handleOpen}
          disabled={isOpen}
          aria-label="Open envelope"
        >
          <div className="envelope">
            <div className="envelope-flap"></div>
            <div className="envelope-seal">
              <span className="seal-text">E &amp; R</span>
            </div>
          </div>
        </button>
      </div>
      
      {!isOpen && <div className="tap-hint">Tap to open</div>}
      
      <div className="card-container">
        <Image
          src="/save-the-date/card-1200.webp"
          alt="Save the Date - Eleanor Ehrman and Ryan Busker, March 6, 2027, Corpus Christi, Texas"
          width={1200}
          height={1200}
          priority
          className="card-image"
          srcSet="/save-the-date/card-1200.webp 1200w, /save-the-date/card-2400.webp 2400w"
          sizes="(max-width: 768px) 90vw, 600px"
        />
      </div>
      
      {isOpen && (
        <div className="action-button-container">
          <Link href="/" className="view-website-button">
            Visit Our Wedding Website
          </Link>
        </div>
      )}
    </div>
  );
}
