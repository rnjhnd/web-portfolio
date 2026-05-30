import './style.css';
import Lenis from 'lenis';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Vercel Analytics & Speed Insights
inject();
injectSpeedInsights();

document.addEventListener('DOMContentLoaded', () => {

  // Trigger staggered animations instantly
  setTimeout(() => {
    window.dispatchEvent(new Event('scroll'));
  }, 50);

  // Remove mask clipping after entrance animation completes so 3D transforms don't clip
  setTimeout(() => {
    document.querySelectorAll('.mask').forEach(el => {
      el.style.overflow = 'visible';
    });
  }, 2000);

  // --- Theme Toggle Logic ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const btnText = theme === 'dark' ? '[ LIGHT_MODE ]' : '[ DARK_MODE ]';
    themeToggleBtn.textContent = btnText;
    if (mobileThemeToggleBtn) mobileThemeToggleBtn.textContent = btnText;
  };

  // Initialize buttons based on the theme already set by the synchronous head script
  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const initialBtnText = initialTheme === 'dark' ? '[ LIGHT_MODE ]' : '[ DARK_MODE ]';
  themeToggleBtn.textContent = initialBtnText;
  if (mobileThemeToggleBtn) mobileThemeToggleBtn.textContent = initialBtnText;

  const handleThemeToggle = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  themeToggleBtn.addEventListener('click', handleThemeToggle);
  if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', handleThemeToggle);

  // --- Mobile Menu Logic ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  let isMobileMenuOpen = false;

  const toggleMobileMenu = () => {
    isMobileMenuOpen = !isMobileMenuOpen;
    mobileMenuBtn.classList.toggle('open', isMobileMenuOpen);
    mobileMenuOverlay.classList.toggle('active', isMobileMenuOpen);
    
    // Prevent scrolling when menu is open
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    // Pause Lenis scrolling
    if (isMobileMenuOpen) lenis.stop(); else lenis.start();
  };

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMobileMenuOpen) toggleMobileMenu();
    });
  });

  // --- Initialize Lenis Smooth Scrolling ---
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Intercept anchor links for smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement);
        }
      }
    });
  });

  // --- Improved Bento Logic ---
  const bentoTime = document.getElementById('bento-time');
  const bentoHeatmap = document.getElementById('bento-heatmap');
  const bentoBoxes = document.querySelectorAll('.bento-box');

  if (bentoTime) {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      bentoTime.textContent = `${h}:${m}:${s}`;
      requestAnimationFrame(updateTime);
    };
    updateTime();
  }

  if (bentoHeatmap) {
    for (let i = 0; i < 98; i++) {
      const square = document.createElement('div');
      square.className = 'heatmap-square';
      bentoHeatmap.appendChild(square);
    }
    const squares = document.querySelectorAll('.heatmap-square');
    
    let offset = 0;
    setInterval(() => {
      squares.forEach((sq, i) => {
        const x = i % 14;
        const y = Math.floor(i / 14);
        let noise = Math.sin((x + offset) * 0.5) * Math.cos((y + offset) * 0.3);
        if (Math.random() > 0.95) noise = 1;
        
        if (noise > 0.6) sq.style.backgroundColor = '#27c93f';
        else if (noise > 0.2) sq.style.backgroundColor = 'rgba(39, 201, 63, 0.5)';
        else if (noise > -0.2) sq.style.backgroundColor = 'rgba(39, 201, 63, 0.2)';
        else sq.style.backgroundColor = '';
      });
      offset += 0.5;
    }, 500);
  }

    // System Resources Logic
    const cpuBar = document.getElementById('cpu-bar');
    const cpuPct = document.getElementById('cpu-pct');
    const memBar = document.getElementById('mem-bar');
    const memPct = document.getElementById('mem-pct');

    if (cpuBar && cpuPct && memBar && memPct) {
      setInterval(() => {
        const genBar = (percent) => {
          const blocks = Math.floor(percent / 10);
          return '■'.repeat(blocks) + '□'.repeat(10 - blocks);
        };
        
        let newCpu = 65 + Math.floor(Math.random() * 20);
        cpuBar.textContent = genBar(newCpu);
        cpuPct.textContent = newCpu + '%';

        let newMem = 42 + Math.floor(Math.random() * 8);
        memBar.textContent = genBar(newMem);
        memPct.textContent = newMem + '%';
      }, 1200);
    }

  bentoBoxes.forEach(box => {
    const glare = box.querySelector('.bento-glare');
    box.addEventListener('mousemove', (e) => {
      const rect = box.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      box.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      box.style.zIndex = "10";
      
      if (glare) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.transform = `translate(-50%, -50%) translate(${glareX}%, ${glareY}%)`;
      }
    });
    
    box.addEventListener('mouseleave', () => {
      box.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      box.style.zIndex = "1";
      if (glare) {
        glare.style.transform = `translate(-50%, -50%)`;
      }
    });
  });

  // --- Ambient Cursor Orb Logic ---
  const ambientOrb = document.getElementById('ambient-orb');
  
  if (window.matchMedia('(pointer: fine)').matches && ambientOrb) {
    document.addEventListener('mousemove', (e) => {
      ambientOrb.animate({
        transform: `translate(${e.clientX}px, ${e.clientY}px)`
      }, { duration: 1500, fill: "forwards", easing: "ease-out" });
    });
  }

  // --- Active Section Tracking Logic ---
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  
  const sectionObserverOptions = {
    root: null,
    rootMargin: '-30% 0px -70% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, sectionObserverOptions);

  sections.forEach(section => sectionObserver.observe(section));

  // --- Dynamic Scrolled Nav Bar & ScrollSpy ---
  const navBar = document.querySelector('nav');
  const scrollSpyLinks = document.querySelectorAll('.scroll-spy-link');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navBar.classList.add('scrolled');
    } else {
      navBar.classList.remove('scrolled');
    }
    
    // ScrollSpy Logic
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
        currentSectionId = section.getAttribute('id');
      }
    });

    scrollSpyLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === currentSectionId) {
        link.classList.add('active');
      }
    });
  });

  // --- Intersection Observer for Snappy Typographic Reveals ---
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else if (entry.boundingClientRect.top < 0) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, observerOptions);

  const maskedElements = document.querySelectorAll('.mask');
  maskedElements.forEach(el => observer.observe(el));
});
