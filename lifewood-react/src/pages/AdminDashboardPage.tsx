import { useState, useEffect, useMemo, useCallback, type FC, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, orderBy, query, type Timestamp,
} from 'firebase/firestore';
import { type User } from 'firebase/auth';
import { firestore } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { positions } from '../data/siteData';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

/* ── Types ── */
interface ContactMessage {
  id: string; name: string; email: string;
  subject: string; message: string; createdAt: Timestamp | null;
}

type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

interface JobApplication {
  id: string; fullName: string; email: string; phone: string;
  position: string; coverLetter: string; resumeUrl?: string; status: ApplicationStatus;
  statusUpdatedAt: Timestamp | null; emailSentAt: Timestamp | null; createdAt: Timestamp | null;
}

type SortOption = 'newest' | 'oldest';

interface ConfirmState {
  title: string; message: string; confirmLabel: string;
  danger?: boolean; onConfirm: () => void;
}

/* ── Helpers ── */
const sanitize = (s: string) => s.replace(/<[^>]*>/g, '').trim();
const fmtDate = (ts: Timestamp | null) => ts ? ts.toDate().toLocaleString() : '—';

const relativeTime = (ts: Timestamp | null): string => {
  if (!ts) return '—';
  const diff = Date.now() - ts.toDate().getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const AVATAR_COLORS = ['#1A3A2A', '#c0873a', '#27ae60', '#2980b9', '#8e44ad', '#e67e22', '#c0392b'];
const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getPositionTitle = (slug: string): string => {
  const pos = positions.find((p) => p.value === slug);
  return pos?.title ?? slug;
};

/* ── Avatar ── */
const Avatar: FC<{ name: string; size?: number }> = ({ name, size = 42 }) => (
  <div
    className="admin-avatar"
    style={{ width: size, height: size, background: getAvatarColor(name), fontSize: Math.round(size * 0.38) }}
  >
    {getInitials(name)}
  </div>
);

/* ── Confirm Modal ── */
const ConfirmModal: FC<ConfirmState & { onCancel: () => void }> = ({
  title, message, confirmLabel, danger, onConfirm, onCancel,
}) => {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onCancel]);

  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`admin-confirm-icon ${danger ? 'danger' : 'warning'}`}>
          <i className={`fas fa-${danger ? 'trash' : 'exclamation-triangle'}`} />
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="admin-confirm-actions">
          <button className="admin-confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className={`admin-confirm-ok ${danger ? 'danger' : ''}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   PROFILE MODAL
   ================================================================ */
