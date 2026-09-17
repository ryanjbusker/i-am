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
        <div className="envelope" onClick={handleOpen}>
          <div className="envelope-flap"></div>
          <div className="envelope-body">
            <div className="envelope-front">
              <div className="envelope-letter">
                <div className="letter-content">
                  <h1 className="envelope-names">Ryan & Eleanor</h1>
                  <p className="envelope-date">April 2027</p>
                  <p className="envelope-invitation">You're Invited</p>
                  <p className="envelope-cta">Click to open</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
