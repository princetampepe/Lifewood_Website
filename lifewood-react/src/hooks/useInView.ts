import { useEffect, useRef, useState } from 'react';

/**
 * IntersectionObserver hook for scroll-triggered animations.
 * Returns a ref to attach and a boolean `isVisible`.
 * Uses stable threshold to avoid re-creating the observer.
 */
export function useInView(threshold = 0.15) {
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
    }, { threshold });

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible } as const;
}
