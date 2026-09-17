"use client";

import { useState } from "react";
import Image from "next/image";

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
            <div className={`wax-seal-container ${isAnimating ? "breaking" : ""}`} onClick={handleOpen}>
              <Image
                src="/images/wax-seal.png"
                alt="Wax Seal"
                width={140}
                height={140}
                className="wax-seal-image"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
