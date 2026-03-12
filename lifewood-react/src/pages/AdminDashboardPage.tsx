import { useState, useEffect, useMemo, type FC, type FormEvent } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
  type Timestamp,
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { positions } from '../data/siteData';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

/* ── Types ── */
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Timestamp | null;
}

interface JobApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  coverLetter: string;
  createdAt: Timestamp | null;
}

/* ── Helpers ── */
const sanitize = (s: string) => s.replace(/<[^>]*>/g, '').trim();
const fmtDate = (ts: Timestamp | null) =>
  ts ? ts.toDate().toLocaleString() : '—';

/* ================================================================
   ADMIN DASHBOARD
   ================================================================ */
const AdminDashboardPage: FC = () => {
  const { logout } = useAuth();

  /* ── Active section ── */
  const [section, setSection] = useState<'contacts' | 'applications'>('contacts');

  /* ── Contact Messages state ── */
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState('');
  const [contactSearch, setContactSearch] = useState('');

  /* ── Job Applications state ── */
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState('');
  const [appSearch, setAppSearch] = useState('');

  /* ── Modal state ── */
  const [modal, setModal] = useState<
    | { type: 'create-contact' }
    | { type: 'edit-contact'; data: ContactMessage }
    | { type: 'create-app' }
    | { type: 'edit-app'; data: JobApplication }
    | null
  >(null);

  /* ── Real-time listeners ── */
  useEffect(() => {
    const q = query(collection(firestore, 'contactMessages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setContacts(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessage)),
        );
        setContactsLoading(false);
      },
      (err) => {
        setContactsError(err.message);
        setContactsLoading(false);
      },
    );
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(firestore, 'jobApplications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setApplications(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as JobApplication)),
        );
        setAppsLoading(false);
      },
      (err) => {
        setAppsError(err.message);
        setAppsLoading(false);
      },
    );
    return unsub;
  }, []);

  /* ── Filtered lists ── */
  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return contacts;
    const q = contactSearch.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q),
    );
  }, [contacts, contactSearch]);

  const filteredApps = useMemo(() => {
    if (!appSearch.trim()) return applications;
    const q = appSearch.toLowerCase();
    return applications.filter(
      (a) =>
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q),
    );
  }, [applications, appSearch]);

  /* ── Delete handlers ── */
  const deleteContact = async (id: string) => {
    if (!confirm('Delete this contact message?')) return;
    try {
      await deleteDoc(doc(firestore, 'contactMessages', id));
      toast.success('Contact message deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm('Delete this job application?')) return;
    try {
      await deleteDoc(doc(firestore, 'jobApplications', id));
      toast.success('Application deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  /* ── Render ── */
  return (
    <section className="admin-dashboard">
      <SEOHead title="Admin Dashboard" description="Lifewood Admin Dashboard" canonical="/admin" />

      {/* ── Header ── */}
      <div className="admin-header">
        <h1><i className="fas fa-tachometer-alt" /> Admin Dashboard</h1>
        <button className="admin-logout-btn" onClick={logout}>
          <i className="fas fa-sign-out-alt" /> Logout
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="admin-stats">
        <div className="admin-stat-card" onClick={() => setSection('contacts')}>
          <i className="fas fa-envelope" />
          <div>
            <span className="admin-stat-num">{contacts.length}</span>
            <span className="admin-stat-label">Contact Messages</span>
          </div>
        </div>
        <div className="admin-stat-card" onClick={() => setSection('applications')}>
          <i className="fas fa-briefcase" />
          <div>
            <span className="admin-stat-num">{applications.length}</span>
            <span className="admin-stat-label">Job Applications</span>
          </div>
        </div>
      </div>

      {/* ── Section Tabs ── */}
      <div className="admin-tabs">
        <button className={`admin-tab ${section === 'contacts' ? 'active' : ''}`} onClick={() => setSection('contacts')}>
          <i className="fas fa-envelope" /> Contact Messages
        </button>
        <button className={`admin-tab ${section === 'applications' ? 'active' : ''}`} onClick={() => setSection('applications')}>
          <i className="fas fa-briefcase" /> Job Applications
        </button>
      </div>

      {/* ── CONTACT MESSAGES ── */}
      {section === 'contacts' && (
        <div className="admin-section">
          <div className="admin-section-toolbar">
            <div className="admin-search-wrap">
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder="Search messages…"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
              />
            </div>
            <button className="admin-create-btn" onClick={() => setModal({ type: 'create-contact' })}>
              <i className="fas fa-plus" /> New Message
            </button>
          </div>

          {contactsLoading && (
            <div className="admin-loading"><div className="page-loader-spinner" /> Loading…</div>
          )}
          {contactsError && <div className="form-status error">{contactsError}</div>}
          {!contactsLoading && !contactsError && filteredContacts.length === 0 && (
            <div className="admin-empty"><i className="fas fa-inbox" /> No contact messages found.</div>
          )}

          <div className="admin-cards">
            {filteredContacts.map((c) => (
              <div key={c.id} className="admin-record-card">
                <div className="admin-record-header">
                  <h3>{c.name}</h3>
                  <span className="admin-record-date">{fmtDate(c.createdAt)}</span>
                </div>
                <p className="admin-record-meta"><i className="fas fa-envelope" /> {c.email}</p>
                {c.subject && <p className="admin-record-meta"><i className="fas fa-tag" /> {c.subject}</p>}
                <p className="admin-record-body">{c.message}</p>
                <div className="admin-record-actions">
                  <button className="admin-action-btn edit" onClick={() => setModal({ type: 'edit-contact', data: c })}>
                    <i className="fas fa-pen" /> Edit
                  </button>
                  <button className="admin-action-btn delete" onClick={() => deleteContact(c.id)}>
                    <i className="fas fa-trash" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── JOB APPLICATIONS ── */}
      {section === 'applications' && (
        <div className="admin-section">
          <div className="admin-section-toolbar">
            <div className="admin-search-wrap">
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder="Search applications…"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
              />
            </div>
            <button className="admin-create-btn" onClick={() => setModal({ type: 'create-app' })}>
              <i className="fas fa-plus" /> New Application
            </button>
          </div>

          {appsLoading && (
            <div className="admin-loading"><div className="page-loader-spinner" /> Loading…</div>
          )}
          {appsError && <div className="form-status error">{appsError}</div>}
          {!appsLoading && !appsError && filteredApps.length === 0 && (
            <div className="admin-empty"><i className="fas fa-inbox" /> No job applications found.</div>
          )}

          <div className="admin-cards">
            {filteredApps.map((a) => (
              <div key={a.id} className="admin-record-card">
                <div className="admin-record-header">
                  <h3>{a.fullName}</h3>
                  <span className="admin-record-date">{fmtDate(a.createdAt)}</span>
                </div>
                <p className="admin-record-meta"><i className="fas fa-envelope" /> {a.email}</p>
                {a.phone && <p className="admin-record-meta"><i className="fas fa-phone" /> {a.phone}</p>}
                <p className="admin-record-meta"><i className="fas fa-briefcase" /> {a.position}</p>
                {a.coverLetter && <p className="admin-record-body">{a.coverLetter}</p>}
                <div className="admin-record-actions">
                  <button className="admin-action-btn edit" onClick={() => setModal({ type: 'edit-app', data: a })}>
                    <i className="fas fa-pen" /> Edit
                  </button>
                  <button className="admin-action-btn delete" onClick={() => deleteApplication(a.id)}>
                    <i className="fas fa-trash" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setModal(null)}>
              <i className="fas fa-times" />
            </button>

            {(modal.type === 'create-contact' || modal.type === 'edit-contact') && (
              <ContactForm
                initial={modal.type === 'edit-contact' ? modal.data : undefined}
                onDone={() => setModal(null)}
              />
            )}

            {(modal.type === 'create-app' || modal.type === 'edit-app') && (
              <ApplicationForm
                initial={modal.type === 'edit-app' ? modal.data : undefined}
                onDone={() => setModal(null)}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};

/* ================================================================
   CONTACT FORM (Create / Edit)
   ================================================================ */
interface ContactFormProps {
  initial?: ContactMessage;
  onDone: () => void;
}

const ContactForm: FC<ContactFormProps> = ({ initial, onDone }) => {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [subject, setSubject] = useState(initial?.subject ?? '');
  const [message, setMessage] = useState(initial?.message ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const sName = sanitize(name);
    const sEmail = sanitize(email);
    const sMsg = sanitize(message);

    if (sName.length < 2) { setError('Name must be at least 2 characters.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sEmail)) { setError('Enter a valid email.'); return; }
    if (sMsg.length < 10) { setError('Message must be at least 10 characters.'); return; }

    setSaving(true);
    setError('');
    try {
      const data = { name: sName, email: sEmail, subject: sanitize(subject), message: sMsg };
      if (isEdit) {
        await updateDoc(doc(firestore, 'contactMessages', initial.id), data);
        toast.success('Contact message updated');
      } else {
        await addDoc(collection(firestore, 'contactMessages'), { ...data, createdAt: serverTimestamp() });
        toast.success('Contact message created');
      }
      onDone();
    } catch {
      setError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-modal-form" onSubmit={handleSubmit} noValidate>
      <h2>{isEdit ? 'Edit Contact Message' : 'New Contact Message'}</h2>
      <div className="form-group">
        <label>Name *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Email *</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Subject</label>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Message *</label>
        <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
      </div>
      {error && <div className="form-status error">{error}</div>}
      <button type="submit" className="form-btn" disabled={saving}>
        {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'} <i className="fas fa-check" />
      </button>
    </form>
  );
};

/* ================================================================
   APPLICATION FORM (Create / Edit)
   ================================================================ */
interface ApplicationFormProps {
  initial?: JobApplication;
  onDone: () => void;
}

const ApplicationForm: FC<ApplicationFormProps> = ({ initial, onDone }) => {
  const isEdit = !!initial;
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [position, setPosition] = useState(initial?.position ?? '');
  const [coverLetter, setCoverLetter] = useState(initial?.coverLetter ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const sName = sanitize(fullName);
    const sEmail = sanitize(email);

    if (sName.length < 2) { setError('Full name must be at least 2 characters.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sEmail)) { setError('Enter a valid email.'); return; }
    if (!position) { setError('Select a position.'); return; }

    setSaving(true);
    setError('');
    try {
      const data = {
        fullName: sName,
        email: sEmail,
        phone: sanitize(phone),
        position,
        coverLetter: sanitize(coverLetter),
      };
      if (isEdit) {
        await updateDoc(doc(firestore, 'jobApplications', initial.id), data);
        toast.success('Application updated');
      } else {
        await addDoc(collection(firestore, 'jobApplications'), { ...data, createdAt: serverTimestamp() });
        toast.success('Application created');
      }
      onDone();
    } catch {
      setError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-modal-form" onSubmit={handleSubmit} noValidate>
      <h2>{isEdit ? 'Edit Application' : 'New Application'}</h2>
      <div className="form-group">
        <label>Full Name *</label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Email *</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Position *</label>
        <select value={position} onChange={(e) => setPosition(e.target.value)} required>
          <option value="">Select a position</option>
          {positions.map((p) => (
            <option key={p.value} value={p.value}>{p.title}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Cover Letter</label>
        <textarea rows={5} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
      </div>
      {error && <div className="form-status error">{error}</div>}
      <button type="submit" className="form-btn" disabled={saving}>
        {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'} <i className="fas fa-check" />
      </button>
    </form>
  );
};

export default AdminDashboardPage;
