import { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './AdminUnlockPage.css';

const AdminUnlockPage: FC = () => {
  const navigate = useNavigate();
  const [secretKey, setSecretKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set your secret key here
  const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET || 'lifewood2024!';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (secretKey.trim() === ADMIN_SECRET_KEY) {
      // Store unlock status in sessionStorage (valid for this browser session)
      sessionStorage.setItem('admin_unlocked', 'true');
      toast.success('Access granted! Redirecting to admin login...');
      setTimeout(() => {
        navigate('/admin-login');
      }, 800);
    } else {
      toast.error('Invalid secret key. Please try again.');
      setSecretKey('');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="admin-unlock-container">
      <div className="admin-unlock-box">
        <div className="admin-unlock-header">
          <i className="fas fa-lock"></i>
          <h1>Admin Access</h1>
          <p>Enter the secret key to access admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-unlock-form">
          <div className="form-group">
            <label htmlFor="secretKey">Secret Key</label>
            <input
              id="secretKey"
              type="password"
              placeholder="Enter secret key..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            className="admin-unlock-btn"
            disabled={isSubmitting || !secretKey.trim()}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Verifying...
              </>
            ) : (
              <>
                <i className="fas fa-key"></i> Unlock
              </>
            )}
          </button>
        </form>

        <div className="admin-unlock-footer">
          <p>
            <i className="fas fa-info-circle"></i>
            Contact administrator if you forgot the secret key
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminUnlockPage;
