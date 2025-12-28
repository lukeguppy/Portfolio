import './style.css';
import { MapManager } from './src/mapManager.js';
import { GameManager } from './src/gameManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    const mapManager = new MapManager('globe-canvas');
    await mapManager.init();

    const gameManager = new GameManager(mapManager);
});
