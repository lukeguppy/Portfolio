// Solver System
function processSolverStep(guess, feedback) {
    // Save step to solve path
    solverPath.push({ guess, feedback });

    // 1. Filter remaining target words
    remainingWords = remainingWords.filter(word => getFeedback(guess, word) === feedback);
    
    // 2. Advance precalculated decision tree if possible
    if (!deviated && solverNode && solverNode.branches && solverNode.branches[feedback]) {
        // We matched the path! Just slide to the child node
        solverNode = solverNode.branches[feedback];
    } else {
        // Player deviated from tree recommendations or tree path is broken
        deviated = true;
        solverNode = null;
    }

    // 3. Update the solver UI dashboard
    updateSolverUI();
}

function getRecommendedGuess() {
    if (remainingWords.length === 0) return null;
    if (remainingWords.length === 1) return remainingWords[0];

    // If we haven't deviated, return the precomputed guess from the tree
    if (!deviated && solverNode && solverNode.guess) {
        return solverNode.guess;
    }

    // Fallback: If deviated, calculate optimal guess on the fly
    return findBestGuessDynamic(remainingWords);
}

function findBestGuessDynamic(possibleTargets) {
    if (possibleTargets.length === 0) return null;
    if (possibleTargets.length <= 2) return possibleTargets[0];
    
    // Limit dynamic candidates search to ensure main thread never lags.
    // If possibleTargets is large, evaluate the first 200 possible targets as candidates.
    // This runs in a few milliseconds and gives a highly optimal split!
    const candidates = possibleTargets.length <= 200 ? possibleTargets : possibleTargets.slice(0, 200);
    
    let bestGuess = null;
    let maxEntropy = -1;
    
    for (const guess of candidates) {
        const entropy = calculateEntropy(guess, possibleTargets);
        
        if (entropy > maxEntropy) {
            maxEntropy = entropy;
            bestGuess = guess;
        }
    }
    return bestGuess;
}

function calculateEntropy(guess, possibleTargets) {
    const patternCounts = {};
    const total = possibleTargets.length;
    
    for (let i = 0; i < total; i++) {
        const pattern = getFeedback(guess, possibleTargets[i]);
        patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
    }
    
    let entropy = 0.0;
    for (const count of Object.values(patternCounts)) {
        const p = count / total;
        entropy -= p * Math.log2(p);
    }
    
    return entropy;
}

function updateSolverUI() {
    const countVal = remainingWords.length;
    possibleCount.textContent = countVal.toLocaleString();
    possibleListCount.textContent = countVal.toLocaleString();

    // Recommended next word
    const rec = getRecommendedGuess();
    recommendedGuess.textContent = rec ? rec.toUpperCase() : "N/A";

    // Progress calculations
    const originalCount = TARGET_WORDS.length;
    const eliminated = originalCount - countVal;
    const percentage = originalCount > 0 ? Math.round((eliminated / originalCount) * 100) : 100;
    
    progressBarFill.style.width = percentage + "%";
    eliminationPercentage.textContent = percentage + "%";

    // Renders solver path
    solverPathDom.innerHTML = "";
    if (solverPath.length === 0) {
        solverPathDom.innerHTML = `<div class="path-placeholder">Start guessing to see the solve path...</div>`;
    } else {
        solverPath.forEach((step, idx) => {
            const stepDiv = document.createElement("div");
            stepDiv.className = "path-step";
            
            const numSpan = document.createElement("span");
            numSpan.className = "step-num";
            numSpan.textContent = `${idx + 1}. `;
            
            const wordSpan = document.createElement("span");
            wordSpan.className = "step-word";
            wordSpan.textContent = step.guess;

            const badgeContainer = document.createElement("div");
            badgeContainer.className = "step-badges";
            
            for (let c = 0; c < 5; c++) {
                const val = step.feedback[c];
                const badge = document.createElement("div");
                badge.className = "mini-tile";
                if (val === '2') badge.classList.add("correct");
                else if (val === '1') badge.classList.add("present");
                else badge.classList.add("absent");
                badgeContainer.appendChild(badge);
            }

            const left = document.createElement("div");
            left.style.display = "flex";
            left.style.gap = "8px";
            left.appendChild(numSpan);
            left.appendChild(wordSpan);

            stepDiv.appendChild(left);
            stepDiv.appendChild(badgeContainer);
            solverPathDom.appendChild(stepDiv);
        });
    }

    // Renders word lists
    remainingWordsListDom.innerHTML = "";
    if (countVal > 0) {
        // Show at most 150 words to avoid rendering lags
        const visibleWords = remainingWords.slice(0, 150);
        visibleWords.forEach(word => {
            const badge = document.createElement("span");
            badge.className = "word-badge";
            badge.dataset.word = word;
            badge.textContent = word;
            remainingWordsListDom.appendChild(badge);
        });
        
        if (countVal > 150) {
            const extra = document.createElement("span");
            extra.style.fontSize = "0.8rem";
            extra.style.color = "var(--text-muted)";
            extra.style.padding = "4px 8px";
            extra.textContent = `+ ${countVal - 150} more...`;
            remainingWordsListDom.appendChild(extra);
        }
    } else {
        remainingWordsListDom.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-muted); width: 100%; text-align: center;">No possible words left. (Check your manual feedbacks!)</span>`;
    }
    updateTreeLayout();
}

