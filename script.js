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
      // Suppress 'View Image' if inside a link (redirecting page) or if explicitly disabled
      const isClickableCard = t.closest('.blog-card, .project-card, a');
      if (img && !isClickableCard) {
        cursor.classList.add('-image-hover');
        cursor.style.mixBlendMode = 'normal';
        cursor.style.backgroundColor = 'var(--white)';
        cursorText.innerText = 'View Image';
        return;
      } else if (img && isClickableCard) {
        cursor.classList.remove('-image-hover');
        cursorText.innerText = '';
      }

      // 3. Text Hover Dynamic Sizing
      const text = t.closest(textTarget) || (t.tagName === 'A' ? t : null);
      if (text) {
        cursor.classList.add('-text-hover');
        const style = window.getComputedStyle(text);
        const fs = parseInt(style.fontSize);
        let size = fs * 1.5; 
        if (size > 60) size = 60; // Cap at 60px to prevent huge circles
        if (size < 25) size = 25; // Min size
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
  // TEXT SPLIT REVEAL ANIMATION (PRESERVE HTML & SPACES)
  // ========================
  // ========================
  // TEXT SPLIT REVEAL ANIMATION (PRO-LEVEL HTML HANDLING)
  // ========================
  const splitElements = document.querySelectorAll('.text-split-ani');
  
  splitElements.forEach(el => {
    const originalHTML = el.innerHTML;
    if (!originalHTML.trim()) return;

    el.innerHTML = '';
    
    // Split into tokens (tags or words/spaces)
    const tokens = originalHTML.split(/(<[^>]*>)/g);
    
    tokens.forEach(token => {
      if (token.startsWith('<')) {
        // It's a tag (like <br> or <span>), append it directly as HTML
        const temp = document.createElement('div');
        temp.innerHTML = token;
        while (temp.firstChild) {
          el.appendChild(temp.firstChild);
        }
      } else {
        // It's text, split into words and spaces
        const parts = token.split(/(\s+)/g);
        parts.forEach(part => {
          if (part.trim() === '') {
            el.appendChild(document.createTextNode(part));
          } else {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            wordSpan.style.display = 'inline-block';
            wordSpan.style.whiteSpace = 'nowrap';
            
            part.split('').forEach(char => {
              const charSpan = document.createElement('span');
              charSpan.className = 'char';
              charSpan.innerText = char;
              wordSpan.appendChild(charSpan);
            });
            el.appendChild(wordSpan);
          }
        });
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
  // SCROLL REVEAL ANIMATIONS (GLOBAL)
  // ========================
  const revealItems = document.querySelectorAll('[data-anim], .reveal-up, .reveal-down');
  
  const globalRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Handle both class-based and data-attr based reveals
        entry.target.classList.add('revealed');
        entry.target.classList.add('animated');
        globalRevealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  revealItems.forEach(el => {
    // Immediate check for elements in viewport
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('revealed');
      el.classList.add('animated');
    } else {
      globalRevealObserver.observe(el);
    }
  });

  // ========================
  // REVEAL UP CSS CLASSES ENFORCEMENT
  // ========================
  // Ensuring class-based reveals have initial state in CSS if not handled by data-anim

  // ========================
  // LIGHTBOX LOGIC
  // ========================
  const lightbox = document.createElement('div');
  lightbox.className = 'cb-lightbox';
  lightbox.innerHTML = `
    <div class="cb-lightbox-content">
      <button class="cb-lightbox-close"><i class="fas fa-times"></i></button>
      <img src="" alt="Full View" class="cb-lightbox-img">
    </div>
  `;
  document.body.appendChild(lightbox);

  const lbImg = lightbox.querySelector('.cb-lightbox-img');
  const lbClose = lightbox.querySelector('.cb-lightbox-close');

  const openLightbox = (src) => {
    lbImg.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Keeping custom cursor visible as per user request
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    cursor.classList.remove('-hidden');
    setTimeout(() => { lbImg.src = ''; }, 500);
  };

  document.addEventListener('click', e => {
    const t = e.target;
    const imgTarget = 'img, .project-img-wrap, .blog-thumb, .services-imgs, .testi-image, .project-card, .service-card, .blog-card';
    const container = t.closest(imgTarget);
    
    if (container) {
      // If it's a link or button, don't open lightbox (e.g. "Read More" or "View Project" links)
      if (t.closest('a, button:not(.cb-lightbox-close)')) return;

      let src = '';
      if (container.tagName === 'IMG') {
        src = container.src;
      } else {
        const nestedImg = container.querySelector('img');
        if (nestedImg) src = nestedImg.src;
      }
      
      // Fallback for background images
      if (!src) {
        const style = window.getComputedStyle(container);
        const bg = style.backgroundImage;
        if (bg && bg !== 'none') {
          src = bg.slice(5, -2).replace(/"/g, ''); 
        }
      }

      if (src && !src.includes('data:image')) {
        openLightbox(src);
      }
    }
  });

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
  });

})();
