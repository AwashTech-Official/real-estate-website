import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getFeaturedProperties } from '../lib/supabase';
import type { Property } from '../types/database';
import { PropertyCard } from './PropertyCard';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedPropertiesProps {
  onSelectProperty?: (property: Property) => void;
  onViewAllProperties?: () => void;
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  onSelectProperty,
  onViewAllProperties,
}) => {
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFeatured() {
      setIsLoading(true);
      const data = await getFeaturedProperties();
      setProperties(data);
      setIsLoading(false);
    }
    loadFeatured();
  }, []);

  return (
    <section
      id="properties"
      className="w-full py-16 sm:py-24 bg-[#0C0D10] border-t border-white/5 scroll-mt-20"
      aria-label={t('Featured Properties', 'ተለይተው የቀረቡ ቤቶች')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono uppercase text-[#C8A35F] bg-[#C8A35F]/10 border border-[#C8A35F]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('Curated Portfolio', 'የተመረጡ ቤቶች')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F3EF]">
              {t('Featured Properties in Addis Ababa', 'በአዲስ አበባ ተለይተው የቀረቡ ቤቶች')}
            </h2>
            <p className="text-sm text-[#B4B1A8] leading-relaxed">
              {t(
                'A selected collection of verified luxury villas, penthouses, and executive residences across premier subcities.',
                'በተመራጭ ክፍለ ከተሞች ውስጥ የሚገኙ የተረጋገጡ የቅንጦት ቪላዎች፣ ፔንትሃውሶች እና አፓርታማዎች ስብስብ።'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onViewAllProperties}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] transition-colors shadow-md whitespace-nowrap self-start md:self-auto min-h-[44px]"
          >
            <span>{t('View All Properties', 'ሁሉንም ቤቶች ይመልከቱ')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-[420px] rounded-xl bg-[#141519] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#141519] border border-white/10 text-sm text-[#B4B1A8]">
            {t('No featured properties available at this moment.', 'በአሁኑ ሰዓት የተመረጡ ቤቶች የሉም።')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSelectProperty={onSelectProperty}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
