function cacheDomElements() {
    gridDom = document.getElementById("wordle-grid");
    keyboardDom = document.getElementById("keyboard");
    btnHelp = document.getElementById("btn-help");
    btnStats = document.getElementById("btn-stats");
    btnReset = document.getElementById("btn-reset");
    modalHelp = document.getElementById("modal-help");
    modalStats = document.getElementById("modal-stats");
    closeHelp = document.getElementById("close-help");
    closeStats = document.getElementById("close-stats");
    toggleHelper = document.getElementById("toggle-helper");
    toggleContinue = document.getElementById("toggle-continue");
    toggleAnimations = document.getElementById("toggle-animations");
    toggleTreePlay = document.getElementById("toggle-tree-play");
    toggleTreeSandbox = document.getElementById("toggle-tree-sandbox");
    possibleCount = document.getElementById("possible-count");
    recommendedGuess = document.getElementById("recommended-guess");
    progressBarFill = document.getElementById("progress-bar-fill");
    eliminationPercentage = document.getElementById("elimination-percentage");
    btnAutoPlay = document.getElementById("btn-auto-play");
    btnAutoStep = document.getElementById("btn-auto-step");
    btnAutofill = document.getElementById("btn-autofill");
    solveSpeedSlider = document.getElementById("solve-speed");
    solveSpeedVal = document.getElementById("slider-speed-val");
    solverPathDom = document.getElementById("solver-path");
    btnToggleWords = document.getElementById("btn-toggle-words");
    remainingWordsListDom = document.getElementById("remaining-words-list");
    possibleListCount = document.getElementById("possible-list-count");
    
    // Tab controls
    tabPlay = document.getElementById("tab-play");
    tabSandbox = document.getElementById("tab-sandbox");
    sandboxGridDom = document.getElementById("sandbox-grid");
    playSolverCard = document.getElementById("play-solver-card");
    sandboxSolverCard = document.getElementById("sandbox-solver-card");

    // Sandbox dashboard
    sandboxPossibleCount = document.getElementById("sandbox-possible-count");
    sandboxRecommendedGuess = document.getElementById("sandbox-recommended-guess");
    btnSubmitSandboxStep = document.getElementById("btn-submit-sandbox-step");
    btnResetSandbox = document.getElementById("btn-reset-sandbox");
    btnSandboxAutofill = document.getElementById("btn-sandbox-autofill");
    sandboxPathDom = document.getElementById("sandbox-solver-path");
    btnToggleSandboxWords = document.getElementById("btn-toggle-sandbox-words");
    sandboxRemainingWordsListDom = document.getElementById("sandbox-remaining-words-list");
    sandboxPossibleListCount = document.getElementById("sandbox-possible-list-count");
    
    // Stats elements
    gameOverSummary = document.getElementById("game-over-summary");
    gameResultTitle = document.getElementById("game-result-title");
    gameSecretWord = document.getElementById("game-secret-word");
    solverMatchInfo = document.getElementById("solver-match-info");
    btnPlayAgain = document.getElementById("btn-play-again");
}

