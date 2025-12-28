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
    const skillGroups = document.querySelectorAll('.skill-group');
    const projectCards = document.querySelectorAll('.project-card');
    const skillTags = document.querySelectorAll('.skill-tags span');

    // === VISUALLY HIDDEN ON LOAD ===
    // Ensure all animated elements start hidden
    document.querySelectorAll('.word, .side-card, .explore-tile, .planet, .sun, .orbit').forEach(el => {
        el.classList.remove('visible', 'glowing', 'exploding');
    });

    // === LAYOUT CACHE ===
    // Store positions here so we don't query DOM in scroll loop
    const layout = {
        windowHeight: window.innerHeight,
        hero: { start: 0, end: 0, exists: false },
        pinned: { top: 0, height: 0, exists: false, words: [], cards: [] },
        explore: { top: 0, height: 0, exists: false },
        tech: { top: 0, exists: false },
        skills: { items: [], exists: false },
        projects: { items: [], exists: false }
    };

    const updateLayout = () => {
        layout.windowHeight = window.innerHeight;

        // Hero
        if (hero) {
            layout.hero.exists = true;
            // Constant constants for hero
            layout.hero.start = layout.windowHeight * 0.1;
            layout.hero.end = layout.windowHeight * 0.7;
        }

        // Pinned
        if (pinnedSection) {
            layout.pinned.exists = true;
            layout.pinned.top = pinnedSection.offsetTop;
            layout.pinned.height = pinnedSection.offsetHeight;

            // Cache elements
            layout.pinned.words = Array.from(pinnedSection.querySelectorAll('.word'));
            layout.pinned.cards = Array.from(pinnedSection.querySelectorAll('.side-card'));
        }

        // Explore
        if (exploreSection) {
            layout.explore.exists = true;
            layout.explore.top = exploreSection.offsetTop;
            layout.explore.height = exploreSection.offsetHeight;
        }

        // Tech
        if (techSection) {
            layout.tech.exists = true;
            layout.tech.top = techSection.offsetTop;
            layout.tech.height = techSection.offsetHeight;
        }

        // Skills
        if (skillGroups.length > 0) {
            layout.skills.exists = true;
            layout.skills.items = Array.from(skillGroups).map(group => ({
                el: group,
                top: group.offsetTop,
                height: group.offsetHeight,
                tags: Array.from(group.querySelectorAll('.skill-tags span'))
            }));
        }

        // Projects
        if (projectCards.length > 0) {
            layout.projects.exists = true;
            layout.projects.items = Array.from(projectCards).map(card => ({
                el: card,
                top: card.offsetTop,
                height: card.offsetHeight
            }));
        }
    };

    // Initialise layout
    updateLayout();

    // Debounced resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateLayout();
            updateTransitions();
            if (typeof updateSkillsAnimation === 'function') updateSkillsAnimation();
            if (typeof updateProjectsAnimation === 'function') updateProjectsAnimation();
        }, 100);
    }, { passive: true });

    // ResizeObserver to catch content shifts
    const observer = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateLayout();
            updateTransitions();
            if (typeof updateSkillsAnimation === 'function') updateSkillsAnimation();
            if (typeof updateProjectsAnimation === 'function') updateProjectsAnimation();
        }, 100);
    });
    if (document.body) observer.observe(document.body);



    // ===== MAIN SCROLL HANDLER =====
    const updateTransitions = () => {
        const scrollY = window.pageYOffset;
        const wh = layout.windowHeight;

        // Hero fade out
        if (layout.hero.exists && heroContent) {
            const range = layout.hero.end - layout.hero.start;
            // Avoid divide by zero
            if (range > 0) {
                const heroProgress = Math.max(0, Math.min(1, (scrollY - layout.hero.start) / range));

                // Only write if changed/needed
                if (heroProgress <= 1) {
                    heroContent.style.opacity = 1 - heroProgress;
                    heroContent.style.transform = `translateY(${-scrollY * 0.3}px) scale(${1 - heroProgress * 0.1})`;
                }
            }
        }

        // Pinned section
        if (layout.pinned.exists) {
            // Calculate current viewport relative position
            const rectTop = layout.pinned.top - scrollY;
            const sectionHeight = layout.pinned.height;
            const scrollDistance = sectionHeight - wh;

            if (scrollDistance > 0) {
                // Pin progress
                const pinProgress = Math.max(0, Math.min(1, -rectTop / scrollDistance));

                // Entry progress
                const entryStart = wh * 0.5;
                const entryProgress = Math.max(0, Math.min(1, (entryStart - rectTop) / entryStart));

                // Words
                layout.pinned.words.forEach((el, index) => {
                    const wordStart = index * 0.1;
                    const wordEnd = wordStart + 0.4;
                    const p = Math.max(0, Math.min(1, (entryProgress - wordStart) / (wordEnd - wordStart)));

                    if (el._lastP === undefined || Math.abs(el._lastP - p) > 0.001) { // Optimisation: only update if changed enough
                        el.style.opacity = p;
                        el.style.transform = `translateY(${150 * (1 - p)}px)`;
                        if (p > 0) el.classList.add('visible');
                        else el.classList.remove('visible');
                        el._lastP = p;
                    }
                });

                // Cards
                layout.pinned.cards.forEach((el, index) => {
                    const cardStart = 0.15 + (index * 0.15);
                    const cardDuration = 0.3;
                    const cardEnd = cardStart + cardDuration;
                    const p = Math.max(0, Math.min(1, (pinProgress - cardStart) / (cardEnd - cardStart)));

                    if (el._lastP === undefined || Math.abs(el._lastP - p) > 0.001) {
                        el.style.opacity = p;
                        el.style.setProperty('--scale', 0.9 + (p * 0.1));
                        el.style.transition = 'none';
                        const isLeft = el.classList.contains('from-left');
                        const xStart = isLeft ? -50 : 50;
                        el.style.setProperty('--tx', `${xStart * (1 - p)}px`);
                        el._lastP = p;
                    }
                });
            }
        }

        // Explore section
        if (layout.explore.exists) {
            const rectTop = layout.explore.top - scrollY;
            const sectionHeight = layout.explore.height;
            const scrollDistance = sectionHeight - wh;

            // Entry phase
            const entryStart = wh * 0.5;
            const entryEnd = wh * -0.1;
            const entryProgress = Math.max(0, Math.min(1, (entryStart - rectTop) / (entryStart - entryEnd)));

            // Sticky phase
            const stickyProgress = rectTop <= 0 && scrollDistance > 0
                ? Math.max(0, Math.min(1, -rectTop / scrollDistance))
                : 0;

            const title = exploreSection.querySelector('.section-title');
            if (title) {
                if (entryProgress > 0 || stickyProgress > 0) {
                    title.classList.add('visible');


                    let opacity, scale, topPercent;
                    if (stickyProgress === 0) {
                        opacity = entryProgress;
                        scale = 1.4;
                        topPercent = 70 - (entryProgress * 20);
                    } else if (stickyProgress < 0.9) {
                        const shrinkPhase = Math.min(1, stickyProgress / 0.3);
                        opacity = 1;
                        scale = 1.4 - (shrinkPhase * 0.4);
                        topPercent = 50 - (shrinkPhase * 30);
                    } else {
                        opacity = 1 - ((stickyProgress - 0.9) / 0.1);
                        scale = 1;
                        topPercent = 20;
                    }

                    title.style.setProperty('opacity', opacity, 'important');
                    title.style.top = `${topPercent}%`;
                    title.style.transform = `translate(-50%, -50%) scale(${scale})`;

                } else {
                    title.classList.remove('visible');
                    title.style.setProperty('opacity', '0', 'important');
                }
            }

            const tiles = exploreSection.querySelectorAll('.explore-tile');
            tiles.forEach((tile, index) => {
                const tileStart = 0.2 + (index * 0.15);
                const tileEnd = tileStart + 0.25;
                const p = Math.max(0, Math.min(1, (stickyProgress - tileStart) / (tileEnd - tileStart)));

                if (tile._lastP === undefined || Math.abs(tile._lastP - p) > 0.001) {
                    if (p > 0) {
                        tile.classList.add('visible');
                        tile.style.opacity = p;
                        const blur = 20 * (1 - p);
                        const scale = 0.8 + (0.2 * p);
                        const rotateX = 20 * (1 - p);
                        const y = 60 * (1 - p);


                        tile.style.filter = `blur(${blur}px)`;
                        tile.style.transform = `perspective(1000px) rotateX(${rotateX}deg) scale(${scale}) translateY(${y}px)`;
                        tile.style.transition = 'none';
                    } else {
                        tile.classList.remove('visible');
                        tile.style.opacity = 0;
                        tile.style.filter = 'blur(20px)';
                        tile.style.transform = `perspective(1000px) rotateX(20deg) scale(0.8) translateY(60px)`;
                    }
                    tile._lastP = p;
                }
            });
        }

        // Tech section
        if (layout.tech.exists && !techSection.classList.contains('about-tech-section')) {
            const rectTop = layout.tech.top - scrollY;
            const scrollDistance = layout.tech.height - wh;


            const entryStart = wh * 0.5;
            const entryEnd = wh * -0.1;
            const entryProgress = Math.max(0, Math.min(1, (entryStart - rectTop) / (entryStart - entryEnd)));

            const stickyProgress = rectTop <= 0 && scrollDistance > 0
                ? Math.max(0, Math.min(1, -rectTop / scrollDistance))
                : 0;

            const title = techSection.querySelector('.section-title');
            const sun = techSection.querySelector('.sun');
            const solarSystem = techSection.querySelector('.solar-system');
            const orbits = techSection.querySelectorAll('.orbit');
            const planets = techSection.querySelectorAll('.planet');

            if (title) {

                if (entryProgress > 0 || stickyProgress > 0) {
                    title.classList.add('visible');



                    let opacity, scale, topPercent;

                    if (stickyProgress === 0) {
                        // Entry phase
                        opacity = entryProgress;
                        scale = 1.8 - (entryProgress * 0.3); // 1.8 → 1.5
                        topPercent = 100 - (entryProgress * 50); // 70% → 50%
                    } else if (stickyProgress < 0.95) {
                        // Sticky phase
                        const shrinkPhase = Math.min(1, stickyProgress / 0.2);
                        opacity = 1;
                        scale = 1.5 - (shrinkPhase * 0.5); // 1.5 → 1.0
                        topPercent = 50 - (shrinkPhase * 30); // 50% → 20%
                    } else {
                        // Exit phase
                        const exitPhase = Math.min(1, (stickyProgress - 0.95) / 0.05);
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

    // Header
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

    // Anchor scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Tilt effect
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
    // SKILLS SECTION - Scroll-linked reveal (Optimised)
    // ================================================
    if (skillGroups.length > 0) {
        const updateSkillsAnimation = () => {
            if (!layout.skills.exists) return;

            const scrollY = window.pageYOffset;
            const viewportCenter = layout.windowHeight * 0.7;

            layout.skills.items.forEach(item => {

                const rectTop = item.top - scrollY;

                // Calculate progress: 0 when below viewport, 1 when at centre
                const progress = Math.max(0, Math.min(1, (viewportCenter - rectTop) / (viewportCenter * 0.5)));

                // Optimisation: Avoid setting style if not needed
                if (item._lastP === undefined || Math.abs(item._lastP - progress) > 0.001) {
                    item._lastP = progress;

                    item.el.style.setProperty('--group-progress', progress);

                    if (progress > 0) {
                        item.el.classList.add('visible');

                        // Animate skill tags with staggered delay
                        item.tags.forEach((tag, i) => {
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
                        item.el.classList.remove('visible');
                        item.tags.forEach(tag => {
                            tag.classList.remove('visible');
                            tag.style.setProperty('--tag-progress', 0);
                        });
                    }
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

        // Initial check after layout is ready
        if (layout.skills.exists) updateSkillsAnimation();
    }

    // ================================================
    // PROJECTS SECTION - Scroll-linked grid reveal (Optimised)
    // ================================================
    if (projectCards.length > 0) {
        const updateProjectsAnimation = () => {
            if (!layout.projects.exists) return;

            const scrollY = window.pageYOffset;
            const viewportTrigger = layout.windowHeight * 0.75;

            layout.projects.items.forEach((item, index) => {
                const rectTop = item.top - scrollY;

                // Calculate progress based on position
                const progress = Math.max(0, Math.min(1, (viewportTrigger - rectTop) / (viewportTrigger * 0.4)));

                // Add stagger based on grid position (alternating left/right)
                const row = Math.floor(index / 2);
                const col = index % 2;
                const stagger = (row * 0.1) + (col * 0.05);
                const staggeredProgress = Math.max(0, Math.min(1, (progress - stagger) / 0.6));

                if (item._lastP === undefined || Math.abs(item._lastP - staggeredProgress) > 0.001) {
                    item._lastP = staggeredProgress;

                    item.el.style.setProperty('--card-progress', staggeredProgress);

                    if (staggeredProgress > 0) {
                        item.el.classList.add('visible');
                    } else {
                        item.el.classList.remove('visible');
                    }
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

        // Initial check after layout is ready
        if (layout.projects.exists) updateProjectsAnimation();
    }

    // Trigger initial updates
    updateTransitions();

});