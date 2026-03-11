import { useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from './useReducedMotion';

export interface LenisOptions {
  /** Lerp intensity. Default 0.1. */
  lerp?: number;
  /** Duration multiplier. Default 1.2. */
  duration?: number;
  /** Orientation. Default 'vertical'. */
  orientation?: 'vertical' | 'horizontal';
  /** Smooth wheel. Default true. */
  smoothWheel?: boolean;
}

/**
 * Typed Lenis smooth-scroll hook.
 * Initialises Lenis on mount, tears down on unmount.
 * Honors `prefers-reduced-motion` (skips init when reduced).
 * Returns `scrollTo`, a reactive `scrollY`, and the Lenis instance ref.
 */
export function useLenis(options: LenisOptions = {}) {
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const rafId = useRef<number>(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      lerp: options.lerp ?? 0.1,
      duration: options.duration ?? 1.2,
      orientation: options.orientation ?? 'vertical',
      smoothWheel: options.smoothWheel ?? true,
    });

    lenisRef.current = lenis;

    lenis.on('scroll', (e: { scroll: number }) => {
      setScrollY(e.scroll);
    });

    function raf(time: number) {
      lenis.raf(time);
      rafId.current = requestAnimationFrame(raf);
    }
    rafId.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId.current);
      lenis.destroy();
      lenisRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, opts?: { offset?: number; duration?: number }) => {
      lenisRef.current?.scrollTo(target, opts);
    },
    [],
  );

  return { scrollY, scrollTo, lenis: lenisRef } as const;
}
