import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { CompanySettings } from '../types/database';
import { Facebook, Instagram, Linkedin, Send, MessageCircle } from 'lucide-react';

interface FooterProps {
  companySettings?: Partial<CompanySettings> | null;
  onNavigateProperties?: () => void;
  onNavigateValuation?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  companySettings,
  onNavigateProperties,
  onNavigateValuation,
}) => {
  const { language, t } = useLanguage();

  const companyName =
    language === 'am' && companySettings?.company_name_am?.trim()
      ? companySettings.company_name_am
      : companySettings?.company_name || 'Addis Luxury Realty';

  const tagline =
    language === 'am' && companySettings?.tagline_am?.trim()
      ? companySettings.tagline_am
      : companySettings?.tagline || t('Exclusive Addis Ababa Real Estate Advisory', 'የአዲስ አበባ ምርጥ ሪል እስቴት አማካሪ');

  const rawWhatsapp =
    companySettings?.whatsapp?.trim() ||
    companySettings?.whatsapp_number?.trim() ||
    companySettings?.phone?.trim() ||
    '';
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9+]/g, '').replace(/^\+/, '');
  const telegram = companySettings?.telegram_url?.trim() || '';
  const facebook = companySettings?.facebook_url?.trim() || '';
  const instagram = companySettings?.instagram_url?.trim() || '';
  const linkedin = companySettings?.linkedin_url?.trim() || '';

  const whatsappLink = cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}` : '';
  const telegramLink = telegram ? (telegram.startsWith('http') ? telegram : `https://t.me/${telegram.replace('@', '')}`) : '';

  return (
    <footer className="w-full bg-[#0C0D10] border-t border-white/10 text-xs text-[#B4B1A8] pt-14 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Upper Row: Brand & Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <a href="/" className="text-lg font-bold text-[#F5F3EF] hover:text-[#C8A35F] transition-colors">
              {companyName}
            </a>
            <p className="text-xs text-[#B4B1A8] max-w-sm leading-relaxed">
              {tagline}
            </p>
            <p className="text-[11px] text-[#B4B1A8]/60 font-mono">
              {t('Addis Ababa, Ethiopia · Licensed Real Estate Agency', 'አዲስ አበባ፣ ኢትዮጵያ · ፈቃድ ያለው የሪል እስቴት ኤጀንሲ')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <span className="text-xs font-mono uppercase tracking-wider text-[#F5F3EF] block">
              {t('Explore', 'አስስ')}
            </span>
            <ul className="space-y-2">
              <li>
                <a
                  href="#properties"
                  onClick={(e) => {
                    if (onNavigateProperties) {
                      e.preventDefault();
                      onNavigateProperties();
                    }
                  }}
                  className="hover:text-[#F5F3EF] transition-colors"
                >
                  {t('Featured Properties', 'ተለይተው የቀረቡ ቤቶች')}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="hover:text-[#F5F3EF] transition-colors"
                >
                  {t('Real Estate Services', 'የሪል እስቴት አገልግሎቶች')}
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="hover:text-[#F5F3EF] transition-colors"
                >
                  {t('About Agency', 'ስለ እኛ')}
                </a>
              </li>
              <li>
                <a
                  href="#valuation-section"
                  onClick={(e) => {
                    if (onNavigateValuation) {
                      e.preventDefault();
                      onNavigateValuation();
                    }
                  }}
                  className="hover:text-[#F5F3EF] transition-colors"
                >
                  {t('Free Property Valuation', 'ነጻ ዋጋ ግመታ')}
                </a>
              </li>
              <li>
                <a
                  href="#/admin"
                  className="hover:text-[#C8A35F] text-[#B4B1A8]/60 transition-colors inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  <span>Admin Portal</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="space-y-2.5">
            <span className="text-xs font-mono uppercase tracking-wider text-[#F5F3EF] block">
              {t('Direct Connect', 'ግንኙነት')}
            </span>
            <ul className="space-y-2">
              <li>
                <a href="#contact" className="hover:text-[#F5F3EF] transition-colors">
                  {t('Contact & Inquiries', 'ያነጋግሩን')}
                </a>
              </li>
              {companySettings?.phone && (
                <li>
                  <a href={`tel:${companySettings.phone}`} className="hover:text-[#F5F3EF] transition-colors font-mono">
                    {companySettings.phone}
                  </a>
                </li>
              )}
            </ul>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#141519] border border-white/10 flex items-center justify-center text-emerald-400 hover:border-emerald-400/50 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                </a>
              )}
              {telegramLink && (
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#141519] border border-white/10 flex items-center justify-center text-sky-400 hover:border-sky-400/50 transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="w-3.5 h-3.5" />
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#141519] border border-white/10 flex items-center justify-center text-[#B4B1A8] hover:text-[#C8A35F] hover:border-[#C8A35F]/50 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#141519] border border-white/10 flex items-center justify-center text-[#B4B1A8] hover:text-[#C8A35F] hover:border-[#C8A35F]/50 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#141519] border border-white/10 flex items-center justify-center text-[#B4B1A8] hover:text-[#C8A35F] hover:border-[#C8A35F]/50 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Lower Row: Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#B4B1A8]/70">
          <p>
            © {new Date().getFullYear()} {companyName}. {t('All rights reserved.', 'መብቱ በህግ የተጠበቀ ነው።')}
          </p>
          <div className="flex items-center gap-4">
            <span>{t('Strict Confidentiality & Client Care', 'ሚስጥራዊነት እና የታማኝነት አገልግሎት')}</span>
            <span>·</span>
            <span>Addis Ababa, Ethiopia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
