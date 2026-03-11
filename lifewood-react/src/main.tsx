import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from '@sentry/react';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/index.css';

/* ── Sentry Error Tracking ── */
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN ?? '',  // set VITE_SENTRY_DSN in .env for production
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,               // only active in production builds
  tracesSampleRate: 0.2,                       // 20% of transactions for performance monitoring
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  beforeSend(event) {
    // Filter out non-critical errors
    if (event.exception?.values?.[0]?.type === 'ChunkLoadError') return null;
    return event;
  },
});

/* Global error listeners — prevent unhandled errors from silently breaking the page */
window.addEventListener('error', (e) => {
  console.error('[global error]', e.error ?? e.message);
  if (window.gtag) {
    window.gtag('event', 'exception', { description: String(e.error ?? e.message), fatal: true });
  }
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[unhandled promise rejection]', e.reason);
  if (window.gtag) {
    window.gtag('event', 'exception', { description: String(e.reason), fatal: false });
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary fallback={
        <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'Manrope, sans-serif' }}>
          <h1>Something went wrong</h1>
          <p>Please refresh the page. If the problem persists, contact support.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
            Reload
          </button>
        </div>
      }>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
);
