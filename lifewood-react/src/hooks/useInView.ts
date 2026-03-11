import { useEffect, useRef, useState } from 'react';

/**
 * IntersectionObserver hook for scroll-triggered animations.
 * Returns a ref to attach and a boolean `isVisible`.
 */
export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(el);
      }
    }, { threshold: 0.15, ...options });

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible } as const;
}
