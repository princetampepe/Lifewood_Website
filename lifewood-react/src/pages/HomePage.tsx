import { useRef, useEffect, useState, useCallback, lazy, Suspense, type FC } from 'react';
import CountUpStat from '../components/CountUpStat';
import { Link } from 'react-router-dom';
import AnimReveal from '../components/AnimReveal';
import MarqueeStrip from '../components/MarqueeStrip';
import BlurText from '../components/BlurText';
import ShinyText from '../components/ShinyText';
import GradientText from '../components/GradientText';
import ScrollFloat from '../components/ScrollFloat';
import ErrorBoundary from '../components/ErrorBoundary';
import SEOHead from '../components/SEOHead';
import { useGsapReveal } from '../hooks/useGsap';
import {
  stats,
  partners,
  serviceCards,
  marqueeForward,
  marqueeReverse,
} from '../data/siteData';

/* Lazy-load heavy visual components */
const Aurora = lazy(() => import('../components/Aurora'));
const Ribbons = lazy(() => import('../components/Ribbons'));

/* ── Check if touch device ── */
const isTouchDevice = () =>
  typeof window !== 'undefined' && (window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);

/* ── Proximity-reactive text (desktop only; plain text on touch) ── */
const ProximityText: FC<{ text: string; className?: string }> = ({ text, className }) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const words = text.split(' ');
  const isTouch = isTouchDevice();

  const onMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);
  const onMouseLeave = useCallback(() => setMousePos(null), []);

  useEffect(() => {
    if (isTouch) return; // skip mouse tracking on touch devices
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [onMouseMove, onMouseLeave, isTouch]);

  return (
    <p ref={containerRef} className={className}
      style={{ display: 'block', fontSize: '1.1rem', lineHeight: 1.6, color: '#222', textAlign: 'center', maxWidth: 800, margin: '1.2rem auto 0 auto', cursor: 'default' }}>
      {words.map((word, i) => {
        let scale = 1, fontWeight: number = 500, opacity = 1, textShadow = 'none', color = '#222';
        if (mousePos && wordRefs.current[i]) {
          const rect = wordRefs.current[i]!.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.sqrt((mousePos.x - cx) ** 2 + (mousePos.y - cy) ** 2);
          const maxDist = 55; // tight — only the word directly under cursor
          const t = Math.max(0, 1 - dist / maxDist);
          const eased = t * t * t * t; // steep falloff — sharp word-by-word feel
          // dim all words, then brighten only the close one
          const base = 0.3;
          opacity = base + eased * (1 - base);
          scale = 1 + eased * 0.32;
          fontWeight = Math.round(400 + eased * 500);
          const r = Math.round(34 + eased * (232 - 34));
          const g = Math.round(34 + eased * (163 - 34));
          const b = Math.round(34 + eased * (23 - 34));
          color = eased > 0.05 ? `rgb(${r},${g},${b})` : '#555';
          const glow = Math.round(eased * 14);
          textShadow = eased > 0.15 ? `0 0 ${glow}px rgba(232,163,23,${(eased * 0.8).toFixed(2)})` : 'none';
        }
        return (
          <span
            key={i}
            ref={el => { wordRefs.current[i] = el; }}
            className="fadeup-word"
            style={{
              display: 'inline-block',
              animation: `fadeUpWord 0.45s ${(i * 0.06 + 0.2).toFixed(2)}s forwards, blurClear 0.7s ${(i * 0.06 + 0.2).toFixed(2)}s forwards`,
              '--fadeup-from': '14px',
              marginRight: i < words.length - 1 ? '0.35em' : 0,
              transform: `scale(${scale})`,
              fontWeight,
              opacity,
              color,
              textShadow,
              transition: 'transform 0.12s ease, opacity 0.12s ease, color 0.12s ease, text-shadow 0.12s ease',
              willChange: 'transform, opacity, filter',
              transformOrigin: 'center center',
            } as React.CSSProperties}
          >
            {word}
          </span>
        );
      })}
    </p>
  );
};

