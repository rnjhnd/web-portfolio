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