function setupEventListeners() {
    // Prevent browser focus trigger issues (e.g. physical Enter clicking the last focused button/key)
    document.addEventListener("click", (e) => {
        if (e.target.closest("button") || e.target.closest(".key") || e.target.closest("input[type='checkbox']")) {
            if (document.activeElement && typeof document.activeElement.blur === "function") {
                document.activeElement.blur();
            }
        }
    });

    // Tab switching
    tabPlay.addEventListener("click", () => switchTab("play"));
    tabSandbox.addEventListener("click", () => switchTab("sandbox"));

    // Virtual Keyboard Click
    keyboardDom.addEventListener("click", (e) => {
        const target = e.target.closest(".key");
        if (target && !target.disabled) {
            const key = target.dataset.key;
            handleKeyPress(key);
        }
    });

    // Physical Keyboard Press
    document.addEventListener("keydown", (e) => {
        // Ignore key inputs if inside modal
        if (modalHelp.classList.contains("active") || modalStats.classList.contains("active")) {
            return;
        }

        const key = e.key.toLowerCase();
        if (key === "enter") {
            handleKeyPress("enter");
        } else if (key === "backspace" || key === "delete") {
            handleKeyPress("backspace");
        } else if (/^[a-z]$/.test(key)) {
            handleKeyPress(key);
        }
    });

    // Modals
    btnHelp.addEventListener("click", () => showModal(modalHelp));
    closeHelp.addEventListener("click", () => hideModal(modalHelp));
    btnStats.addEventListener("click", () => {
        updateStatsUI();
        showModal(modalStats);
    });
    closeStats.addEventListener("click", () => hideModal(modalStats));

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === modalHelp) hideModal(modalHelp);
        if (e.target === modalStats) hideModal(modalStats);
    });

    // Reset Game
    btnReset.addEventListener("click", () => {
        stopAutoSolve();
        startNewGame();
    });
    btnPlayAgain.addEventListener("click", () => {
        hideModal(modalStats);
        startNewGame();
    });

    // Helper Toggle
    toggleHelper.addEventListener("change", (e) => {
        isSolverEnabled = e.target.checked;
        updateHelperLayout();
        updateTreeLayout();
        saveSettings();
    });

    // Auto-Continue Toggle
    toggleContinue.addEventListener("change", (e) => {
        isAutoContinueEnabled = e.target.checked;
        saveSettings();
    });

    // Animations Toggle
    toggleAnimations.addEventListener("change", (e) => {
        isAnimationDisabled = e.target.checked;
        updateAnimationState();
        saveSettings();
    });

    // Tree toggles (linked)
    toggleTreePlay.addEventListener("change", (e) => {
        isTreeVisible = e.target.checked;
        toggleTreeSandbox.checked = isTreeVisible;
        updateTreeLayout();
        saveSettings();
    });
    toggleTreeSandbox.addEventListener("change", (e) => {
        isTreeVisible = e.target.checked;
        toggleTreePlay.checked = isTreeVisible;
        updateTreeLayout();
        saveSettings();
    });

    // Show Remaining Words List Toggle
    btnToggleWords.addEventListener("click", () => {
        const isCollapsed = remainingWordsListDom.classList.contains("collapsed");
        if (isCollapsed) {
            remainingWordsListDom.classList.remove("collapsed");
            btnToggleWords.textContent = "Hide List";
        } else {
            remainingWordsListDom.classList.add("collapsed");
            btnToggleWords.textContent = "Show List";
        }
    });

    // Autofill button
    btnAutofill.addEventListener("click", () => {
        if (isGameOver) {
            startNewGame();
            setTimeout(() => {
                if (activeTab === "play") {
                    const rec = getRecommendedGuess();
                    if (rec) {
                        fillWord(rec);
                        submitGuess();
                    }
                }
            }, 100);
            return;
        }
        if (isAutoPlaying) return;
        const rec = getRecommendedGuess();
        if (rec) {
            fillWord(rec);
            submitGuess();
        }
    });

    // Auto Play Button
    btnAutoPlay.addEventListener("click", () => {
        if (isGameOver) {
            if (isAutoContinuing) {
                stopAutoSolve(false);
                return;
            }
            startNewGame();
            setTimeout(() => {
                if (activeTab === "play") {
                    startAutoSolve();
                }
            }, 100);
            return;
        }
        if (isAutoPlaying) {
            stopAutoSolve();
        } else {
            startAutoSolve();
        }
    });

    // Auto Step Button
    btnAutoStep.addEventListener("click", () => {
        if (isGameOver) {
            startNewGame();
            setTimeout(() => {
                if (activeTab === "play") {
                    runAutoStep(autoSolveSessionId);
                }
            }, 100);
            return;
        }
        if (isAutoPlaying) return;
        runAutoStep(autoSolveSessionId);
    });

    // Speed Slider
    solveSpeedSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value) / 1000;
        solveSpeedVal.textContent = val.toFixed(1) + "s";
        
        // Immediately reschedule next step if auto-playing to make it feel extremely responsive
        if (isAutoPlaying && !isGameOver && autoSolveTimeoutId) {
            clearTimeout(autoSolveTimeoutId);
            const sliderVal = parseInt(solveSpeedSlider.value);
            const nextStepDelay = Math.max(sliderVal, sliderVal <= 300 ? 50 : 1500);
            scheduleNextAutoStep(nextStepDelay, autoSolveSessionId);
        }
        saveSettings();
    });

    // Click on remaining words list item to autofill
    remainingWordsListDom.addEventListener("click", (e) => {
        const badge = e.target.closest(".word-badge");
        if (badge && !isGameOver && !isAutoPlaying) {
            fillWord(badge.dataset.word);
        }
    });

    // Sandbox grid clicks (toggle tile colors)
    sandboxGridDom.addEventListener("click", (e) => {
        if (activeTab !== "sandbox" || isSandboxOver) return;
        const container = e.target.closest(".tile-container");
        if (!container) return;
        
        const tileFront = container.querySelector(".tile-front");
        if (!tileFront) return;
        
        const id = tileFront.id;
        if (!id.startsWith("sandbox-tile-front-")) return;
        
        const parts = id.split("-");
        const r = parseInt(parts[3]);
        const c = parseInt(parts[4]);
        
        // Can only edit tiles on the current active row that have letters typed in them
        if (r === sandboxRow && c < sandboxCol) {
            const currentVal = sandboxBoardFeedback[r][c];
            const newVal = (parseInt(currentVal) + 1) % 3;
            sandboxBoardFeedback[r][c] = newVal.toString();
            
            // Update classes
            tileFront.className = "tile-front populated";
            if (newVal === 1) {
                tileFront.classList.add("present");
            } else if (newVal === 2) {
                tileFront.classList.add("correct");
            } else {
                tileFront.classList.add("absent");
            }
            saveSandboxState();
        }
    });

    // Sandbox Reset Button
    btnResetSandbox.addEventListener("click", () => {
        startNewSandbox();
    });

    // Sandbox Autofill Button
    btnSandboxAutofill.addEventListener("click", () => {
        if (isSandboxOver) return;
        const rec = getSandboxRecommendedGuess();
        if (rec) {
            fillSandboxWord(rec);
        }
    });

    // Sandbox Submit Step Button
    btnSubmitSandboxStep.addEventListener("click", () => {
        submitSandboxStep();
    });

    // Sandbox Toggle possible words list
    btnToggleSandboxWords.addEventListener("click", () => {
        const isCollapsed = sandboxRemainingWordsListDom.classList.contains("collapsed");
        if (isCollapsed) {
            sandboxRemainingWordsListDom.classList.remove("collapsed");
            btnToggleSandboxWords.textContent = "Hide List";
        } else {
            sandboxRemainingWordsListDom.classList.add("collapsed");
            btnToggleSandboxWords.textContent = "Show List";
        }
    });

    // Sandbox Badge click to autofill
    sandboxRemainingWordsListDom.addEventListener("click", (e) => {
        const badge = e.target.closest(".word-badge");
        if (badge && !isSandboxOver) {
            fillSandboxWord(badge.dataset.word);
        }
    });
}

