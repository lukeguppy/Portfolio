// ================================================
// ABOUT ME BACKGROUND
// Dual-state Canvas Animation:
// 1. Hero: Orbital Nucleus (User as core of their universe)
// 2. Experience: Data Flow (Matrix-lite vertical streams)
// ================================================

(function () {
    'use strict';

    const CONFIG = {
        // Shared Colors
        colors: {
            teal: { r: 20, g: 184, b: 166 },
            purple: { r: 139, g: 92, b: 246 },
            cyan: { r: 6, g: 182, b: 212 },
            bg: { r: 5, g: 5, b: 8 }
        },

        // Hero: Orbital Nucleus
        orb: {
            coreRadius: 40,
            ringCount: 3,
            particleCount: 60,
            baseSpeed: 0.005
        },

        // Experience: Data Stream
        stream: {
            columnCount: 30, // calculated based on width
            charSize: 14,
            speed: 2,
            density: 0.95 // chance of NOT dropping a character
        }
    };

    class AboutBackground {
        constructor() {
            this.container = document.getElementById('about-bg-container');
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');

            // State
            this.width = 0;
            this.height = 0;
            this.scrollY = 0;
            this.heroOpacity = 1;
            this.expOpacity = 0;
            this.time = 0;

            // Hero Objects
            this.rings = [];
            this.heroParticles = [];

            // Experience Objects
            this.streams = [];

            this.init();
        }

        init() {
            // Setup Canvas
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                pointer-events: none;
            `;
            this.container.appendChild(this.canvas);

            this.resize();
            this.initHero();
            this.initExperience();
            this.bindEvents();
            this.animate();
        }

        resize() {
            const dpr = window.devicePixelRatio || 1;
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            this.ctx.scale(dpr, dpr);

            // Re-init streams on resize to fit width
            this.initExperience();
        }

        initHero() {
            // Create Rings
            for (let i = 0; i < CONFIG.orb.ringCount; i++) {
                this.rings.push({
                    radius: 120 + i * 80,
                    angle: Math.random() * Math.PI * 2,
                    speed: (i % 2 === 0 ? 1 : -1) * (0.002 + Math.random() * 0.002),
                    color: i === 0 ? CONFIG.colors.teal : (i === 1 ? CONFIG.colors.purple : CONFIG.colors.cyan),
                    width: 1 + Math.random() * 2,
                    dash: 20 + Math.random() * 100
                });
            }

            // Create Particles
            for (let i = 0; i < CONFIG.orb.particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 60 + Math.random() * 400;
                this.heroParticles.push({
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist, // relative to center
                    z: Math.random() * 2, // fake depth speed multiplier
                    size: 0.5 + Math.random() * 2,
                    angle: angle,
                    dist: dist,
                    speed: 0.005 + Math.random() * 0.01,
                    color: Math.random() > 0.5 ? CONFIG.colors.teal : CONFIG.colors.purple
                });
            }
        }

        initExperience() {
            this.streams = [];
            const cols = Math.floor(this.width / CONFIG.stream.charSize);

            for (let i = 0; i < cols; i++) {
                this.streams.push({
                    x: i * CONFIG.stream.charSize,
                    y: Math.random() * -1000,
                    speed: 2 + Math.random() * 3,
                    chars: [],
                    color: Math.random() > 0.7 ? CONFIG.colors.teal : CONFIG.colors.cyan
                });
            }
        }

        bindEvents() {
            window.addEventListener('resize', () => this.resize());
            window.addEventListener('scroll', () => {
                this.scrollY = window.scrollY;
                this.updateOpacity();
            }, { passive: true });

            // Initial opacity check
            this.updateOpacity();
        }

        updateOpacity() {
            const vh = window.innerHeight;
            const scroll = this.scrollY;

            // Hero fades out 0% -> 50% scroll
            this.heroOpacity = Math.max(0, 1 - (scroll / (vh * 0.6)));

            // Experience fades in 30% -> 80% scroll
            this.expOpacity = Math.min(1, Math.max(0, (scroll - (vh * 0.3)) / (vh * 0.5)));
        }

        update() {
            this.time += 0.01;

            // --- HERO UPDATE ---
            if (this.heroOpacity > 0.01) {
                // Rotate Rings
                this.rings.forEach(ring => {
                    ring.angle += ring.speed;
                });

                // Move Particles
                this.heroParticles.forEach(p => {
                    p.angle += p.speed;
                    // Orbit
                    p.x = Math.cos(p.angle) * p.dist;
                    p.y = Math.sin(p.angle) * p.dist;
                });
            }

            // --- EXPERIENCE UPDATE ---
            if (this.expOpacity > 0.01) {
                this.streams.forEach(s => {
                    s.y += s.speed;

                    // Reset if off screen
                    if (s.y > this.height) {
                        s.y = Math.random() * -200;
                        s.speed = 2 + Math.random() * 3;
                    }

                    // Randomly add trail characters
                    if (Math.random() > 0.9) {
                        s.chars.push({
                            y: s.y,
                            life: 1
                        });
                    }

                    // Update trail
                    for (let i = s.chars.length - 1; i >= 0; i--) {
                        s.chars[i].life -= 0.02;
                        if (s.chars[i].life <= 0) s.chars.splice(i, 1);
                    }
                });
            }
        }

        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            const cx = this.width / 2;
            const cy = this.height / 2;

            // --- DRAW HERO ---
            if (this.heroOpacity > 0.01) {
                this.ctx.save();
                this.ctx.globalAlpha = this.heroOpacity;
                this.ctx.translate(cx, cy);

                // Core (Nucleus)
                const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, CONFIG.orb.coreRadius * 2);
                grad.addColorStop(0, `rgba(${CONFIG.colors.teal.r}, ${CONFIG.colors.teal.g}, ${CONFIG.colors.teal.b}, 1)`);
                grad.addColorStop(0.5, `rgba(${CONFIG.colors.teal.r}, ${CONFIG.colors.teal.g}, ${CONFIG.colors.teal.b}, 0.2)`);
                grad.addColorStop(1, 'transparent');

                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, CONFIG.orb.coreRadius * 2, 0, Math.PI * 2);
                this.ctx.fill();

                // Rings
                this.rings.forEach(ring => {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, ring.radius, ring.angle, ring.angle + Math.PI * 1.5); // Open rings
                    this.ctx.strokeStyle = `rgba(${ring.color.r}, ${ring.color.g}, ${ring.color.b}, 0.3)`;
                    this.ctx.lineWidth = ring.width;
                    this.ctx.stroke();
                });

                // Particles
                this.heroParticles.forEach(p => {
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.8)`;
                    this.ctx.fill();
                });

                this.ctx.restore();
            }

            // --- DRAW EXPERIENCE ---
            if (this.expOpacity > 0.01) {
                this.ctx.save();
                this.ctx.globalAlpha = this.expOpacity;

                this.streams.forEach(s => {
                    // Head of stream
                    this.ctx.fillStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, 0.8)`;
                    this.ctx.fillRect(s.x, s.y, 2, 2);

                    // Trail
                    s.chars.forEach(c => {
                        this.ctx.fillStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${c.life * 0.4})`;
                        this.ctx.fillRect(s.x, c.y, 1.5, 6); // Elongated "data" bit
                    });
                });

                this.ctx.restore();
            }
        }

        animate() {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.animate());
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new AboutBackground());
    } else {
        new AboutBackground();
    }
})();
