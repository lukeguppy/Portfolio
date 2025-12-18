/**
 * ZEN TREE GENERATOR - SVG Version
 * Uses SVG elements instead of Canvas for cross-browser compatibility (Firefox fix)
 * 
 * CONFIGURATION SECTION - Adjust these values to reposition the tree
 */

// ========================================
// GLOBAL TREE POSITION CONFIG
// Exported so about-pinboard.js can read these values
// ========================================
window.ZEN_TREE_CONFIG = {
    // Tree trunk position (as percentage of viewport)
    treeX: 0.125,        // 25% from left edge
    treeY: 1,           // 100% from top (at bottom)

    // Where on the tree the pinboard should land (offset from trunk base, in pixels)
    pinboardLandingOffsetX: -20,  // pixels left of trunk center (negative = left)
    pinboardLandingOffsetY: -120, // pixels up from trunk base (smaller = lower)
    pinboardLandingRotation: -5,  // degrees rotation
    pinboardScale: 0.12,          // scale of pinboard when landed (smaller)
};

// ========================================
// RIGHT TREE CONFIG (decorative, no pinboard)
// Different branching style for unique appearance
// ========================================
window.ZEN_TREE_RIGHT_CONFIG = {
    treeX: 0.85,        // 85% from left edge (right side)
    treeY: 1,           // 100% from top (at bottom)
    scale: 0.7,         // Slightly smaller than left tree
    seed: 789012,       // Different seed for variation
    // Different branching angles for unique tree shape
    branch1Angle: 0.15, // First branch angle offset
    branch2Angle: 0.9,  // Second branch angle offset (more spread)
};

document.addEventListener('DOMContentLoaded', () => {
    // Find existing container or create SVG
    const container = document.querySelector('.zen-tree-container');
    if (!container) return;

    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = 'zen-tree-svg';
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Style the SVG
    svg.style.cssText = `
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    `;

    container.appendChild(svg);

    const NS = "http://www.w3.org/2000/svg";

    // Seeded random for consistent tree
    let seed = 123456;
    function mulberry32() {
        var t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    // Tree appearance config
    const TREE_STYLE = {
        trunkColor: '#3e2723',
        leafColor: 'rgba(56, 114, 46, 0.8)',
        startLength: 160,
        branchWidth: 40,
        maxDepth: 12,
    };

    function drawBranch(x, y, len, angle, bWidth, depth, mirrored = false, cfg = null) {
        const endX = x + len * Math.cos(angle);
        const endY = y + len * Math.sin(angle);

        // Create SVG line for branch
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', y);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('stroke', TREE_STYLE.trunkColor);
        line.setAttribute('stroke-width', bWidth);
        line.setAttribute('stroke-linecap', 'round');
        svg.appendChild(line);

        if (depth > 8 || len < 10) {
            drawFoliage(endX, endY);
            if (depth > TREE_STYLE.maxDepth) return;
        }

        // Mirror factor: flip angle adjustments for right tree
        const m = mirrored ? -1 : 1;

        // Use custom branch angles from config, or defaults
        const b1 = cfg?.branch1Angle || 0.1;
        const b2 = cfg?.branch2Angle || 1.2;

        if (depth < TREE_STYLE.maxDepth) {
            const nextLen = len * 0.75;
            const nextWidth = bWidth * 0.7;

            if (depth === 0) {
                drawBranch(endX, endY, nextLen, angle - b1 * m, nextWidth, depth + 1, mirrored, cfg);
                drawBranch(endX, endY, nextLen * 0.8, angle - b2 * m, nextWidth * 0.8, depth + 1, mirrored, cfg);
            } else if (depth === 1) {
                drawBranch(endX, endY, nextLen, angle + b1 * m, nextWidth, depth + 1, mirrored, cfg);
                drawBranch(endX, endY, nextLen * 0.7, angle + (b2 * 0.7) * m, nextWidth * 0.7, depth + 1, mirrored, cfg);
            } else {
                drawBranch(endX, endY, nextLen, angle - 0.4 * m + (mulberry32() * 0.2), nextWidth, depth + 1, mirrored, cfg);
                drawBranch(endX, endY, nextLen, angle + 0.4 * m + (mulberry32() * 0.2), nextWidth, depth + 1, mirrored, cfg);
            }
        }
    }

    function drawFoliage(x, y) {
        const size = 30;
        for (let i = 0; i < 5; i++) {
            const circle = document.createElementNS(NS, 'circle');
            circle.setAttribute('cx', x + (mulberry32() - 0.5) * size * 2);
            circle.setAttribute('cy', y + (mulberry32() - 0.5) * size * 1.5);
            circle.setAttribute('r', size * (0.5 + mulberry32() * 0.5));
            circle.setAttribute('fill', TREE_STYLE.leafColor);
            svg.appendChild(circle);
        }
    }

    function draw() {
        // Clear existing content
        svg.innerHTML = '';

        // Get dimensions
        const w = window.innerWidth;
        const h = window.innerHeight;
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

        // ========================================
        // LEFT TREE (with pinboard landing)
        // ========================================
        seed = 123456; // Reset seed for consistent left tree
        const leftCfg = window.ZEN_TREE_CONFIG;
        const leftX = w * leftCfg.treeX;
        const leftY = h * leftCfg.treeY;
        drawBranch(leftX, leftY, TREE_STYLE.startLength, -Math.PI / 2, TREE_STYLE.branchWidth, 0, false);

        // ========================================
        // RIGHT TREE (decorative, different style)
        // ========================================
        const rightCfg = window.ZEN_TREE_RIGHT_CONFIG;
        seed = rightCfg.seed || 789012; // Different seed for unique tree
        const rightX = w * rightCfg.treeX;
        const rightY = h * rightCfg.treeY;
        const rightScale = rightCfg.scale || 0.7;
        // Pass custom branch angles for different tree shape
        drawBranch(rightX, rightY, TREE_STYLE.startLength * rightScale, -Math.PI / 2, TREE_STYLE.branchWidth * rightScale, 0, true, rightCfg);
    }

    // Initial draw
    draw();

    // Redraw on resize
    window.addEventListener('resize', draw);
});
