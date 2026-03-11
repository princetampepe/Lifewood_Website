/* =================================================================
   LIFEWOOD — JavaScript-Driven Dynamic Effects Engine
   Shared across all pages (index.html, ai-projects.html, etc.)
   ================================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.innerWidth < 900;
  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  /* ----------------------------------------------------------------
     0. UTILITY — Inject required CSS for JS-driven effects
     ---------------------------------------------------------------- */
  (function injectCSS() {
    var style = document.createElement('style');
    style.textContent = [
      /* Hero gradient glow */
      '.lw-glow-overlay{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0;transition:opacity .6s;}',
      '.lw-glow-overlay.active{opacity:1;}',
      /* Ripple */
      '.lw-ripple-host{position:relative;overflow:hidden;}',
      '.lw-ripple{position:absolute;border-radius:50%;background:rgba(244,196,48,0.25);transform:scale(0);animation:lwRipple .65s ease-out forwards;pointer-events:none;z-index:1;}',
      '@keyframes lwRipple{to{transform:scale(4);opacity:0;}}',
      /* Magnetic wrapper */
      '.lw-magnetic{transition:transform .35s cubic-bezier(.2,.9,.3,1);}',
      /* Text scramble */
      '.lw-scramble-char{display:inline-block;transition:opacity .15s;}',
      /* Floating gradient blobs */
      '.lw-blob-canvas{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:-1;opacity:.35;transition:opacity .5s;}',
      '[data-theme="dark"] .lw-blob-canvas{opacity:.15;}',
      /* Scroll-velocity shadow */
      '.lw-velocity-shadow{transition:box-shadow .4s cubic-bezier(.2,.9,.3,1),transform .4s cubic-bezier(.2,.9,.3,1);}',
      /* Staggered entrance */
      '.lw-stagger-item{opacity:0;transform:translateY(30px) scale(.97);transition:opacity .55s cubic-bezier(.2,.9,.3,1),transform .55s cubic-bezier(.2,.9,.3,1);}',
      '.lw-stagger-item.visible{opacity:1;transform:translateY(0) scale(1);}',
      /* Parallax layer */
      '.lw-parallax{will-change:transform;transition:transform .1s linear;}',
      /* Smooth number morph */
      '.lw-morph-num{display:inline-block;transition:transform .3s cubic-bezier(.2,.9,.3,1);}',
      /* Dynamic underline */
      '.lw-dynamic-underline{position:relative;}',
      '.lw-dynamic-underline::after{content:"";position:absolute;bottom:-2px;left:var(--ux,0);width:var(--uw,0);height:2.5px;background:var(--saffron);border-radius:2px;transition:left .25s cubic-bezier(.2,.9,.3,1),width .25s cubic-bezier(.2,.9,.3,1);}',
    ].join('\n');
    document.head.appendChild(style);
  })();

  /* ----------------------------------------------------------------
     1. MOUSE POSITION TRACKER (used by heroGlow and other effects)
     ---------------------------------------------------------------- */
  (function mouseTracker() {
    if (isMobile || reduced) return;
    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });
  })();

  /* ----------------------------------------------------------------
     2. HERO MOUSE-FOLLOWING GRADIENT GLOW
     ---------------------------------------------------------------- */
  (function heroGlow() {
    if (isMobile || reduced) return;

    var heroes = document.querySelectorAll('.hero, .proj-hero, .ai-services-hero');
    heroes.forEach(function (hero) {
      var overlay = document.createElement('div');
      overlay.className = 'lw-glow-overlay';
      hero.style.position = hero.style.position || 'relative';
      hero.appendChild(overlay);

      hero.addEventListener('mouseenter', function () {
        overlay.classList.add('active');
      });
      hero.addEventListener('mouseleave', function () {
        overlay.classList.remove('active');
      });

      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 100;
        var y = ((e.clientY - r.top) / r.height) * 100;
        overlay.style.background =
          'radial-gradient(600px circle at ' + x + '% ' + y + '%, rgba(244,196,48,0.08), transparent 60%)';
      });
    });
  })();

  /* ----------------------------------------------------------------
     3. MAGNETIC BUTTONS
     Buttons subtly pull toward cursor when mouse is near
     ---------------------------------------------------------------- */
  (function magneticButtons() {
    if (isMobile || reduced) return;

    var btns = document.querySelectorAll('.btn-primary, .contact-btn, .form-btn, .btn-secondary, .ai-services-cta-btn, .proj-cta-btn');
    btns.forEach(function (btn) {
      btn.classList.add('lw-magnetic');

      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = (e.clientX - cx) * 0.25;
        var dy = (e.clientY - cy) * 0.25;
        btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.04)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  })();

  /* ----------------------------------------------------------------
     4. CLICK RIPPLE EFFECT on buttons
     ---------------------------------------------------------------- */
  (function rippleEffect() {
    if (reduced) return;

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-primary, .btn-secondary, .contact-btn, .form-btn, .ai-services-cta-btn, .proj-cta-btn, .service-card');
      if (!btn) return;

      if (!btn.classList.contains('lw-ripple-host')) {
        btn.classList.add('lw-ripple-host');
      }

      var r = btn.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 2;
      var ripple = document.createElement('span');
      ripple.className = 'lw-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
      btn.appendChild(ripple);

      ripple.addEventListener('animationend', function () {
        ripple.remove();
      });
    });
  })();

  /* ----------------------------------------------------------------
     5. TEXT SCRAMBLE REVEAL
     Headings "scramble" through random chars before resolving
     ---------------------------------------------------------------- */
  (function textScramble() {
    if (reduced) return;

    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    var targets = document.querySelectorAll('.section-title, .section-header h1, .ai-services-hero h1, .proj-hero h1');

    targets.forEach(function (el) {
      if (el.dataset.scrambled) return;
      el.dataset.scrambled = 'pending';

      var originalHTML = el.innerHTML;
      var textContent = el.textContent;

      function scramble() {
        var iterations = 0;
        var maxIterations = 12;
        var interval = setInterval(function () {
          el.textContent = textContent.split('').map(function (char, idx) {
            if (char === ' ') return ' ';
            if (idx < (iterations / maxIterations) * textContent.length) return textContent[idx];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('');
          iterations++;
          if (iterations > maxIterations) {
            clearInterval(interval);
            el.innerHTML = originalHTML; // Restore original HTML with spans etc.
          }
        }, 35);
      }

      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              el.dataset.scrambled = 'yes';
              scramble();
              obs.unobserve(el);
            }
          });
        }, { threshold: 0.3 });
        obs.observe(el);
      }
    });
  })();

  /* ----------------------------------------------------------------
     6. SCROLL-DRIVEN PARALLAX LAYERS
     Elements with data-parallax="0.2" move at 20% scroll speed
     Auto-applied to decorative elements
     ---------------------------------------------------------------- */
  (function parallaxLayers() {
    if (isMobile || reduced) return;

    // Auto-tag certain elements for parallax
    var autoParallax = [
      { sel: '.hero h1', speed: 0.08 },
      { sel: '.hero .hero-sub', speed: 0.04 },
      { sel: '.proj-hero h1', speed: 0.08 },
      { sel: '.global h2', speed: 0.06 },
      { sel: '.stat-card', speed: 0.03 },
    ];

    autoParallax.forEach(function (cfg) {
      document.querySelectorAll(cfg.sel).forEach(function (el) {
        el.dataset.parallax = cfg.speed;
        el.classList.add('lw-parallax');
      });
    });

    var elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length) return;

    function update() {
      var scrollY = window.scrollY;
      elements.forEach(function (el) {
        var speed = parseFloat(el.dataset.parallax) || 0.1;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var offset = (center - window.innerHeight / 2) * speed;
        el.style.transform = 'translateY(' + (-offset) + 'px)';
      });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          update();
          ticking = false;
        });
      }
    }, { passive: true });
    update();
  })();

  /* ----------------------------------------------------------------
     7. FLOATING GRADIENT BLOB BACKGROUND (canvas)
     Animated organic-looking gradient blobs behind content
     ---------------------------------------------------------------- */
  (function gradientBlobs() {
    if (isMobile || reduced) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'lw-blob-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var blobs = [
      { x: 0.3, y: 0.3, r: 200, dx: 0.0004, dy: 0.0003, color: [244, 196, 48] },
      { x: 0.7, y: 0.6, r: 160, dx: -0.0003, dy: 0.0005, color: [217, 164, 4] },
      { x: 0.5, y: 0.8, r: 180, dx: 0.0005, dy: -0.0002, color: [26, 58, 42] },
    ];

    function draw(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      blobs.forEach(function (b) {
        // Gentle motion
        b.x += Math.sin(time * b.dx) * 0.001;
        b.y += Math.cos(time * b.dy) * 0.001;

        // Keep in bounds
        if (b.x < 0.1) b.x = 0.1;
        if (b.x > 0.9) b.x = 0.9;
        if (b.y < 0.1) b.y = 0.1;
        if (b.y > 0.9) b.y = 0.9;

        var gx = b.x * canvas.width;
        var gy = b.y * canvas.height;
        var grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, b.r);
        grad.addColorStop(0, 'rgba(' + b.color.join(',') + ',0.06)');
        grad.addColorStop(1, 'rgba(' + b.color.join(',') + ',0)');

        ctx.beginPath();
        ctx.arc(gx, gy, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  /* ----------------------------------------------------------------
     8. SCROLL-VELOCITY EFFECTS on cards
     Faster scroll → cards get subtle motion blur / shadow boost
     ---------------------------------------------------------------- */
  (function scrollVelocity() {
    if (isMobile || reduced) return;

    var cards = document.querySelectorAll('.service-card, .service-detailed-card, .impact-card, .proj-card, .stat-card, .office-stat');
    if (!cards.length) return;

    var lastScroll = window.scrollY;
    var velocity = 0;

    function update() {
      var diff = Math.abs(window.scrollY - lastScroll);
      velocity += (diff - velocity) * 0.15;
      lastScroll = window.scrollY;

      var skew = Math.min(velocity * 0.04, 2);
      var shadow = Math.min(velocity * 0.3, 20);

      cards.forEach(function (card) {
        if (card.getBoundingClientRect().top < window.innerHeight && card.getBoundingClientRect().bottom > 0) {
          card.style.transform = 'skewY(' + (-skew * 0.3) + 'deg)';
          card.style.boxShadow = '0 ' + (4 + shadow * 0.4) + 'px ' + (12 + shadow) + 'px rgba(26,58,42,' + (0.06 + shadow * 0.002) + ')';
        }
      });

      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  })();

  /* ----------------------------------------------------------------
     9. DYNAMIC STAGGERED ENTRANCE ORCHESTRATOR
     JS-calculated stagger timing per grid item
     ---------------------------------------------------------------- */
  (function staggerOrchestrator() {
    if (reduced) return;

    var grids = document.querySelectorAll('.stats-grid, .services-grid, .services-detailed-grid, .offices-stats, .philanthropy-grid, .proj-cards-grid');

    grids.forEach(function (grid) {
      var items = grid.children;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item.classList.contains('lw-stagger-item')) {
          item.classList.add('lw-stagger-item');
          item.style.transitionDelay = (i * 0.09) + 's';
        }
      }
    });

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var items = entry.target.querySelectorAll('.lw-stagger-item');
            items.forEach(function (item) {
              item.classList.add('visible');
            });
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

      grids.forEach(function (grid) { obs.observe(grid); });
    }
  })();

  /* ----------------------------------------------------------------
     10. DYNAMIC UNDERLINE FOLLOW on nav links
     The underline follows the hovered link's width & position
     ---------------------------------------------------------------- */
  (function dynamicNav() {
    if (isMobile) return;

    var navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    var links = navMenu.querySelectorAll(':scope > a, :scope > .dropdown > a');
    links.forEach(function (link) {
      link.classList.add('lw-dynamic-underline');

      link.addEventListener('mouseenter', function () {
        var r = link.getBoundingClientRect();
        var nr = navMenu.getBoundingClientRect();
        link.style.setProperty('--ux', '0px');
        link.style.setProperty('--uw', r.width + 'px');
      });
      link.addEventListener('mouseleave', function () {
        link.style.setProperty('--uw', '0px');
      });
    });
  })();

  /* ----------------------------------------------------------------
     11. SMOOTH SCROLL-LINKED NAVBAR OPACITY
     Navbar background opacity dynamically tied to scroll position
     ---------------------------------------------------------------- */
  (function navScrollOpacity() {
    var nav = document.querySelector('.navbar');
    if (!nav) return;

    function update() {
      var scroll = Math.min(window.scrollY / 300, 1);
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        nav.style.background = 'rgba(18,19,24,' + (0.75 + scroll * 0.2) + ')';
      } else {
        nav.style.background = 'rgba(245,240,232,' + (0.75 + scroll * 0.2) + ')';
      }
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () { update(); ticking = false; });
      }
    }, { passive: true });
    update();

    // Update on dark mode toggle
    var toggle = document.getElementById('darkModeToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        setTimeout(update, 50);
      });
    }
  })();

  /* ----------------------------------------------------------------
     12. TILT-ON-SCROLL for images
     Images tilt slightly based on their scroll position
     ---------------------------------------------------------------- */
  (function tiltOnScroll() {
    if (isMobile || reduced) return;

    var images = document.querySelectorAll('.service-card-img img, .proj-card-img img, .gen-card-img img, .partner-img img');
    if (!images.length) return;

    function update() {
      images.forEach(function (img) {
        var rect = img.getBoundingClientRect();
        if (rect.top > window.innerHeight || rect.bottom < 0) return;
        var progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        var rotate = progress * 3; // subtle tilt
        img.style.transform = 'scale(1.02) rotateX(' + rotate + 'deg)';
      });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () { update(); ticking = false; });
      }
    }, { passive: true });
    update();
  })();

  /* ----------------------------------------------------------------
     13. COLOR SHIFT ON SCROLL
     Certain accent elements subtly shift hue as user scrolls
     ---------------------------------------------------------------- */
  (function colorShift() {
    if (reduced) return;

    var accents = document.querySelectorAll('.section-title span, .service-card-badge, .proj-card-number, .stat-number, .number');
    if (!accents.length) return;

    function update() {
      var scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      var hueShift = Math.sin(scrollPct * Math.PI * 2) * 8; // subtle ±8deg shift
      accents.forEach(function (el) {
        el.style.filter = 'hue-rotate(' + hueShift + 'deg)';
      });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () { update(); ticking = false; });
      }
    }, { passive: true });
  })();

  /* ----------------------------------------------------------------
     14. DYNAMIC SHADOW ON MOUSE PROXIMITY for cards
     Card shadow direction follows cursor position
     ---------------------------------------------------------------- */
  (function dynamicShadow() {
    if (isMobile || reduced) return;

    var cards = document.querySelectorAll('.service-card, .service-detailed-card, .impact-card, .proj-card, .gen-card, .careers-card');
    if (!cards.length) return;

    document.addEventListener('mousemove', function (e) {
      cards.forEach(function (card) {
        var rect = card.getBoundingClientRect();
        // Only process if card is somewhat visible
        if (rect.top > window.innerHeight + 100 || rect.bottom < -100) return;

        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) / rect.width;
        var dy = (e.clientY - cy) / rect.height;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
          var shadowX = -dx * 12;
          var shadowY = -dy * 12;
          var intensity = Math.max(0, 1 - dist * 0.5);
          card.style.boxShadow =
            shadowX * intensity + 'px ' +
            shadowY * intensity + 'px ' +
            (20 + intensity * 15) + 'px ' +
            'rgba(26,58,42,' + (0.06 + intensity * 0.06) + ')';
        }
      });
    }, { passive: true });
  })();

  /* ----------------------------------------------------------------
     15. TYPED SUBTITLE CYCLE (for hero subtitles)
     Cycles through different taglines with typing effect
     ---------------------------------------------------------------- */
  (function typedSubtitle() {
    if (reduced) return;

    var heroSub = document.querySelector('.hero-sub');
    if (!heroSub) return;

    var phrases = [
      heroSub.textContent.trim(),
      'Transforming data into insight.',
      'Building the future with AI.',
      'Global scale. Local impact.',
    ];
    var phraseIdx = 0;
    var charIdx = 0;
    var deleting = false;
    var pauseTime = 2500;

    function tick() {
      var current = phrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        heroSub.textContent = current.substring(0, charIdx);
        if (charIdx === current.length) {
          setTimeout(function () { deleting = true; tick(); }, pauseTime);
          return;
        }
        setTimeout(tick, 40 + Math.random() * 30);
      } else {
        charIdx--;
        heroSub.textContent = current.substring(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(tick, 300);
          return;
        }
        setTimeout(tick, 20);
      }
    }

    // Start after initial delay
    setTimeout(function () {
      charIdx = phrases[0].length;
      setTimeout(function () { deleting = true; tick(); }, pauseTime);
    }, 3000);
  })();

  /* ----------------------------------------------------------------
     16. SMOOTH PAGE TRANSITION OVERLAY
     Brief overlay flash when navigating between SPA pages
     ---------------------------------------------------------------- */
  (function pageTransitionOverlay() {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:var(--dark-serpent);z-index:99998;pointer-events:none;opacity:0;transition:opacity .35s cubic-bezier(.2,.9,.3,1);';
    document.body.appendChild(overlay);

    // Hook into showPage if it exists
    if (typeof window.showPage === 'function') {
      var original = window.showPage;
      window.showPage = function (pageId) {
        overlay.style.opacity = '0.15';
        setTimeout(function () {
          original(pageId);
          setTimeout(function () { overlay.style.opacity = '0'; }, 100);
        }, 150);
      };
    }
  })();

  /* ----------------------------------------------------------------
     17. MOUSE TRAIL (subtle sparkle dots on mousemove)
     ---------------------------------------------------------------- */
  (function mouseTrail() {
    if (isMobile || reduced) return;

    var trailCount = 0;
    var maxTrail = 8;
    var lastTime = 0;

    document.addEventListener('mousemove', function (e) {
      var now = Date.now();
      if (now - lastTime < 60) return; // throttle
      lastTime = now;

      if (trailCount >= maxTrail) return;
      trailCount++;

      var dot = document.createElement('div');
      dot.style.cssText =
        'position:fixed;width:4px;height:4px;border-radius:50%;' +
        'background:var(--saffron);pointer-events:none;z-index:99997;' +
        'left:' + e.clientX + 'px;top:' + e.clientY + 'px;' +
        'opacity:0.6;transition:opacity .6s,transform .6s cubic-bezier(.2,.9,.3,1);';
      document.body.appendChild(dot);

      requestAnimationFrame(function () {
        dot.style.opacity = '0';
        dot.style.transform = 'translateY(-20px) scale(0)';
      });

      setTimeout(function () {
        dot.remove();
        trailCount--;
      }, 650);
    }, { passive: true });
  })();

  /* ----------------------------------------------------------------
     18. INTERSECTION-BASED COUNTER WITH EASING (re-triggerable)
     Enhanced version that works alongside existing counters
     Adds a "pop" scale animation when number finishes
     ---------------------------------------------------------------- */
  (function counterPop() {
    if (reduced) return;

    var nums = document.querySelectorAll('.stat-number, .number');
    nums.forEach(function (el) {
      if (el.dataset.popDone) return;
      el.dataset.popDone = 'pending';
      el.classList.add('lw-morph-num');

      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              // Add a pop after the counter finishes (~2s)
              setTimeout(function () {
                el.style.transform = 'scale(1.15)';
                setTimeout(function () {
                  el.style.transform = 'scale(1)';
                }, 250);
              }, 2200);
              el.dataset.popDone = 'yes';
              obs.unobserve(el);
            }
          });
        }, { threshold: 0.5 });
        obs.observe(el);
      }
    });
  })();

  /* ----------------------------------------------------------------
     INIT LOGGING (dev only — remove for production)
     ---------------------------------------------------------------- */
  console.log('%c✦ Lifewood Effects Engine loaded', 'color:#F4C430;font-weight:bold;font-size:12px;');

  /* ----------------------------------------------------------------
     19. SMOOTH PARALLAX SCROLL FOR HERO ELEMENTS
     Gives a subtle depth effect as the user scrolls.
     ---------------------------------------------------------------- */
  (function heroParallax() {
    if (isMobile || reduced) return;
    var heroContent = document.querySelector('.hero-content');
    var particles = document.querySelectorAll('.rb-float-particle');
    if (!heroContent) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollY = window.pageYOffset;
          // Hero text moves slightly slower (parallax)
          heroContent.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
          heroContent.style.opacity = Math.max(0, 1 - scrollY / 700);
          // Particles move at different speeds for depth
          particles.forEach(function (p, i) {
            var speed = 0.05 + (i * 0.03);
            p.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  })();

  /* ----------------------------------------------------------------
     20. SMOOTH SECTION REVEAL — sections fade/slide gracefully
     Re-triggerable: elements animate in and out as they enter/leave
     ---------------------------------------------------------------- */
  (function sectionReveal() {
    if (reduced) return;

    var sections = document.querySelectorAll('.about, .stats, .partners, .global, .services');
    if (!('IntersectionObserver' in window) || !sections.length) return;

    sections.forEach(function (sec) {
      sec.style.transition = 'opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)';
      sec.style.opacity = '0';
      sec.style.transform = 'translateY(40px)';
    });

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        } else {
          e.target.style.opacity = '0';
          e.target.style.transform = 'translateY(40px)';
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

    sections.forEach(function (sec) { obs.observe(sec); });
  })();

  /* ----------------------------------------------------------------
     21. MAGNETIC HOVER EFFECT FOR SERVICE CARDS
     Cards subtly follow the cursor when hovered.
     ---------------------------------------------------------------- */
  (function magneticCards() {
    if (isMobile || reduced) return;

    document.querySelectorAll('.service-card, .stat-card, .value-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        card.style.transform = 'translateY(-8px) scale(1.02) rotateX(' + (-y / 20) + 'deg) rotateY(' + (x / 20) + 'deg)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  })();

  /* ----------------------------------------------------------------
     22. TEXT SHIMMER ON SECTION TITLES
     A golden shimmer sweeps across titles when they enter the viewport.
     ---------------------------------------------------------------- */
  (function titleShimmer() {
    if (reduced) return;

    var titles = document.querySelectorAll('.section-title, .partners-title, .services-title');
    if (!('IntersectionObserver' in window) || !titles.length) return;

    var shimmerCSS = document.createElement('style');
    shimmerCSS.textContent =
      '@keyframes lwTitleShimmer{' +
        '0%{background-position:-200% center;}' +
        '100%{background-position:200% center;}' +
      '}' +
      '.lw-title-shimmer{' +
        'background:linear-gradient(90deg,currentColor 40%,var(--saffron) 50%,currentColor 60%);' +
        'background-size:200% auto;' +
        '-webkit-background-clip:text;' +
        'background-clip:text;' +
        '-webkit-text-fill-color:transparent;' +
        'animation:lwTitleShimmer 1.5s ease-in-out 1;' +
      '}';
    document.head.appendChild(shimmerCSS);

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.remove('lw-title-shimmer');
          // Force reflow to restart animation
          void e.target.offsetWidth;
          e.target.classList.add('lw-title-shimmer');
        }
      });
    }, { threshold: 0.3 });

    titles.forEach(function (t) { obs.observe(t); });
  })();

})();
