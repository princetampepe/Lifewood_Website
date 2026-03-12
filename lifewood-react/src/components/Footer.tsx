import { memo, type FC } from 'react';
import { Link } from 'react-router-dom';
import { socialLinks } from '../data/siteData';

const currentYear = new Date().getFullYear();

const Footer: FC = memo(() => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <button className="back-to-top" onClick={scrollToTop} aria-label="Back to top">
        <i className="fas fa-arrow-up" />
      </button>

      <footer role="contentinfo">
        <div className="footer-content">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/lifewood official logo/use this.png" alt="Lifewood Data Technology" style={{ height: 36 }} />
              </div>
              <p>Empowering businesses with AI-powered data solutions across 30+ countries and 40+ delivery centers worldwide.</p>
              <div className="social-links">
                {socialLinks.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                    <i className={s.icon} /> {s.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="footer-nav">
              <div className="footer-nav-col">
                <h4>Company</h4>
                <Link to="/about">About Us</Link>
                <Link to="/offices">Offices</Link>
                <Link to="/careers">Careers</Link>
                <Link to="/contact">Contact Us</Link>
              </div>
              <div className="footer-nav-col">
                <h4>Solutions</h4>
                <Link to="/ai-data-services">AI Data Services</Link>
                <Link to="/type-a">Data Servicing</Link>
                <Link to="/type-b">Horizontal LLM</Link>
                <Link to="/type-c">Vertical LLM</Link>
                <Link to="/type-d">AIGC</Link>
              </div>
              <div className="footer-nav-col">
                <h4>More</h4>
                <Link to="/philanthropy">Philanthropy</Link>
                <Link to="/ai-projects">AI Projects</Link>
              </div>
            </div>
          </div>

          <div className="footer-divider" />

          <div className="footer-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/cookie-policy">Cookie Policy</Link>
            <Link to="/terms-conditions">Terms and Conditions</Link>
          </div>

          <div className="copyright">
            <div>&copy; {currentYear} Lifewood Data Technology — All Rights Reserved</div>
            <Link to="/admin/login" className="admin-footer-link" aria-label="Admin login">
              <i className="fas fa-lock" />
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
});

Footer.displayName = 'Footer';

export default Footer;
