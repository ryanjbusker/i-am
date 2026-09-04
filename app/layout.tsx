import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emily & James - March 6, 2027",
  description: "Join us for our wedding celebration at The Garden Estate in Napa Valley.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
