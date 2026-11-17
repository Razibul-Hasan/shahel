import Site from "@/components/Site";
import { getPortfolio } from "@/lib/portfolio";
import { contact } from "@/lib/contact";

export const revalidate = 3600;

export default async function Home() {
  const { photos, source } = await getPortfolio();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: contact.name,
    jobTitle: "Photographer",
    email: contact.email,
    telephone: contact.phone,
    sameAs: [contact.instagram, contact.facebook, contact.pexels],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Site photos={photos} source={source} />
    </>
  );
}
