import { initLukeAgent } from '../components/luke-agent.js';
import { initHomePortalStage } from '../components/home-portal-stage.js';
import { createDeepNeuralNetworkBackground } from '../components/home-backgrounds.js';

const homeBgContainer = document.getElementById('home-bg-container');
if (homeBgContainer) {
  createDeepNeuralNetworkBackground(homeBgContainer, { subtlety: 1.0 });
}
initLukeAgent(document.querySelector('[data-luke-agent]'));
initHomePortalStage(document.querySelector('[data-home-portal-stage]'));

// Clean, native scroll behavior: zero transform jiggle, zero forced reflows
const scrollCue = document.querySelector('[data-home-scroll-cue]');
if (scrollCue) {
  window.addEventListener(
    'scroll',
    () => {
      scrollCue.classList.toggle('is-hidden', window.scrollY > 40);
    },
    { passive: true },
  );
}
