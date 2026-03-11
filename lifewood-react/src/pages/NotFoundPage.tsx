import type { FC } from 'react';
import SEOHead from '../components/SEOHead';

/* ── 404 catch-all page ── */
const NotFoundPage: FC = () => (
  <section style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
    <SEOHead title="Page Not Found" description="The page you're looking for doesn't exist." noIndex />
    <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, color: 'var(--saffron)', marginBottom: '1rem' }}>404</h1>
    <p style={{ fontSize: '1.2rem', color: 'var(--castletone)', marginBottom: '2rem' }}>The page you&apos;re looking for doesn&apos;t exist.</p>
    <a href="/" className="btn-primary">Back to Home <i className="fas fa-arrow-right" /></a>
  </section>
);

export default NotFoundPage;
