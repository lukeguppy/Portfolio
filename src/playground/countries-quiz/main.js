import './style.css';
import { MapManager } from './src/mapManager.js';
import { GameManager } from './src/gameManager.js';

async function initQuiz() {
    const mapManager = new MapManager('globe-canvas');
    await mapManager.init();
    new GameManager(mapManager);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuiz);
} else {
    initQuiz();
}
