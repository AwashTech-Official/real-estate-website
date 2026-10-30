import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { Property } from '../types/database';
import { formatPrice, formatArea } from '../utils/formatters';
import { MapPin, Bed, Bath, Maximize2, Tag } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelectProperty?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelectProperty,
}) => {
  const { language, t } = useLanguage();

  const title = language === 'am' && property.title_am ? property.title_am : property.title;
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelectProperty?.(property);
  };

  return (
    <article
      onClick={handleClick}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-[#141519] border border-white/10 hover:border-[#C8A35F]/60 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
    >
      {/* Top Media Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0C0D10]">
        <img
          src={property.cover_image_url || '/placeholder-property.jpg'}
          alt={title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dark contrast scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141519] via-transparent to-black/40 pointer-events-none" />

        {/* Badges Bar: Listing Type & Demo Label */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold text-[#0C0D10] bg-[#C8A35F] shadow-md">
            {listingBadge}
          </span>

          {property.is_demo && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-amber-200 bg-black/75 border border-amber-400/50 backdrop-blur-md shadow-md">
              <Tag className="w-3 h-3 text-amber-400" />
              <span>{t('Demo listing', 'የሙከራ ቤት')}</span>
            </span>
          )}
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-xs text-[#F5F3EF] drop-shadow z-10">
          <MapPin className="w-3.5 h-3.5 text-[#C8A35F] shrink-0" />
          <span className="truncate font-medium">{location}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div>
          {/* Property Type kicker */}
          <span className="text-xs uppercase tracking-wider font-semibold text-[#C8A35F] font-mono">
            {t(property.property_type, property.property_type)}
          </span>

          {/* Title */}
          <h3 className="mt-1 text-base sm:text-lg font-semibold text-[#F5F3EF] group-hover:text-[#C8A35F] transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>
        </div>

        {/* Specs: Bedrooms, Bathrooms, Area */}
        <div className="flex items-center gap-4 text-xs text-[#B4B1A8] pt-2 border-t border-white/5 font-mono">
          {property.bedrooms !== null && property.bedrooms !== undefined && (
            <div className="flex items-center gap-1.5" title={t('Bedrooms', 'መኝታ ክፍሎች')}>
              <Bed className="w-3.5 h-3.5 text-[#C8A35F]" />
              <span>
                {property.bedrooms} {t('Beds', 'መኝታ')}
              </span>
            </div>
          )}

          {property.bathrooms !== null && property.bathrooms !== undefined && (
            <div className="flex items-center gap-1.5" title={t('Bathrooms', 'መታጠቢያ ክፍሎች')}>
              <Bath className="w-3.5 h-3.5 text-[#C8A35F]" />
              <span>
                {property.bathrooms} {t('Baths', 'መታጠቢያ')}
              </span>
            </div>
          )}

          {areaDisplay && (
            <div className="flex items-center gap-1.5 ml-auto" title={t('Area', 'ስፋት')}>
              <Maximize2 className="w-3.5 h-3.5 text-[#C8A35F]" />
              <span>{areaDisplay}</span>
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-[#B4B1A8] font-mono">
              {isSale ? t('Price', 'ዋጋ') : t('Rent / Month', 'ኪራይ በወር')}
            </span>
            <span className="text-base sm:text-lg font-bold text-[#F5F3EF] tracking-tight">
              {priceDisplay}
            </span>
          </div>

          <span className="text-xs font-semibold text-[#C8A35F] group-hover:underline">
            {t('View Details →', 'ዝርዝር እይ →')}
          </span>
        </div>
      </div>
    </article>
  );
};
