import React, { useState, useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import { Calculator, ArrowRight } from 'lucide-react';
import defaultPoster from '../assets/images/valuation_video_poster_1793312527709.jpg';

interface ValuationVideoSectionProps {
  videoUrl?: string;
  posterUrl?: string;
  headlineEn?: string;
  headlineAm?: string;
  subtextEn?: string;
  subtextAm?: string;
  buttonTextEn?: string;
  buttonTextAm?: string;
  onValuationClick?: () => void;
}

const DEFAULT_VIDEO_URL =
  'https://ik.imagekit.io/1d5nabm79/1022(2).mp4?updatedAt=1792698860045';

export const ValuationVideoSection: React.FC<ValuationVideoSectionProps> = ({
  videoUrl = DEFAULT_VIDEO_URL,
  posterUrl = defaultPoster,
  headlineEn = 'Discover the True Market Value of Your Addis Ababa Property',
  headlineAm = 'የአዲስ አበባ ንብረትዎን ትክክለኛ የገበያ ዋጋ ይወቁ',
  subtextEn = 'Confidential, evidence-based valuation and subcity comparative analysis for distinguished residential and commercial assets.',
  subtextAm = 'ለመኖሪያ እና ለንግድ ቤቶች ሚስጥራዊ፣ በተጨባጭ መረጃ ላይ የተመሰረተ የዋጋ ግመታ እና የሰፈር ንፅፅር ጥናት።',
  buttonTextEn = 'Request a Free Valuation',
  buttonTextAm = 'ነጻ የዋጋ ግመታ ይጠይቁ',
  onValuationClick,
}) => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isNearViewport, setIsNearViewport] = useState<boolean>(false);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [videoFailed, setVideoFailed] = useState<boolean>(false);
  const hasRefreshedScrollTrigger = useRef<boolean>(false);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // 1. Listen for prefers-reduced-motion dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotionChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionChange);
      return () => mediaQuery.removeEventListener('change', handleMotionChange);
    } else {
      mediaQuery.addListener(handleMotionChange);
      return () => mediaQuery.removeListener(handleMotionChange);
    }
  }, []);

  // 2. IntersectionObserver for lazy loading and viewport-aware playback
  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion) return;

    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    // Preload when within 300px
    const loadObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsNearViewport(true);
            loadObserver.disconnect();
          }
        });
      },
      { rootMargin: '300px 0px' }
    );

    loadObserver.observe(sectionEl);

    // Play/Pause based on active visibility
    const playbackObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = videoRef.current;
          if (!video) return;

          if (entry.isIntersecting) {
            if (video.paused && !prefersReducedMotion) {
              video.play().catch(() => {
                // Browser autoplay handling
              });
            }
          } else {
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    playbackObserver.observe(sectionEl);

    return () => {
      loadObserver.disconnect();
      playbackObserver.disconnect();
    };
  }, [prefersReducedMotion]);

  // 3. ScrollTrigger refresh on metadata load
  const handleLoadedMetadata = () => {
    setVideoLoaded(true);
    if (!hasRefreshedScrollTrigger.current) {
      hasRefreshedScrollTrigger.current = true;
      ScrollTrigger.refresh();
    }
  };

  const shouldRenderVideo = !prefersReducedMotion && !videoFailed;

  const targetHref = `#contact?type=valuation&service=${encodeURIComponent('Property Valuation')}&message=${encodeURIComponent(
    'Hello, I would like to request a confidential free valuation for my property in Addis Ababa.'
  )}`;

  const handleButtonClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onValuationClick) {
      e.preventDefault();
      onValuationClick();
    }
  };

  return (
    <section
      id="valuation"
      ref={sectionRef}
      className="relative w-full h-[72svh] sm:h-[84svh] max-h-[100svh] min-h-[480px] overflow-hidden bg-[#0C0D10] border-y border-white/5 flex items-center justify-center"
      aria-label={t('Property valuation video presentation', 'የንብረት ዋጋ ግመታ ቪዲዮ')}
    >
      {/* Background Poster Image */}
      <img
        src={posterUrl}
        alt={t('Luxury residence and pool in Addis Ababa', 'የቅንጦት መኖሪያ ቪላ በአዲስ አበባ')}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
          videoLoaded && shouldRenderVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      />

      {/* Dark gradient base fallback */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0C0D10] via-transparent to-[#0C0D10]/60 -z-10"
        aria-hidden="true"
      />

      {/* Video Element */}
      {shouldRenderVideo && isNearViewport && (
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => {
            setVideoFailed(true);
            if (!hasRefreshedScrollTrigger.current) {
              hasRefreshedScrollTrigger.current = true;
              ScrollTrigger.refresh();
            }
          }}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Contrast Overlay Scrim */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0C0D10] via-[#0C0D10]/70 to-[#0C0D10]/60 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-radial from-transparent via-[#0C0D10]/40 to-[#0C0D10]/80 pointer-events-none"
        aria-hidden="true"
      />

      {/* Overlay Content: Eyebrow, Short Headline, Subtext, and CTA Button */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold tracking-wider uppercase text-[#C8A35F] bg-[#141519]/80 border border-[#C8A35F]/30 backdrop-blur-sm mb-4">
          <Calculator className="w-3.5 h-3.5" />
          <span>{t('Property Valuation', 'የንብረት ዋጋ ግመታ')}</span>
        </div>

        {/* Short Headline */}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F5F3EF] max-w-3xl text-balance leading-tight drop-shadow-lg">
          {t(headlineEn, headlineAm)}
        </h2>

        {/* Subtext */}
        <p className="mt-4 text-sm sm:text-base text-[#B4B1A8] max-w-2xl leading-relaxed text-balance drop-shadow-md">
          {t(subtextEn, subtextAm)}
        </p>

        {/* CTA Button */}
        <div className="mt-8 flex items-center justify-center">
          <a
            href={targetHref}
            onClick={handleButtonClick}
            className="inline-flex items-center justify-center gap-2.5 min-h-[48px] px-8 py-3.5 text-sm font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] rounded-md transition-all duration-200 shadow-xl shadow-[#C8A35F]/20 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A35F]"
          >
            <span>{t(buttonTextEn, buttonTextAm)}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
};
