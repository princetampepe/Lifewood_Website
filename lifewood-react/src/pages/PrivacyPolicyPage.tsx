import type { FC } from 'react';
import AnimReveal from '../components/AnimReveal';
import BlurText from '../components/BlurText';
import SEOHead from '../components/SEOHead';

const PrivacyPolicyPage: FC = () => {
  return (
    <section className="privacy-page">
      <SEOHead title="Privacy Policy" description="Lifewood Data Technology's privacy policy — how we collect, use, and protect your data." canonical="/privacy-policy" />
      <div className="privacy-hero">
        <div className="privacy-hero-inner">
          <BlurText
            text="Privacy Policy"
            delay={120}
            animateBy="words"
            direction="top"
            className="legal-hero-blur-title"
          />
          <AnimReveal>
            <p>How Lifewood Data Technology collects, uses, and protects your personal information.</p>
          </AnimReveal>
        </div>
      </div>
      <div className="privacy-body">
        <p className="privacy-effective">Effective Date: 3 November 2025</p>

        <div className="privacy-toc">
          <h3>Table of Contents</h3>
          <ol>
            <li><a href="#pp-1">Introduction</a></li>
            <li><a href="#pp-2">Information We Collect</a></li>
            <li><a href="#pp-3">How We Use Your Information</a></li>
            <li><a href="#pp-4">Legal Basis for Processing</a></li>
            <li><a href="#pp-5">Data Sharing and Disclosure</a></li>
            <li><a href="#pp-6">International Data Transfers</a></li>
            <li><a href="#pp-7">Data Retention</a></li>
            <li><a href="#pp-8">Your Rights</a></li>
            <li><a href="#pp-9">Security Measures</a></li>
            <li><a href="#pp-10">Children&apos;s Privacy</a></li>
            <li><a href="#pp-11">Third-Party Links</a></li>
            <li><a href="#pp-12">Changes to This Policy</a></li>
            <li><a href="#pp-13">Contact Us</a></li>
          </ol>
        </div>

        <div className="privacy-section" id="pp-1">
          <h2><span>1.</span> Introduction</h2>
          <p>
            Lifewood Data Technology (&quot;Lifewood&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
          </p>
        </div>

        <div className="privacy-section" id="pp-2">
          <h2><span>2.</span> Information We Collect</h2>
          <p>We may collect personal information that you voluntarily provide to us, including name, email address, phone number, and any other information you choose to provide through our contact forms or job applications.</p>
        </div>

        <div className="privacy-section" id="pp-3">
          <h2><span>3.</span> How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to comply with legal obligations.</p>
        </div>

        <div className="privacy-section" id="pp-4">
          <h2><span>4.</span> Legal Basis for Processing</h2>
          <p>We process personal data based on legitimate business interests, contract performance, compliance with legal obligations, and your consent where applicable.</p>
        </div>

        <div className="privacy-section" id="pp-5">
          <h2><span>5.</span> Data Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share data with trusted service providers who assist in our operations, subject to appropriate confidentiality agreements.</p>
        </div>

        <div className="privacy-section" id="pp-6">
          <h2><span>6.</span> International Data Transfers</h2>
          <p>As a global organization, your data may be transferred to and processed in countries outside your jurisdiction, with appropriate safeguards in place.</p>
        </div>

        <div className="privacy-section" id="pp-7">
          <h2><span>7.</span> Data Retention</h2>
          <p>We retain your personal data for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable laws.</p>
        </div>

        <div className="privacy-section" id="pp-8">
          <h2><span>8.</span> Your Rights</h2>
          <p>You have the right to access, correct, delete, or port your personal data, and to withdraw consent at any time. Contact us at hr@lifewood.com to exercise these rights.</p>
        </div>

        <div className="privacy-section" id="pp-9">
          <h2><span>9.</span> Security Measures</h2>
          <p>We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>
        </div>

        <div className="privacy-section" id="pp-10">
          <h2><span>10.</span> Children&apos;s Privacy</h2>
          <p>Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children.</p>
        </div>

        <div className="privacy-section" id="pp-11">
          <h2><span>11.</span> Third-Party Links</h2>
          <p>Our website may contain links to third-party websites. We are not responsible for their privacy practices.</p>
        </div>

        <div className="privacy-section" id="pp-12">
          <h2><span>12.</span> Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. The updated version will be indicated by an updated effective date.</p>
        </div>

        <div className="privacy-section" id="pp-13">
          <h2><span>13.</span> Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at: <a href="mailto:hr@lifewood.com">hr@lifewood.com</a></p>
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

export default PrivacyPolicyPage;
