import type { FC } from 'react';
import { Link } from 'react-router-dom';
import AnimReveal from '../components/AnimReveal';
import BlurText from '../components/BlurText';
import Typewriter from '../components/Typewriter';
import { coreCapabilities } from '../data/siteData';
import SEOHead from '../components/SEOHead';
import YouTubeEmbed from '../components/YouTubeEmbed';

const AIDataServicesPage: FC = () => {
  return (
    <section className="ai-services-page">
      <SEOHead title="AI Data Services" description="Explore Lifewood's core AI data capabilities: validation, collection, acquisition, and curation at global scale." canonical="/ai-data-services" />
      {/* ── Hero ── */}
      <div className="ai-services-hero">
        <BlurText
          text="AI Data Services — Powering the Future of AI"
          delay={100}
          animateBy="words"
          direction="top"
          className="ai-services-hero-blur-title"
        />
        <AnimReveal>
          <p className="ai-services-intro">
            <Typewriter text="Lifewood delivers end-to-end AI data solutions — from collection and annotation to validation and curation — at global scale with enterprise-grade quality." />
          </p>
        </AnimReveal>
        <AnimReveal>
          <div className="badge-row">
            <span className="badge"><i className="fas fa-globe" /> 30+ Countries</span>
            <span className="badge"><i className="fas fa-users" /> 56,000+ Specialists</span>
            <span className="badge"><i className="fas fa-language" /> 50+ Languages</span>
            <span className="badge"><i className="fas fa-shield-alt" /> Enterprise-Grade Quality</span>
          </div>
        </AnimReveal>
      </div>

      {/* ── Trust ── */}
      <AnimReveal>
        <div className="trust-section">
          <BlurText
            text="Why the world's leading brands trust Lifewood"
            delay={80}
            animateBy="words"
            direction="top"
            className="trust-blur-title"
          />
        </div>
      </AnimReveal>

      {/* ── Video ── */}
      <YouTubeEmbed videoId="WsYfQmbgc6E" title="Lifewood AI Data Services" heading="See Our Services in Action" />

      {/* ── Core Capabilities ── */}
      <div className="services-detailed-section">
        <AnimReveal>
          <div className="services-section-blur-title">
            <Typewriter text="Our Core Data Capabilities" speed={50} />
          </div>
        </AnimReveal>
        <div className="services-detailed-grid">
          {coreCapabilities.map((cap, i) => (
            <AnimReveal key={i} delay={i * 100}>
              <div className="service-detailed-card service-card">
                <div className="flip-inner">
                  {/* ── Front face ── */}
                  <div className="flip-front">
                    <img className="card-media" src={cap.img} alt={cap.title} loading="lazy" />
                    <div className="card-overlay" />
                    <span className="card-label">{cap.badge}</span>
                    <div className="card-info">
                      <div className="card-info-title">{cap.title}</div>
                    </div>
                  </div>
                  {/* ── Back face ── */}
                  <div className="flip-back">
                    <span className="flip-back-badge">{cap.badge}</span>
                    <div className="flip-back-title">{cap.title}</div>
                    <div className="flip-back-desc">{cap.desc}</div>
                  </div>
                </div>
              </div>
            </AnimReveal>
          ))}
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="ai-services-cta-banner">
        <BlurText
          text="Ready to transform your AI data pipeline?"
          delay={80}
          animateBy="words"
          direction="top"
          className="ai-services-cta-blur-title"
        />
        <p><Typewriter text="Partner with Lifewood and unlock scalable, high-quality data solutions for any domain." /></p>
        <AnimReveal animation="scale">
          <Link to="/contact" className="btn-primary">
            Get in Touch <i className="fas fa-arrow-right" />
          </Link>
        </AnimReveal>
      </div>

    </section>
  );
};

export default AIDataServicesPage;
