import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

/* ── Component imports ── */
import Footer from '../components/Footer';
import SkipToMain from '../components/SkipToMain';
import SEOHead from '../components/SEOHead';

/* Helper: render with Router + Helmet wrappers */
function renderWith(ui: React.ReactElement) {
  return render(
    <HelmetProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </HelmetProvider>,
  );
}

describe('SkipToMain', () => {
  it('renders a skip-to-main link', () => {
    const { container } = renderWith(<SkipToMain />);
    const link = container.querySelector('a.skip-to-main');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('#main-content');
    expect(link?.textContent).toBe('Skip to main content');
  });
});

describe('Footer', () => {
  it('renders copyright text', () => {
    const { container } = renderWith(<Footer />);
    expect(container.textContent).toContain('Lifewood Data Technology');
  });

  it('renders social links', () => {
    const { container } = renderWith(<Footer />);
    expect(container.textContent).toContain('LinkedIn');
    expect(container.textContent).toContain('Facebook');
  });

  it('renders footer navigation', () => {
    const { container } = renderWith(<Footer />);
    expect(container.textContent).toContain('About Us');
    expect(container.textContent).toContain('AI Data Services');
    expect(container.textContent).toContain('Philanthropy');
  });
});

describe('SEOHead', () => {
  it('renders without crashing', () => {
    renderWith(<SEOHead title="Test Page" description="Test description" />);
    // Helmet injects into <head> asynchronously; just verify no throw
    expect(true).toBe(true);
  });
});
