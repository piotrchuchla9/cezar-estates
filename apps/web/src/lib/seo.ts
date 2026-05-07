export interface SeoProps {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

export function buildSeo(props: SeoProps, siteUrl: string) {
  const fullTitle = props.title === 'Cezar Estates'
    ? props.title
    : `${props.title} — Cezar Estates`;
  const canonical = props.canonical ?? siteUrl;
  const ogImage = props.ogImage ?? `${siteUrl}/og-default.jpg`;
  return { title: fullTitle, description: props.description, canonical, ogImage, noindex: props.noindex ?? false };
}

export function organizationJsonLd(siteUrl: string, phone: string, email: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Cezar Estates',
    url: siteUrl,
    telephone: phone,
    email,
    address: { '@type': 'PostalAddress', addressLocality: 'Kraków', addressCountry: 'PL' },
    areaServed: 'Kraków, Małopolska',
  };
}
