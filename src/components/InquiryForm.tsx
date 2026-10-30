import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { submitInquiry } from '../lib/supabase';
import type { InquiryType, ContactMethod, InquiryInsert } from '../types/database';
import { validatePhone, validateEmail } from '../utils/formatters';
import { Send, CheckCircle2, AlertCircle, Phone, MessageSquare, Mail, Calendar, HelpCircle, PhoneCall } from 'lucide-react';

interface InquiryFormProps {
  propertyId?: string | null;
  propertyTitle?: string | null;
  defaultType?: InquiryType;
  onSuccess?: () => void;
  className?: string;
}

export const InquiryForm: React.FC<InquiryFormProps> = ({
  propertyId,
  propertyTitle,
  defaultType = 'property_question',
  onSuccess,
  className = '',
}) => {
  const { t } = useLanguage();
  const formLoadTimeRef = useRef<number>(Date.now());

  const [inquiryType, setInquiryType] = useState<InquiryType>(defaultType);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('phone');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    formLoadTimeRef.current = Date.now();
  }, []);

  const MAX_MESSAGE_LENGTH = 1000;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = t('Please enter your full name.', 'እባክዎ ሙሉ ስምዎን ያስገቡ።');
    }

    if (!phone.trim()) {
      errs.phone = t('Please provide your phone number.', 'እባክዎ የስልክ ቁጥርዎን ያስገቡ።');
    } else if (!validatePhone(phone)) {
      errs.phone = t(
        'Please enter a valid phone number (e.g. 0911234567 or +251...).',
        'ትክክለኛ የስልክ ቁጥር ያስገቡ (ለምሳሌ 0911234567 ወይም +251...)'
      );
    }

    if (email.trim() && !validateEmail(email)) {
      errs.email = t('Please enter a valid email address.', 'እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ።');
    }

    if (!message.trim()) {
      errs.message = t('Please enter your message or question.', 'እባክዎ መልእክትዎን ያስገቡ።');
    } else if (message.length > MAX_MESSAGE_LENGTH) {
      errs.message = t(
        `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
        `መልእክት ከ ${MAX_MESSAGE_LENGTH} ፊደላት መብለጥ አይችልም።`
      );
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Bot honeypot verification
    if (honeypot.trim().length > 0) {
      // Silently ignore spam bots
      setIsSubmitted(true);
      return;
    }

    // Minimum fill time check (at least 1.5 seconds)
    const elapsedSeconds = (Date.now() - formLoadTimeRef.current) / 1000;
    if (elapsedSeconds < 1.5) {
      setSubmitError(t('Please take a moment to review before submitting.', 'እባክዎ ከመላክዎ በፊት መረጃዎን ይገምግሙ።'));
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const payload: InquiryInsert = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      preferred_contact_method: contactMethod,
      message: message.trim(),
      property_id: propertyId || null,
      inquiry_type: inquiryType,
      status: 'new',
      source: 'website',
    };

    const res = await submitInquiry(payload);
    setIsSubmitting(false);

    if (res.success) {
      setIsSubmitted(true);
      onSuccess?.();
    } else {
      setSubmitError(res.error || t('Unable to send inquiry. Please call or WhatsApp us.', 'መልእክቱን መላክ አልተቻለም።'));
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setMessage('');
    setErrors({});
    setSubmitError(null);
    formLoadTimeRef.current = Date.now();
  };

  if (isSubmitted) {
    return (
      <div className={`p-8 rounded-xl bg-[#141519] border border-[#C8A35F]/40 text-center space-y-4 ${className}`}>
        <div className="w-14 h-14 rounded-full bg-[#C8A35F]/15 border border-[#C8A35F]/30 mx-auto flex items-center justify-center text-[#C8A35F]">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-[#F5F3EF]">
          {inquiryType === 'viewing_request'
            ? t('Viewing Request Received', 'የጉብኝት ጥያቄዎ ደርሶናል')
            : t('Inquiry Received', 'ጥያቄዎ ደርሶናል')}
        </h3>
        <p className="text-sm text-[#B4B1A8] max-w-md mx-auto leading-relaxed">
          {inquiryType === 'viewing_request'
            ? t(
                'Thank you. Please note that this is a viewing request, not a confirmed appointment. Our agency advisor will phone you directly to schedule and confirm your viewing.',
                'እናመሰግናለን። ይህ የጉብኝት ጥያቄ ሲሆን የተረጋገጠ ቀጠሮ አይደለም። የኤጀንሲያችን አማካሪ በስልክ ደውሎ የጉብኝቱን ሰዓት ያረጋግጣል።'
              )
            : t(
                'Thank you for reaching out. An advisor will contact you shortly using your preferred method.',
                'ስላነጋገሩን እናመሰግናለን። አማካሪዎቻችን በመረጡት የመገናኛ መንገድ በቅርቡ ያነጋግሩዎታል።'
              )}
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-4 inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] rounded-md transition-colors"
        >
          {t('Send Another Message', 'ሌላ መልእክት ይላኩ')}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`p-6 sm:p-8 rounded-xl bg-[#141519] border border-white/10 space-y-6 ${className}`}
    >
      {/* Hidden Bot Honeypot */}
      <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
        <label htmlFor="website_url_trap">Leave this blank</label>
        <input
          id="website_url_trap"
          type="text"
          name="website_url_trap"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Inquiry Type Tabs */}
      <div>
        <label className="block text-xs uppercase font-mono tracking-wider text-[#B4B1A8] mb-2.5">
          {t('Inquiry Type', 'የጥያቄ አይነት')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setInquiryType('property_question')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors border ${
              inquiryType === 'property_question'
                ? 'bg-[#C8A35F] text-[#0C0D10] border-[#C8A35F]'
                : 'bg-[#0C0D10] text-[#B4B1A8] border-white/10 hover:border-white/20'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t('Ask a Question', 'ጥያቄ')}</span>
          </button>

          <button
            type="button"
            onClick={() => setInquiryType('viewing_request')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors border ${
              inquiryType === 'viewing_request'
                ? 'bg-[#C8A35F] text-[#0C0D10] border-[#C8A35F]'
                : 'bg-[#0C0D10] text-[#B4B1A8] border-white/10 hover:border-white/20'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('Viewing Request', 'የጉብኝት ጥያቄ')}</span>
          </button>

          <button
            type="button"
            onClick={() => setInquiryType('callback')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors border ${
              inquiryType === 'callback'
                ? 'bg-[#C8A35F] text-[#0C0D10] border-[#C8A35F]'
                : 'bg-[#0C0D10] text-[#B4B1A8] border-white/10 hover:border-white/20'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t('Request Callback', 'ይደወልልኝ')}</span>
          </button>
        </div>

        {inquiryType === 'viewing_request' && (
          <p className="mt-2 text-xs text-[#C8A35F]/90 font-medium bg-[#C8A35F]/10 border border-[#C8A35F]/20 p-2.5 rounded-md">
            ℹ️{' '}
            {t(
              'Notice: This submits a viewing request. The agency will contact you by phone to confirm schedule and availability.',
              'ማሳሰቢያ፡ ይህ የጉብኝት ጥያቄ ሲሆን፣ ኤጀንሲው በስልክ ደውሎ የቀጠሮ ሰዓትን ያረጋግጣል።'
            )}
          </p>
        )}
      </div>

      {/* Property Context Banner if attached */}
      {propertyTitle && (
        <div className="p-3 bg-[#0C0D10] border border-white/10 rounded-lg text-xs text-[#B4B1A8] flex items-center gap-2">
          <span className="text-[#C8A35F] font-mono uppercase text-[11px] font-semibold">
            {t('Regarding Property:', 'ስለ ንብረቱ:')}
          </span>
          <span className="text-[#F5F3EF] truncate font-medium">{propertyTitle}</span>
        </div>
      )}

      {/* Name & Phone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="inquiry-name" className="block text-xs font-medium text-[#F5F3EF] mb-1.5">
            {t('Full Name', 'ሙሉ ስም')} <span className="text-amber-400">*</span>
          </label>
          <input
            id="inquiry-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('e.g. Abebe Kebede', 'ለምሳሌ፡ አበበ ከበደ')}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#0C0D10] border text-sm text-[#F5F3EF] placeholder-[#B4B1A8]/50 focus:outline-none focus:ring-1 focus:ring-[#C8A35F] ${
              errors.name ? 'border-rose-500' : 'border-white/10 focus:border-[#C8A35F]'
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="inquiry-phone" className="block text-xs font-medium text-[#F5F3EF] mb-1.5">
            {t('Phone Number', 'ስልክ ቁጥር')} <span className="text-amber-400">*</span>
          </label>
          <input
            id="inquiry-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('+251 9... or 09...', '+251 9... ወይም 09...')}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#0C0D10] border text-sm text-[#F5F3EF] placeholder-[#B4B1A8]/50 focus:outline-none focus:ring-1 focus:ring-[#C8A35F] ${
              errors.phone ? 'border-rose-500' : 'border-white/10 focus:border-[#C8A35F]'
            }`}
          />
          {errors.phone && <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>}
        </div>
      </div>

      {/* Email & Contact Method Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="inquiry-email" className="block text-xs font-medium text-[#F5F3EF] mb-1.5">
            {t('Email Address', 'ኢሜይል')} <span className="text-[#B4B1A8]/60">({t('Optional', 'አማራጭ')})</span>
          </label>
          <input
            id="inquiry-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#0C0D10] border text-sm text-[#F5F3EF] placeholder-[#B4B1A8]/50 focus:outline-none focus:ring-1 focus:ring-[#C8A35F] ${
              errors.email ? 'border-rose-500' : 'border-white/10 focus:border-[#C8A35F]'
            }`}
          />
          {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#F5F3EF] mb-1.5">
            {t('Preferred Contact Method', 'የሚመርጡት የመገናኛ መንገድ')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setContactMethod('phone')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium border min-h-[44px] transition-colors ${
                contactMethod === 'phone'
                  ? 'bg-white/10 text-[#F5F3EF] border-[#C8A35F]'
                  : 'bg-[#0C0D10] text-[#B4B1A8] border-white/10 hover:border-white/20'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-[#C8A35F]" />
              <span>{t('Phone', 'ስልክ')}</span>
            </button>

            <button
              type="button"
              onClick={() => setContactMethod('whatsapp')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium border min-h-[44px] transition-colors ${
                contactMethod === 'whatsapp'
                  ? 'bg-white/10 text-[#F5F3EF] border-[#C8A35F]'
                  : 'bg-[#0C0D10] text-[#B4B1A8] border-white/10 hover:border-white/20'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => setContactMethod('email')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium border min-h-[44px] transition-colors ${
                contactMethod === 'email'
                  ? 'bg-white/10 text-[#F5F3EF] border-[#C8A35F]'
                  : 'bg-[#0C0D10] text-[#B4B1A8] border-white/10 hover:border-white/20'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#C8A35F]" />
              <span>{t('Email', 'ኢሜይል')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="inquiry-message" className="block text-xs font-medium text-[#F5F3EF]">
            {t('Message / Inquiry Details', 'መልእክት ወይም ዝርዝር ጥያቄ')}{' '}
            <span className="text-amber-400">*</span>
          </label>
          <span className="text-[11px] text-[#B4B1A8] font-mono">
            {message.length} / {MAX_MESSAGE_LENGTH}
          </span>
        </div>
        <textarea
          id="inquiry-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          placeholder={
            inquiryType === 'viewing_request'
              ? t(
                  'Please specify preferred days or times for viewing...',
                  'እባክዎ የሚመርጡትን የሳምንቱ ቀን ወይም ሰዓት ያመልክቱ...'
                )
              : t('How can our advisors assist you?', 'እንዴት ልንረዳዎት እንችላለን?')
          }
          className={`w-full p-3.5 rounded-lg bg-[#0C0D10] border text-sm text-[#F5F3EF] placeholder-[#B4B1A8]/50 focus:outline-none focus:ring-1 focus:ring-[#C8A35F] resize-y ${
            errors.message ? 'border-rose-500' : 'border-white/10 focus:border-[#C8A35F]'
          }`}
        />
        {errors.message && <p className="mt-1 text-xs text-rose-400">{errors.message}</p>}
      </div>

      {/* Error Banner if any */}
      {submitError && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[48px] py-3 px-6 rounded-lg font-semibold text-sm text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] transition-all duration-200 shadow-lg shadow-[#C8A35F]/15 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A35F]"
      >
        {isSubmitting ? (
          <span>{t('Submitting...', 'በመላክ ላይ...')}</span>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>
              {inquiryType === 'viewing_request'
                ? t('Submit Viewing Request', 'የጉብኝት ጥያቄ ላክ')
                : t('Send Inquiry', 'መልእክት ላክ')}
            </span>
          </>
        )}
      </button>
    </form>
  );
};