// Autonomous Solve Logic
let autoSolveSessionId = 0;

function startAutoSolve() {
    if (isGameOver) return;
    
    autoSolveSessionId++;
    const session = autoSolveSessionId;
    
    isAutoPlaying = true;
    isAutoContinuing = false;
    btnAutoPlay.className = "btn btn-primary highlight";
    btnAutoPlay.innerHTML = `<i data-lucide="pause"></i> <span>Pause</span>`;
    lucide.createIcons();
    
    // Disable inputs
    disableManualButtons(true);

    // Run first step
    scheduleNextAutoStep(0, session);
}

function stopAutoSolve(keepButtonPaused = false) {
    isAutoPlaying = false;
    autoSolveSessionId++; // Invalidate current session
    if (autoSolveTimeoutId) {
        clearTimeout(autoSolveTimeoutId);
        autoSolveTimeoutId = null;
    }
    
    if (!keepButtonPaused) {
        isAutoContinuing = false;
        btnAutoPlay.className = "btn btn-primary";
        btnAutoPlay.innerHTML = `<i data-lucide="play"></i> <span>Auto Play</span>`;
        lucide.createIcons();
        
        // Enable inputs
        disableManualButtons(false);
    }
}

function disableManualButtons(disable) {
    btnAutoStep.disabled = disable;
    btnAutofill.disabled = disable;
    // Keep reset button enabled so the user can abort and restart at any time
    document.querySelectorAll(".key").forEach(k => k.style.pointerEvents = disable ? "none" : "all");
}

function scheduleNextAutoStep(delay, session) {
    autoSolveTimeoutId = setTimeout(async () => {
        if (!isAutoPlaying || isGameOver || session !== autoSolveSessionId) return;
        await runAutoStep(session);
    }, delay);
}

async function runAutoStep(session) {
    if (session !== autoSolveSessionId) return;
    
    const recommended = getRecommendedGuess();
    if (!recommended) {
        stopAutoSolve();
        return;
    }

    const sliderVal = parseInt(solveSpeedSlider.value);
    
    // Type recommended guess
    // If the slider is very fast (e.g. <= 300ms), type instantly to avoid lags
    if (sliderVal <= 300) {
        fillWord(recommended);
    } else {
        // Simulated typing effect
        const typingDelay = Math.min(60, (sliderVal - 200) / 6);
        for (let i = currentCol; i < 5; i++) {
            if (!isAutoPlaying || isGameOver || session !== autoSolveSessionId) return;
            addLetter(recommended[i]);
            await sleep(typingDelay);
        }
    }

    if (!isAutoPlaying || isGameOver || session !== autoSolveSessionId) return;

    // Small delay before submitting
    if (sliderVal > 300) {
        await sleep(150);
    }

    if (session !== autoSolveSessionId) return;

    // Submit
    const success = submitGuess();
    if (!success) {
        stopAutoSolve();
        return;
    }

    // Schedule next guess
    if (!isGameOver && session === autoSolveSessionId) {
        // Wait for flip animations to complete before typing next word.
        // Flip animation takes 5 * 200ms + 400ms = 1400ms.
        // We will pause for sliderVal (which represents the interval between guesses).
        // Let's ensure the minimum wait time covers the animation, or run immediately if slider is at minimum speed.
        const nextStepDelay = Math.max(sliderVal, sliderVal <= 300 ? 50 : 1500);
        scheduleNextAutoStep(nextStepDelay, session);
    }
}
