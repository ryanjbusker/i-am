"use client";

import { useEffect, useState } from "react";
import { RsvpForm } from "../rsvp/[token]/RsvpForm";

type Phase = "sealed" | "opening" | "open";

const OPEN_ANIMATION_MS = 1500;

export function EnvelopeReveal({
  token,
  addressedTo,
  onClose,
}: {
  token: string;
  addressedTo: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("sealed");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (phase !== "opening") return;
    const skipAnimation = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => setPhase("open"), skipAnimation ? 0 : OPEN_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="envelope-overlay" role="dialog" aria-modal="true" aria-label="Your invitation">
      {phase === "open" ? (
        <div className="invitation-letter">
          <button type="button" className="letter-close" onClick={onClose} aria-label="Close invitation">
            ×
          </button>
          <RsvpForm token={token} />
          <button type="button" className="letter-back" onClick={onClose}>
            Search another name
          </button>
        </div>
      ) : (
        <div className={`envelope-stage${phase === "opening" ? " is-opening" : ""}`}>
          <p className="envelope-caption">You have mail!</p>
          <button
            type="button"
            className="envelope"
            onClick={() => setPhase("opening")}
            disabled={phase === "opening"}
            aria-label={`Open the invitation for ${addressedTo}`}
          >
            <span className="envelope-body" />
            <span className="envelope-peek">
              <span className="peek-monogram">R &amp; E</span>
              <span className="peek-line">You&apos;re invited</span>
            </span>
            <span className="envelope-pocket" />
            <span className="envelope-flap" />
            <span className="wax-seal">
              <span className="seal-monogram">R &amp; E</span>
            </span>
          </button>
          <p className="envelope-hint">
            {phase === "opening" ? "Opening…" : `Tap to open · ${addressedTo}`}
          </p>
        </div>
      )}
    </div>
  );
}
