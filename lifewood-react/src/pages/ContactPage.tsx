import { useState, useRef, type FC, type FormEvent, type ChangeEvent } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase';
import AnimReveal from '../components/AnimReveal';
import BlurText from '../components/BlurText';
import Typewriter from '../components/Typewriter';
import SEOHead from '../components/SEOHead';

/* ── Simple validation helpers ── */
const sanitize = (s: string) => s.replace(/<[^>]*>/g, '').trim();
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  const cleaned = phone.replace(/\D/g, ''); // Extract only digits
  
  // Philippine format validation:
  // +63 9XX XXX XXXX (mobile) = 12 digits total
  // +63 2 XXXX XXXX (Manila landline) = 11 digits total
  // +63 XX XXXX XXXX (provincial) = 11-12 digits total
  // 09XX XXX XXXX format = 11 digits
  
  // Check if it starts with +63 (country code)
  if (phone.startsWith('+63')) {
    return cleaned.length >= 11 && cleaned.length <= 12; // 63 + 9-10 digits
  }
  
  // Check if it's the 09XX format (local Philippine)
  if (phone.startsWith('09') || phone.startsWith('9')) {
    return cleaned.length === 10 || cleaned.length === 11;
  }
  
  // Generic validation for other countries (7-15 digits)
  return cleaned.length >= 7 && cleaned.length <= 15;
};

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const ContactPage: FC = () => {
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const validate = (form: HTMLFormElement): FormErrors => {
    const errs: FormErrors = {};
    const name = sanitize((form.elements.namedItem('name') as HTMLInputElement).value);
    const email = sanitize((form.elements.namedItem('email') as HTMLInputElement).value);
    const phone = sanitize((form.elements.namedItem('phone') as HTMLInputElement)?.value || '');
    const message = sanitize((form.elements.namedItem('message') as HTMLTextAreaElement).value);
    if (!name || name.length < 2) errs.name = 'Please enter your full name (at least 2 characters).';
    if (!email || !isValidEmail(email)) errs.email = 'Please enter a valid email address.';
    if (phone && !isValidPhone(phone)) errs.phone = 'Please enter a valid phone number (e.g., +1 (234) 567-8900).';
    if (!message || message.length < 10) errs.message = 'Message must be at least 10 characters.';
    return errs;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Honeypot check — if filled, silently "succeed" (it's a bot)
    const honeypot = (form.elements.namedItem('_gotcha') as HTMLInputElement)?.value;
    if (honeypot) {
      setFormStatus({ type: 'success', msg: 'Message sent successfully! We will get back to you soon.' });
      form.reset();
      return;
    }

    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      const name = sanitize((form.elements.namedItem('name') as HTMLInputElement).value);
      const email = sanitize((form.elements.namedItem('email') as HTMLInputElement).value);
      const phone = sanitize((form.elements.namedItem('phone') as HTMLInputElement)?.value || '');
      const subject = sanitize((form.elements.namedItem('subject') as HTMLInputElement).value);
      const message = sanitize((form.elements.namedItem('message') as HTMLTextAreaElement).value);

      await addDoc(collection(firestore, 'contactMessages'), {
        name,
        email,
        phone: phone || undefined,
        subject,
        message,
        createdAt: serverTimestamp(),
      });

      setFormStatus({ type: 'success', msg: 'Message sent successfully! We will get back to you soon.' });
      form.reset();
      setErrors({});
    } catch {
      setFormStatus({ type: 'error', msg: 'Something went wrong. Please try again later.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFormStatus(null), 6000);
    }
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.currentTarget.value.trim();
    if (phone && !isValidPhone(phone)) {
      setErrors((prev) => ({
        ...prev,
        phone: 'Enter a valid phone number (e.g., +63 9XX XXX XXXX or 09XX XXX XXXX).',
      }));
    } else {
      clearError('phone');
    }
  };

  return (
    <section className="contact-page">
      <SEOHead
        title="Contact Us"
        description="Get in touch with Lifewood Data Technology. Have questions about our AI data services? We'd love to hear from you."
        canonical="/contact"
        keywords="contact Lifewood, AI data services inquiry, data annotation quote"
      />

      {/* ── Hero ── */}
      <div className="contact-hero">
        <BlurText
          text="Get in Touch"
          delay={120}
          animateBy="words"
          direction="top"
          className="contact-hero-blur-title"
        />
        <AnimReveal>
          <p className="contact-hero-sub">
            <Typewriter text="Have questions about our services? Want to partner with us? We'd love to hear from you." />
          </p>
        </AnimReveal>
      </div>

      {/* ── Form ── */}
      <div className="contact-form-wrap">
        <AnimReveal>
          <div className="contact-form-card">
            <BlurText
              text="Send Us a Message"
              delay={60}
              animateBy="words"
              direction="top"
              className="contact-form-blur-title"
            />
            <p>Reach out to our team directly — we&apos;re always happy to hear from you.</p>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              aria-label="Contact form"
            >
              {/* Honeypot field — hidden from users, bots fill it */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
                <label htmlFor="ct-gotcha">Do not fill this</label>
                <input type="text" id="ct-gotcha" name="_gotcha" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="form-group">
                <label htmlFor="ct-name">Your Name <span aria-hidden="true">*</span></label>
                <input
                  type="text"
                  id="ct-name"
                  name="name"
                  required
                  autoComplete="name"
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'ct-name-err' : undefined}
                  onChange={() => clearError('name')}
                />
                {errors.name && <span id="ct-name-err" className="form-error" role="alert">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="ct-email">Email Address <span aria-hidden="true">*</span></label>
                <input
                  type="email"
                  id="ct-email"
                  name="email"
                  required
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'ct-email-err' : undefined}
                  onChange={() => clearError('email')}
                />
                {errors.email && <span id="ct-email-err" className="form-error" role="alert">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="ct-phone">Phone Number</label>
                <input
                  type="tel"
                  id="ct-phone"
                  name="phone"
                  autoComplete="tel"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'ct-phone-err' : undefined}
                  onChange={handlePhoneChange}
                  placeholder="e.g., +63 915 123 4567 or 09151234567"
                />
                {errors.phone && <span id="ct-phone-err" className="form-error" role="alert">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="ct-message">Message <span aria-hidden="true">*</span></label>
                <textarea
                  id="ct-message"
                  name="message"
                  rows={6}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'ct-msg-err' : undefined}
                  onChange={() => clearError('message')}
                />
                {errors.message && <span id="ct-msg-err" className="form-error" role="alert">{errors.message}</span>}
              </div>

              <button type="submit" className="form-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'} <i className="fas fa-paper-plane" />
              </button>

              {formStatus && (
                <div className={`form-status ${formStatus.type}`} role="status" aria-live="polite">
                  {formStatus.msg}
                </div>
              )}
            </form>
          </div>
        </AnimReveal>
      </div>
    </section>
  );
};

export default ContactPage;
