import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { submitInquiry } from '../lib/supabase';
import type { InquiryInsert, ContactMethod } from '../types/database';
import { validatePhone, validateEmail } from '../utils/formatters';
import { Calculator, PlusCircle, CheckCircle2, AlertCircle, Send, ShieldCheck } from 'lucide-react';

interface Props {
  initialTab?: 'valuation' | 'list';
  id?: string;
}

export const ValuationAndListingSection: React.FC<Props> = ({
  initialTab = 'valuation',
  id = 'valuation-section',
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'valuation' | 'list'>(initialTab);
  const loadTimeRef = useRef<number>(Date.now());

  // Form Fields
  const [propertyType, setPropertyType] = useState('villa');
  const [locationText, setLocationText] = useState('');
  const [area, setArea] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('phone');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    loadTimeRef.current = Date.now();
  }, [activeTab]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!locationText.trim()) {
      errs.location = t('Please specify the location or subcity in Addis Ababa.', 'እባክዎ ቦታውን ወይም ክፍለ ከተማውን ይግለጹ።');
    }

    if (!name.trim()) {
      errs.name = t('Please provide your full name.', 'እባክዎ ሙሉ ስምዎን ያስገቡ።');
    }

    if (!phone.trim()) {
      errs.phone = t('Please enter your phone number.', 'እባክዎ የስልክ ቁጥርዎን ያስገቡ።');
    } else if (!validatePhone(phone)) {
      errs.phone = t('Enter a valid phone number (e.g. 0911234567 or +251...).', 'ትክክለኛ የስልክ ቁጥር ያስገቡ።');
    }

    if (email.trim() && !validateEmail(email)) {
      errs.email = t('Enter a valid email address.', 'ትክክለኛ የኢሜይል አድራሻ ያስገቡ።');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (honeypot.trim().length > 0) {
      setIsSuccess(true);
      return;
    }

    const elapsed = (Date.now() - loadTimeRef.current) / 1000;
    if (elapsed < 1.5) {
      setSubmitError(t('Please review details before submission.', 'እባክዎ ከመላክዎ በፊት መረጃዎችን ያረጋግጡ።'));
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);

    const compiledMessage = `[${activeTab === 'valuation' ? 'VALUATION REQUEST' : 'LIST PROPERTY REQUEST'}]
Property Type: ${propertyType}
Location/Subcity: ${locationText.trim()}
Estimated Area: ${area ? `${area} sqm` : 'Not specified'}
Expected Price (ETB): ${expectedPrice ? expectedPrice : 'Not specified'}
Additional Notes: ${notes.trim() || 'None'}`;

    const payload: InquiryInsert = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      preferred_contact_method: contactMethod,
      message: compiledMessage,
      inquiry_type: activeTab === 'valuation' ? 'valuation_request' : 'list_property',
      status: 'new',
      source: 'website',
    };

    const res = await submitInquiry(payload);
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
    } else {
      setSubmitError(res.error || t('Submission failed. Please call us directly.', 'መረጃውን መላክ አልተቻለም።'));
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setLocationText('');
    setArea('');
    setExpectedPrice('');
    setNotes('');
    setErrors({});
    setSubmitError(null);
    loadTimeRef.current = Date.now();
  };

  return (
    <section id={id} className="w-full py-16 bg-[#0C0D10] border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono uppercase text-[#C8A35F] bg-[#C8A35F]/10 border border-[#C8A35F]/20 mb-3">
            <span>{t('Advisory & Listings', 'ማማከር እና ሽያጭ')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F3EF]">
            {activeTab === 'valuation'
              ? t('Request a Confidential Property Valuation', 'ሚስጥራዊ የንብረት ዋጋ ግመታ ይጠይቁ')
              : t('List Your Property with Our Agency', 'ንብረትዎን በእኛ በኩል ይሽጡ ወይም ያከራዩ')}
          </h2>
          <p className="mt-3 text-sm text-[#B4B1A8]">
            {activeTab === 'valuation'
              ? t(
                  'Receive a comparative market analysis for your residential or commercial asset in Addis Ababa.',
                  'በአዲስ አበባ ለሚገኝ መኖሪያ ወይም የንግድ ቤትዎ ትክክለኛ የገበያ ዋጋ ትንተና ያግኙ።'
                )
              : t(
                  'Reach qualified domestic buyers and the Ethiopian diaspora through curated private representation.',
                  'ንብረትዎን ለአገር ውስጥና በውጭ ለሚኖሩ ገዢዎች በተደራጀ መንገድ ያቅርቡ።'
                )}
          </p>

          {/* Toggle Tabs */}
          <div className="mt-6 inline-flex p-1 rounded-xl bg-[#141519] border border-white/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('valuation');
                setIsSuccess(false);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'valuation'
                  ? 'bg-[#C8A35F] text-[#0C0D10] shadow-sm'
                  : 'text-[#B4B1A8] hover:text-[#F5F3EF]'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>{t('Free Valuation', 'ነጻ ዋጋ ግመታ')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('list');
                setIsSuccess(false);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'list'
                  ? 'bg-[#C8A35F] text-[#0C0D10] shadow-sm'
                  : 'text-[#B4B1A8] hover:text-[#F5F3EF]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('List Your Property', 'ቤትዎን ያስመዝግቡ')}</span>
            </button>
          </div>
        </div>

        {/* Success Notice */}
        {isSuccess ? (
          <div className="p-8 sm:p-10 rounded-2xl bg-[#141519] border border-[#C8A35F]/30 text-center space-y-4 max-w-2xl mx-auto shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#C8A35F]/15 border border-[#C8A35F]/30 mx-auto flex items-center justify-center text-[#C8A35F]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#F5F3EF]">
              {activeTab === 'valuation'
                ? t('Valuation Request Submitted', 'የዋጋ ግመታ ጥያቄዎ ደርሶናል')
                : t('Listing Submission Received', 'የንብረት ምዝገባ ጥያቄዎ ደርሶናል')}
            </h3>
            <p className="text-sm text-[#B4B1A8] max-w-lg mx-auto leading-relaxed">
              {t(
                'Thank you for trusting our agency. A senior valuation advisor will review your property information and contact you to proceed.',
                'ኤጀንሲያችንን ስለመረጡ እናመሰግናለን። የንብረት አማካሪዎቻችን መረጃውን ገምግመው በቅርቡ ያነጋግሩዎታል።'
              )}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 text-xs font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] rounded-md transition-colors"
              >
                {t('Submit Another Request', 'ሌላ ጥያቄ ያስገቡ')}
              </button>
            </div>
          </div>
        ) : (
          /* Main Form Card */
          <form
            onSubmit={handleSubmit}
            noValidate
            className="p-6 sm:p-10 rounded-2xl bg-[#141519] border border-white/10 space-y-6 shadow-2xl"
          >
            {/* Honeypot */}
            <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Row 1: Property Type & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#F5F3EF] mb-1.5">
                  {t('Property Type', 'የንብረቱ አይነት')} <span className="text-amber-400">*</span>
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#0C0D10] border border-white/10 text-sm text-[#F5F3EF] focus:outline-none focus:border-[#C8A35F]"
                >
                  <option value="villa">{t('Luxury Villa / Compound', 'ቪላ / ግቢ')}</option>
                  <option value="apartment">{t('Apartment / Flat', 'አፓርታማ')}</option>
                  <option value="penthouse">{t('Penthouse', 'ፔንትሃውስ')}</option>
                  <option value="townhouse">{t('Townhouse', 'ታውንሃውስ')}</option>
                  <option value="commercial">{t('Commercial Building / Office', 'የንግድ ህንፃ / ቢሮ')}</option>
                  <option value="land">{t('Land / Development Plot', 'ቦታ / ይዞታ')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F5F3EF] mb-1.5">
                  {t('Location / Subcity (Addis Ababa)', 'ቦታ ወይም ክፍለ ከተማ')} <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder={t('e.g. Bole Atlas, Old Airport, Kazanchis...', 'ለምሳሌ፡ ቦሌ፣ ኦልድ ኤርፖርት፣ ካዛንቺስ...')}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#0C0D10] border text-sm text-[#F5F3EF] placeholder-[#B4B1A8]/50 focus:outline-none focus:ring-1 focus:ring-[#C8A35F] ${
                    errors.location ? 'border-rose-500' : 'border-white/10 focus:border-[#C8A35F]'
                  }`}
                />
                {errors.location && <p className="mt-1 text-xs text-rose-400">{errors.location}</p>}
              </div>
            </div>

            {/* Row 2: Estimated Area & Expected Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#F5F3EF] mb-1.5">
                  {t('Estimated Area (sqm)', 'ግምታዊ ስፋት (ካሬ ሜትር)')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder={t('e.g. 500', 'ለምሳሌ፡ 500')}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#0C0D10] border border-white/10 text-sm text-[#F5F3EF] placeholder-[#B4B1A8]/50 focus:outline-none focus:border-[#C8A35F]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F5F3EF] mb-1.5">
                  {activeTab === 'valuation'
                    ? t('Estimated / Target Value (ETB)', 'ግምታዊ ወይም የሚፈለግ ዋጋ (ብር)')
                    : t('Expected Price / Asking Rent (ETB)', 'የሚፈለግ የመሸጫ ወይም የኪራይ ዋጋ (ብር)')}
                </label>
                <input
                  type="text"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  placeholder={t('e.g. 120,000,000 or negotiable', 'ለምሳሌ፡ 120,000,000 ወይም በስምምነት')}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#0C0D10] border border-white/10 text-sm text-[#F5F3EF] placeholder-[#B4B1A8]/50 focus:outline-none focus:border-[#C8A35F]"
                />
              </div>
            </div>

            {/* Row 3: Owner Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#F5F3EF] mb-1.5">
                  {t('Your Name', 'ሙሉ ስም')} <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('Full name', 'ሙሉ ስም')}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#0C0D10] border text-sm text-[#F5F3EF] placeholder-[#B4B1A8]/50 focus:outline-none focus:ring-1 focus:ring-[#C8A35F] ${
                    errors.name ? 'border-rose-500' : 'border-white/10 focus:border-[#C8A35F]'
                  }`}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F5F3EF] mb-1.5">
                  {t('Phone Number', 'ስልክ ቁጥር')} <span className="text-amber-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('09... or +251...', '09... ወይም +251...')}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#0C0D10] border text-sm text-[#F5F3EF] placeholder-[#B4B1A8]/50 focus:outline-none focus:ring-1 focus:ring-[#C8A35F] ${
                    errors.phone ? 'border-rose-500' : 'border-white/10 focus:border-[#C8A35F]'
                  }`}
                />
                {errors.phone && <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>}
              </div>
            </div>

            {/* Row 4: Email & Preferred Contact Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#F5F3EF] mb-1.5">
                  {t('Email Address', 'ኢሜይል')} <span className="text-[#B4B1A8]/60">({t('Optional', 'አማራጭ')})</span>
                </label>
                <input
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
                  {(['phone', 'whatsapp', 'email'] as ContactMethod[]).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setContactMethod(method)}
                      className={`min-h-[44px] px-2 py-2 text-xs font-medium rounded-lg border capitalize transition-colors ${
                        contactMethod === method
                          ? 'bg-white/10 text-[#F5F3EF] border-[#C8A35F]'
                          : 'bg-[#0C0D10] text-[#B4B1A8] border-white/10 hover:border-white/20'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 5: Additional Notes */}
            <div>
              <label className="block text-xs font-medium text-[#F5F3EF] mb-1.5">
                {t('Additional Property Details / Specifications', 'ተጨማሪ የንብረቱ መረጃዎች')}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 800))}
                placeholder={t(
                  'e.g. compound features, title status, road access, or specific questions...',
                  'ለምሳሌ፡ የካርታ ሁኔታ፣ የመንገድ ተደራሽነት፣ ልዩ መለያዎች...'
                )}
                className="w-full p-3.5 rounded-lg bg-[#0C0D10] border border-white/10 text-sm text-[#F5F3EF] placeholder-[#B4B1A8]/50 focus:outline-none focus:border-[#C8A35F] resize-y"
              />
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Privacy notice */}
            <div className="flex items-center gap-2 text-xs text-[#B4B1A8]/80 font-mono">
              <ShieldCheck className="w-4 h-4 text-[#C8A35F] shrink-0" />
              <span>
                {t(
                  'All valuation details and private ownership records are held in strict professional confidence.',
                  'ሁሉም መረጃዎች እና የባለቤትነት ሰነዶች በሚስጥር የተጠበቁ ናቸው።'
                )}
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] py-3.5 px-6 rounded-lg font-semibold text-sm text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] transition-all duration-200 shadow-xl shadow-[#C8A35F]/15 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{t('Submitting Details...', 'በመላክ ላይ...')}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {activeTab === 'valuation'
                      ? t('Submit for Free Valuation', 'የዋጋ ግመታ ጥያቄ ላክ')
                      : t('Submit Property for Listing', 'ንብረትዎን ለማስመዝገብ ይላኩ')}
                  </span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
