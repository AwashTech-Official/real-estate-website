import React, { useState, useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import { Calculator, ArrowRight } from 'lucide-react';
import defaultPoster from '../assets/images/valuation_video_poster_1793312527709.jpg';
import { isSlowConnection } from '../polyfills';

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
  const [isSlowNet, setIsSlowNet] = useState<boolean>(false);
  const hasRefreshedScrollTrigger = useRef<boolean>(false);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // 1. Listen for prefers-reduced-motion and slow connection dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsSlowNet(isSlowConnection());

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionChange);
      return () => mediaQuery.removeEventListener('change', handleMotionChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleMotionChange);
      return () => mediaQuery.removeListener(handleMotionChange);
    }
  }, []);

  // 2. IntersectionObserver for lazy loading and viewport-aware playback
  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion || isSlowNet) return;

    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return;
    }

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

    // Play/Pause observer: only play when in active viewport
    const playbackObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = videoRef.current;
          if (!video) return;

          if (entry.isIntersecting) {
            if (video.paused && !prefersReducedMotion && !isSlowNet) {
              video.play().catch(() => {
                // Ignore autoplay deferral
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
  }, [prefersReducedMotion, isSlowNet]);

  // Refresh ScrollTrigger once metadata loads
  const handleLoadedMetadata = () => {
    setVideoLoaded(true);
    if (!hasRefreshedScrollTrigger.current) {
      hasRefreshedScrollTrigger.current = true;
      try {
        ScrollTrigger.refresh();
      } catch {
        // Ignore
      }
    }
  };

  // On slow connection, video failure, or reduced motion: show poster only!
  const shouldRenderVideo = !prefersReducedMotion && !videoFailed && !isSlowNet;

  const handleButtonClick = () => {
    if (onValuationClick) {
      onValuationClick();
    } else {
      const el = document.getElementById('valuation-section');
      if (el) {
        el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    }
  };

  return (
    <section
      id="valuation"
      ref={sectionRef}
      /* Precede svh with standard vh fallback for older Android devices */
      className="relative w-full h-[72vh] sm:h-[84vh] h-[72svh] sm:h-[84svh] max-h-[100vh] max-h-[100svh] min-h-[480px] overflow-hidden bg-[#0C0D10] border-y border-white/5 flex items-center justify-center"
      aria-label={t('Property valuation video presentation', 'የንብረት ዋጋ ግመታ ቪዲዮ')}
    >
      {/* Background Poster Image */}
      <img
        src={posterUrl}
        alt={t('Luxury residence and pool in Addis Ababa', 'የቅንጦት መኖሪያ ቪላ በአዲስ አበባ')}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={`absolute inset-0 top-0 right-0 bottom-0 left-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
          videoLoaded && shouldRenderVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      />

      {/* Dark gradient base fallback */}
      <div
        className="absolute inset-0 top-0 right-0 bottom-0 left-0 bg-gradient-to-t from-[#0C0D10] via-transparent to-[#0C0D10]/60 -z-10"
        aria-hidden="true"
      />

      {/* Video Element: preload="none" on mobile */}
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
              try {
                ScrollTrigger.refresh();
              } catch {
                // Ignore
              }
            }
          }}
          className={`absolute inset-0 top-0 right-0 bottom-0 left-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Deep contrast scrims */}
      <div
        className="absolute inset-0 top-0 right-0 bottom-0 left-0 bg-gradient-to-t from-[#0C0D10]/95 via-[#0C0D10]/75 to-[#0C0D10]/80 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 top-0 right-0 bottom-0 left-0 bg-[#0C0D10]/40 backdrop-blur-[1px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Content Card Overlay */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-[#C8A35F] bg-[#141519]/80 border border-[#C8A35F]/30 backdrop-blur-md shadow-lg">
          <Calculator className="w-3.5 h-3.5" />
          <span>{t('Advisory & Valuation', 'የዋጋ ግመታ እና ማማከር')}</span>
        </div>

        {/* Short Punchy Headline */}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F5F3EF] max-w-3xl leading-[1.2]">
          {t(headlineEn, headlineAm)}
        </h2>

        {/* Subtext */}
        <p className="mt-4 text-sm sm:text-base text-[#B4B1A8] max-w-2xl leading-relaxed">
          {t(subtextEn, subtextAm)}
        </p>

        {/* Action Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={handleButtonClick}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] transition-all duration-200 shadow-xl shadow-[#C8A35F]/20 active:scale-[0.98] cursor-pointer min-h-[48px]"
          >
            <span>{t(buttonTextEn, buttonTextAm)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
