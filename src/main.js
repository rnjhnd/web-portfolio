import './style.css';
import Lenis from 'lenis';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Vercel Analytics & Speed Insights
inject();
injectSpeedInsights();

document.addEventListener('DOMContentLoaded', () => {

  // Force scroll to top on reload for cinematic entry
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // Trigger staggered animations instantly
  setTimeout(() => {
    window.dispatchEvent(new Event('scroll'));
  }, 50);

  // Mask clipping removal is handled per-element by the IntersectionObserver below

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
          history.replaceState(null, '', targetId);
        }
      }
    });
  });

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

  // --- Terminal Spec Card Live Time & 3D Tilt Logic ---
  const terminalLiveTime = document.getElementById('terminal-live-time');
  if (terminalLiveTime) {
    const updateTerminalTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      terminalLiveTime.textContent = `${h}:${m}:${s}`;
      requestAnimationFrame(updateTerminalTime);
    };
    updateTerminalTime();
  }

  const terminalSpecCard = document.getElementById('terminal-spec-card');
  if (terminalSpecCard) {
    const glare = terminalSpecCard.querySelector('.terminal-glare');
    terminalSpecCard.addEventListener('mousemove', (e) => {
      const rect = terminalSpecCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      
      terminalSpecCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
      
      if (glare) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.transform = `translate(-50%, -50%) translate(${glareX}%, ${glareY}%)`;
      }
    });
    
    terminalSpecCard.addEventListener('mouseleave', () => {
      terminalSpecCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      if (glare) {
        glare.style.transform = `translate(-50%, -50%)`;
      }
    });
  }

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

  // --- Intersection Observer for Snappy Typographic Reveals (Trigger Once Per Session) ---
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);

        // Remove mask clipping after entrance animation completes so 3D transforms don't clip
        if (entry.boundingClientRect.top < 0) {
          entry.target.style.overflow = 'visible';
          entry.target.style.clipPath = 'none';
        } else {
          setTimeout(() => {
            entry.target.style.overflow = 'visible';
            entry.target.style.clipPath = 'none';
          }, 1500);
        }
      }
    });
  }, observerOptions);

  const maskedElements = document.querySelectorAll('.mask');
  maskedElements.forEach(el => observer.observe(el));
});
