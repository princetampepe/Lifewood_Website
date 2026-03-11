import { useEffect, useRef, type FC } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AnimReveal from '../components/AnimReveal';
import BlurText from '../components/BlurText';
import CountUpStat from '../components/CountUpStat';
import { officeLocations } from '../data/siteData';
import SEOHead from '../components/SEOHead';
import YouTubeEmbed from '../components/YouTubeEmbed';

const OfficesPage: FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [25, 15],
      zoom: 2,
      scrollWheelZoom: false,   // enabled only when user clicks into map
      zoomControl: true,
      doubleClickZoom: true,
      dragging: true,
      touchZoom: 'center',
      boxZoom: true,
      keyboard: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Enable scroll-zoom only while the user is interacting with the map
    const el = mapRef.current;
    const enableScroll  = () => map.scrollWheelZoom.enable();
    const disableScroll = () => map.scrollWheelZoom.disable();
    el.addEventListener('mouseenter', enableScroll);
    el.addEventListener('mouseleave', disableScroll);
    el.addEventListener('touchstart', enableScroll,  { passive: true });
    el.addEventListener('touchend',   disableScroll, { passive: true });

    const pinIcon = L.divIcon({
      className: 'lw-map-pin',
      html: `<svg width="24" height="36" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#D4A017"/><circle cx="12" cy="12" r="5" fill="#fff"/></svg>`,
      iconSize: [24, 36],
      iconAnchor: [12, 36],
      popupAnchor: [0, -36],
    });

    officeLocations.forEach((loc) => {
      L.marker([loc.lat, loc.lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(
          `<div class="lw-popup">
            <img class="lw-popup-flag" src="https://flagcdn.com/w80/${loc.code}.png" alt="${loc.name} flag" />
            <span class="lw-popup-name">${loc.name}</span>
          </div>`,
          { minWidth: 140, maxWidth: 200, className: 'lw-popup-wrap' }
        );
    });

    mapInstance.current = map;

    // Fix map size on load
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      el.removeEventListener('mouseenter', enableScroll);
      el.removeEventListener('mouseleave', disableScroll);
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <section className="offices-page">
      <SEOHead title="Our Offices" description="Lifewood operates 40+ delivery centers in 30+ countries worldwide. Explore our global presence." canonical="/offices" />
      {/* ── Main two-column layout ── */}
      <div className="offices-layout">

        {/* Left – heading + map */}
        <div className="offices-left">
          <BlurText
            text="Largest Global Data Collection Resources Distribution"
            delay={100}
            animateBy="words"
            direction="top"
            className="offices-heading-blur"
          />
          <AnimReveal>
            <div className="offices-map-wrap">
              <div className="offices-map-hint">
                <i className="fas fa-hand-pointer" /> Pinch to zoom &nbsp;·&nbsp; Drag to pan
              </div>
              <div id="officesMap" ref={mapRef} className="offices-map-canvas" />
            </div>
          </AnimReveal>
        </div>

        {/* Right – rotating badge + stats card */}
        <div className="offices-right">
          <div className="offices-badge-wrap">
            <svg className="offices-badge-ring" viewBox="0 0 120 120" width="90" height="90">
              <defs>
                <path id="circlePath" d="M60,60 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" />
              </defs>
              <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(212,160,23,0.18)" strokeWidth="1.5" />
              <circle cx="60" cy="60" r="12" fill="#D4A017" />
              <text fontSize="10.5" fontWeight="700" fill="#1A3A2A" letterSpacing="2.5">
                <textPath href="#circlePath">BE AMAZED • BE AMAZED • </textPath>
              </text>
            </svg>
            <span className="offices-badge-arrow">↓</span>
          </div>

          <AnimReveal>
            <div className="offices-stats-card">
              <div className="offices-stat-item">
                <div className="offices-stat-number">
                  <CountUpStat value={56788} format suffix="" duration={2200} />
                </div>
                <div className="offices-stat-label">Online Resources</div>
              </div>
              <div className="offices-stat-divider" />
              <div className="offices-stat-item">
                <div className="offices-stat-number">
                  <CountUpStat value={30} suffix=" +" duration={1600} />
                </div>
                <div className="offices-stat-label">Countries</div>
              </div>
              <div className="offices-stat-divider" />
              <div className="offices-stat-item">
                <div className="offices-stat-number">
                  <CountUpStat value={40} suffix=" +" duration={1600} />
                </div>
                <div className="offices-stat-label">Centers</div>
              </div>
            </div>
          </AnimReveal>
        </div>
      </div>

      {/* ── Video ── */}
      <YouTubeEmbed videoId="3-FgnVjYJVA" title="Lifewood Global Offices" heading="Inside Our Offices" />

      {/* ── Marquee ── */}
      <div className="offices-marquee-strip">
        <div className="offices-marquee-track">
          {[...officeLocations, ...officeLocations].map((loc, i) => (
            <span key={i} className="offices-marquee-item">
              <img
                src={`https://flagcdn.com/w40/${loc.code}.png`}
                width="24"
                height="16"
                alt={loc.name}
                className="offices-marquee-flag-img"
              />
              {loc.name}
              <span className="offices-marquee-dot">•</span>
            </span>
          ))}
        </div>
      </div>

    </section>
  );
};

export default OfficesPage;
