import { useRef, useEffect, useState, type FC, type ImgHTMLAttributes } from 'react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  webpSrc?: string;       // optional explicit WebP version
  lowResSrc?: string;     // optional low-res placeholder
  className?: string;
}

/**
 * LazyImage — Intersection-Observer-based lazy loader with:
 * - WebP with PNG/JPG fallback via <picture>
 * - Animated shimmer skeleton placeholder
 * - Smooth fade-in on load
 */
const LazyImage: FC<LazyImageProps> = ({
  src,
  alt,
  webpSrc,
  lowResSrc,
  className = '',
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Derive WebP src by replacing common extensions
  const derivedWebP = webpSrc ?? src.replace(/\.(png|jpg|jpeg)$/i, '.webp');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver not available, show immediately
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // start loading 200px before entering viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`lazy-image-wrapper ${loaded ? 'lazy-loaded' : 'lazy-loading'} ${className}`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Shimmer skeleton placeholder */}
      {!loaded && (
        <div
          aria-hidden="true"
          className="lazy-shimmer"
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(110deg, rgba(26,58,42,0.06) 30%, rgba(212,160,23,0.08) 50%, rgba(26,58,42,0.06) 70%)',
            backgroundSize: '200% 100%',
            animation: 'shimmerSlide 1.5s ease-in-out infinite',
            borderRadius: 'inherit',
          }}
        />
      )}

      {/* Low-res blur placeholder */}
      {lowResSrc && !loaded && (
        <img
          src={lowResSrc}
          alt=""
          aria-hidden="true"
          className="lazy-placeholder"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(12px)', transform: 'scale(1.05)', transition: 'opacity 0.3s' }}
        />
      )}

      {inView && (
        <picture>
          {/* WebP source — browsers that support it will use this */}
          <source srcSet={derivedWebP} type="image/webp" />
          {/* Fallback to original format */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'scale(1)' : 'scale(1.02)',
              transition: 'opacity 0.5s cubic-bezier(.16,1,.3,1), transform 0.5s cubic-bezier(.16,1,.3,1)',
            }}
            {...rest}
          />
        </picture>
      )}
    </div>
  );
};

export default LazyImage;
