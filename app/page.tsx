import Site from "@/components/Site";
import { getPortfolio } from "@/lib/portfolio";
import { contact } from "@/lib/contact";
import { site, siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function Home() {
  const { photos, source } = await getPortfolio();

  // structured data: tells search engines who the person is and what the site is
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: site.name,
        description: site.description,
        inLanguage: "en",
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: contact.name,
        url: siteUrl,
        image: `${siteUrl}/photos/portrait.jpg`,
        jobTitle: "Photographer",
        description: site.tagline,
        email: contact.email,
        telephone: contact.phone,
        address: { "@type": "PostalAddress", addressCountry: "BD" },
        knowsAbout: ["Documentary photography", "Landscape photography", "Portrait photography", "Street photography", "Architectural photography"],
        sameAs: [contact.instagram, contact.facebook, contact.pexels],
      },
      {
        "@type": "ImageGallery",
        "@id": `${siteUrl}/#portfolio`,
        name: `Portfolio of ${contact.name}`,
        author: { "@id": `${siteUrl}/#person` },
        image: photos.slice(0, 12).map((p) => ({
          "@type": "ImageObject",
          name: p.title,
          caption: p.alt,
          contentUrl: p.grid.startsWith("http") ? p.grid : `${siteUrl}${p.grid}`,
          width: p.w,
          height: p.h,
          creator: { "@id": `${siteUrl}/#person` },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Site photos={photos} source={source} />
    </>
  );
}
