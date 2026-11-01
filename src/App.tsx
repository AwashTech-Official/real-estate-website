/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
// Top critical components loaded eagerly
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import StackingAbout from './components/StackingAbout';
import { CinematicVideoSection } from './components/CinematicVideoSection';
import ServicesSlider from './components/ServicesSlider';
import { ValuationVideoSection } from './components/ValuationVideoSection';

// Below-the-fold components lazy-loaded for immediate top-page performance
const FeaturedProperties = lazy(() =>
  import('./components/FeaturedProperties').then((m) => ({ default: m.FeaturedProperties }))
);
const ValuationAndListingSection = lazy(() =>
  import('./components/ValuationAndListingSection').then((m) => ({ default: m.ValuationAndListingSection }))
);
const ContactSection = lazy(() =>
  import('./components/ContactSection').then((m) => ({ default: m.ContactSection }))
);
const Footer = lazy(() =>
  import('./components/Footer').then((m) => ({ default: m.Footer }))
);
const AllPropertiesView = lazy(() =>
  import('./components/AllPropertiesView').then((m) => ({ default: m.AllPropertiesView }))
);
const PropertyDetailView = lazy(() =>
  import('./components/PropertyDetailView').then((m) => ({ default: m.PropertyDetailView }))
);
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getCompanySettings } from './lib/supabase';
import type { CompanySettings, Property } from './types/database';

// Code-split admin bundle: never loaded on public pages
const AdminApp = lazy(() => import('./admin/AdminApp'));

// Code-split voice agent to keep critical bundle small on slow 3G phones
const FloatingVoiceAgent = lazy(() =>
  import('./components/FloatingVoiceAgent').then((module) => ({
    default: module.FloatingVoiceAgent,
  }))
);

type AppView = 'home' | 'all-properties' | 'property-detail' | 'admin';

function AppContent() {
  const { t } = useLanguage();
  const [companySettings, setCompanySettings] = useState<Partial<CompanySettings> | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedPropertySlug, setSelectedPropertySlug] = useState<string | null>(null);

  // Synchronize routing state with URL hash & pathname
  const parseHash = useCallback(() => {
    try {
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
    } catch (err) {
      console.warn('[Routing Parse Error]:', err);
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

  // Load public company settings from Supabase (safe fallback if unavailable)
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await getCompanySettings();
        if (res.data) {
          setCompanySettings(res.data);
        }
      } catch (err) {
        console.warn('[CompanySettings Load Error]:', err);
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
          <div className="min-h-screen min-h-[100vh] bg-[#0C0D10] text-[#F5F3EF] flex items-center justify-center">
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
    <div className="min-h-screen min-h-screen-dvh w-full max-w-full flex flex-col bg-[#0C0D10] text-[#F5F3EF]">
      {/* 1. Sticky Top Navigation */}
      <ErrorBoundary sectionName="Header Navigation">
        <Header
          companySettings={companySettings}
          currentView={currentView}
          onNavigate={handleHeaderNavigate}
        />
      </ErrorBoundary>

      <main className="flex-1 w-full max-w-full flex flex-col items-center">
        {currentView === 'home' && (
          <>
            {/* 2. Full-Screen Background Video Hero Section */}
            <ErrorBoundary sectionName="Hero Section">
              <HeroSection companySettings={companySettings} />
            </ErrorBoundary>

            {/* 3. About Section (GSAP Stacking Cards) directly below Hero */}
            <ErrorBoundary sectionName="About Agency Presentation">
              <StackingAbout />
            </ErrorBoundary>

            {/* 4. Second Video Section directly after About Section */}
            <ErrorBoundary sectionName="Cinematic Video Showcase">
              <CinematicVideoSection />
            </ErrorBoundary>

            {/* 5. Services Section (Autoplay Carousel) directly after Video 2 */}
            <ErrorBoundary sectionName="Real Estate Services">
              <ServicesSlider companySettings={companySettings} />
            </ErrorBoundary>

            {/* 6. Third Video Section (Valuation CTA) directly after Services */}
            <ErrorBoundary sectionName="Property Valuation Showcase">
              <ValuationVideoSection onValuationClick={handleNavigateToValuation} />
            </ErrorBoundary>

            {/* Below-the-fold sections wrapped in Suspense with fixed placeholder heights */}
            <Suspense fallback={<div className="w-full min-h-[400px] bg-[#0C0D10]" />}>
              {/* 7. Featured Properties Grid */}
              <ErrorBoundary sectionName="Featured Properties">
                <FeaturedProperties
                  onSelectProperty={handleSelectProperty}
                  onViewAllProperties={handleViewAllProperties}
                />
              </ErrorBoundary>

              {/* 8. Valuation and List Your Property Form Section */}
              <ErrorBoundary sectionName="Valuation & Listing Requests">
                <ValuationAndListingSection id="valuation-section" />
              </ErrorBoundary>

              {/* 9. Contact Section with Direct Buttons and Public Inquiry Form */}
              <ErrorBoundary sectionName="Contact & Inquiry Office">
                <ContactSection companySettings={companySettings} />
              </ErrorBoundary>
            </Suspense>
          </>
        )}

        {currentView === 'all-properties' && (
          <Suspense fallback={<div className="w-full min-h-[500px] bg-[#0C0D10]" />}>
            <ErrorBoundary sectionName="Properties Catalog">
              <AllPropertiesView
                companySettings={companySettings}
                onBackToHome={handleBackToHome}
                onSelectProperty={handleSelectProperty}
              />
            </ErrorBoundary>
          </Suspense>
        )}

        {currentView === 'property-detail' && (
          <Suspense fallback={<div className="w-full min-h-[500px] bg-[#0C0D10]" />}>
            <ErrorBoundary sectionName="Property Details">
              <PropertyDetailView
                slug={selectedPropertySlug || ''}
                onBack={handleBackFromDetail}
              />
            </ErrorBoundary>
          </Suspense>
        )}
      </main>

      {/* 10. Complete Footer with Links and Social Icons */}
      <Suspense fallback={<div className="w-full min-h-[200px] bg-[#0C0D10]" />}>
        <ErrorBoundary sectionName="Footer">
          <Footer
            companySettings={companySettings}
            onNavigateProperties={handleViewAllProperties}
            onNavigateValuation={handleNavigateToValuation}
          />
        </ErrorBoundary>
      </Suspense>

      {/* 11. Floating WhatsApp Button (Smart Form Occlusion Prevention, Bottom-Right) */}
      <ErrorBoundary sectionName="WhatsApp Chat">
        <FloatingWhatsApp companySettings={companySettings} />
      </ErrorBoundary>

      {/* 12. Floating Amharic Voice Agent (Code-split, Bottom-Left, Lazy Iframe) */}
      <ErrorBoundary sectionName="Amharic Voice Assistant">
        <Suspense fallback={null}>
          <FloatingVoiceAgent />
        </Suspense>
      </ErrorBoundary>
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
