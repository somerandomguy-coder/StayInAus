import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "AU-Settle Pro Foundation",
  description: "Geography-first migration evidence explorer foundation",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
