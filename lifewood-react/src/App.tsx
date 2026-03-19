import { lazy, Suspense, useState, useEffect, useMemo, type FC } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';

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
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

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

/** Pages where heavy visual effects should be skipped for performance. */
const LIGHT_PATHS = ['/admin', '/admin/login', '/privacy-policy', '/cookie-policy', '/terms-conditions'];

function useIsLightPage() {
  const { pathname } = useLocation();
  return useMemo(() => LIGHT_PATHS.includes(pathname), [pathname]);
}

const AppInner: FC = () => {
  const isTouchDevice = useIsTouchDevice();
  const isLightPage = useIsLightPage();
  const { pathname } = useLocation();
  const isAdminSection = pathname.startsWith('/admin');

  /* ── Smooth scroll (Lenis) — skip on light pages ── */
  useLenis(isLightPage ? null : { lerp: 0.1, duration: 1.2 });

  /* ── Legacy effects engine — skip on admin/legal pages ── */
  useLegacyEffects(isLightPage);

  return (
    <>
      <AnalyticsTracker />
      <SkipToMain />
      <StructuredData />
      <ScrollToTop />
      <ScrollProgress />
      <PageTransition />

      {/* ── Global fluid cursor effect (desktop only, skip on light pages) ── */}
      {!isTouchDevice && !isLightPage && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            <SplashCursor
              SIM_RESOLUTION={128}
              DYE_RESOLUTION={1024}
              DENSITY_DISSIPATION={3.5}
              VELOCITY_DISSIPATION={2}
              PRESSURE_ITERATIONS={16}
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
        {!isAdminSection && <Navbar />}

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
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminSection && <Footer />}
      {!isAdminSection && <CookieConsent />}
      </ClickSpark>
    </>
  );
};

const App: FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
