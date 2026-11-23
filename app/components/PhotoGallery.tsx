"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EngagementPhoto } from "../photos/engagement-photos";

const BASE = "/images/engagement";
const thumbSrc = (name: string) => `${BASE}/thumbs/${name}.jpg`;
const fullSrc = (name: string) => `${BASE}/full/${name}.jpg`;

// The first rows are above the fold, so load them right away; everything else is lazy.
const EAGER_COUNT = 8;
const SWIPE_THRESHOLD = 50;

export function PhotoGallery({ photos }: { photos: EngagementPhoto[] }) {
  // null = closed. The lightbox never renders on the server, so there is nothing to mismatch.
  const [index, setIndex] = useState<number | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastOpened = useRef<number | null>(null);

  const open = (i: number) => {
    lastOpened.current = i;
    setIndex(i);
  };

  const close = useCallback(() => {
    setIndex((current) => {
      lastOpened.current = current;
      return null;
    });
  }, []);

  const total = photos.length;
  const prev = useCallback(() => setIndex((i) => (i === null ? i : (i - 1 + total) % total)), [total]);
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % total)), [total]);

  // Return focus to the photo that was open when the lightbox closes.
  useEffect(() => {
    if (index === null && lastOpened.current !== null) {
      thumbRefs.current[lastOpened.current]?.focus({ preventScroll: true });
      thumbRefs.current[lastOpened.current]?.scrollIntoView({ block: "nearest" });
      lastOpened.current = null;
    }
  }, [index]);

  return (
    <>
      <ul className="gallery-grid" aria-label={`Engagement photos, ${total} photos`}>
        {photos.map((photo, i) => (
          <li key={photo.name} className="gallery-item">
            <button
              type="button"
              ref={(el) => {
                thumbRefs.current[i] = el;
              }}
              className="gallery-thumb"
              onClick={() => open(i)}
              aria-label={`Open photo ${i + 1} of ${total}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbSrc(photo.name)}
                alt={`Ryan and Eleanor, engagement session ${i + 1} of ${total}`}
                width={photo.w >= photo.h ? 720 : 480}
                height={photo.w >= photo.h ? 480 : 720}
                loading={i < EAGER_COUNT ? "eager" : "lazy"}
                decoding="async"
              />
            </button>
          </li>
        ))}
      </ul>
      {index !== null && (
        <Lightbox photos={photos} index={index} onClose={close} onPrev={prev} onNext={next} />
      )}
    </>
  );
}

interface LightboxProps {
  photos: EngagementPhoto[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ photos, index, onClose, onPrev, onNext }: LightboxProps) {
  const total = photos.length;
  const photo = photos[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const src = fullSrc(photo.name);

  // Keyboard: arrows navigate, Esc closes, Tab stays inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  // Lock page scroll while open and move focus into the dialog.
  useEffect(() => {
    const { body, documentElement } = document;
    const prevBody = body.style.overflow;
    const prevHtml = documentElement.style.overflow;
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      body.style.overflow = prevBody;
      documentElement.style.overflow = prevHtml;
    };
  }, []);

  // Preload the neighbours so prev/next feels instant.
  useEffect(() => {
    for (const offset of [1, -1, 2]) {
      const neighbour = photos[(index + offset + total) % total];
      const img = new Image();
      img.decoding = "async";
      img.src = fullSrc(neighbour.name);
    }
  }, [index, photos, total]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) onNext();
      else onPrev();
    } else if (dy > SWIPE_THRESHOLD * 2 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
    }
  };

  const isLoaded = loadedSrc === src;

  return (
    <div
      ref={dialogRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${total}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Clicking the dark backdrop closes the viewer (Esc and the X button do too). */}
      <button type="button" className="lightbox-backdrop" onClick={onClose} aria-label="Close photo viewer" tabIndex={-1} />
      <div className="lightbox-topbar">
        <p className="lightbox-counter" aria-live="polite">
          {index + 1} / {total}
        </p>
        <button ref={closeRef} type="button" className="lightbox-close" onClick={onClose} aria-label="Close photo viewer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </div>

      <div className="lightbox-stage">
        <div className={`lightbox-frame${isLoaded ? " is-loaded" : ""}`} style={{ "--ar": photo.w / photo.h } as React.CSSProperties}>
          {/* Thumb is already cached from the grid: show it blurred-up instantly, then fade in the full image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lightbox-placeholder" src={thumbSrc(photo.name)} alt="" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={src}
            className={`lightbox-image${isLoaded ? " is-loaded" : ""}`}
            src={src}
            alt={`Ryan and Eleanor, engagement session ${index + 1} of ${total}`}
            width={photo.w}
            height={photo.h}
            decoding="async"
            ref={(el) => {
              if (el?.complete && el.naturalWidth > 0) setLoadedSrc(src);
            }}
            onLoad={() => setLoadedSrc(src)}
            draggable={false}
          />
        </div>
      </div>

      <button type="button" className="lightbox-nav lightbox-prev" onClick={onPrev} aria-label="Previous photo">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 4l-8 8 8 8" />
        </svg>
      </button>
      <button type="button" className="lightbox-nav lightbox-next" onClick={onNext} aria-label="Next photo">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 4l8 8-8 8" />
        </svg>
      </button>
    </div>
  );
}
