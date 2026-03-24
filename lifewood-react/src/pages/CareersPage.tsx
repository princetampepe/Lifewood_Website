import { useState, useMemo, type FC, type FormEvent } from 'react';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../firebase';
import AnimReveal from '../components/AnimReveal';
import BlurText from '../components/BlurText';
import Typewriter from '../components/Typewriter';
import { positions, perks } from '../data/siteData';
import SEOHead from '../components/SEOHead';

/* ── Validation Helpers ── */
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

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
  fullName?: string;
  email?: string;
  phone?: string;
  position?: string;
}

const CareersPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'positions' | 'apply'>('positions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState(0);
  const [resumeUrl, setResumeUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const filteredPositions = useMemo(() => {
    if (!searchTerm.trim()) return positions;
    const q = searchTerm.toLowerCase();
    return positions.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.dept.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const handleApply = (positionValue: string) => {
    setSelectedPosition(positionValue);
    setActiveTab('apply');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleFileUpload = async (file: File, applicantName: string, applicantEmail: string) => {
    if (!file) return { success: true, url: '' };

    // Validate file size
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setFormStatus({
        type: 'error',
        msg: 'File size exceeds 10MB limit. Please choose a smaller file.',
      });
      return { success: false, url: null };
    }

    // Validate file type
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFormStatus({
        type: 'error',
        msg: 'Invalid file type. Please upload: PDF, DOC, DOCX, JPG, PNG, GIF, or TXT.',
      });
      return { success: false, url: null };
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicantName', applicantName);
      formData.append('applicantEmail', applicantEmail);

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setResumeUrl(data.url);
      setFormStatus(null);
      return { success: true, url: data.url };
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setFormStatus({
        type: 'error',
        msg: `Resume upload failed: ${errorMsg}. Application NOT submitted.`,
      });
      return { success: false, url: null };
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, +, spaces, parentheses, and hyphens
    const input = e.currentTarget.value;
    const filtered = input.replace(/[^0-9+\s()\-]/g, '');
    e.currentTarget.value = filtered;
    
    const phone = filtered.trim();
    if (phone && !isValidPhone(phone)) {
      setErrors((prev) => ({
        ...prev,
        phone: 'Enter a valid phone number (e.g., +63 9XX XXX XXXX or 09XX XXX XXXX).',
      }));
    } else {
      clearError('phone');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim();
    const position = (form.elements.namedItem('position') as HTMLSelectElement).value;
    const coverLetter = (form.elements.namedItem('coverLetter') as HTMLTextAreaElement).value.trim();
    const resumeFile = (form.elements.namedItem('resume') as HTMLInputElement).files?.[0];

    // Validate form
    const newErrors: FormErrors = {};
    if (!fullName || fullName.length < 2) newErrors.fullName = 'Please enter your full name (at least 2 characters).';
    if (!email) newErrors.email = 'Email address is required.';
    else if (!isValidEmail(email)) newErrors.email = 'Please enter a valid email address.';
    if (phone && !isValidPhone(phone)) newErrors.phone = 'Please enter a valid phone number (e.g., +1234567890 or 123-456-7890).';
    if (!position) newErrors.position = 'Please select a position.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    setFormStatus(null);
    
    try {
      // Upload resume if provided
      let uploadedResumeUrl = '';
      if (resumeFile) {
        const uploadResult = await handleFileUpload(resumeFile, fullName, email);
        
        // If upload failed, don't proceed with form submission
        if (!uploadResult.success) {
          setIsSubmitting(false);
          return;
        }
        
        uploadedResumeUrl = uploadResult.url || '';
      }

      // Add job application to Firestore
      await addDoc(collection(firestore, 'jobApplications'), {
        fullName,
        email,
        phone,
        position,
        coverLetter,
        resumeUrl: uploadedResumeUrl,
        status: 'pending',
        statusUpdatedAt: null,
        emailSentAt: null,
        createdAt: serverTimestamp(),
      });

      setFormStatus({ type: 'success', msg: 'Application submitted successfully! We will review and get back to you.' });
      form.reset();
      setSelectedPosition('');
      setSelectedFileName('');
      setSelectedFileSize(0);
      setResumeUrl('');
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
      setFormStatus({ type: 'error', msg: 'Something went wrong. Please try again later.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFormStatus(null), 6000);
    }
  };

  return (
    <div className="careers-page">
      <SEOHead title="Careers" description="Join Lifewood Data Technology — explore remote and hybrid career opportunities in AI, data operations, and more." canonical="/careers" />
      {/* ── Hero ── */}
      <section className="careers-hero-banner">
        <BlurText
          text="Build the Future with Lifewood"
          delay={80}
          animateBy="words"
          direction="top"
          className="careers-hero-blur-title"
        />
        <AnimReveal>
          <p className="careers-intro">
            <Typewriter
              text="Join a global team shaping the future of AI. Explore open positions or submit your application directly."
              speed={22}
            />
          </p>
        </AnimReveal>
      </section>

      {/* ── Perks ── */}
      <section className="careers-perks">
        {perks.map((p, i) => (
          <AnimReveal key={i} delay={i * 80}>
            <div className="perk-item">
              <i className={p.icon} /> {p.label}
            </div>
          </AnimReveal>
        ))}
      </section>

      {/* ── Tabs ── */}
      <div className="careers-tabs">
        <button
          className={`careers-tab-btn ${activeTab === 'positions' ? 'active' : ''}`}
          onClick={() => setActiveTab('positions')}
        >
          <i className="fas fa-briefcase" /> Open Positions
        </button>
        <button
          className={`careers-tab-btn ${activeTab === 'apply' ? 'active' : ''}`}
          onClick={() => setActiveTab('apply')}
        >
          <i className="fas fa-paper-plane" /> Apply Now
        </button>
      </div>

      {/* ── Positions Tab ── */}
      {activeTab === 'positions' && (
        <div className="careers-tab-panel">
          <BlurText
            text="Current Openings"
            delay={60}
            animateBy="words"
            direction="top"
            className="careers-panel-blur-title"
          />
          <div className="positions-search">
            <div className="positions-search-wrap">
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="positions-count">
              <i className="fas fa-briefcase" /> {filteredPositions.length} open roles
            </span>
          </div>

          <div className="positions-list">
            {filteredPositions.map((pos) => (
              <AnimReveal key={pos.value}>
                <div className="position-card">
                  <div className="position-card-top">
                    <h3>{pos.title}</h3>
                    <span className="position-dept">{pos.dept}</span>
                  </div>
                  <div className="position-card-meta">
                    <span><i className="fas fa-map-marker-alt" /> {pos.location}</span>
                    <span><i className="fas fa-clock" /> {pos.type}</span>
                  </div>
                  <button className="btn-primary position-apply-btn" onClick={() => handleApply(pos.value)}>
                    Apply Now <i className="fas fa-arrow-right" />
                  </button>
                </div>
              </AnimReveal>
            ))}
            {filteredPositions.length === 0 && (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--castletone)' }}>
                No positions found matching &quot;{searchTerm}&quot;
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Apply Tab ── */}
      {activeTab === 'apply' && (
        <div className="careers-tab-panel">
          <div className="careers-form-card">
            <BlurText
              text="Job Application"
              delay={60}
              animateBy="words"
              direction="top"
              className="careers-panel-blur-title"
            />
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="fullName">Full Name <span aria-hidden="true">*</span></label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-err' : undefined}
                  onChange={() => clearError('fullName')}
                />
                {errors.fullName && <span id="fullName-err" className="form-error" role="alert">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address <span aria-hidden="true">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-err' : undefined}
                  onChange={() => clearError('email')}
                />
                {errors.email && <span id="email-err" className="form-error" role="alert">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                  inputMode="numeric"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-err' : undefined}
                  onChange={handlePhoneChange}
                  placeholder="e.g., +63 915 123 4567 or 09151234567"
                />
                {errors.phone && <span id="phone-err" className="form-error" role="alert">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="position">Position <span aria-hidden="true">*</span></label>
                <select
                  id="position"
                  name="position"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.position}
                  aria-describedby={errors.position ? 'position-err' : undefined}
                  value={selectedPosition}
                  onChange={(e) => {
                    setSelectedPosition(e.target.value);
                    clearError('position');
                  }}
                >
                  <option value="">Select a position</option>
                  {positions.map((p) => (
                    <option key={p.value} value={p.value}>{p.title}</option>
                  ))}
                </select>
                {errors.position && <span id="position-err" className="form-error" role="alert">{errors.position}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="resume">Resume / CV (Optional)</label>
                <input 
                  type="file" 
                  id="resume" 
                  name="resume" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) {
                      setSelectedFileName(file.name);
                      setSelectedFileSize(file.size);
                    } else {
                      setSelectedFileName('');
                      setSelectedFileSize(0);
                      setResumeUrl('');
                    }
                  }}
                />
                {selectedFileName && (
                  <small style={{ color: 'var(--castletone)', marginTop: '0.4rem', display: 'block' }}>
                    {selectedFileName} ({(selectedFileSize / 1024 / 1024).toFixed(2)} MB)
                    {selectedFileSize > 10 * 1024 * 1024 && (
                      <span style={{ color: '#e74c3c', fontWeight: 'bold' }}> ⚠️ Exceeds 10MB limit</span>
                    )}
                    {isUploading && <span style={{ color: '#D4A017', fontWeight: 'bold' }}> ⏳ Uploading...</span>}
                    {resumeUrl && <span style={{ color: '#27ae60', fontWeight: 'bold' }}> ✓ Uploaded</span>}
                  </small>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="coverLetter">Cover Letter</label>
                <textarea id="coverLetter" name="coverLetter" rows={5} />
              </div>
              <button type="submit" className="form-btn" disabled={isSubmitting || isUploading}>
                {isSubmitting ? 'Submitting...' : isUploading ? 'Uploading Resume...' : 'Submit Application'} <i className="fas fa-paper-plane" />
              </button>
              {formStatus && (
                <div className={`form-status ${formStatus.type}`}>{formStatus.msg}</div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CareersPage;
