'use client';

import { useState, useEffect, useRef } from 'react';
import * as m from '@/paraglide/messages';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ABTestCTA } from '@/components/analytics/tracking-components';
import { useAnalytics } from '@/components/analytics/analytics-provider';


export function HeroSection() {
  const analytics = useAnalytics();
  const [scrollIndicatorOpacity, setScrollIndicatorOpacity] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 200; // Distance over which to fade out

      if (scrollY <= maxScroll) {
        // Calculate opacity based on scroll position (1 to 0)
        const opacity = Math.max(0, 1 - (scrollY / maxScroll));
        setScrollIndicatorOpacity(opacity);
      } else {
        setScrollIndicatorOpacity(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle video timing - start at 20s, end at 2:30 (150s), then loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startTime = 20; // Start at 20 seconds
    const endTime = 150; // End at 2:30 (150 seconds)

    const handleVideoLoad = () => {
      video.currentTime = startTime;
    };

    const handleTimeUpdate = () => {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime; // Loop back to start time
      }
    };

    // Set initial time when video loads
    if (video.readyState >= 2) {
      video.currentTime = startTime;
    }

    video.addEventListener('loadeddata', handleVideoLoad);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadeddata', handleVideoLoad);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="/images/prague-hero-poster.jpg"
        >
          <source src="/videos/prague-hero.mp4" type="video/mp4" />
          {/* Fallback background image */}
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <Container className="relative z-10 text-center text-white">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 bg-gradient-to-r from-amber-200 via-orange-300 to-amber-300 bg-clip-text text-transparent drop-shadow-2xl">
            {m['homepage.hero.title']()}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-white drop-shadow-xl">
            {m['homepage.hero.subtitle']()}
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <span className="text-gold-400">★★★★★</span>
              <span>4.9/5 from 200+ reviews</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/30" />
            <div>10+ years of storytelling</div>
            <div className="hidden sm:block w-px h-4 bg-white/30" />
            <div>Licensed Prague guide</div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <ABTestCTA
              testId="hero_cta_test"
              defaultConfig={{
                buttonText: m['homepage.hero.primaryCta'](),
                buttonColor: 'bg-prague-600 hover:bg-prague-700 text-white',
                buttonSize: 'xl',
              }}
              onClick={() => {
                // Scroll to featured tours section
                const featuredSection = document.getElementById('featured-tours');
                featuredSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-semibold px-8 py-4 rounded-lg shadow-xl transition-all duration-200 border-2 border-white/20"
            />

          </div>
        </div>

        {/* Scroll indicator - Fixed to viewport */}
        <div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce transition-opacity duration-500 ease-out z-10"
          style={{
            opacity: scrollIndicatorOpacity * 0.3, // More transparent (30% of calculated opacity)
            pointerEvents: scrollIndicatorOpacity === 0 ? 'none' : 'auto'
          }}
        >
          <div className="w-6 h-10 border-2 border-white/70 rounded-full flex justify-center shadow-lg backdrop-blur-sm">
            <div className="w-1 h-3 bg-white/90 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </Container>
    </section>
  );
}