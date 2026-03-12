import { useState, useEffect, useCallback, useRef, type FC } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  // Touch swipe tracking for swipe-to-close on mobile
  const touchStartX = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Swipe-left to close mobile drawer
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    if (deltaX > 60) { // swiped left > 60px
      setMenuOpen(false);
      setOpenDropdown(null);
    }
    touchStartX.current = null;
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, []);

  const toggleDropdown = useCallback((name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdown(prev => prev === name ? null : name);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isDropdownActive = (paths: string[]) => paths.some(p => location.pathname === p);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <Link to="/" className="logo" aria-label="Go to homepage">
        <img src="/lifewood official logo/use this.png" alt="Lifewood Data Technology" width="42" height="42" fetchPriority="high" />
      </Link>

      <button
        className={`nav-toggle ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls="nav-menu"
      >
        <span /><span /><span />
      </button>

      {menuOpen && <div className="nav-overlay" onClick={closeMenu} aria-hidden="true" />}

      <div
        id="nav-menu"
        ref={menuRef}
        className={`nav-menu ${menuOpen ? 'open' : ''}`}
        role="menubar"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Header inside mobile drawer */}
        <div className="nav-menu-header">
          <img src="/lifewood official logo/use this.png" alt="Lifewood" className="nav-menu-logo" />
          <button className="nav-menu-close" onClick={closeMenu} aria-label="Close menu">
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Mobile menu hint */}
        <p className="nav-swipe-hint">Swipe left to close</p>

        <Link to="/" className={isActive('/') ? 'nav-active' : ''} onClick={closeMenu}>
          <i className="fas fa-home nav-icon" /> Home
        </Link>

        <div className={`dropdown ${openDropdown === 'ai' ? 'dropdown-open' : ''} ${isDropdownActive(['/ai-data-services','/ai-projects']) ? 'dropdown-parent-active' : ''}`}>
          <a href="#" onClick={(e) => toggleDropdown('ai', e)} aria-expanded={openDropdown === 'ai'}>
            <i className="fas fa-robot nav-icon" /> AI Initiatives <i className="fas fa-chevron-down dropdown-arrow" />
          </a>
          <div className="dropdown-content">
            <Link to="/ai-data-services" onClick={closeMenu} className={isActive('/ai-data-services') ? 'nav-active' : ''}>
              <i className="fas fa-database" /> AI Data Services
            </Link>
            <Link to="/ai-projects" onClick={closeMenu} className={isActive('/ai-projects') ? 'nav-active' : ''}>
              <i className="fas fa-project-diagram" /> AI Projects
            </Link>
          </div>
        </div>

        <div className={`dropdown ${openDropdown === 'company' ? 'dropdown-open' : ''} ${isDropdownActive(['/about','/offices']) ? 'dropdown-parent-active' : ''}`}>
          <a href="#" onClick={(e) => toggleDropdown('company', e)} aria-expanded={openDropdown === 'company'}>
            <i className="fas fa-building nav-icon" /> Our Company <i className="fas fa-chevron-down dropdown-arrow" />
          </a>
          <div className="dropdown-content">
            <Link to="/about" onClick={closeMenu} className={isActive('/about') ? 'nav-active' : ''}>
              <i className="fas fa-info-circle" /> About Us
            </Link>
            <Link to="/offices" onClick={closeMenu} className={isActive('/offices') ? 'nav-active' : ''}>
              <i className="fas fa-map-marker-alt" /> Offices
            </Link>
          </div>
        </div>

        <div className={`dropdown ${openDropdown === 'offer' ? 'dropdown-open' : ''} ${isDropdownActive(['/type-a','/type-b','/type-c','/type-d']) ? 'dropdown-parent-active' : ''}`}>
          <a href="#" onClick={(e) => toggleDropdown('offer', e)} aria-expanded={openDropdown === 'offer'}>
            <i className="fas fa-th-large nav-icon" /> What We Offer <i className="fas fa-chevron-down dropdown-arrow" />
          </a>
          <div className="dropdown-content">
            <Link to="/type-a" onClick={closeMenu} className={isActive('/type-a') ? 'nav-active' : ''}>
              <i className="fas fa-layer-group" /> Type A — Data Servicing
            </Link>
            <Link to="/type-b" onClick={closeMenu} className={isActive('/type-b') ? 'nav-active' : ''}>
              <i className="fas fa-brain" /> Type B — Horizontal LLM Data
            </Link>
            <Link to="/type-c" onClick={closeMenu} className={isActive('/type-c') ? 'nav-active' : ''}>
              <i className="fas fa-sitemap" /> Type C — Vertical LLM Data
            </Link>
            <Link to="/type-d" onClick={closeMenu} className={isActive('/type-d') ? 'nav-active' : ''}>
              <i className="fas fa-magic" /> Type D — AIGC
            </Link>
          </div>
        </div>

        <Link to="/philanthropy" className={isActive('/philanthropy') ? 'nav-active' : ''} onClick={closeMenu}>
          <i className="fas fa-heart nav-icon" /> Philanthropy &amp; Impact
        </Link>
        <Link to="/careers" className={isActive('/careers') ? 'nav-active' : ''} onClick={closeMenu}>
          <i className="fas fa-briefcase nav-icon" /> Careers
        </Link>
        <Link to="/internal-news" className={isActive('/internal-news') ? 'nav-active' : ''} onClick={closeMenu}>
          <i className="fas fa-newspaper nav-icon" /> Internal News
        </Link>

        <Link to="/contact" className="contact-btn" onClick={closeMenu}>
          <i className="fas fa-envelope" /> Contact Us
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
