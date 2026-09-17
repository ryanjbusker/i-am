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
          <div className="envelope-flap"></div>
          <div className="envelope-body">
            <div className={`wax-seal ${isAnimating ? "breaking" : ""}`} onClick={handleOpen}>
              <div className="seal-ring"></div>
              <div className="seal-center">
                <div className="laurel-left"></div>
                <div className="laurel-right"></div>
                <div className="seal-content">
                  <span className="seal-initials">R & E</span>
                  <span className="seal-date">03.06.2027</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
