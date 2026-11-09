import { initAutonomyField } from '../components/autonomy-field.js';
import { initLukeAgent } from '../components/luke-agent.js';
import { initHomePortalStage } from '../components/home-portal-stage.js';

initAutonomyField(document.getElementById('autonomy-canvas'));
initLukeAgent(document.querySelector('[data-luke-agent]'));
initHomePortalStage(document.querySelector('[data-home-portal-stage]'));

// Continuous, framerate-independent 3D scroll choreography between Hero and Explore
const heroIntro = document.querySelector('.home-hero__intro');
const heroAgent = document.querySelector('.luke-agent');
const portalSection = document.querySelector('[data-home-portal-stage]');
const portalHead = document.querySelector('.portal-stage__head');
const portalItems = [...document.querySelectorAll('.portal-stage__item')];
const portalViewport = document.querySelector('.portal-stage__viewport');
const scrollCue = document.querySelector('[data-home-scroll-cue]');

const clamp01 = (v) => Math.max(0, Math.min(1, v));

/**
 * Returns 0 when rectTop >= startY (entering near bottom of viewport)
 * and smoothly interpolates to 1 when rectTop <= endY (settled in viewport).
 */
const scrollEnterProgress = (rectTop, startY, endY) => {
  const raw = (startY - rectTop) / Math.max(1, startY - endY);
  const t = clamp01(raw);
  return t * t * (3 - 2 * t);
};

let smoothScrollY = window.scrollY;
let lastFrameTime = performance.now();
let isTicking = false;

function tick(now) {
  const dt = Math.min(0.064, Math.max(0.001, (now - lastFrameTime) / 1000));
  lastFrameTime = now;

  const rawScrollY = window.scrollY;
  const vh = Math.max(1, window.innerHeight);
  const isStacked = window.innerWidth <= 1024;

  if (scrollCue) {
    scrollCue.classList.toggle('is-hidden', rawScrollY > 36);
  }

  // Framerate-independent exponential decay
  const decay = 1 - Math.exp(-16 * dt);
  const diff = rawScrollY - smoothScrollY;
  if (Math.abs(diff) < 0.25) {
    smoothScrollY = rawScrollY;
  } else {
    smoothScrollY += diff * decay;
  }

  if (isStacked) {
    // Mobile / Tablet stacked mode: lock at 100% visibility, no opacity fading or transform shifts
    if (heroIntro) {
      heroIntro.style.transform = 'none';
      heroIntro.style.opacity = '1';
    }
    if (heroAgent) {
      heroAgent.style.transform = 'none';
      heroAgent.style.opacity = '1';
    }
    if (portalHead) {
      portalHead.style.transform = 'none';
      portalHead.style.opacity = '1';
    }
    portalItems.forEach((item) => {
      item.style.transform = 'none';
      item.style.opacity = '1';
    });
    if (portalViewport) {
      portalViewport.style.transform = 'none';
      portalViewport.style.opacity = '1';
    }
  } else {
    // Desktop: hero stays 100% opaque at all times — never fade out while user is reading or interacting
    if (heroIntro) {
      const y = smoothScrollY * 0.14;
      heroIntro.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      heroIntro.style.opacity = '1';
    }
    if (heroAgent) {
      const y = smoothScrollY * 0.08;
      heroAgent.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      heroAgent.style.opacity = '1';
    }

    // 2. Explore Section
    if (portalSection) {
      const secRect = portalSection.getBoundingClientRect();
      const headP = scrollEnterProgress(secRect.top, vh * 0.94, vh * 0.52);
      portalSection.classList.toggle('is-visible', headP > 0.08);

      if (portalHead) {
        if (headP >= 0.999) {
          portalHead.style.transform = 'none';
          portalHead.style.opacity = '1';
        } else {
          const y = (1 - headP) * 36;
          portalHead.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
          portalHead.style.opacity = headP.toFixed(3);
        }
      }

      const nearBottom = vh + rawScrollY >= document.documentElement.scrollHeight - 48;

      portalItems.forEach((item, idx) => {
        const itemRect = item.getBoundingClientRect();
        const p = nearBottom ? 1 : scrollEnterProgress(itemRect.top, vh * (0.96 - idx * 0.02), vh * 0.56);
        if (p >= 0.999) {
          item.style.transform = 'none';
          item.style.opacity = '1';
        } else {
          const x = -(1 - p) * 20;
          const y = (1 - p) * 24;
          item.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
          item.style.opacity = p.toFixed(3);
        }
      });

      if (portalViewport) {
        const vpRect = portalViewport.getBoundingClientRect();
        const vpP = nearBottom ? 1 : scrollEnterProgress(vpRect.top, vh * 0.95, vh * 0.48);
        if (vpP >= 0.999) {
          portalViewport.style.transform = 'none';
          portalViewport.style.opacity = '1';
        } else {
          const y = (1 - vpP) * 44;
          portalViewport.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
          portalViewport.style.opacity = vpP.toFixed(3);
        }
      }
    }
  }

  // Continue loop while interpolating smooth scroll; sleep when settled
  if (Math.abs(rawScrollY - smoothScrollY) >= 0.25) {
    requestAnimationFrame(tick);
  } else {
    isTicking = false;
  }
}

function wakeTick() {
  if (!isTicking) {
    isTicking = true;
    lastFrameTime = performance.now();
    requestAnimationFrame(tick);
  }
}

window.addEventListener('scroll', wakeTick, { passive: true });
window.addEventListener('resize', wakeTick, { passive: true });
wakeTick();
