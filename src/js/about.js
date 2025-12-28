// ================================================
// ABOUT PAGE - Scroll Animations
// Dramatic section-based reveals like homepage
// ================================================

document.addEventListener('DOMContentLoaded', () => {

    // Only run on about page
    if (!document.querySelector('.about-experience')) return;

    // ================================================
    // EXPERIENCE SECTION - Timeline with Growing Line
    // ================================================
    const experienceSection = document.querySelector('.about-experience');
    const expTimeline = document.querySelector('.experience-timeline');
    const expTitle = document.querySelector('.experience-title');
    const expWords = document.querySelectorAll('.experience-title .word');
    const expCards = document.querySelectorAll('.exp-card');
    const timelineDots = document.querySelectorAll('.timeline-dot');
    const timelineCardsContainer = document.querySelector('.timeline-cards');

    if (experienceSection && expTimeline && timelineCardsContainer) {
        // ================================================
        // CONFIGURABLE: Scroll duration per phase (in vh per card)
        // These are ABSOLUTE - adding more cards increases section height automatically
        // ================================================
        const lineGrowthVh = 60;   // vh of scroll for line to grow to each dot (ADJUSTABLE)
        const cardAnimateVh = 30;  // vh of scroll for card animation
        const dwellVh = 60;       // vh of scroll for reading/dwelling

        const numCards = expCards.length;
        const vhPerCard = lineGrowthVh + cardAnimateVh + dwellVh;

        // Calculate and set section height dynamically
        // Timeline takes 85% of section (15% for title), plus 100vh buffer
        const timelineVh = numCards * vhPerCard;
        const sectionHeight = Math.ceil(timelineVh / 0.85) + 100;
        experienceSection.style.minHeight = `${sectionHeight}vh`;

        // Calculate percentages from absolute values
        const linePct = lineGrowthVh / vhPerCard;
        const cardPct = cardAnimateVh / vhPerCard;
        const dwellPct = dwellVh / vhPerCard;

        const updateExperience = () => {
            const rect = experienceSection.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            const windowHeight = window.innerHeight;

            // Calculate progress through the pinned section
            // To slow down: increase section height in CSS (more scroll room)
            const scrollDistance = sectionHeight - windowHeight;
            const scrolled = -sectionTop;
            const progress = Math.max(0, Math.min(1, scrolled / scrollDistance));

            // Phase 1: Title words appear (0-15% of progress)
            expWords.forEach((word, i) => {
                const wordStart = i * 0.05;
                const wordEnd = wordStart + 0.08;
                const wordProgress = Math.max(0, Math.min(1, (progress - wordStart) / (wordEnd - wordStart)));

                if (wordProgress > 0) {
                    word.classList.add('visible');
                    word.style.opacity = wordProgress;
                    word.style.transform = `translateY(${40 * (1 - wordProgress)}px) scale(${0.8 + 0.2 * wordProgress})`;
                } else {
                    word.classList.remove('visible');
                    word.style.opacity = '';
                    word.style.transform = '';
                }
            });

            // Phase 2: Timeline appears after title (15%+)
            const timelineVisible = progress > 0.15 ? 1 : 0;
            expTimeline.style.setProperty('--timeline-visible', timelineVisible);

            // Timeline progress (15-100% maps to 0-100% of timeline)
            const timelineStart = 0.15;
            const timelineProgress = Math.max(0, (progress - timelineStart) / (1 - timelineStart));

            // Get timeline dimensions
            const timelineHeight = timelineCardsContainer.offsetHeight;

            // Position dots at card locations
            const dotPositions = [];
            expCards.forEach((card, i) => {
                const dotTop = card.offsetTop + 24;
                dotPositions.push(dotTop / timelineHeight);

                const dot = timelineDots[i];
                if (dot) {
                    dot.style.top = `${dotTop}px`;
                }
            });

            // Each card gets equal segment of timeline progress
            // Each card gets equal segment of timeline progress
            const segmentSize = 1 / numCards;

            let lineHeight = 0;

            expCards.forEach((card, i) => {
                const dot = timelineDots[i];
                const segmentStart = i * segmentSize;
                // Phase boundaries within segment
                const segmentLineEnd = segmentStart + segmentSize * linePct;
                const segmentCardEnd = segmentStart + segmentSize * (linePct + cardPct);
                const segmentEnd = segmentStart + segmentSize;

                const dotPosition = dotPositions[i];
                const prevDotPosition = i === 0 ? 0 : dotPositions[i - 1];

                if (timelineProgress >= segmentStart) {
                    if (timelineProgress < segmentLineEnd) {
                        // Line growing toward dot - card not visible yet
                        const growthProgress = (timelineProgress - segmentStart) / (segmentLineEnd - segmentStart);
                        lineHeight = prevDotPosition + (dotPosition - prevDotPosition) * growthProgress;

                        card.style.setProperty('--item-progress', 0);
                        card.style.setProperty('--card-scale', 0.95);
                        card.classList.remove('visible', 'complete', 'focused');
                        if (dot) dot.classList.remove('active');
                    } else if (timelineProgress < segmentCardEnd) {
                        // Card animating in - FOCUSED, scaling up
                        lineHeight = dotPosition;
                        const cardProgress = (timelineProgress - segmentLineEnd) / (segmentCardEnd - segmentLineEnd);

                        card.style.setProperty('--item-progress', cardProgress);
                        card.style.setProperty('--card-scale', 0.95 + 0.1 * cardProgress);  // Scale 0.95 -> 1.05
                        card.classList.add('focused');
                        if (dot) dot.classList.add('active');
                        if (cardProgress > 0) card.classList.add('visible');
                        if (cardProgress >= 1) card.classList.add('complete');
                        else card.classList.remove('complete');
                    } else if (timelineProgress < segmentEnd) {
                        // Dwell phase - FOCUSED, full scale
                        lineHeight = dotPosition;
                        card.style.setProperty('--item-progress', 1);
                        card.style.setProperty('--card-scale', 1.05);
                        card.classList.add('visible', 'complete', 'focused');
                        if (dot) dot.classList.add('active');
                    } else {
                        // Past segment - shrink back, no longer focused
                        lineHeight = dotPosition;
                        card.style.setProperty('--item-progress', 1);
                        card.style.setProperty('--card-scale', 0.95);
                        card.classList.add('visible', 'complete');
                        card.classList.remove('focused');
                        if (dot) dot.classList.add('active');
                    }
                } else {
                    card.style.setProperty('--item-progress', 0);
                    card.classList.remove('visible', 'complete');
                    if (dot) dot.classList.remove('active');
                }
            });

            // Set line fill progress
            expTimeline.style.setProperty('--line-progress', lineHeight);

            // After last card, continue filling to end and fade out
            const lastDotPosition = dotPositions[dotPositions.length - 1];
            let endFade = 1; // For reversibility

            if (timelineProgress > 0.92) {
                // Line grows from last dot to bottom
                const endProgress = Math.min(1, (timelineProgress - 0.92) / 0.06);
                lineHeight = lastDotPosition + (1 - lastDotPosition) * endProgress;
                expTimeline.style.setProperty('--line-progress', lineHeight);

                // Fade out everything starting at 92% (overlaps with projects title appearing)
                endFade = 1 - ((timelineProgress - 0.92) / 0.08);
            }

            // Apply fade to timeline, cards, and title (reversible)
            // Combine initial visibility (after title) with end fade
            const finalVisibility = timelineVisible * endFade;
            expTimeline.style.setProperty('--timeline-visible', finalVisibility);
            expCards.forEach(card => {
                card.style.opacity = parseFloat(card.style.getPropertyValue('--item-progress') || 0) * endFade;
            });
            if (expTitle) expTitle.style.opacity = endFade;

            // Translate ENTIRE timeline + title so fill tip stays at fixed screen position
            const fillPixels = lineHeight * timelineHeight;
            const firstDotOffset = dotPositions[0] * timelineHeight;
            const translateY = Math.max(0, fillPixels - firstDotOffset);
            expTimeline.style.transform = `translateY(-${translateY}px)`;
            if (expTitle) expTitle.style.transform = `translateY(-${translateY}px)`;
        };

        let expTicking = false;
        window.addEventListener('scroll', () => {
            if (!expTicking) {
                window.requestAnimationFrame(() => {
                    updateExperience();
                    expTicking = false;
                });
                expTicking = true;
            }
        }, { passive: true });
        updateExperience();
    }

    // SKILLS SECTION - Now using homepage's tech-section solar system
    // Animations are handled by about-solar.js

    // ================================================
    // PROJECTS SECTION - All animations now in about-solar.js
    // ================================================
    // Card animations (appear, circle formation, explosion) and 
    // title animation are all handled by about-solar.js for 
    // proper coordination with the solar system explosion

    // ================================================
    // HERO - Parallax Fade
    // ================================================
    const heroSection = document.querySelector('.about-hero');
    if (heroSection) {
        const heroTitle = heroSection.querySelector('.hero-title');
        const heroSub = heroSection.querySelector('.hero-sub');

        const updateHero = () => {
            const scrollY = window.pageYOffset;
            const fadeEnd = window.innerHeight * 0.6; // Fade out by 60% of viewport
            const progress = Math.max(0, Math.min(1, scrollY / fadeEnd));

            if (heroTitle) {
                heroTitle.style.opacity = 1 - progress;
                heroTitle.style.transform = `translateY(${scrollY * 0.4}px) scale(${1 - progress * 0.15})`;
            }
            if (heroSub) {
                heroSub.style.opacity = 1 - progress;
                heroSub.style.transform = `translateY(${scrollY * 0.25}px)`;
            }
        };

        let heroTicking = false;
        window.addEventListener('scroll', () => {
            if (!heroTicking) {
                window.requestAnimationFrame(() => {
                    updateHero();
                    heroTicking = false;
                });
                heroTicking = true;
            }
        }, { passive: true });
        updateHero();
    }
});
