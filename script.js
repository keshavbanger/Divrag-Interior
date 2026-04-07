(() => {
  'use strict';

  // ========================
  // CUSTOM CURSOR (PREMIUM)
  // ========================
  const cursor = document.createElement('div');
  cursor.className = 'cb-cursor';
  cursor.innerHTML = '<div class="cb-cursor-text"></div>';
  document.body.appendChild(cursor);

  const cursorText = cursor.querySelector('.cb-cursor-text');
  
  let mouseX = 0, mouseY = 0;
  let posX = 0, posY = 0;

  // Faster Lerp - n=0.25 for snappier response
  const lerp = (a, b, n) => (1 - n) * a + n * b;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const updateCursor = () => {
    posX = lerp(posX, mouseX, 0.25);
    posY = lerp(posY, mouseY, 0.25);
    cursor.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
    requestAnimationFrame(updateCursor);
  };
  updateCursor();

  // Mouse leave/enter window
  document.addEventListener('mouseleave', () => cursor.classList.add('-hidden'));
  document.addEventListener('mouseenter', () => cursor.classList.remove('-hidden'));

  // Hover Interactions
  const updateHovers = () => {
    const interactive = 'a, button, input, textarea, .filter-btn, .play-circle, .hamburger';
    const textTarget = 'h1, h2, h3, h4, h5, h6, p, .body-text, span, .logo-text, .nav-links a, .stat-num, .stat-label';
    const imgTarget = 'img, .project-img-wrap, .blog-thumb, .services-imgs, .testi-image';

    document.addEventListener('mouseover', e => {
      const t = e.target;
      
      // 1. Interactive Hiding (Precision mode)
      if (t.classList.contains('hamburger') || t.closest('button, input, textarea')) {
        cursor.classList.add('-hidden');
        return;
      }

      // 2. Image View Label
      const img = t.closest(imgTarget);
      if (img) {
        cursor.classList.add('-image-hover');
        cursor.style.mixBlendMode = 'normal';
        cursor.style.backgroundColor = 'var(--white)';
        cursorText.innerText = 'View Image';
        return;
      }

      // 3. Text Hover Dynamic Sizing (Matte Black Effect)
      const text = t.closest(textTarget) || (t.tagName === 'A' ? t : null);
      if (text) {
        cursor.classList.add('-text-hover');
        const style = window.getComputedStyle(text);
        const fs = parseInt(style.fontSize);
        let size = fs * 1.3; // Reduced from 2.2 for a more subtle frame
        if (size > 80) size = 80; // Cap large sizes (headings)
        if (size < 30) size = 30; // Min size for body text
        cursor.style.width = size + 'px';
        cursor.style.height = size + 'px';
        cursor.style.backgroundColor = 'white';
        cursor.style.mixBlendMode = 'difference';
      }
    });

    document.addEventListener('mouseout', e => {
      const t = e.target;
      cursor.classList.remove('-hidden');
      if (t.closest(imgTarget)) {
        cursor.classList.remove('-image-hover');
        cursorText.innerText = '';
        cursor.style.mixBlendMode = 'exclusion';
      }
      if (t.closest(textTarget) || t.tagName === 'A') {
        cursor.classList.remove('-text-hover');
        cursor.style.width = '';
        cursor.style.height = '';
        cursor.style.backgroundColor = '';
        cursor.style.mixBlendMode = 'exclusion';
      }
    });
  };
  updateHovers();

  // ========================
  // STICKY HEADER
  // ========================
  /* 
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  */

  // ========================
  // MOBILE NAV
  // ========================
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ========================
  // HERO SLIDER
  // ========================
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dots .dot');
  if (slides.length > 1) {
    let current = 0;
    const go = idx => {
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      current = idx % slides.length;
      slides[current].classList.add('active');
      dots[current]?.classList.add('active');
    };

    let timer = setInterval(() => go(current + 1), 5000);

    dots.forEach(d => {
      d.addEventListener('click', () => {
        clearInterval(timer);
        go(+d.dataset.slide);
        timer = setInterval(() => go(current + 1), 5000);
      });
    });
  }

  // ========================
  // SCROLL REVEAL ANIMATIONS
  // ========================
  const animEls = document.querySelectorAll('[data-anim]');
  if (animEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('revealed');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });

    animEls.forEach(el => io.observe(el));
  }

  // ========================
  // PROGRESS BAR ANIMATION
  // ========================
  const bars = document.querySelectorAll('.pbar');
  if (bars.length) {
    const pio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const fill = en.target.querySelector('.pbar-fill');
          const pct = en.target.dataset.percent;
          if (fill) {
            setTimeout(() => { fill.style.width = pct + '%'; }, 200);
          }
          pio.unobserve(en.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(b => pio.observe(b));
  }

  // ========================
  // PORTFOLIO FILTER
  // ========================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;

      cards.forEach(card => {
        const match = f === 'all' || card.dataset.cat === f;
        card.style.transition = 'opacity .4s, transform .4s';
        if (match) {
          card.style.display = '';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(.95)';
          setTimeout(() => { card.style.display = 'none'; }, 400);
        }
      });
    });
  });

  // ========================
  // ACTIVE NAV LINK ON SCROLL
  // ========================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length && navLinks.length) {
    window.addEventListener('scroll', () => {
      let cur = '';
      sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 200) cur = s.id;
      });
      navLinks.forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('href') === '#' + cur) l.classList.add('active');
      });
    }, { passive: true });
  }

  // ========================
  // COUNTER ANIMATION (About page stats)
  // ========================
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const el = en.target;
          const targetStr = el.dataset.count;
          const target = parseFloat(targetStr);
          const isDecimal = targetStr.includes('.');
          const duration = 2000;
          const start = performance.now();
          
          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            const current = eased * target;
            if (isDecimal) {
              el.textContent = current.toFixed(2);
            } else {
              el.textContent = Math.floor(current);
            }

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              el.textContent = isDecimal ? targetStr : target + '+';
            }
          };
          requestAnimationFrame(animate);
          cio.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    counters.forEach(c => cio.observe(c));
  }

  // ========================
  // TEXT SPLIT REVEAL ANIMATION
  // ========================
  const splitElements = document.querySelectorAll('.text-split-ani');
  
  splitElements.forEach(el => {
    const text = el.textContent.trim();
    if (!text) return;

    el.innerHTML = '';
    
    // Split into words and characters
    const words = text.split(/\s+/);
    words.forEach((word, wordIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      
      word.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.innerText = char;
        wordSpan.appendChild(charSpan);
      });
      
      el.appendChild(wordSpan);
      if (wordIdx < words.length - 1) {
        el.appendChild(document.createTextNode(' '));
      }
    });

    const triggerAnimation = () => {
      const chars = el.querySelectorAll('.char');
      chars.forEach((char, i) => {
        char.style.transitionDelay = `${0.1 + (i * 0.02)}s`;
      });
      requestAnimationFrame(() => el.classList.add('animated'));
    };

    // Use IntersectionObserver with immediate check
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerAnimation();
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.05 });
    
    observer.observe(el);

    // Immediate check if element is in hero or already visible
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      triggerAnimation();
      observer.unobserve(el);
    }
  });

  // ========================
  // REVEAL UP ANIMATION (Buttons & Sections)
  // ========================
  const revealUpElements = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  revealUpElements.forEach(el => revealObserver.observe(el));

})();
