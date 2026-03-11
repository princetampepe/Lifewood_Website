import type { FC } from 'react';
import { Link } from 'react-router-dom';
import AnimReveal from './AnimReveal';

interface RelatedLink {
  to: string;
  label: string;
  icon: string;
}

interface RelatedLinksProps {
  title?: string;
  links: RelatedLink[];
}

const RelatedLinks: FC<RelatedLinksProps> = ({
  title = 'Explore More',
  links,
}) => {
  return (
    <div className="related-links-section">
      <AnimReveal>
        <p className="related-links-title">{title}</p>
        <div className="related-links-grid">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="related-link-card">
              <i className={link.icon} aria-hidden="true" />
              {link.label}
              <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', opacity: 0.4, fontSize: '0.75rem' }} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </AnimReveal>
    </div>
  );
};

export default RelatedLinks;
