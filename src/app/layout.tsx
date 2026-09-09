import type { Metadata } from "next";
import { Newsreader, Inter, Space_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
  variable: "--font-deva",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "babafiles", template: "%s · babafiles" },
  description: "An open, sourced database of what courts, police, regulators and official inquiries have put on the record about religious leaders, their organisations and temple trusts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable} ${devanagari.variable}`}>
      <body>{children}</body>
    </html>
  );
}
