import { initLukeAgent } from '../components/luke-agent.js';
import { initHomePortalStage } from '../components/home-portal-stage.js';
import { initNetworkBackground } from '../components/network-background.js';

initNetworkBackground('home-bg-container', { nodeCount: 42 });
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
