// Mobile menu. Without JS the nav stays visible and wraps (see site-header.css).

export function initNavToggle() {
  const header = document.getElementById('site-header');
  const button = header?.querySelector('.site-header__toggle');
  if (!header || !button) return;

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
