"use client";

import Link from "next/link";

export function Navigation() {
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link href="/" className="nav-header">
          Ryan and Eleanor
        </Link>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/photos">Photos</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/registry">Registry</Link>
        </div>
      </div>
    </nav>
  );
}
