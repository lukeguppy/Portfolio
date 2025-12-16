// ================================================
// ABOUT PAGE - Scroll Animations
// Dramatic section-based reveals like homepage
// ================================================

document.addEventListener('DOMContentLoaded', () => {

    // Only run on about page
    if (!document.querySelector('.about-experience')) return;

    // ================================================
    // EXPERIENCE SECTION - Timeline with growing line
    // ================================================
    const experienceSection = document.querySelector('.about-experience');
    const expTimeline = document.querySelector('.experience-timeline');
    const expTitle = document.querySelector('.experience-title');
    const expWords = document.querySelectorAll('.experience-title .word');
    const expCards = document.querySelectorAll('.exp-card');
    const timelineDots = document.querySelectorAll('.timeline-dot');
    const timelineCardsContainer = document.querySelector('.timeline-cards');

    if (experienceSection && expTimeline && timelineCardsContainer) {
        const updateExperience = () => {
            const rect = experienceSection.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            const windowHeight = window.innerHeight;

            // Calculate progress through the pinned section
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

            // Divide progress into segments per card
            const numCards = expCards.length;
            const segmentSize = 1 / numCards;

            let lineHeight = 0;

            expCards.forEach((card, i) => {
                const dot = timelineDots[i];
                const segmentStart = i * segmentSize;
                // 15% line growth, 25% card animate, 60% dwell (more time to read)
                const segmentLineEnd = segmentStart + segmentSize * 0.15;
                const segmentCardEnd = segmentStart + segmentSize * 0.40;
                const segmentEnd = segmentStart + segmentSize;

                const dotPosition = dotPositions[i];
                const prevDotPosition = i === 0 ? 0 : dotPositions[i - 1];

                if (timelineProgress >= segmentStart) {
                    if (timelineProgress < segmentLineEnd) {
                        // Line growing toward dot
                        const growthProgress = (timelineProgress - segmentStart) / (segmentLineEnd - segmentStart);
                        lineHeight = prevDotPosition + (dotPosition - prevDotPosition) * growthProgress;

                        card.style.setProperty('--item-progress', 0);
                        card.classList.remove('visible', 'complete');
                        if (dot) dot.classList.remove('active');
                    } else if (timelineProgress < segmentCardEnd) {
                        // Card animating in
                        lineHeight = dotPosition;
                        const cardProgress = (timelineProgress - segmentLineEnd) / (segmentCardEnd - segmentLineEnd);

                        card.style.setProperty('--item-progress', cardProgress);
                        if (dot) dot.classList.add('active');
                        if (cardProgress > 0) card.classList.add('visible');
                        if (cardProgress >= 1) card.classList.add('complete');
                        else card.classList.remove('complete');
                    } else if (timelineProgress < segmentEnd) {
                        // Dwell phase - leeway to view card
                        lineHeight = dotPosition;
                        card.style.setProperty('--item-progress', 1);
                        card.classList.add('visible', 'complete');
                        if (dot) dot.classList.add('active');
                    } else {
                        // Past segment
                        lineHeight = dotPosition;
                        card.style.setProperty('--item-progress', 1);
                        card.classList.add('visible', 'complete');
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

        window.addEventListener('scroll', updateExperience, { passive: true });
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
    // PAGE HEADER - Parallax fade
    // ================================================
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        const headerH1 = pageHeader.querySelector('h1');
        const headerP = pageHeader.querySelector('p');

        const updateHeader = () => {
            const scrollY = window.pageYOffset;
            const fadeEnd = 400;
            const progress = Math.min(1, scrollY / fadeEnd);

            if (headerH1) {
                headerH1.style.opacity = 1 - progress;
                headerH1.style.transform = `translateY(${scrollY * 0.4}px) scale(${1 - progress * 0.15})`;
            }
            if (headerP) {
                headerP.style.opacity = 1 - progress;
                headerP.style.transform = `translateY(${scrollY * 0.25}px)`;
            }
        };

        window.addEventListener('scroll', updateHeader, { passive: true });
        updateHeader();
    }
});
