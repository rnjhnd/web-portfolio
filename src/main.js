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

  // --- Topology Canvas Logic ---
  const canvas = document.getElementById('topology-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let time = 0;
    
    const resize = () => {
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const cols = 22;
    const rows = 18;
    const scale = 25;
    
    const animateTopology = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(39, 201, 63, 0.5)';
      ctx.lineWidth = 1;
      
      time -= 0.02;
      
      let terrain = [];
      let yOffset = time;
      for (let y = 0; y < rows; y++) {
        terrain[y] = [];
        let xOffset = 0;
        for (let x = 0; x < cols; x++) {
          terrain[y][x] = Math.sin(xOffset) * Math.cos(yOffset) * 20 + Math.sin(xOffset * 0.5 + yOffset * 0.8) * 15;
          xOffset += 0.4;
        }
        yOffset += 0.4;
      }
      
      ctx.save();
      ctx.translate(width / 2, height / 2 + 50);
      
      for (let y = 0; y < rows - 1; y++) {
        ctx.beginPath();
        for (let x = 0; x < cols; x++) {
          let px1 = (x - cols/2) * scale;
          let py1 = (y - rows/2) * scale;
          let pz1 = terrain[y][x];
          
          let drawX1 = px1 - py1;
          let drawY1 = (px1 + py1) / 2 - pz1;
          
          if (x === 0) ctx.moveTo(drawX1, drawY1);
          else ctx.lineTo(drawX1, drawY1);
        }
        ctx.stroke();
        
        ctx.beginPath();
        for (let x = 0; x < cols; x++) {
          let px1 = (x - cols/2) * scale;
          let py1 = (y - rows/2) * scale;
          let pz1 = terrain[y][x];
          
          let px2 = (x - cols/2) * scale;
          let py2 = (y + 1 - rows/2) * scale;
          let pz2 = terrain[y+1][x];
          
          let drawX1 = px1 - py1;
          let drawY1 = (px1 + py1) / 2 - pz1;
          
          let drawX2 = px2 - py2;
          let drawY2 = (px2 + py2) / 2 - pz2;
          
          ctx.moveTo(drawX1, drawY1);
          ctx.lineTo(drawX2, drawY2);
        }
        ctx.stroke();
      }
      
      ctx.restore();
      requestAnimationFrame(animateTopology);
    };
    
    animateTopology();
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
