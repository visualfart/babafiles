import type { Metadata } from "next";
import { IBM_Plex_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
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
    <html lang="en" className={`${mono.variable} ${devanagari.variable}`}>
      <body>{children}</body>
    </html>
  );
}
