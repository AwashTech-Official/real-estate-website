import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { CompanySettings } from '../types/database';
import { InquiryForm } from './InquiryForm';
import {
  Phone,
  MessageCircle,
  Send,
  MapPin,
  Clock,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
} from 'lucide-react';

interface ContactSectionProps {
  companySettings?: Partial<CompanySettings> | null;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ companySettings }) => {
  const { language, t } = useLanguage();

  const phone = companySettings?.phone?.trim() || '';
  const rawWhatsapp =
    companySettings?.whatsapp?.trim() ||
    companySettings?.whatsapp_number?.trim() ||
    companySettings?.phone?.trim() ||
    '';
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9+]/g, '').replace(/^\+/, '');
  const telegram = companySettings?.telegram_url?.trim() || '';
  const email = companySettings?.email?.trim() || '';
  const address =
    language === 'am' && companySettings?.address_am?.trim()
      ? companySettings.address_am.trim()
      : companySettings?.address?.trim() || '';

  const responseTime =
    language === 'am' && companySettings?.response_time_text_am?.trim()
      ? companySettings.response_time_text_am.trim()
      : companySettings?.response_time_text?.trim() ||
        t('Typical response within 2 hours during business hours', 'በስራ ሰዓት በ2 ሰዓት ውስጥ ምላሽ እንሰጣለን');

  const facebook = companySettings?.facebook_url?.trim() || '';
  const instagram = companySettings?.instagram_url?.trim() || '';
  const linkedin = companySettings?.linkedin_url?.trim() || '';

  const whatsappLink = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
        language === 'am'
          ? 'ሰላም፣ በአዲስ አበባ ሪል እስቴት ቤቶች ዙሪያ መረጃ ማግኘት እፈልጋለሁ።'
          : 'Hello, I would like to inquire about Addis Ababa real estate listings and services.'
      )}`
    : '';

  const telegramLink = telegram
    ? telegram.startsWith('http')
      ? telegram
      : `https://t.me/${telegram.replace('@', '')}`
    : '';

  return (
    <section
      id="contact"
      className="w-full py-16 sm:py-24 bg-[#0C0D10] border-t border-white/5 scroll-mt-20"
      aria-label={t('Contact Our Agency', 'ኤጀንሲያችንን ያነጋግሩ')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono uppercase text-[#C8A35F] bg-[#C8A35F]/10 border border-[#C8A35F]/20">
            <span>{t('Direct Communication', 'ቀጥተኛ ግንኙነት')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F3EF]">
            {t('Connect With Our Advisors', 'ከንብረት አማካሪዎቻችን ጋር ይገናኙ')}
          </h2>
          <p className="text-sm text-[#B4B1A8] leading-relaxed">
            {t(
              'Reach out for verified property consultations, private viewings, or advisory services in Addis Ababa.',
              'ስለ ቤቶች ግዢ፣ ሽያጭ ወይም የግል ጉብኝት መረጃ ለማግኘት በስልክ፣ ዋትስአፕ ወይም ቴሌግራም ያግኙን።'
            )}
          </p>
        </div>

        {/* 2-Column Grid: Communication Channels (Left) & Inquiry Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Action Buttons & Verified Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Action Channels Grid */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-mono tracking-wider text-[#B4B1A8]">
                {t('Instant Channels', 'ፈጣን የመገናኛ መንገዶች')}
              </h3>

              {/* Phone Button */}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#141519] border border-white/10 hover:border-[#C8A35F]/60 transition-all group min-h-[56px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#C8A35F]/10 flex items-center justify-center text-[#C8A35F]">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-[#B4B1A8] block">
                        {t('Direct Phone Line', 'የቀጥታ ስልክ መስመር')}
                      </span>
                      <span className="text-sm font-bold text-[#F5F3EF] group-hover:text-[#C8A35F] transition-colors font-mono">
                        {phone}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#C8A35F]">{t('Call Now', 'ይደውሉ')}</span>
                </a>
              )}

              {/* WhatsApp Button */}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-[#141519] border border-white/10 hover:border-emerald-500/60 transition-all group min-h-[56px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <MessageCircle className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <span className="text-xs text-[#B4B1A8] block">WhatsApp</span>
                      <span className="text-sm font-bold text-[#F5F3EF] group-hover:text-emerald-400 transition-colors">
                        {t('Chat on WhatsApp', 'በዋትስአፕ ይጻፉልን')}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">{t('Message', 'ይጻፉ')}</span>
                </a>
              )}

              {/* Telegram Button */}
              {telegramLink && (
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-[#141519] border border-white/10 hover:border-sky-500/60 transition-all group min-h-[56px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-[#B4B1A8] block">Telegram</span>
                      <span className="text-sm font-bold text-[#F5F3EF] group-hover:text-sky-400 transition-colors">
                        {t('Open Telegram Channel / Chat', 'ቴሌግራም ይክፈቱ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-sky-400">{t('Open', 'ይክፈቱ')}</span>
                </a>
              )}

              {/* Email */}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#141519] border border-white/10 hover:border-[#C8A35F]/60 transition-all group min-h-[56px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#C8A35F]/10 flex items-center justify-center text-[#C8A35F]">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-[#B4B1A8] block">{t('Email Us', 'ኢሜይል')}</span>
                      <span className="text-sm font-medium text-[#F5F3EF] group-hover:text-[#C8A35F] transition-colors truncate max-w-[200px] block">
                        {email}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#C8A35F]">{t('Send', 'ላክ')}</span>
                </a>
              )}
            </div>

            {/* Address & Response Time Info Card */}
            <div className="p-5 rounded-xl bg-[#141519] border border-white/10 space-y-4">
              {address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C8A35F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-mono uppercase text-[#B4B1A8] block">
                      {t('Office Address', 'የቢሮ አድራሻ')}
                    </span>
                    <p className="text-sm text-[#F5F3EF] mt-0.5 leading-relaxed">{address}</p>
                  </div>
                </div>
              )}

              {responseTime && (
                <div className="flex items-start gap-3 pt-3 border-t border-white/5">
                  <Clock className="w-4 h-4 text-[#C8A35F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-mono uppercase text-[#B4B1A8] block">
                      {t('Response Standard', 'የምላሽ ጊዜ')}
                    </span>
                    <p className="text-xs text-[#F5F3EF] mt-0.5">{responseTime}</p>
                  </div>
                </div>
              )}

              {/* Social Links if present */}
              {(facebook || instagram || linkedin) && (
                <div className="pt-3 border-t border-white/5">
                  <span className="text-xs font-mono uppercase text-[#B4B1A8] block mb-2">
                    {t('Social Media', 'ማህበራዊ ሚዲያ')}
                  </span>
                  <div className="flex items-center gap-3">
                    {facebook && (
                      <a
                        href={facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg bg-[#0C0D10] border border-white/10 flex items-center justify-center text-[#B4B1A8] hover:text-[#C8A35F] hover:border-[#C8A35F]/40 transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {instagram && (
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg bg-[#0C0D10] border border-white/10 flex items-center justify-center text-[#B4B1A8] hover:text-[#C8A35F] hover:border-[#C8A35F]/40 transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {linkedin && (
                      <a
                        href={linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg bg-[#0C0D10] border border-white/10 flex items-center justify-center text-[#B4B1A8] hover:text-[#C8A35F] hover:border-[#C8A35F]/40 transition-colors"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Inquiry & Consultation Form */}
          <div className="lg:col-span-7">
            <div className="space-y-3 mb-4">
              <span className="text-xs uppercase tracking-wider font-mono text-[#C8A35F]">
                {t('Send an Inquiry', 'ጥያቄ ይላኩ')}
              </span>
              <h3 className="text-xl font-bold text-[#F5F3EF]">
                {t('Online Inquiries & Appointment Requests', 'የመስመር ላይ ጥያቄ እና የጉብኝት ማመልከቻ')}
              </h3>
            </div>
            <InquiryForm defaultType="property_question" />
          </div>
        </div>
      </div>
    </section>
  );
};
