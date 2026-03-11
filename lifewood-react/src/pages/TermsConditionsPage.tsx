import type { FC } from 'react';
import AnimReveal from '../components/AnimReveal';
import BlurText from '../components/BlurText';
import SEOHead from '../components/SEOHead';

const TermsConditionsPage: FC = () => {
  return (
    <section className="privacy-page">
      <SEOHead title="Terms & Conditions" description="Read Lifewood Data Technology's terms and conditions for using our website and services." canonical="/terms-conditions" />
      <div className="privacy-hero">
        <div className="privacy-hero-inner">
          <BlurText
            text="Terms & Conditions"
            delay={120}
            animateBy="words"
            direction="top"
            className="legal-hero-blur-title"
          />
          <AnimReveal>
            <p>Please read these terms carefully before using our services.</p>
          </AnimReveal>
        </div>
      </div>
      <div className="privacy-body">
        <p className="privacy-effective">Effective Date: November 2025 | Governed by Hong Kong Law</p>

        <div className="privacy-toc">
          <h3>Table of Contents</h3>
          <ol>
            <li><a href="#tc-1">Acceptance of Terms</a></li>
            <li><a href="#tc-2">Use of Services</a></li>
            <li><a href="#tc-3">Intellectual Property</a></li>
            <li><a href="#tc-4">User Conduct</a></li>
            <li><a href="#tc-5">Limitation of Liability</a></li>
            <li><a href="#tc-6">Indemnification</a></li>
            <li><a href="#tc-7">Termination</a></li>
            <li><a href="#tc-8">Governing Law</a></li>
            <li><a href="#tc-9">Changes to Terms</a></li>
            <li><a href="#tc-10">Contact Us</a></li>
          </ol>
        </div>

        <div className="privacy-section" id="tc-1">
          <h2><span>1.</span> Acceptance of Terms</h2>
          <p>By accessing or using the Lifewood website and services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
        </div>

        <div className="privacy-section" id="tc-2">
          <h2><span>2.</span> Use of Services</h2>
          <p>You agree to use our services only for lawful purposes and in accordance with these terms. You must not use our services in any way that could damage or impair our systems.</p>
        </div>

        <div className="privacy-section" id="tc-3">
          <h2><span>3.</span> Intellectual Property</h2>
          <p>All content, logos, trademarks, and materials on this website are the property of Lifewood Data Technology and are protected by intellectual property laws.</p>
        </div>

        <div className="privacy-section" id="tc-4">
          <h2><span>4.</span> User Conduct</h2>
          <p>You agree not to engage in any activity that interferes with or disrupts the services or servers connected to our platform.</p>
        </div>

        <div className="privacy-section" id="tc-5">
          <h2><span>5.</span> Limitation of Liability</h2>
          <p>Lifewood shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.</p>
        </div>

        <div className="privacy-section" id="tc-6">
          <h2><span>6.</span> Indemnification</h2>
          <p>You agree to indemnify and hold harmless Lifewood and its affiliates from any claims arising from your use of our services.</p>
        </div>

        <div className="privacy-section" id="tc-7">
          <h2><span>7.</span> Termination</h2>
          <p>We reserve the right to terminate or suspend access to our services at any time, without prior notice, for conduct that we believe violates these terms.</p>
        </div>

        <div className="privacy-section" id="tc-8">
          <h2><span>8.</span> Governing Law</h2>
          <p>These Terms and Conditions are governed by and construed in accordance with the laws of the Hong Kong Special Administrative Region.</p>
        </div>

        <div className="privacy-section" id="tc-9">
          <h2><span>9.</span> Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.</p>
        </div>

        <div className="privacy-section" id="tc-10">
          <h2><span>10.</span> Contact Us</h2>
          <p>For questions about these Terms and Conditions, please contact us at: <a href="mailto:hr@lifewood.com">hr@lifewood.com</a></p>
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

export default TermsConditionsPage;
