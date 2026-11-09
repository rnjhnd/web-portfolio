export function initScreenshotViewer(root = document) {
  const dialog = root.querySelector('[data-screenshot-viewer]');
  if (!dialog || typeof dialog.showModal !== 'function') return null;

  const image = dialog.querySelector('[data-viewer-image]');
  const title = dialog.querySelector('[data-viewer-title]');
  const counter = dialog.querySelector('[data-viewer-counter]');
  const stage = dialog.querySelector('[data-viewer-stage]');
  const close = dialog.querySelector('[data-viewer-close]');
  let session = null;

  const render = () => {
    const slide = session.getSlide();
    image.src = slide.src;
    image.alt = slide.alt;
    title.textContent = session.title;
    counter.textContent = `${String(slide.index + 1).padStart(2, '0')} / ${String(slide.total).padStart(2, '0')}`;
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
  };

  const navigate = delta => {
    if (!session) return;
    session.navigate(delta);
    render();
  };

  dialog.querySelector('[data-viewer-prev]').addEventListener('click', () => navigate(-1));
  dialog.querySelector('[data-viewer-next]').addEventListener('click', () => navigate(1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    dialog.close();
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    const opener = session?.opener;
    session = null;
    root.documentElement.classList.remove('viewer-open');
    image.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', event => {
    if (!session || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const slide = session.getSlide();
    switch (event.key) {
      case 'ArrowLeft': navigate(-1); break;
      case 'ArrowRight': navigate(1); break;
      case 'Home': navigate(-slide.index); break;
      case 'End': navigate(slide.total - slide.index - 1); break;
      default: return;
    }
    event.preventDefault();
  });
  return {
    open(options) {
      session = options;
      render();
      dialog.showModal();
      root.documentElement.classList.add('viewer-open');
      close.focus();
    },
  };
}
