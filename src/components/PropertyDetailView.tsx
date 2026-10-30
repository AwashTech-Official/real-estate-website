import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getPropertyBySlug } from '../lib/supabase';
import type { Property, PropertyMedia } from '../types/database';
import { formatPrice, formatArea } from '../utils/formatters';
import { InquiryForm } from './InquiryForm';
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Tag,
  Check,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface PropertyDetailViewProps {
  slug: string;
  onBack: () => void;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ slug, onBack }) => {
  const { language, t } = useLanguage();
  const [property, setProperty] = useState<Property | null>(null);
  const [media, setMedia] = useState<PropertyMedia[]>([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const res = await getPropertyBySlug(slug);
      setProperty(res.property);
      setMedia(res.media);
      setSelectedMediaIndex(0);
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    loadData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen-dvh bg-[#0C0D10] text-[#F5F3EF] pt-28 pb-20 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#C8A35F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#B4B1A8] font-mono">
            {t('Loading property details...', 'የቤቱን መረጃ በመጫን ላይ...')}
          </p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="w-full min-h-screen-dvh bg-[#0C0D10] text-[#F5F3EF] pt-28 pb-20 flex flex-col items-center justify-center px-4">
        <p className="text-lg font-semibold text-[#F5F3EF]">
          {t('Property not found.', 'ቤቱ አልተገኘም።')}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 px-6 py-2.5 rounded-lg text-xs font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] transition-colors"
        >
          {t('Back to Properties', 'ወደ ቤቶች ዝርዝር ተመለስ')}
        </button>
      </div>
    );
  }

  const title = language === 'am' && property.title_am ? property.title_am : property.title;
  const description =
    language === 'am' && property.description_am ? property.description_am : property.description;
  const location = property.public_location_text || property.subcity || 'Addis Ababa';
  const priceDisplay = formatPrice(
    property.price,
    property.price_on_request,
    property.display_price,
    language
  );
  const areaDisplay = formatArea(property.area || property.area_sqm, language);

  const isSale = property.listing_type === 'sale';
  const listingBadge = isSale ? t('For Sale', 'ለሽያጭ') : t('For Rent', 'ለኪራይ');

  const activeMedia = media[selectedMediaIndex] || {
    media_url: property.cover_image_url || '',
    caption: title,
  };

  const amenitiesList =
    language === 'am' && property.amenities_am?.length
      ? property.amenities_am
      : property.amenities || [];

  const highlightsList =
    language === 'am' && property.highlights_am?.length
      ? property.highlights_am
      : property.highlights || [];

  const handlePrevMedia = () => {
    setSelectedMediaIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const handleNextMedia = () => {
    setSelectedMediaIndex((prev) => (prev + 1) % media.length);
  };

  return (
    <article className="w-full min-h-screen-dvh bg-[#0C0D10] text-[#F5F3EF] pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#C8A35F] hover:text-[#DEC07E] transition-colors py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('Back to All Properties', 'ወደ ቤቶች ዝርዝር ተመለስ')}</span>
          </button>
        </div>

        {/* Header: Title, Badges, Location, and Price */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-3 max-w-3xl">
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded text-xs font-semibold text-[#0C0D10] bg-[#C8A35F]">
                {listingBadge}
              </span>
              <span className="px-3 py-1 rounded text-xs font-semibold text-[#F5F3EF] bg-[#141519] border border-white/10 uppercase tracking-wider font-mono">
                {t(property.property_type, property.property_type)}
              </span>
              {property.is_demo && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold text-amber-200 bg-black/70 border border-amber-400/40 backdrop-blur-sm">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('Demo listing', 'የሙከራ ቤት')}</span>
                </span>
              )}
            </div>

            {/* Single H1 for Property Detail View (SEO Best Practice) */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F3EF] leading-tight">
              {title}
            </h1>

            {/* Public Location Text Only */}
            <div className="flex items-center gap-2 text-sm text-[#B4B1A8]">
              <MapPin className="w-4 h-4 text-[#C8A35F] shrink-0" />
              <span>{location}</span>
              {property.subcity && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="font-mono text-xs">{property.subcity}</span>
                </>
              )}
            </div>
          </div>

          {/* Price Box */}
          <div className="flex flex-col items-start lg:items-end bg-[#141519] p-5 rounded-xl border border-white/10 shrink-0">
            <span className="text-xs uppercase tracking-wider text-[#B4B1A8] font-mono">
              {isSale ? t('Purchase Price', 'የመሸጫ ዋጋ') : t('Monthly Rent', 'የወር ኪራይ')}
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#F5F3EF] tracking-tight mt-1">
              {priceDisplay}
            </span>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="my-8 space-y-4">
          {/* Main Stage Image */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#141519] border border-white/10">
            <img
              src={activeMedia.media_url}
              alt={activeMedia.caption || title}
              className="w-full h-full object-cover"
              decoding="async"
            />

            {/* Media Navigation Arrows if multiple media exist */}
            {media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevMedia}
                  aria-label="Previous photo"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-[#F5F3EF] flex items-center justify-center border border-white/20 backdrop-blur-md transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMedia}
                  aria-label="Next photo"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-[#F5F3EF] flex items-center justify-center border border-white/20 backdrop-blur-md transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Caption & Counter */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 drop-shadow p-2 rounded bg-black/50 backdrop-blur-md">
              <span className="truncate">{activeMedia.caption || title}</span>
              {media.length > 1 && (
                <span className="font-mono ml-2 shrink-0">
                  {selectedMediaIndex + 1} / {media.length}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails Row */}
          {media.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {media.map((item, idx) => (
                <button
                  type="button"
                  key={item.id || idx}
                  onClick={() => setSelectedMediaIndex(idx)}
                  className={`relative aspect-[16/10] w-24 sm:w-28 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    selectedMediaIndex === idx
                      ? 'border-[#C8A35F] scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.media_url}
                    alt={item.caption || `Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Specs Strip: Bedrooms, Bathrooms, Area */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-xl bg-[#141519] border border-white/10 my-8">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#B4B1A8] font-mono">
              {t('Bedrooms', 'መኝታ ክፍሎች')}
            </span>
            <div className="flex items-center gap-2 text-base font-semibold text-[#F5F3EF]">
              <Bed className="w-4 h-4 text-[#C8A35F]" />
              <span>{property.bedrooms ?? '—'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#B4B1A8] font-mono">
              {t('Bathrooms', 'መታጠቢያ ክፍሎች')}
            </span>
            <div className="flex items-center gap-2 text-base font-semibold text-[#F5F3EF]">
              <Bath className="w-4 h-4 text-[#C8A35F]" />
              <span>{property.bathrooms ?? '—'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#B4B1A8] font-mono">
              {t('Property Area', 'የቦታ ስፋት')}
            </span>
            <div className="flex items-center gap-2 text-base font-semibold text-[#F5F3EF]">
              <Maximize2 className="w-4 h-4 text-[#C8A35F]" />
              <span>{areaDisplay || '—'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#B4B1A8] font-mono">
              {t('Listing Status', 'የይዞታ ሁኔታ')}
            </span>
            <div className="flex items-center gap-2 text-base font-semibold text-[#F5F3EF]">
              <Shield className="w-4 h-4 text-[#C8A35F]" />
              <span>{t('Verified Title', 'የተረጋገጠ ካርታ')}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Content (Left) & Inquiry Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Description, Highlights, Amenities */}
          <div className="lg:col-span-7 space-y-8">
            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-[#F5F3EF]">
                {t('Property Overview', 'የቤቱ አጠቃላይ መግለጫ')}
              </h2>
              <p className="text-sm sm:text-base text-[#B4B1A8] leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Highlights */}
            {highlightsList.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-white/10">
                <h2 className="text-lg font-bold text-[#F5F3EF] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C8A35F]" />
                  <span>{t('Key Highlights', 'ዋና ዋና መለያዎች')}</span>
                </h2>
                <ul className="space-y-2">
                  {highlightsList.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-[#F5F3EF]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8A35F] mt-2 shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Amenities */}
            {amenitiesList.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-white/10">
                <h2 className="text-lg font-bold text-[#F5F3EF]">
                  {t('Amenities & Building Features', 'የግቢው እና የህንፃው አገልግሎቶች')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {amenitiesList.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-lg bg-[#141519] border border-white/5 text-xs text-[#F5F3EF]"
                    >
                      <Check className="w-4 h-4 text-[#C8A35F] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Inquiry & Viewing Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <span className="text-xs uppercase tracking-wider font-mono text-[#C8A35F]">
                  {t('Direct Inquiries', 'ቀጥተኛ ጥያቄ')}
                </span>
                <h2 className="text-xl font-bold text-[#F5F3EF] mt-1">
                  {t('Inquire About This Property', 'ስለዚህ ቤት ይጠይቁ')}
                </h2>
              </div>

              <InquiryForm
                propertyId={property.id}
                propertyTitle={title}
                defaultType="viewing_request"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
