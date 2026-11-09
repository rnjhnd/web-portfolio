import { initScreenshotViewer } from './screenshot-viewer.js';

export function initProjectGalleries(root = document) {
  const viewer = initScreenshotViewer(root);
  root.querySelectorAll('[data-project-gallery]').forEach(gallery => {
    const slides = Array.from(gallery.querySelectorAll('.carousel-img'));
    const viewport = gallery.querySelector('[data-gallery-viewport]');
    const controls = gallery.querySelector('.gallery-controls');
    const counter = gallery.querySelector('[data-gallery-counter]');
    const previous = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const expand = gallery.querySelector('[data-gallery-expand]');
    if (slides.length < 2 || !viewport || !controls || !counter || !previous || !next) return;

    let current = 0;
    let swipe = null;
    let swipeHandled = false;
    const format = value => String(value).padStart(2, '0');

    const showSlide = index => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, position) => {
        const active = position === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      counter.textContent = `${format(current + 1)} / ${format(slides.length)}`;
    };

    previous.addEventListener('click', () => showSlide(current - 1));
    next.addEventListener('click', () => showSlide(current + 1));

    if (viewer && expand) {
      expand.hidden = false;
      viewport.addEventListener('click', event => {
        if (swipeHandled && event.detail !== 0) {
          swipeHandled = false;
          return;
        }
        viewer.open({
          title: gallery.closest('.project-card').querySelector('h3').textContent,
          opener: expand,
          getSlide: () => ({
            src: slides[current].dataset.fullSrc,
            alt: slides[current].getAttribute('aria-label'),
            index: current,
            total: slides.length,
          }),
          navigate: delta => showSlide(current + delta),
        });
      });
    }

    gallery.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      switch (event.key) {
        case 'ArrowLeft': showSlide(current - 1); break;
        case 'ArrowRight': showSlide(current + 1); break;
        case 'Home': showSlide(0); break;
        case 'End': showSlide(slides.length - 1); break;
        default: return;
      }
      event.preventDefault();
    });

    viewport.addEventListener('pointerdown', event => {
      swipeHandled = false;
      if (!event.isPrimary) {
        swipe = null;
        return;
      }
      if (event.pointerType !== 'touch') return;
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener('pointerup', event => {
      if (!swipe || swipe.id !== event.pointerId) return;
      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      swipe = null;
      if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        swipeHandled = true;
        showSlide(current + (dx < 0 ? 1 : -1));
      }
    });

    viewport.addEventListener('pointercancel', () => { swipe = null; });
    viewport.addEventListener('lostpointercapture', () => { swipe = null; });

    showSlide(0);
    if (!viewer || !expand) viewport.tabIndex = 0;
    controls.hidden = false;
  });
}
