import { initPipelineScroll } from '../components/pipeline-scroll.js';
import { initEnvSimCanvas } from '../components/env-sim-canvas.js';
import { initBrainCanvas } from '../components/brain-canvas.js';
import { initPdfViewer } from '../components/pdf-viewer.js';

/**
 * High-tech character decrypt / cipher reveal animation for hero title
 */
function initHeroDecryptText() {
  const el = document.querySelector('.glitch-text') || document.querySelector('.hero-title__top');
  if (!el) return;

  const target = el.dataset.text || el.textContent.trim() || 'Autonomous';
  el.dataset.text = target;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = target;
    return;
  }

  // Futuristic cipher glyphs
  const glyphs = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*/<>~_';
  const totalFrames = 28;
  let isRunning = false;

  const runDecrypt = () => {
    if (isRunning) return;
    isRunning = true;

    // Start with initial random cipher characters
    let currentChars = Array.from({ length: target.length }, () =>
      glyphs[Math.floor(Math.random() * glyphs.length)]
    );
    el.textContent = currentChars.join('');

    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const resolveCount = Math.floor(progress * target.length);

      for (let i = 0; i < target.length; i++) {
        if (i < resolveCount) {
          currentChars[i] = target[i];
        } else if (target[i] === ' ') {
          currentChars[i] = ' ';
        } else if (Math.random() < 0.35) {
          // Sticky cipher scramble
          currentChars[i] = glyphs[Math.floor(Math.random() * glyphs.length)];
        }
      }

      el.textContent = currentChars.join('');

      if (frame >= totalFrames) {
        clearInterval(timer);
        el.textContent = target;
        isRunning = false;
      }
    }, 40);
  };

  // Run automatically shortly after page entry
  setTimeout(runDecrypt, 300);

  // Rerun on hover for tactile cybernetic feel
  el.addEventListener('mouseenter', () => {
    runDecrypt();
  });
}

initHeroDecryptText();
initPipelineScroll();
initEnvSimCanvas(document.getElementById('env-canvas'), { isAgentSim: false });
initBrainCanvas(document.getElementById('brain-canvas'));
initEnvSimCanvas(document.getElementById('agent-canvas'), { isAgentSim: true });
initPdfViewer(document.getElementById('pdf-container'));
