import { initPipelineScroll } from '../components/pipeline-scroll.js';
import { initEnvSimCanvas } from '../components/env-sim-canvas.js';
import { initBrainCanvas } from '../components/brain-canvas.js';
import { initPdfViewer } from '../components/pdf-viewer.js';

initPipelineScroll();
initEnvSimCanvas(document.getElementById('env-canvas'), { isAgentSim: false });
initBrainCanvas(document.getElementById('brain-canvas'));
initEnvSimCanvas(document.getElementById('agent-canvas'), { isAgentSim: true });
initPdfViewer(document.getElementById('pdf-container'));
