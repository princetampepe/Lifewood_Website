import { useState, useEffect, useCallback, type FC } from 'react';

const CONSENT_KEY = 'lifewood-cookie-consent';

/**
 * GDPR-compliant cookie consent banner.
 * Stores user choice in localStorage; blocks analytics until accepted.
 */
const CookieConsent: FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Delay slightly so page renders first
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
    // If previously accepted, enable analytics
    if (consent === 'accepted') {
      enableAnalytics();
    }
  }, []);

  const enableAnalytics = useCallback(() => {
    // Push consent event — analytics script picks this up
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  }, []);

  const accept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
    enableAnalytics();
  }, [enableAnalytics]);

  const decline = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-label="Cookie consent" aria-live="polite">
      <div className="cookie-consent-inner">
        <p>
          We use cookies to improve your experience. By continuing to browse, you agree to our{' '}
          <a href="/cookie-policy">Cookie Policy</a>.
        </p>
        <div className="cookie-consent-actions">
          <button onClick={accept} className="cookie-btn cookie-btn-accept">
            Accept
          </button>
          <button onClick={decline} className="cookie-btn cookie-btn-decline">
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

// Extend Window for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
