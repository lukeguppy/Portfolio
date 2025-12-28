/**
 * CONTACT PAGE - NETWORK CANVAS
 * Draws animated beam connections between the three nodes
 * with flowing energy particles
 */

// ================================================
// CONFIG
// ================================================
const Config = {
    lineColour: 'rgba(255, 255, 255, 0.08)',
    particleColours: {
        email: { r: 20, g: 184, b: 166 },
        linkedin: { r: 0, g: 119, b: 181 },
        github: { r: 168, g: 85, b: 247 }
    },
    particlesPerLine: 2,
    particleSpeed: 0.003,
    particleSize: 2,
    particleGlow: 12
};

// ================================================
// STATE
// ================================================
let canvas, ctx;
let particles = [];
let connections = [];
let animationId;

// ================================================
// PARTICLE
// ================================================
class Particle {
    constructor(conn) {
        this.conn = conn;
        this.t = Math.random();
        this.speed = Config.particleSpeed * (0.7 + Math.random() * 0.6);
        this.forward = Math.random() > 0.5;
    }

    update() {
        if (this.forward) {
            this.t += this.speed;
            if (this.t > 1) this.t = 0;
        } else {
            this.t -= this.speed;
            if (this.t < 0) this.t = 1;
        }
    }

    draw() {
        const { x1, y1, x2, y2, colour } = this.conn;
        const x = x1 + (x2 - x1) * this.t;
        const y = y1 + (y2 - y1) * this.t;

        // Glow
        const grad = ctx.createRadialGradient(x, y, 0, x, y, Config.particleGlow);
        grad.addColorStop(0, `rgba(${colour.r}, ${colour.g}, ${colour.b}, 0.8)`);
        grad.addColorStop(0.5, `rgba(${colour.r}, ${colour.g}, ${colour.b}, 0.2)`);
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(x, y, Config.particleGlow, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(x, y, Config.particleSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${colour.r}, ${colour.g}, ${colour.b})`;
        ctx.fill();
    }
}

// ================================================
// CONNECTIONS
// ================================================
function getNodeCentre(node) {
    const core = node.querySelector('.node-core');
    if (!core) return null;
    const rect = core.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2 - canvasRect.left,
        y: rect.top + rect.height / 2 - canvasRect.top
    };
}

function buildConnections() {
    const nodes = document.querySelectorAll('.contact-node');
    if (nodes.length < 3) return;

    const centers = Array.from(nodes).map(n => ({
        pos: getNodeCentre(n),
        channel: n.dataset.channel
    })).filter(c => c.pos);

    connections = [];
    particles = [];

    // Connect all nodes to each other (triangle)
    for (let i = 0; i < centers.length; i++) {
        for (let j = i + 1; j < centers.length; j++) {
            const conn = {
                x1: centers[i].pos.x,
                y1: centers[i].pos.y,
                x2: centers[j].pos.x,
                y2: centers[j].pos.y,
                colour: Config.particleColours[centers[i].channel]
            };
            connections.push(conn);

            // Create particles for this connection
            for (let p = 0; p < Config.particlesPerLine; p++) {
                particles.push(new Particle(conn));
            }
        }
    }
}

// ================================================
// RENDER
// ================================================
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines
    ctx.strokeStyle = Config.lineColour;
    ctx.lineWidth = 1;
    connections.forEach(c => {
        ctx.beginPath();
        ctx.moveTo(c.x1, c.y1);
        ctx.lineTo(c.x2, c.y2);
        ctx.stroke();
    });

    // Update & draw particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    animationId = requestAnimationFrame(render);
}

// ================================================
// RESIZE
// ================================================
function resize() {
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    buildConnections();
}

// ================================================
// INIT
// ================================================
function init() {
    canvas = document.querySelector('.network-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');

    resize();
    render();

    window.addEventListener('resize', resize);
}

// Start when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 50));
} else {
    setTimeout(init, 50);
}

window.addEventListener('load', () => setTimeout(resize, 100));
