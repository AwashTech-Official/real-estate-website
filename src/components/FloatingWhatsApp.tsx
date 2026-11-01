import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { CompanySettings } from '../types/database';

interface FloatingWhatsAppProps {
  companySettings?: Partial<CompanySettings> | null;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ companySettings }) => {
  const { language, t } = useLanguage();
  const [isInputActive, setIsInputActive] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Raw number resolution with fallback for offline/slow Supabase connections
  const rawNumber =
    companySettings?.whatsapp?.trim() ||
    companySettings?.whatsapp_number?.trim() ||
    companySettings?.phone?.trim() ||
    '+251911234567';
  const cleanNumber = rawNumber.replace(/[^0-9+]/g, '').replace(/^\+/, '');

  // Delay appearance so it does not interfere with the hero initial view
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Form occlusion prevention: detect when user is interacting with input/textarea/select
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
      // Small timeout to avoid flicker when moving between inputs
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

  if (!cleanNumber) {
    return null;
  }

  const prefilledMessage =
    language === 'am'
      ? 'ሰላም፣ በአዲስ አበባ ሪል እስቴት ቤቶች ዙሪያ መረጃ ማግኘት እፈልጋለሁ።'
      : 'Hello, I would like to inquire about real estate properties in Addis Ababa.';

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(prefilledMessage)}`;

  // Hide when inputs are active or when hero is visible
  const shouldHide = !isVisible || isInputActive;

  return (
    <aside
      aria-label={t('Direct WhatsApp Chat', 'ቀጥታ የዋትስአፕ ውይይት')}
      className={`fixed bottom-5 right-5 z-40 transition-all duration-300 ease-in-out ${
        shouldHide
          ? 'opacity-0 pointer-events-none translate-y-4 scale-90'
          : 'opacity-100 pointer-events-auto translate-y-0 scale-100'
      }`}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('Chat with Addis Luxury Realty on WhatsApp', 'በዋትስአፕ በቀጥታ ይወያዩ')}
        className="group flex items-center gap-2.5 px-4 py-3 bg-[#25D366] text-white hover:bg-[#20ba59] rounded-full shadow-2xl shadow-black/50 transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-[#0C0D10] min-h-[48px] min-w-[48px]"
      >
        <MessageCircle className="w-5 h-5 fill-current shrink-0" />
        <span className="hidden sm:inline text-xs font-semibold tracking-wide font-sans">
          {t('Chat on WhatsApp', 'በዋትስአፕ ያውሩ')}
        </span>
      </a>
    </aside>
  );
};
