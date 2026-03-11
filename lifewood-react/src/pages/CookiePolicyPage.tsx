import type { FC } from 'react';
import AnimReveal from '../components/AnimReveal';
import BlurText from '../components/BlurText';
import SEOHead from '../components/SEOHead';

const CookiePolicyPage: FC = () => {
  return (
    <section className="privacy-page">
      <SEOHead title="Cookie Policy" description="Learn how Lifewood uses cookies and how you can manage your preferences." canonical="/cookie-policy" />
      <div className="privacy-hero">
        <div className="privacy-hero-inner">
          <BlurText
            text="Cookie Policy"
            delay={120}
            animateBy="words"
            direction="top"
            className="legal-hero-blur-title"
          />
          <AnimReveal>
            <p>How Lifewood uses cookies and similar technologies on our website.</p>
          </AnimReveal>
        </div>
      </div>
      <div className="privacy-body">
        <p className="privacy-effective">Last updated: November 2025</p>

        <div className="privacy-toc">
          <h3>Table of Contents</h3>
          <ol>
            <li><a href="#cp-1">What Are Cookies</a></li>
            <li><a href="#cp-2">How We Use Cookies</a></li>
            <li><a href="#cp-3">Types of Cookies</a></li>
            <li><a href="#cp-4">Third-Party Cookies</a></li>
            <li><a href="#cp-5">Managing Cookies</a></li>
            <li><a href="#cp-6">Changes to This Policy</a></li>
            <li><a href="#cp-7">Contact Us</a></li>
          </ol>
        </div>

        <div className="privacy-section" id="cp-1">
          <h2><span>1.</span> What Are Cookies</h2>
          <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better browsing experience and understand how our site is used.</p>
        </div>

        <div className="privacy-section" id="cp-2">
          <h2><span>2.</span> How We Use Cookies</h2>
          <p>We use cookies to remember your preferences (such as dark mode), analyze site traffic, and improve our services.</p>
        </div>

        <div className="privacy-section" id="cp-3">
          <h2><span>3.</span> Types of Cookies</h2>
          <p><strong>Essential Cookies:</strong> Required for basic site functionality. <strong>Analytics Cookies:</strong> Help us understand usage patterns. <strong>Preference Cookies:</strong> Remember your settings and choices.</p>
        </div>

        <div className="privacy-section" id="cp-4">
          <h2><span>4.</span> Third-Party Cookies</h2>
          <p>Some third-party services we use (such as Google Analytics and YouTube embeds) may set their own cookies. Please refer to their privacy policies for more information.</p>
        </div>

        <div className="privacy-section" id="cp-5">
          <h2><span>5.</span> Managing Cookies</h2>
          <p>You can control and delete cookies through your browser settings. Note that disabling cookies may affect website functionality.</p>
        </div>

        <div className="privacy-section" id="cp-6">
          <h2><span>6.</span> Changes to This Policy</h2>
          <p>We may update this Cookie Policy from time to time. Any changes will be posted on this page.</p>
        </div>

        <div className="privacy-section" id="cp-7">
          <h2><span>7.</span> Contact Us</h2>
          <p>For questions about our cookie practices, please contact us at: <a href="mailto:lifewood@gmail.com">lifewood@gmail.com</a></p>
        </div>

        <div className="privacy-back-top">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <i className="fas fa-arrow-up" /> Back to Top
          </a>
        </div>
      </div>
    </section>
  );
};

export default CookiePolicyPage;
