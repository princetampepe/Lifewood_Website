import type { FC } from 'react';
import { Link } from 'react-router-dom';
import AnimReveal from '../components/AnimReveal';
import BlurText from '../components/BlurText';
import Typewriter from '../components/Typewriter';
import ScrollFloat from '../components/ScrollFloat';
import { philRows } from '../data/siteData';
import SEOHead from '../components/SEOHead';
import YouTubeEmbed from '../components/YouTubeEmbed';

const PhilanthropyPage: FC = () => {
  return (
    <section className="philanthropy-page">
      <SEOHead title="Philanthropy & Impact" description="Lifewood's philanthropic initiatives — creating employment, skills development, and empowering communities in Africa and beyond." canonical="/philanthropy" />
      {/* ── Hero ── */}
      <div className="phil-hero">
        <div className="phil-hero-inner">
          <BlurText
            text="Philanthropy & Impact"
            delay={80}
            animateBy="words"
            direction="top"
            className="phil-hero-blur-title"
          />
          <AnimReveal>
            <p>
              <Typewriter
                text="We direct resources into education and developmental projects that create lasting change in communities around the globe."
                speed={22}
              />
            </p>
          </AnimReveal>
          <AnimReveal>
            <Link to="/contact" className="btn-primary">Contact Us</Link>
          </AnimReveal>
        </div>
      </div>

      {/* ── Vision ── */}
      <AnimReveal>
        <div className="phil-vision">
          <p>
            <Typewriter
              text="Our vision is of a world where financial investment plays a central role in solving the social and environmental challenges that affect us all."
              speed={18}
            />
          </p>
          <Link to="/about" className="btn-outline">Know Us Better</Link>
        </div>
      </AnimReveal>

      {/* ── Know Us Better ── */}
      <div className="phil-know">
        <ScrollFloat animationDuration={1} ease="back.inOut(2)" stagger={0.04} containerClassName="phil-know-scroll">
          Know Us Better
        </ScrollFloat>
        <AnimReveal>
          <h3>Transforming Communities <span className="accent">Worldwide</span></h3>
        </AnimReveal>
      </div>

      {/* ── Marquee ── */}
      <div className="phil-marquee">
        <div className="phil-marquee-inner">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="phil-marquee-text">.be.amazed</span>
          ))}
        </div>
      </div>

      {/* ── Impact Intro ── */}
      <AnimReveal>
        <div className="phil-impact-intro">
          <BlurText
            text="Impact"
            delay={80}
            animateBy="words"
            direction="top"
            className="phil-impact-blur-title"
          />
          <p>
            <Typewriter
              text="Through purposeful partnerships and sustainable investment, we empower communities to build lasting economic resilience."
              speed={20}
            />
          </p>
        </div>
      </AnimReveal>

      {/* ── Video ── */}
      <YouTubeEmbed videoId="7df1z_3dQDE" title="Lifewood Philanthropy & Impact" />

      {/* ── Content Rows ── */}
      {philRows.map((row, i) => (
        <AnimReveal key={i}>
          <div className={`phil-row layout-${row.layout}`}>
            <div className="phil-row-content">
              <BlurText
                text={row.heading}
                delay={60}
                animateBy="words"
                direction="top"
                className="phil-row-blur-heading"
              />
              <p className="phil-row-text">{row.text}</p>
            </div>
            <div className="phil-row-img-wrap">
              <img src={row.img} alt={row.heading} loading="lazy" />
              <div className="phil-row-img-overlay">
                <span className="phil-row-img-label">
                  <i className={row.icon} /> {row.heading}
                </span>
              </div>
            </div>
          </div>
        </AnimReveal>
      ))}

      {/* ── CTA ── */}
      <div className="phil-cta-banner">
        <BlurText
          text="Working with new intelligence for a better world."
          delay={70}
          animateBy="words"
          direction="top"
          className="phil-cta-blur-text"
        />
        <AnimReveal>
          <Link to="/contact" className="btn-primary">Contact Us</Link>
        </AnimReveal>
      </div>

    </section>
  );
};

export default PhilanthropyPage;
