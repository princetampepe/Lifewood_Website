/**
 * PageTransition — a smooth route-change overlay.
 * Briefly flashes a tinted overlay when content swaps.
 */
import { useEffect, useState, type FC } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition: FC = () => {
  const location = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const t = setTimeout(() => setActive(false), 350);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div
      className="page-transition-overlay"
      style={{ opacity: active ? 0.12 : 0 }}
      aria-hidden="true"
    />
  );
};

export default PageTransition;
