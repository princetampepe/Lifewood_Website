import { describe, it, expect } from 'vitest';
import { stats, partners, serviceCards, socialLinks, positions, officeLocations } from '../data/siteData';

describe('siteData', () => {
  it('has 4 stat items', () => {
    expect(stats).toHaveLength(4);
    stats.forEach((s) => {
      expect(s.value).toBeGreaterThan(0);
      expect(s.label).toBeTruthy();
    });
  });

  it('has partner logos with valid src and alt', () => {
    expect(partners.length).toBeGreaterThan(0);
    partners.forEach((p) => {
      expect(p.src).toBeTruthy();
      expect(p.alt).toBeTruthy();
    });
  });

  it('has 4 service cards', () => {
    expect(serviceCards).toHaveLength(4);
  });

  it('has social links', () => {
    expect(socialLinks.length).toBeGreaterThanOrEqual(3);
    socialLinks.forEach((s) => {
      expect(s.href).toMatch(/^https?:\/\//);
    });
  });

  it('has career positions', () => {
    expect(positions.length).toBeGreaterThan(0);
    positions.forEach((p) => {
      expect(p.title).toBeTruthy();
      expect(p.dept).toBeTruthy();
    });
  });

  it('has office locations with lat/lng', () => {
    expect(officeLocations.length).toBeGreaterThan(10);
    officeLocations.forEach((o) => {
      expect(o.lat).toBeDefined();
      expect(o.lng).toBeDefined();
      expect(o.name).toBeTruthy();
    });
  });
});
