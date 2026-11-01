import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Menu, X, MessageCircle } from 'lucide-react';
import type { CompanySettings } from '../types/database';

interface HeaderProps {
  companySettings?: Partial<CompanySettings> | null;
  currentView?: 'home' | 'all-properties' | 'property-detail';
  onNavigate?: (view: 'home' | 'all-properties', targetId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  companySettings,
  currentView = 'home',
  onNavigate,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const rawCompanyName = companySettings?.company_name?.trim();
  const rawCompanyNameAm = companySettings?.company_name_am?.trim();

  const displayName =
    language === 'am' && rawCompanyNameAm
      ? rawCompanyNameAm
      : rawCompanyName || 'Addis Luxury Realty';

  // Format WhatsApp Link
  const rawWhatsapp =
    companySettings?.whatsapp ||
    companySettings?.whatsapp_number ||
    companySettings?.phone ||
    '';

  const cleanWhatsappNumber = rawWhatsapp.replace(/[^0-9+]/g, '').replace(/^\+/, '');
  const whatsappUrl = cleanWhatsappNumber
    ? `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
        language === 'am'
          ? 'ሰላም፣ በአዲስ አበባ ሪል እስቴት ቤቶች ዙሪያ መረጃ ማግኘት እፈልጋለሁ።'
          : 'Hello, I am interested in inquiring about Addis Ababa real estate listings.'
      )}`
    : `https://wa.me/?text=${encodeURIComponent(
        language === 'am'
          ? 'ሰላም፣ በአዲስ አበባ ሪል እስቴት ቤቶች ዙሪያ መረጃ ማግኘት እፈልጋለሁ።'
          : 'Hello, I am interested in inquiring about Addis Ababa real estate listings.'
      )}`;

  const navLinks = [
    { href: '#about', labelEn: 'About', labelAm: 'ስለ እኛ' },
    { href: '#services', labelEn: 'Services', labelAm: 'አገልግሎቶች' },
    { href: '#properties', labelEn: 'Properties', labelAm: 'ቤቶች' },
    { href: '#contact', labelEn: 'Contact', labelAm: 'ያግኙን' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    if (onNavigate) {
      e.preventDefault();
      onNavigate('home', targetId);
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0C0D10]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Name */}
        <a
          href="/"
          onClick={handleLogoClick}
          className="text-lg sm:text-xl font-bold tracking-tight text-[#F5F3EF] hover:text-[#C8A35F] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-[#C8A35F]" aria-hidden="true" />
          <span>{displayName}</span>
        </a>

        {/* Center: Desktop Navigation Links (About, Services, Properties, Contact) */}
        <nav
          aria-label="Main Navigation"
          className="header-desktop-nav hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#B4B1A8]"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="hover:text-[#F5F3EF] transition-colors whitespace-nowrap shrink-0 py-2 border-b border-transparent hover:border-[#C8A35F]/60"
            >
              {t(link.labelEn, link.labelAm)}
            </a>
          ))}
        </nav>

        {/* Right: Language toggle & WhatsApp Button (Desktop) + Hamburger (Mobile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center justify-center gap-1.5 h-10 px-3 text-xs font-medium text-[#F5F3EF] bg-[#141519] border border-white/10 rounded-md hover:border-[#C8A35F]/50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A35F]"
            aria-label={language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-[#C8A35F]" />
            <span>{language === 'en' ? 'አማርኛ' : 'EN'}</span>
          </button>

          {/* WhatsApp Button (Desktop) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold hidden sm:inline-flex items-center justify-center gap-2 h-10 px-4 text-xs font-medium text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A35F]"
            aria-label={t('Chat with us on WhatsApp', 'በዋትስአፕ ያነጋግሩን')}
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>{t('WhatsApp', 'ዋትስአፕ')}</span>
          </a>

          {/* Mobile Hamburger Button with at least 44px touch target */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="header-mobile-hamburger md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-md text-[#F5F3EF] hover:bg-white/5 border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A35F]"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#C8A35F]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Full width overlay with >=44px touch targets) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 sm:top-20 bottom-0 z-50 bg-[#0C0D10]/98 backdrop-blur-xl border-t border-white/10 flex flex-col justify-between p-6 overflow-y-auto">
          <nav className="flex flex-col space-y-2 pt-2" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="flex items-center min-h-[48px] px-4 py-3 rounded-lg text-base font-medium text-[#F5F3EF] hover:bg-[#141519] hover:text-[#C8A35F] transition-colors border border-transparent hover:border-white/5"
              >
                {t(link.labelEn, link.labelAm)}
              </a>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            {/* WhatsApp CTA in mobile menu */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 text-sm font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] rounded-lg transition-colors shadow-lg shadow-[#C8A35F]/10"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>{t('Contact via WhatsApp', 'በዋትስአፕ መልእክት ይላኩ')}</span>
            </a>

            <div className="flex items-center justify-between py-2 text-xs text-[#B4B1A8]">
              <span>{t('Current Language', 'የመረጡት ቋንቋ')}:</span>
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 text-xs font-semibold text-[#F5F3EF] bg-[#141519] border border-white/10 rounded-md"
              >
                <Globe className="w-4 h-4 text-[#C8A35F]" />
                <span>{language === 'en' ? 'Switch to አማርኛ' : 'Switch to English'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
