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
        rowPause: 0.1,
        rowScrollUp: 0.55,
        projectsLeaveScroll: 0.5,   // Dead scroll after last row before tech appears

        // Tech section
        techCardScrollDistance: 80,  // Pixels of scroll PER CARD (staggered)
        cardsPerRow: 3
    };

    // ========================================
    // DOM ELEMENTS
    // ========================================
    const pinboardSection = document.querySelector('.pinboard-section');
    const pinboardBg = document.querySelector('.pinboard-bg');
    const pinboardContent = document.querySelector('.pinboard-content');
    const projectsTitle = document.querySelector('.pinboard-title[data-phase="title"]');
    const projectCards = [...document.querySelectorAll('.polaroid-card')];
    const techTitle = document.querySelector('.pinboard-title.tech-title');
    const techCards = [...document.querySelectorAll('.tech-polaroid')];

    if (!pinboardSection || !pinboardBg || !pinboardContent) return;

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

        // Dead scroll after last row - projects scroll away before tech appears
        add('projects-leave', CONFIG.projectsLeaveScroll, 'scroll');

        return { phases, projectsEndScroll: pos };
    }

    let projectTimeline = buildProjectPhases();

    // ========================================
    // SECTION HEIGHT - accurately calculated
    // ========================================
    function updateSectionHeight() {
        const vh = window.innerHeight;
        const stickyPosition = 96;  // 6rem

        // Scroll needed after projects:
        // 1. Title fade-in: 200px
        // 2. Title travel from bottom of viewport to sticky position: ~(vh - stickyPosition)  
        // 3. Cards staggered animation: numCards × scrollPerCard
        const titleFadeScroll = 200;
        const titleTravelScroll = vh - stickyPosition;
        const cardsScroll = techCards.length * CONFIG.techCardScrollDistance;

        const totalTechScroll = titleFadeScroll + titleTravelScroll + cardsScroll;
        const height = projectTimeline.projectsEndScroll + totalTechScroll + vh; // +vh for end buffer

        pinboardSection.style.minHeight = `${height}px`;
        console.log(`Section height: ${height}px | Title: ${titleFadeScroll + titleTravelScroll}px | Cards (${techCards.length}): ${cardsScroll}px`);
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
    let techStickyScroll = null;  // Scroll position when tech title first reached sticky

    function update() {
        const rect = pinboardSection.getBoundingClientRect();
        const vh = window.innerHeight;
        const scrollPos = Math.max(0, -rect.top);
        const { phase, progress, idx } = getProjectPhaseInfo(scrollPos);

        // --- BACKGROUND ---
        pinboardBg.classList.toggle('visible', rect.top < vh * 0.6);

        // --- OFFSET CALCULATION ---
        const projectOffset = getProjectOffset(scrollPos);
        const scrollPastProjects = Math.max(0, scrollPos - projectTimeline.projectsEndScroll);
        const fadeScrollDistance = 200;  // Scroll distance for title fade

        // After fade completes, add scroll to offset so content moves up
        // During fade (0-200px): offset frozen at projectOffset
        // After fade (200px+): offset = projectOffset + (scrollPastProjects - 200)
        const scrollSinceFade = Math.max(0, scrollPastProjects - fadeScrollDistance);
        const totalOffset = projectOffset + scrollSinceFade;

        pinboardContent.style.transform = `translateY(-${totalOffset}px)`;

        // --- PROJECTS TITLE ---
        const projTitleIdx = getProjectIdx('projects-title');
        if (phase.name === 'projects-title') {
            animateTitle(projectsTitle, progress);
        } else if (idx > projTitleIdx) {
            showTitle(projectsTitle);
        } else {
            hideTitle(projectsTitle);
        }

        // --- PROJECT ROWS ---
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

        // ========================================
        // TECH SECTION
        // ========================================
        // scrollPastProjects already defined above in offset calculation
        const projectsComplete = scrollPastProjects > 0;
        const stickyPosition = 96;  // 6rem from top

        // Hide tech section completely until projects are done
        if (!projectsComplete) {
            techTitle.style.visibility = 'hidden';
            techTitle.style.opacity = '0';
            techTitle.style.transform = 'translateY(-30px) rotate(-2deg)';
            techStickyScroll = null;  // Reset sticky tracking
            techCards.forEach(c => {
                c.style.visibility = 'hidden';
                c.style.opacity = '0';
            });
        } else {
            // Show tech section
            techTitle.style.visibility = 'visible';
            techCards.forEach(c => c.style.visibility = 'visible');

            // Calculate fade-in progress (fade in over 200px of scroll)
            const fadeInProgress = Math.min(1, scrollPastProjects / 200);
            const fadingIn = fadeInProgress < 1;

            if (fadingIn) {
                // Still fading in - reset sticky tracking
                techStickyScroll = null;
                animateTitle(techTitle, fadeInProgress);
                techCards.forEach(c => hideCard(c, 50));
            } else {
                // Title fully visible - check for sticky

                // To detect sticky position without feedback loop:
                // Temporarily remove any transform to measure true position
                const oldTransform = techTitle.style.transform;
                techTitle.style.transform = 'translateY(0) rotate(0)';
                const rect = techTitle.getBoundingClientRect();
                const naturalTop = rect.top;

                // Determine if we should be stuck
                const shouldStick = naturalTop <= stickyPosition;

                if (shouldStick) {
                    // Remember the scroll position when we first hit sticky (once)
                    if (techStickyScroll === null) {
                        techStickyScroll = scrollPastProjects;
                    }

                    // Calculate how much to compensate
                    const scrollSinceStick = scrollPastProjects - techStickyScroll;
                    const compensation = stickyPosition - naturalTop;

                    // Apply compensation to title
                    techTitle.style.opacity = '1';
                    techTitle.style.transform = `translateY(${compensation}px) rotate(0)`;
                    techTitle.classList.add('pinned');

                    // Staggered card animation - each card pins one at a time
                    // Each card has a unique "pin" direction for creative effect
                    const pinDirections = [
                        { x: 0, y: -60, rot: -8 },     // From top, rotate left
                        { x: 50, y: -30, rot: 5 },    // From top-right
                        { x: -50, y: -30, rot: -5 },  // From top-left
                        { x: 60, y: 0, rot: 8 },      // From right
                        { x: -60, y: 0, rot: -8 },    // From left
                        { x: 0, y: 50, rot: 3 },      // From bottom
                        { x: 40, y: 40, rot: 6 },     // From bottom-right
                        { x: -40, y: 40, rot: -6 },   // From bottom-left
                        { x: 30, y: -50, rot: -4 },   // From top-right (var)
                        { x: -30, y: -50, rot: 4 },   // From top-left (var)
                    ];

                    techCards.forEach((c, i) => {
                        const dir = pinDirections[i % pinDirections.length];
                        const cardRot = getComputedStyle(c).getPropertyValue('--rotation') || '0deg';

                        // Calculate individual card progress based on stagger
                        const cardStartScroll = i * CONFIG.techCardScrollDistance;
                        const cardScrollProgress = scrollSinceStick - cardStartScroll;
                        const p = Math.max(0, Math.min(1, cardScrollProgress / CONFIG.techCardScrollDistance));

                        // Animate from unique direction
                        const xOffset = dir.x * (1 - p);
                        const yOffset = dir.y * (1 - p);
                        const rotOffset = dir.rot * (1 - p);

                        // Elastic easing for "pin bounce" effect
                        const eased = p < 1 ? 1 - Math.pow(1 - p, 3) : 1;  // Cubic ease-out

                        // DECOUPLED TRANSFORMS:
                        // We use individual properties for the structural positioning (Sticky/Animation)
                        // This allows the CSS 'transform' property to work ON TOP for hover effects
                        c.style.opacity = String(eased);

                        // 1. Position/Stickiness (JS Controlled)
                        c.style.translate = `${xOffset}px ${compensation + yOffset}px`;
                        c.style.rotate = `${rotOffset}deg`;
                        c.style.scale = `${0.8 + 0.2 * eased}`;

                        // 2. Clear conflict (Disable CSS base transform so our individual props win)
                        // But leave it valid for :hover to apply 'scale(1.02)' on top!
                        c.style.transform = 'none';

                        // 3. Toggle class for visual styles (shadows etc)
                        if (p >= 1) {
                            c.classList.add('pinned');
                        } else {
                            c.classList.remove('pinned');
                        }
                    });
                } else {
                    // Not yet at sticky position - restore transform
                    techStickyScroll = null;
                    techTitle.style.transform = oldTransform;
                    showTitle(techTitle);
                    techCards.forEach(c => hideCard(c, 50));
                }
            }
        }
    }

    // ========================================
    // INIT
    // ========================================
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', () => {
        projectTimeline = buildProjectPhases();
        updateSectionHeight();
        update();
    }, { passive: true });

    update();
});
