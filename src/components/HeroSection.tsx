import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { CompanySettings } from '../types/database';
import { ArrowRight, MessageSquare } from 'lucide-react';
import heroPoster from '../assets/images/hero_poster_addis_1793310874880.jpg';

interface HeroSectionProps {
  companySettings?: Partial<CompanySettings> | null;
}

const VIDEO_URL = 'https://ik.imagekit.io/1d5nabm79/1022.mp4?updatedAt=1792698879604';

export const HeroSection: React.FC<HeroSectionProps> = ({ companySettings }) => {
  const { language, t } = useLanguage();
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      mediaQuery.addListener(listener);
      return () => mediaQuery.removeListener(listener);
    }
  }, []);

  const shouldPlayVideo = !prefersReducedMotion && !videoFailed;

  // Resolve localized tagline from company_settings with verified fallback
  const resolvedTagline =
    language === 'am' && companySettings?.tagline_am?.trim()
      ? companySettings.tagline_am
      : companySettings?.tagline?.trim() ||
        t(
          "Guiding clients through distinguished residential villas, modern apartments, and commercial investments across Addis Ababa's prime locations.",
          'በአዲስ አበባ ተመራጭ ሰፈሮች ውስጥ ቪላዎችን፣ ዘመናዊ አፓርታማዎችን እና የንግድ ቦታዎችን ለማግኘት አስተማማኝ አጋርዎ።'
        );

  const headlineEn = "Discover Addis Ababa's Fine Residences & Commercial Spaces";
  const headlineAm = 'የአዲስ አበባን ተመራጭ የመኖሪያ እና የንግድ ቤቶች ያግኙ';

  const eyebrowEn = 'Addis Ababa Premier Real Estate';
  const eyebrowAm = 'የአዲስ አበባ ምርጥ ሪል እስቴት';

  const scrollToProperties = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elem = document.getElementById('properties');
    if (elem) {
      elem.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full min-h-[calc(100svh-4rem)] sm:min-h-[calc(100dvh-5rem)] flex items-center justify-center overflow-hidden bg-[#0C0D10]"
      aria-label={t('Hero section', 'የመግቢያ ክፍል')}
    >
      {/* Background Media Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden select-none">
        {/* Poster Image (shown initially while video loads, or permanently on reduced-motion / video error) */}
        <img
          src={heroPoster}
          alt={t('Luxury residence architecture in Addis Ababa', 'ዘመናዊ የመኖሪያ ቤት ዲዛይን በአዲስ አበባ')}
          fetchPriority="high"
          decoding="async"
          referrerPolicy="no-referrer"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
            videoLoaded && shouldPlayVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />

        {/* Full-screen Background Video */}
        {shouldPlayVideo && (
          <video
            ref={videoRef}
            src={VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => {
              setVideoFailed(true);
            }}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Dark Gradient Scrim to ensure WCAG AA/AAA legibility across all screen brightnesses */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0C0D10] via-[#0C0D10]/75 to-[#0C0D10]/50"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-radial from-transparent via-[#0C0D10]/40 to-[#0C0D10]/80"
          aria-hidden="true"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded text-xs font-medium tracking-wide uppercase text-[#C8A35F] bg-[#141519]/70 border border-[#C8A35F]/20 backdrop-blur-sm">
          <span>{t(eyebrowEn, eyebrowAm)}</span>
        </div>

        {/* Large Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F5F3EF] max-w-4xl text-balance leading-[1.2] sm:leading-[1.15]">
          {t(headlineEn, headlineAm)}
        </h1>

        {/* Short Line of Text (Using company_settings tagline or verified default) */}
        <p className="mt-5 text-base sm:text-lg text-[#B4B1A8] max-w-2xl leading-relaxed">
          {resolvedTagline}
        </p>

        {/* Two Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          {/* Primary Button: View Properties */}
          <a
            href="#properties"
            onClick={scrollToProperties}
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 py-3 text-sm font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] rounded-md transition-all duration-200 shadow-lg shadow-[#C8A35F]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A35F]"
          >
            <span>{t('View Properties', 'ቤቶችን ይመልከቱ')}</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          {/* Secondary Button: Contact Us */}
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 py-3 text-sm font-medium text-[#F5F3EF] bg-[#141519]/80 hover:bg-[#141519] border border-white/15 hover:border-[#C8A35F]/50 rounded-md transition-all duration-200 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A35F]"
          >
            <MessageSquare className="w-4 h-4 text-[#C8A35F]" />
            <span>{t('Contact Us', 'ያነጋግሩን')}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