function showModal(modal) {
    modal.classList.add("active");
}

function hideModal(modal) {
    modal.classList.remove("active");
}

// Local Storage Stats & Settings
function initStats() {
    if (!localStorage.getItem("wordle_stats")) {
        const stats = {
            played: 0,
            wins: 0,
            streak: 0,
            maxStreak: 0,
            distribution: [0, 0, 0, 0, 0, 0]
        };
        localStorage.setItem("wordle_stats", JSON.stringify(stats));
    }
}

function loadSettings() {
    const saved = localStorage.getItem("wordle_settings");
    let settings = {
        isSolverEnabled: true,
        isAutoContinueEnabled: true,
        isAnimationDisabled: false,
        isTreeVisible: false,
        solveSpeed: 2000
    };
    
    if (saved) {
        try {
            settings = { ...settings, ...JSON.parse(saved) };
        } catch (e) {
            console.error("Error parsing settings:", e);
        }
    }
    
    isSolverEnabled = settings.isSolverEnabled;
    isAutoContinueEnabled = settings.isAutoContinueEnabled;
    isAnimationDisabled = settings.isAnimationDisabled || false;
    isTreeVisible = settings.isTreeVisible || false;
    const speed = settings.solveSpeed;
    
    toggleHelper.checked = isSolverEnabled;
    toggleContinue.checked = isAutoContinueEnabled;
    toggleAnimations.checked = isAnimationDisabled;
    toggleTreePlay.checked = isTreeVisible;
    toggleTreeSandbox.checked = isTreeVisible;
    solveSpeedSlider.value = speed;
    solveSpeedVal.textContent = (speed / 1000).toFixed(1) + "s";
    
    updateHelperLayout();
    updateAnimationState();
    updateTreeLayout();
}