const HomePage: FC = () => {
  /* GSAP scroll-triggered reveals */
  const { reveal, batchReveal } = useGsapReveal();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const statsGridRef = useRef<HTMLDivElement>(null);
  const servicesGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    batchReveal(statsGridRef.current, '.stat-card', { stagger: 0.15 });
    batchReveal(servicesGridRef.current, '.service-card', { stagger: 0.15 });
  }, [reveal, batchReveal]);

  return (
    <div className="page-home">
      <SEOHead
        title="Home"
        description="Lifewood Data Technology — the world's leading provider of AI-powered data solutions across 30+ countries and 40+ delivery centers."
        canonical="/"
        keywords="AI data solutions, data annotation, machine learning, data collection, AIGC, Lifewood"
      />

      {/* ── Hero ── */}
      <section className="hero">
        {/* Aurora background instead of simple ShaderBg */}
        <div className="hero-aurora-wrapper">
          <ErrorBoundary>
            <Suspense fallback={null}>
              <Aurora
                colorStops={['#E8A317', '#1a1a2e', '#E8A317']}
                amplitude={1.2}
                blend={0.6}
                speed={0.8}
              />
            </Suspense>
          </ErrorBoundary>
        </div>

        <div className="rb-float-particle" style={{ top: '15%', left: '10%' }} />
        <div className="rb-float-particle" style={{ top: '60%', left: '85%' }} />
        <div className="rb-float-particle" style={{ top: '30%', left: '70%' }} />
        <div className="rb-float-particle" style={{ top: '75%', left: '25%' }} />
        <div className="rb-float-particle" style={{ top: '45%', left: '50%' }} />

        <div className="hero-content">
          <BlurText
            text="The world's leading provider of AI-powered data solutions."
            delay={120}
            animateBy="words"
            direction="top"
            className="hero-blur-heading"
          />
          <p className="hero-sub-text" style={{ fontSize: '1.35rem', fontWeight: 500, lineHeight: 1.5, textAlign: 'center', display: 'block', maxWidth: 680, margin: '0.8rem auto 1.8rem' }}>
            {(() => {
              const words = 'Empowering businesses with innovation across 30+ countries worldwide.'.split(' ');
              return words.map((word, i) => {
                const prox = Math.abs(i - words.length / 2) / (words.length / 2);
                const ty = 20 + Math.round(14 * prox);
                const delay = (i * 0.07 + 0.5 + prox * 0.1).toFixed(2);
                return (
                  <span
                    key={i}
                    className="fadeup-word"
                    style={{
                      display: 'inline-block',
                      color: 'rgba(232,237,233,0.82)',
                      animation: `fadeUpWord 0.5s ${delay}s forwards`,
                      '--fadeup-from': `${ty}px`,
                      marginRight: i < words.length - 1 ? '0.32em' : 0,
                    } as React.CSSProperties}
                  >
                    {word}
                  </span>
                );
              });
            })()}
          </p>
          <div className="hero-buttons">
            <Link to="/contact" className="btn-primary">
              <ShinyText text="Contact Us" speed={3} shineColor="#FFD700" color="#fff" />
              {' '}<i className="fas fa-arrow-right" />
            </Link>
            <Link to="/about" className="btn-secondary">
              Learn More <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Marquee Strips ── */}
      <MarqueeStrip items={marqueeForward} />
      <MarqueeStrip items={marqueeReverse} reverse />

      {/* ── About Preview ── */}
      <section className="about">
        <div className="section-container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ color: '#1A1A2E', fontWeight: 900, fontSize: 'clamp(3rem, 7vw, 4.5rem)', letterSpacing: '-2px', lineHeight: 1.05, textTransform: 'uppercase', textShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
              <BlurText
                text="About us"
                delay={80}
                animateBy="words"
                direction="top"
                className="about-blur-heading"
              />
            </div>
            <AnimReveal>
              <ProximityText
                className="about-text"
                text="At Lifewood we empower our company and our clients to realize the transformative power of AI. By connecting local expertise with our global AI data infrastructure, we create opportunities, empower communities, and drive inclusive growth worldwide."
              />
            </AnimReveal>
          </div>
          <AnimReveal>
            <Link to="/about" className="btn-primary" style={{ display: 'inline-block' }}>
              Know Us Better <i className="fas fa-arrow-right" />
            </Link>
          </AnimReveal>
          <AnimReveal>
            <div className="about-highlight">
              <BlurText
                text="By connecting local expertise with our global AI data infrastructure, we create opportunities, empower communities, and drive inclusive growth worldwide."
                delay={100}
                animateBy="words"
                direction="top"
              />
            </div>
          </AnimReveal>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link to="/ai-data-services" className="btn-secondary" style={{ color: '#1A3A2A' }}>
              Explore more <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats">
        <div className="stats-grid" ref={statsGridRef}>
          {stats.map((s, i) => (
            <AnimReveal key={i} delay={i * 120}>
              <div className="stat-card">
                <div className="stat-number">
                  <CountUpStat
                    value={s.value}
                    suffix={s.suffix}
                    format={s.format}
                    duration={2000}
                  />
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            </AnimReveal>
          ))}
        </div>
        <AnimReveal>
          <div className="stat-desc">
            With 56,788 online specialists worldwide, Lifewood mobilizes a flexible
            workforce for scalable data collection, annotation, and quality assurance,
            operating 24/7 across regions.
          </div>
        </AnimReveal>
      </section>

      {/* ── Partners ── */}
      <section className="partners">
        <div className="section-container">
          <h2 className="partners-title">
            <BlurText
              text="Our Clients And Partners"
              delay={80}
              animateBy="words"
              direction="top"
            />
          </h2>
          <div className="partners-highlight">
            Here are some of the valued clients and partners we&apos;ve collaborated with:
          </div>
          <div className="logo-anim-line-container">
            <div className="logo-anim-line" />
          </div>
          <div className="logo-marquee-wrapper">
            <div className="logo-marquee-track">
              <div className="logo-row">
                {[...partners, ...partners].map((p, i) => (
                  <div className="logo-item" key={i}>
                    <img src={p.src} alt={p.alt} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Global Section ── */}
      <section className="global">
        <BlurText
          text="Global + AI Data Projects at Scale"
          delay={80}
          animateBy="words"
          direction="top"
          className="global-blur-heading"
        />
      </section>

      {/* ── Services Grid ── */}
      <section className="services" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Ribbons background effect */}
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Ribbons
              colors={['#E8A31740', '#FFD70030', '#1a1a2e50']}
              baseSpring={0.02}
              baseFriction={0.92}
              baseThickness={20}
              pointCount={40}
              speedMultiplier={0.4}
              enableFade
            />
          </Suspense>
        </ErrorBoundary>
        <div className="section-container" style={{ position: 'relative', zIndex: 2 }}>
          <AnimReveal>
            <h2 className="services-title">
              <BlurText text="AI DATA SERVICES" delay={80} animateBy="words" direction="top" className="services-blur-heading" />
            </h2>
          </AnimReveal>
          <AnimReveal>
            <p className="services-desc">
              Lifewood offers AI and IT services that enhance decision-making, reduce
              costs, and improve productivity through cutting-edge data solutions.
            </p>
          </AnimReveal>
          <div className="services-grid" ref={servicesGridRef}>
            {serviceCards.map((card, i) => (
              <div
                className={`service-card ${card.gridClass}`}
                key={card.type}
                style={{ flex: hoveredCard === null ? 1 : hoveredCard === i ? 2.8 : 0.45 }}
                onMouseEnter={() => { if (!isTouchDevice()) setHoveredCard(i); }}
                onMouseLeave={() => { if (!isTouchDevice()) setHoveredCard(null); }}
                onClick={() => { if (isTouchDevice()) setHoveredCard(hoveredCard === i ? null : i); }}
              >
                <div className="flip-inner">
                  {/* ── Front face ── */}
                  <div className="flip-front">
                    {card.mediaType === 'video' ? (
                      <video
                        className="card-media"
                        src={card.src}
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img className="card-media" src={card.src} alt={card.label} loading="lazy" />
                    )}
                    <div className="card-overlay" />
                    <span className="card-label">{card.label}</span>
                    <div className="card-info">
                      <div className="card-info-title">{card.title}</div>
                    </div>
                  </div>
                  {/* ── Back face ── */}
                  <div className="flip-back">
                    <span className="flip-back-badge">{card.label}</span>
                    <div className="flip-back-title">{card.title}</div>
                    <div className="flip-back-desc">{card.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AnimReveal>
            <div className="services-cta">
              <GradientText colors={['#1A3A2A', '#1A3A2A', '#1A3A2A']} animationSpeed={5}>
                We provide global Data Engineering Services to enable AI Solutions.
              </GradientText>
            </div>
          </AnimReveal>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/ai-data-services" className="btn-primary">
              Explore Services <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
