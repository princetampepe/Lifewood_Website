/**
 * LottieHero — lightweight Lottie micro-animation for hero / CTA areas.
 * Lazily loads lottie-web only when in view.
 * Falls back to a static SVG if lottie-web fails to load.
 */
import { useEffect, useRef, useState, type FC } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInView } from '../hooks/useInView';

export interface LottieHeroProps {
  /** URL to Lottie JSON asset. */
  src: string;
  /** CSS class for outer div. */
  className?: string;
  /** Width. Default '200px'. */
  width?: string;
  /** Height. Default '200px'. */
  height?: string;
  /** Loop animation. Default true. */
  loop?: boolean;
  /** Autoplay when in view. Default true. */
  autoplay?: boolean;
  /** Static SVG fallback when Lottie can't load. */
  fallbackSvg?: React.ReactNode;
}

const LottieHero: FC<LottieHeroProps> = ({
  src,
  className = '',
  width = '200px',
  height = '200px',
  loop = true,
  autoplay = true,
  fallbackSvg,
}) => {
  const reduced = useReducedMotion();
  const { ref: inViewRef, isVisible } = useInView({ threshold: 0.1 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const animRef = useRef<ReturnType<typeof import('lottie-web').default.loadAnimation> | null>(null);

  // Merge refs (inViewRef for visibility, containerRef for Lottie target)
  const setRefs = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    // useInView exposes ref with .current — assign manually
    (inViewRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

  useEffect(() => {
    if (reduced || !isVisible || error) return;
    const container = containerRef.current;
    if (!container) return;

    let mounted = true;

    (async () => {
      try {
        const lottie = (await import('lottie-web')).default;
        if (!mounted) return;

        const anim = lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop,
          autoplay,
          path: src,
        });

        animRef.current = anim;
      } catch {
        if (mounted) setError(true);
      }
    })();

    return () => {
      mounted = false;
      animRef.current?.destroy();
      animRef.current = null;
    };
  }, [isVisible, reduced, src, loop, autoplay, error]);

  if (reduced || error) {
    return (
      <div
        className={`lottie-hero lottie-hero--fallback ${className}`}
        style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-hidden="true"
      >
        {fallbackSvg ?? (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle cx="24" cy="24" r="22" stroke="var(--saffron)" strokeWidth="2" opacity="0.3" />
            <circle cx="24" cy="24" r="8" fill="var(--saffron)" opacity="0.4" />
          </svg>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setRefs}
      className={`lottie-hero ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

export default LottieHero;
