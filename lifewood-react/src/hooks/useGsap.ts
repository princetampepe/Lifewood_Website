import { useEffect, useRef, useCallback, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

/* ── Easing / timing tokens (centralised). ── */
export const gsapTokens = {
  ease: 'power3.out',
  duration: 0.8,
  stagger: 0.12,
  yOffset: 40,
  scaleFrom: 0.96,
} as const;

/* Types for GSAP + ScrollTrigger loaded lazily */
type GSAPModule = typeof import('gsap');
type STModule = { ScrollTrigger: typeof import('gsap/ScrollTrigger').default };

let _gsap: GSAPModule | null = null;
let _ST: STModule | null = null;
let _loadPromise: Promise<void> | null = null;

/**
 * Lazily loads gsap and ScrollTrigger once and caches them.
 * Connects ScrollTrigger to a Lenis instance when supplied.
 */
async function loadGsap(lenisRef?: RefObject<import('lenis').default | null>) {
  if (!_loadPromise) {
    _loadPromise = (async () => {
      const [gsapMod, stMod] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger') as unknown as Promise<STModule>,
      ]);
      _gsap = gsapMod;
      _ST = stMod;
      gsapMod.default.registerPlugin(stMod.ScrollTrigger);

      /* Connect Lenis RAF → ScrollTrigger update if Lenis available */
      if (lenisRef?.current) {
        lenisRef.current.on('scroll', () => {
          stMod.ScrollTrigger.update();
        });
      }
    })();
  }
  return _loadPromise;
}

export interface RevealOptions {
  y?: number;
  scale?: number;
  opacity?: number;
  duration?: number;
  ease?: string;
  delay?: number;
  start?: string;
  once?: boolean;
}

/**
 * GSAP + ScrollTrigger powered reveal hook.
 * Lazily loads GSAP modules on first use.
 */
export function useGsapReveal(
  lenisRef?: RefObject<import('lenis').default | null>,
) {
  const reduced = useReducedMotion();
  const triggersRef = useRef<Array<{ kill(): void }>>([]);

  /* Ensure GSAP is loaded. */
  useEffect(() => {
    if (reduced) return;
    loadGsap(lenisRef);
  }, [reduced, lenisRef]);

  /** Reveal a single element when it scrolls into view. */
  const reveal = useCallback(
    async (el: HTMLElement | null, opts: RevealOptions = {}) => {
      if (!el || reduced) return;
      await loadGsap(lenisRef);
      if (!_gsap || !_ST) return;

      const gsap = _gsap.default;
      const { ScrollTrigger } = _ST;

      gsap.set(el, {
        y: opts.y ?? gsapTokens.yOffset,
        opacity: opts.opacity ?? 0,
        scale: opts.scale ?? gsapTokens.scaleFrom,
      });

      const tl = gsap.to(el, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: opts.duration ?? gsapTokens.duration,
        ease: opts.ease ?? gsapTokens.ease,
        delay: opts.delay ?? 0,
        scrollTrigger: {
          trigger: el,
          start: opts.start ?? 'top 85%',
          once: opts.once ?? true,
        },
      });

      triggersRef.current.push(tl.scrollTrigger as unknown as { kill(): void });
    },
    [reduced, lenisRef],
  );

  /** Batch-reveal children of a container with stagger. */
  const batchReveal = useCallback(
    async (
      container: HTMLElement | null,
      childSelector: string,
      opts: RevealOptions & { stagger?: number } = {},
    ) => {
      if (!container || reduced) return;
      await loadGsap(lenisRef);
      if (!_gsap || !_ST) return;

      const gsap = _gsap.default;
      const { ScrollTrigger } = _ST;
      const children = container.querySelectorAll<HTMLElement>(childSelector);
      if (!children.length) return;

      gsap.set(children, {
        y: opts.y ?? gsapTokens.yOffset,
        opacity: 0,
        scale: opts.scale ?? gsapTokens.scaleFrom,
      });

      const tl = gsap.to(children, {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: opts.stagger ?? gsapTokens.stagger,
        duration: opts.duration ?? gsapTokens.duration,
        ease: opts.ease ?? gsapTokens.ease,
        scrollTrigger: {
          trigger: container,
          start: opts.start ?? 'top 85%',
          once: opts.once ?? true,
        },
      });

      triggersRef.current.push(tl.scrollTrigger as unknown as { kill(): void });
    },
    [reduced, lenisRef],
  );

  /* Clean up all scroll triggers on unmount. */
  useEffect(() => {
    return () => {
      triggersRef.current.forEach((t) => t?.kill());
      triggersRef.current = [];
    };
  }, []);

  return { reveal, batchReveal } as const;
}
