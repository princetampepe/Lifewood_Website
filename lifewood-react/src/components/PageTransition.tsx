/**
 * PageTransition — smooth route-change overlay with wipe animation.
 * Uses a two-phase approach: wipe in → content loads → wipe out.
 */
import { useEffect, useRef, useState, type FC } from 'react';
import { useLocation } from 'react-router-dom';

type Phase = 'idle' | 'enter' | 'exit';

const PageTransition: FC = () => {
  const location = useLocation();
  const [phase, setPhase] = useState<Phase>('idle');
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;

    setPhase('enter');
    const enterTimer = setTimeout(() => {
      setPhase('exit');
      const exitTimer = setTimeout(() => setPhase('idle'), 500);
      return () => clearTimeout(exitTimer);
    }, 300);

    return () => clearTimeout(enterTimer);
  }, [location.pathname]);

  if (phase === 'idle') return null;

  return (
    <div
      className={`page-transition-overlay pt-${phase}`}
      aria-hidden="true"
    />
  );
};

export default PageTransition;
