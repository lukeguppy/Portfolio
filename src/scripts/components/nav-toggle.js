// Mobile menu navigation toggle and drawer handler.

export function initNavToggle() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const modernToggle = header.querySelector('#nav-toggle') || header.querySelector('.nav-toggle');
  const modernDrawer = header.querySelector('#mobile-nav-drawer') || header.querySelector('.mobile-nav-drawer');

  if (modernToggle && modernDrawer) {
    modernToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = modernToggle.classList.toggle('is-active');
      modernDrawer.classList.toggle('is-open', isOpen);
      modernToggle.setAttribute('aria-expanded', String(isOpen));
      modernDrawer.setAttribute('aria-hidden', String(!isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!modernDrawer.contains(e.target) && !modernToggle.contains(e.target)) {
        modernToggle.classList.remove('is-active');
        modernDrawer.classList.remove('is-open');
        modernToggle.setAttribute('aria-expanded', 'false');
        modernDrawer.setAttribute('aria-hidden', 'true');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modernToggle.classList.remove('is-active');
        modernDrawer.classList.remove('is-open');
        modernToggle.setAttribute('aria-expanded', 'false');
        modernDrawer.setAttribute('aria-hidden', 'true');
      }
    });
    return;
  }

  // Legacy fallback
  const button = header.querySelector('.site-header__toggle');
  if (!button) return;

  header.setAttribute('data-enhanced', '');

  const setOpen = (open) => {
    header.toggleAttribute('data-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? 'Close' : 'Menu';
  };

  button.addEventListener('click', () => setOpen(!header.hasAttribute('data-open')));

  header.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.hasAttribute('data-open')) {
      setOpen(false);
      button.focus();
    }
  });
}

