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
    // DYNAMIC SCROLL DURATION CALCULATION
    // Calculates exactly how much scroll is needed for zen garden to be fully visible
    // ========================================
    function calculateProjectsLeaveScroll() {
        if (!zenGardenSection) return 1.0; // Fallback

        const vh = window.innerHeight;

        // Get the height of pinboard section (before leave phase is added)
        // This is approximately the scroll distance through all projects
        // The zen garden section comes right after pinboard section

        // When we're at the START of projects-leave phase:
        // - We've scrolled through all project animations
        // - The zen garden section is still below the viewport

        // When we're at the END of projects-leave phase:
        // - The zen garden section top should be at viewport top (y=0)

        // The distance from zen garden section to viewport top (initially) is:
        // zenGardenSection.offsetTop - (scroll position when leave phase starts)

        // For the zen garden to be fully visible, we need to scroll an additional:
        // zenGardenSection.offsetTop - pinboardSection.offsetTop - allProjectScrollDistance

        // Simplified: measure the gap between pinboard bottom and zen garden top
        // plus one viewport height
        const pinboardHeight = pinboardSection.offsetHeight;
        const zenGardenTop = zenGardenSection.offsetTop;
        const pinboardTop = pinboardSection.offsetTop;

        // Distance from end of pinboard (after projects) to zen garden fully visible
        // = zenGardenTop - pinboardTop - (projects scroll) + vh
        // But we don't know exact projects scroll yet...

        // Actually, simpler approach:
        // The leave phase should take the user from seeing projects to seeing zen garden
        // The zen garden section is positioned right after pinboard
        // For its top to reach y=0, we need to scroll = zenGardenTop - currentScrollPosition

        // At the start of leave phase, scrollPos within pinboard = projectsEndScroll (before leave)
        // For zen garden top to reach 0: need to scroll until pinboardTop + scroll = zenGardenTop
        // So additional scroll = zenGardenTop - pinboardTop - projectsEndScroll

        // But we're calculating leave duration which IS part of projectsEndScroll...
        // Let's use fixed calculation: distance between sections / vh

        const distanceToZenGarden = zenGardenTop - pinboardTop;
        const leaveScrollVH = distanceToZenGarden / vh;

        // Return at least 1.0vh, cap at 5.0vh
        return Math.max(1.0, Math.min(5.0, leaveScrollVH * 0.3));
    }

    // ========================================
    // PROJECT ROWS
    // ========================================
    const numProjectRows = Math.ceil(projectCards.length / CONFIG.cardsPerRow);
    const projectRows = [];
    for (let i = 0; i < projectCards.length; i += CONFIG.cardsPerRow) {
        projectRows.push(projectCards.slice(i, i + CONFIG.cardsPerRow));
    }

    // ========================================
    // PROJECTS PHASE BUILDER
    // ========================================
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
        add('projects-shrink-to-fit', CONFIG.shrinkToFit);

        // ========================================
        // CALCULATE LEAVE SCROLL DURATION
        // The transition should complete when zen garden section top reaches viewport top
        // ========================================
        const projectsScrollBeforeLeave = pos; // Current scroll position before leave phase

        // Calculate how much more scrolling is needed for zen garden to be fully visible
        // When user scrolls within pinboard section by X pixels:
        //   window.scrollY = pinboardSection.offsetTop + X
        // For zen garden top to reach viewport top (y=0):
        //   window.scrollY = zenGardenSection.offsetTop
        // Therefore: pinboardSection.offsetTop + scrollNeeded = zenGardenSection.offsetTop
        //   scrollNeeded = zenGardenSection.offsetTop - pinboardSection.offsetTop
        // But we've already scrolled projectsScrollBeforeLeave, so remaining scroll:
        //   leaveScroll = zenGardenSection.offsetTop - pinboardSection.offsetTop - projectsScrollBeforeLeave

        let leaveScrollDuration = 1.0; // Default fallback
        if (zenGardenSection) {
            const totalScrollToZenTop = zenGardenSection.offsetTop - pinboardSection.offsetTop;
            const remainingScroll = totalScrollToZenTop - projectsScrollBeforeLeave;
            // Convert to viewport heights (since add() multiplies by vh)
            // Minimum 2.5vh for a slower, more dramatic transition
            leaveScrollDuration = Math.max(2.5, remainingScroll / vh);

            // DEBUG
            console.log('=== SCROLL CALCULATION ===');
            console.log('zenGardenSection.offsetTop:', zenGardenSection.offsetTop);
            console.log('pinboardSection.offsetTop:', pinboardSection.offsetTop);
            console.log('totalScrollToZenTop:', totalScrollToZenTop);
            console.log('projectsScrollBeforeLeave:', projectsScrollBeforeLeave);
            console.log('remainingScroll:', remainingScroll);
            console.log('leaveScrollDuration (vh):', leaveScrollDuration);
            console.log('leaveScrollDuration (px):', leaveScrollDuration * vh);
        }

        add('projects-leave', leaveScrollDuration, 'scroll');

        return { phases, projectsEndScroll: pos };
    }

    let projectTimeline = buildProjectPhases();

    // ========================================
    // CACHED VALUES for smoother animation
    // Avoids expensive getComputedStyle/scrollHeight/querySelector every frame
    // ========================================
    let cachedPaddingTop = 0;
    let cachedContentHeight = 0;
    let cachedZenTree = null;
    let cachedLandingConfig = null;

    // Pre-computed animation values (reduces per-frame calculations)
    let cachedScaleDelta = 0;        // (1 - landing.scale)
    let cachedCenterOffset = 0;       // Content center offset for leave phase
    let cachedContentTransform = '';  // Pre-built transform string for leave phase content
    const FRAME_THRESHOLD = 0.15;
    const FRAME_INVERSE = 1 / (1 - FRAME_THRESHOLD);  // Pre-compute division
    const CONTENT_SHRUNK_SCALE = 0.55;

    function updateCachedValues() {
        const vh = window.innerHeight;
        const styles = getComputedStyle(pinboardContent);
        cachedPaddingTop = parseFloat(styles.paddingTop) || 0;
        cachedContentHeight = pinboardContent.scrollHeight;
        cachedZenTree = document.querySelector('.zen-tree-container');
        cachedLandingConfig = getPinboardLandingConfig();

        // Pre-compute animation deltas
        cachedScaleDelta = 1 - cachedLandingConfig.scale;

        // Pre-compute leave phase content transform (it's constant during leave)
        const scaledHeight = cachedContentHeight * CONTENT_SHRUNK_SCALE;
        const basicCenter = (vh - scaledHeight) / 2;
        cachedCenterOffset = basicCenter - (cachedPaddingTop * CONTENT_SHRUNK_SCALE / 2);
        cachedContentTransform = `translateY(${cachedCenterOffset}px) scale(${CONTENT_SHRUNK_SCALE})`;
    }
    updateCachedValues();

    // Add will-change for GPU acceleration
    pinboardContent.style.willChange = 'transform, filter';

    // ========================================
    // SECTION HEIGHT - accurately calculated
    // ========================================
    function updateSectionHeight() {
        // Set section height to exactly match the scroll needed
        // This ensures zen garden section starts exactly when pinboard phases end
        // No buffer - the transition should complete exactly when zen garden is visible
        const height = projectTimeline.projectsEndScroll;

        pinboardSection.style.minHeight = `${height}px`;
    }
    updateSectionHeight();

    // ========================================
    // HELPERS
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

    // ========================================
    // PINBOARD LANDING CALCULATION
    // Reads from ZEN_TREE_CONFIG (set by zen-tree.js)
    // ========================================
    function getPinboardLandingConfig() {
        const cfg = window.ZEN_TREE_CONFIG || {
            treeX: 0.25,
            treeY: 0.95,
            pinboardLandingOffsetX: 80,
            pinboardLandingOffsetY: -300,
            pinboardLandingRotation: -8,
            pinboardScale: 0.15,
        };

        // Calculate CSS transform values
        // Tree position in vw/vh
        const treeVW = cfg.treeX * 100; // e.g. 25vw
        const treeVH = cfg.treeY * 100; // e.g. 95vh

        // Center of screen is 50vw, so offset from center to tree
        const END_X = treeVW - 50 + (cfg.pinboardLandingOffsetX / window.innerWidth * 100);
        const END_Y = treeVH - 50 + (cfg.pinboardLandingOffsetY / window.innerHeight * 100);

        return {
            scale: cfg.pinboardScale,
            x: END_X,  // vw from center
            y: END_Y,  // vh from center  
            rot: cfg.pinboardLandingRotation,
        };
    }

    // ========================================
    // ANIMATION HELPERS
    // ========================================
    function animateTitle(el, progress) {
        if (!el) return;
        const p = Math.max(0, Math.min(1, progress));
        el.style.opacity = String(p);
        el.style.transform = `translateY(${-30 * (1 - p)}px) rotate(${-2 * (1 - p)}deg)`;
        el.classList.toggle('pinned', p >= 0.9);
    }

    function showTitle(el) {
        if (!el) return;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) rotate(0)';
        el.classList.add('pinned');
    }

    function hideTitle(el) {
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(-30px) rotate(-2deg)';
        el.classList.remove('pinned');
    }

    function animateCard(card, progress, yDist = 80) {
        const p = Math.max(0, Math.min(1, progress));
        const rot = getComputedStyle(card).getPropertyValue('--rotation') || '0deg';
        card.style.opacity = String(p);
        card.style.transform = `translateY(${yDist * (1 - p)}px) rotate(${rot})`;
        card.classList.toggle('pinned', p >= 1);
    }

    function showCard(card) {
        const rot = getComputedStyle(card).getPropertyValue('--rotation') || '0deg';
        card.style.opacity = '1';
        card.style.transform = `translateY(0) rotate(${rot})`;
        card.classList.add('pinned');
    }

    function hideCard(card, yDist = 80) {
        const rot = getComputedStyle(card).getPropertyValue('--rotation') || '0deg';
        card.style.opacity = '0';
        card.style.transform = `translateY(${yDist}px) rotate(${rot})`;
        card.classList.remove('pinned');
    }

    // ========================================
    // MAIN UPDATE
    // ========================================
    function update() {
        const rect = pinboardSection.getBoundingClientRect();
        const vh = window.innerHeight;
        const scrollPos = Math.max(0, -rect.top);
        const { phase, progress, idx } = getProjectPhaseInfo(scrollPos);

        // --- BACKGROUND ---
        // Visible when top enters viewport, invalid when bottom leaves viewport
        const styles = getComputedStyle(pinboardSection);
        const bottomOffset = parseFloat(styles.paddingBottom) || 0;

        // --- ZOOM OUT TRANSITION ---
        // When projects are leaving, scale everything down to stick on the tree
        const zenBg = document.getElementById('zen-bg-container');

        // NEW: Shrink content to fit all 6 cards on screen before frame appears
        if (phase.name === 'projects-shrink-to-fit') {
            const shrinkProgress = progress;

            // Get the scroll offset at the START of this phase (frozen position)
            const shrinkPhase = projectTimeline.phases.find(p => p.name === 'projects-shrink-to-fit');
            const frozenOffset = shrinkPhase ? getProjectOffset(shrinkPhase.start) : 0;

            // Scale from 1.0 to 0.55 (45% smaller to fit both rows)
            const startScale = 1.0;
            const endScale = 0.55;
            const scale = startScale - (shrinkProgress * (startScale - endScale));

            // TRANSITION the scroll offset from frozen to 0
            // At progress=0: keep at frozenOffset (no jump, row 2 in view)
            // At progress=1: offset is 0 (all cards visible from top)
            const currentOffset = frozenOffset * (1 - shrinkProgress);

            // CALCULATE centerOffset to vertically center the shrunk CARDS
            // Using cached values for smooth animation (no getComputedStyle per frame)
            const scaledHeight = cachedContentHeight * scale;
            // Basic centering for the container
            const basicCenter = (vh - scaledHeight) / 2;
            // But cards are offset by scaled padding inside container, so subtract that
            const centerOffset = basicCenter - (cachedPaddingTop * scale / 2);

            // Apply the calculated center offset (only when progress > 0)
            const finalCenterOffset = shrinkProgress * centerOffset;

            // Apply to CONTENT only - background stays full screen
            pinboardContent.style.transform = `translateY(-${currentOffset}px) translateY(${finalCenterOffset}px) scale(${scale})`;
            pinboardContent.style.transformOrigin = 'top center';

            // Background stays normal
            pinboardBg.style.transform = 'none';
            pinboardBg.style.border = '0px solid transparent';
            pinboardBg.style.borderRadius = '0';
            pinboardContent.style.filter = 'none';

            // Fade overlay in based on scroll progress (not time-based)
            if (pinboardOverlay) {
                pinboardOverlay.style.opacity = shrinkProgress;
            }

            // Show zen-bg and tree during shrink (pre-load behind pinboard)
            if (zenBg) zenBg.classList.add('visible');
            if (cachedZenTree) cachedZenTree.classList.add('visible');

        } else if (phase.name === 'projects-leave') {
            const leaveProgress = progress;

            // Keep overlay at full opacity during leave
            if (pinboardOverlay) {
                pinboardOverlay.style.opacity = '1';
            }

            // Fade in Zen BG & Tree (using cached element)
            const showZen = leaveProgress > 0.05;
            if (zenBg) zenBg.classList.toggle('visible', showZen);
            if (cachedZenTree) cachedZenTree.classList.toggle('visible', showZen);

            // Fade out the title (it's outside the pinboard-bg)
            if (projectsTitle) {
                const titleOpacity = Math.max(0, 1 - (leaveProgress / FRAME_THRESHOLD));
                projectsTitle.style.opacity = titleOpacity;
            }

            // Use pre-computed content transform (constant during leave phase)
            pinboardContent.style.transform = cachedContentTransform;
            pinboardContent.style.transformOrigin = 'top center';

            // Calculate blur - simple multiply
            const blurAmount = leaveProgress * 4;

            if (leaveProgress < FRAME_THRESHOLD) {
                // STAGE 1: FRAME APPEARS (0% - 15%)
                // Use pre-computed inverse for faster division
                const pFrame = leaveProgress / FRAME_THRESHOLD;
                const borderWidth = pFrame * 30;

                pinboardBg.style.transform = 'translateZ(0)';
                pinboardBg.style.borderRadius = '0px';
                pinboardBg.style.border = `${borderWidth}px solid #3e2723`;
            } else {
                // STAGE 2: SHRINK & MOVE (15% - 100%)
                // Use pre-computed FRAME_INVERSE for faster math
                const pShrink = (leaveProgress - FRAME_THRESHOLD) * FRAME_INVERSE;

                // Use pre-computed cachedScaleDelta
                const scale = 1 - (pShrink * cachedScaleDelta);
                const transX = cachedLandingConfig.x * pShrink;
                const transY = cachedLandingConfig.y * pShrink;
                const rot = cachedLandingConfig.rot * pShrink;

                pinboardBg.style.transform = `translate3d(${transX}vw, ${transY}vh, 0) scale(${scale}) rotate(${rot}deg)`;
                pinboardBg.style.borderRadius = `${pShrink * 10}px`;
                pinboardBg.style.border = '30px solid #3e2723';
            }

            pinboardBg.style.boxSizing = 'border-box';
            // REMOVED: blur was causing stutter - it's expensive to compute every frame
            // pinboardContent.style.filter = `blur(${blurAmount}px)`;
            pinboardContent.style.filter = 'none';

        } else if (phase.name === 'projects-complete') {
            // Fully shrunk state - LOCKED
            if (zenBg) zenBg.classList.add('visible');
            if (cachedZenTree) cachedZenTree.classList.add('visible');

            // Final locked state - use translate3d for GPU
            const transform = `translate3d(${cachedLandingConfig.x}vw, ${cachedLandingConfig.y}vh, 0) scale(${cachedLandingConfig.scale}) rotate(${cachedLandingConfig.rot}deg)`;

            pinboardBg.style.border = '30px solid #3e2723';
            pinboardBg.style.boxSizing = 'border-box';
            pinboardBg.style.transform = transform;
            pinboardBg.style.borderRadius = '10px';
            pinboardBg.classList.add('visible');

            // Use pre-computed content transform (same as leave phase)
            pinboardContent.style.transform = cachedContentTransform;
            pinboardContent.style.transformOrigin = 'top center';
            pinboardContent.style.filter = 'blur(4px)';

        } else {
            // Normal state (row animations)
            const isLastRowPause = phase.name === `row-${numProjectRows - 1}-pause`;

            // Show zen-bg early (during last row pause) to pre-load behind pinboard
            if (isLastRowPause) {
                if (zenBg) zenBg.classList.add('visible');
                if (cachedZenTree) cachedZenTree.classList.add('visible');
            } else {
                if (zenBg) zenBg.classList.remove('visible');
                if (cachedZenTree) cachedZenTree.classList.remove('visible');
            }

            pinboardBg.style.border = '0px solid transparent';
            pinboardBg.style.transform = 'none';
            pinboardBg.style.borderRadius = '0';
            pinboardContent.style.transform = 'none'; // Reset content scale
            pinboardContent.style.filter = 'none';

            // Reset overlay
            if (pinboardOverlay) {
                pinboardOverlay.style.opacity = '0';
            }
        }

        // Toggle visibility based on section bounds
        // Keep pinboard visible during leave phase and complete phase
        if (phase.name === 'projects-complete' || (phase.name === 'projects-leave' && progress > 0.5)) {
            // Keep visible - pinboard is shrunk and pinned to tree
            pinboardBg.classList.add('visible');
        } else if (phase.name !== 'projects-leave') {
            // Only toggle visibility for normal phases
            pinboardBg.classList.toggle('visible', rect.top < vh * 0.6 && rect.bottom > vh * 0.1);
        }

        // Keep tree visible once it appears
        const zenTree = document.querySelector('.zen-tree-container');
        if (zenTree && (phase.name === 'projects-leave' || phase.name === 'projects-complete')) {
            zenTree.classList.add('visible');
        }

        // --- OFFSET CALCULATION ---
        // For standard scroll phases, we just translate normally
        // BUT skip this during shrink/leave/complete phases (already handled above)
        if (phase.name !== 'projects-shrink-to-fit' && phase.name !== 'projects-leave' && phase.name !== 'projects-complete') {
            const projectOffset = getProjectOffset(scrollPos);
            pinboardContent.style.transform = `translateY(-${projectOffset}px)`;
        }

        // --- PROJECTS TITLE ---
        // Title drops in during projects-title phase
        // Stays visible through row-0-animate and row-0-pause
        // Fades out during row-0-scrollup (when transitioning to row 1)
        const projTitleIdx = getProjectIdx('projects-title');
        const row0PauseIdx = getProjectIdx('row-0-pause');
        const row0ScrollUpIdx = getProjectIdx('row-0-scrollup');

        if (phase.name === 'projects-title') {
            // Dropping in
            animateTitle(projectsTitle, progress);
        } else if (phase.name === 'row-0-scrollup') {
            // Fade out while scrolling to row 1
            const fadeOut = 1 - progress;
            if (projectsTitle) {
                projectsTitle.style.opacity = String(fadeOut);
                projectsTitle.style.transform = `translateY(${-30 * progress}px) rotate(0)`;
            }
        } else if (idx > projTitleIdx && idx <= row0PauseIdx) {
            // Visible during row-0-animate and row-0-pause
            showTitle(projectsTitle);
        } else if (idx > row0PauseIdx) {
            // Hidden after row-0-scrollup
            hideTitle(projectsTitle);
        } else {
            hideTitle(projectsTitle);
        }

        // --- PROJECT ROWS ---
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

    // ========================================
    // INIT - with RAF throttling for smooth animation
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

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        projectTimeline = buildProjectPhases();
        updateCachedValues(); // Refresh cached values on resize
        updateSectionHeight();
        update();
    }, { passive: true });

    update();
});
