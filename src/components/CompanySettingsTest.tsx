import React, { useEffect, useState, useCallback } from 'react';
import { getCompanySettings, isSupabaseConfigured, type CompanySettingsResult } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { Database, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Building2 } from 'lucide-react';

interface Props {
  onCompanyLoaded?: (name: string, nameAm?: string | null) => void;
}

export const CompanySettingsTest: React.FC<Props> = ({ onCompanyLoaded }) => {
  const { language, t } = useLanguage();
  const [result, setResult] = useState<CompanySettingsResult>({
    data: null,
    error: null,
    isConfigured: isSupabaseConfigured,
    status: 'loading',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsRefreshing(true);
    const res = await getCompanySettings();
    setResult(res);
    setIsRefreshing(false);

    if (res.data?.company_name) {
      onCompanyLoaded?.(res.data.company_name, res.data.company_name_am);
    }
  }, [onCompanyLoaded]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const activeCompanyName =
    language === 'am' && result.data?.company_name_am
      ? result.data.company_name_am
      : result.data?.company_name || '';

  const activeTagline =
    language === 'am' && result.data?.tagline_am
      ? result.data.tagline_am
      : result.data?.tagline || '';

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4 sm:px-6">
      <div className="rounded-xl border border-white/10 bg-[#141519] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C8A35F]/10 border border-[#C8A35F]/20 flex items-center justify-center text-[#C8A35F]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#F5F3EF]">
                  {t('Supabase Connection Test', 'የሱፓቤዝ ዳታቤዝ ግንኙነት ሙከራ')}
                </h2>
                <span className="text-xs text-[#B4B1A8] font-mono">
                  [company_settings]
                </span>
              </div>
              <p className="text-xs text-[#B4B1A8] mt-0.5">
                {t(
                  'Reading public company profile via environment variables with explicit column selection',
                  'የኩባንያ መረጃን በይፋዊ ዓምዶች ብቻ ከሱፓቤዝ በማንበብ ላይ'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {result.status === 'connected' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('Live Supabase Connected', 'ከሱፓቤዝ ጋር ተገናኝቷል')}
              </span>
            )}
            {result.status === 'unconfigured' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40 rounded">
                <AlertCircle className="w-3.5 h-3.5" />
                {t('Environment Variables Pending', 'የአካባቢ ተለዋዋጮች አልተሞሉም')}
              </span>
            )}
            {result.status === 'error' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded">
                <AlertCircle className="w-3.5 h-3.5" />
                {t('Connection Error', 'የግንኙነት ስህተት')}
              </span>
            )}
            {result.status === 'loading' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#B4B1A8] bg-white/5 rounded">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {t('Querying...', 'በመፈለግ ላይ...')}
              </span>
            )}

            <button
              onClick={fetchSettings}
              disabled={isRefreshing}
              className="p-1.5 text-[#B4B1A8] hover:text-[#F5F3EF] hover:bg-white/5 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A35F]"
              title={t('Retry Supabase Query', 'ዳግም ሞክር')}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Company Name Result Display */}
        <div className="py-6">
          <div className="text-xs uppercase tracking-wider text-[#B4B1A8] mb-2 font-mono">
            {t('Company Name (from database):', 'የኩባንያው ስም (ከዳታቤዝ የተገኘ):')}
          </div>

          {result.status === 'connected' && result.data?.company_name ? (
            <div className="flex flex-col gap-2 p-5 rounded-lg bg-[#0C0D10] border border-[#C8A35F]/30">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#C8A35F] shrink-0" />
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F3EF]">
                  {activeCompanyName}
                </span>
              </div>
              {activeTagline && (
                <p className="text-sm text-[#B4B1A8] pl-9">
                  {activeTagline}
                </p>
              )}
              {result.data.company_name_am && (
                <div className="mt-2 pt-2 border-t border-white/5 text-xs text-[#B4B1A8] flex items-center gap-2">
                  <span>English: <strong className="text-[#F5F3EF]">{result.data.company_name}</strong></span>
                  <span>·</span>
                  <span>አማርኛ: <strong className="text-[#C8A35F] font-normal">{result.data.company_name_am}</strong></span>
                </div>
              )}
            </div>
          ) : result.status === 'unconfigured' ? (
            <div className="p-5 rounded-lg bg-[#0C0D10] border border-amber-500/20 text-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <p className="text-[#F5F3EF] font-medium">
                    {t(
                      'Ready to connect to your Supabase project.',
                      'ከሱፓቤዝ ፕሮጀክትዎ ጋር ለመገናኘት ዝግጁ ነው።'
                    )}
                  </p>
                  <p className="text-xs text-[#B4B1A8] leading-relaxed">
                    {t(
                      'Please ensure your Supabase URL and public anon key are defined in your environment variables (.env file):',
                      'እባክዎ የሱፓቤዝ URL እና public anon key በአካባቢ ተለዋዋጮች (.env ፋይል) ውስጥ መኖራቸውን ያረጋግጡ:'
                    )}
                  </p>
                  <pre className="p-3 bg-[#141519] border border-white/10 rounded font-mono text-xs text-[#C8A35F] overflow-x-auto">
{`VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"`}
                  </pre>
                  <div className="text-xs text-[#B4B1A8]">
                    <span>{t('Placeholder company preview:', 'የሙከራ ኩባንያ ስም እይታ:')} </span>
                    <strong className="text-[#F5F3EF]">
                      {t('Addis Luxury Realty (Placeholder)', 'አዲስ የቅንጦት ሪል እስቴት (ጊዜያዊ)')}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ) : result.status === 'error' ? (
            <div className="p-5 rounded-lg bg-[#0C0D10] border border-rose-500/20 text-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[#F5F3EF] font-medium">
                    {t('Failed to read company_settings table', 'የኩባንያ መረጃን ማንበብ አልተቻለም')}
                  </p>
                  <p className="text-xs text-rose-300 font-mono">
                    {result.error}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-lg bg-[#0C0D10] border border-white/5 animate-pulse text-sm text-[#B4B1A8]">
              {t('Connecting and fetching company_settings from Supabase...', 'ከሱፓቤዝ ጋር በመገናኘት ላይ...')}
            </div>
          )}
        </div>

        {/* Security & Explicit Columns Compliance Notice */}
        <div className="mt-2 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#B4B1A8]">
          <div className="flex items-center gap-1.5 text-emerald-400/90">
            <ShieldCheck className="w-4 h-4 text-[#C8A35F]" />
            <span>
              {t(
                'Security enforced: Strict public projection (internal_notes & address_internal omitted)',
                'ደህንነት የተጠበቀ: የህዝብ ዓምዶች ብቻ የተመረጡ (ሚስጥራዊ ማስታወሻዎች እና አድራሻዎች ተዘግተዋል)'
              )}
            </span>
          </div>

          <div className="text-xs text-[#B4B1A8]/70">
            <span>Market: Addis Ababa, Ethiopia</span>
            <span className="mx-1.5">·</span>
            <span>Target: Luxury Residential & Commercial</span>
          </div>
        </div>
      </div>
    </div>
  );
};
