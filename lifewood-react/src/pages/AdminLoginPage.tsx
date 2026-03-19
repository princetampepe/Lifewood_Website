import { useState, type FC, type FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import SEOHead from '../components/SEOHead';

const AdminLoginPage: FC = () => {
  const { isAdmin, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="page-loader-spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  if (isAdmin) return <Navigate to="/admin" replace />;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-login-page">
      <SEOHead title="Admin Login" description="Lifewood Admin Login" canonical="/admin/login" />

      <div className="admin-login-card">
        <h1><i className="fas fa-lock" /> Admin Login</h1>
        <p>Sign in with your admin credentials.</p>

        <form onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label htmlFor="admin-email">Email</label>
            <input
              type="email"
              id="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fas fa-${showPassword ? 'eye' : 'eye-slash'}`} />
              </button>
            </div>
          </div>

          {error && <div className="form-status error">{error}</div>}

          <button type="submit" className="form-btn" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'} <i className="fas fa-sign-in-alt" />
          </button>
        </form>
      </div>
    </section>
  );
};

export default AdminLoginPage;
