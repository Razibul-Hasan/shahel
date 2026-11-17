import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const text = Newsreader({ subsets: ["latin"], variable: "--font-text", style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Juber Ahmed Sahel | Photographer from Bangladesh",
  description:
    "Documentary and landscape photographer from Bangladesh. Rivers, rice fields, hill villages and the people who live there. Available for commissions and workshops.",
  openGraph: {
    title: "Juber Ahmed Sahel | Photographer from Bangladesh",
    description: "Documentary and landscape photography from Bangladesh.",
    images: ["/photos/p1.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`}>
      <body>{children}</body>
    </html>
  );
}
