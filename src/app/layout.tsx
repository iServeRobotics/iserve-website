import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "iServe Robotics — Deploy robots. Scale fleets.",
  description:
    "iServe bridges pilot deployment, site integration, daily operations, and ongoing support — connecting robotics technology to real sites and keeping it working.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${instrument.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
