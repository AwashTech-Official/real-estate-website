import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { CompanySettings } from '../types/database';
import { ArrowRight, MessageSquare } from 'lucide-react';
import heroPoster from '../assets/images/hero_poster_addis_1793310874880.jpg';
import { isSlowConnection } from '../polyfills';

interface HeroSectionProps {
  companySettings?: Partial<CompanySettings> | null;
}

const VIDEO_URL = 'https://ik.imagekit.io/1d5nabm79/1022.mp4?updatedAt=1792698879604';

export const HeroSection: React.FC<HeroSectionProps> = ({ companySettings }) => {
  const { language, t } = useLanguage();
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isSlowNet, setIsSlowNet] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check prefers-reduced-motion media query and slow connection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect slow 2g/3g or data-saver
    setIsSlowNet(isSlowConnection());

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(listener);
      return () => mediaQuery.removeListener(listener);
    }
  }, []);

  // On slow connection or reduced motion, show poster only and do not stream video
  const shouldPlayVideo = !prefersReducedMotion && !videoFailed && !isSlowNet;

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
      /* Standard vh fallback before modern dvh/svh for older WebViews */
      className="relative w-full min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] min-h-[calc(100svh-4rem)] sm:min-h-[calc(100dvh-5rem)] flex items-center justify-center overflow-hidden bg-[#0C0D10]"
      aria-label={t('Hero section', 'የመግቢያ ክፍል')}
    >
      {/* Background Media Container */}
      <div className="absolute inset-0 top-0 right-0 bottom-0 left-0 w-full h-full overflow-hidden select-none">
        {/* Poster Image (Visible immediately, permanent on slow connections or reduced motion) */}
        <img
          src={heroPoster}
          alt={t('Luxury residence architecture in Addis Ababa', 'ዘመናዊ የመኖሪያ ቤት ዲዛይን በአዲስ አበባ')}
          fetchPriority="high"
          decoding="async"
          referrerPolicy="no-referrer"
          className={`absolute inset-0 top-0 right-0 bottom-0 left-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
            videoLoaded && shouldPlayVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />

        {/* Full-screen Background Video with preload="metadata" */}
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
            className={`absolute inset-0 top-0 right-0 bottom-0 left-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Dark Gradient Scrim to ensure WCAG legibility across all screen brightnesses */}
        <div
          className="absolute inset-0 top-0 right-0 bottom-0 left-0 bg-gradient-to-t from-[#0C0D10] via-[#0C0D10]/75 to-[#0C0D10]/50"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 top-0 right-0 bottom-0 left-0 bg-radial from-transparent via-[#0C0D10]/40 to-[#0C0D10]/80"
          aria-hidden="true"
        />
      </div>

      {/* Content Overlay - Never blocked, renders immediately */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded text-xs font-medium tracking-wide uppercase text-[#C8A35F] bg-[#141519]/70 border border-[#C8A35F]/20 backdrop-blur-sm">
          <span>{t(eyebrowEn, eyebrowAm)}</span>
        </div>

        {/* Large Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F5F3EF] max-w-4xl leading-[1.2] sm:leading-[1.15]">
          {t(headlineEn, headlineAm)}
        </h1>

        {/* Short Line of Text */}
        <p className="mt-5 text-base sm:text-lg text-[#B4B1A8] max-w-2xl leading-relaxed">
          {resolvedTagline}
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 w-full sm:w-auto">
          <a
            href="#properties"
            onClick={scrollToProperties}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] transition-all duration-200 shadow-lg shadow-[#C8A35F]/20 active:scale-[0.98] min-h-[48px]"
          >
            <span>{t('Explore Available Properties', 'ያሉትን ቤቶች ይመልከቱ')}</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-[#F5F3EF] bg-[#141519]/80 hover:bg-[#141519] border border-white/10 hover:border-white/20 transition-all duration-200 backdrop-blur-sm active:scale-[0.98] min-h-[48px]"
          >
            <MessageSquare className="w-4 h-4 text-[#C8A35F]" />
            <span>{t('Direct Consultation', 'ቀጥታ ማማከር')}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
