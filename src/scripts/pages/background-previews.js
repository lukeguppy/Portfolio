import {
  createDeepNeuralNetworkBackground,
  createTransformerAttentionBackground,
  createAttentionMatrixBackground,
  createMcpBusBackground
} from '../components/home-backgrounds.js';
import { initLukeAgent } from '../components/luke-agent.js';

const CONCEPTS = {
  neural: {
    id: 'neural',
    title: '1. Deep Neural Network',
    engine: createDeepNeuralNetworkBackground
  },
  transformer: {
    id: 'transformer',
    title: '2. Transformer Attention',
    engine: createTransformerAttentionBackground
  },
  matrix: {
    id: 'matrix',
    title: '3. Serene Attention Matrix',
    engine: createAttentionMatrixBackground
  },
  mcp: {
    id: 'mcp',
    title: '4. MCP Socket Bus',
    engine: createMcpBusBackground
  }
};

let currentConceptId = 'neural';
let activeEngine = null;
let currentSubtlety = 1.0;
let foregroundState = 'full'; // 'full' | 'dimmed' | 'hidden'

const stageContainer = document.getElementById('preview-bg-stage');
const fgContainer = document.getElementById('preview-foreground');
const tabs = document.querySelectorAll('[data-preview-tab]');
const toggleFgBtn = document.getElementById('btn-toggle-fg');
const toggleSubtletyBtn = document.getElementById('btn-toggle-subtlety');

// Switch active background engine safely
function switchBackground(conceptId) {
  if (!CONCEPTS[conceptId]) conceptId = 'neural';
  currentConceptId = conceptId;

  // Clean up previous engine
  if (activeEngine && typeof activeEngine.destroy === 'function') {
    activeEngine.destroy();
    activeEngine = null;
  }

  // Update tabs UI
  tabs.forEach(tab => {
    const isTarget = tab.dataset.previewTab === conceptId;
    tab.classList.toggle('is-active', isTarget);
    tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  // Launch new engine
  const concept = CONCEPTS[conceptId];
  if (stageContainer) {
    activeEngine = concept.engine(stageContainer, { subtlety: currentSubtlety });
  }

  // Sync URL query without page reload
  try {
    const url = new URL(window.location);
    url.searchParams.set('concept', conceptId);
    window.history.replaceState({}, '', url);
  } catch (e) {
    // Ignore history error in non-browser context
  }
}

// Wire up Tab Clicks
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const id = tab.dataset.previewTab;
    if (id !== currentConceptId) {
      switchBackground(id);
    }
  });
});

// Toggle Foreground Visibility
if (toggleFgBtn && fgContainer) {
  toggleFgBtn.addEventListener('click', () => {
    if (foregroundState === 'full') {
      foregroundState = 'dimmed';
      fgContainer.classList.add('is-dimmed');
      fgContainer.classList.remove('is-hidden');
      toggleFgBtn.textContent = 'FG: Dimmed';
    } else if (foregroundState === 'dimmed') {
      foregroundState = 'hidden';
      fgContainer.classList.add('is-hidden');
      fgContainer.classList.remove('is-dimmed');
      toggleFgBtn.textContent = 'FG: Hidden (BG Only)';
    } else {
      foregroundState = 'full';
      fgContainer.classList.remove('is-dimmed', 'is-hidden');
      toggleFgBtn.textContent = 'FG: Visible';
    }
  });
}

// Toggle Subtlety / Opacity Multiplier
if (toggleSubtletyBtn) {
  const levels = [
    { label: 'Subtlety: Normal (1.0x)', val: 1.0 },
    { label: 'Subtlety: Crisp (1.4x)', val: 1.4 },
    { label: 'Subtlety: Ultra-Quiet (0.6x)', val: 0.6 }
  ];
  let levelIdx = 0;

  toggleSubtletyBtn.addEventListener('click', () => {
    levelIdx = (levelIdx + 1) % levels.length;
    currentSubtlety = levels[levelIdx].val;
    toggleSubtletyBtn.textContent = levels[levelIdx].label;
    if (activeEngine && typeof activeEngine.setSubtlety === 'function') {
      activeEngine.setSubtlety(currentSubtlety);
    }
  });
}

// Read initial concept from data attribute or URL query parameter
const stageEl = document.querySelector('[data-initial-concept]');
const params = new URLSearchParams(window.location.search);
const initialConcept = params.get('concept') || (stageEl ? stageEl.dataset.initialConcept : 'neural');
switchBackground(initialConcept);

// Initialize live Luke Agent terminal on foreground
const agentEl = document.querySelector('[data-luke-agent]');
if (agentEl) {
  initLukeAgent(agentEl);
}
