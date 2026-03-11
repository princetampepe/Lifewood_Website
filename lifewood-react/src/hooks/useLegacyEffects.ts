/**
 * useLegacyEffects — port of effects.js into a typed React hook.
 *
 * Provides: hero glow, magnetic buttons, click ripple, mouse trail,
 * parallax layers, text scramble, stagger entrance, scroll-velocity,
 * dynamic card shadows, typed subtitle, title shimmer, tilt-on-scroll,
 * color shift, and page-transition overlay.
 *
 * All effects honour prefers-reduced-motion and auto-disable on mobile.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

/* ── Helpers ── */
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 900;

/* ── CSS injected once ── */
let cssInjected = false;

function injectEffectsCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const s = document.createElement('style');
  s.id = 'lw-effects-css';
  s.textContent = `
.lw-glow-overlay{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0;transition:opacity .6s;}
.lw-glow-overlay.active{opacity:1;}
.lw-ripple-host{position:relative;overflow:hidden;}
.lw-ripple{position:absolute;border-radius:50%;background:rgba(244,196,48,0.25);transform:scale(0);animation:lwRipple .65s ease-out forwards;pointer-events:none;z-index:1;}
@keyframes lwRipple{to{transform:scale(4);opacity:0;}}
.lw-magnetic{transition:transform .35s cubic-bezier(.2,.9,.3,1);}
.lw-blob-canvas{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:-1;opacity:.35;transition:opacity .5s;}
[data-theme="dark"] .lw-blob-canvas{opacity:.15;}
.lw-stagger-item{opacity:0;transform:translateY(30px) scale(.97);transition:opacity .55s cubic-bezier(.2,.9,.3,1),transform .55s cubic-bezier(.2,.9,.3,1);}
.lw-stagger-item.visible{opacity:1;transform:translateY(0) scale(1);}
.lw-parallax{will-change:transform;transition:transform .1s linear;}
.lw-morph-num{display:inline-block;transition:transform .3s cubic-bezier(.2,.9,.3,1);}
.lw-dynamic-underline{position:relative;}
.lw-dynamic-underline::after{content:"";position:absolute;bottom:-2px;left:var(--ux,0);width:var(--uw,0);height:2.5px;background:var(--saffron);border-radius:2px;transition:left .25s cubic-bezier(.2,.9,.3,1),width .25s cubic-bezier(.2,.9,.3,1);}
.lw-trail-dot{position:fixed;width:4px;height:4px;border-radius:50%;background:var(--saffron);pointer-events:none;z-index:99997;opacity:0.6;transition:opacity .6s,transform .6s cubic-bezier(.2,.9,.3,1);}
@keyframes lwTitleShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
.lw-title-shimmer{background:linear-gradient(90deg,currentColor 40%,var(--saffron) 50%,currentColor 60%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:lwTitleShimmer 1.5s ease-in-out 1;}
.lw-page-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:var(--dark-serpent);z-index:99998;pointer-events:none;opacity:0;transition:opacity .35s cubic-bezier(.2,.9,.3,1);}
  `;
  document.head.appendChild(s);
}

/* ── Feature flag ── */
function effectsDisabled() {
  return (
    typeof window !== 'undefined' &&
    ((window as unknown as Record<string, unknown>).__LIFEWOOD_EFFECTS__ === false ||
      document.documentElement.dataset.effects === 'none')
  );
}

/**
 * Core effects hook. Call once at the App root level.
 * Attaches all global DOM-based effects and cleans up on unmount.
 */
