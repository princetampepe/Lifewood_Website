import { useState, useMemo, type FC, type FormEvent } from 'react';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../firebase';
import AnimReveal from '../components/AnimReveal';
import BlurText from '../components/BlurText';
import Typewriter from '../components/Typewriter';
import { positions, perks } from '../data/siteData';
import SEOHead from '../components/SEOHead';

const CareersPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'positions' | 'apply'>('positions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState(0);

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.currentTarget;
      const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value.trim();
      const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
      const phone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim();
      const position = (form.elements.namedItem('position') as HTMLSelectElement).value;
      const coverLetter = (form.elements.namedItem('coverLetter') as HTMLTextAreaElement).value.trim();
      const resumeInput = form.elements.namedItem('resume') as HTMLInputElement;
      const file = resumeInput?.files?.[0];
      
      // Validate file size if provided
      if (file) {
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_FILE_SIZE) {
          setFormStatus({ type: 'error', msg: 'File size exceeds 10MB limit. Please upload a smaller file.' });
          setIsSubmitting(false);
          setTimeout(() => setFormStatus(null), 6000);
          return;
        }
      }

      // Create Firestore record FIRST (without file upload)
      const docRef = await addDoc(collection(firestore, 'jobApplications'), {
        fullName,
        email,
        phone,
        position,
        coverLetter,
        resumeUrl: null, // Start with null
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

      // Upload file in the background (after showing success)
      if (file) {
        try {
          const timestamp = Date.now();
          const fileName = `${timestamp}_${email}_${file.name}`;
          const storageRef = ref(storage, `jobApplications/${fileName}`);
          
          await uploadBytes(storageRef, file);
          const resumeUrl = await getDownloadURL(storageRef);
          
          // Update the Firestore document with the file URL
          await updateDoc(doc(firestore, 'jobApplications', docRef.id), {
            resumeUrl,
          });
        } catch (fileError) {
          console.error('File upload failed:', fileError);
          // Application is already submitted, file upload is just a bonus
        }
      }
    } catch {
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
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input type="text" id="fullName" name="fullName" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" />
              </div>
              <div className="form-group">
                <label htmlFor="position">Position *</label>
                <select
                  id="position"
                  name="position"
                  required
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                >
                  <option value="">Select a position</option>
                  {positions.map((p) => (
                    <option key={p.value} value={p.value}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="resume">Resume / CV (email to <a href="mailto:hr@lifewood.com">hr@lifewood.com</a>)</label>
                <input 
                  type="file" 
                  id="resume" 
                  name="resume" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) {
                      setSelectedFileName(file.name);
                      setSelectedFileSize(file.size);
                    } else {
                      setSelectedFileName('');
                      setSelectedFileSize(0);
                    }
                  }}
                />
                {selectedFileName && (
                  <small style={{ color: 'var(--castletone)', marginTop: '0.4rem', display: 'block' }}>
                    {selectedFileName} ({(selectedFileSize / 1024 / 1024).toFixed(2)} MB)
                    {selectedFileSize > 10 * 1024 * 1024 && (
                      <span style={{ color: '#e74c3c', fontWeight: 'bold' }}> ⚠️ Exceeds 10MB limit</span>
                    )}
                  </small>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="coverLetter">Cover Letter</label>
                <textarea id="coverLetter" name="coverLetter" rows={5} />
              </div>
              <button type="submit" className="form-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'} <i className="fas fa-paper-plane" />
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
