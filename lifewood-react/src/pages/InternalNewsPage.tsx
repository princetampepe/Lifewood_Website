import type { FC } from 'react';
import AnimReveal from '../components/AnimReveal';
import BlurText from '../components/BlurText';
import SEOHead from '../components/SEOHead';

const InternalNewsPage: FC = () => {
  return (
    <section className="news-page">
      <SEOHead title="Internal News" description="Stay updated with the latest Lifewood internal news and company updates." canonical="/internal-news" noIndex />
      {/* ── Hero ── */}
      <div className="news-hero">
        <div className="news-hero-inner">
          <AnimReveal>
            <div className="news-hero-dots">
              <span className="dot-filled" />
              <span className="dot-outline" />
              <span className="dot-line" />
            </div>
          </AnimReveal>
          <BlurText
            text="Rootstech 2026"
            delay={120}
            animateBy="words"
            direction="top"
            className="news-hero-blur-title"
          />
          <AnimReveal>
            <p className="coming-soon">Coming Soon!</p>
            <div className="news-hero-actions">
              <a
                href="https://youtu.be/ccyrQ87EJag"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Watch on YouTube <i className="fas fa-play" />
              </a>
            </div>
          </AnimReveal>
        </div>
      </div>

      {/* ── Video ── */}
      <AnimReveal>
        <div className="news-video-section">
          <div className="news-video-wrap">
            <iframe
              src="https://www.youtube.com/embed/ccyrQ87EJag"
              title="Lifewood - Rootstech 2026"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </AnimReveal>
    </section>
  );
};

export default InternalNewsPage;
