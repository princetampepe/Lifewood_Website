import { useEffect, type FC } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to top on every route change */
const ScrollToTop: FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
