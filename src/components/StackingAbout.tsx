import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import { isSlowConnection, isLowEndDevice } from '../polyfills';

import imgVilla from '../assets/images/about_villa_exterior_1793311211872.jpg';
import imgInterior from '../assets/images/about_modern_interior_1793311212933.jpg';
import imgDistrict from '../assets/images/about_bole_district_1793311213385.jpg';
import imgEntrance from '../assets/images/about_estate_entrance_1793311213911.jpg';

export interface CardItem {
  eyebrow: string;
  eyebrow_am?: string;
  title: string;
  title_am?: string;
  text: string;
  text_am?: string;
  image: string;
  alt: string;
  alt_am?: string;
}

export interface AboutContent {
  ariaLabel: string;
  ariaLabel_am?: string;
  intro: {
    eyebrow: string;
    eyebrow_am?: string;
    heading: string;
    heading_am?: string;
    scrollPrompt: string;
    scrollPrompt_am?: string;
  };
  cards: CardItem[];
  outro: {
    heading: string;
    heading_am?: string;
    buttonLabel: string;
    buttonLabel_am?: string;
    buttonHref: string;
  };
}

/**
 * Default placeholder content without unsubstantiated claims about years of experience,
 * awards, or fabricated statistics. Verified, honest representation of Addis Ababa real estate.
 */
export const CONTENT: AboutContent = {
  ariaLabel: 'About Addis Ababa real estate agency presentation',
  ariaLabel_am: 'ስለ አዲስ አበባ ሪል እስቴት ኤጀንሲ መረጃ',
  intro: {
    eyebrow: 'About Us',
    eyebrow_am: 'ስለ እኛ',
    heading: "Dedicated to Addis Ababa's Fine Residences & Commercial Spaces",
    heading_am: 'ለአዲስ አበባ ተመራጭ የመኖሪያ እና የንግድ ቤቶች ቁርጠኛ',
    scrollPrompt: 'Scroll to explore',
    scrollPrompt_am: 'ዝርዝሩን ለማየት ወደታች ይሸብልሉ',
  },
  cards: [
    {
      eyebrow: 'Local Focus',
      eyebrow_am: 'የአካባቢ እውቀት',
      title: 'Ground Knowledge Across Addis Ababa',
      title_am: 'በአዲስ አበባ ጥልቅ የአካባቢ ግንዛቤ',
      text: "We specialize in Addis Ababa's established residential and commercial sectors, offering direct insight into subcities, neighborhood accessibility, and real property tenure.",
      text_am: 'ትኩረታችን በአዲስ አበባ ዋና ዋና የመኖሪያ እና የንግድ ሰፈሮች ላይ በማድረግ፣ ስለ ክፍለ ከተሞች እና የይዞታ ማረጋገጫዎች ትክክለኛ መረጃ እንሰጣለን።',
      image: imgVilla,
      alt: 'Contemporary luxury villa overlooking Addis Ababa',
      alt_am: 'በአዲስ አበባ ተራሮች ስር የሚገኝ ዘመናዊ ቪላ',
    },
    {
      eyebrow: 'Our Portfolio',
      eyebrow_am: 'የቤቶች ስብስብ',
      title: 'Curated Residences & Investment Assets',
      title_am: 'ምርጥ የመኖሪያ ቤቶች እና የኢንቨስትመንት ቦታዎች',
      text: 'From secluded residential compounds in Bole and Old Airport to executive apartments in Kazanchis, we represent verified properties prepared for acquisition or leasing.',
      text_am: 'በቦሌ እና ኦልድ ኤርፖርት ከሚገኙ ቪላዎች እስከ ካዛንቺስ ዘመናዊ አፓርታማዎች ድረስ ህጋዊነታቸው የተረጋገጡ ቤቶችን እናቀርባለን።',
      image: imgInterior,
      alt: 'Luxury interior living space with panoramic city view',
      alt_am: 'የከተማ እይታ ያለው የዘመናዊ ሳሎን የውስጥ ዲዛይን',
    },
    {
      eyebrow: 'Integrity & Clarity',
      eyebrow_am: 'ግልጽነት እና ተጠያቂነት',
      title: 'Direct, Transparent Advisory',
      title_am: 'ቀጥተኛ እና ግልጽ የአሰራር ሂደት',
      text: 'Every transaction is conducted with transparent documentation, clear title verification, and open communication with zero ambiguous claims.',
      text_am: 'እያንዳንዱ የሪል እስቴት ግብይት በግልጽ ሰነድ፣ በተረጋገጠ የካርታ ሰነድ እና ግልጽ ግንኙነት ይመራል።',
      image: imgDistrict,
      alt: 'Curated residential neighborhood in Addis Ababa',
      alt_am: 'በአዲስ አበባ የሚገኝ ጸጥ ያለ እና ተመራጭ ሰፈር',
    },
    {
      eyebrow: 'Client Support',
      eyebrow_am: 'የደንበኞች አገልግሎት',
      title: 'Local & Diaspora Guidance',
      title_am: 'በአገር ውስጥ እና በውጭ ለሚኖሩ ደንበኞች',
      text: 'Whether seeking a primary home or an investment from abroad, our team coordinates private viewings, legal due diligence, and structured handover processes.',
      text_am: 'በአገር ውስጥም ሆነ በውጭ አገር ለሚኖሩ ኢትዮጵያውያን አስተማማኝ የንብረት ጉብኝት፣ ህጋዊ ማጣራት እና የርክክብ ሂደቶችን እናመቻቻለን።',
      image: imgEntrance,
      alt: 'Architectural welcoming entrance to luxury residence',
      alt_am: 'የዘመናዊ መኖሪያ ቤት መግቢያ በር ገጽታ',
    },
  ],
  outro: {
    heading: "Let's discuss your Addis Ababa real estate plans.",
    heading_am: 'ስለ ንብረት ፍላጎትዎ በጋራ እንወያይ።',
    buttonLabel: 'Contact Us',
    buttonLabel_am: 'ያነጋግሩን',
    buttonHref: '#contact',
  },
};

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface StackingAboutProps {
  intro?: AboutContent['intro'];
  cards?: CardItem[];
  outro?: AboutContent['outro'];
  ariaLabel?: string;
  className?: string;
}

