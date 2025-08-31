export interface LocalBusinessData {
  name: string;
  description: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  email: string;
  url: string;
  image: string[];
  priceRange: string;
  openingHours: string[];
  geo: {
    latitude: number;
    longitude: number;
  };
  sameAs: string[];
}

export interface TourProductData {
  name: string;
  description: string;
  image: string[];
  offers: {
    price: number;
    currency: string;
    availability: string;
    validFrom?: string;
    validThrough?: string;
  };
  provider: {
    name: string;
    url: string;
  };
  duration: string;
  location: {
    name: string;
    address: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
}

export function generateLocalBusinessSchema(data: LocalBusinessData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${data.url}#business`,
    name: data.name,
    description: data.description,
    url: data.url,
    telephone: data.telephone,
    email: data.email,
    image: data.image,
    priceRange: data.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.streetAddress,
      addressLocality: data.address.addressLocality,
      addressRegion: data.address.addressRegion,
      postalCode: data.address.postalCode,
      addressCountry: data.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: data.geo.latitude,
      longitude: data.geo.longitude,
    },
    openingHoursSpecification: data.openingHours.map(hours => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.split(' ')[0],
      opens: hours.split(' ')[1],
      closes: hours.split(' ')[2],
    })),
    sameAs: data.sameAs,
  };
}

export function generateTourProductSchema(data: TourProductData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description,
    image: data.image,
    offers: {
      '@type': 'Offer',
      price: data.offers.price,
      priceCurrency: data.offers.currency,
      availability: `https://schema.org/${data.offers.availability}`,
      seller: {
        '@type': 'Organization',
        name: data.provider.name,
        url: data.provider.url,
      },
    },
    provider: {
      '@type': 'Organization',
      name: data.provider.name,
      url: data.provider.url,
    },
    category: 'Tours & Activities',
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Duration',
        value: data.duration,
      },
      {
        '@type': 'PropertyValue',
        name: 'Location',
        value: data.location.name,
      },
    ],
  };

  if (data.offers.validFrom) {
    schema.offers.validFrom = data.offers.validFrom;
  }

  if (data.offers.validThrough) {
    schema.offers.validThrough = data.offers.validThrough;
  }

  if (data.aggregateRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.aggregateRating.ratingValue,
      reviewCount: data.aggregateRating.reviewCount,
      bestRating: data.aggregateRating.bestRating,
      worstRating: data.aggregateRating.worstRating,
    };
  }

  return schema;
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generatePersonSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${baseUrl}#person`,
    name: 'Filip Kareta',
    jobTitle: 'Professional Tour Guide',
    description: 'Experienced Prague tour guide specializing in historical storytelling and authentic local experiences',
    url: baseUrl,
    image: `${baseUrl}/images/filip-profile.jpg`,
    sameAs: [
      'https://www.tripadvisor.com/Attraction_Review-g274707-d12345678-Reviews-Filip_Kareta_Prague_Tours-Prague_Bohemia.html',
      'https://www.google.com/maps/place/Filip+Kareta+Prague+Tours',
      'https://www.facebook.com/filippraguetours',
      'https://www.instagram.com/filipprague',
    ],
    knowsAbout: [
      'Prague History',
      'Czech Culture',
      'Architecture',
      'Local Traditions',
      'Food & Drink',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'Filip Kareta Prague Tours',
      url: baseUrl,
    },
  };
}

export function generateWebsiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    name: 'Filip Kareta - Prague Tour Guide',
    description: 'Authentic Prague tours with local storytelling guide Filip Kareta. Discover hidden gems and fascinating stories of Prague.',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Person',
      '@id': `${baseUrl}#person`,
    },
  };
}