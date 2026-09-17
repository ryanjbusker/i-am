"use client";

import { useState } from "react";

interface EnvelopeEntranceProps {
  children: React.ReactNode;
}

export function EnvelopeEntrance({ children }: EnvelopeEntranceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleOpen = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(true);
    }, 800);
  };

  if (isOpen) {
    return <>{children}</>;
  }

  return (
    <div className={`envelope-container ${isAnimating ? "opening" : ""}`}>
      <div className="envelope-wrapper">
        <div className={`envelope ${isAnimating ? "opening" : ""}`}>
          <div className="envelope-back">
            <div className="envelope-liner">
              <div className="liner-flowers"></div>
            </div>
          </div>
          <div className="envelope-flap">
            <div className="flap-liner"></div>
          </div>
          <div className="envelope-body">
            <div className={`wax-seal ${isAnimating ? "breaking" : ""}`} onClick={handleOpen}>
              <div className="seal-texture"></div>
              <div className="seal-shine"></div>
              <span className="seal-initials">R & E</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
