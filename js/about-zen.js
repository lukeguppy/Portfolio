// ================================================
// ZEN GARDEN BACKGROUND
// Interactive Sand Ripples + Floating Stones
// Top-down view of raked sand that reacts to mouse
// ================================================

(function () {
    'use strict';

    const CONFIG = {
        sandColor: '#e5e0d8', // Warm light sand
        shadowColor: '#d6d0c4', // Darker sand for shadows
        lineSpacing: 15, // Space between rake lines
        amplitude: 0, // Base waviness (0 = straight lines)
        interactionRadius: 200, // Mouse influence
        interactionStrength: 25, // How much lines bend
    };

    class ZenGarden {
        constructor() {
            this.container = document.getElementById('zen-bg-container');
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');

            // Interaction State
            this.mouseX = -1000;
            this.mouseY = -1000;
            this.targetMouseX = -1000;
            this.targetMouseY = -1000;

            // Animation State
            this.width = 0;
            this.height = 0;
            this.time = 0;

            this.init();
        }

        init() {
            if (!this.container) return; // Guard clause if element missing

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
            this.bindEvents();
            this.animate();
        }

        resize() {
            const dpr = window.devicePixelRatio || 1;
            this.width = this.container.offsetWidth;
            this.height = this.container.offsetHeight;

            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            this.ctx.scale(dpr, dpr);
        }

        bindEvents() {
            window.addEventListener('resize', () => this.resize());

            // Track mouse relative to the section
            window.addEventListener('mousemove', (e) => {
                const rect = this.container.getBoundingClientRect();
                this.targetMouseX = e.clientX - rect.left;
                this.targetMouseY = e.clientY - rect.top;
            });

            // "Float" effect for stones (handled via CSS transform, but we can add subtle canvas glow if needed)
        }

        update() {
            this.time += 0.02;

            // Smooth mouse follow
            this.mouseX += (this.targetMouseX - this.mouseX) * 0.1;
            this.mouseY += (this.targetMouseY - this.mouseY) * 0.1;
        }

        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Fill entire canvas with gradient stripes for smooth sand ripple effect
            // This creates natural lighting - light on ridge tops, shadow in grooves
            const spacing = CONFIG.lineSpacing;

            for (let y = 0; y < this.height + spacing; y += spacing) {
                // Create vertical gradient for each "wave" stripe
                const gradient = this.ctx.createLinearGradient(0, y - spacing / 2, 0, y + spacing / 2);

                // Smoother gradient with more intermediate stops
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.18)');    // Ridge highlight
                gradient.addColorStop(0.15, 'rgba(230, 215, 190, 0.12)'); // Blend
                gradient.addColorStop(0.25, 'rgba(200, 185, 160, 0.08)'); // Transition
                gradient.addColorStop(0.4, 'rgba(160, 140, 120, 0.12)');  // Approaching groove
                gradient.addColorStop(0.5, 'rgba(130, 115, 95, 0.15)');   // Groove shadow (center)
                gradient.addColorStop(0.6, 'rgba(160, 140, 120, 0.12)');  // Leaving groove
                gradient.addColorStop(0.75, 'rgba(200, 185, 160, 0.08)'); // Transition
                gradient.addColorStop(0.85, 'rgba(230, 215, 190, 0.12)'); // Blend
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0.18)');    // Next ridge

                this.ctx.fillStyle = gradient;

                // Draw wavey stripe with mouse interaction
                this.ctx.beginPath();

                const segments = 60;
                const segWidth = this.width / segments;

                // Top edge of stripe
                for (let j = 0; j <= segments; j++) {
                    const x = j * segWidth;

                    // Gentle wave animation only (no mouse interaction)
                    const yOffset = Math.sin(x * 0.005 + this.time * 0.2) * 2;

                    const py = y - spacing / 2 + yOffset;
                    if (j === 0) this.ctx.moveTo(x, py);
                    else this.ctx.lineTo(x, py);
                }

                // Bottom edge of stripe (reverse)
                for (let j = segments; j >= 0; j--) {
                    const x = j * segWidth;
                    const yOffset = Math.sin(x * 0.005 + this.time * 0.2) * 2;

                    const py = y + spacing / 2 + yOffset;
                    this.ctx.lineTo(x, py);
                }

                this.ctx.closePath();
                this.ctx.fill();
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
        document.addEventListener('DOMContentLoaded', () => {
            if (document.querySelector('.zen-garden-section')) {
                new ZenGarden();
            }
        });
    } else {
        if (document.querySelector('.zen-garden-section')) {
            new ZenGarden();
        }
    }
})();
