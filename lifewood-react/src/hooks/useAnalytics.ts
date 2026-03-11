import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Extend Window for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type EventCategory = 'engagement' | 'navigation' | 'conversion' | 'form' | 'media';

interface TrackEventOptions {
  category: EventCategory;
  label?: string;
  value?: number;
}

/**
 * useAnalytics — tracks page views and custom events.
 * Sends to Google Analytics (gtag) if available.
 * Always logs to console in dev mode for debugging.
 */
export function useAnalytics() {
  const location = useLocation();

  // Track page view on route change
  useEffect(() => {
    const path = location.pathname + location.search;

    if (import.meta.env.DEV) {
      console.debug('[Analytics] Page view:', path);
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: document.title,
      });
    }
  }, [location]);

  // Track custom events
  const trackEvent = useCallback((action: string, options?: TrackEventOptions) => {
    const payload = {
      event_category: options?.category ?? 'engagement',
      event_label: options?.label,
      value: options?.value,
    };

    if (import.meta.env.DEV) {
      console.debug('[Analytics] Event:', action, payload);
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', action, payload);
    }
  }, []);

  // Pre-built convenience trackers
  const trackCTA = useCallback((label: string) => {
    trackEvent('cta_click', { category: 'conversion', label });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string) => {
    trackEvent('form_submit', { category: 'form', label: formName });
  }, [trackEvent]);

  const trackVideoPlay = useCallback((videoTitle: string) => {
    trackEvent('video_play', { category: 'media', label: videoTitle });
  }, [trackEvent]);

  const trackNavClick = useCallback((destination: string) => {
    trackEvent('nav_click', { category: 'navigation', label: destination });
  }, [trackEvent]);

  return { trackEvent, trackCTA, trackFormSubmit, trackVideoPlay, trackNavClick };
}
