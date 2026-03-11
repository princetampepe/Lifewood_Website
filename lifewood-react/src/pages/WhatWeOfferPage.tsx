import type { FC } from 'react';
import { Link } from 'react-router-dom';
import AnimReveal from '../components/AnimReveal';
import StepCarousel from '../components/StepCarousel';
import BlurText from '../components/BlurText';
import Typewriter from '../components/Typewriter';
import { wwoPages, carouselData } from '../data/siteData';
import SEOHead from '../components/SEOHead';
import YouTubeEmbed from '../components/YouTubeEmbed';

interface WhatWeOfferPageProps {
  typeId: string;
}

const WhatWeOfferPage: FC<WhatWeOfferPageProps> = ({ typeId }) => {
  const page = wwoPages.find((p) => p.id === typeId);

  if (!page) {
    return (
      <section className="wwo-page" style={{ textAlign: 'center', padding: '8rem 2rem' }}>
        <h1>Page not found</h1>
        <Link to="/" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
          Go Home
        </Link>
      </section>
    );
  }

  const carousel = carouselData[page.carouselId];

  return (
    <section className="wwo-page">
      <SEOHead title={`${page.title} — ${page.subtitle}`} description={page.description} canonical={`/${page.id}`} />
      {/* ── Hero ── */}
      <div className="wwo-hero">
        <BlurText
          text={`${page.title} — ${page.subtitle}`}
          delay={80}
          animateBy="words"
          direction="top"
          className="wwo-hero-blur-title"
        />
        <AnimReveal>
          <p className="wwo-subtitle">{page.description}</p>
        </AnimReveal>
        <AnimReveal>
          <div className="badge-row">
            {page.badges.map((b, i) => (
              <span className="badge" key={i}>
                <i className={b.icon} /> {b.label}
              </span>
            ))}
          </div>
        </AnimReveal>
      </div>

      {/* ── Trust ── */}
      <AnimReveal>
        <div className="trust-section">
          <Typewriter text={page.trustText} speed={32} />
        </div>
      </AnimReveal>

      {/* ── Type C Video ── */}
      {typeId === 'type-c' && (
        <YouTubeEmbed videoId="3o4U8mjFujc" title="Lifewood Auto Drive" heading="Auto Drive in Action" />
      )}

      {/* ── Carousel ── */}
      <div className="wwo-carousel-section">
        <AnimReveal>
          <BlurText
            text={page.sectionTitle}
            delay={60}
            animateBy="words"
            direction="top"
            className="wwo-section-blur-title"
          />
        </AnimReveal>
        {carousel && <StepCarousel steps={carousel.steps} hoverToSwitch />}
      </div>

      {/* ── Highlights ── */}
      <div className="wwo-highlights">
        <AnimReveal>
          <BlurText
            text={page.highlightsTitle}
            delay={60}
            animateBy="words"
            direction="top"
            className="wwo-section-blur-title"
          />
        </AnimReveal>
        <div className="wwo-highlight-row">
          {page.highlights.map((h, i) => (
            <AnimReveal key={i} delay={i * 100}>
              <div className="wwo-highlight-item">
                <i className={h.icon} />
                <h4>{h.title}</h4>
                <p>{h.desc}</p>
              </div>
            </AnimReveal>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="wwo-cta">
        <AnimReveal>
          <BlurText
            text={page.ctaQuestion}
            delay={70}
            animateBy="words"
            direction="top"
            className="wwo-cta-blur-title"
          />
          <p>
            <Typewriter text={page.ctaSubtext} speed={30} />
          </p>
          <Link to="/contact" className="btn-primary">
            Contact Us <i className="fas fa-arrow-right" />
          </Link>
        </AnimReveal>
      </div>
    </section>
  );
};

export default WhatWeOfferPage;