function saveSettings() {
    const settings = {
        isSolverEnabled,
        isAutoContinueEnabled,
        isAnimationDisabled,
        isTreeVisible,
        solveSpeed: parseInt(solveSpeedSlider.value)
    };
    localStorage.setItem("wordle_settings", JSON.stringify(settings));
}

function updateHelperLayout() {
    const mainLayout = document.querySelector(".main-layout");
    if (mainLayout) {
        if (activeTab === "play" && !isSolverEnabled) {
            mainLayout.classList.add("no-helper");
        } else {
            mainLayout.classList.remove("no-helper");
        }
    }
}

function updateAnimationState() {
    if (isAnimationDisabled) {
        document.body.classList.add("no-animations");
    } else {
        document.body.classList.remove("no-animations");
    }
}

function updateTreeLayout() {
    const mainLayout = document.querySelector(".main-layout");
    const appContainer = document.querySelector(".app-container");
    const treeAside = document.getElementById("tree-aside");
    if (mainLayout && treeAside) {
        const shouldShowTree = isTreeVisible && (activeTab === "sandbox" || isSolverEnabled);
        
        if (shouldShowTree) {
            treeAside.classList.remove("hidden");
            mainLayout.classList.add("has-tree");
            if (appContainer) appContainer.classList.add("has-tree");
            updateTreeVisualization();
        } else {
            treeAside.classList.add("hidden");
            mainLayout.classList.remove("has-tree");
            if (appContainer) appContainer.classList.remove("has-tree");
        }
    }
}

function updateStatsUI() {
    const stats = JSON.parse(localStorage.getItem("wordle_stats"));
    document.getElementById("stats-played").textContent = stats.played;
    
    const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
    document.getElementById("stats-win-pct").textContent = winPct + "%";
    document.getElementById("stats-streak").textContent = stats.streak;
    document.getElementById("stats-max-streak").textContent = stats.maxStreak;

    // Render Guess Distribution Chart
    const distContainer = document.getElementById("guess-distribution");
    distContainer.innerHTML = "";

    const maxCount = Math.max(...stats.distribution, 1);

    for (let i = 0; i < 6; i++) {
        const count = stats.distribution[i];
        const pct = (count / maxCount) * 100;
        
        const row = document.createElement("div");
        row.className = "dist-row" + (currentRow === i + 1 && isGameOver ? " highlight" : "");

        const label = document.createElement("div");
        label.className = "dist-label";
        label.textContent = i + 1;

        const wrapper = document.createElement("div");
        wrapper.className = "dist-bar-wrapper";

        const bar = document.createElement("div");
        bar.className = "dist-bar";
        bar.style.width = Math.max(pct, 6) + "%";
        bar.textContent = count;

        wrapper.appendChild(bar);
        row.appendChild(label);
        row.appendChild(wrapper);
        distContainer.appendChild(row);
    }
}

function drawGrid() {
    gridDom.innerHTML = "";
    for (let r = 0; r < ROWS; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "grid-row";
        rowDiv.id = `row-${r}`;
        
        for (let c = 0; c < COLS; c++) {
            const tileContainer = document.createElement("div");
            tileContainer.className = "tile-container";
            tileContainer.id = `tile-container-${r}-${c}`;
            
            const tile = document.createElement("div");
            tile.className = "tile";
            
            const front = document.createElement("div");
            front.className = "tile-front";
            front.id = `tile-front-${r}-${c}`;
            
            const back = document.createElement("div");
            back.className = "tile-back";
            back.id = `tile-back-${r}-${c}`;
            
            tile.appendChild(front);
            tile.appendChild(back);
            tileContainer.appendChild(tile);
            rowDiv.appendChild(tileContainer);
        }
        gridDom.appendChild(rowDiv);
    }
}

function drawKeyboard() {
    keyboardDom.innerHTML = "";
    KEYBOARD_ROWS.forEach(rowKeys => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "keyboard-row";
        
        rowKeys.forEach(key => {
            const btn = document.createElement("button");
            btn.className = "key";
            btn.dataset.key = key;
            
            if (key === "enter") {
                btn.className += " large";
                btn.innerHTML = `<i data-lucide="corner-down-left"></i>`;
            } else if (key === "backspace") {
                btn.className += " large";
                btn.innerHTML = `<i data-lucide="delete"></i>`;
            } else {
                btn.textContent = key;
            }
            
            rowDiv.appendChild(btn);
        });
        keyboardDom.appendChild(rowDiv);
    });
    // Create icons on dynamic keyboard
    lucide.createIcons({
        attrs: {
            class: 'keyboard-icon'
        }
    });
}

