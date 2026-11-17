import { contact } from "./contact";

/**
 * Public URL of the deployed site. Used for the canonical link, Open Graph URLs,
 * the sitemap and structured data. Set NEXT_PUBLIC_SITE_URL in production
 * (for example https://jubersahel.com). On Vercel it falls back to the project's production domain.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const site = {
  name: contact.name,
  title: "Juber Ahmed Sahel | Photographer from Bangladesh",
  description:
    "Documentary and landscape photographer in Bangladesh. View Juber Ahmed Sahel's portfolio and book him for commissions, workshops and collaborations.",
  tagline: "Documentary and landscape photography from Bangladesh",
  keywords: [
    "Juber Ahmed Sahel",
    "Bangladesh photographer",
    "documentary photographer Bangladesh",
    "landscape photography Bangladesh",
    "portrait photographer Bangladesh",
    "street photography Dhaka",
    "travel photographer Bangladesh",
    "photography workshop Bangladesh",
    "hire a photographer in Bangladesh",
    "Sylhet photography",
    "Old Dhaka photography",
    "rural Bangladesh photography",
  ],
  themeColor: "#0f1b26",
};
