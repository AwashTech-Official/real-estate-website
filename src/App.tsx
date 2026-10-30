/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import StackingAbout from './components/StackingAbout';
import { CinematicVideoSection } from './components/CinematicVideoSection';
import ServicesSlider from './components/ServicesSlider';
import { ValuationVideoSection } from './components/ValuationVideoSection';
import { FeaturedProperties } from './components/FeaturedProperties';
import { ValuationAndListingSection } from './components/ValuationAndListingSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AllPropertiesView } from './components/AllPropertiesView';
import { PropertyDetailView } from './components/PropertyDetailView';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { FloatingVoiceAgent } from './components/FloatingVoiceAgent';
import { getCompanySettings } from './lib/supabase';
import type { CompanySettings, Property } from './types/database';

// Code-split admin bundle: never loaded on public pages
const AdminApp = lazy(() => import('./admin/AdminApp'));

type AppView = 'home' | 'all-properties' | 'property-detail' | 'admin';

function AppContent() {
  const { t } = useLanguage();
  const [companySettings, setCompanySettings] = useState<Partial<CompanySettings> | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedPropertySlug, setSelectedPropertySlug] = useState<string | null>(null);

  // Synchronize routing state with URL hash & pathname
  const parseHash = useCallback(() => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    // Check for /admin or #/admin
    if (
      pathname === '/admin' ||
      pathname.startsWith('/admin') ||
      hash === '#/admin' ||
      hash.startsWith('#/admin')
    ) {
      setCurrentView('admin');
      setSelectedPropertySlug(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (hash.startsWith('#/property/')) {
      const slug = hash.replace('#/property/', '').split('?')[0];
      setSelectedPropertySlug(slug);
      setCurrentView('property-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (hash === '#/properties' || hash.startsWith('#/properties?')) {
      setCurrentView('all-properties');
      setSelectedPropertySlug(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('home');
      setSelectedPropertySlug(null);
      // Anchor links within home (e.g. #contact, #properties, #services, #about, #valuation-section)
      if (hash && !hash.startsWith('#/')) {
        const targetId = hash.replace('#', '').split('?')[0];
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 120);
      }
    }
  }, []);

  useEffect(() => {
    parseHash();
    window.addEventListener('hashchange', parseHash);
    window.addEventListener('popstate', parseHash);
    return () => {
      window.removeEventListener('hashchange', parseHash);
      window.removeEventListener('popstate', parseHash);
    };
  }, [parseHash]);

  // Load public company settings from Supabase
  useEffect(() => {
    async function loadSettings() {
      const res = await getCompanySettings();
      if (res.data) {
        setCompanySettings(res.data);
      }
    }
    loadSettings();
  }, []);

  // Navigation handlers
  const handleSelectProperty = (property: Property) => {
    setSelectedPropertySlug(property.slug);
    setCurrentView('property-detail');
    window.location.hash = `#/property/${property.slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllProperties = () => {
    setCurrentView('all-properties');
    setSelectedPropertySlug(null);
    window.location.hash = '#/properties';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedPropertySlug(null);
    window.location.hash = '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setCurrentView('all-properties');
    setSelectedPropertySlug(null);
    window.location.hash = '#/properties';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeaderNavigate = (view: 'home' | 'all-properties', targetId?: string) => {
    if (view === 'all-properties') {
      handleViewAllProperties();
    } else {
      setCurrentView('home');
      setSelectedPropertySlug(null);
      if (targetId) {
        window.location.hash = `#${targetId}`;
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 50);
      } else {
        window.location.hash = '#/';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleNavigateToValuation = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setSelectedPropertySlug(null);
    }
    window.location.hash = '#valuation-section';
    setTimeout(() => {
      const el = document.getElementById('valuation-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80);
  };

  // If in /admin route, render the code-split AdminApp
  if (currentView === 'admin') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#0C0D10] text-[#F5F3EF] flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#C8A35F] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#B4B1A8] font-mono">Loading Administration Portal...</p>
            </div>
          </div>
        }
      >
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen-dvh w-full max-w-full overflow-x-hidden flex flex-col bg-[#0C0D10] text-[#F5F3EF]">
      {/* 1. Sticky Top Navigation */}
      <Header
        companySettings={companySettings}
        currentView={currentView}
        onNavigate={handleHeaderNavigate}
      />

      <main className="flex-1 w-full max-w-full overflow-x-hidden flex flex-col items-center">
        {currentView === 'home' && (
          <>
            {/* 2. Full-Screen Background Video Hero Section */}
            <HeroSection companySettings={companySettings} />

            {/* 3. About Section (GSAP Stacking Cards) directly below Hero */}
            <StackingAbout />

            {/* 4. Second Video Section directly after About Section */}
            <CinematicVideoSection />

            {/* 5. Services Section (Autoplay Carousel) directly after Video 2 */}
            <ServicesSlider companySettings={companySettings} />

            {/* 6. Third Video Section (Valuation CTA) directly after Services */}
            <ValuationVideoSection onValuationClick={handleNavigateToValuation} />

            {/* 7. Featured Properties Grid */}
            <FeaturedProperties
              onSelectProperty={handleSelectProperty}
              onViewAllProperties={handleViewAllProperties}
            />

            {/* 8. Valuation and List Your Property Form Section */}
            <ValuationAndListingSection id="valuation-section" />

            {/* 9. Contact Section with Direct Buttons and Public Inquiry Form */}
            <ContactSection companySettings={companySettings} />
          </>
        )}

        {currentView === 'all-properties' && (
          <AllPropertiesView
            companySettings={companySettings}
            onBackToHome={handleBackToHome}
            onSelectProperty={handleSelectProperty}
          />
        )}

        {currentView === 'property-detail' && (
          <PropertyDetailView
            slug={selectedPropertySlug || ''}
            onBack={handleBackFromDetail}
          />
        )}
      </main>

      {/* 10. Complete Footer with Links and Social Icons */}
      <Footer
        companySettings={companySettings}
        onNavigateProperties={handleViewAllProperties}
        onNavigateValuation={handleNavigateToValuation}
      />

      {/* 11. Floating WhatsApp Button (Smart Form Occlusion Prevention, Bottom-Right) */}
      <FloatingWhatsApp companySettings={companySettings} />

      {/* 12. Floating Amharic Voice Agent (Bottom-Left, Lazy Iframe, Microphon-Enabled) */}
      <FloatingVoiceAgent />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