function handleKeyPress(key) {
    if (activeTab === "play") {
        if (isGameOver || isAutoPlaying) return;
        if (key === "enter") {
            submitGuess();
        } else if (key === "backspace") {
            deleteLetter();
        } else {
            addLetter(key);
        }
    } else {
        if (isSandboxOver) return;
        if (key === "enter") {
            submitSandboxStep();
        } else if (key === "backspace") {
            deleteSandboxLetter();
        } else {
            addSandboxLetter(key);
        }
    }
}

function switchTab(tab) {
    if (activeTab === tab) return;
    
    // Stop autoplay when switching away from standard play
    if (activeTab === "play" && isAutoPlaying) {
        stopAutoSolve();
    }
    
    activeTab = tab;
    localStorage.setItem("wordle_active_tab", tab);
    
    if (tab === "play") {
        tabPlay.classList.add("active");
        tabSandbox.classList.remove("active");
        
        document.getElementById("wordle-grid").classList.remove("hidden");
        sandboxGridDom.classList.add("hidden");
        
        playSolverCard.classList.remove("hidden");
        sandboxSolverCard.classList.add("hidden");
        
        disableManualButtons(isAutoPlaying);
    } else {
        tabPlay.classList.remove("active");
        tabSandbox.classList.add("active");
        
        document.getElementById("wordle-grid").classList.add("hidden");
        sandboxGridDom.classList.remove("hidden");
        
        playSolverCard.classList.add("hidden");
        sandboxSolverCard.classList.remove("hidden");
        
        // Enable keyboard buttons in sandbox
        document.querySelectorAll(".key").forEach(k => k.style.pointerEvents = "all");
    }
    
    updateHelperLayout();
    updateTreeLayout();
    restoreKeyboardColors(tab);
}

function restoreKeyboardColors(tab) {
    const state = (tab === "play" ? playKeyboardState : sandboxKeyboardState) || {};
    document.querySelectorAll(".key").forEach(btn => {
        // Strip correct/present/absent classes
        btn.className = btn.className.replace(/\b(correct|present|absent)\b/g, "").trim();
        const char = btn.dataset.key;
        if (char && state[char]) {
            btn.classList.add(state[char]);
        }
    });
}

function initFloatingBackground() {
    const bg = document.querySelector(".app-background");
    if (!bg) return;
    
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const classes = ["green", "yellow", "gray"];
    const count = 25;
    
    for (let i = 0; i < count; i++) {
        const span = document.createElement("span");
        span.className = "floating-letter " + classes[Math.floor(Math.random() * classes.length)];
        span.textContent = letters[Math.floor(Math.random() * letters.length)];
        
        // Random sizes
        const size = (1.5 + Math.random() * 5.5).toFixed(1) + "rem";
        span.style.fontSize = size;
        
        // Random positions and rotations for 3D translation
        const startX = (Math.random() * 100).toFixed(0) + "vw";
        const startY = (Math.random() * 100).toFixed(0) + "vh";
        const startZ = (-150 - Math.random() * 250).toFixed(0) + "px";
        
        const endX = (Math.random() * 100).toFixed(0) + "vw";
        const endY = (Math.random() * 100).toFixed(0) + "vh";
        const endZ = (100 + Math.random() * 200).toFixed(0) + "px";
        
        const rotX = (Math.random() * 360).toFixed(0) + "deg";
        const rotY = (Math.random() * 360).toFixed(0) + "deg";
        const rotZ = (Math.random() * 360).toFixed(0) + "deg";
        
        span.style.setProperty("--start-x", startX);
        span.style.setProperty("--start-y", startY);
        span.style.setProperty("--start-z", startZ);
        span.style.setProperty("--end-x", endX);
        span.style.setProperty("--end-y", endY);
        span.style.setProperty("--end-z", endZ);
        span.style.setProperty("--rot-x", rotX);
        span.style.setProperty("--rot-y", rotY);
        span.style.setProperty("--rot-z", rotZ);
        
        // Random durations and negative delays so they are already drifting on load
        const duration = (20 + Math.random() * 30).toFixed(1) + "s";
        const delay = (-Math.random() * 25).toFixed(1) + "s";
        span.style.animationDuration = duration;
        span.style.animationDelay = delay;
        
        bg.appendChild(span);
    }
}
