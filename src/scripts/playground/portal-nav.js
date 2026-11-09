/**
 * Playground Portal Stage controller (`[data-playground-stage]`).
 * - Tracks active portal (`[data-active]`) & syncs the right-hand progress rail
 * - Drives continuous scroll-scrubbed depth, parallax & scale transitions (`--portal-offset`, `--portal-focus`)
 * - Supports smooth click navigation on `.portal-index` and Arrow/Page keyboard stepping
 */
export function initPortalStage() {
  const stage = document.querySelector('.playground-stage');
  const portals = [...document.querySelectorAll('.game-portal')];
  const links = [...document.querySelectorAll('.portal-index a')];
  if (!stage || !portals.length) return;

  const scrollIndicator = document.querySelector('[data-scroll-indicator]');
  let activeIndex = 0;

  const setActive = (index) => {
    activeIndex = index;
    portals.forEach((p, i) => p.toggleAttribute('data-active', i === index));
    links.forEach((a, i) => {
      if (i === index) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
    if (scrollIndicator) {
      scrollIndicator.classList.toggle('hidden', index === portals.length - 1);
    }
  };

  const updateScrollTransforms = () => {
    const vh = Math.max(1, stage.clientHeight);
    const scrollTop = stage.scrollTop;

    let closestIdx = 0;
    let minAbs = Infinity;

    portals.forEach((p, i) => {
      const offset = (p.offsetTop - scrollTop) / vh;
      const clamped = Math.max(-1, Math.min(1, offset));
      const focus = Math.max(0, 1 - Math.abs(clamped));

      p.style.setProperty('--portal-offset', clamped.toFixed(3));
      p.style.setProperty('--portal-focus', focus.toFixed(3));

      if (Math.abs(offset) < minAbs) {
        minAbs = Math.abs(offset);
        closestIdx = i;
      }
    });

    if (closestIdx !== activeIndex) {
      setActive(closestIdx);
    }
  };

  setActive(0);
  updateScrollTransforms();

  let ticking = false;
  stage.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollTransforms();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );

  window.addEventListener('resize', updateScrollTransforms, { passive: true });

  links.forEach((link, idx) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (portals[idx]) {
        portals[idx].scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  window.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next = activeIndex;
    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      next = Math.min(portals.length - 1, activeIndex + 1);
    } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      next = Math.max(0, activeIndex - 1);
    } else {
      return;
    }

    if (next !== activeIndex) {
      event.preventDefault();
      portals[next].scrollIntoView({ behavior: 'smooth' });
    }
  });
}
