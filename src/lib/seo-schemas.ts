// Removed unused import

export interface SEOSchemaConfig {
  baseUrl: string;
  locale: string;
  pathname: string;
}

export function generateOrganizationSchema(config: SEOSchemaConfig) {
  const { baseUrl } = config;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: 'Filip Kareta Prague Tours',
    alternateName: 'Filip Kareta Tours',
    description: 'Authentic Prague tours with local storytelling guide Filip Kareta. Experience hidden gems and fascinating stories of Prague.',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    image: [
      `${baseUrl}/images/filip-profile.jpg`,
      `${baseUrl}/images/prague-tours.jpg`,
      `${baseUrl}/images/prague-castle.jpg`,
    ],
    telephone: '+420 123 456 789',
    email: 'info@guidefilip-prague.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Old Town Square',
      addressLocality: 'Prague',
      addressRegion: 'Prague',
      postalCode: '110 00',
      addressCountry: 'CZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 50.0875,
      longitude: 14.4213,
    },
    areaServed: {
      '@type': 'City',
      name: 'Prague',
      addressCountry: 'CZ',
    },
    serviceType: 'Tour Guide Services',
    priceRange: '€€',
    sameAs: [
      'https://www.tripadvisor.com/Attraction_Review-g274707-d12345678-Reviews-Filip_Kareta_Prague_Tours-Prague_Bohemia.html',
      'https://www.google.com/maps/place/Filip+Kareta+Prague+Tours',
      'https://www.facebook.com/filippraguetours',
      'https://www.instagram.com/filipprague',
      'https://www.linkedin.com/in/filipkareta',
    ],
    founder: {
      '@type': 'Person',
      '@id': `${baseUrl}#person`,
    },
  };
}

export function generateWebPageSchema(config: SEOSchemaConfig & { 
  title: string; 
  description: string; 
  breadcrumbs?: Array<{ name: string; url: string }>;
}) {
  const { baseUrl, locale, pathname, title, description, breadcrumbs } = config;
  const fullUrl = `${baseUrl}/${locale}${pathname}`;
  
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${fullUrl}#webpage`,
    url: fullUrl,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${baseUrl}#website`,
    },
    about: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
    },
    mainEntity: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
    },
  };

  if (breadcrumbs && breadcrumbs.length > 0) {
    schema.breadcrumb = {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  return schema;
}

export function generateTourServiceSchema(config: SEOSchemaConfig & {
  tourName: string;
  tourDescription: string;
  price: number;
  currency: string;
  duration: number; // in minutes
  images: string[];
  rating?: {
    value: number;
    count: number;
  };
}) {
  const { baseUrl, locale, pathname, tourName, tourDescription, price, currency, duration, images, rating } = config;
  const fullUrl = `${baseUrl}/${locale}${pathname}`;
  
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': `${fullUrl}#tour`,
    name: tourName,
    description: tourDescription,
    url: fullUrl,
    image: images,
    provider: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
    },
    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
      seller: {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
      },
    },
    duration: `PT${Math.floor(duration / 60)}H${duration % 60}M`,
    touristType: 'https://schema.org/Tourist',
    itinerary: {
      '@type': 'ItemList',
      name: `${tourName} Itinerary`,
      description: 'Walking tour through Prague with storytelling guide',
    },
    location: {
      '@type': 'Place',
      name: 'Prague, Czech Republic',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Prague',
        addressCountry: 'CZ',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 50.0875,
        longitude: 14.4213,
      },
    },
  };

  if (rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.value,
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

export function generateBlogPostSchema(config: SEOSchemaConfig & {
  title: string;
  description: string;
  publishedDate: string;
  modifiedDate?: string;
  author: string;
  image?: string;
  wordCount?: number;
}) {
  const { baseUrl, locale, pathname, title, description, publishedDate, modifiedDate, author, image, wordCount } = config;
  const fullUrl = `${baseUrl}/${locale}${pathname}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${fullUrl}#article`,
    headline: title,
    description,
    url: fullUrl,
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    author: {
      '@type': 'Person',
      '@id': `${baseUrl}#person`,
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${fullUrl}#webpage`,
    },
    image: image ? `${baseUrl}${image}` : `${baseUrl}/images/og-default.jpg`,
    inLanguage: locale,
    wordCount,
    about: {
      '@type': 'Place',
      name: 'Prague',
      addressCountry: 'CZ',
    },
  };
}

export function generateFAQPageSchema(config: SEOSchemaConfig & {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const { baseUrl, locale, pathname, faqs } = config;
  const fullUrl = `${baseUrl}/${locale}${pathname}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${fullUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateSearchActionSchema(config: SEOSchemaConfig) {
  const { baseUrl } = config;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Utility function to generate all common schemas for a page
export function generatePageSchemas(config: SEOSchemaConfig & {
  pageType: 'homepage' | 'tour' | 'blog' | 'about' | 'contact' | 'tours-listing';
  title: string;
  description: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  tourData?: Parameters<typeof generateTourServiceSchema>[0];
  blogData?: Parameters<typeof generateBlogPostSchema>[0];
  faqs?: Array<{ question: string; answer: string }>;
}) {
  const { pageType, title, description, breadcrumbs, tourData, blogData, faqs, ...baseConfig } = config;
  
  const schemas = [
    generateOrganizationSchema(baseConfig),
    generateWebPageSchema({ ...baseConfig, title, description, breadcrumbs }),
  ];

  // Add page-specific schemas
  switch (pageType) {
    case 'homepage':
      schemas.push(generateSearchActionSchema(baseConfig));
      break;
    case 'tour':
      if (tourData) {
        schemas.push(generateTourServiceSchema({ ...baseConfig, ...tourData }));
      }
      break;
    case 'blog':
      if (blogData) {
        schemas.push(generateBlogPostSchema({ ...baseConfig, ...blogData }));
      }
      break;
  }

  // Add FAQ schema if provided
  if (faqs && faqs.length > 0) {
    schemas.push(generateFAQPageSchema({ ...baseConfig, faqs }));
  }

  return schemas;
}