export default function StackingAbout({
  intro = CONTENT.intro,
  cards = CONTENT.cards,
  outro = CONTENT.outro,
  ariaLabel = CONTENT.ariaLabel,
  className = '',
}: StackingAboutProps) {
  const { language, t } = useLanguage();

  const containerRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const introHeadingRef = useRef<HTMLHeadingElement>(null);
  const cardsWrapRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardInnerRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardDimRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardImgRef = useRef<(HTMLImageElement | null)[]>([]);
  const cardContentRef = useRef<(HTMLDivElement | null)[]>([]);
  const outroRef = useRef<HTMLDivElement>(null);
  const outroContentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isProgressVisible, setIsProgressVisible] = useState<boolean>(false);
  const [useStickyFallback, setUseStickyFallback] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Dynamic prefers-reduced-motion listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

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

  const totalCards = cards.length;

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    if (!container) return;

    // Only skip pinning and scrubbing if user explicitly prefers reduced motion
    if (prefersReducedMotion) {
      try {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.vars.id?.toString().startsWith('sa-')) {
            st.kill();
          }
        });
      } catch {
        // Ignore
      }
      return;
    }

    try {
      // Register GSAP ScrollTrigger safely inside try/catch
      gsap.registerPlugin(ScrollTrigger);

      // Prevent mobile address bar jitter and Android scroll lag
      ScrollTrigger.config({ ignoreMobileResize: true });
      ScrollTrigger.normalizeScroll(false);

      const cardEls = cardElementsRef.current.filter((el): el is HTMLDivElement => el !== null);
      const cardInners = cardInnerRef.current.filter((el): el is HTMLDivElement => el !== null);
      const cardDims = cardDimRef.current.filter((el): el is HTMLDivElement => el !== null);
      const cardImgs = cardImgRef.current.filter((el): el is HTMLImageElement => el !== null);
      const cardContents = cardContentRef.current.filter((el): el is HTMLDivElement => el !== null);
      const introEl = introRef.current;
      const introHeading = introHeadingRef.current;
      const outroEl = outroRef.current;
      const outroContent = outroContentRef.current;

      if (cardEls.length === 0 || !introEl || !outroEl) return;

      const ctx = gsap.context(() => {
        // 1. HERO INTRO ANIMATION
        if (introHeading) {
          gsap.to(introHeading, {
            opacity: 0,
            y: -40,
            scale: 0.96,
            ease: 'none',
            scrollTrigger: {
              id: 'sa-intro',
              trigger: introEl,
              start: 'top top',
              end: 'bottom top',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }

        // 2. STACKING CARDS PINNING (Active on desktop, laptop, and phones)
        cardEls.forEach((card, i) => {
          ScrollTrigger.create({
            id: `sa-pin-${i}`,
            trigger: card,
            start: 'top top',
            endTrigger: outroEl,
            end: 'top top',
            pin: true,
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          });
        });

        // 3. CARD 0 INITIAL ENTRANCE
        if (cardImgs[0]) {
          gsap.fromTo(
            cardImgs[0],
            { scale: 1.08 },
            {
              scale: 1.0,
              ease: 'none',
              scrollTrigger: {
                id: 'sa-card-0-zoom',
                trigger: cardEls[0],
                start: 'top bottom',
                end: 'top top',
                scrub: 1,
              },
            }
          );
        }

        // 4. TRANSITIONS BETWEEN CARDS
        // Uses opacity overlay on .sa-card-dim instead of filter: brightness for GPU speed
        for (let i = 1; i < cardEls.length; i++) {
          const incomingCard = cardEls[i];
          const incomingImg = cardImgs[i];
          const incomingContent = cardContents[i];

          const tl = gsap.timeline({
            scrollTrigger: {
              id: `sa-transition-${i}`,
              trigger: incomingCard,
              start: 'top bottom',
              end: 'top top',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });

          if (cardInners[i - 1]) {
            tl.to(
              cardInners[i - 1],
              {
                scale: 0.91,
                yPercent: -3.5,
                ease: 'none',
                force3D: true,
              },
              0
            );
          }

          if (cardDims[i - 1]) {
            tl.to(
              cardDims[i - 1],
              {
                opacity: 0.35,
                ease: 'none',
              },
              0
            );
          }

          for (let j = 0; j < i - 1; j++) {
            if (cardInners[j]) {
              tl.to(
                cardInners[j],
                {
                  scale: Math.max(0.82, 0.91 - (i - 1 - j) * 0.04),
                  yPercent: -3.5 - (i - 1 - j) * 1.5,
                  ease: 'none',
                  force3D: true,
                },
                0
              );
            }
            if (cardDims[j]) {
              tl.to(
                cardDims[j],
                {
                  opacity: Math.min(0.65, 0.35 + (i - 1 - j) * 0.12),
                  ease: 'none',
                },
                0
              );
            }
          }

          if (incomingImg) {
            tl.fromTo(incomingImg, { scale: 1.12 }, { scale: 1.0, ease: 'none' }, 0);
          }

          if (incomingContent) {
            tl.fromTo(incomingContent, { opacity: 0.15, y: 35 }, { opacity: 1, y: 0, ease: 'none' }, 0);
          }
        }

        // 5. OUTRO SLIDE-UP
        const lastCardInner = cardInners[cardEls.length - 1];
        const lastCardDim = cardDims[cardEls.length - 1];
        if (lastCardInner && outroEl) {
          const outroTl = gsap.timeline({
            scrollTrigger: {
              id: 'sa-outro-timeline',
              trigger: outroEl,
              start: 'top bottom',
              end: 'top top',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });

          outroTl.to(
            lastCardInner,
            {
              scale: 0.91,
              yPercent: -3.5,
              ease: 'none',
              force3D: true,
            },
            0
          );

          if (lastCardDim) {
            outroTl.to(
              lastCardDim,
              {
                opacity: 0.38,
                ease: 'none',
              },
              0
            );
          }

          if (outroContent) {
            outroTl.fromTo(outroContent, { opacity: 0.2, y: 40 }, { opacity: 1, y: 0, ease: 'none' }, 0);
          }
        }

        // 6. ACTIVE CARD TRACKING & PROGRESS VISIBILITY
        cardEls.forEach((card, index) => {
          ScrollTrigger.create({
            id: `sa-track-${index}`,
            trigger: card,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => setActiveCardIndex(index),
            onEnterBack: () => setActiveCardIndex(index),
          });
        });

        if (cardsWrapRef.current) {
          ScrollTrigger.create({
            id: 'sa-progress-visibility',
            trigger: cardsWrapRef.current,
            start: 'top center',
            endTrigger: outroEl,
            end: 'top center',
            onEnter: () => setIsProgressVisible(true),
            onLeave: () => setIsProgressVisible(false),
            onEnterBack: () => setIsProgressVisible(true),
            onLeaveBack: () => setIsProgressVisible(false),
          });
        }
      }, container);

      // Refresh triggers once all images load safely
      const images = container.querySelectorAll('img');
      let loadedCount = 0;
      const totalImgCount = images.length;

      const onImageLoaded = () => {
        loadedCount++;
        if (loadedCount >= totalImgCount) {
          try {
            ScrollTrigger.refresh();
          } catch {
            // Ignore
          }
        }
      };

      images.forEach((img) => {
        if (img.complete) {
          onImageLoaded();
        } else {
          img.addEventListener('load', onImageLoaded);
          img.addEventListener('error', onImageLoaded);
        }
      });

      // Window load refresh
      const handleWindowLoad = () => {
        try {
          ScrollTrigger.refresh();
        } catch {
          // Ignore
        }
      };
      window.addEventListener('load', handleWindowLoad, { passive: true });

      return () => {
        window.removeEventListener('load', handleWindowLoad);
        images.forEach((img) => {
          img.removeEventListener('load', onImageLoaded);
          img.removeEventListener('error', onImageLoaded);
        });
        ctx.revert();
      };
    } catch (err) {
      console.warn('[StackingAbout] GSAP initialization error; falling back to CSS sticky:', err);
      setUseStickyFallback(true);
    }
  }, [prefersReducedMotion, totalCards]);

  const handleDotClick = (index: number) => {
    try {
      const targetPin = ScrollTrigger.getById(`sa-pin-${index}`);
      if (targetPin) {
        window.scrollTo({
          top: targetPin.start,
          behavior: 'smooth',
        });
        return;
      }
    } catch {
      // Fallback below
    }
    cardElementsRef.current[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  const localizedAriaLabel = t(ariaLabel, CONTENT.ariaLabel_am);
  const localizedIntroEyebrow = t(intro.eyebrow || 'About Us', intro.eyebrow_am || 'ስለ እኛ');
  const localizedIntroHeading = t(intro.heading, intro.heading_am);
  const localizedScrollPrompt = t(intro.scrollPrompt || 'Scroll to explore', intro.scrollPrompt_am || 'ዝርዝሩን ለማየት ወደታች ይሸብልሉ');

  const localizedOutroHeading = t(outro.heading, outro.heading_am);
  const localizedOutroButtonLabel = t(outro.buttonLabel, outro.buttonLabel_am);

  return (
    <section
      id="about"
      ref={containerRef}
      className={`sa-section ${useStickyFallback ? 'sa-sticky-fallback' : ''} ${className}`}
      aria-label={localizedAriaLabel}
    >
      <style>{`
        /* ==========================================================================
           STACKING ABOUT SECTION - DESIGN SYSTEM TOKENS & FONTS
           ========================================================================== */
        .sa-section {
          --sa-bg: #0C0D10;
          --sa-card-bg: #141519;
          --sa-text: #F5F3EF;
          --sa-text-muted: #B4B1A8;
          --sa-accent: #C8A35F;
          --sa-accent-hover: #DEC07E;
          --sa-font-heading: 'Plus Jakarta Sans', 'Noto Sans Ethiopic', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --sa-font-body: 'DM Sans', 'Noto Sans Ethiopic', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --sa-radius: clamp(16px, 2.5vw, 26px);
          --sa-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08);

          position: relative;
          width: 100%;
          max-width: 100%;
          background-color: var(--sa-bg);
          color: var(--sa-text);
          font-family: var(--sa-font-body);
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        @supports (overflow: clip) {
          .sa-section {
            overflow-x: clip;
          }
        }

        .sa-section *, .sa-section *::before, .sa-section *::after {
          box-sizing: border-box;
        }

        /* Amharic Typography: Normal letter-spacing and 1.625 line-height */
        :lang(am) .sa-intro-eyebrow,
        :lang(am) .sa-intro-heading,
        :lang(am) .sa-card-eyebrow,
        :lang(am) .sa-card-title,
        :lang(am) .sa-card-text,
        :lang(am) .sa-outro-heading,
        .lang-am .sa-section *,
        [data-lang="am"] .sa-section * {
          letter-spacing: normal !important;
          line-height: 1.625 !important;
        }

        /* --------------------------------------------------------------------------
           HERO INTRO BLOCK (Using 100vh fallback before 100svh / 100dvh)
           -------------------------------------------------------------------------- */
        .sa-intro {
          position: relative;
          min-height: 100vh;
          min-height: 100svh;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: clamp(2rem, 5vw, 4rem) clamp(1.25rem, 4vw, 2.5rem);
          z-index: 1;
        }

        .sa-intro-content {
          max-width: clamp(320px, 90vw, 920px);
          margin: 0 auto;
          will-change: transform, opacity;
        }

        .sa-intro-eyebrow {
          display: inline-block;
          font-size: clamp(0.75rem, 0.9vw, 0.875rem);
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--sa-accent);
          margin-bottom: clamp(0.75rem, 2vh, 1.25rem);
        }

        .sa-intro-heading {
          font-family: var(--sa-font-heading);
          font-size: clamp(2.25rem, 5.5vw, 4.5rem);
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--sa-text);
          margin: 0 0 clamp(1rem, 2.5vh, 1.75rem) 0;
          text-wrap: normal;
          text-wrap: balance;
        }

        .sa-intro-prompt {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--sa-text-muted);
          opacity: 0.8;
          margin-top: 1rem;
        }

        .sa-intro-prompt svg {
          width: 14px;
          height: 14px;
          stroke: currentColor;
          animation: sa-bounce 2s infinite ease-in-out;
        }

        @keyframes sa-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }

        /* --------------------------------------------------------------------------
           STACKING CARDS CONTAINER & CARDS (Using 100vh fallback before 100svh / 100dvh)
           -------------------------------------------------------------------------- */
        .sa-cards-wrap {
          position: relative;
          width: 100%;
        }

        .sa-card {
          position: relative;
          height: 100vh;
          height: 100svh;
          height: 100dvh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(1rem, 3vh, 2.5rem) clamp(1rem, 3.5vw, 3rem);
          overflow: hidden;
        }

        .sa-card-inner {
          position: relative;
          width: 100%;
          max-width: clamp(320px, 86vw, 1200px);
          height: clamp(500px, 80vh, 740px);
          height: clamp(500px, 80dvh, 740px);
          border-radius: var(--sa-radius);
          overflow: hidden;
          background-color: var(--sa-card-bg);
          box-shadow: var(--sa-shadow);
          transform-origin: center top;
          will-change: transform;
        }

        .sa-card-dim {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          inset: 0;
          width: 100%;
          height: 100%;
          background-color: #000000;
          opacity: 0;
          pointer-events: none;
          z-index: 1;
        }

        /* Fallback CSS sticky behavior when GSAP is disabled or unavailable */
        .sa-sticky-fallback .sa-card {
          position: -webkit-sticky !important;
          position: sticky !important;
          top: 0 !important;
        }

        .sa-card-img-wrap {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #101114;
        }

        .sa-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          will-change: transform;
        }

        /* Enhanced gradient scrim */
        .sa-card-scrim {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(10, 11, 14, 0.90) 0%,
            rgba(10, 11, 14, 0.70) 22%,
            rgba(10, 11, 14, 0.25) 45%,
            rgba(10, 11, 14, 0.78) 72%,
            rgba(10, 11, 14, 0.96) 100%
          );
          pointer-events: none;
        }

        /* Top header: eyebrow label on left, card number on right */
        .sa-card-header {
          position: absolute;
          top: clamp(1.25rem, 3.5vh, 2.25rem);
          left: clamp(1.25rem, 3.5vw, 2.5rem);
          right: clamp(1.25rem, 3.5vw, 2.5rem);
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 2;
        }

        .sa-card-eyebrow {
          font-size: clamp(0.75rem, 0.85vw, 0.875rem);
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--sa-accent);
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
        }

        .sa-card-number {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-variant-numeric: tabular-nums;
          font-size: clamp(0.75rem, 0.85vw, 0.875rem);
          letter-spacing: 0.12em;
          color: rgba(245, 243, 239, 0.9);
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
        }

        /* Bottom text container: title & short paragraph */
        .sa-card-content {
          position: absolute;
          bottom: clamp(1.5rem, 4.5vh, 3rem);
          left: clamp(1.25rem, 3.5vw, 2.5rem);
          right: clamp(1.25rem, 3.5vw, 2.5rem);
          max-width: clamp(280px, 90%, 640px);
          z-index: 2;
          will-change: transform, opacity;
        }

        .sa-card-title {
          font-family: var(--sa-font-heading);
          font-size: clamp(1.65rem, 3.2vw, 2.75rem);
          font-weight: 600;
          line-height: 1.18;
          letter-spacing: -0.015em;
          color: var(--sa-text);
          margin: 0 0 clamp(0.5rem, 1.5vh, 0.875rem) 0;
          text-wrap: normal;
          text-wrap: balance;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
        }

        .sa-card-text {
          font-size: clamp(0.925rem, 1.1vw, 1.075rem);
          line-height: 1.6;
          color: var(--sa-text-muted);
          margin: 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
        }

        /* --------------------------------------------------------------------------
           THIN PROGRESS INDICATOR (Floating side bar)
           -------------------------------------------------------------------------- */
        .sa-progress {
          position: fixed;
          right: clamp(1rem, 2.5vw, 2.5rem);
          top: 50%;
          transform: translateY(-50%);
          z-index: 99;
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: center;
          padding: 8px 6px;
          background: rgba(18, 19, 23, 0.85);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.35s ease, visibility 0.35s ease;
        }

        .sa-progress.is-visible {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .sa-progress-dot-btn {
          min-width: 24px;
          min-height: 24px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          border-radius: 9999px;
          outline: none;
        }

        .sa-progress-dot-btn:focus-visible {
          box-shadow: 0 0 0 2px var(--sa-accent);
        }

        .sa-progress-dot-indicator {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.28);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sa-progress-dot-btn:hover .sa-progress-dot-indicator {
          background: rgba(255, 255, 255, 0.75);
        }

        .sa-progress-dot-btn.is-active .sa-progress-dot-indicator {
          height: 22px;
          background: var(--sa-accent);
          box-shadow: 0 0 10px rgba(200, 163, 95, 0.5);
        }

        /* --------------------------------------------------------------------------
           ENDING OUTRO BLOCK (Using 100vh fallback before 100svh / 100dvh)
           -------------------------------------------------------------------------- */
        .sa-outro {
          position: relative;
          min-height: 100vh;
          min-height: 100svh;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: clamp(2rem, 5vw, 4rem) clamp(1.25rem, 4vw, 2.5rem);
          background-color: var(--sa-bg);
          z-index: 20;
        }

        .sa-outro-content {
          max-width: clamp(320px, 90vw, 860px);
          margin: 0 auto;
          will-change: transform, opacity;
        }

        .sa-outro-heading {
          font-family: var(--sa-font-heading);
          font-size: clamp(2.25rem, 5.5vw, 4.5rem);
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--sa-text);
          margin: 0 0 clamp(1.5rem, 3.5vh, 2.5rem) 0;
          text-wrap: normal;
          text-wrap: balance;
        }

        .sa-outro-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          min-height: 48px;
          padding: clamp(0.85rem, 1.8vh, 1.1rem) clamp(2rem, 3.5vw, 2.75rem);
          background: var(--sa-accent);
          color: #0c0d10;
          font-family: var(--sa-font-heading);
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-decoration: none;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 12px 28px -6px rgba(200, 163, 95, 0.35);
        }

        .sa-outro-btn:hover {
          background: var(--sa-accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 16px 32px -6px rgba(200, 163, 95, 0.45);
        }

        .sa-outro-btn svg {
          width: 16px;
          height: 16px;
          stroke: currentColor;
          transition: transform 0.2s ease;
        }

        .sa-outro-btn:hover svg {
          transform: translateX(3px);
        }

        /* --------------------------------------------------------------------------
           RESPONSIVE MOBILE COMPOSITION
           Cards preserve viewport height and stack smoothly on mobile devices!
           -------------------------------------------------------------------------- */
        @media (max-width: 767px) {
          .sa-intro {
            min-height: 80vh;
            min-height: 80svh;
            min-height: 80dvh;
            padding: 3.5rem 1.25rem 2rem;
          }

          .sa-card {
            padding: 0.75rem 0.5rem;
          }

          .sa-card-inner {
            height: clamp(440px, 78vh, 600px);
            height: clamp(440px, 78dvh, 600px);
            max-width: 96vw;
            border-radius: 20px;
          }

          .sa-card-header {
            top: 1.25rem;
            left: 1.25rem;
            right: 1.25rem;
          }

          .sa-card-content {
            bottom: 1.5rem;
            left: 1.25rem;
            right: 1.25rem;
          }

          .sa-card-title {
            font-size: clamp(1.4rem, 5.5vw, 1.85rem);
            line-height: 1.22;
          }

          .sa-card-text {
            font-size: 0.875rem;
            line-height: 1.5;
          }

          .sa-progress {
            display: none !important;
          }

          .sa-outro {
            min-height: 80vh;
            min-height: 80svh;
            min-height: 80dvh;
            padding: 3.5rem 1.25rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sa-card {
            position: relative !important;
            height: auto !important;
            min-height: 70vh !important;
            margin-bottom: 2rem !important;
            transform: none !important;
            opacity: 1 !important;
          }

          .sa-card-inner {
            transform: none !important;
            filter: none !important;
            opacity: 1 !important;
          }

          .sa-card-img {
            transform: none !important;
          }

          .sa-card-content {
            transform: none !important;
            opacity: 1 !important;
          }

          .sa-intro-content,
          .sa-outro-content {
            transform: none !important;
            opacity: 1 !important;
          }

          .sa-progress {
            display: none !important;
          }
        }
      `}</style>

      {/* 1. HERO INTRO BLOCK */}
      <div ref={introRef} className="sa-intro">
        <div ref={introHeadingRef} className="sa-intro-content">
          <span className="sa-intro-eyebrow">{localizedIntroEyebrow}</span>
          <h2 className="sa-intro-heading">{localizedIntroHeading}</h2>
          <div className="sa-intro-prompt" aria-hidden="true">
            <span>{localizedScrollPrompt}</span>
            <svg
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. STACKING CARDS CONTAINER */}
      <div ref={cardsWrapRef} className="sa-cards-wrap">
        {cards.map((card, idx) => {
          const cardNumber = `${String(idx + 1).padStart(2, '0')} / ${String(totalCards).padStart(2, '0')}`;
          const cardEyebrow = t(card.eyebrow, card.eyebrow_am);
          const cardTitle = t(card.title, card.title_am);
          const cardText = t(card.text, card.text_am);
          const cardAlt = t(card.alt, card.alt_am);

          return (
            <div
              key={idx}
              ref={(el) => {
                cardElementsRef.current[idx] = el;
              }}
              className="sa-card"
              style={{ zIndex: idx + 1 }}
              data-card-index={idx}
            >
              <div
                ref={(el) => {
                  cardInnerRef.current[idx] = el;
                }}
                className="sa-card-inner"
              >
                {/* Background Image Container */}
                <div className="sa-card-img-wrap">
                  <img
                    ref={(el) => {
                      cardImgRef.current[idx] = el;
                    }}
                    src={card.image}
                    alt={cardAlt}
                    className="sa-card-img"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    referrerPolicy="no-referrer"
                  />
                  {/* Hardware-accelerated dim overlay (animates opacity, avoiding expensive GPU filter: brightness) */}
                  <div
                    ref={(el) => {
                      cardDimRef.current[idx] = el;
                    }}
                    className="sa-card-dim"
                    aria-hidden="true"
                  />
                  {/* Enhanced dark gradient scrim */}
                  <div className="sa-card-scrim" />
                </div>

                {/* Top Card Header */}
                <header className="sa-card-header">
                  <span className="sa-card-eyebrow">{cardEyebrow}</span>
                  <span className="sa-card-number">{cardNumber}</span>
                </header>

                {/* Bottom Card Text Content */}
                <div
                  ref={(el) => {
                    cardContentRef.current[idx] = el;
                  }}
                  className="sa-card-content"
                >
                  <h3 className="sa-card-title">{cardTitle}</h3>
                  <p className="sa-card-text">{cardText}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. THIN PROGRESS INDICATOR */}
      <nav
        ref={progressRef}
        className={`sa-progress ${isProgressVisible ? 'is-visible' : ''}`}
        aria-label="Card navigation progress"
        aria-hidden={!isProgressVisible}
        inert={!isProgressVisible ? true : undefined}
      >
        {cards.map((_, dotIdx) => (
          <button
            key={dotIdx}
            type="button"
            tabIndex={isProgressVisible ? 0 : -1}
            className={`sa-progress-dot-btn ${activeCardIndex === dotIdx ? 'is-active' : ''}`}
            aria-label={`Jump to card ${dotIdx + 1} of ${totalCards}`}
            aria-current={activeCardIndex === dotIdx ? 'step' : undefined}
            onClick={() => handleDotClick(dotIdx)}
          >
            <span className="sa-progress-dot-indicator" />
          </button>
        ))}
      </nav>

      {/* 4. ENDING OUTRO BLOCK */}
      <div ref={outroRef} className="sa-outro">
        <div ref={outroContentRef} className="sa-outro-content">
          <h2 className="sa-outro-heading">{localizedOutroHeading}</h2>
          <a href={outro.buttonHref} className="sa-outro-btn">
            <span>{localizedOutroButtonLabel}</span>
            <svg
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
