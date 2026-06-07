// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    cacheDomElements();
    initStats();
    setupEventListeners();
    loadSettings();
    initFloatingBackground();
    
    // Initialize solver tree coordinates and node list once
    if (typeof SOLVER_TREE !== 'undefined') {
        // Find max depth dynamically to scale radial tree layout
        maxTreeDepth = 0;
        function findDepth(n, d = 0) {
            if (!n || typeof n !== 'object') return;
            if (d > maxTreeDepth) maxTreeDepth = d;
            if (n.branches) {
                for (const k in n.branches) {
                    const c = n.branches[k];
                    if (c && typeof c === 'object') {
                        findDepth(c, d + 1);
                    }
                }
            }
        }
        findDepth(SOLVER_TREE);

        nodeIdCounter = 0;
        leafCount = 0;
        treeNodesList = [];
        layoutTree(SOLVER_TREE);
        const totalLeaves = leafCount;
        for (const node of treeNodesList) {
            const angle = (node.angleIndex / totalLeaves) * 2.0 * Math.PI;
            node.angle = angle;
            node.x = 250 + node.r_radius * Math.cos(angle);
            node.y = 250 + node.r_radius * Math.sin(angle);
        }
        renderTreeSVG();
    }
    
    // Always draw keyboard first so key elements are populated for restoration
    drawKeyboard();
    
    const gameLoaded = loadGameState();
    let isFirstVisit = false;
    if (!gameLoaded) {
        startNewGame();
        isFirstVisit = true;
    }
    
    const sandboxLoaded = loadSandboxState();
    if (!sandboxLoaded) {
        startNewSandbox();
    }
    
    const savedTab = localStorage.getItem("wordle_active_tab") || "play";
    switchTab(savedTab);

    // If first-time user, automatically start the solver to demonstrate capability
    if (isFirstVisit && savedTab === "play") {
        setTimeout(() => {
            if (activeTab === "play" && !isGameOver && !isAutoPlaying) {
                startAutoSolve();
            }
        }, 1000);
    }
});
