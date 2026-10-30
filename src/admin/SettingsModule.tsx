import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, Globe, Phone, Mail, MessageCircle, Send } from 'lucide-react';
import { getCompanySettings, updateCompanySettingsAdmin } from '../lib/supabase';
import type { CompanySettings } from '../types/database';
import { validateEmail, validatePhone } from '../utils/formatters';

export const SettingsModule: React.FC = () => {
  const [settings, setSettings] = useState<Partial<CompanySettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getCompanySettings();
      if (res.data) {
        setSettings(res.data);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation
    if (!settings.company_name?.trim()) {
      setFeedback({ type: 'error', message: 'Company name is required.' });
      return;
    }

    if (settings.email && !validateEmail(settings.email)) {
      setFeedback({ type: 'error', message: 'Please provide a valid company email address.' });
      return;
    }

    if (settings.phone && !validatePhone(settings.phone)) {
      setFeedback({ type: 'error', message: 'Please provide a valid phone number (e.g. +251...).' });
      return;
    }

    setIsSaving(true);
    const res = await updateCompanySettingsAdmin(settings);
    setIsSaving(false);

    if (res.success) {
      setFeedback({ type: 'success', message: 'Company settings updated successfully in Supabase.' });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update company settings.' });
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs text-[#B4B1A8] font-mono">
        Loading company settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#F5F3EF] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#C8A35F]" />
          <span>Agency Settings & Configuration</span>
        </h2>
        <p className="text-xs text-[#B4B1A8] mt-0.5">
          Configure branding, official contact channels, social networks, and feature toggles.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-red-950/40 border-red-500/30 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 1: Branding & Identity */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#C8A35F]">
            1. Branding & Localization
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#B4B1A8] mb-1">Company Name (English) *</label>
              <input
                type="text"
                required
                value={settings.company_name || ''}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] focus:border-[#C8A35F]"
              />
            </div>

            <div>
              <label className="block text-[#B4B1A8] mb-1">Company Name (Amharic)</label>
              <input
                type="text"
                value={settings.company_name_am || ''}
                onChange={(e) => setSettings({ ...settings, company_name_am: e.target.value })}
                placeholder="ምሳሌ፡ አዲስ የቅንጦት ሪል እስቴት"
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] focus:border-[#C8A35F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#B4B1A8] mb-1">Tagline (English)</label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] focus:border-[#C8A35F]"
              />
            </div>

            <div>
              <label className="block text-[#B4B1A8] mb-1">Tagline (Amharic)</label>
              <input
                type="text"
                value={settings.tagline_am || ''}
                onChange={(e) => setSettings({ ...settings, tagline_am: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] focus:border-[#C8A35F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#B4B1A8] mb-1">Agency Logo URL</label>
            <input
              type="text"
              value={settings.logo_url || ''}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
              placeholder="https://... or hosted image URL"
              className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] font-mono focus:border-[#C8A35F]"
            />
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#C8A35F]">
            2. Direct Contact Details & WhatsApp
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#B4B1A8] mb-1">Official Phone</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+251 91 123 4567"
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] font-mono focus:border-[#C8A35F]"
              />
            </div>

            <div>
              <label className="block text-[#B4B1A8] mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsapp || settings.whatsapp_number || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    whatsapp: e.target.value,
                    whatsapp_number: e.target.value,
                  })
                }
                placeholder="+251 91 123 4567"
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] font-mono focus:border-[#C8A35F]"
              />
            </div>

            <div>
              <label className="block text-[#B4B1A8] mb-1">Email Address</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="contact@addisluxuryrealty.com"
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] focus:border-[#C8A35F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#B4B1A8] mb-1">Office Address (English)</label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Bole Subcity, Woreda 03, Addis Ababa, Ethiopia"
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] focus:border-[#C8A35F]"
              />
            </div>

            <div>
              <label className="block text-[#B4B1A8] mb-1">Office Address (Amharic)</label>
              <input
                type="text"
                value={settings.address_am || ''}
                onChange={(e) => setSettings({ ...settings, address_am: e.target.value })}
                placeholder="ቦሌ ክፍለ ከተማ፣ ወረዳ 03፣ አዲስ አበባ"
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] focus:border-[#C8A35F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#B4B1A8] mb-1">Response Time Text (English)</label>
              <input
                type="text"
                value={settings.response_time_text || ''}
                onChange={(e) => setSettings({ ...settings, response_time_text: e.target.value })}
                placeholder="Typical response within 2 hours during business hours"
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] focus:border-[#C8A35F]"
              />
            </div>

            <div>
              <label className="block text-[#B4B1A8] mb-1">Response Time Text (Amharic)</label>
              <input
                type="text"
                value={settings.response_time_text_am || ''}
                onChange={(e) => setSettings({ ...settings, response_time_text_am: e.target.value })}
                placeholder="በስራ ሰዓት በ2 ሰዓት ውስጥ ምላሽ እንሰጣለን"
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] focus:border-[#C8A35F]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Social Network Links */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#C8A35F]">
            3. Social Channels & Telegram
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#B4B1A8] mb-1">Telegram Channel / User URL</label>
              <input
                type="text"
                value={settings.telegram_url || ''}
                onChange={(e) => setSettings({ ...settings, telegram_url: e.target.value })}
                placeholder="https://t.me/AddisLuxuryRealty"
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] font-mono focus:border-[#C8A35F]"
              />
            </div>

            <div>
              <label className="block text-[#B4B1A8] mb-1">LinkedIn Profile / Page URL</label>
              <input
                type="text"
                value={settings.linkedin_url || ''}
                onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/company/addis-luxury-realty"
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] font-mono focus:border-[#C8A35F]"
              />
            </div>

            <div>
              <label className="block text-[#B4B1A8] mb-1">Facebook Page URL</label>
              <input
                type="text"
                value={settings.facebook_url || ''}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                placeholder="https://facebook.com/addisluxuryrealty"
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] font-mono focus:border-[#C8A35F]"
              />
            </div>

            <div>
              <label className="block text-[#B4B1A8] mb-1">Instagram Profile URL</label>
              <input
                type="text"
                value={settings.instagram_url || ''}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://instagram.com/addisluxuryrealty"
                className="w-full px-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-[#F5F3EF] font-mono focus:border-[#C8A35F]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Feature Toggles */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#C8A35F]">
            4. Feature Toggles
          </h3>

          <div className="p-4 rounded-xl bg-[#0C0D10] border border-white/5 flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#F5F3EF] block">
                Enable Property Rentals Listing & Services
              </span>
              <p className="text-[#B4B1A8] text-[11px] mt-0.5">
                When enabled, rental properties appear in filters, search, and the services slider.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(settings.rent_listings_enabled)}
                onChange={(e) =>
                  setSettings({ ...settings, rent_listings_enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C8A35F]"></div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] active:scale-[0.99] transition-all disabled:opacity-50 min-h-[44px] shadow-lg shadow-[#C8A35F]/20"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Company Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
