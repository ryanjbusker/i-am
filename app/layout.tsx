import type { Metadata } from "next";
import "./globals.css";
import { PasswordGate } from "./components/PasswordGate";

export const metadata: Metadata = {
  title: "Ryan & Eleanor - March 6, 2027",
  description: "Join us for our wedding celebration at Corpus Christi Cathedral and Corpus Christi Country Club.",
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
        <link rel="preload" as="image" href="/images/120402bc-c76e-4ea3-87e9-106d517f0ef7.webp" />
        <link rel="preload" as="image" href="/images/49bf1c0c-2c84-4f33-b4ca-92a0cf1427dd.webp" />
        <link rel="preload" as="image" href="/images/d92414f4-53d8-4fae-895a-a35d15e94606.webp" />
        <link rel="preload" as="image" href="/images/8a44eb89-d550-4a0f-97f4-580de7e01b13.webp" />
      </head>
      <body>
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  );
}
