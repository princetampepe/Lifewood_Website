import type { FC } from 'react';

/**
 * Skip-to-main-content link for keyboard / screen-reader users (WCAG 2.4.1).
 * Visually hidden until focused via Tab key.
 */
const SkipToMain: FC = () => (
  <a
    href="#main-content"
    className="skip-to-main"
    aria-label="Skip to main content"
  >
    Skip to main content
  </a>
);

export default SkipToMain;
