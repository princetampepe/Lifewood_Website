import { memo } from 'react';

/**
 * Structured Data (JSON-LD) for Lifewood — injected on the home page.
 * Provides Organization schema for rich search results.
 */

const orgSchema = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Lifewood Data Technology',
  url: 'https://lifewood.net',
  logo: 'https://lifewood.net/lifewood official logo/use this.png',
  description:
    'Lifewood provides AI-powered data solutions including data annotation, collection, curation, and AIGC services across 20+ global offices.',
  sameAs: [
    'https://www.linkedin.com/company/lifewood-data-technology-ltd.',
    'https://www.facebook.com/LifewoodPH',
    'https://www.instagram.com/lifewood_official/',
    'https://www.youtube.com/@LifewoodDataTechnology',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    url: 'https://lifewood.net/contact',
  },
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    value: 56000,
  },
  areaServed: 'Worldwide',
  foundingLocation: 'Hong Kong',
});

const StructuredData = memo(() => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: orgSchema }}
  />
));

StructuredData.displayName = 'StructuredData';

export default StructuredData;