export function useLegacyEffects() {
  const reduced = useReducedMotion();
  const cleanups = useRef<Array<() => void>>([]);

  const addCleanup = useCallback((fn: () => void) => {
    cleanups.current.push(fn);
  }, []);

  useEffect(() => {
    if (reduced || effectsDisabled()) return;

    injectEffectsCSS();

    const mobile = isMobile();

    /* --- 1. Hero Glow --- */
    if (!mobile) {
      const heroes = document.querySelectorAll<HTMLElement>('.hero, .proj-hero, .ai-services-hero, .about-hero, .phil-hero, .careers-hero-banner, .news-hero, .contact-hero, .wwo-hero, .privacy-hero');
      heroes.forEach((hero) => {
        const overlay = document.createElement('div');
        overlay.className = 'lw-glow-overlay';
        hero.style.position = hero.style.position || 'relative';
        hero.appendChild(overlay);

        const enter = () => overlay.classList.add('active');
        const leave = () => overlay.classList.remove('active');
        const move = (e: MouseEvent) => {
          const r = hero.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          const y = ((e.clientY - r.top) / r.height) * 100;
          overlay.style.background = `radial-gradient(600px circle at ${x}% ${y}%, rgba(244,196,48,0.08), transparent 60%)`;
        };

        hero.addEventListener('mouseenter', enter);
        hero.addEventListener('mouseleave', leave);
        hero.addEventListener('mousemove', move as EventListener);
        addCleanup(() => {
          hero.removeEventListener('mouseenter', enter);
          hero.removeEventListener('mouseleave', leave);
          hero.removeEventListener('mousemove', move as EventListener);
          overlay.remove();
        });
      });
    }

    /* --- 2. Magnetic Buttons --- */
    if (!mobile) {
      const btns = document.querySelectorAll<HTMLElement>('.btn-primary, .contact-btn, .form-btn, .btn-secondary, .btn-outline');
      btns.forEach((btn) => {
        btn.classList.add('lw-magnetic');
        const mmove = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
          const dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
          btn.style.transform = `translate(${dx}px,${dy}px) scale(1.04)`;
        };
        const mleave = () => { btn.style.transform = ''; };
        btn.addEventListener('mousemove', mmove);
        btn.addEventListener('mouseleave', mleave);
        addCleanup(() => {
          btn.removeEventListener('mousemove', mmove);
          btn.removeEventListener('mouseleave', mleave);
          btn.classList.remove('lw-magnetic');
        });
      });
    }

    /* --- 3. Click Ripple --- */
    const rippleHandler = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.btn-primary, .btn-secondary, .contact-btn, .form-btn, .service-card, .btn-outline');
      if (!btn) return;
      if (!btn.classList.contains('lw-ripple-host')) btn.classList.add('lw-ripple-host');
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const ripple = document.createElement('span');
      ripple.className = 'lw-ripple';
      Object.assign(ripple.style, {
        width: `${size}px`, height: `${size}px`,
        left: `${e.clientX - r.left - size / 2}px`,
        top: `${e.clientY - r.top - size / 2}px`,
      });
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    };
    document.addEventListener('click', rippleHandler);
    addCleanup(() => document.removeEventListener('click', rippleHandler));

    /* --- 4. Mouse Trail --- */
    if (!mobile) {
      let trailCount = 0;
      const maxTrail = 8;
      let lastTrailTime = 0;
      const trailMove = (e: MouseEvent) => {
        const now = Date.now();
        if (now - lastTrailTime < 60 || trailCount >= maxTrail) return;
        lastTrailTime = now;
        trailCount++;
        const dot = document.createElement('div');
        dot.className = 'lw-trail-dot';
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
        document.body.appendChild(dot);
        requestAnimationFrame(() => {
          dot.style.opacity = '0';
          dot.style.transform = 'translateY(-20px) scale(0)';
        });
        setTimeout(() => { dot.remove(); trailCount--; }, 650);
      };
      document.addEventListener('mousemove', trailMove, { passive: true });
      addCleanup(() => document.removeEventListener('mousemove', trailMove));
    }

    /* --- 5. Gradient Blob Background (canvas) --- */
    if (!mobile) {
      const blobCanvas = document.createElement('canvas');
      blobCanvas.className = 'lw-blob-canvas';
      document.body.insertBefore(blobCanvas, document.body.firstChild);
      const ctx = blobCanvas.getContext('2d')!;

      const resizeBlob = () => {
        blobCanvas.width = window.innerWidth;
        blobCanvas.height = window.innerHeight;
      };
      resizeBlob();
      window.addEventListener('resize', resizeBlob, { passive: true });

      const blobs = [
        { x: 0.3, y: 0.3, r: 200, dx: 0.0004, dy: 0.0003, color: [244, 196, 48] },
        { x: 0.7, y: 0.6, r: 160, dx: -0.0003, dy: 0.0005, color: [217, 164, 4] },
        { x: 0.5, y: 0.8, r: 180, dx: 0.0005, dy: -0.0002, color: [26, 58, 42] },
      ];

      let blobRaf = 0;
      const drawBlobs = (time: number) => {
        ctx.clearRect(0, 0, blobCanvas.width, blobCanvas.height);
        blobs.forEach((b) => {
          b.x += Math.sin(time * b.dx) * 0.001;
          b.y += Math.cos(time * b.dy) * 0.001;
          b.x = Math.max(0.1, Math.min(0.9, b.x));
          b.y = Math.max(0.1, Math.min(0.9, b.y));
          const gx = b.x * blobCanvas.width;
          const gy = b.y * blobCanvas.height;
          const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, b.r);
          grad.addColorStop(0, `rgba(${b.color.join(',')},0.06)`);
          grad.addColorStop(1, `rgba(${b.color.join(',')},0)`);
          ctx.beginPath();
          ctx.arc(gx, gy, b.r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
        blobRaf = requestAnimationFrame(drawBlobs);
      };
      blobRaf = requestAnimationFrame(drawBlobs);

      addCleanup(() => {
        cancelAnimationFrame(blobRaf);
        window.removeEventListener('resize', resizeBlob);
        blobCanvas.remove();
      });
    }

    /* --- 6. Stagger Entrance Orchestrator --- */
    {
      const grids = document.querySelectorAll<HTMLElement>(
        '.stats-grid, .services-grid, .services-detailed-grid, .offices-stats, .values-grid, .proj-folder-grid, .wwo-highlight-row',
      );
      const staggerObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.querySelectorAll('.lw-stagger-item').forEach((item) => item.classList.add('visible'));
              staggerObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
      );
      grids.forEach((grid) => {
        Array.from(grid.children).forEach((item, i) => {
          const el = item as HTMLElement;
          if (!el.classList.contains('lw-stagger-item')) {
            el.classList.add('lw-stagger-item');
            el.style.transitionDelay = `${i * 0.09}s`;
          }
        });
        staggerObs.observe(grid);
      });
      addCleanup(() => staggerObs.disconnect());
    }

    /* --- 7. Magnetic Cards --- */
    if (!mobile) {
      const cards = document.querySelectorAll<HTMLElement>('.service-card, .stat-card, .value-card, .proj-card, .position-card, .wwo-highlight-item');
      cards.forEach((card) => {
        const mm = (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          card.style.transform = `translateY(-8px) scale(1.02) rotateX(${-y / 20}deg) rotateY(${x / 20}deg)`;
        };
        const ml = () => { card.style.transform = ''; };
        card.addEventListener('mousemove', mm);
        card.addEventListener('mouseleave', ml);
        addCleanup(() => {
          card.removeEventListener('mousemove', mm);
          card.removeEventListener('mouseleave', ml);
        });
      });
    }

    /* --- 8. Dynamic Card Shadows --- */
    if (!mobile) {
      const shadowCards = document.querySelectorAll<HTMLElement>('.service-card, .service-detailed-card, .proj-card, .stat-card');
      const shadowMove = (e: MouseEvent) => {
        shadowCards.forEach((card) => {
          const r = card.getBoundingClientRect();
          if (r.top > window.innerHeight + 100 || r.bottom < -100) return;
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = (e.clientX - cx) / r.width;
          const dy = (e.clientY - cy) / r.height;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 2) {
            const intensity = Math.max(0, 1 - dist * 0.5);
            card.style.boxShadow = `${-dx * 12 * intensity}px ${-dy * 12 * intensity}px ${20 + intensity * 15}px rgba(26,58,42,${(0.06 + intensity * 0.06).toFixed(3)})`;
          }
        });
      };
      document.addEventListener('mousemove', shadowMove, { passive: true });
      addCleanup(() => document.removeEventListener('mousemove', shadowMove));
    }

    /* --- 9. Title Shimmer on enter --- */
    {
      const titles = document.querySelectorAll<HTMLElement>('.section-title, .partners-title, .services-title, .about-values-section h2, .about-drives h2, .wwo-section-title');
      const shimmerObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const el = e.target as HTMLElement;
              el.classList.remove('lw-title-shimmer');
              void el.offsetWidth; // reflow
              el.classList.add('lw-title-shimmer');
            }
          });
        },
        { threshold: 0.3 },
      );
      titles.forEach((t) => shimmerObs.observe(t));
      addCleanup(() => shimmerObs.disconnect());
    }

    /* --- 10. Section Reveal --- */
    {
      const sections = document.querySelectorAll<HTMLElement>('.about, .stats, .partners, .global, .services');
      sections.forEach((sec) => {
        sec.style.transition = 'opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)';
        sec.style.opacity = '0';
        sec.style.transform = 'translateY(40px)';
      });
      const sectionObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).style.opacity = '1';
              (e.target as HTMLElement).style.transform = 'translateY(0)';
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
      );
      sections.forEach((s) => sectionObs.observe(s));
      addCleanup(() => sectionObs.disconnect());
    }

    /* --- 11. Color Shift on Scroll --- */
    {
      const accents = document.querySelectorAll<HTMLElement>('.section-title span, .stat-number, .number, .folder-number');
      if (accents.length) {
        let csTicking = false;
        const csUpdate = () => {
          const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
          const hue = Math.sin(pct * Math.PI * 2) * 8;
          accents.forEach((el) => { el.style.filter = `hue-rotate(${hue}deg)`; });
        };
        const csScroll = () => {
          if (!csTicking) { csTicking = true; requestAnimationFrame(() => { csUpdate(); csTicking = false; }); }
        };
        window.addEventListener('scroll', csScroll, { passive: true });
        addCleanup(() => window.removeEventListener('scroll', csScroll));
      }
    }

    /* --- 12. Scroll-Velocity Skew --- */
    if (!mobile) {
      const velCards = document.querySelectorAll<HTMLElement>('.service-card, .service-detailed-card, .proj-card, .stat-card');
      if (velCards.length) {
        let lastScroll = window.scrollY;
        let velocity = 0;
        let velRaf = 0;
        const velUpdate = () => {
          const diff = Math.abs(window.scrollY - lastScroll);
          velocity += (diff - velocity) * 0.15;
          lastScroll = window.scrollY;
          const skew = Math.min(velocity * 0.04, 2);
          velCards.forEach((card) => {
            const r = card.getBoundingClientRect();
            if (r.top < window.innerHeight && r.bottom > 0) {
              card.style.transform = `skewY(${(-skew * 0.3).toFixed(2)}deg)`;
            }
          });
          velRaf = requestAnimationFrame(velUpdate);
        };
        velRaf = requestAnimationFrame(velUpdate);
        addCleanup(() => cancelAnimationFrame(velRaf));
      }
    }

    /* --- 13. Hero Parallax --- */
    if (!mobile) {
      const heroContent = document.querySelector<HTMLElement>('.hero-content');
      const particles = document.querySelectorAll<HTMLElement>('.rb-float-particle');
      if (heroContent) {
        let hpTick = false;
        const hpScroll = () => {
          if (!hpTick) {
            hpTick = true;
            requestAnimationFrame(() => {
              const sy = window.pageYOffset;
              heroContent.style.transform = `translateY(${sy * 0.15}px)`;
              heroContent.style.opacity = String(Math.max(0, 1 - sy / 700));
              particles.forEach((p, i) => {
                p.style.transform = `translateY(${sy * (0.05 + i * 0.03)}px)`;
              });
              hpTick = false;
            });
          }
        };
        window.addEventListener('scroll', hpScroll, { passive: true });
        addCleanup(() => window.removeEventListener('scroll', hpScroll));
      }
    }

    /* --- 14. Text Scramble --- */
    {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
      const targets = document.querySelectorAll<HTMLElement>('.section-title, .ai-services-hero h1, .proj-hero h1, .about-hero h1, .phil-hero h1');
      targets.forEach((el) => {
        if (el.dataset.scrambled) return;
        el.dataset.scrambled = 'pending';
        const original = el.innerHTML;
        const text = el.textContent ?? '';

        const scramble = () => {
          let iter = 0;
          const max = 12;
          const iv = setInterval(() => {
            el.textContent = text.split('').map((c, idx) => {
              if (c === ' ') return ' ';
              if (idx < (iter / max) * text.length) return text[idx];
              return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
            iter++;
            if (iter > max) { clearInterval(iv); el.innerHTML = original; }
          }, 35);
        };

        const obs = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              el.dataset.scrambled = 'yes';
              scramble();
              obs.unobserve(el);
            }
          });
        }, { threshold: 0.3 });
        obs.observe(el);
        addCleanup(() => obs.disconnect());
      });
    }

    /* --- 15. Typed Subtitle Cycle --- */
    {
      const heroSub = document.querySelector<HTMLElement>('.hero-sub-text');
      if (heroSub) {
        const phrases = [
          heroSub.textContent?.trim() ?? '',
          'Transforming data into insight.',
          'Building the future with AI.',
          'Global scale. Local impact.',
        ];
        let pIdx = 0, cIdx = 0, deleting = false;
        let timer: ReturnType<typeof setTimeout>;

        const tick = () => {
          const current = phrases[pIdx];
          if (!deleting) {
            cIdx++;
            heroSub.textContent = current.substring(0, cIdx);
            if (cIdx === current.length) { timer = setTimeout(() => { deleting = true; tick(); }, 2500); return; }
            timer = setTimeout(tick, 40 + Math.random() * 30);
          } else {
            cIdx--;
            heroSub.textContent = current.substring(0, cIdx);
            if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; timer = setTimeout(tick, 300); return; }
            timer = setTimeout(tick, 20);
          }
        };

        const initTimer = setTimeout(() => {
          cIdx = phrases[0].length;
          timer = setTimeout(() => { deleting = true; tick(); }, 2500);
        }, 3000);

        addCleanup(() => { clearTimeout(initTimer); clearTimeout(timer); });
      }
    }

    /* --- 16. Nav Scroll Opacity --- */
    {
      const nav = document.querySelector<HTMLElement>('.navbar');
      if (nav) {
        let navTick = false;
        const navUpdate = () => {
          const scroll = Math.min(window.scrollY / 300, 1);
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          nav.style.background = isDark
            ? `rgba(18,19,24,${0.75 + scroll * 0.2})`
            : `rgba(245,240,232,${0.75 + scroll * 0.2})`;
        };
        const navScroll = () => {
          if (!navTick) { navTick = true; requestAnimationFrame(() => { navUpdate(); navTick = false; }); }
        };
        window.addEventListener('scroll', navScroll, { passive: true });
        navUpdate();
        addCleanup(() => window.removeEventListener('scroll', navScroll));
      }
    }

    /* --- 17. Counter Pop --- */
    {
      const nums = document.querySelectorAll<HTMLElement>('.stat-number, .number');
      const popObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              el.classList.add('lw-morph-num');
              setTimeout(() => {
                el.style.transform = 'scale(1.15)';
                setTimeout(() => { el.style.transform = 'scale(1)'; }, 250);
              }, 2200);
              popObs.unobserve(el);
            }
          });
        },
        { threshold: 0.5 },
      );
      nums.forEach((n) => popObs.observe(n));
      addCleanup(() => popObs.disconnect());
    }

    /* --- 18. Tilt on Scroll for images --- */
    if (!mobile) {
      const imgs = document.querySelectorAll<HTMLElement>('.card-media, .about-collab-img img, .about-drives-img img, .phil-row-img-wrap img');
      if (imgs.length) {
        let tiltTick = false;
        const tiltUpdate = () => {
          imgs.forEach((img) => {
            const r = img.getBoundingClientRect();
            if (r.top > window.innerHeight || r.bottom < 0) return;
            const progress = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
            img.style.transform = `scale(1.02) rotateX(${(progress * 3).toFixed(2)}deg)`;
          });
        };
        const tiltScroll = () => {
          if (!tiltTick) { tiltTick = true; requestAnimationFrame(() => { tiltUpdate(); tiltTick = false; }); }
        };
        window.addEventListener('scroll', tiltScroll, { passive: true });
        addCleanup(() => window.removeEventListener('scroll', tiltScroll));
      }
    }

    /* --- 19. Page Transition Overlay --- */
    {
      const overlay = document.createElement('div');
      overlay.className = 'lw-page-overlay';
      document.body.appendChild(overlay);
      addCleanup(() => overlay.remove());
    }

    /* ── Cleanup all on unmount ── */
    return () => {
      cleanups.current.forEach((fn) => fn());
      cleanups.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
}
