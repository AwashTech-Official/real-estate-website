import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { CompanySettings } from '../types/database';
import { Play, Pause, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

import imgSales from '../assets/images/about_villa_exterior_1793311211872.jpg';
import imgRentals from '../assets/images/about_modern_interior_1793311212933.jpg';
import imgManagement from '../assets/images/about_bole_district_1793311213385.jpg';
import imgLand from '../assets/images/service_land_landscape_1793312119333.jpg';
import imgAdvisory from '../assets/images/service_commercial_tower_1793312119858.jpg';
import imgInterior from '../assets/images/about_estate_entrance_1793311213911.jpg';

export interface ServiceItem {
  id?: string;
  serviceKey: 'sales' | 'rentals' | 'management' | 'land' | 'advisory' | 'interior' | string;
  eyebrow: string;
  eyebrow_am?: string;
  title: string;
  title_am?: string;
  text: string;
  text_am?: string;
  buttonLabel: string;
  buttonLabel_am?: string;
  buttonHref: string;
  bgImage: string;
  cardImage: string;
  alt: string;
  alt_am?: string;
}

export interface ServicesContent {
  sectionLabel: string;
  sectionLabel_am?: string;
  services: ServiceItem[];
}

const DEFAULT_CONTENT: ServicesContent = {
  sectionLabel: 'Our Real Estate Services',
  sectionLabel_am: 'የሪል እስቴት አገልግሎቶቻችን',
  services: [
    {
      serviceKey: 'sales',
      eyebrow: 'Service 01',
      eyebrow_am: 'አገልግሎት 01',
      title: 'Property Sales',
      title_am: 'የቤቶች ሽያጭ',
      text: 'Direct representation for prime residential villas, apartments, and commercial buildings in Addis Ababa.',
      text_am: 'በአዲስ አበባ ተመራጭ የመኖሪያ ቪላዎች፣ አፓርታማዎች እና የንግድ ህንፃዎች ሽያጭ ውክልና።',
      buttonLabel: 'Inquire About Sales',
      buttonLabel_am: 'ስለ ቤቶች ሽያጭ ይጠይቁ',
      buttonHref: `#contact?service=${encodeURIComponent('Property Sales')}&message=${encodeURIComponent('Hello, I would like to inquire about property sales listings in Addis Ababa.')}`,
      bgImage: imgSales,
      cardImage: imgSales,
      alt: 'Luxury architectural residence in Addis Ababa at dusk',
      alt_am: 'ዘመናዊ የመኖሪያ ቪላ በአዲስ አበባ',
    },
    {
      serviceKey: 'rentals',
      eyebrow: 'Service 02',
      eyebrow_am: 'አገልግሎት 02',
      title: 'Property Rentals',
      title_am: 'የቤቶች ኪራይ',
      text: 'Long-term luxury residential leases and executive commercial spaces in central districts.',
      text_am: 'የረጅም ጊዜ የቅንጦት የመኖሪያ ቤቶች እና የንግድ ቦታዎች ኪራይ በከተማዋ ማዕከል ሰፈሮች።',
      buttonLabel: 'Inquire About Rentals',
      buttonLabel_am: 'ስለ ቤቶች ኪራይ ይጠይቁ',
      buttonHref: `#contact?service=${encodeURIComponent('Property Rentals')}&message=${encodeURIComponent('Hello, I am interested in leasing residential or commercial property in Addis Ababa.')}`,
      bgImage: imgRentals,
      cardImage: imgRentals,
      alt: 'Executive luxury apartment interior overlooking Addis Ababa skyline',
      alt_am: 'ዘመናዊ የቅንጦት አፓርታማ ሳሎን እይታ',
    },
    {
      serviceKey: 'management',
      eyebrow: 'Service 03',
      eyebrow_am: 'አገልግሎት 03',
      title: 'Property Management',
      title_am: 'የንብረት አስተዳደር',
      text: 'Dedicated care, tenant coordination, and routine maintenance for property owners and diaspora investors.',
      text_am: 'ለአገር ውስጥና በውጭ ለሚኖሩ የንብረት ባለቤቶች አስተማማኝ የቤት አስተዳደር እና ጥገና አገልግሎት።',
      buttonLabel: 'Request Management Proposal',
      buttonLabel_am: 'የአስተዳደር አገልግሎት ይጠይቁ',
      buttonHref: `#contact?service=${encodeURIComponent('Property Management')}&message=${encodeURIComponent('Hello, I would like a management proposal for my property in Addis Ababa.')}`,
      bgImage: imgManagement,
      cardImage: imgManagement,
      alt: 'Curated residential neighborhood in Addis Ababa Bole subcity',
      alt_am: 'በቦሌ ክፍለ ከተማ የሚገኝ ጸጥ ያለ እና ተመራጭ ሰፈር',
    },
    {
      serviceKey: 'land',
      eyebrow: 'Service 04',
      eyebrow_am: 'አገልግሎት 04',
      title: 'Land & Plots',
      title_am: 'የልማት ቦታዎች እና ይዞታዎች',
      text: 'Curated residential and development acreage with verified survey documentation.',
      text_am: 'የተረጋገጠ የይዞታ መረጃ ያላቸው ለልማትና ለግንባታ የሚሆኑ ቦታዎች።',
      buttonLabel: 'Explore Development Land',
      buttonLabel_am: 'የልማት ቦታዎችን ይጠይቁ',
      buttonHref: `#contact?service=${encodeURIComponent('Land & Plots')}&message=${encodeURIComponent('Hello, I am inquiring about available land and development plots in Addis Ababa.')}`,
      bgImage: imgLand,
      cardImage: imgLand,
      alt: 'Aerial scenic view of prime development parcels and rolling hills in Addis Ababa',
      alt_am: 'ለልማት የሚሆኑ ሰፋፊ የቦታ ይዞታዎች እይታ',
    },
    {
      serviceKey: 'advisory',
      eyebrow: 'Service 05',
      eyebrow_am: 'አገልግሎት 05',
      title: 'Investment Advisory',
      title_am: 'የኢንቨስትመንት ማማከር',
      text: 'Independent market evaluations, subcity yield projections, and acquisition feasibility analysis.',
      text_am: 'ገለልተኛ የገበያ ግምገማ፣ የትርፍ ትንበያ እና የአዋጭነት ጥናት ለአልሚዎች እና ባለሀብቶች።',
      buttonLabel: 'Schedule Advisory Session',
      buttonLabel_am: 'የኢንቨስትመንት ምክክር ያግኙ',
      buttonHref: `#contact?service=${encodeURIComponent('Investment Advisory')}&message=${encodeURIComponent('Hello, I would like to schedule an investment consultation regarding Addis Ababa real estate.')}`,
      bgImage: imgAdvisory,
      cardImage: imgAdvisory,
      alt: 'Modern commercial tower in Addis Ababa financial district at dusk',
      alt_am: 'በአዲስ አበባ የፋይናንስ ማዕከል የሚገኝ ዘመናዊ የንግድ ህንፃ',
    },
    {
      serviceKey: 'interior',
      eyebrow: 'Service 06',
      eyebrow_am: 'አገልግሎት 06',
      title: 'Interior & Renovation',
      title_am: 'የውስጥ ዲዛይን እና እድሳት',
      text: 'Architectural modernizations, custom cabinetry, and space optimization for newly acquired properties.',
      text_am: 'ለአዳዲስና ለነባር ቤቶች ዘመናዊ የስነ-ህንፃ ማሻሻያ እና የውስጥ ዲዛይን አገልግሎት።',
      buttonLabel: 'Request Renovation Consultation',
      buttonLabel_am: 'የእድሳት ምክክር ይጠይቁ',
      buttonHref: `#contact?service=${encodeURIComponent('Interior & Renovation')}&message=${encodeURIComponent('Hello, I would like to consult regarding interior architecture or renovation in Addis Ababa.')}`,
      bgImage: imgInterior,
      cardImage: imgInterior,
      alt: 'Welcoming luxury private residence entrance with custom wood and stone craftsmanship',
      alt_am: 'የተመረጡ የእንጨትና የድንጋይ ጥበባት ያለው የቤት መግቢያ በር',
    },
  ],
};

const CONFIG = {
  autoplay: true,
  interval: 4500, // 4500ms display per slide
  duration: 650,  // 650ms transition
};

export interface ServicesSliderProps {
  content?: ServicesContent;
  companySettings?: Partial<CompanySettings> | null;
  className?: string;
}

export default function ServicesSlider({
  content = DEFAULT_CONTENT,
  companySettings,
  className = '',
}: ServicesSliderProps) {
  const { language, t } = useLanguage();

  // Filter services: show "Property Rentals" only if company_settings.rent_listings_enabled is true
  const isRentalsEnabled = Boolean(companySettings?.rent_listings_enabled);
  const rawServices = content.services || DEFAULT_CONTENT.services;

  const filteredServices = useMemo(() => {
    return rawServices.filter((service) => {
      if (service.serviceKey === 'rentals' || service.title.toLowerCase().includes('rental')) {
        return isRentalsEnabled;
      }
      return true;
    });
  }, [rawServices, isRentalsEnabled]);

  const total = filteredServices.length;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [slideOffset, setSlideOffset] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const elapsedRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisibleInViewportRef = useRef<boolean>(true);
  const isTabVisibleRef = useRef<boolean>(true);
  const prevIndexRef = useRef<number>(0);

  // Keep currentIndex bounded if total items change (e.g. rentals toggled)
  useEffect(() => {
    if (currentIndex >= total) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Listen for prefers-reduced-motion changes dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
  }, []);

  // Smooth, glitch-free transition handler for any step distance or direction
  const goToSlide = useCallback(
    (targetIndex: number, directionHint?: 'next' | 'prev') => {
      if (isTransitioning || targetIndex === currentIndex || total <= 1) return;

      if (reducedMotion) {
        prevIndexRef.current = currentIndex;
        setCurrentIndex(targetIndex);
        elapsedRef.current = 0;
        setProgressPercent(0);
        if (progressBarRef.current) {
          progressBarRef.current.style.transform = 'scaleX(0)';
        }
        return;
      }

      setIsTransitioning(true);
      elapsedRef.current = 0;
      setProgressPercent(0);
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = 'scaleX(0)';
      }

      // Compute step distance in track:
      // Inactive track cards are positioned relative to currentIndex + 1
      let step = 1;
      if (directionHint === 'prev') {
        step = -1;
      } else {
        // Find position of targetIndex inside the inactive queue
        const posInQueue = (targetIndex - (currentIndex + 1) + total) % total;
        step = posInQueue + 1;
      }

      setSlideOffset(step);

      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }

      transitionTimerRef.current = setTimeout(() => {
        prevIndexRef.current = currentIndex;
        setCurrentIndex(targetIndex);
        // Reset track position instantly without animation
        setSlideOffset(0);
        setIsTransitioning(false);
      }, CONFIG.duration);
    },
    [isTransitioning, currentIndex, total, reducedMotion]
  );

  const handleNext = useCallback(() => {
    goToSlide((currentIndex + 1) % total, 'next');
  }, [currentIndex, total, goToSlide]);

  const handlePrev = useCallback(() => {
    goToSlide((currentIndex - 1 + total) % total, 'prev');
  }, [currentIndex, total, goToSlide]);

  // Autoplay requestAnimationFrame loop with clamped delta (max 100ms per frame)
  useEffect(() => {
    if (!CONFIG.autoplay || reducedMotion || total <= 1) {
      if (progressBarRef.current) progressBarRef.current.style.transform = 'scaleX(0)';
      return;
    }

    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const rawDelta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      // Clamp time delta to max 100ms so returning from background tab never jumps instantly
      const delta = Math.min(rawDelta, 100);

      const shouldAdvance =
        !isPaused &&
        !isTransitioning &&
        isVisibleInViewportRef.current &&
        isTabVisibleRef.current;

      if (shouldAdvance) {
        elapsedRef.current += delta;
        const progress = Math.min(elapsedRef.current / CONFIG.interval, 1);
        setProgressPercent(progress * 100);

        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${progress})`;
        }

        if (elapsedRef.current >= CONFIG.interval) {
          elapsedRef.current = 0;
          handleNext();
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isPaused, isTransitioning, reducedMotion, handleNext, total]);

  // Tab visibility change
  useEffect(() => {
    const handleVisibility = () => {
      isTabVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // IntersectionObserver to pause when offscreen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleInViewportRef.current = entry.isIntersecting && entry.intersectionRatio > 0.15;
        });
      },
      { threshold: [0, 0.15, 0.5] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keyboard navigation: only ArrowLeft and ArrowRight (no PageUp / PageDown)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  // Touch swipe support
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const diffX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const diffY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const currentService = filteredServices[currentIndex] || filteredServices[0];
  const nextServiceIndex = (currentIndex + 1) % total;

  // Inactive carousel queue
  const inactiveCards = useMemo(() => {
    if (total <= 1) return [];
    return Array.from({ length: total - 1 }, (_, i) => {
      const slideIdx = (currentIndex + 1 + i) % total;
      return {
        index: slideIdx,
        data: filteredServices[slideIdx],
        positionInQueue: i,
      };
    });
  }, [currentIndex, total, filteredServices]);

  const localizedSectionLabel = t(content.sectionLabel, content.sectionLabel_am);
  const localizedEyebrow = t(currentService.eyebrow, currentService.eyebrow_am);
  const localizedTitle = t(currentService.title, currentService.title_am);
  const localizedText = t(currentService.text, currentService.text_am);
  const localizedButtonLabel = t(currentService.buttonLabel, currentService.buttonLabel_am);

  return (
    <section
      id="services"
      ref={sectionRef}
      className={`sv-slider-root ${className}`}
      aria-label={localizedSectionLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <style>{`
        .sv-slider-root {
          --sv-accent: #C8A35F;
          --sv-accent-hover: #DEC07E;
          --sv-bg: #0C0D10;
          --sv-card-bg: #141519;
          --sv-text: #F5F3EF;
          --sv-text-muted: #B4B1A8;
          --sv-font-heading: 'Plus Jakarta Sans', 'Noto Sans Ethiopic', system-ui, -apple-system, sans-serif;
          --sv-font-body: 'DM Sans', 'Noto Sans Ethiopic', system-ui, -apple-system, sans-serif;
          --sv-radius: 14px;
          --sv-card-w: clamp(140px, 14vw, 220px);
          --sv-card-h: clamp(200px, 21vw, 320px);
          --sv-card-gap: clamp(12px, 1.2vw, 24px);

          position: relative;
          width: 100%;
          min-height: 100vh;
          min-height: 100svh;
          min-height: 100dvh;
          height: auto;
          background-color: var(--sv-bg);
          color: var(--sv-text);
          font-family: var(--sv-font-body);
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(24px, 4vw, 56px) clamp(20px, 4.5vw, 64px);
          box-sizing: border-box;
          user-select: none;
          outline: none;
        }

        .sv-slider-root * {
          box-sizing: border-box;
        }

        /* Amharic Typography Normalization */
        :lang(am) .sv-heading,
        :lang(am) .sv-desc,
        :lang(am) .sv-eyebrow,
        :lang(am) .sv-card-title,
        .lang-am .sv-slider-root * {
          letter-spacing: normal !important;
          line-height: 1.625 !important;
        }

        .sv-slider-root:focus-visible {
          box-shadow: inset 0 0 0 2px var(--sv-accent);
        }

        /* Stacked background layers for cross-fading */
        .sv-bg-layers {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }

        .sv-bg-item {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transform: scale(1.04);
          transition: opacity ${CONFIG.duration}ms cubic-bezier(0.4, 0, 0.2, 1),
                      transform ${CONFIG.duration * 1.5}ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }

        .sv-bg-item.sv-active {
          opacity: 1;
          transform: scale(1);
          z-index: 2;
        }

        .sv-bg-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        /* Permanent dark contrast overlay layer */
        .sv-overlay {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: 
            linear-gradient(to right, rgba(12, 13, 16, 0.95) 0%, rgba(12, 13, 16, 0.78) 42%, rgba(12, 13, 16, 0.40) 75%, rgba(12, 13, 16, 0.75) 100%),
            linear-gradient(to top, rgba(12, 13, 16, 0.96) 0%, rgba(12, 13, 16, 0.3) 45%, rgba(12, 13, 16, 0.6) 100%);
        }

        /* Top Bar */
        .sv-top-bar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 16px;
        }

        .sv-section-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--sv-font-body);
          font-size: clamp(11px, 0.85vw, 13px);
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--sv-accent);
        }

        .sv-section-badge::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: var(--sv-accent);
          opacity: 0.8;
        }

        .sv-live-badge {
          font-size: 12px;
          letter-spacing: 0.08em;
          color: var(--sv-text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sv-live-badge span {
          color: var(--sv-accent);
          font-weight: 600;
        }

        /* Main Content Stage */
        .sv-stage {
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          align-items: center;
          gap: clamp(32px, 5vw, 80px);
          width: 100%;
          margin: auto 0;
          padding: 16px 0;
        }

        /* Left Side */
        .sv-info-pane {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          max-width: 580px;
        }

        .sv-eyebrow {
          font-size: clamp(12px, 0.95vw, 14px);
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--sv-accent);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sv-eyebrow-num {
          font-variant-numeric: tabular-nums;
        }

        .sv-heading {
          font-family: var(--sv-font-heading);
          font-size: clamp(2rem, 3.8vw, 3.6rem);
          line-height: 1.12;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--sv-text);
          margin: 0 0 16px 0;
          text-shadow: 0 4px 18px rgba(0, 0, 0, 0.7);
          text-wrap: balance;
        }

        .sv-desc {
          font-size: clamp(14px, 1.05vw, 17px);
          line-height: 1.6;
          color: rgba(245, 243, 239, 0.9);
          margin: 0 0 clamp(24px, 2.5vh, 36px) 0;
          max-width: 48ch;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        }

        .sv-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background-color: var(--sv-accent);
          color: #0C0D10;
          font-family: var(--sv-font-body);
          font-size: clamp(13px, 0.95vw, 15px);
          font-weight: 600;
          letter-spacing: 0.02em;
          text-decoration: none;
          min-height: 48px;
          padding: 12px 28px;
          border-radius: 9999px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1),
                      background-color 180ms ease,
                      box-shadow 180ms ease;
          cursor: pointer;
          white-space: nowrap;
          border: none;
        }

        .sv-cta-btn:hover {
          background-color: var(--sv-accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(200, 163, 95, 0.35);
        }

        .sv-cta-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px var(--sv-accent);
        }

        /* Right Side: Inactive Cards Window */
        .sv-carousel-window {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 16px 0;
          mask-image: linear-gradient(to right, black 80%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, black 80%, transparent 100%);
        }

        .sv-cards-track {
          display: flex;
          gap: var(--sv-card-gap);
          will-change: transform;
        }

        .sv-cards-track.sv-smooth {
          transition: transform ${CONFIG.duration}ms cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* Portrait Cards */
        .sv-card {
          position: relative;
          flex-shrink: 0;
          width: var(--sv-card-w);
          height: var(--sv-card-h);
          border-radius: var(--sv-radius);
          overflow: hidden;
          background: #141519;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          cursor: pointer;
          transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 220ms ease;
          transform: translateY(0);
          text-align: left;
          padding: 0;
          margin: 0;
          outline: none;
        }

        .sv-card:hover {
          transform: translateY(-8px);
          border-color: rgba(200, 163, 95, 0.5);
        }

        .sv-card:focus-visible {
          box-shadow: 0 0 0 2px var(--sv-accent);
        }

        .sv-card-img-wrap {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .sv-card-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .sv-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(12, 13, 16, 0.95) 0%, rgba(12, 13, 16, 0.5) 45%, transparent 75%);
          pointer-events: none;
        }

        .sv-card-meta {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sv-card-index {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--sv-accent);
          font-variant-numeric: tabular-nums;
        }

        .sv-card-title {
          font-family: var(--sv-font-heading);
          font-size: clamp(13px, 1vw, 15px);
          font-weight: 600;
          line-height: 1.25;
          color: #FFFFFF;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Bottom Controls Bar */
        .sv-bottom-bar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding-top: 20px;
          gap: 16px;
        }

        .sv-controls-group {
          display: flex;
          align-items: center;
          gap: clamp(12px, 1.8vw, 24px);
        }

        .sv-counter {
          font-family: var(--sv-font-heading);
          font-size: clamp(13px, 1vw, 15px);
          font-weight: 600;
          color: var(--sv-text-muted);
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          gap: 6px;
          font-variant-numeric: tabular-nums;
        }

        .sv-counter-active {
          color: var(--sv-accent);
          font-size: clamp(15px, 1.1vw, 18px);
        }

        .sv-counter-sep {
          opacity: 0.4;
        }

        /* Arrows & Pause Button */
        .sv-arrow-btns {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sv-nav-btn {
          min-width: 44px;
          min-height: 44px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--sv-text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 160ms ease,
                      border-color 160ms ease,
                      transform 160ms ease;
          outline: none;
        }

        .sv-nav-btn:hover {
          background: rgba(200, 163, 95, 0.2);
          border-color: var(--sv-accent);
          color: var(--sv-accent);
          transform: translateY(-2px);
        }

        .sv-nav-btn:focus-visible {
          box-shadow: 0 0 0 2px var(--sv-accent);
        }

        .sv-play-pause-btn {
          min-width: 44px;
          min-height: 44px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--sv-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 160ms ease,
                      border-color 160ms ease,
                      transform 160ms ease;
          outline: none;
        }

        .sv-play-pause-btn:hover {
          background: rgba(200, 163, 95, 0.25);
          border-color: var(--sv-accent);
          transform: translateY(-2px);
        }

        .sv-play-pause-btn:focus-visible {
          box-shadow: 0 0 0 2px var(--sv-accent);
        }

        /* Autoplay Progress Bar */
        .sv-progress-container {
          flex: 1;
          max-width: 220px;
          height: 3px;
          background: rgba(255, 255, 255, 0.14);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }

        .sv-progress-fill {
          position: absolute;
          inset: 0;
          background: var(--sv-accent);
          transform-origin: left;
          transform: scaleX(0);
          will-change: transform;
        }

        .sv-pause-note {
          font-size: 11px;
          letter-spacing: 0.05em;
          color: var(--sv-text-muted);
          opacity: 0;
          transition: opacity 180ms ease;
          white-space: nowrap;
        }

        .sv-pause-note.is-visible {
          opacity: 1;
        }

        /* Responsive Design: Supports Landscape phones without clipping */
        @media (max-width: 1024px) {
          .sv-stage {
            grid-template-columns: 1fr 1fr;
            gap: 28px;
          }
          .sv-slider-root {
            --sv-card-w: clamp(130px, 18vw, 170px);
            --sv-card-h: clamp(190px, 26vw, 240px);
          }
        }

        @media (max-width: 768px) {
          .sv-slider-root {
            min-height: 100svh;
            min-height: 100dvh;
            height: auto;
            padding: 24px 18px 20px 18px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            --sv-card-w: 120px;
            --sv-card-h: 165px;
            --sv-card-gap: 12px;
          }

          .sv-stage {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            width: 100%;
            margin: 16px 0;
            flex: 1;
            justify-content: center;
          }

          .sv-info-pane {
            max-width: 100%;
          }

          .sv-heading {
            font-size: clamp(1.7rem, 6.5vw, 2.3rem);
            margin-bottom: 12px;
            max-width: 100%;
            line-height: 1.15;
          }

          .sv-desc {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 20px;
            max-width: 100%;
          }

          .sv-carousel-window {
            width: 100%;
            padding: 8px 0;
          }

          .sv-bottom-bar {
            padding-top: 14px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .sv-progress-container {
            max-width: 100px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sv-bg-item,
          .sv-cards-track,
          .sv-card,
          .sv-cta-btn,
          .sv-nav-btn {
            transition: none !important;
          }
          .sv-progress-fill {
            display: none !important;
          }
          .sv-bg-item {
            transform: none !important;
          }
        }
      `}</style>

      {/* Layer 1: Stacked Background Images with selective loading (active and next only) */}
      <div className="sv-bg-layers" aria-hidden="true">
        {filteredServices.map((item, idx) => {
          const isActive = idx === currentIndex;
          const isNext = idx === nextServiceIndex;
          const isPrev = idx === prevIndexRef.current && isTransitioning;
          // Only load the active background and the next one (plus previous during transition)
          const shouldLoadBg = isActive || isNext || isPrev;

          return (
            <div
              key={idx}
              className={`sv-bg-item ${isActive ? 'sv-active' : ''}`}
            >
              {shouldLoadBg ? (
                <img
                  src={item.bgImage}
                  alt={t(item.alt, item.alt_am)}
                  loading={isActive ? 'eager' : 'lazy'}
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Layer 2: Permanent Dark Contrast Overlay Layer */}
      <div className="sv-overlay" aria-hidden="true" />

      {/* Layer 3: Top Navigation / Branding Label */}
      <header className="sv-top-bar">
        <span className="sv-section-badge">{localizedSectionLabel}</span>
        <div className="sv-live-badge">
          {t('Autoplay', 'አውቶፕሌይ')}:{' '}
          <span>{isPaused ? t('Paused', 'ቆሟል') : t('Active', 'በርቷል')}</span>
        </div>
      </header>

      {/* Layer 4: Stage with Active Info (Left) and Inactive Cards Track (Right) */}
      <div className="sv-stage">
        <div className="sv-info-pane">
          <span className="sv-eyebrow">
            <span className="sv-eyebrow-num">
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span>—</span>
            <span>{localizedEyebrow}</span>
          </span>

          <h2 className="sv-heading">{localizedTitle}</h2>

          <p className="sv-desc">{localizedText}</p>

          <a
            href={currentService.buttonHref}
            className="sv-cta-btn"
            aria-label={`${localizedButtonLabel}: ${localizedTitle}`}
          >
            <span>{localizedButtonLabel}</span>
            <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 hover:translate-x-1" />
          </a>
        </div>

        {/* Right Side Inactive Cards Carousel */}
        {total > 1 && (
          <div className="sv-carousel-window" aria-label="Upcoming services list">
            <div
              ref={trackRef}
              className={`sv-cards-track ${isTransitioning ? 'sv-smooth' : ''}`}
              style={{
                transform: slideOffset !== 0
                  ? `translateX(calc(-1 * ${slideOffset} * (var(--sv-card-w) + var(--sv-card-gap))))`
                  : 'translateX(0)',
              }}
            >
              {inactiveCards.map((card) => {
                const cardEyebrow = t(card.data.eyebrow, card.data.eyebrow_am);
                const cardTitle = t(card.data.title, card.data.title_am);

                return (
                  <button
                    type="button"
                    key={card.index}
                    className="sv-card"
                    onClick={() => goToSlide(card.index, 'next')}
                    aria-label={`Switch to ${cardTitle}`}
                  >
                    <div className="sv-card-img-wrap">
                      <img
                        src={card.data.cardImage}
                        alt={t(card.data.alt, card.data.alt_am)}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="sv-card-overlay" />
                    <div className="sv-card-meta">
                      <span className="sv-card-index">
                        {String(card.index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="sv-card-title">{cardTitle}</h3>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Layer 5: Bottom Controls, Counter, Pause/Play Button, and Progress Bar */}
      <footer className="sv-bottom-bar">
        <div className="sv-controls-group">
          {/* Arrow Buttons & Pause/Play Button */}
          <div className="sv-arrow-btns">
            <button
              type="button"
              className="sv-nav-btn"
              onClick={handlePrev}
              aria-label={t('Previous service', 'ቀዳሚ አገልግሎት')}
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.25]" />
            </button>

            <button
              type="button"
              className="sv-nav-btn"
              onClick={handleNext}
              aria-label={t('Next service', 'ቀጣይ አገልግሎት')}
            >
              <ChevronRight className="w-5 h-5 stroke-[2.25]" />
            </button>

            {/* Visible Pause / Play Button */}
            <button
              type="button"
              className="sv-play-pause-btn"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={
                isPaused
                  ? t('Resume service autoplay', 'አውቶፕሌይ አስጀምር')
                  : t('Pause service autoplay', 'አውቶፕሌይ አቁም')
              }
            >
              {isPaused ? (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              ) : (
                <Pause className="w-4 h-4 fill-current" />
              )}
            </button>
          </div>

          {/* Counter with aria-live="off" during autoplay */}
          <div className="sv-counter" aria-live={isPaused ? 'polite' : 'off'}>
            <span className="sv-counter-active">
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span className="sv-counter-sep">/</span>
            <span>{String(total).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Progress Bar with aria-valuenow and Pause Indicator */}
        <div className="sv-controls-group" style={{ flex: 1, justifyContent: 'flex-end' }}>
          <div
            className="sv-progress-container"
            role="progressbar"
            aria-label="Time until next service"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercent)}
          >
            <div ref={progressBarRef} className="sv-progress-fill" />
          </div>

          <span className={`sv-pause-note ${isPaused ? 'is-visible' : ''}`} aria-hidden="true">
            {t('Paused', 'ቆሟል')}
          </span>
        </div>
      </footer>
    </section>
  );
}
