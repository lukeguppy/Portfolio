// ================================================
// ABOUT PAGE - POLAROID PINBOARD ANIMATION
// Projects: scroll-distance based phases
// Tech: CSS sticky handles pinning, JS handles animations
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ========================================
    // CONFIG
    // ========================================
    const CONFIG = {
        // Projects section (in vh)
        bgFade: 0.1,
        titleDrop: 0.35,
        rowAnimate: 0.5,
        rowPause: 0.8,              // Increased to give time to read
        rowScrollUp: 0.55,
        shrinkToFit: 1.2,           // Shrink content to fit all cards before frame (longer for visible transition)
        projectsLeaveScroll: null,  // Will be calculated dynamically
        cardsPerRow: 3,             // REQUIRED for grid calculation
    };

    // ========================================
    // DOM ELEMENTS
    // ========================================
    const pinboardSection = document.querySelector('.pinboard-section');
    const pinboardBg = document.querySelector('.pinboard-bg');
    const pinboardContent = document.querySelector('.pinboard-content');
    const pinboardOverlay = document.querySelector('.pinboard-overlay');
    const projectsTitle = document.querySelector('.pinboard-title[data-phase="title"]');
    const projectCards = [...document.querySelectorAll('.polaroid-card')];

    if (!pinboardSection || !pinboardBg || !pinboardContent) return;

    // Zen Garden Section (for timing calculations)
    const zenGardenSection = document.querySelector('.zen-garden-section');

    // ========================================
    // LAYOUT CACHE & RESIZE HANDLER
    // ========================================
    const layout = {
        windowHeight: window.innerHeight,
        pinboard: { top: 0, height: 0, bottom: 0 },
        zenGarden: { top: 0 },
        projects: { scrollBeforeLeave: 0 }
    };

    function updateLayoutValues() {
        layout.windowHeight = window.innerHeight;

        // Measure Pinboard
        if (pinboardSection) {
            // We need absolute position relative to document
            layout.pinboard.top = pinboardSection.offsetTop;
            // Height is set by buildProjectPhases -> projectsEndScroll
        }

        // Measure Zen Garden
        if (zenGardenSection) {
            layout.zenGarden.top = zenGardenSection.offsetTop;
        }

        updateCachedValues(); // Update CSS comparisons (padding etc)
    }

    // ========================================
    // PROJECTS PHASE BUILDER & TIMING
    // ========================================

    // Define rows for animation logic
    const numProjectRows = Math.ceil(projectCards.length / CONFIG.cardsPerRow);
    const projectRows = [];
    for (let i = 0; i < projectCards.length; i += CONFIG.cardsPerRow) {
        projectRows.push(projectCards.slice(i, i + CONFIG.cardsPerRow));
    }

    let projectTimeline = { phases: [], projectsEndScroll: 0 };

    function buildProjectPhases() {
        const vh = window.innerHeight;
        const phases = [];
        let pos = 0;

        function add(name, duration, type = 'frozen') {
            phases.push({ name, start: pos, end: pos + duration * vh, type });
            pos += duration * vh;
        }

        add('bg-fade', CONFIG.bgFade);
        add('projects-title', CONFIG.titleDrop);

        for (let i = 0; i < numProjectRows; i++) {
            add(`row-${i}-animate`, CONFIG.rowAnimate);
            add(`row-${i}-pause`, CONFIG.rowPause);
            if (i < numProjectRows - 1) {
                add(`row-${i}-scroll-up`, CONFIG.rowScrollUp, 'scroll');
            }
        }

        // NEW PHASE: Shrink content to fit all cards on screen before frame appears
        if (pinboardContent) pinboardContent.style.willChange = 'transform';
        add('projects-shrink-to-fit', CONFIG.shrinkToFit);

        // ========================================
        // CALCULATE LEAVE SCROLL DURATION
        // ========================================
        const projectsScrollBeforeLeave = pos;
        layout.projects.scrollBeforeLeave = projectsScrollBeforeLeave;

        // Use fixed duration for consistency and performance
        const leaveScrollDuration = 3.0;
        add('projects-leave', leaveScrollDuration, 'scroll');

        return { phases, projectsEndScroll: pos };
    }

    // ========================================
    // CACHED VALUES (Optimization)
    // ========================================
    let cachedPaddingTop = 0;
    let cachedContentHeight = 0;
    let cachedZenTree = null;
    let cachedLandingConfig = null;
    let cachedScaleDelta = 0;
    let cachedCenterOffset = 0;
    let cachedContentTransform = '';

    // Constants
    const FRAME_THRESHOLD = 0.15;
    const FRAME_INVERSE = 1 / (1 - FRAME_THRESHOLD);
    const CONTENT_SHRUNK_SCALE = 0.55;

    function updateCachedValues() {
        const vh = window.innerHeight;
        const styles = getComputedStyle(pinboardContent);
        cachedPaddingTop = parseFloat(styles.paddingTop) || 0;
        cachedContentHeight = pinboardContent.scrollHeight;
        cachedZenTree = document.querySelector('.zen-tree-container');
        cachedLandingConfig = getPinboardLandingConfig();

        cachedScaleDelta = 1 - cachedLandingConfig.scale;

        const scaledHeight = cachedContentHeight * CONTENT_SHRUNK_SCALE;
        const basicCenter = (vh - scaledHeight) / 2;
        cachedCenterOffset = basicCenter - (cachedPaddingTop * CONTENT_SHRUNK_SCALE / 2);
        cachedContentTransform = `translateY(${cachedCenterOffset}px) scale(${CONTENT_SHRUNK_SCALE})`;
    }

    // ========================================
    // MASTER LAYOUT UPDATE
    // ========================================
    function rebuildLayout() {
        // 1. Build Phases (pure math)
        projectTimeline = buildProjectPhases();

        // 2. Update cached element metrics (forces layout read, do once)
        updateCachedValues();

        // 3. Set Section Height (Write)
        const height = projectTimeline.projectsEndScroll;
        pinboardSection.style.minHeight = `${height}px`;

        // 4. Cache absolute positions (Read - now safe after write)
        layout.windowHeight = window.innerHeight;
        layout.pinboard.height = height;
        // NOTE: We do NOT cache layout.pinboard.top anymore because it can shift 
        // if previous sections (Experience) resize dynamically.
        // We will read rect.top in the loop (Read-Then-Write pattern).
    }



    // ========================================
    // HELPERS (Optimized)
    // ========================================
    function getProjectPhaseInfo(scrollPos) {
        for (let i = 0; i < projectTimeline.phases.length; i++) {
            const p = projectTimeline.phases[i];
            if (scrollPos >= p.start && scrollPos < p.end) {
                return { phase: p, progress: (scrollPos - p.start) / (p.end - p.start), idx: i };
            }
        }
        const last = projectTimeline.phases[projectTimeline.phases.length - 1];
        if (scrollPos >= last.end) return { phase: { name: 'projects-complete' }, progress: 1, idx: 999 };
        return { phase: { name: 'before' }, progress: 0, idx: -1 };
    }

    function getProjectIdx(name) {
        return projectTimeline.phases.findIndex(p => p.name === name);
    }

    function getProjectOffset(scrollPos) {
        let offset = 0;
        for (const p of projectTimeline.phases) {
            if (p.type === 'scroll') {
                if (scrollPos >= p.end) offset += p.end - p.start;
                else if (scrollPos >= p.start) offset += scrollPos - p.start;
            }
        }
        return offset;
    }

    function getPinboardLandingConfig() {
        const cfg = window.ZEN_TREE_CONFIG || {
            treeX: 0.25, treeY: 0.95, pinboardLandingOffsetX: 80, pinboardLandingOffsetY: -300,
            pinboardLandingRotation: -8, pinboardScale: 0.15,
        };
        const treeVW = cfg.treeX * 100;
        const treeVH = cfg.treeY * 100;
        const END_X = treeVW - 50 + (cfg.pinboardLandingOffsetX / window.innerWidth * 100);
        const END_Y = treeVH - 50 + (cfg.pinboardLandingOffsetY / window.innerHeight * 100);
        return { scale: cfg.pinboardScale, x: END_X, y: END_Y, rot: cfg.pinboardLandingRotation };
    }

    // Animation Helpers (DOM Writes)
    function animateTitle(el, progress) {
        if (!el) return;
        const p = Math.max(0, Math.min(1, progress));
        if (Math.abs(el._lastP - p) < 0.001) return;
        el.style.opacity = String(p);
        el.style.transform = `translateY(${-30 * (1 - p)}px) rotate(${-2 * (1 - p)}deg)`;
        el.classList.toggle('pinned', p >= 0.9);
        el._lastP = p;
    }

    function showTitle(el) {
        if (!el || el._isVisible) return;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) rotate(0)';
        el.classList.add('pinned');
        el._isVisible = true; el._lastP = 1;
    }

    function hideTitle(el) {
        if (!el || !el._isVisible) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(-30px) rotate(-2deg)';
        el.classList.remove('pinned');
        el._isVisible = false; el._lastP = 0;
    }

    function animateCard(card, progress, yDist = 80) {
        const p = Math.max(0, Math.min(1, progress));
        if (Math.abs(card._lastP - p) < 0.001) return;
        const finalRot = card._cachedRot || '0deg';
        card.style.opacity = String(p);
        card.style.transform = `translateY(${yDist * (1 - p)}px) rotate(${finalRot})`;
        card.classList.toggle('pinned', p >= 1);
        card._lastP = p;
        card._isVisible = p > 0;
    }

    function showCard(card) {
        if (card._isVisible && card._lastP === 1) return;
        const finalRot = card._cachedRot || '0deg';
        card.style.opacity = '1';
        card.style.transform = `translateY(0) rotate(${finalRot})`;
        card.classList.add('pinned');
        card._isVisible = true; card._lastP = 1;
    }

    function hideCard(card) {
        if (!card._isVisible && card._lastP === 0) return;
        const finalRot = card._cachedRot || '0deg';
        card.style.opacity = '0';
        card.style.transform = `translateY(80px) rotate(${finalRot})`;
        card.classList.remove('pinned');
        card._isVisible = false; card._lastP = 0;
    }

    function cacheCardRotations() {
        projectCards.forEach(card => {
            const style = getComputedStyle(card);
            card._cachedRot = style.getPropertyValue('--rotation') || '0deg';
        });
    }

    // ========================================
    // MAIN UPDATE LOOP
    // ========================================
    function update() {
        // 1. READ PHASE: Get position relative to viewport
        // This is necessary because previous sections might change height
        const rect = pinboardSection.getBoundingClientRect();
        const scrollPos = Math.max(0, -rect.top); // Pixels scrolled INTO the section

        // Optimization: If completely off-screen (below) or far above, skip
        // Note: rect.top is positive when section is below view
        if (rect.top > layout.windowHeight) {
            // Ensure it's hidden if offscreen
            if (pinboardBg.classList.contains('visible')) pinboardBg.classList.remove('visible');
            return;
        }

        // if (rect.bottom < 0) return; // REMOVED PREMATURE RETURN for testing

        const { phase, progress, idx } = getProjectPhaseInfo(scrollPos);

        // --- BACKGROUND VISIBILITY ---
        // Visible if: 
        // 1. Projects Complete (Locked)
        // 2. Projects Leave > 50% (Transitioning out)
        // 3. In View (Top < 60vh AND Bottom > 10vh)
        const isVisible = (phase.name === 'projects-complete') ||
            (phase.name === 'projects-leave' && progress > 0.5) ||
            (rect.top < layout.windowHeight * 0.8 && rect.bottom > 0); // Relaxed visibility rules

        if (pinboardBg._cachedVis !== isVisible) {
            pinboardBg.classList.toggle('visible', isVisible);
            pinboardBg._cachedVis = isVisible;
        }

        const zenBg = document.getElementById('zen-bg-container');
        const vh = layout.windowHeight;

        if (phase.name === 'projects-shrink-to-fit') {
            const shrinkProgress = progress;
            const frozenOffset = getProjectOffset(projectTimeline.phases.find(p => p.name === 'projects-shrink-to-fit').start);

            const startScale = 1.0;
            const endScale = 0.55;
            const scale = startScale - (shrinkProgress * (startScale - endScale));
            const currentOffset = frozenOffset * (1 - shrinkProgress);

            const dynamicCenter = ((vh - (cachedContentHeight * scale)) / 2) - (cachedPaddingTop * scale / 2);

            pinboardContent.style.transform = `translateY(-${currentOffset}px) translateY(${dynamicCenter * shrinkProgress}px) scale(${scale})`;
            pinboardContent.style.transformOrigin = 'top center';

            pinboardBg.style.transform = 'none';
            pinboardBg.style.borderRadius = '0';

            // ANIMATE BORDER IN DURING SHRINK
            // APPLY TO OVERLAY BECAUSE IT SITS ON TOP
            const borderWidth = shrinkProgress * 30;
            if (pinboardOverlay) {
                pinboardOverlay.style.opacity = String(shrinkProgress);
                pinboardOverlay.style.boxShadow = `inset 0 0 0 ${borderWidth}px #3e2723`;
            }

            // Clear shadow from parent just in case
            pinboardBg.style.boxShadow = 'none';
            pinboardBg.style.border = '0px solid transparent';

            if (zenBg && !zenBg._vis) { zenBg.classList.add('visible'); zenBg._vis = true; }
            if (cachedZenTree && !cachedZenTree._vis) { cachedZenTree.classList.add('visible'); cachedZenTree._vis = true; }

            // Fix: Ensure title is hidden during shrink
            if (projectsTitle) {
                projectsTitle.style.opacity = '0';
                projectsTitle.style.transform = `translateY(${-30 * shrinkProgress}px)`;
            }

        } else if (phase.name === 'projects-leave') {
            const leaveProgress = progress;
            if (pinboardOverlay) pinboardOverlay.style.opacity = '1';

            const showZen = leaveProgress > 0.05;
            if (zenBg && zenBg._vis !== showZen) { zenBg.classList.toggle('visible', showZen); zenBg._vis = showZen; }
            if (cachedZenTree && cachedZenTree._vis !== showZen) { cachedZenTree.classList.toggle('visible', showZen); cachedZenTree._vis = showZen; }

            // Fix: Title should remain hidden
            if (projectsTitle) {
                projectsTitle.style.opacity = '0';
            }

            pinboardContent.style.transform = cachedContentTransform;
            pinboardContent.style.transformOrigin = 'top center';

            // OPTIMIZATION: Use box-shadow inset instead of border-width to avoid layout thrashing

            // We removed FRAME_THRESHOLD logic because border animates in "shrink" phase now.
            // Just scale and move immediately.
            const scale = 1 - (leaveProgress * cachedScaleDelta);
            const transX = cachedLandingConfig.x * leaveProgress;
            const transY = cachedLandingConfig.y * leaveProgress;
            const rot = cachedLandingConfig.rot * leaveProgress;

            pinboardBg.style.transform = `translate3d(${transX}vw, ${transY}vh, 0) scale(${scale}) rotate(${rot}deg)`;
            pinboardBg.style.borderRadius = `${leaveProgress * 10}px`;

            // Keep the visual border via box-shadow ON THE OVERLAY
            if (pinboardOverlay) {
                pinboardOverlay.style.boxShadow = `inset 0 0 0 30px #3e2723`;
                // Ensure overlay roundness matches parent
                pinboardOverlay.style.borderRadius = `${leaveProgress * 10}px`;
            }
            pinboardBg.style.boxShadow = 'none';
            pinboardBg.style.border = '0px solid transparent';

            pinboardBg.style.boxSizing = 'border-box';

        } else if (phase.name === 'projects-complete') {
            if (zenBg && !zenBg._vis) { zenBg.classList.add('visible'); zenBg._vis = true; }
            if (cachedZenTree && !cachedZenTree._vis) { cachedZenTree.classList.add('visible'); cachedZenTree._vis = true; }




            // Match the box-shadow style ON OVERLAY
            if (pinboardOverlay) {
                pinboardOverlay.style.boxShadow = `inset 0 0 0 30px #3e2723`;
                pinboardOverlay.style.borderRadius = '10px';
            }
            pinboardBg.style.boxShadow = 'none';
            pinboardBg.style.border = '0px solid transparent';
            pinboardBg.style.boxSizing = 'border-box';
            pinboardBg.style.borderRadius = '10px';
            pinboardBg.classList.add('visible');

            const transform = `translate3d(${cachedLandingConfig.x}vw, ${cachedLandingConfig.y}vh, 0) scale(${cachedLandingConfig.scale}) rotate(${cachedLandingConfig.rot}deg)`;
            if (pinboardBg._currTransform !== transform) {
                pinboardBg.style.transform = transform;
                pinboardBg._currTransform = transform;
            }

            pinboardContent.style.transform = cachedContentTransform;
            pinboardContent.style.transformOrigin = 'top center';

        } else {
            const isLastRowPause = phase.name === `row-${numProjectRows - 1}-pause`;
            if (isLastRowPause && (!zenBg || !zenBg._vis)) {
                if (zenBg) { zenBg.classList.add('visible'); zenBg._vis = true; }
                if (cachedZenTree) { cachedZenTree.classList.add('visible'); cachedZenTree._vis = true; }
            } else if (!isLastRowPause && (zenBg && zenBg._vis)) {
                if (zenBg) { zenBg.classList.remove('visible'); zenBg._vis = false; }
                if (cachedZenTree) { cachedZenTree.classList.remove('visible'); cachedZenTree._vis = false; }
            }

            pinboardBg.style.border = '0px solid transparent';
            pinboardBg.style.boxShadow = 'none'; // Ensure reset
            pinboardBg.style.transform = 'none';
            pinboardBg.style.borderRadius = '0';
            pinboardContent.style.transform = 'none';
            if (pinboardOverlay) {
                pinboardOverlay.style.opacity = '0';
                pinboardOverlay.style.boxShadow = 'none';
                pinboardOverlay.style.borderRadius = '0';
            }

            const projectOffset = getProjectOffset(scrollPos);
            pinboardContent.style.transform = `translateY(-${projectOffset}px)`;

            const projTitleIdx = getProjectIdx('projects-title');
            const row0PauseIdx = getProjectIdx('row-0-pause');

            if (phase.name === 'projects-title') animateTitle(projectsTitle, progress);
            else if (phase.name === 'row-0-scrollup') {
                const fadeOut = 1 - progress;
                if (projectsTitle) {
                    projectsTitle.style.opacity = String(fadeOut);
                    projectsTitle.style.transform = `translateY(${-30 * progress}px) rotate(0)`;
                }
            } else if (idx > projTitleIdx && idx <= row0PauseIdx) showTitle(projectsTitle);
            else hideTitle(projectsTitle);

            if (projectRows.length > 0) {
                for (let i = 0; i < numProjectRows; i++) {
                    const rowIdx = getProjectIdx(`row-${i}-animate`);
                    if (phase.name === `row-${i}-animate`) {
                        projectRows[i]?.forEach(c => animateCard(c, progress));
                    } else if (idx > rowIdx) {
                        projectRows[i]?.forEach(c => showCard(c));
                    } else {
                        projectRows[i]?.forEach(c => hideCard(c));
                    }
                }
            }
        }
    }

    // ========================================
    // INIT
    // ========================================
    let rafPending = false;
    function onScroll() {
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(() => {
                update();
                rafPending = false;
            });
        }
    }

    window.addEventListener('load', () => {
        cacheCardRotations();
        rebuildLayout();
        update();
    });

    cacheCardRotations();
    rebuildLayout();

    window.addEventListener('scroll', onScroll, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            rebuildLayout();
            update();
        }, 100);
    }, { passive: true });
});
