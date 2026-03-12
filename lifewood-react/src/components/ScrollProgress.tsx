import { useEffect, useRef, type FC } from 'react';

/**
 * Scroll progress bar — uses ref-based DOM mutation to avoid
 * re-rendering the React tree on every scroll frame.
 */
const ScrollProgress: FC = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (barRef.current) {
          barRef.current.style.width = `${pct}%`;
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div ref={barRef} className="scroll-progress" style={{ width: 0 }} />;
};

export default ScrollProgress;
