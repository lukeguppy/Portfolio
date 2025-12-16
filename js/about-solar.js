// ================================================
// ABOUT PAGE - DYNAMIC PROPORTIONAL TIMELINE
// Change proportions and everything auto-adjusts
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ========================================
    // DOM ELEMENTS
    // ========================================
    const aboutTechSection = document.querySelector('.about-tech-section');
    const aboutProjects = document.querySelector('.about-projects');
    const experienceSection = document.querySelector('.about-experience');

    if (!aboutTechSection || !aboutProjects) return;

    const solarSystem = aboutTechSection.querySelector('.about-solar-system');
    const sun = aboutTechSection.querySelector('.sun');
    const orbits = aboutTechSection.querySelectorAll('.orbit');
    const planets = aboutTechSection.querySelectorAll('.planet');
    const depthProjects = aboutProjects.querySelectorAll('.depth-project');
    const projectsTitle = aboutProjects.querySelector('.projects-title');

    if (!solarSystem || !sun || depthProjects.length === 0) return;

    // ========================================
    // SECTION PROPORTIONS (how much of total scroll each section gets)
    // ========================================
    // These are RELATIVE weights - they auto-normalize to 100%
    // Change these to adjust how much scroll each major section takes

    const SECTIONS = {
        experience: 15,   // Overlapping with experience section end
        projects: 45,     // Depth dive through projects
        solar: 25,        // Solar system reveal
        deadZone: 15      // Normal scroll resumes (footer appears)
    };

    // ========================================
    // PHASE PROPORTIONS WITHIN EACH SECTION
    // ========================================
    // Each phase is a proportion of its parent section
    // They auto-normalize within their section

    const PHASES = {
        // During EXPERIENCE section
        experience: {
            titleIn: 3,      // Title flies in
            titleHold: 2,    // Title holds
            titleOut: 3      // Title fades out
        },

        // During PROJECTS section  
        projects: {
            overlap: 1,      // Slight overlap with title out
            depthDive: 8,    // Scroll through all projects
            explosion: 2     // Projects explode away
        },

        // During SOLAR section
        solar: {
            sunIn: 3,        // Sun appears
            orbitsIn: 3,     // Orbits expand
            planetsIn: 3,    // Planets fly in
            settle: 1        // Everything in place, brief pause
        },

        // Dead zone - nothing animates, normal scroll
        deadZone: {
            scroll: 1        // Just scrolls normally
        }
    };

    // ========================================
    // AUTO-CALCULATE TIMELINE (don't edit below)
    // ========================================

    // Normalize section weights to percentages
    const sectionTotal = Object.values(SECTIONS).reduce((a, b) => a + b, 0);
    const sectionPercent = {};
    let cursor = 0;

    for (const [name, weight] of Object.entries(SECTIONS)) {
        const percent = (weight / sectionTotal) * 100;
        sectionPercent[name] = { start: cursor, end: cursor + percent, size: percent };
        cursor += percent;
    }

    // Calculate phases within each section
    function calculatePhases(sectionName) {
        const section = sectionPercent[sectionName];
        const phases = PHASES[sectionName];
        const phaseTotal = Object.values(phases).reduce((a, b) => a + b, 0);

        const result = {};
        let phaseCursor = section.start;

        for (const [name, weight] of Object.entries(phases)) {
            const size = (weight / phaseTotal) * section.size;
            result[name] = { start: phaseCursor, end: phaseCursor + size };
            phaseCursor += size;
        }

        return result;
    }

    const TIMELINE = {
        sections: sectionPercent,
        experience: calculatePhases('experience'),
        projects: calculatePhases('projects'),
        solar: calculatePhases('solar'),
        deadZone: calculatePhases('deadZone')
    };

    // Log the calculated timeline for debugging
    console.log('=== CALCULATED TIMELINE ===');
    console.log('Sections:', Object.entries(TIMELINE.sections).map(([k, v]) =>
        `${k}: ${v.start.toFixed(1)}-${v.end.toFixed(1)}%`).join(', '));
    console.log('Experience:', Object.keys(TIMELINE.experience).join(' → '));
    console.log('Projects:', Object.keys(TIMELINE.projects).join(' → '));
    console.log('Solar:', Object.keys(TIMELINE.solar).join(' → '));
    console.log('Dead zone starts at:', TIMELINE.sections.deadZone.start.toFixed(1) + '%');

    // ========================================
    // HELPER FUNCTIONS
    // ========================================

    function phaseProgress(scrollPercent, phase) {
        if (scrollPercent < phase.start) return 0;
        if (scrollPercent > phase.end) return 1;
        return (scrollPercent - phase.start) / (phase.end - phase.start);
    }

    function inPhase(scrollPercent, phase) {
        return scrollPercent >= phase.start && scrollPercent <= phase.end;
    }

    function afterPhase(scrollPercent, phase) {
        return scrollPercent > phase.end;
    }

    // ========================================
    // 3D DEPTH POSITIONING
    // ========================================
    const depthSpacing = 800;
    const numProjects = depthProjects.length;
    let isExploded = false;

    function updateDepthPositions(scrollProgress) {
        const targetZ = scrollProgress * (numProjects - 1) * depthSpacing;

        depthProjects.forEach((project, i) => {
            const projectZ = i * depthSpacing;
            const distanceFromCamera = projectZ - targetZ;
            const normalizedDist = distanceFromCamera / depthSpacing;
            const distanceScale = Math.max(0.2, 1 - Math.abs(normalizedDist) * 0.4);
            const opacity = Math.max(0, 1 - Math.abs(normalizedDist) * 0.8);
            const blur = Math.min(15, Math.abs(normalizedDist) * 8);
            const inFocus = Math.abs(normalizedDist) < 0.5;

            project.style.setProperty('transform',
                `translate(-50%, -50%) translateZ(${distanceFromCamera}px) scale(${distanceScale})`,
                'important'
            );
            project.style.opacity = opacity;
            project.style.filter = blur > 0.5 ? `blur(${blur}px)` : '';
            project.style.zIndex = Math.round(100 - Math.abs(normalizedDist) * 10);

            if (inFocus && opacity > 0.5) {
                project.classList.add('in-focus');
            } else {
                project.classList.remove('in-focus');
            }
        });
    }

    const planetEntryPositions = [
        { x: -1200, y: -400 }, { x: 1200, y: -300 },
        { x: -1100, y: 200 }, { x: 1100, y: 100 },
        { x: -900, y: 500 }, { x: 900, y: 400 },
        { x: 0, y: -800 }, { x: -1300, y: 0 }, { x: 1300, y: -100 }
    ];

    // ========================================
    // ANIMATION FUNCTIONS (modular)
    // ========================================

    function animateTitle(scrollPercent) {
        if (!projectsTitle) return;

        const T = TIMELINE.experience;

        if (scrollPercent < T.titleIn.start) {
            // Before - hidden in distance
            projectsTitle.classList.remove('visible');
            projectsTitle.style.setProperty('opacity', '0', 'important');
            projectsTitle.style.setProperty('transform', 'translate(-50%, -50%) translateZ(-500px) scale(0.5)', 'important');
            projectsTitle.style.filter = 'blur(10px)';

        } else if (inPhase(scrollPercent, T.titleIn)) {
            // Flying in
            const p = phaseProgress(scrollPercent, T.titleIn);
            projectsTitle.classList.add('visible');
            projectsTitle.style.setProperty('opacity', String(p), 'important');
            projectsTitle.style.setProperty('transform',
                `translate(-50%, -50%) translateZ(${-500 + p * 500}px) scale(${0.5 + p * 0.5})`, 'important');
            projectsTitle.style.filter = p < 1 ? `blur(${10 * (1 - p)}px)` : '';

        } else if (inPhase(scrollPercent, T.titleHold)) {
            // Holding
            projectsTitle.classList.add('visible');
            projectsTitle.style.setProperty('opacity', '1', 'important');
            projectsTitle.style.setProperty('transform', 'translate(-50%, -50%) translateZ(0) scale(1)', 'important');
            projectsTitle.style.filter = '';

        } else if (inPhase(scrollPercent, T.titleOut)) {
            // Fading out
            const p = phaseProgress(scrollPercent, T.titleOut);
            projectsTitle.classList.add('visible');
            projectsTitle.style.setProperty('opacity', String(1 - p), 'important');
            projectsTitle.style.setProperty('transform',
                `translate(-50%, calc(-50% - ${p * 100}px)) translateZ(${-p * 600}px) scale(${1 - p * 0.5})`, 'important');
            projectsTitle.style.filter = p > 0 ? `blur(${p * 10}px)` : '';

        } else {
            // Gone
            projectsTitle.classList.remove('visible');
            projectsTitle.style.setProperty('opacity', '0', 'important');
            projectsTitle.style.filter = '';
        }
    }

    function animateProjects(scrollPercent) {
        const T = TIMELINE.projects;

        // Before depth dive starts
        if (scrollPercent < T.depthDive.start) {
            depthProjects.forEach(p => {
                p.style.opacity = 0;
                p.classList.remove('in-focus');
            });
            return;
        }

        // During depth dive
        if (inPhase(scrollPercent, T.depthDive) && !isExploded) {
            const p = phaseProgress(scrollPercent, T.depthDive);
            updateDepthPositions(p);
        }

        // Explosion
        if (inPhase(scrollPercent, T.explosion)) {
            const p = phaseProgress(scrollPercent, T.explosion);
            isExploded = true;
            depthProjects.forEach(project => {
                project.classList.add('exploding');
                project.classList.remove('in-focus');
                project.style.transform = `translate(-50%, calc(-50% - ${p * 500}px)) scale(${1 + p * 0.3})`;
                project.style.opacity = Math.max(0, 1 - p * 2);
                project.style.filter = `blur(${p * 20}px)`;
            });
        } else if (scrollPercent < T.explosion.start && isExploded) {
            isExploded = false;
            depthProjects.forEach(project => {
                project.classList.remove('exploding');
                project.style.filter = '';
            });
        }
    }

    function animateSolar(scrollPercent) {
        const T = TIMELINE.solar;

        // Sun
        if (scrollPercent >= T.sunIn.start) {
            const p = Math.min(1, phaseProgress(scrollPercent, T.sunIn));
            solarSystem.style.opacity = Math.min(1, p * 1.5);
            solarSystem.style.transform = `translate(-50%, -50%) scale(${p})`;
            sun.style.opacity = Math.min(1, p * 1.5);
            sun.style.transform = `translate(-50%, -50%) scale(${p})`;
            sun.style.boxShadow = `0 0 ${40 + p * 60}px var(--accent-glow)`;
            sun.classList.add('visible');
            if (p >= 1) {
                sun.classList.add('exploding');
                solarSystem.classList.add('exploding');
            }
        } else {
            solarSystem.style.opacity = 0;
            solarSystem.style.transform = 'translate(-50%, -50%) scale(0)';
            sun.style.opacity = 0;
            sun.classList.remove('visible', 'exploding');
            solarSystem.classList.remove('exploding');
        }

        // Orbits (auto-staggered based on count)
        const orbPhase = T.orbitsIn;
        const orbDuration = (orbPhase.end - orbPhase.start) / orbits.length;

        orbits.forEach((orbit, i) => {
            const myStart = orbPhase.start + i * orbDuration * 0.5;
            const myEnd = myStart + orbDuration;

            if (scrollPercent >= myStart) {
                const p = Math.min(1, (scrollPercent - myStart) / (myEnd - myStart));
                orbit.style.opacity = p;
                orbit.style.transform = `translate(-50%, -50%) scale(${p})`;
                orbit.classList.toggle('visible', p > 0);
            } else {
                orbit.style.opacity = 0;
                orbit.style.transform = `translate(-50%, -50%) scale(0)`;
                orbit.classList.remove('visible');
            }
        });

        // Planets (auto-staggered based on count)
        const planPhase = T.planetsIn;
        const planDuration = (planPhase.end - planPhase.start) / planets.length;

        planets.forEach((planet, i) => {
            const entry = planetEntryPositions[i] || planetEntryPositions[0];
            const myStart = planPhase.start + i * planDuration * 0.5;
            const myEnd = myStart + planDuration;

            if (scrollPercent >= myStart) {
                const p = Math.min(1, (scrollPercent - myStart) / (myEnd - myStart));
                planet.classList.add('visible');
                if (p < 1) {
                    const rx = entry.x * (1 - p), ry = entry.y * (1 - p);
                    const angle = parseFloat(planet.style.getPropertyValue('--start')) || 0;
                    const radius = planet.closest('.orbit-2') ? 220 : 140;
                    planet.style.transform = `translate(calc(-50% + ${rx}px), calc(-50% + ${ry}px)) rotate(${angle}deg) translateX(${radius * p}px) rotate(${-angle}deg) scale(${0.3 + p * 0.7})`;
                    planet.style.opacity = p;
                } else {
                    planet.style.transform = '';
                    planet.style.opacity = '';
                }
            } else {
                planet.classList.remove('visible');
                planet.style.opacity = 0;
            }
        });
    }

    // ========================================
    // MAIN SCROLL HANDLER
    // ========================================
    function updateAnimation() {
        const windowHeight = window.innerHeight;
        const expRect = experienceSection?.getBoundingClientRect();
        const techRect = aboutTechSection.getBoundingClientRect();

        if (!expRect) return;

        // Animation triggers when experience bottom is at 80% down the screen
        // and ends when tech section bottom reaches top of screen
        const triggerPoint = windowHeight * 0.8;  // Experience bottom at 80% viewport triggers start

        // How far past the trigger point are we?
        // Positive when experience bottom is above trigger (we've scrolled past it)
        const scrolledPastTrigger = triggerPoint - expRect.bottom;

        // Total distance from trigger to end
        const totalDistance = triggerPoint + Math.abs(techRect.bottom);

        // Calculate 0-100%
        const scrollPercent = Math.max(0, Math.min(100,
            (scrolledPastTrigger / totalDistance) * 100
        ));

        // Debug
        console.log('expBottom:', Math.round(expRect.bottom), 'scrolledPast:', Math.round(scrolledPastTrigger), 'Scroll:', Math.round(scrollPercent) + '%');

        // Run each animation module
        animateTitle(scrollPercent);
        animateProjects(scrollPercent);
        animateSolar(scrollPercent);
    }

    // ========================================
    // INITIALIZE
    // ========================================
    updateDepthPositions(0);
    window.addEventListener('scroll', updateAnimation, { passive: true });
    window.addEventListener('resize', updateAnimation, { passive: true });
    updateAnimation();
});
