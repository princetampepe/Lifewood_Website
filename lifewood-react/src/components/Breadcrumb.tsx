import type { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ROUTE_LABELS: Record<string, string> = {
  '/about': 'About Us',
  '/ai-data-services': 'AI Data Services',
  '/ai-projects': 'AI Projects',
  '/offices': 'Offices',
  '/type-a': 'Type A — Data Servicing',
  '/type-b': 'Type B — Horizontal LLM Data',
  '/type-c': 'Type C — Vertical LLM Data',
  '/type-d': 'Type D — AIGC',
  '/philanthropy': 'Philanthropy & Impact',
  '/careers': 'Careers',
  '/contact': 'Contact Us',
  '/internal-news': 'Internal News',
  '/privacy-policy': 'Privacy Policy',
  '/cookie-policy': 'Cookie Policy',
  '/terms-conditions': 'Terms & Conditions',
};

const Breadcrumb: FC = () => {
  const location = useLocation();

  // Don't show on homepage
  if (location.pathname === '/') return null;

  const label = ROUTE_LABELS[location.pathname];
  if (!label) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link">
            <i className="fas fa-home" aria-hidden="true" /> Home
          </Link>
        </li>
        <li className="breadcrumb-separator" aria-hidden="true">
          <i className="fas fa-chevron-right" />
        </li>
        <li className="breadcrumb-item breadcrumb-current" aria-current="page">
          {label}
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumb;
