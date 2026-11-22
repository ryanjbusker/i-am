"use client";

import { useEffect, useState } from "react";

// Ceremony: Saturday, March 6, 2027 at 4:00 PM Central (CST, UTC-6).
const CEREMONY = new Date("2027-03-06T16:00:00-06:00");
// The ceremony day ends at midnight Central (March 7, 2027 00:00 CST).
const DAY_AFTER = new Date("2027-03-07T00:00:00-06:00");

const UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

type Remaining = Record<(typeof UNITS)[number]["key"], number>;

function getRemaining(now: number): Remaining {
  const total = Math.max(0, Math.floor((CEREMONY.getTime() - now) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Server and first client render: a same-size, invisible placeholder.
  if (now === null) {
    return <div className="countdown countdown--placeholder" aria-hidden="true" />;
  }

  if (now >= CEREMONY.getTime()) {
    return (
      <div className="countdown countdown--done" role="status">
        <p className="countdown-message">{now < DAY_AFTER.getTime() ? "Today\u2019s the day" : "Just married"}</p>
      </div>
    );
  }

  const remaining = getRemaining(now);

  return (
    <div className="countdown" role="timer" aria-label="Countdown to the ceremony">
      {UNITS.map(({ key, label }) => (
        <div className="countdown-unit" key={key}>
          <span className="countdown-number">
            {key === "days" ? remaining[key] : String(remaining[key]).padStart(2, "0")}
          </span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
