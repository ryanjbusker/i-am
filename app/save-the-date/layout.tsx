import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Save the Date - Ryan & Eleanor",
  description: "Save the date for the wedding of Eleanor Ehrman and Ryan Busker - March 6, 2027 in Corpus Christi, Texas",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "Save the Date - Ryan & Eleanor",
    description: "March 6, 2027 • Corpus Christi, Texas",
    images: [
      {
        url: "https://thebuskers2027.com/save-the-date/card-1200.webp",
        width: 1200,
        height: 1200,
        alt: "Save the Date for Eleanor and Ryan's Wedding",
      },
    ],
  },
};

export default function SaveTheDateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
      <body>
        {children}
      </body>
    </html>
  );
}
