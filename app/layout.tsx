import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Newsreader } from "next/font/google";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const text = Newsreader({ subsets: ["latin"], variable: "--font-text", style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  keywords: site.keywords,
  applicationName: site.name,
  authors: [{ name: site.name, url: siteUrl }],
  creator: site.name,
  publisher: site.name,
  category: "photography",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${site.name}: ${site.tagline}`, type: "image/jpeg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [{ url: "/og.jpg", alt: `${site.name}: ${site.tagline}` }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: site.themeColor,
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`}>
      <body>{children}</body>
    </html>
  );
}