const ProfileModal: FC<{ user: User | null; onClose: () => void }> = ({ user, onClose }) => {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="admin-modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        
        <div className="admin-profile-header">
          <Avatar name={user?.displayName || user?.email || 'Admin'} size={80} />
          <div className="admin-profile-info">
            <h2>{user?.displayName || 'Admin User'}</h2>
            <p className="admin-profile-email">{user?.email}</p>
          </div>
        </div>

        <div className="admin-profile-details">
          <div className="admin-profile-field">
            <label><i className="fas fa-envelope" /> Email</label>
            <p>{user?.email}</p>
          </div>
          {user?.displayName && (
            <div className="admin-profile-field">
              <label><i className="fas fa-user" /> Display Name</label>
              <p>{user.displayName}</p>
            </div>
          )}
          <div className="admin-profile-field">
            <label><i className="fas fa-key" /> Account Status</label>
            <p><span className="admin-profile-badge">Administrator</span></p>
          </div>
          {user?.emailVerified && (
            <div className="admin-profile-field">
              <label><i className="fas fa-check-circle" /> Email Verified</label>
              <p><span className="admin-profile-badge verified">Yes</span></p>
            </div>
          )}
        </div>

        <button className="admin-profile-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

/* ================================================================
   ADMIN DASHBOARD
   ================================================================ */
const AdminDashboardPage: FC = () => {
  const { logout, user } = useAuth();

  const [section, setSection] = useState<'contacts' | 'applications' | 'accepted' | 'rejected'>('contacts');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [contactSort, setContactSort] = useState<SortOption>('newest');

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState('');
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [appSort, setAppSort] = useState<SortOption>('newest');

  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const [modal, setModal] = useState<
    | { type: 'create-contact' }
    | { type: 'view-contact'; data: ContactMessage }
    | { type: 'reply-contact'; data: ContactMessage }
    | { type: 'create-app' }
    | { type: 'view-app'; data: JobApplication }
    | { type: 'review-app'; data: JobApplication; reviewStatus: 'accepted' | 'rejected' }
    | null
  >(null);

  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [updatingApps, setUpdatingApps] = useState<Set<string>>(new Set());

  /* ── ESC key ── */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmState) setConfirmState(null);
        else if (modal) setModal(null);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [modal, confirmState]);

  /* ── Real-time listeners ── */
  useEffect(() => {
    const q = query(collection(firestore, 'contactMessages'), orderBy('createdAt', 'desc'));
    return onSnapshot(q,
      (snap) => { setContacts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessage))); setContactsLoading(false); },
      (err) => { setContactsError(err.message); setContactsLoading(false); },
    );
  }, []);

  useEffect(() => {
    const q = query(collection(firestore, 'jobApplications'), orderBy('createdAt', 'desc'));
    return onSnapshot(q,
      (snap) => {
        setApplications(snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id, fullName: data.fullName ?? '', email: data.email ?? '',
            phone: data.phone ?? '', position: data.position ?? '',
            coverLetter: data.coverLetter ?? '', status: data.status ?? 'pending',
            statusUpdatedAt: data.statusUpdatedAt ?? null,
            emailSentAt: data.emailSentAt ?? null, createdAt: data.createdAt ?? null,
          } as JobApplication;
        }));
        setAppsLoading(false);
      },
      (err) => { setAppsError(err.message); setAppsLoading(false); },
    );
  }, []);

  /* ── Filtered + sorted lists ── */
  const filteredContacts = useMemo(() => {
    let result = contacts;
    if (contactSearch.trim()) {
      const q = contactSearch.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) || c.message.toLowerCase().includes(q),
      );
    }
    return contactSort === 'oldest' ? [...result].reverse() : result;
  }, [contacts, contactSearch, contactSort]);

  const filteredApps = useMemo(() => {
    let result = applications;
    if (appStatusFilter !== 'all') result = result.filter((a) => a.status === appStatusFilter);
    if (appSearch.trim()) {
      const q = appSearch.toLowerCase();
      result = result.filter((a) =>
        a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q) || a.phone.toLowerCase().includes(q),
      );
    }
    return appSort === 'oldest' ? [...result].reverse() : result;
  }, [applications, appSearch, appStatusFilter, appSort]);

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, accepted: 0, rejected: 0 };
    applications.forEach((a) => { if (a.status in counts) counts[a.status]++; });
    return counts;
  }, [applications]);

  const applicationsProcessed = useMemo(() => {
    let result = applications.filter((a) => a.status !== 'pending');
    if (appSearch.trim()) {
      const q = appSearch.toLowerCase();
      result = result.filter((a) =>
        a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q) || a.phone.toLowerCase().includes(q),
      );
    }
    return appSort === 'oldest' ? [...result].reverse() : result;
  }, [applications, appSearch, appSort]);

  const applicationsAccepted = useMemo(() => {
    let result = applications.filter((a) => a.status === 'accepted');
    if (appSearch.trim()) {
      const q = appSearch.toLowerCase();
      result = result.filter((a) =>
        a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q) || a.phone.toLowerCase().includes(q),
      );
    }
    return appSort === 'oldest' ? [...result].reverse() : result;
  }, [applications, appSearch, appSort]);

  const applicationsRejected = useMemo(() => {
    let result = applications.filter((a) => a.status === 'rejected');
    if (appSearch.trim()) {
      const q = appSearch.toLowerCase();
      result = result.filter((a) =>
        a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q) || a.phone.toLowerCase().includes(q),
      );
    }
    return appSort === 'oldest' ? [...result].reverse() : result;
  }, [applications, appSearch, appSort]);

  const toggleExpand = (id: string) => setExpandedCards((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const askConfirm = (state: ConfirmState) => setConfirmState(state);

  /* ── Delete handlers ── */
  const deleteContact = (id: string) => askConfirm({
    title: 'Delete Message', danger: true,
    message: 'Delete this contact message? This cannot be undone.',
    confirmLabel: 'Delete',
    onConfirm: async () => {
      setConfirmState(null);
      try { await deleteDoc(doc(firestore, 'contactMessages', id)); toast.success('Deleted'); }
      catch { toast.error('Failed to delete'); }
    },
  });

  const deleteApplication = (id: string) => askConfirm({
    title: 'Delete Application', danger: true,
    message: 'Delete this job application? This cannot be undone.',
    confirmLabel: 'Delete',
    onConfirm: async () => {
      setConfirmState(null);
      try { await deleteDoc(doc(firestore, 'jobApplications', id)); toast.success('Deleted'); }
      catch { toast.error('Failed to delete'); }
    },
  });

  /* ── Accept / Reject ── */
  const updateApplicationStatus = useCallback((app: JobApplication, newStatus: 'accepted' | 'rejected') => {
    setModal({ type: 'review-app', data: app, reviewStatus: newStatus });
  }, []);

  const confirmApplicationStatus = useCallback(async (app: JobApplication, newStatus: 'accepted' | 'rejected') => {
    const posTitle = getPositionTitle(app.position);
    setModal(null);
    setUpdatingApps((prev) => new Set(prev).add(app.id));
    const loadingToast = toast.loading(`${newStatus === 'accepted' ? 'Accepting' : 'Rejecting'} and sending email…`);
    try {
      await updateDoc(doc(firestore, 'jobApplications', app.id), { status: newStatus, statusUpdatedAt: serverTimestamp() });
      const emailRes = await fetch('/api/send-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: app.fullName, applicantEmail: app.email,
          position: posTitle, status: newStatus,
          applicationDate: app.createdAt?.toDate().toISOString() ?? null,
        }),
      });
      const emailData = await emailRes.json();
      if (!emailRes.ok) {
        toast.dismiss(loadingToast);
        toast.error(`Application ${newStatus} but email failed: ${emailData.details || emailData.error || 'Unknown error'}`, { duration: 8000 });
        return;
      }
      await updateDoc(doc(firestore, 'jobApplications', app.id), { emailSentAt: serverTimestamp() });
      toast.dismiss(loadingToast);
      toast.success(`Application ${newStatus}! Email sent to ${app.email}.`, { duration: 5000 });
    } catch {
      toast.dismiss(loadingToast);
      toast.error('Failed to update application status.');
    } finally {
      setUpdatingApps((prev) => { const next = new Set(prev); next.delete(app.id); return next; });
    }
  }, []);

  const navTo = (s: 'contacts' | 'applications' | 'accepted' | 'rejected') => { setSection(s); setSidebarOpen(false); };

  /* ── Render ── */
  return (
    <div className="admin-layout">
      <SEOHead title="Admin Dashboard" description="Lifewood Admin Dashboard" canonical="/admin" />
      <Helmet>
        <link rel="icon" href="/lifewood official logo/lifewood logo.png" type="image/png" />
      </Helmet>

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <img src="/lifewood official logo/lifewood logo.png" alt="Lifewood Logo" className="admin-sidebar-logo-img" />
          <div>
            <div className="admin-sidebar-title">Lifewood</div>
            <div className="admin-sidebar-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="admin-nav">
          <button className={`admin-nav-item ${section === 'contacts' ? 'active' : ''}`} onClick={() => navTo('contacts')}>
            <i className="fas fa-envelope" />
            <span>Contact Messages</span>
            <span className="admin-nav-count">{contacts.length}</span>
          </button>
          <button className={`admin-nav-item ${section === 'applications' ? 'active' : ''}`} onClick={() => navTo('applications')}>
            <i className="fas fa-briefcase" />
            <span>Job Applications</span>
            {statusCounts.pending > 0 && <span className="admin-nav-badge">{statusCounts.pending}</span>}
          </button>
          <button className={`admin-nav-item ${section === 'accepted' ? 'active' : ''}`} onClick={() => navTo('accepted')}>
            <i className="fas fa-check-circle" />
            <span>Accepted</span>
            {statusCounts.accepted > 0 && <span className="admin-nav-count">{statusCounts.accepted}</span>}
          </button>
          <button className={`admin-nav-item ${section === 'rejected' ? 'active' : ''}`} onClick={() => navTo('rejected')}>
            <i className="fas fa-times-circle" />
            <span>Rejected</span>
            {statusCounts.rejected > 0 && <span className="admin-nav-count">{statusCounts.rejected}</span>}
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-profile-btn" onClick={() => setShowProfile(true)} title="View Profile">
            <Avatar name={user?.displayName || user?.email || 'Admin'} size={36} />
            <span>{user?.email?.split('@')[0] || 'Admin'}</span>
          </button>
          <button className="admin-logout-btn" onClick={logout}>
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <main className="admin-main">

        {/* ── Topbar ── */}
        <div className="admin-topbar">
          <button className="admin-hamburger" onClick={() => setSidebarOpen(true)}>
            <i className="fas fa-bars" />
          </button>
          <h1 className="admin-topbar-title">
            {section === 'contacts' ? 'Contact Messages' : section === 'applications' ? 'Job Applications' : section === 'accepted' ? 'Accepted Applications' : 'Rejected Applications'}
          </h1>
          <div className="admin-topbar-stats">
            {section === 'applications' ? (
              <>
                <span className="admin-topbar-stat pending">{statusCounts.pending} pending</span>
                <span className="admin-topbar-stat accepted">{statusCounts.accepted} accepted</span>
                <span className="admin-topbar-stat rejected">{statusCounts.rejected} rejected</span>
              </>
            ) : section === 'accepted' ? (
              <span className="admin-topbar-stat accepted">{statusCounts.accepted} total</span>
            ) : section === 'rejected' ? (
              <span className="admin-topbar-stat rejected">{statusCounts.rejected} total</span>
            ) : (
              <span className="admin-topbar-stat total">{contacts.length} total</span>
            )}
          </div>
        </div>

        {/* ── Dashboard Overview ── */}
        <div className="admin-overview">
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3>Total Messages</h3>
                <i className="fas fa-envelope"></i>
              </div>
              <p className="admin-stat-value">{contacts.length}</p>
              <p className="admin-stat-label">Contact inquiries</p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3>Job Applications</h3>
                <i className="fas fa-briefcase"></i>
              </div>
              <p className="admin-stat-value">{applications.length}</p>
              <p className="admin-stat-label">{statusCounts.pending} pending</p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3>Approved</h3>
                <i className="fas fa-check-circle"></i>
              </div>
              <p className="admin-stat-value">{statusCounts.accepted}</p>
              <p className="admin-stat-label">Accepted applications</p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3>Rejected</h3>
                <i className="fas fa-times-circle"></i>
              </div>
              <p className="admin-stat-value">{statusCounts.rejected}</p>
              <p className="admin-stat-label">Not selected</p>
            </div>
          </div>
        </div>

        {/* ── CONTACTS ── */}
        {section === 'contacts' && (
          <div className="admin-section">
            <div className="admin-section-toolbar">
              <div className="admin-search-wrap">
                <i className="fas fa-search" />
                <input type="text" placeholder="Search messages…" value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} />
              </div>
              <select className="admin-sort-select" value={contactSort} onChange={(e) => setContactSort(e.target.value as SortOption)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <button className="admin-create-btn" onClick={() => setModal({ type: 'create-contact' })} style={{ display: 'none' }}>
                <i className="fas fa-plus" /> New
              </button>
            </div>

            {contactsLoading && <div className="admin-loading"><div className="page-loader-spinner" /> Loading…</div>}
            {contactsError && <div className="form-status error">{contactsError}</div>}
            {!contactsLoading && !contactsError && filteredContacts.length === 0 && (
              <div className="admin-empty"><i className="fas fa-inbox" /><p>No contact messages found.</p></div>
            )}

            <div className="admin-cards">
              {filteredContacts.map((c) => (
                <div key={c.id} className="admin-record-card" onClick={() => setModal({ type: 'view-contact', data: c })}>
                  <div className="admin-record-header">
                    <div className="admin-record-identity">
                      <Avatar name={c.name} />
                      <div>
                        <h3>{c.name}</h3>
                        <span className="admin-record-email">{c.email}</span>
                      </div>
                    </div>
                    <span className="admin-record-date" title={fmtDate(c.createdAt)}>{relativeTime(c.createdAt)}</span>
                  </div>
                  {c.subject && <p className="admin-record-meta"><i className="fas fa-tag" /> {c.subject}</p>}
                  <p className={`admin-record-body ${expandedCards.has(c.id) ? 'expanded' : ''}`}>{c.message}</p>
                  {c.message.length > 120 && (
                    <button className="admin-expand-btn" onClick={(e) => { e.stopPropagation(); toggleExpand(c.id); }}>
                      {expandedCards.has(c.id) ? 'Show less' : 'Read more'}
                    </button>
                  )}
                  <div className="admin-record-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="admin-action-btn delete" onClick={() => deleteContact(c.id)}>
                      <i className="fas fa-trash" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── APPLICATIONS ── */}
        {section === 'applications' && (
          <div className="admin-section">
            <div className="admin-section-toolbar">
              <div className="admin-search-wrap">
                <i className="fas fa-search" />
                <input type="text" placeholder="Search applications…" value={appSearch} onChange={(e) => setAppSearch(e.target.value)} />
              </div>
              <select className="admin-sort-select" value={appSort} onChange={(e) => setAppSort(e.target.value as SortOption)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <button className="admin-create-btn" onClick={() => setModal({ type: 'create-app' })} style={{ display: 'none' }}>
                <i className="fas fa-plus" /> New
              </button>
            </div>

            <div className="admin-status-filters">
              <button className={`admin-status-pill ${appStatusFilter === 'all' ? 'active' : ''}`} onClick={() => setAppStatusFilter('all')}>All ({applications.length})</button>
              <button className={`admin-status-pill pending ${appStatusFilter === 'pending' ? 'active' : ''}`} onClick={() => setAppStatusFilter('pending')}><i className="fas fa-clock" /> Pending ({statusCounts.pending})</button>
              <button className={`admin-status-pill accepted ${appStatusFilter === 'accepted' ? 'active' : ''}`} onClick={() => setAppStatusFilter('accepted')}><i className="fas fa-check-circle" /> Accepted ({statusCounts.accepted})</button>
              <button className={`admin-status-pill rejected ${appStatusFilter === 'rejected' ? 'active' : ''}`} onClick={() => setAppStatusFilter('rejected')}><i className="fas fa-times-circle" /> Rejected ({statusCounts.rejected})</button>
            </div>

            {appsLoading && <div className="admin-loading"><div className="page-loader-spinner" /> Loading…</div>}
            {appsError && <div className="form-status error">{appsError}</div>}
            {!appsLoading && !appsError && filteredApps.length === 0 && (
              <div className="admin-empty"><i className="fas fa-inbox" /><p>No job applications found.</p></div>
            )}

            <div className="admin-cards">
              {filteredApps.map((a) => {
                const isUpdating = updatingApps.has(a.id);
                return (
                  <div key={a.id} className={`admin-record-card app-status-${a.status}`} onClick={() => setModal({ type: 'view-app', data: a })}>
                    <div className="admin-record-header">
                      <div className="admin-record-identity">
                        <Avatar name={a.fullName} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <h3>{a.fullName}</h3>
                            <span className={`app-status-badge status-${a.status}`}>
                              {a.status === 'pending' && <><i className="fas fa-clock" /> Pending</>}
                              {a.status === 'accepted' && <><i className="fas fa-check-circle" /> Accepted</>}
                              {a.status === 'rejected' && <><i className="fas fa-times-circle" /> Rejected</>}
                            </span>
                          </div>
                          <span className="admin-record-email">{a.email}</span>
                        </div>
                      </div>
                      <span className="admin-record-date" title={fmtDate(a.createdAt)}>{relativeTime(a.createdAt)}</span>
                    </div>

                    {a.phone && <p className="admin-record-meta"><i className="fas fa-phone" /> {a.phone}</p>}
                    <p className="admin-record-meta"><i className="fas fa-briefcase" /> {getPositionTitle(a.position)}</p>

                    {a.coverLetter && (
                      <>
                        <p className={`admin-record-body ${expandedCards.has(a.id) ? 'expanded' : ''}`}>{a.coverLetter}</p>
                        {a.coverLetter.length > 120 && (
                          <button className="admin-expand-btn" onClick={(e) => { e.stopPropagation(); toggleExpand(a.id); }}>
                            {expandedCards.has(a.id) ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </>
                    )}

                    {a.status !== 'pending' && (
                      <p className="admin-email-status">
                        <i className="fas fa-paper-plane" />
                        {a.emailSentAt ? `Email sent ${relativeTime(a.emailSentAt)}` : 'Email not delivered'}
                      </p>
                    )}

                    <div className="admin-record-actions" onClick={(e) => e.stopPropagation()}>
                      {a.status === 'pending' && (
                        <>
                          <button className="admin-action-btn accept" disabled={isUpdating} onClick={() => updateApplicationStatus(a, 'accepted')}>
                            <i className="fas fa-check" /> {isUpdating ? '…' : 'Accept'}
                          </button>
                          <button className="admin-action-btn reject" disabled={isUpdating} onClick={() => updateApplicationStatus(a, 'rejected')}>
                            <i className="fas fa-times" /> {isUpdating ? '…' : 'Reject'}
                          </button>
                        </>
                      )}
                      <button className="admin-action-btn delete" onClick={() => deleteApplication(a.id)}>
                        <i className="fas fa-trash" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ACCEPTED APPLICATIONS ── */}
        {section === 'accepted' && (
          <div className="admin-section">
            <div className="admin-section-toolbar">
              <div className="admin-search-wrap">
                <i className="fas fa-search" />
                <input type="text" placeholder="Search accepted applications…" value={appSearch} onChange={(e) => setAppSearch(e.target.value)} />
              </div>
              <select className="admin-sort-select" value={appSort} onChange={(e) => setAppSort(e.target.value as SortOption)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            {appsLoading && <div className="admin-loading"><div className="page-loader-spinner" /> Loading…</div>}
            {appsError && <div className="form-status error">{appsError}</div>}
            {!appsLoading && !appsError && applicationsAccepted.length === 0 && (
              <div className="admin-empty"><i className="fas fa-inbox" /><p>No accepted applications yet.</p></div>
            )}

            <div className="admin-cards">
              {applicationsAccepted.map((a) => (
                <div key={a.id} className={`admin-record-card app-status-${a.status}`} onClick={() => setModal({ type: 'view-app', data: a })}>
                  <div className="admin-record-header">
                    <div className="admin-record-identity">
                      <Avatar name={a.fullName} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <h3>{a.fullName}</h3>
                          <span className={`app-status-badge status-${a.status}`}>
                            <i className="fas fa-check-circle" /> Accepted
                          </span>
                        </div>
                        <span className="admin-record-email">{a.email}</span>
                      </div>
                    </div>
                    <span className="admin-record-date" title={fmtDate(a.statusUpdatedAt)}>{relativeTime(a.statusUpdatedAt)}</span>
                  </div>

                  {a.phone && <p className="admin-record-meta"><i className="fas fa-phone" /> {a.phone}</p>}
                  <p className="admin-record-meta"><i className="fas fa-briefcase" /> {getPositionTitle(a.position)}</p>

                  <p className="admin-email-status">
                    <i className="fas fa-paper-plane" />
                    {a.emailSentAt ? `Email sent ${relativeTime(a.emailSentAt)}` : 'Email not delivered'}
                  </p>

                  <div className="admin-record-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="admin-action-btn delete" onClick={() => deleteApplication(a.id)}>
                      <i className="fas fa-trash" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REJECTED APPLICATIONS ── */}
        {section === 'rejected' && (
          <div className="admin-section">
            <div className="admin-section-toolbar">
              <div className="admin-search-wrap">
                <i className="fas fa-search" />
                <input type="text" placeholder="Search rejected applications…" value={appSearch} onChange={(e) => setAppSearch(e.target.value)} />
              </div>
              <select className="admin-sort-select" value={appSort} onChange={(e) => setAppSort(e.target.value as SortOption)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            {appsLoading && <div className="admin-loading"><div className="page-loader-spinner" /> Loading…</div>}
            {appsError && <div className="form-status error">{appsError}</div>}
            {!appsLoading && !appsError && applicationsRejected.length === 0 && (
              <div className="admin-empty"><i className="fas fa-inbox" /><p>No rejected applications yet.</p></div>
            )}

            <div className="admin-cards">
              {applicationsRejected.map((a) => (
                <div key={a.id} className={`admin-record-card app-status-${a.status}`} onClick={() => setModal({ type: 'view-app', data: a })}>
                  <div className="admin-record-header">
                    <div className="admin-record-identity">
                      <Avatar name={a.fullName} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <h3>{a.fullName}</h3>
                          <span className={`app-status-badge status-${a.status}`}>
                            <i className="fas fa-times-circle" /> Rejected
                          </span>
                        </div>
                        <span className="admin-record-email">{a.email}</span>
                      </div>
                    </div>
                    <span className="admin-record-date" title={fmtDate(a.statusUpdatedAt)}>{relativeTime(a.statusUpdatedAt)}</span>
                  </div>

                  {a.phone && <p className="admin-record-meta"><i className="fas fa-phone" /> {a.phone}</p>}
                  <p className="admin-record-meta"><i className="fas fa-briefcase" /> {getPositionTitle(a.position)}</p>

                  <p className="admin-email-status">
                    <i className="fas fa-paper-plane" />
                    {a.emailSentAt ? `Email sent ${relativeTime(a.emailSentAt)}` : 'Email not delivered'}
                  </p>

                  <div className="admin-record-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="admin-action-btn delete" onClick={() => deleteApplication(a.id)}>
                      <i className="fas fa-trash" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Confirm Modal ── */}
      {confirmState && <ConfirmModal {...confirmState} onCancel={() => setConfirmState(null)} />}

      {/* ── Profile Modal ── */}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}

      {/* ── Modals ── */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setModal(null)}><i className="fas fa-times" /></button>

            {modal.type === 'view-contact' && (
              <ContactDetailView data={modal.data} onReply={() => setModal({ type: 'reply-contact', data: modal.data })} />
            )}
            {modal.type === 'reply-contact' && (
              <ContactReplyForm data={modal.data} onDone={() => setModal(null)} />
            )}
            {modal.type === 'view-app' && (
              <AppDetailView data={modal.data} />
            )}
            {modal.type === 'review-app' && (
              <ApplicationReviewDialog data={modal.data} reviewStatus={modal.reviewStatus} onConfirm={confirmApplicationStatus} onCancel={() => setModal(null)} />
            )}
            {modal.type === 'create-contact' && (
              <ContactForm onDone={() => setModal(null)} />
            )}
            {modal.type === 'create-app' && (
              <ApplicationForm onDone={() => setModal(null)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ================================================================
   CONTACT DETAIL VIEW
   ================================================================ */
const ContactDetailView: FC<{ data: ContactMessage; onReply: () => void }> = ({ data, onReply }) => (
  <div className="admin-detail-view">
    <div className="admin-detail-header">
      <Avatar name={data.name} size={52} />
      <div>
        <h2>{data.name}</h2>
        <a href={`mailto:${data.email}`} className="admin-detail-email">{data.email}</a>
      </div>
    </div>
    {data.subject && (
      <div className="admin-detail-field">
        <label>Subject</label>
        <p>{data.subject}</p>
      </div>
    )}
    <div className="admin-detail-field">
      <label>Message</label>
      <p className="admin-detail-message">{data.message}</p>
    </div>
    <div className="admin-detail-field">
      <label>Received</label>
      <p>{fmtDate(data.createdAt)}</p>
    </div>
    <button onClick={onReply} style={{ marginTop: '16px', padding: '10px 16px', backgroundColor: '#D4A017', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
      <i className="fas fa-reply" /> Send Reply
    </button>
  </div>
);

/* ================================================================
   APP DETAIL VIEW
   ================================================================ */
const AppDetailView: FC<{ data: JobApplication }> = ({ data }) => (
  <div className="admin-detail-view">
    <div className="admin-detail-header">
      <Avatar name={data.fullName} size={52} />
      <div>
        <h2>{data.fullName}</h2>
        <span className={`app-status-badge status-${data.status}`} style={{ marginTop: '4px', display: 'inline-flex' }}>
          {data.status === 'pending' && <><i className="fas fa-clock" /> Pending</>}
          {data.status === 'accepted' && <><i className="fas fa-check-circle" /> Accepted</>}
          {data.status === 'rejected' && <><i className="fas fa-times-circle" /> Rejected</>}
        </span>
      </div>
    </div>
    <div className="admin-detail-grid">
      <div className="admin-detail-field">
        <label><i className="fas fa-envelope" /> Email</label>
        <a href={`mailto:${data.email}`} className="admin-detail-email">{data.email}</a>
      </div>
      {data.phone && (
        <div className="admin-detail-field">
          <label><i className="fas fa-phone" /> Phone</label>
          <p>{data.phone}</p>
        </div>
      )}
      <div className="admin-detail-field">
        <label><i className="fas fa-briefcase" /> Position</label>
        <p>{getPositionTitle(data.position)}</p>
      </div>
      <div className="admin-detail-field">
        <label><i className="fas fa-calendar" /> Applied</label>
        <p>{fmtDate(data.createdAt)}</p>
      </div>
      {data.status !== 'pending' && (
        <div className="admin-detail-field">
          <label><i className="fas fa-paper-plane" /> Email Sent</label>
          <p>{data.emailSentAt ? fmtDate(data.emailSentAt) : 'Not delivered'}</p>
        </div>
      )}
    </div>
    {data.coverLetter && (
      <div className="admin-detail-field" style={{ marginTop: '0.5rem' }}>
        <label><i className="fas fa-file-alt" /> Cover Letter</label>
        <p className="admin-detail-message">{data.coverLetter}</p>
      </div>
    )}
    {data.resumeUrl && (
      <div className="admin-detail-field" style={{ marginTop: '0.5rem' }}>
        <label><i className="fas fa-file" /> Resume / CV</label>
        <a href={data.resumeUrl} target="_blank" rel="noopener noreferrer" className="admin-file-link">
          <i className="fas fa-download" /> Download Resume
        </a>
      </div>
    )}
  </div>
);

/* ================================================================
   APPLICATION REVIEW DIALOG
   ================================================================ */
const ApplicationReviewDialog: FC<{ data: JobApplication; reviewStatus: 'accepted' | 'rejected'; onConfirm: (data: JobApplication, status: 'accepted' | 'rejected') => void; onCancel: () => void }> = ({ data, reviewStatus, onConfirm, onCancel }) => {
  const isAccepting = reviewStatus === 'accepted';
  const posTitle = getPositionTitle(data.position);
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await onConfirm(data, reviewStatus);
    setConfirming(false);
  };

  return (
    <div className="admin-detail-view">
      <div style={{ backgroundColor: isAccepting ? '#f0f8f4' : '#faf4f4', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: `2px solid ${isAccepting ? '#27ae60' : '#e74c3c'}` }}>
        <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px', color: isAccepting ? '#27ae60' : '#c0392b' }}>
          <i className={`fas fa-${isAccepting ? 'check-circle' : 'times-circle'}`} />
          {isAccepting ? 'Accept Application?' : 'Reject Application?'}
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          {isAccepting 
            ? `You are about to accept ${data.fullName}'s application for ${posTitle}. An acceptance email will be sent to their provided address.`
            : `You are about to reject ${data.fullName}'s application for ${posTitle}. A rejection notification email will be sent to their provided address.`
          }
        </p>
      </div>

      <div className="admin-detail-header">
        <Avatar name={data.fullName} size={52} />
        <div>
          <h2>{data.fullName}</h2>
          <span className={`app-status-badge status-pending`} style={{ marginTop: '4px', display: 'inline-flex' }}>
            <i className="fas fa-clock" /> Pending Review
          </span>
        </div>
      </div>

      <div className="admin-detail-grid">
        <div className="admin-detail-field">
          <label><i className="fas fa-envelope" /> Email</label>
          <a href={`mailto:${data.email}`} className="admin-detail-email">{data.email}</a>
        </div>
        {data.phone && (
          <div className="admin-detail-field">
            <label><i className="fas fa-phone" /> Phone</label>
            <p>{data.phone}</p>
          </div>
        )}
        <div className="admin-detail-field">
          <label><i className="fas fa-briefcase" /> Position</label>
          <p>{posTitle}</p>
        </div>
        <div className="admin-detail-field">
          <label><i className="fas fa-calendar" /> Applied</label>
          <p>{fmtDate(data.createdAt)}</p>
        </div>
      </div>

      {data.coverLetter && (
        <div className="admin-detail-field" style={{ marginTop: '0.5rem' }}>
          <label><i className="fas fa-file-alt" /> Cover Letter</label>
          <p className="admin-detail-message">{data.coverLetter}</p>
        </div>
      )}

      {data.resumeUrl && (
        <div className="admin-detail-field" style={{ marginTop: '0.5rem' }}>
          <label><i className="fas fa-file" /> Resume / CV</label>
          <a href={data.resumeUrl} target="_blank" rel="noopener noreferrer" className="admin-file-link">
            <i className="fas fa-download" /> Download Resume
          </a>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
        <button 
          onClick={onCancel} 
          disabled={confirming}
          style={{ flex: 1, minWidth: '120px', padding: '10px 16px', backgroundColor: '#f0f0f0', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'background 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
        >
          Go Back
        </button>
        <button 
          onClick={handleConfirm} 
          disabled={confirming}
          style={{ flex: 1, minWidth: '120px', padding: '10px 16px', backgroundColor: isAccepting ? '#27ae60' : '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'background 0.2s', opacity: confirming ? 0.7 : 1 }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isAccepting ? '#229954' : '#c0392b')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isAccepting ? '#27ae60' : '#e74c3c')}
        >
          {confirming ? 'Processing…' : (isAccepting ? 'Yes, Accept' : 'Yes, Reject')}
        </button>
      </div>
    </div>
  );
};

/* ================================================================
   CONTACT REPLY FORM
   ================================================================ */
const ContactReplyForm: FC<{ data: ContactMessage; onDone: () => void }> = ({ data, onDone }) => {
  const [subject, setSubject] = useState(`Re: ${data.subject || 'Your Message'}`);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError('Reply must be at least 10 characters.');
      return;
    }

    setSending(true);
    setError('');
    try {
      // Use Vercel API endpoint (or fallback to local in dev)
      const apiUrl = import.meta.env.PROD ? '/api/send-reply' : 'https://lifewood-website-sandy.vercel.app/api/send-reply';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: data.email,
          recipientName: data.name,
          subject,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        let errorData: any = {};
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: `Server error: ${response.statusText}` };
          }
        } else {
          errorData = { error: `Server error (${response.status}): ${response.statusText}` };
        }
        throw new Error(errorData.error || 'Failed to send email.');
      }

      toast.success('Reply sent successfully!');
      onDone();
    } catch (err: any) {
      setError(err.message || 'Failed to send reply.');
      console.error('Error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="admin-modal-form" onSubmit={handleSubmit} noValidate>
      <h2>Reply to {data.name}</h2>
      <div className="form-group">
        <label>To</label>
        <input type="email" value={data.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
      </div>
      <div className="form-group">
        <label>Subject</label>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Message *</label>
        <textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Type your reply here..." />
      </div>
      {error && <div className="form-status error">{error}</div>}
      <button type="submit" className="form-btn" disabled={sending}>
        {sending ? 'Sending…' : 'Send Reply'} <i className="fas fa-paper-plane" />
      </button>
    </form>
  );
};

/* ================================================================
   CONTACT FORM
   ================================================================ */
const ContactForm: FC<{ onDone: () => void }> = ({ onDone }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const sName = sanitize(name), sEmail = sanitize(email), sMsg = sanitize(message);
    if (sName.length < 2) { setError('Name must be at least 2 characters.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sEmail)) { setError('Enter a valid email.'); return; }
    if (sMsg.length < 10) { setError('Message must be at least 10 characters.'); return; }
    setSaving(true); setError('');
    try {
      const data = { name: sName, email: sEmail, subject: sanitize(subject), message: sMsg };
      await addDoc(collection(firestore, 'contactMessages'), { ...data, createdAt: serverTimestamp() });
      toast.success('Message added');
      onDone();
    } catch { setError('Failed to save. Try again.'); }
    finally { setSaving(false); }
  };

  return (
    <form className="admin-modal-form" onSubmit={handleSubmit} noValidate>
      <h2>New Contact Message</h2>
      <div className="form-group"><label>Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div className="form-group"><label>Email *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      <div className="form-group"><label>Subject</label><input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
      <div className="form-group"><label>Message *</label><textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required /></div>
      {error && <div className="form-status error">{error}</div>}
      <button type="submit" className="form-btn" disabled={saving}>{saving ? 'Saving…' : 'Create'} <i className="fas fa-check" /></button>
    </form>
  );
};

/* ================================================================
   APPLICATION FORM
   ================================================================ */
const ApplicationForm: FC<{ onDone: () => void }> = ({ onDone }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const sName = sanitize(fullName), sEmail = sanitize(email);
    if (sName.length < 2) { setError('Full name must be at least 2 characters.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sEmail)) { setError('Enter a valid email.'); return; }
    if (!position) { setError('Select a position.'); return; }
    setSaving(true); setError('');
    try {
      const data = { fullName: sName, email: sEmail, phone: sanitize(phone), position, coverLetter: sanitize(coverLetter) };
      await addDoc(collection(firestore, 'jobApplications'), { ...data, status: 'pending', statusUpdatedAt: null, emailSentAt: null, createdAt: serverTimestamp() });
      toast.success('Application created');
      onDone();
    } catch { setError('Failed to save. Try again.'); }
    finally { setSaving(false); }
  };

  return (
    <form className="admin-modal-form" onSubmit={handleSubmit} noValidate>
      <h2>New Application</h2>
      <div className="form-group"><label>Full Name *</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
      <div className="form-group"><label>Email *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      <div className="form-group"><label>Phone</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      <div className="form-group">
        <label>Position *</label>
        <select value={position} onChange={(e) => setPosition(e.target.value)} required>
          <option value="">Select a position</option>
          {positions.map((p) => <option key={p.value} value={p.value}>{p.title}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Cover Letter</label><textarea rows={5} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} /></div>
      {error && <div className="form-status error">{error}</div>}
      <button type="submit" className="form-btn" disabled={saving}>{saving ? 'Saving…' : 'Create'} <i className="fas fa-check" /></button>
    </form>
  );
};

export default AdminDashboardPage;
