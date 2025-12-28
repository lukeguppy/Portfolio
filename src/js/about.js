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
    // ================================================
    // LAYOUT CACHE & RESIZE HANDLER
    // ================================================
    const layout = {
        windowHeight: window.innerHeight,
        hero: { height: 0, exists: false },
        experience: { top: 0, height: 0, exists: false, timelineHeight: 0, cardOffsets: [] }
    };

    const experienceSection = document.querySelector('.about-experience');
    const heroSection = document.querySelector('.about-hero');

    // Select Elements once (references don't change)
    const expTimeline = document.querySelector('.experience-timeline');
    const expTitle = document.querySelector('.experience-title');
    const expWords = document.querySelectorAll('.experience-title .word');
    const expCards = document.querySelectorAll('.exp-card');
    const timelineDots = document.querySelectorAll('.timeline-dot');
    const timelineCardsContainer = document.querySelector('.timeline-cards');

    // Config
    const numCards = expCards.length;
    // ... config values here...

    const updateLayout = () => {
        layout.windowHeight = window.innerHeight;

        // Hero Layout
        if (heroSection) {
            layout.hero.exists = true;
            // No strict height needed for fading usually, but good to have
        }

        // Experience Layout
        if (experienceSection && timelineCardsContainer) {
            layout.experience.exists = true;

            // Recalculate dynamic height logic if needed, or assume CSS handled it?
            // Original code calculated sectionHeight here. We should do it in updateLayout.
            const lineGrowthVh = 60;
            const cardAnimateVh = 30;
            const dwellVh = 60;
            const vhPerCard = lineGrowthVh + cardAnimateVh + dwellVh;
            const timelineVh = numCards * vhPerCard;
            const sectionHeightPx = (Math.ceil(timelineVh / 0.85) + 100) * (window.innerHeight / 100);
            // Note: Original set minHeight in vh.
            // Let's set it here so browser layout settles.
            experienceSection.style.minHeight = `${Math.ceil(timelineVh / 0.85) + 100}vh`;

            // CACHE VALUES
            // We need absolute top relative to document? 
            // Original code: const sectionTop = rect.top; (Viewport relative)
            // So we cache offsetTop.
            layout.experience.top = experienceSection.offsetTop;
            layout.experience.height = experienceSection.offsetHeight; // This will now include the minHeight set above
            layout.experience.timelineHeight = timelineCardsContainer.offsetHeight;

            // Cache dot/card positions relative to timeline container
            layout.experience.cardOffsets = [];
            expCards.forEach((card, i) => {
                // offsetTop is relative to parent timeline-cards
                const dotTop = card.offsetTop + 24;
                layout.experience.cardOffsets.push({
                    dotTop: dotTop,
                    ratio: dotTop / layout.experience.timelineHeight
                });

                const dot = timelineDots[i];
                if (dot) dot.style.top = `${dotTop}px`;
            });
        }
    };

    // Initialize
    updateLayout();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateLayout, 100);
    }, { passive: true });


    if (experienceSection && expTimeline && timelineCardsContainer) {
        // Constants derived from config (ratio based)
        const lineGrowthVh = 60;
        const cardAnimateVh = 30;
        const dwellVh = 60;
        const vhPerCard = lineGrowthVh + cardAnimateVh + dwellVh;

        const linePct = lineGrowthVh / vhPerCard;
        const cardPct = cardAnimateVh / vhPerCard;
        const dwellPct = dwellVh / vhPerCard;

        const updateExperience = () => {
            if (!layout.experience.exists) return;

            const scrollY = window.pageYOffset;
            const wh = layout.windowHeight;

            // Calculate viewport relative top using cached absolute top
            const sectionTop = layout.experience.top - scrollY;
            const sectionHeight = layout.experience.height;
            const scrollDistance = sectionHeight - wh;

            // Progress Calculation
            const scrolled = -sectionTop;
            const progress = Math.max(0, Math.min(1, scrolled / scrollDistance));

            // Phase 1: Title words
            expWords.forEach((word, i) => {
                const wordStart = i * 0.05;
                const wordEnd = wordStart + 0.08;
                const wordProgress = Math.max(0, Math.min(1, (progress - wordStart) / (wordEnd - wordStart)));

                if (Math.abs(word._lastP - wordProgress) > 0.001) {
                    if (wordProgress > 0) {
                        word.classList.add('visible');
                        word.style.opacity = wordProgress;
                        word.style.transform = `translateY(${40 * (1 - wordProgress)}px) scale(${0.8 + 0.2 * wordProgress})`;
                    } else {
                        word.classList.remove('visible');
                        word.style.opacity = '';
                        word.style.transform = '';
                    }
                    word._lastP = wordProgress;
                }
            });

            // Phase 2: Timeline
            const timelineVisible = progress > 0.15 ? 1 : 0;
            // Only update if changed
            if (expTimeline._lastVis !== timelineVisible) {
                expTimeline.style.setProperty('--timeline-visible', timelineVisible);
                expTimeline._lastVis = timelineVisible;
            }

            const timelineStart = 0.15;
            const timelineProgress = Math.max(0, (progress - timelineStart) / (1 - timelineStart));
            const segmentSize = 1 / numCards;
            let lineHeight = 0;

            expCards.forEach((card, i) => {
                const dot = timelineDots[i];
                const segmentStart = i * segmentSize;
                const segmentLineEnd = segmentStart + segmentSize * linePct;
                const segmentCardEnd = segmentStart + segmentSize * (linePct + cardPct);
                const segmentEnd = segmentStart + segmentSize;

                const cached = layout.experience.cardOffsets[i];
                const dotPosition = cached.ratio; // Pre-calculated ratio
                const prevDotPosition = i === 0 ? 0 : layout.experience.cardOffsets[i - 1].ratio;

                // Determine State
                let state = 0; // 0: hidden/growing, 1: animating, 2: focused, 3: passed
                let localP = 0;

                if (timelineProgress >= segmentStart) {
                    if (timelineProgress < segmentLineEnd) {
                        // Growing line
                        const growthProgress = (timelineProgress - segmentStart) / (segmentLineEnd - segmentStart);
                        lineHeight = prevDotPosition + (dotPosition - prevDotPosition) * growthProgress;
                        state = 0;
                    } else if (timelineProgress < segmentCardEnd) {
                        // Card Animating
                        lineHeight = dotPosition;
                        localP = (timelineProgress - segmentLineEnd) / (segmentCardEnd - segmentLineEnd);
                        state = 1;
                    } else if (timelineProgress < segmentEnd) {
                        // Dwell
                        lineHeight = dotPosition;
                        state = 2;
                    } else {
                        // Passed
                        lineHeight = dotPosition;
                        state = 3;
                    }
                } else {
                    state = -1; // Not reached
                }

                // Apply changes based on state change or progress
                // We simplify to avoid redundant writes:
                if (state === 1) {
                    card.style.setProperty('--item-progress', localP);
                    card.style.setProperty('--card-scale', 0.95 + 0.1 * localP);
                    card.classList.add('focused', 'visible');
                    card.classList.toggle('complete', localP >= 1);
                    if (dot) dot.classList.add('active');
                } else if (state === 2) {
                    if (card._lastState !== 2) {
                        card.style.setProperty('--item-progress', 1);
                        card.style.setProperty('--card-scale', 1.05);
                        card.classList.add('visible', 'complete', 'focused');
                        if (dot) dot.classList.add('active');
                    }
                } else if (state === 3) {
                    if (card._lastState !== 3) {
                        card.style.setProperty('--item-progress', 1);
                        card.style.setProperty('--card-scale', 0.95);
                        card.classList.add('visible', 'complete');
                        card.classList.remove('focused');
                        if (dot) dot.classList.add('active');
                    }
                } else if (state === 0) {
                    if (card._lastState !== 0) {
                        card.style.setProperty('--item-progress', 0);
                        card.style.setProperty('--card-scale', 0.95);
                        card.classList.remove('visible', 'complete', 'focused');
                        if (dot) dot.classList.remove('active');
                    }
                } else if (state === -1) {
                    if (card._lastState !== -1) {
                        card.style.setProperty('--item-progress', 0);
                        card.classList.remove('visible', 'complete');
                        if (dot) dot.classList.remove('active');
                    }
                }
                card._lastState = state;
            });

            // End grow logic
            // ... (keep similar logic but using cached values)
            const lastDotPosition = layout.experience.cardOffsets[layout.experience.cardOffsets.length - 1].ratio;
            let endFade = 1;

            if (timelineProgress > 0.92) {
                const endProgress = Math.min(1, (timelineProgress - 0.92) / 0.06);
                lineHeight = lastDotPosition + (1 - lastDotPosition) * endProgress;
                endFade = 1 - ((timelineProgress - 0.92) / 0.08);
            }

            expTimeline.style.setProperty('--line-progress', lineHeight);

            // Fade application
            if (Math.abs((expTimeline._lastFade || 1) - endFade) > 0.001) {
                expTimeline.style.opacity = timelineVisible * endFade; // Combined visibility
                if (expTitle) expTitle.style.opacity = endFade;
                expTimeline._lastFade = endFade;

                // We should also apply opacity to cards if endFade < 1
                if (endFade < 1) {
                    expCards.forEach(card => card.style.opacity = endFade);
                } else {
                    // Restore opacity based on item-progress (handled by CSS var usually, but strictly:
                    // opacity: var(--item-progress) in CSS.
                    // So we just remove the inline opacity override if endFade is 1
                    expCards.forEach(card => card.style.opacity = '');
                }
            }

            // Translation (Parallax stickiness)
            // Using CACHED timeline height
            const timelineHeight = layout.experience.timelineHeight;
            const fillPixels = lineHeight * timelineHeight;
            const firstDotOffset = layout.experience.cardOffsets[0].dotTop; // Absolute px
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

    // ================================================
    // HERO - Parallax Fade
    // ================================================
    if (heroSection) {
        const heroTitle = heroSection.querySelector('.hero-title');
        const heroSub = heroSection.querySelector('.hero-sub');

        const updateHero = () => {
            if (!layout.hero.exists) return;

            const scrollY = window.pageYOffset;
            const fadeEnd = layout.windowHeight * 0.6;
            const progress = Math.max(0, Math.min(1, scrollY / fadeEnd));

            if (progress <= 1) {
                if (heroTitle) {
                    heroTitle.style.opacity = 1 - progress;
                    heroTitle.style.transform = `translateY(${scrollY * 0.4}px) scale(${1 - progress * 0.15})`;
                }
                if (heroSub) {
                    heroSub.style.opacity = 1 - progress;
                    heroSub.style.transform = `translateY(${scrollY * 0.25}px)`;
                }
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
