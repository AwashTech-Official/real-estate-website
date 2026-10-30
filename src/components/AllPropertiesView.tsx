import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getAllProperties } from '../lib/supabase';
import type { Property, CompanySettings } from '../types/database';
import { PropertyCard } from './PropertyCard';
import { Filter, X, ArrowLeft, RotateCcw } from 'lucide-react';

interface AllPropertiesViewProps {
  companySettings?: Partial<CompanySettings> | null;
  onBackToHome: () => void;
  onSelectProperty: (property: Property) => void;
}

export const AllPropertiesView: React.FC<AllPropertiesViewProps> = ({
  companySettings,
  onBackToHome,
  onSelectProperty,
}) => {
  const { language, t } = useLanguage();
  const isRentalsEnabled = Boolean(companySettings?.rent_listings_enabled);

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [listingType, setListingType] = useState<'all' | 'sale' | 'rent'>('all');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [subcity, setSubcity] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('all');

  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  useEffect(() => {
    async function fetchProperties() {
      setIsLoading(true);
      const data = await getAllProperties({
        rentListingsEnabled: isRentalsEnabled,
      });
      setProperties(data);
      setIsLoading(false);
    }
    fetchProperties();
  }, [isRentalsEnabled]);

  // Client-side filtering logic
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Rental guard
      if (p.listing_type === 'rent' && !isRentalsEnabled) return false;

      // Listing type
      if (listingType !== 'all' && p.listing_type !== listingType) return false;

      // Property type
      if (propertyType !== 'all' && p.property_type !== propertyType) return false;

      // Subcity
      if (subcity !== 'all' && p.subcity !== subcity) return false;

      // Bedrooms
      if (bedrooms !== 'all') {
        const bedNum = parseInt(bedrooms, 10);
        if ((p.bedrooms || 0) < bedNum) return false;
      }

      // Price range
      if (minPrice) {
        const minVal = parseFloat(minPrice);
        if (!isNaN(minVal) && p.price < minVal && !p.price_on_request) return false;
      }
      if (maxPrice) {
        const maxVal = parseFloat(maxPrice);
        if (!isNaN(maxVal) && p.price > maxVal && !p.price_on_request) return false;
      }

      return true;
    });
  }, [properties, listingType, propertyType, subcity, bedrooms, minPrice, maxPrice, isRentalsEnabled]);

  const resetFilters = () => {
    setListingType('all');
    setPropertyType('all');
    setSubcity('all');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('all');
  };

  const hasActiveFilters =
    listingType !== 'all' ||
    propertyType !== 'all' ||
    subcity !== 'all' ||
    bedrooms !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '';

  const subcityOptions = [
    { value: 'all', labelEn: 'All Subcities', labelAm: 'ሁሉም ክፍለ ከተሞች' },
    { value: 'Bole', labelEn: 'Bole', labelAm: 'ቦሌ' },
    { value: 'Kirkos', labelEn: 'Kirkos', labelAm: 'ቂርቆስ' },
    { value: 'Yeka', labelEn: 'Yeka', labelAm: 'የካ' },
    { value: 'Nifas Silk-Lafto', labelEn: 'Nifas Silk-Lafto', labelAm: 'ንፋስ ስልክ ላፍቶ' },
    { value: 'Gulele', labelEn: 'Gulele', labelAm: 'ጉለሌ' },
    { value: 'Lideta', labelEn: 'Lideta', labelAm: 'ልደታ' },
    { value: 'Arada', labelEn: 'Arada', labelAm: 'አራዳ' },
  ];

  const propertyTypeOptions = [
    { value: 'all', labelEn: 'All Types', labelAm: 'ሁሉም አይነቶች' },
    { value: 'villa', labelEn: 'Villa', labelAm: 'ቪላ' },
    { value: 'apartment', labelEn: 'Apartment', labelAm: 'አፓርታማ' },
    { value: 'penthouse', labelEn: 'Penthouse', labelAm: 'ፔንትሃውስ' },
    { value: 'townhouse', labelEn: 'Townhouse', labelAm: 'ታውንሃውስ' },
    { value: 'commercial', labelEn: 'Commercial', labelAm: 'ንግድ ቤት' },
    { value: 'land', labelEn: 'Land & Plots', labelAm: 'ቦታ / ይዞታ' },
  ];

  return (
    <div className="w-full min-h-screen-dvh bg-[#0C0D10] text-[#F5F3EF] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#C8A35F] hover:text-[#DEC07E] transition-colors py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('Back to Home', 'ወደ ዋናው ገጽ ተመለስ')}</span>
          </button>

          <span className="text-xs text-[#B4B1A8] font-mono">
            {t(
              `${filteredProperties.length} Properties Available`,
              `${filteredProperties.length} ቤቶች ይገኛሉ`
            )}
          </span>
        </div>

        {/* Page Title (One H1 per page) */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F3EF]">
            {t('Explore Addis Ababa Properties', 'የአዲስ አበባ ቤቶችን ያስሱ')}
          </h1>
          <p className="mt-2 text-sm text-[#B4B1A8] max-w-2xl">
            {t(
              'Filter by subcity, property type, price range, and bedrooms across verified residential and commercial opportunities.',
              'በክፍለ ከተማ፣ በቤት አይነት፣ በዋጋ እና በመኝታ ክፍሎች ብዛት የሚፈልጉትን ቤት ይፈልጉ።'
            )}
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-6">
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#141519] border border-white/10 rounded-xl text-sm font-semibold text-[#F5F3EF]"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#C8A35F]" />
              <span>{t('Filter Properties', 'ቤቶችን አጣራ')}</span>
            </span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#C8A35F]" />
            )}
          </button>
        </div>

        {/* Filters Toolbar */}
        <div
          className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} mb-10 p-6 rounded-2xl bg-[#141519] border border-white/10 space-y-5`}
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#C8A35F] flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              <span>{t('Filter Criteria', 'የማጣሪያ መስፈርቶች')}</span>
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs text-[#B4B1A8] hover:text-[#F5F3EF] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('Reset Filters', 'ማጣሪያዎችን አጽዳ')}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Listing Type */}
            <div>
              <label className="block text-xs font-medium text-[#B4B1A8] mb-1.5 font-mono">
                {t('Listing Type', 'የዝርዝር አይነት')}
              </label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value as any)}
                className="w-full min-h-[44px] px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-xs font-medium text-[#F5F3EF] focus:outline-none focus:border-[#C8A35F]"
              >
                <option value="all">{t('All (Sale & Rent)', 'ሁሉም (ሽያጭና ኪራይ)')}</option>
                <option value="sale">{t('For Sale', 'ለሽያጭ')}</option>
                {isRentalsEnabled && (
                  <option value="rent">{t('For Rent', 'ለኪራይ')}</option>
                )}
              </select>
            </div>

            {/* 2. Property Type */}
            <div>
              <label className="block text-xs font-medium text-[#B4B1A8] mb-1.5 font-mono">
                {t('Property Type', 'የንብረት አይነት')}
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-xs font-medium text-[#F5F3EF] focus:outline-none focus:border-[#C8A35F]"
              >
                {propertyTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelEn, opt.labelAm)}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Subcity */}
            <div>
              <label className="block text-xs font-medium text-[#B4B1A8] mb-1.5 font-mono">
                {t('Subcity', 'ክፍለ ከተማ')}
              </label>
              <select
                value={subcity}
                onChange={(e) => setSubcity(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-xs font-medium text-[#F5F3EF] focus:outline-none focus:border-[#C8A35F]"
              >
                {subcityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelEn, opt.labelAm)}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Bedrooms */}
            <div>
              <label className="block text-xs font-medium text-[#B4B1A8] mb-1.5 font-mono">
                {t('Bedrooms', 'መኝታ ክፍሎች')}
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-xs font-medium text-[#F5F3EF] focus:outline-none focus:border-[#C8A35F]"
              >
                <option value="all">{t('Any Bedrooms', 'ማንኛውም')}</option>
                <option value="1">1+ {t('Bedrooms', 'መኝታ')}</option>
                <option value="2">2+ {t('Bedrooms', 'መኝታ')}</option>
                <option value="3">3+ {t('Bedrooms', 'መኝታ')}</option>
                <option value="4">4+ {t('Bedrooms', 'መኝታ')}</option>
                <option value="5">5+ {t('Bedrooms', 'መኝታ')}</option>
              </select>
            </div>

            {/* 5. Max Price (ETB) */}
            <div>
              <label className="block text-xs font-medium text-[#B4B1A8] mb-1.5 font-mono">
                {t('Max Price (ETB)', 'ከፍተኛ ዋጋ (ብር)')}
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder={t('e.g. 200,000,000', 'ለምሳሌ 200,000,000')}
                className="w-full min-h-[44px] px-3 py-2 bg-[#0C0D10] border border-white/10 rounded-lg text-xs font-medium text-[#F5F3EF] placeholder-[#B4B1A8]/40 focus:outline-none focus:border-[#C8A35F]"
              />
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-[440px] rounded-xl bg-[#141519] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#141519] border border-white/10 p-8 space-y-4">
            <p className="text-base font-semibold text-[#F5F3EF]">
              {t(
                'No properties found matching your filter criteria.',
                'በመረጡት መስፈርት መሰረት የተገኘ ቤት የለም።'
              )}
            </p>
            <p className="text-xs text-[#B4B1A8] max-w-md mx-auto">
              {t(
                'Try broadening your subcity, bedroom, or price range filters to view available options.',
                'እባክዎ የማጣሪያ መስፈርቱን በማስፋት እንደገና ይሞክሩ።'
              )}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('Reset All Filters', 'ሁሉንም ማጣሪያዎች አጽዳ')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSelectProperty={onSelectProperty}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
