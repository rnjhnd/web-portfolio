import './style.css';
import Lenis from 'lenis';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Vercel Analytics & Speed Insights
inject();
injectSpeedInsights();

document.addEventListener('DOMContentLoaded', () => {

  // --- Terminal Preloader Logic ---
  const preloader = document.getElementById('preloader');
  
  if (sessionStorage.getItem('preloaderShown')) {
    preloader.style.display = 'none';
  } else {
    // Disable scroll during preloader
    document.body.style.overflow = 'hidden';

  const terminalOutput = document.getElementById('terminal-output');
  
  const typeLine = (text, speed, callback, isSuccess = false) => {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'terminal-line mono';
    if (isSuccess) lineDiv.classList.add('success-text');
    terminalOutput.appendChild(lineDiv);

    const cursor = document.createElement('span');
    cursor.className = 'block-cursor';
    
    let i = 0;
    const interval = setInterval(() => {
      lineDiv.textContent = text.substring(0, i + 1);
      lineDiv.appendChild(cursor);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        cursor.remove();
        setTimeout(callback, 30); 
      }
    }, speed);
  };

  const generateProgressBar = (callback) => {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'terminal-line mono';
    terminalOutput.appendChild(lineDiv);
    
    let progress = 0;
    const totalBars = 20;
    
    const cursor = document.createElement('span');
    cursor.className = 'block-cursor';

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 3) + 1;
      if (progress > totalBars) progress = totalBars;
      
      const filled = '█'.repeat(progress);
      const empty = '░'.repeat(totalBars - progress);
      const percent = Math.floor((progress / totalBars) * 100);
      
      lineDiv.textContent = `> [${filled}${empty}] ${percent}%`;
      lineDiv.appendChild(cursor);
      
      if (progress >= totalBars) {
        clearInterval(interval);
        cursor.remove();
        setTimeout(callback, 50);
      }
    }, 15);
  };

  // Boot sequence
  const skipPreloader = () => {
    if (preloader.classList.contains('hidden')) return;
    preloader.classList.add('hidden');
    document.body.style.overflow = ''; 
    sessionStorage.setItem('preloaderShown', 'true');
    setTimeout(() => {
      window.dispatchEvent(new Event('scroll'));
    }, 50);
  };

  window.addEventListener('click', skipPreloader, { once: true });
  window.addEventListener('keydown', skipPreloader, { once: true });
  window.addEventListener('touchstart', skipPreloader, { once: true });

  setTimeout(() => {
    typeLine('> INITIALIZING SYSTEM...', 10, () => {
      typeLine('> LOADING CORE MODULES...', 10, () => {
        generateProgressBar(() => {
          typeLine('> ESTABLISHING SECURE CONNECTION...', 10, () => {
            typeLine('> ACCESS GRANTED.', 10, () => {
              // Hide preloader
              setTimeout(skipPreloader, 200); 
            }, true);
          });
        });
      });
    });
  }, 100);
  }

  // --- Theme Toggle Logic ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
  
  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const btnText = theme === 'dark' ? '[ LIGHT_MODE ]' : '[ DARK_MODE ]';
    themeToggleBtn.textContent = btnText;
    if (mobileThemeToggleBtn) mobileThemeToggleBtn.textContent = btnText;
  };

  setTheme(getPreferredTheme());

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

  // --- Ambient Cursor Orb Logic ---
  const ambientOrb = document.getElementById('ambient-orb');
  
  if (window.matchMedia('(pointer: fine)').matches && ambientOrb) {
    document.addEventListener('mousemove', (e) => {
      ambientOrb.animate({
        left: `${e.clientX}px`,
        top: `${e.clientY}px`
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

  // --- Dynamic Scrolled Nav Bar ---
  const navBar = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navBar.classList.add('scrolled');
    } else {
      navBar.classList.remove('scrolled');
    }
  });

  // --- Intersection Observer for Snappy Typographic Reveals ---
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); 
      }
    });
  }, observerOptions);

  const maskedElements = document.querySelectorAll('.mask');
  maskedElements.forEach(el => observer.observe(el));

});
