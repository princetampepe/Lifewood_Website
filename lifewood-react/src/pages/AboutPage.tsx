import type { FC } from 'react';
import { Link } from 'react-router-dom';
import AnimReveal from '../components/AnimReveal';
import BlurText from '../components/BlurText';
import Typewriter from '../components/Typewriter';
import ScrollFloat from '../components/ScrollFloat';
import { coreValues } from '../data/siteData';
import SEOHead from '../components/SEOHead';
import YouTubeEmbed from '../components/YouTubeEmbed';

const AboutPage: FC = () => {
  return (
    <section className="about-page">
      <SEOHead title="About Us" description="Learn about Lifewood Data Technology — our mission, values, and global team empowering AI innovation across 30+ countries." canonical="/about" />
      {/* ── Hero ── */}
      <div className="about-hero">
        <div className="about-hero-inner">
          <BlurText
            text="About Our Company"
            delay={120}
            animateBy="words"
            direction="top"
            className="about-hero-blur-title"
          />
          <AnimReveal>
            <p className="about-hero-sub">
              <Typewriter text="While we are motivated by business and economic objectives, we remain committed to our core business beliefs — to create meaningful impact in every community we serve." />
            </p>
          </AnimReveal>
          <AnimReveal>
            <Link to="/contact" className="about-hero-collab">
              Let&apos;s Collaborate <i className="fas fa-arrow-right" />
            </Link>
          </AnimReveal>
        </div>
      </div>

      {/* ── Image Strip ── */}
      <div className="about-collab-strip">
        <div className="about-collab-img">
          <img src="/about-us-pics/collaborating.png" alt="Team collaborating" />
          <div className="strip-overlay">
            <h3>Global Collaboration</h3>
            <p>Working together across borders</p>
          </div>
        </div>
        <div className="about-collab-img">
          <img src="/about-us-pics/office-work.png" alt="Office work" />
          <div className="strip-overlay">
            <h3>Innovation at Work</h3>
            <p>Shaping the future of AI</p>
          </div>
        </div>
      </div>

      {/* ── Core Values ── */}
      <div className="about-values-section">
        <AnimReveal>
          <span className="section-label">What We Stand For</span>
        </AnimReveal>
        <BlurText
          text="Core Values"
          delay={80}
          animateBy="words"
          direction="top"
          className="about-values-blur-title"
        />
        <AnimReveal>
          <p className="about-values-intro">
            <Typewriter text="At Lifewood we empower our company and our clients to realise the transformative power of AI through diversity, caring, innovation, and integrity." />
          </p>
        </AnimReveal>
        <div className="values-grid">
          {coreValues.map((v, i) => (
            <AnimReveal key={i} delay={i * 100}>
              <div className="value-card">
                <div className="value-letter">{v.letter}</div>
                <i className={v.icon} />
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            </AnimReveal>
          ))}
        </div>
      </div>

      {/* ── Core Values Video ── */}
      <YouTubeEmbed videoId="vYiB0caGai0" title="Lifewood Core Values" heading="Our Values in Action" />

      {/* ── What Drives Us ── */}
      <div className="about-drives">
        <BlurText
          text="What drives us today, and what inspires us for tomorrow"
          delay={80}
          animateBy="words"
          direction="top"
          className="about-drives-blur-title"
        />
        <AnimReveal>
          <p className="about-drives-subtitle">
            <Typewriter text="Passion, purpose, and the belief that technology can uplift every community we touch." />
          </p>
        </AnimReveal>
        <div className="about-drives-imgs">
          <div className="about-drives-img">
            <img src="/about-us-pics/collaborating.png" alt="Collaboration" />
            <span className="drives-label">
              <i className="fas fa-handshake" /> Collaboration
            </span>
          </div>
          <div className="about-drives-img">
            <img src="/about-us-pics/office-work.png" alt="Teamwork" />
            <span className="drives-label">
              <i className="fas fa-users" /> Teamwork
            </span>
          </div>
        </div>
      </div>

      {/* ── Mission & Vision ── */}
      <div className="about-mv-section">
        <div className="about-mv-header">
          <span className="section-label">Our Purpose</span>
          <ScrollFloat animationDuration={1} ease="back.inOut(2)" stagger={0.03}>
            Mission & Vision
          </ScrollFloat>
        </div>

        <AnimReveal>
          <div className="mv-block">
            <div className="mv-block-img">
              <img src="/about-us-pics/vision-picture.png" alt="Our Vision" />
            </div>
            <div className="mv-block-content">
              <span className="mv-tag">Where we&apos;re headed</span>
              <h3><i className="fas fa-eye" /> Our Vision</h3>
              <p>
                To be the global champion in AI data solutions, igniting a culture of
                innovation and sustainability that transforms communities worldwide.
              </p>
            </div>
          </div>
        </AnimReveal>

        <AnimReveal>
          <div className="mv-block mv-reverse">
            <div className="mv-block-content">
              <span className="mv-tag">What we do</span>
              <h3><i className="fas fa-rocket" /> Our Mission</h3>
              <p>
                To develop and deploy cutting-edge AI technologies that solve real-world
                problems, create economic opportunity, and empower communities across the globe.
              </p>
            </div>
            <div className="mv-block-img">
              <img src="/about-us-pics/mission-picture.png" alt="Our Mission" />
            </div>
          </div>
        </AnimReveal>
      </div>

      {/* ── CTA ── */}
      <AnimReveal>
        <div className="about-cta-section">
          <BlurText
            text="Ready to learn more about Lifewood?"
            delay={80}
            animateBy="words"
            direction="top"
            className="about-cta-blur-title"
          />
          <p><Typewriter text="Discover our AI data services, explore our global offices, or get in touch with our team." /></p>
          <div className="about-cta-btns">
            <Link to="/ai-data-services" className="btn-primary">Explore Services</Link>
            <Link to="/contact" className="about-hero-collab">Contact Us</Link>
          </div>
        </div>
      </AnimReveal>

    </section>
  );
};

export default AboutPage;
