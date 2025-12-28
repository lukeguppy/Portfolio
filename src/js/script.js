// ================================================
// FULLY SCROLL-BASED TRANSITIONS
// No timers - everything controlled by scroll
// ================================================

document.addEventListener('DOMContentLoaded', () => {

    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const pinnedSection = document.querySelector('.pinned-section');
    const exploreSection = document.querySelector('.explore-section');
    const techSection = document.querySelector('.tech-section');

    // Ensure all animated elements start hidden
    document.querySelectorAll('.word, .side-card, .explore-tile, .planet, .sun, .orbit').forEach(el => {
        el.classList.remove('visible', 'glowing', 'exploding');
    });

    // ===== MAIN SCROLL HANDLER =====
    const updateTransitions = () => {
        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;

        // === HERO FADE OUT ===
        if (hero && heroContent) {
            const fadeStart = windowHeight * 0.1;
            const fadeEnd = windowHeight * 0.7;
            const heroProgress = Math.max(0, Math.min(1, (scrollY - fadeStart) / (fadeEnd - fadeStart)));

            heroContent.style.opacity = 1 - heroProgress;
            heroContent.style.transform = `translateY(${-scrollY * 0.3}px) scale(${1 - heroProgress * 0.1})`;
        }

        // === PINNED SECTION - ALL WORDS SAME TREATMENT ===
        if (pinnedSection) {
            const words = pinnedSection.querySelectorAll('.word');
            const sideCards = pinnedSection.querySelectorAll('.side-card');
            const allElements = [...words, ...sideCards];
            // SCROLL-LINKED / SCRUBBING LOGIC
            // Calculate progress specifically for when the section is "pinned"
            const rect = pinnedSection.getBoundingClientRect();
            const sectionHeight = rect.height;
            const scrollDistance = sectionHeight - windowHeight;

            // 1. PIN PROGRESS: For cards (0 when pinned, 1 when unpinned)
            const pinProgress = Math.max(0, Math.min(1, -rect.top / scrollDistance));

            // 2. ENTRY PROGRESS: For words (Starts BEFORE pin, when section is approaching)
            // Starts when section top is at 50% viewport, ends when it hits top (0%)
            const entryStart = windowHeight * 0.5;
            const entryProgress = Math.max(0, Math.min(1, (entryStart - rect.top) / entryStart));

            allElements.forEach((el, index) => {
                if (el.classList.contains('side-card')) {
                    // Cards sequence: Start early (0.15) and flow till END (1.0)
                    // Zero-base index for cards
                    const cardIndex = index - words.length;

                    // Spacing: 0.15 start, + 0.15 per card
                    const cardStart = 0.15 + (cardIndex * 0.15);
                    const cardDuration = 0.3;
                    const cardEnd = cardStart + cardDuration;

                    const p = Math.max(0, Math.min(1, (pinProgress - cardStart) / (cardEnd - cardStart)));

                    el.style.opacity = p;
                    // Use CSS Variables so hover works
                    el.style.setProperty('--scale', 0.9 + (p * 0.1));
                    el.style.transition = 'none'; // Disable transition for scrubbing

                    const isLeft = el.classList.contains('from-left');
                    const xStart = isLeft ? -50 : 50;

                    // currentX goes from xStart -> 0
                    const currentX = xStart * (1 - p);
                    el.style.setProperty('--tx', `${currentX}px`);

                } else {
                    // Words: Animate on ENTRY (Approach), NOT while pinned
                    // This ensures they are visible BEFORE the "blank screen" gap

                    // Stagger: 0.0 to 0.8 during approach
                    const wordStart = index * 0.1;
                    const wordEnd = wordStart + 0.4;
                    const p = Math.max(0, Math.min(1, (entryProgress - wordStart) / (wordEnd - wordStart)));

                    el.style.opacity = p;
                    el.style.transform = `translateY(${150 * (1 - p)}px)`; // Slide up from 150px

                    if (p > 0) el.classList.add('visible');
                    else el.classList.remove('visible');
                }
            });
        }

        // === EXPLORE SECTION - SCROLL BASED ===
        if (exploreSection) {
            const rect = exploreSection.getBoundingClientRect();
            const tiles = exploreSection.querySelectorAll('.explore-tile');
            const title = exploreSection.querySelector('.section-title');

            // 1. ENTRY PHASE (Approaching)
            const entryStart = windowHeight * 0.5;
            const entryEnd = windowHeight * -0.1;
            const entryProgress = Math.max(0, Math.min(1, (entryStart - rect.top) / (entryStart - entryEnd)));

            // 2. STICKY PHASE (Pinned)
            // rect.top becomes negative as we scroll past 0
            const sectionHeight = rect.height; // 250vh
            const scrollDistance = sectionHeight - windowHeight;
            const stickyProgress = rect.top <= 0
                ? Math.max(0, Math.min(1, -rect.top / scrollDistance))
                : 0;

            // ANIMATE TITLE
            if (title) {
                if (entryProgress > 0 || stickyProgress > 0) {
                    title.classList.add('visible');

                    let opacity, scale, topPercent;

                    if (stickyProgress === 0) {
                        // ENTRY: Rise from 70% -> 50%
                        opacity = entryProgress;
                        scale = 1.4; // constant big scale entering
                        topPercent = 70 - (entryProgress * 20); // 70 -> 50
                    } else if (stickyProgress < 0.9) {
                        // STICKY: Move 50% -> 20%, Scale 1.4 -> 1.0 (Matching Tech logic better)
                        const shrinkPhase = Math.min(1, stickyProgress / 0.3); // Do it quickly in first 30%
                        opacity = 1;
                        scale = 1.4 - (shrinkPhase * 0.4);
                        topPercent = 50 - (shrinkPhase * 30); // 50 -> 20
                    } else {
                        // EXIT
                        opacity = 1 - ((stickyProgress - 0.9) / 0.1);
                        scale = 1;
                        topPercent = 20;
                    }

                    // Must use !important to override global section-title css
                    title.style.setProperty('opacity', opacity, 'important');
                    title.style.top = `${topPercent}%`;
                    title.style.transform = `translate(-50%, -50%) scale(${scale})`;
                } else {
                    title.classList.remove('visible');
                    title.style.setProperty('opacity', '0', 'important');
                }
            }

            // ANIMATE TILES (Scrub based on sticky progress)
            // Start appearing after title moves up (0.2)
            tiles.forEach((tile, index) => {
                const tileStart = 0.2 + (index * 0.15);
                // Make duration slightly faster per tile for snappier feel
                const tileEnd = tileStart + 0.25;
                const p = Math.max(0, Math.min(1, (stickyProgress - tileStart) / (tileEnd - tileStart)));

                if (p > 0) {
                    tile.classList.add('visible');
                    tile.style.opacity = p;

                    // Holographic Effect logic
                    const blur = 20 * (1 - p); // 20px -> 0px
                    const scale = 0.8 + (0.2 * p); // 0.8 -> 1.0 (Zoom in)
                    const rotateX = 20 * (1 - p); // 20deg -> 0deg (Tilt forward)
                    const y = 60 * (1 - p); // 60px -> 0px (Slide up)

                    tile.style.filter = `blur(${blur}px)`;
                    // Apply individual perspective for self-contained 3D tilt
                    tile.style.transform = `perspective(1000px) rotateX(${rotateX}deg) scale(${scale}) translateY(${y}px)`;
                    tile.style.transition = 'none'; // Ensure 0 latency scrubbing
                } else {
                    tile.classList.remove('visible');
                    // Reset to initial state (hidden, blurred, tilted)
                    tile.style.opacity = 0;
                    tile.style.filter = 'blur(20px)';
                    tile.style.transform = `perspective(1000px) rotateX(20deg) scale(0.8) translateY(60px)`;
                }
            });
        }

        // === TECH SECTION - FULLY SCROLL-BASED ===
        // Skip if this is the about page version (handled by about-solar.js)
        if (techSection && !techSection.classList.contains('about-tech-section')) {
            const rect = techSection.getBoundingClientRect();
            const solarSystem = techSection.querySelector('.solar-system');
            const sun = techSection.querySelector('.sun');
            const orbits = techSection.querySelectorAll('.orbit');
            const planets = techSection.querySelectorAll('.planet');
            const title = techSection.querySelector('.section-title');

            // PHASE 1: ENTRY - Title fades in while previous section is leaving
            // Start when tech section top is at entryStart fraction of viewport (earlier transition)
            const entryStart = windowHeight;
            const entryEnd = windowHeight * -0.1; // Complete slightly after reaching top
            const entryProgress = Math.max(0, Math.min(1, (entryStart - rect.top) / (entryStart - entryEnd)));

            // PHASE 2: STICKY - Section top is at/above viewport top
            // This controls the shrink, move up, and sun animations
            const stickyStart = 0; // When section top hits viewport top
            const scrollDistance = windowHeight * 2; // Faster animation completion
            const stickyProgress = rect.top <= 0
                ? Math.max(0, Math.min(1, -rect.top / scrollDistance))
                : 0;

            if (title) {
                // Title is visible during entry OR sticky phase (full range)
                if (entryProgress > 0 || stickyProgress > 0) {
                    title.classList.add('visible');

                    // PHASES:
                    // Entry: Rise from slightly below (70% → 50%), scale (1.8 → 1.5), fade in
                    // Sticky: Move up (50% → 20%), shrink (1.5 → 1)
                    // Exit: Fade out, move up, shrink (after 95% progress)

                    let opacity, scale, topPercent;

                    if (stickyProgress === 0) {
                        // ENTRY PHASE: Rising from below center, scaling down, fading in
                        opacity = entryProgress;
                        scale = 1.8 - (entryProgress * 0.3); // 1.8 → 1.5
                        topPercent = 100 - (entryProgress * 50); // 70% → 50%
                    } else if (stickyProgress < 0.95) {
                        // STICKY PHASE: Shrink and move up to final position
                        const shrinkPhase = Math.min(1, stickyProgress / 0.2); // Complete by 20%
                        opacity = 1;
                        scale = 1.5 - (shrinkPhase * 0.5); // 1.5 → 1.0
                        topPercent = 50 - (shrinkPhase * 30); // 50% → 20%
                    } else {
                        // EXIT PHASE: Fade out after planets are shown
                        const exitPhase = Math.min(1, (stickyProgress - 0.95) / 0.05); // 95% to 100%
                        opacity = 1 - exitPhase;
                        scale = 1 - (exitPhase * 0.2); // 1.0 → 0.8
                        topPercent = 20 - (exitPhase * 15); // 20% → 5%
                    }

                    title.style.setProperty('opacity', opacity, 'important');
                    title.style.top = `${topPercent}%`;
                    title.style.transform = `translate(-50%, -50%) scale(${scale})`;
                } else {
                    title.classList.remove('visible');
                    title.style.removeProperty('opacity');
                    title.style.top = '';
                    title.style.transform = '';
                }
            }

            // Sun Phase (30% to 50% of sticky progress)
            const sunProgress = Math.max(0, Math.min(1, (stickyProgress - 0.3) / 0.2));
            if (sun) {
                if (sunProgress > 0) {
                    sun.classList.add('visible');
                    const sunScale = sunProgress;
                    const sunGlow = 60 + (sunProgress * 60);
                    sun.style.opacity = sunProgress; // Fade in with scroll
                    sun.style.transform = `translate(-50%, -50%) scale(${sunScale})`;
                    sun.style.boxShadow = `0 0 ${sunGlow}px var(--accent-glow)`;

                    // Trigger explosion effect when sun fully appears
                    if (sunProgress >= 1 && !sun.classList.contains('exploding')) {
                        sun.classList.add('exploding');
                        if (solarSystem) solarSystem.classList.add('exploding');
                    }
                } else {
                    sun.classList.remove('visible', 'exploding');
                    if (solarSystem) solarSystem.classList.remove('exploding');
                    sun.style.opacity = '';
                    sun.style.transform = '';
                    sun.style.boxShadow = '';
                }
            }

            // Orbits Phase (50% to 70% of sticky progress)
            const orbitProgress = Math.max(0, Math.min(1, (stickyProgress - 0.5) / 0.2));
            orbits.forEach((orbit, i) => {
                const individualProgress = Math.max(0, orbitProgress - (i * 0.15));
                if (individualProgress > 0) {
                    orbit.classList.add('visible');
                    orbit.style.transform = `translate(-50%, -50%) scale(${Math.min(1, individualProgress * 2)})`;
                } else {
                    orbit.classList.remove('visible');
                    orbit.style.transform = '';
                }
            });

            // Planets Phase (70% to 100% of sticky progress)
            const planetProgress = Math.max(0, Math.min(1, (stickyProgress - 0.7) / 0.3));
            planets.forEach((planet, i) => {
                const individualProgress = Math.max(0, planetProgress - (i * 0.06));
                if (individualProgress > 0) {
                    planet.classList.add('visible');
                } else {
                    planet.classList.remove('visible');
                }
            });
        }
    };

    // Use requestAnimationFrame for smooth performance
    let isTicking = false;

    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                updateTransitions();
                isTicking = false;
            });
            isTicking = true;
        }
    }, { passive: true });

    // === HEADER ===
    const header = document.querySelector('header');
    let headerTicking = false;

    window.addEventListener('scroll', () => {
        if (!headerTicking) {
            window.requestAnimationFrame(() => {
                header.style.background = window.pageYOffset > 100 ? 'rgba(5, 5, 8, 0.95)' : 'rgba(255, 255, 255, 0.02)';
                header.style.boxShadow = window.pageYOffset > 100 ? '0 10px 40px rgba(0, 0, 0, 0.4)' : 'none';
                headerTicking = false;
            });
            headerTicking = true;
        }
    }, { passive: true });

    // === ANCHOR SCROLL ===
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // === TILT ===
    document.querySelectorAll('.side-card, .explore-tile, .project-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.03)`;
        });
        card.addEventListener('mouseleave', () => card.style.transform = '');
    });

    // ================================================
    // ABOUT PAGE SCROLL ANIMATIONS
    // ================================================

    // Page Header - Parallax fade out
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        const headerH1 = pageHeader.querySelector('h1');
        const headerP = pageHeader.querySelector('p');

        const updatePageHeader = () => {
            const scrollY = window.pageYOffset;
            const fadeEnd = 300;
            const progress = Math.min(1, scrollY / fadeEnd);

            if (headerH1) {
                headerH1.style.opacity = 1 - progress;
                headerH1.style.transform = `translateY(${scrollY * 0.3}px) scale(${1 - progress * 0.1})`;
            }
            if (headerP) {
                headerP.style.opacity = 1 - progress;
                headerP.style.transform = `translateY(${scrollY * 0.2}px)`;
            }
        };

        let pageHeaderTicking = false;
        window.addEventListener('scroll', () => {
            if (!pageHeaderTicking) {
                window.requestAnimationFrame(() => {
                    updatePageHeader();
                    pageHeaderTicking = false;
                });
                pageHeaderTicking = true;
            }
        }, { passive: true });
        updatePageHeader();
    }

    // Content section h2 headings - Scroll reveal
    const contentH2s = document.querySelectorAll('.content-wrapper h2');
    if (contentH2s.length > 0) {
        const updateSectionHeadings = () => {
            const viewportTrigger = window.innerHeight * 0.8;

            contentH2s.forEach(h2 => {
                const rect = h2.getBoundingClientRect();
                const progress = Math.max(0, Math.min(1, (viewportTrigger - rect.top) / 200));

                h2.style.setProperty('--heading-progress', progress);
            });
        };

        let headingsTicking = false;
        window.addEventListener('scroll', () => {
            if (!headingsTicking) {
                window.requestAnimationFrame(() => {
                    updateSectionHeadings();
                    headingsTicking = false;
                });
                headingsTicking = true;
            }
        }, { passive: true });
        updateSectionHeadings();
    }

    const skillGroups = document.querySelectorAll('.skill-group');
    const projectCards = document.querySelectorAll('.project-card');
    const skillTags = document.querySelectorAll('.skill-tags span');

    // Create intersection observer for scroll-triggered animations
    const createScrollObserver = (elements, options = {}) => {
        const { threshold = 0.2, staggerDelay = 100, rootMargin = '0px' } = options;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Staggered reveal
                    const delay = index * staggerDelay;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);
                }
            });
        }, { threshold, rootMargin });

        elements.forEach(el => observer.observe(el));
        return observer;
    };

    // ================================================
    // SKILLS SECTION - Scroll-linked reveal
    // ================================================
    if (skillGroups.length > 0) {
        const updateSkillsAnimation = () => {
            const viewportCenter = window.innerHeight * 0.7;

            skillGroups.forEach((group, groupIndex) => {
                const rect = group.getBoundingClientRect();
                const elementCenter = rect.top + rect.height / 2;

                // Calculate progress: 0 when below viewport, 1 when at center
                const progress = Math.max(0, Math.min(1, (viewportCenter - rect.top) / (viewportCenter * 0.5)));

                group.style.setProperty('--group-progress', progress);

                if (progress > 0) {
                    group.classList.add('visible');

                    // Animate skill tags with staggered delay
                    const tags = group.querySelectorAll('.skill-tags span');
                    tags.forEach((tag, i) => {
                        const tagDelay = i * 0.08;
                        const tagProgress = Math.max(0, Math.min(1, (progress - tagDelay) / 0.5));
                        tag.style.setProperty('--tag-progress', tagProgress);
                        if (tagProgress > 0) {
                            tag.classList.add('visible');
                        } else {
                            tag.classList.remove('visible');
                        }
                    });
                } else {
                    group.classList.remove('visible');
                    const tags = group.querySelectorAll('.skill-tags span');
                    tags.forEach(tag => {
                        tag.classList.remove('visible');
                        tag.style.setProperty('--tag-progress', 0);
                    });
                }
            });
        };

        let skillsTicking = false;
        window.addEventListener('scroll', () => {
            if (!skillsTicking) {
                window.requestAnimationFrame(() => {
                    updateSkillsAnimation();
                    skillsTicking = false;
                });
                skillsTicking = true;
            }
        }, { passive: true });
        updateSkillsAnimation();
    }

    // ================================================
    // PROJECTS SECTION - Scroll-linked grid reveal
    // ================================================
    if (projectCards.length > 0) {
        const updateProjectsAnimation = () => {
            const viewportTrigger = window.innerHeight * 0.75;

            projectCards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();

                // Calculate progress based on position
                const progress = Math.max(0, Math.min(1, (viewportTrigger - rect.top) / (viewportTrigger * 0.4)));

                // Add stagger based on grid position (alternating left/right)
                const row = Math.floor(index / 2);
                const col = index % 2;
                const stagger = (row * 0.1) + (col * 0.05);
                const staggeredProgress = Math.max(0, Math.min(1, (progress - stagger) / 0.6));

                card.style.setProperty('--card-progress', staggeredProgress);

                if (staggeredProgress > 0) {
                    card.classList.add('visible');
                } else {
                    card.classList.remove('visible');
                }
            });
        };

        let projectsTicking = false;
        window.addEventListener('scroll', () => {
            if (!projectsTicking) {
                window.requestAnimationFrame(() => {
                    updateProjectsAnimation();
                    projectsTicking = false;
                });
                projectsTicking = true;
            }
        }, { passive: true });
        updateProjectsAnimation();
    }

});