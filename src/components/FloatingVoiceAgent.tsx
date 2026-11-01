import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Minus, ExternalLink, AlertCircle, Headphones, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FloatingVoiceAgent: React.FC = () => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hasEverOpened, setHasEverOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInputActive, setIsInputActive] = useState(false);
  const [showTimeoutFallback, setShowTimeoutFallback] = useState(false);

  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Read URL strictly from environment variable with reliable default fallback
  const voiceAgentUrl =
    import.meta.env.VITE_VOICE_AGENT_URL ||
    'https://real-estate-agent-beryl.vercel.app/';

  // Keyboard accessibility: Close/minimize on Escape and return focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus management: when opening panel, shift focus to close button
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Form occlusion prevention: detect when user is interacting with input/textarea/select on mobile
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        setIsInputActive(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (
          !active ||
          (active.tagName !== 'INPUT' &&
            active.tagName !== 'TEXTAREA' &&
            active.tagName !== 'SELECT')
        ) {
          setIsInputActive(false);
        }
      }, 100);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Loading safety timeout: if iframe takes longer than 12 seconds, display fallback helper
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasEverOpened && isLoading) {
      timer = setTimeout(() => {
        setShowTimeoutFallback(true);
      }, 12000);
    }
    return () => clearTimeout(timer);
  }, [hasEverOpened, isLoading]);

  // Open or toggle panel
  const handleToggle = () => {
    if (!hasEverOpened) {
      setHasEverOpened(true);
      setIsLoading(true);
      setHasError(false);
      setShowTimeoutFallback(false);
    }
    setIsOpen((prev) => !prev);
  };

  // Minimize panel: keep call active in background without unmounting iframe
  const handleMinimize = () => {
    setIsOpen(false);
    triggerButtonRef.current?.focus();
  };

  // Close panel and terminate session: completely unmounts iframe to stop audio & microphone
  const handleEndSessionAndClose = () => {
    setIsOpen(false);
    setHasEverOpened(false);
    setIsLoading(true);
    setHasError(false);
    setShowTimeoutFallback(false);
    triggerButtonRef.current?.focus();
  };

  // Hide button on mobile when typing in inputs to prevent covering form elements
  const isHidden = isInputActive;

  return (
    <>
      {/* 1. FLOATING BUTTON (Bottom-Left, min 56px, gold accent, dark icon) */}
      <aside
        aria-label={t('Amharic Voice Assistant Service', 'የአማርኛ ድምጽ ረዳት አገልግሎት')}
        className={`fixed bottom-5 left-5 z-40 transition-all duration-300 ease-in-out ${
          isHidden
            ? 'opacity-0 pointer-events-none translate-y-4 scale-90'
            : 'opacity-100 pointer-events-auto translate-y-0 scale-100'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Main Round Floating Button */}
          <div className="relative flex items-center justify-center">
            {/* Soft pulsing ring animation - stopped when prefers-reduced-motion is enabled */}
            <span
              className="absolute -inset-1 rounded-full bg-[#C8A35F]/35 animate-ping motion-reduce:hidden pointer-events-none"
              style={{ animationDuration: '3s' }}
              aria-hidden="true"
            />
            <span
              className="absolute -inset-2 rounded-full border border-[#C8A35F]/40 animate-pulse motion-reduce:hidden pointer-events-none"
              style={{ animationDuration: '2s' }}
              aria-hidden="true"
            />

            <button
              ref={triggerButtonRef}
              type="button"
              onClick={handleToggle}
              aria-expanded={isOpen}
              aria-controls="amharic-voice-panel"
              aria-label={
                isOpen
                  ? t('Close Amharic Voice Assistant', 'የአማርኛ ድምጽ ረዳቱን ዝጋ')
                  : t('Open Amharic Voice Assistant', 'የአማርኛ ድምጽ ረዳቱን ይክፈቱ')
              }
              className="relative z-10 flex items-center justify-center w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-[#C8A35F] text-[#0C0D10] hover:bg-[#DEC07E] active:scale-95 shadow-2xl shadow-black/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C8A35F] focus-visible:ring-offset-[#0C0D10] group"
            >
              {/* Active session badge when call is running while panel is minimized */}
              {hasEverOpened && !isOpen && (
                <span
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0C0D10] animate-pulse"
                  title={t('Voice session active in background', 'የድምጽ ውይይቱ ከበስተጀርባ ቀጥሏል')}
                />
              )}

              {/* High-contrast dark icon: Stylized voice agent microphone */}
              <div className="relative">
                <Mic className="w-6 h-6 stroke-[2.2] text-[#0C0D10] transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -bottom-1 -right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0C0D10] opacity-50 motion-reduce:hidden"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0C0D10]"></span>
                </span>
              </div>
            </button>
          </div>

          {/* Pill shape label next to the button: collapses to icon-only on screens under 480px */}
          <button
            type="button"
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-controls="amharic-voice-panel"
            className="hidden min-[480px]:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#141519]/95 border border-[#C8A35F]/40 text-[#F5F3EF] shadow-xl text-xs font-medium cursor-pointer hover:border-[#C8A35F] hover:bg-[#1a1c22] transition-all backdrop-blur-md select-none group"
            style={{
              fontFamily:
                language === 'am' ? "'Noto Sans Ethiopic', sans-serif" : 'var(--font-body)',
              letterSpacing: language === 'am' ? 'normal' : undefined,
              lineHeight: language === 'am' ? 1.6 : undefined,
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[#C8A35F] animate-pulse motion-reduce:hidden" />
            <span className="font-semibold text-[#F5F3EF] group-hover:text-[#C8A35F] transition-colors">
              {language === 'am' ? 'ከእኛ ጋር በአማርኛ ይነጋገሩ' : 'Talk to us in Amharic'}
            </span>
          </button>
        </div>
      </aside>

      {/* 2. VOICE AGENT PANEL */}
      {/*
        When hasEverOpened is true, we keep the iframe mounted in DOM even if isOpen is false,
        so active voice audio/microphone calls are NOT interrupted when minimized!
        Closing through the close button unmounts the iframe to end the session.
      */}
      {hasEverOpened && (
        <section
          id="amharic-voice-panel"
          role="dialog"
          aria-modal="true"
          aria-label={t('Amharic Real Estate Voice Assistant', 'የአዲስ አበባ ሪል እስቴት የአማርኛ ድምጽ ረዳት')}
          className={`z-50 transition-all duration-300 ease-out ${
            isOpen
              ? 'opacity-100 pointer-events-auto scale-100 translate-y-0 visible'
              : 'opacity-0 pointer-events-none scale-95 translate-y-6 invisible'
          } ${
            /* Mobile: full-screen modal; Desktop: 380px wide x 560px tall in bottom-left */
            'fixed inset-0 top-0 right-0 bottom-0 left-0 w-full h-full h-screen h-[100dvh] bg-[#141519] flex flex-col sm:inset-auto sm:bottom-24 sm:left-5 sm:w-[380px] sm:h-[560px] sm:max-h-[calc(100vh-120px)] sm:max-h-[calc(100dvh-120px)] sm:rounded-2xl sm:border sm:border-[#C8A35F]/30 sm:shadow-2xl sm:shadow-black/80 overflow-hidden'
          }`}
        >
          {/* Panel Header */}
          <header className="flex items-center justify-between px-4 py-3 bg-[#0C0D10] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#C8A35F]/20 border border-[#C8A35F]/40 flex items-center justify-center text-[#C8A35F]">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <h2
                    className="text-xs font-bold text-[#F5F3EF]"
                    style={{
                      fontFamily:
                        language === 'am' ? "'Noto Sans Ethiopic', sans-serif" : 'var(--font-display)',
                      letterSpacing: language === 'am' ? 'normal' : undefined,
                    }}
                  >
                    {language === 'am' ? 'የአማርኛ ድምጽ ረዳት' : 'Amharic Voice Assistant'}
                  </h2>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-[#B4B1A8]">
                  {language === 'am' ? 'የቀጥታ ንግግር • አዲስ ሪልቲ' : 'Live Voice Agent • Addis Realty'}
                </p>
              </div>
            </div>

            {/* Header Controls: Open in new tab, Minimize, Close/End */}
            <div className="flex items-center gap-1">
              {/* Direct Link in New Tab */}
              <a
                href={voiceAgentUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={t('Open in new tab', 'በአዲስ ታብ ይክፈቱ')}
                aria-label={t('Open voice agent in new tab', 'የድምጽ ረዳቱን በአዲስ ታብ ይክፈቱ')}
                className="p-1.5 text-[#B4B1A8] hover:text-[#C8A35F] hover:bg-white/5 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Minimize (Keeps call active) */}
              <button
                type="button"
                onClick={handleMinimize}
                title={t('Minimize (keep call active)', 'አሳንስ (ውይይቱ ይቀጥላል)')}
                aria-label={t('Minimize voice assistant', 'የድምጽ ረዳቱን አሳንስ')}
                className="p-1.5 text-[#B4B1A8] hover:text-[#F5F3EF] hover:bg-white/5 rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* End Call & Close Button (Explicit close ends session and unmounts iframe) */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleEndSessionAndClose}
                title={t('End call and close', 'ውይይቱን ጨርስና ዝጋ')}
                aria-label={t('End call and close voice assistant', 'ውይይቱን ጨርስና ረዳቱን ዝጋ')}
                className="p-1.5 text-[#B4B1A8] hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Panel Body: Iframe Container with Lazy Loading & Fallbacks */}
          <div className="relative flex-1 w-full h-full bg-[#0C0D10] overflow-hidden flex flex-col">
            {/* Loading State Overlay */}
            {isLoading && !hasError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-[#0C0D10] text-center space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-[#C8A35F]/20 border-t-[#C8A35F] animate-spin" />
                  <Mic className="w-5 h-5 text-[#C8A35F] absolute inset-0 m-auto" />
                </div>
                <div className="space-y-1 max-w-[260px]">
                  <p
                    className="text-xs font-semibold text-[#F5F3EF]"
                    style={{
                      fontFamily:
                        language === 'am' ? "'Noto Sans Ethiopic', sans-serif" : 'var(--font-body)',
                    }}
                  >
                    {language === 'am'
                      ? 'የአማርኛ ድምጽ ረዳቱን በማገናኘት ላይ...'
                      : 'Connecting to Amharic Voice Assistant...'}
                  </p>
                  <p className="text-[11px] text-[#B4B1A8] leading-relaxed">
                    {language === 'am'
                      ? 'ጥያቄ ሲቀርብልዎ እባክዎ ማይክሮፎኑን ይፍቀዱ'
                      : 'Please allow microphone access when prompted'}
                  </p>
                </div>

                {/* Safety fallback if network or embedding takes longer than usual */}
                {showTimeoutFallback && (
                  <div className="pt-2">
                    <a
                      href={voiceAgentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#C8A35F] hover:underline"
                    >
                      <span>{t('Taking long? Open in new tab', 'ዘገየብዎ? በአዲስ ታብ ይክፈቱ')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Error or Blocked Embedding Fallback State */}
            {hasError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-[#0C0D10] text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-[280px]">
                  <p className="text-xs font-semibold text-[#F5F3EF]">
                    {language === 'am'
                      ? 'የድምጽ ረዳቱን በቀጥታ ይክፈቱ'
                      : 'Open Voice Agent Directly'}
                  </p>
                  <p className="text-[11px] text-[#B4B1A8] leading-relaxed">
                    {language === 'am'
                      ? 'የአሳሽዎ የደህንነት ቅንብር በማዕቀፉ ውስጥ ማይክሮፎን እንዳይጠቀም ከከለከለ፣ እባክዎ በቀጥታ በአዲስ ታብ ይክፈቱት።'
                      : 'If your browser restricts embedded microphone permissions, please launch the assistant directly in a new tab.'}
                  </p>
                </div>
                <a
                  href={voiceAgentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C8A35F] text-[#0C0D10] text-xs font-semibold hover:bg-[#DEC07E] transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{t('Open Assistant in New Tab', 'ረዳቱን በአዲስ ታብ ይክፈቱ')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Embedded Voice Agent Iframe */}
            <iframe
              ref={iframeRef}
              src={voiceAgentUrl}
              title="Addis Luxury Amharic Real Estate Voice Agent"
              allow="microphone; autoplay"
              className="w-full flex-1 border-0 bg-[#0C0D10]"
              onLoad={() => {
                setIsLoading(false);
                setHasError(false);
              }}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </div>

          {/* Mobile Bottom Bar with quick actions */}
          <footer className="sm:hidden px-4 py-3 bg-[#0C0D10] border-t border-white/10 flex items-center justify-between text-xs text-[#B4B1A8]">
            <span className="text-[11px]">
              {language === 'am' ? 'የአማርኛ ቋንቋ የድምጽ ረዳት' : 'Amharic Voice Assistant'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMinimize}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-[#F5F3EF] hover:bg-white/10 text-xs"
              >
                {language === 'am' ? 'አሳንስ' : 'Minimize'}
              </button>
              <button
                type="button"
                onClick={handleEndSessionAndClose}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 text-red-300 border border-red-500/30 hover:bg-red-900/40 text-xs font-semibold"
              >
                {language === 'am' ? 'ውይይት ጨርስ' : 'End Call'}
              </button>
            </div>
          </footer>
        </section>
      )}
    </>
  );
};
