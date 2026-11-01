import React, { useState, useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import defaultPoster from '../assets/images/showcase_video_poster_1793311788335.jpg';
import { isSlowConnection } from '../polyfills';

interface CinematicVideoSectionProps {
  videoUrl?: string;
  posterUrl?: string;
  overlayTextEn?: string;
  overlayTextAm?: string;
  showOverlayText?: boolean;
}

const DEFAULT_VIDEO_URL =
  'https://ik.imagekit.io/1d5nabm79/1022(1).mp4?updatedAt=1792698857043';

export const CinematicVideoSection: React.FC<CinematicVideoSectionProps> = ({
  videoUrl = DEFAULT_VIDEO_URL,
  posterUrl = defaultPoster,
  overlayTextEn = "Addis Ababa's Distinguished Landscapes & Contemporary Architecture",
  overlayTextAm = 'የአዲስ አበባ ተፈጥሮአዊ ውበት እና ዘመናዊ የስነ-ህንፃ ጥበብ',
  showOverlayText = true,
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

  // 2. IntersectionObserver for lazy loading and auto-play/pause
  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion || isSlowNet) return;

    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return;
    }

    // Load video source only when section is within 300px of viewport
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

    // Play/Pause observer: only play when in active viewport, pause when offscreen
    const playbackObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = videoRef.current;
          if (!video) return;

          if (entry.isIntersecting) {
            if (video.paused && !prefersReducedMotion && !isSlowNet) {
              video.play().catch(() => {
                // Autoplay may be restricted by browser policy
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
        // Safe fallback if ScrollTrigger isn't initialized
      }
    }
  };

  // On slow connection, video failure, or reduced motion: show poster only!
  const shouldRenderVideo = !prefersReducedMotion && !videoFailed && !isSlowNet;

  return (
    <section
      ref={sectionRef}
      /* Precede svh with standard vh fallback for older Android devices */
      className="relative w-full h-[72vh] sm:h-[84vh] h-[72svh] sm:h-[84svh] max-h-[100vh] max-h-[100svh] min-h-[460px] overflow-hidden bg-[#0C0D10] border-y border-white/5"
      aria-label={t('Cinematic property showcase video', 'የሪል እስቴት ሲኒማቲክ ቪዲዮ')}
    >
      {/* Background Poster (Shown immediately, permanent on reduced motion or slow 3G) */}
      <img
        src={posterUrl}
        alt={t('Luxury residence aerial landscape in Addis Ababa', 'የቅንጦት መኖሪያ ቤት እይታ በአዲስ አበባ')}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={`absolute inset-0 top-0 right-0 bottom-0 left-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
          videoLoaded && shouldRenderVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      />

      {/* Dark gradient fallback behind poster */}
      <div
        className="absolute inset-0 top-0 right-0 bottom-0 left-0 bg-gradient-to-t from-[#0C0D10] via-transparent to-[#0C0D10]/60 -z-10"
        aria-hidden="true"
      />

      {/* Lazy-Loaded Video Element: preload="none" on mobile */}
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

      {/* Atmospheric gradient scrim */}
      <div
        className="absolute inset-0 top-0 right-0 bottom-0 left-0 pointer-events-none bg-gradient-to-b from-[#0C0D10] via-transparent to-[#0C0D10]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 top-0 right-0 bottom-0 left-0 pointer-events-none bg-gradient-to-t from-[#0C0D10]/80 via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* Editorial Line Overlay */}
      {showOverlayText && (
        <div className="absolute inset-x-0 bottom-8 sm:bottom-12 z-10 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center sm:items-start text-center sm:text-left pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0C0D10]/70 border border-white/10 backdrop-blur-md mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8A35F]" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#C8A35F]">
              {t('Cinematic Preview', 'ሲኒማቲክ እይታ')}
            </span>
          </div>
          <p className="text-base sm:text-lg md:text-xl font-medium text-[#F5F3EF] max-w-2xl drop-shadow-md">
            {t(overlayTextEn, overlayTextAm)}
          </p>
        </div>
      )}
    </section>
  );
};
