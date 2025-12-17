// ================================================
// "WHAT I BUILD" SECTION BACKGROUND
// Simple, performant CSS-injected background
// Subtle animated gradient - no heavy canvas work
// ================================================

(function () {
    'use strict';

    class PinnedBg {
        constructor() {
            this.element = null;
            this.opacity = 0;

            this.init();
        }

        init() {
            // Create a simple div overlay instead of canvas
            this.element = document.createElement('div');
            this.element.id = 'pinned-bg';
            this.element.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -2;
                opacity: 0;
                transition: opacity 0.8s ease;
                background: 
                    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(20, 184, 166, 0.08) 0%, transparent 50%),
                    radial-gradient(ellipse 60% 60% at 80% 60%, rgba(139, 92, 246, 0.06) 0%, transparent 50%),
                    radial-gradient(ellipse 50% 50% at 50% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%);
            `;
            document.body.insertBefore(this.element, document.body.firstChild);

            // Add animated glow layer
            const glowLayer = document.createElement('div');
            glowLayer.style.cssText = `
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at 30% 30%, rgba(20, 184, 166, 0.1) 0%, transparent 40%);
                animation: pinnedGlow 12s ease-in-out infinite;
            `;
            this.element.appendChild(glowLayer);

            // Add the keyframe animation via style tag
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pinnedGlow {
                    0%, 100% { 
                        opacity: 0.5; 
                        transform: translate(0, 0) scale(1);
                    }
                    50% { 
                        opacity: 1; 
                        transform: translate(30px, 20px) scale(1.1);
                    }
                }
            `;
            document.head.appendChild(style);

            this.bindEvents();
        }

        bindEvents() {
            window.addEventListener('scroll', () => {
                const scrollY = window.pageYOffset;
                const heroHeight = window.innerHeight;

                // Fade in when leaving hero section
                const fadeStart = heroHeight * 0.5;
                const fadeEnd = heroHeight * 0.9;

                if (scrollY < fadeStart) {
                    this.opacity = 0;
                } else if (scrollY > fadeEnd) {
                    this.opacity = 1;
                } else {
                    this.opacity = (scrollY - fadeStart) / (fadeEnd - fadeStart);
                }

                this.element.style.opacity = this.opacity;
            }, { passive: true });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new PinnedBg());
    } else {
        new PinnedBg();
    }
})();
