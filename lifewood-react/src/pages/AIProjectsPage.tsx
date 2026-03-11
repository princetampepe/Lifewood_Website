import { useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import AnimReveal from '../components/AnimReveal';
import BlurText from '../components/BlurText';
import Typewriter from '../components/Typewriter';
import SEOHead from '../components/SEOHead';

const projects = [
  {
    number: '2.1',
    title: 'AI Data Extraction',
    icon: 'fas fa-file-alt',
    image: '/ai projects/ai data extraction.png',
    desc: 'Using AI, we optimize the acquisition of image and text from multiple sources. Techniques include onsite scanning, drone photography, negotiation with archives and the formation of alliances with corporations, religious organizations and governments.',
  },
  {
    number: '2.2',
    title: 'Machine Learning Enablement',
    icon: 'fas fa-cogs',
    image: '/ai projects/machine learning enablement.png',
    desc: 'Maximise your business potential with bespoke machine learning solutions. Whether you\'re looking for predictive analytics, process automation, or AI-powered insights, we transform complex data into actionable intelligence, adding both strategic value and operational efficiency with expert implementation and precision.',
  },
  {
    number: '2.3',
    title: 'Autonomous Driving Technology',
    icon: 'fas fa-car',
    image: '/ai projects/autonomous driving.png',
    desc: 'From autonomous vehicle annotation to comprehensive testing infrastructure, we deliver high-quality 2D/3D/4D datasets for self-driving AI development. We handle everything from LiDAR processing and sensor fusion to traffic scenario annotation, ensuring precision that enhances both confidence and performance.',
  },
  {
    number: '2.4',
    title: 'AI-Enabled Customer Service',
    icon: 'fas fa-headset',
    image: '/ai projects/ai enabled customer service.png',
    desc: 'Expand your business capabilities with seamless AI-enabled customer service solutions. Whether you need intelligent chatbots, automated support systems, or multi-channel communication platforms, we provide expertly crafted solutions designed to enhance customer engagement, efficiency, and satisfaction.',
  },
  {
    number: '2.5',
    title: 'Natural Language Processing and Speech Acquisition',
    icon: 'fas fa-language',
    image: '/ai projects/natural language processing and speech acquisition.png',
    desc: 'Bring your NLP projects to the next level with our expert speech and text acquisition services. With 25,400+ hours of validated multilingual voice data across 23 countries, we provide comprehensive linguistic resources for LLM training, combining technical precision with cultural authenticity.',
  },
  {
    number: '2.6',
    title: 'Computer Vision (CV)',
    icon: 'fas fa-eye',
    image: '/ai projects/computer vision.png',
    desc: 'Training AI to see and understand the world requires high-volume quality training data. Lifewood provides total data solutions for CV development from collection to annotation to classification, for video and image datasets enabling machines to interpret visual information in autonomous vehicles, drone monitoring, and beyond.',
  },
  {
    number: '2.7',
    title: 'Genealogy',
    icon: 'fas fa-sitemap',
    image: '/ai projects/genealogy ver 1.png',
    desc: 'Powered by AI, Lifewood processes genealogical material at speed and scale, to conserve and illuminate family histories. With 18+ years of experience and expertise spanning 50+ languages, we transcribe and index diverse genealogical content including census records, vital records, church registers, military records, and legal documents.',
  },
];

const AIProjectsPage: FC = () => {
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <section className="ai-projects-page">
      <SEOHead title="AI Projects" description="Discover Lifewood's AI projects spanning autonomous driving, NLP, computer vision, and more." canonical="/ai-projects" />
      {/* ── Hero ── */}
      <div className="proj-hero">
        <BlurText
          text="AI Projects"
          delay={120}
          animateBy="words"
          direction="top"
          className="proj-hero-blur-title"
        />
        <AnimReveal>
          <p className="proj-hero-sub">
            <Typewriter text="Explore Lifewood's portfolio of AI data projects spanning genealogy, autonomous systems, NLP, and generative AI — delivering real-world impact at global scale." />
          </p>
        </AnimReveal>
      </div>

      {/* ── Two-column: Image left, Accordion right ── */}
      <div className="proj-split-section">
        <BlurText
          text="What we currently handle"
          delay={60}
          animateBy="words"
          direction="top"
          className="projects-heading-blur"
        />


        <div className="proj-split-layout">
          {/* Left column — stacked images, only active visible */}
          <div className="proj-split-image">
            {projects.map((p, i) => (
              <img
                key={i}
                src={encodeURI(p.image)}
                alt={p.title}
                className={`proj-split-img${openIdx === i ? ' proj-split-img--active' : ''}`}
              />
            ))}
          </div>

          {/* Right column — accordion */}
          <div className="proj-accordion" onMouseLeave={() => setOpenIdx(0)}>
            {projects.map((project, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className={`proj-acc-item${isOpen ? ' proj-acc-open' : ''}`}
                  onMouseEnter={() => setOpenIdx(idx)}
                  onClick={() => setOpenIdx(isOpen ? 0 : idx)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="proj-acc-header">
                    <span className="proj-acc-icon">
                      <i className={project.icon} />
                    </span>
                    <span className="proj-acc-label">
                      {project.number} {project.title}
                    </span>
                    <span className="proj-acc-toggle">
                      {isOpen ? '\u00d7' : '+'}
                    </span>
                  </div>
                  {isOpen && (
                    <div className="proj-acc-body">
                      <p>{project.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="proj-cta-banner">
        <AnimReveal>
          <BlurText
            text="Want to explore partnership opportunities?"
            delay={80}
            animateBy="words"
            direction="top"
            className="proj-cta-blur-title"
          />
          <p><Typewriter text="Contact our team to discuss how Lifewood can power your AI data needs." /></p>
          <Link to="/contact" className="btn-primary">
            Get in Touch <i className="fas fa-arrow-right" />
          </Link>
        </AnimReveal>
      </div>

    </section>
  );
};

export default AIProjectsPage;
