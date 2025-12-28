
// ================================================
// EXPLORE & TECHNOLOGIES SECTION BACKGROUNDS
// Completely distinct designs - no clashing with content
// ================================================

(function () {
    'use strict';

    class SectionBackgrounds {
        constructor() {
            this.exploreBg = null;
            this.techBg = null;

            this.init();
        }

        init() {
            // ========================================
            // EXPLORE SECTION - Soft horizontal gradient bands
            // Clean, minimal, doesn't compete with content
            // ========================================
            this.exploreBg = document.createElement('div');
            this.exploreBg.id = 'explore-bg';
            this.exploreBg.style.cssText = `
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
pointer-events: none;
z-index: -3;
opacity: 0;
transition: opacity 0.8s ease;
background:
linear-gradient(180deg,
    transparent 0 %,
    rgba(139, 92, 246, 0.04) 20 %,
    rgba(6, 182, 212, 0.06) 50 %,
    rgba(139, 92, 246, 0.04) 80 %,
    transparent 100 %
                    );
`;

            // Top edge glow
            const topGlow = document.createElement('div');
            topGlow.style.cssText = `
position: absolute;
top: 0;
left: 0;
right: 0;
height: 200px;
background: linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, transparent 100%);
animation: edgePulse 8s ease -in -out infinite;
`;
            this.exploreBg.appendChild(topGlow);

            // Bottom edge glow
            const bottomGlow = document.createElement('div');
            bottomGlow.style.cssText = `
position: absolute;
bottom: 0;
left: 0;
right: 0;
height: 200px;
background: linear - gradient(0deg, rgba(6, 182, 212, 0.08) 0 %, transparent 100 %);
animation: edgePulse 8s ease -in -out infinite 4s;
`;
            this.exploreBg.appendChild(bottomGlow);

            document.body.insertBefore(this.exploreBg, document.body.firstChild);

            // ========================================
            // TECH SECTION - Corner accent glows
            // Subtle corner emphasis, keeps center clear for solar system
            // ========================================
            this.techBg = document.createElement('div');
            this.techBg.id = 'tech-bg';
            this.techBg.style.cssText = `
position: fixed;
top: 0;
left: 0;
width: 100 %;
height: 100 %;
pointer - events: none;
z - index: -4;
opacity: 0;
transition: opacity 0.8s ease;
`;

            // Top-left corner glow
            const cornerTL = document.createElement('div');
            cornerTL.style.cssText = `
position: absolute;
top: 0;
left: 0;
width: 40 %;
height: 40 %;
background: radial - gradient(ellipse at 0 % 0 %, rgba(20, 184, 166, 0.1) 0 %, transparent 70 %);
animation: cornerGlow 10s ease -in -out infinite;
`;
            this.techBg.appendChild(cornerTL);

            // Top-right corner glow
            const cornerTR = document.createElement('div');
            cornerTR.style.cssText = `
position: absolute;
top: 0;
right: 0;
width: 35 %;
height: 35 %;
background: radial - gradient(ellipse at 100 % 0 %, rgba(6, 182, 212, 0.08) 0 %, transparent 70 %);
animation: cornerGlow 12s ease -in -out infinite 3s;
`;
            this.techBg.appendChild(cornerTR);

            // Bottom-left corner glow
            const cornerBL = document.createElement('div');
            cornerBL.style.cssText = `
position: absolute;
bottom: 0;
left: 0;
width: 35 %;
height: 35 %;
background: radial - gradient(ellipse at 0 % 100 %, rgba(139, 92, 246, 0.08) 0 %, transparent 70 %);
animation: cornerGlow 11s ease -in -out infinite 5s;
`;
            this.techBg.appendChild(cornerBL);

            // Bottom-right corner glow
            const cornerBR = document.createElement('div');
            cornerBR.style.cssText = `
position: absolute;
bottom: 0;
right: 0;
width: 40 %;
height: 40 %;
background: radial - gradient(ellipse at 100 % 100 %, rgba(20, 184, 166, 0.1) 0 %, transparent 70 %);
animation: cornerGlow 9s ease -in -out infinite 7s;
`;
            this.techBg.appendChild(cornerBR);

            document.body.insertBefore(this.techBg, document.body.firstChild);

            // Add keyframe animations
            const style = document.createElement('style');
            style.textContent = `
@keyframes edgePulse {
    0 %, 100 % { opacity: 0.5; }
    50 % { opacity: 1; }
}
@keyframes cornerGlow {
    0 %, 100 % {
        opacity: 0.6;
        transform: scale(1);
    }
    50 % {
        opacity: 1;
        transform: scale(1.1);
    }
}
`;
            document.head.appendChild(style);

            this.bindEvents();
        }

        bindEvents() {
            window.addEventListener('scroll', () => {
                const scrollY = window.pageYOffset;
                const vh = window.innerHeight;

                // EXPLORE SECTION
                const exploreStart = vh * 2.8;
                const exploreFadeIn = vh * 3.2;
                const exploreFadeOut = vh * 5.0;
                const exploreEnd = vh * 5.5;

                if (scrollY < exploreStart) {
                    this.exploreBg.style.opacity = 0;
                } else if (scrollY < exploreFadeIn) {
                    this.exploreBg.style.opacity = (scrollY - exploreStart) / (exploreFadeIn - exploreStart);
                } else if (scrollY < exploreFadeOut) {
                    this.exploreBg.style.opacity = 1;
                } else if (scrollY < exploreEnd) {
                    this.exploreBg.style.opacity = 1 - (scrollY - exploreFadeOut) / (exploreEnd - exploreFadeOut);
                } else {
                    this.exploreBg.style.opacity = 0;
                }

                // TECH SECTION
                const techStart = vh * 5.0;
                const techFadeIn = vh * 5.5;

                if (scrollY < techStart) {
                    this.techBg.style.opacity = 0;
                } else if (scrollY < techFadeIn) {
                    this.techBg.style.opacity = (scrollY - techStart) / (techFadeIn - techStart);
                } else {
                    this.techBg.style.opacity = 1;
                }

            }, { passive: true });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new SectionBackgrounds());
    } else {
        new SectionBackgrounds();
    }
})();
