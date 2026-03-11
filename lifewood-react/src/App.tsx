import { lazy, Suspense, useState, useEffect, type FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';
import ClickSpark from './components/ClickSpark';
import ErrorBoundary from './components/ErrorBoundary';
import SkipToMain from './components/SkipToMain';
import CookieConsent from './components/CookieConsent';
import StructuredData from './components/StructuredData';

import { useAnalytics } from './hooks/useAnalytics';
// Theme: light only (dark mode removed)
// Ensure no stale dark theme from localStorage
if (typeof window !== 'undefined') {
  document.documentElement.setAttribute('data-theme', 'light');
  localStorage.removeItem('lifewood-theme');
}
import { useLenis } from './hooks/useLenis';
import { useLegacyEffects } from './hooks/useLegacyEffects';

/* ── Lazy-load heavy visual effects ── */
const SplashCursor = lazy(() => import('./components/SplashCursor'));

/* ── Detect touch/mobile device ── */
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setIsTouch(mq.matches || navigator.maxTouchPoints > 0);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return isTouch;
}

/* ── Lazy-loaded pages for code-splitting ── */
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AIDataServicesPage = lazy(() => import('./pages/AIDataServicesPage'));
const AIProjectsPage = lazy(() => import('./pages/AIProjectsPage'));
const OfficesPage = lazy(() => import('./pages/OfficesPage'));
const WhatWeOfferPage = lazy(() => import('./pages/WhatWeOfferPage'));
const PhilanthropyPage = lazy(() => import('./pages/PhilanthropyPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const InternalNewsPage = lazy(() => import('./pages/InternalNewsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const TermsConditionsPage = lazy(() => import('./pages/TermsConditionsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/* ── Loading fallback ── */
const PageLoader: FC = () => (
  <div className="page-loader">
    <div className="page-loader-spinner" />
    <p>Loading...</p>
  </div>
);

/* ── Analytics inner component — must be inside BrowserRouter ── */
const AnalyticsTracker: FC = () => {
  useAnalytics();
  return null;
};

const App: FC = () => {
  const isTouchDevice = useIsTouchDevice();

  /* ── Smooth scroll (Lenis) ── */
  useLenis({ lerp: 0.1, duration: 1.2 });

  /* ── Legacy effects engine (hero glow, ripple, trails, etc.) ── */
  useLegacyEffects();

  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <SkipToMain />
      <StructuredData />
      <ScrollToTop />
      <ScrollProgress />
      <PageTransition />

      {/* ── Global fluid cursor effect (desktop only) ── */}
      {!isTouchDevice && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            <SplashCursor
              DENSITY_DISSIPATION={3.5}
              VELOCITY_DISSIPATION={2}
              SPLAT_RADIUS={0.2}
              CURL={3}
              SPLAT_FORCE={6000}
              TRANSPARENT={true}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* ── Toast notifications ── */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--dark-serpent)',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 18px',
            fontSize: '0.9rem',
            fontFamily: 'Manrope, sans-serif',
            boxShadow: '0 8px 32px rgba(26,58,42,0.25)',
          },
          success: {
            iconTheme: { primary: '#D4A017', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#e74c3c', secondary: '#fff' },
          },
        }}
      />

      {/* ── Global click spark overlay ── */}
      <ClickSpark sparkColor="var(--saffron)" sparkCount={10} sparkRadius={20} duration={500}>
        <Navbar />

      <main id="main-content" role="main">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/ai-data-services" element={<AIDataServicesPage />} />
            <Route path="/ai-projects" element={<AIProjectsPage />} />
            <Route path="/offices" element={<OfficesPage />} />
            <Route path="/type-a" element={<WhatWeOfferPage typeId="type-a" />} />
            <Route path="/type-b" element={<WhatWeOfferPage typeId="type-b" />} />
            <Route path="/type-c" element={<WhatWeOfferPage typeId="type-c" />} />
            <Route path="/type-d" element={<WhatWeOfferPage typeId="type-d" />} />
            <Route path="/philanthropy" element={<PhilanthropyPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/internal-news" element={<InternalNewsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/terms-conditions" element={<TermsConditionsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <CookieConsent />
      </ClickSpark>
    </BrowserRouter>
  );
};

export default App;
