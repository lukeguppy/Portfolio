// ================================================
// NEURAL NETWORK BACKGROUND
// Flowing particles connecting nodes in an AI-inspired visualization
// Responsive to scroll and creates depth with parallax layers
// ================================================

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        // Nodes
        nodeCount: 18,
        nodeMinRadius: 3,
        nodeMaxRadius: 8,
        nodePulseSpeed: 0.02,

        // Connections
        connectionDistance: 250,
        connectionOpacity: 0.15,

        // Particles (flowing data)
        particleCount: 20,
        particleSpeed: 1.2,
        particleSize: 2.5,

        // Colors (matching portfolio theme)
        colors: {
            teal: { r: 20, g: 184, b: 166 },
            cyan: { r: 6, g: 182, b: 212 },
            purple: { r: 139, g: 92, b: 246 }
        },

        // Animation
        mouseInfluence: 80,
        scrollParallax: 0.3
    };

    class NeuralBackground {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.nodes = [];
            this.particles = [];
            this.mouseX = 0;
            this.mouseY = 0;
            this.scrollY = 0;
            this.time = 0;
            this.opacity = 1;
            this.animationId = null;

            this.init();
        }

        init() {
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'neural-bg';
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -1;
                opacity: 0;
                transition: opacity 1.5s ease;
            `;
            document.body.insertBefore(this.canvas, document.body.firstChild);

            this.ctx = this.canvas.getContext('2d');

            // Setup
            this.resize();
            this.createNodes();
            this.createParticles();
            this.bindEvents();

            // Fade in
            requestAnimationFrame(() => {
                this.canvas.style.opacity = '1';
            });

            // Start animation
            this.animate();
        }

        resize() {
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = window.innerWidth * dpr;
            this.canvas.height = window.innerHeight * dpr;
            this.ctx.scale(dpr, dpr);

            this.width = window.innerWidth;
            this.height = window.innerHeight;
        }

        createNodes() {
            this.nodes = [];

            // Center cluster - 10 nodes in middle area
            for (let i = 0; i < 10; i++) {
                const angle = (i / 10) * Math.PI * 2;
                const radius = (Math.min(this.width, this.height) / 4) * (0.5 + Math.random() * 0.8);

                this.nodes.push({
                    x: this.width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 100,
                    y: this.height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 100,
                    baseX: 0,
                    baseY: 0,
                    radius: CONFIG.nodeMinRadius + Math.random() * (CONFIG.nodeMaxRadius - CONFIG.nodeMinRadius),
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.01 + Math.random() * 0.02,
                    drift: { x: (Math.random() - 0.5) * 0.3, y: (Math.random() - 0.5) * 0.3 },
                    color: this.randomColor(),
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }

            // Edge nodes - 8 scattered around the perimeter (sparser)
            const edgePositions = [
                { x: 0.1, y: 0.2 },   // top-left area
                { x: 0.9, y: 0.15 },  // top-right area
                { x: 0.05, y: 0.6 },  // left-middle
                { x: 0.95, y: 0.5 },  // right-middle
                { x: 0.15, y: 0.85 }, // bottom-left
                { x: 0.85, y: 0.9 },  // bottom-right
                { x: 0.3, y: 0.1 },   // top area
                { x: 0.7, y: 0.95 }   // bottom area
            ];

            edgePositions.forEach(pos => {
                this.nodes.push({
                    x: this.width * pos.x + (Math.random() - 0.5) * 80,
                    y: this.height * pos.y + (Math.random() - 0.5) * 80,
                    baseX: 0,
                    baseY: 0,
                    radius: CONFIG.nodeMinRadius + Math.random() * 3,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.008 + Math.random() * 0.015,
                    drift: { x: (Math.random() - 0.5) * 0.2, y: (Math.random() - 0.5) * 0.2 },
                    color: this.randomColor(),
                    pulsePhase: Math.random() * Math.PI * 2
                });
            });

            // Mid-ring nodes - 6 nodes bridging center and edges
            const midPositions = [
                { x: 0.25, y: 0.35 },  // upper-left bridge
                { x: 0.75, y: 0.3 },   // upper-right bridge
                { x: 0.2, y: 0.65 },   // lower-left bridge
                { x: 0.8, y: 0.7 },    // lower-right bridge
                { x: 0.35, y: 0.8 },   // bottom-left bridge
                { x: 0.65, y: 0.2 }    // top-right bridge
            ];

            midPositions.forEach(pos => {
                this.nodes.push({
                    x: this.width * pos.x + (Math.random() - 0.5) * 60,
                    y: this.height * pos.y + (Math.random() - 0.5) * 60,
                    baseX: 0,
                    baseY: 0,
                    radius: CONFIG.nodeMinRadius + Math.random() * 4,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.01 + Math.random() * 0.015,
                    drift: { x: (Math.random() - 0.5) * 0.25, y: (Math.random() - 0.5) * 0.25 },
                    color: this.randomColor(),
                    pulsePhase: Math.random() * Math.PI * 2
                });
            });

            // Store base positions
            this.nodes.forEach(node => {
                node.baseX = node.x;
                node.baseY = node.y;
            });
        }

        createParticles() {
            this.particles = [];

            for (let i = 0; i < CONFIG.particleCount; i++) {
                this.particles.push(this.createParticle());
            }
        }

        createParticle() {
            // Store references to nodes, not static positions
            const startNodeIndex = Math.floor(Math.random() * this.nodes.length);
            let endNodeIndex = Math.floor(Math.random() * this.nodes.length);
            // Avoid same node
            if (endNodeIndex === startNodeIndex) {
                endNodeIndex = (endNodeIndex + 1) % this.nodes.length;
            }

            return {
                startNodeIndex,
                endNodeIndex,
                x: this.nodes[startNodeIndex].x,
                y: this.nodes[startNodeIndex].y,
                progress: Math.random(),
                speed: CONFIG.particleSpeed * (0.5 + Math.random() * 0.5),
                size: CONFIG.particleSize * (0.5 + Math.random() * 0.5),
                color: this.nodes[startNodeIndex].color,
                trail: [],
                trailLength: 5 + Math.floor(Math.random() * 10)
            };
        }

        randomColor() {
            const colors = Object.values(CONFIG.colors);
            return colors[Math.floor(Math.random() * colors.length)];
        }

        bindEvents() {
            window.addEventListener('resize', () => {
                this.resize();
                this.createNodes();
            });

            window.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            });

            window.addEventListener('scroll', () => {
                this.scrollY = window.pageYOffset;
                // Fade out when LEAVING the hero section (before "What I Build")
                const heroHeight = window.innerHeight;
                const fadeStart = heroHeight * 0.5;  // Start fading at 50% scroll
                const fadeEnd = heroHeight * 0.9;    // Fully faded by 90% (before pinned section)
                if (this.scrollY < fadeStart) {
                    this.opacity = 1;
                } else if (this.scrollY > fadeEnd) {
                    this.opacity = 0;
                } else {
                    this.opacity = 1 - (this.scrollY - fadeStart) / (fadeEnd - fadeStart);
                }
                this.canvas.style.opacity = this.opacity;
            }, { passive: true });
        }

        updateNodes() {
            this.nodes.forEach(node => {
                // Gentle floating motion
                node.phase += node.speed;
                const floatX = Math.sin(node.phase) * 20;
                const floatY = Math.cos(node.phase * 0.7) * 15;

                // Scroll parallax
                const parallaxY = this.scrollY * CONFIG.scrollParallax * (node.y / this.height);

                // Mouse influence (subtle attraction/repulsion)
                const dx = this.mouseX - node.baseX;
                const dy = this.mouseY - node.baseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const mouseInfluence = Math.max(0, 1 - dist / CONFIG.mouseInfluence) * 30;

                node.x = node.baseX + floatX + (dx / dist) * mouseInfluence || node.baseX + floatX;
                node.y = node.baseY + floatY - parallaxY + (dy / dist) * mouseInfluence || node.baseY + floatY - parallaxY;

                // Pulse effect
                node.pulsePhase += CONFIG.nodePulseSpeed;
            });
        }

        updateParticles() {
            this.particles.forEach((particle, index) => {
                // Get current node positions (they move!)
                const startNode = this.nodes[particle.startNodeIndex];
                const endNode = this.nodes[particle.endNodeIndex];

                // Store trail position
                particle.trail.unshift({ x: particle.x, y: particle.y });
                if (particle.trail.length > particle.trailLength) {
                    particle.trail.pop();
                }

                // Move along path
                particle.progress += particle.speed * 0.01;

                if (particle.progress >= 1) {
                    // Reset particle with new target
                    particle.startNodeIndex = particle.endNodeIndex;
                    let newEndIndex = Math.floor(Math.random() * this.nodes.length);
                    if (newEndIndex === particle.startNodeIndex) {
                        newEndIndex = (newEndIndex + 1) % this.nodes.length;
                    }
                    particle.endNodeIndex = newEndIndex;
                    particle.progress = 0;
                    particle.color = this.nodes[particle.endNodeIndex].color;
                    particle.trail = [];
                } else {
                    // Simple linear interpolation between current node positions
                    const t = this.easeInOutQuad(particle.progress);
                    particle.x = startNode.x + (endNode.x - startNode.x) * t;
                    particle.y = startNode.y + (endNode.y - startNode.y) * t;
                }
            });
        }

        easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        }

        draw() {
            // Clear canvas completely
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Draw connections between nearby nodes
            this.drawConnections();

            // Draw particles and their trails
            this.drawParticles();

            // Draw nodes
            this.drawNodes();
        }

        drawConnections() {
            for (let i = 0; i < this.nodes.length; i++) {
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const nodeA = this.nodes[i];
                    const nodeB = this.nodes[j];

                    const dx = nodeB.x - nodeA.x;
                    const dy = nodeB.y - nodeA.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONFIG.connectionDistance) {
                        const opacity = (1 - dist / CONFIG.connectionDistance) * CONFIG.connectionOpacity;

                        // Gradient line
                        const gradient = this.ctx.createLinearGradient(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
                        gradient.addColorStop(0, `rgba(${nodeA.color.r}, ${nodeA.color.g}, ${nodeA.color.b}, ${opacity})`);
                        gradient.addColorStop(1, `rgba(${nodeB.color.r}, ${nodeB.color.g}, ${nodeB.color.b}, ${opacity})`);

                        this.ctx.beginPath();
                        this.ctx.moveTo(nodeA.x, nodeA.y);
                        this.ctx.lineTo(nodeB.x, nodeB.y);
                        this.ctx.strokeStyle = gradient;
                        this.ctx.lineWidth = 1;
                        this.ctx.stroke();
                    }
                }
            }
        }

        drawNodes() {
            this.nodes.forEach(node => {
                const pulse = 1 + Math.sin(node.pulsePhase) * 0.3;
                const glowRadius = node.radius * 3 * pulse;

                // Outer glow
                const gradient = this.ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, glowRadius
                );
                gradient.addColorStop(0, `rgba(${node.color.r}, ${node.color.g}, ${node.color.b}, 0.4)`);
                gradient.addColorStop(0.5, `rgba(${node.color.r}, ${node.color.g}, ${node.color.b}, 0.1)`);
                gradient.addColorStop(1, 'transparent');

                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();

                // Core
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${node.color.r}, ${node.color.g}, ${node.color.b}, 0.8)`;
                this.ctx.fill();

                // Inner bright spot
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.radius * 0.3 * pulse, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.fill();
            });
        }

        drawParticles() {
            this.particles.forEach(particle => {
                // Draw particle core (no trail - cleaner look)
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 1)`;
                this.ctx.fill();

                // Soft glow around particle
                const glow = this.ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 6
                );
                glow.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.6)`);
                glow.addColorStop(0.4, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.2)`);
                glow.addColorStop(1, 'transparent');

                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size * 6, 0, Math.PI * 2);
                this.ctx.fillStyle = glow;
                this.ctx.fill();
            });
        }

        animate() {
            this.time += 0.016; // ~60fps time step

            this.updateNodes();
            this.updateParticles();
            this.draw();

            this.animationId = requestAnimationFrame(() => this.animate());
        }

        destroy() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new NeuralBackground());
    } else {
        new NeuralBackground();
    }
})();
