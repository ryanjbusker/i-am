"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DeskFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="desk">
      <header className="desk-bar">
        <Link href="/admin" className="desk-brand">
          Daily reports
        </Link>
        <nav className="desk-nav" aria-label="Report pages">
          <Link href="/admin" aria-current={pathname === "/admin" ? "page" : undefined}>
            Admin
          </Link>
          <Link href="/report" aria-current={pathname === "/report" ? "page" : undefined}>
            Submit
          </Link>
        </nav>
      </header>
      <div className="desk-main">{children}</div>
    </div>
  );
}
