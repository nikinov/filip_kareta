'use client';

import * as m from '@/paraglide/messages';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getLocale } from '@/paraglide/runtime';
import { Container } from '@/components/ui/container';
import { ResponsiveImage } from '@/components/ui/responsive-image';

export function AboutFilipSection() {
  const currentLocale = getLocale();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-stone-50 to-prague-50">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="max-w-xl">
              {/* Section Label */}
              <div className="inline-flex items-center gap-2 bg-prague-100 text-prague-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {m['homepage.aboutFilip.label']()}
              </div>

              {/* Heading */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-6">
                {m['homepage.aboutFilip.title']()}
              </h2>

              {/* Description */}
              <div className="space-y-4 text-lg text-stone-600 mb-8">
                <p>{m['homepage.aboutFilip.description1']()}</p>
                <p>{m['homepage.aboutFilip.description2']()}</p>
              </div>

              {/* Credentials/Highlights */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-prague-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-prague-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900 mb-1">Licensed Guide</div>
                    <div className="text-sm text-stone-600">Official Prague Tourism Certification</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-castle-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-castle-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900 mb-1">History Expert</div>
                    <div className="text-sm text-stone-600">12+ years of storytelling</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900 mb-1">Multilingual</div>
                    <div className="text-sm text-stone-600">English, German, Czech</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900 mb-1">Local Born</div>
                    <div className="text-sm text-stone-600">Prague native with insider knowledge</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/${currentLocale}/book`}>
                  <Button variant="cta" size="lg">
                    {m['homepage.aboutFilip.primaryCta']()}
                  </Button>
                </Link>
                <Link href={`/${currentLocale}/about`}>
                  <Button variant="outline" size="lg">
                    {m['homepage.aboutFilip.secondaryCta']()}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              {/* Main image */}
              <div className="relative overflow-hidden rounded-2xl shadow-strong">
                <ResponsiveImage
                  src="/images/filip-portrait.jpg"
                  alt="Filip Kareta - Prague Tour Guide"
                  width={600}
                  height={700}
                  className="w-full h-[500px] md:h-[600px] object-cover"
                />
                
                {/* Overlay with quote */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-8">
                  <blockquote className="text-white">
                    <p className="text-lg md:text-xl font-medium mb-3 leading-relaxed">
                      &ldquo;{m['homepage.aboutFilip.quote']()}&rdquo;
                    </p>
                    <cite className="text-sm text-white/80 not-italic">
                      — Filip Kareta, Licensed Prague Guide
                    </cite>
                  </blockquote>
                </div>
              </div>

              {/* Floating stats card */}
              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-medium p-4 md:p-6 max-w-[200px]">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-prague-600 mb-1">1,500+</div>
                  <div className="text-sm text-stone-600 mb-2">Tours Completed</div>
                  <div className="flex justify-center">
                    <div className="flex text-gold-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-stone-500">4.9/5 Rating</div>
                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-prague-100 rounded-full opacity-50 -z-10" />
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-castle-100 rounded-full opacity-30 -z-10" />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-16 pt-8 border-t border-stone-200">
          <div className="text-center">
            <p className="text-stone-600 mb-6">{m['homepage.aboutFilip.followLabel']()}</p>
            <div className="flex justify-center gap-4">
              <a
                href="https://instagram.com/filipprague"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                aria-label="Follow Filip on Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.864 3.708 13.713 3.708 12.416s.49-2.448 1.418-3.323C6.001 8.218 7.152 7.728 8.449 7.728s2.448.49 3.323 1.365c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323C10.897 16.498 9.746 16.988 8.449 16.988z"/>
                </svg>
              </a>
              
              <a
                href="https://facebook.com/filippragueguide"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                aria-label="Follow Filip on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              <a
                href="https://tripadvisor.com/filip-prague-guide"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                aria-label="See Filip's TripAdvisor reviews"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353L1.85 4.295l1.414 1.414 2.004-2.004C7.454 2.461 9.71 1.8 12.006 1.8s4.552.661 6.738 1.905l2.004 2.004 1.414-1.414-2.511 2.353c-2.307-1.569-4.975-2.353-7.645-2.353zm0 15.41c2.67 0 5.338-.784 7.645-2.353l2.511 2.353-1.414-1.414-2.004 2.004c-2.186-1.244-4.442-1.905-6.738-1.905s-4.552.661-6.738 1.905l-2.004-2.004L1.85 19.705l2.511-2.353c2.307 1.569 4.975 2.353 7.645 2.353z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}