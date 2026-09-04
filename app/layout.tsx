import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ryan & Eleanor - March 6, 2027",
  description: "Join us for our wedding celebration at The Garden Estate in Napa Valley.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Dancing+Script:wght@500;600&family=Karla:wght@400;500;600;700&family=Pinyon+Script&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
