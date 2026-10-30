import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface SectionPlaceholderProps {
  id: string;
  orderNumber: string;
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
}

export const SectionPlaceholder: React.FC<SectionPlaceholderProps> = ({
  id,
  orderNumber,
  titleEn,
  titleAm,
  descriptionEn,
  descriptionAm,
}) => {
  const { t } = useLanguage();

  return (
    <section
      id={id}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      aria-label={t(titleEn, titleAm)}
    >
      <div className="rounded-xl border border-dashed border-white/10 bg-[#141519]/40 p-8 sm:p-10 transition-colors hover:border-[#C8A35F]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#C8A35F] tracking-wider uppercase">
                {orderNumber}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-xs text-[#B4B1A8] font-mono">
                #{id}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#F5F3EF]">
              {t(titleEn, titleAm)}
            </h3>
            <p className="text-sm text-[#B4B1A8] max-w-2xl">
              {t(descriptionEn, descriptionAm)}
            </p>
          </div>

          <div className="self-start sm:self-auto shrink-0">
            <span className="inline-flex items-center px-3 py-1 rounded text-xs font-mono text-[#B4B1A8] bg-white/5 border border-white/5">
              Ready for section build
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
