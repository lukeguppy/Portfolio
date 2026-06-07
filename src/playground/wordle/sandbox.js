function saveSandboxState() {
    const state = {
        sandboxRow,
        sandboxCol,
        sandboxBoardState,
        sandboxBoardFeedback,
        sandboxPath,
        isSandboxOver,
        sandboxKeyboardState
    };
    localStorage.setItem("wordle_sandbox_state", JSON.stringify(state));
}

function loadSandboxState() {
    const saved = localStorage.getItem("wordle_sandbox_state");
    if (!saved) return false;
    try {
        const state = JSON.parse(saved);
        sandboxRow = state.sandboxRow;
        sandboxCol = state.sandboxCol;
        sandboxBoardState = state.sandboxBoardState;
        sandboxBoardFeedback = state.sandboxBoardFeedback;
        sandboxPath = state.sandboxPath || [];
        isSandboxOver = state.isSandboxOver;
        sandboxKeyboardState = state.sandboxKeyboardState || {};
        
        // Reconstruct remaining sandbox words
        sandboxRemainingWords = [...TARGET_WORDS];
        for (const step of sandboxPath) {
            sandboxRemainingWords = sandboxRemainingWords.filter(w => getFeedback(step.guess, w) === step.feedback);
        }
        
        // Redraw sandbox grid
        redrawSandboxGridFromState();
        updateSandboxSolverUI();
        
        return true;
    } catch (e) {
        console.error("Error loading sandbox state:", e);
        return false;
    }
}

function redrawSandboxGridFromState() {
    sandboxGridDom.innerHTML = "";
    for (let r = 0; r < ROWS; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "grid-row";
        rowDiv.id = `sandbox-row-${r}`;
        
        for (let c = 0; c < COLS; c++) {
            const tileContainer = document.createElement("div");
            tileContainer.className = "tile-container";
            tileContainer.id = `sandbox-tile-container-${r}-${c}`;
            
            const tile = document.createElement("div");
            tile.className = "tile";
            
            const front = document.createElement("div");
            front.className = "tile-front";
            front.id = `sandbox-tile-front-${r}-${c}`;
            
            const back = document.createElement("div");
            back.className = "tile-back";
            back.id = `sandbox-tile-back-${r}-${c}`;
            
            const letter = sandboxBoardState[r][c];
            const feedbackVal = sandboxBoardFeedback[r][c];
            
            if (r < sandboxRow) {
                // Flipped/submitted state
                back.textContent = letter;
                if (feedbackVal === '2') back.className = "tile-back correct";
                else if (feedbackVal === '1') back.className = "tile-back present";
                else back.className = "tile-back absent";
                tileContainer.classList.add("flipped");
            } else if (r === sandboxRow) {
                // Active row
                front.textContent = letter;
                if (letter) front.classList.add("populated");
                if (feedbackVal === '1') {
                    front.classList.add("present");
                } else if (feedbackVal === '2') {
                    front.classList.add("correct");
                } else if (letter) {
                    front.classList.add("absent");
                }
            } else {
                // Future rows
                front.textContent = letter;
            }
            
            tile.appendChild(front);
            tile.appendChild(back);
            tileContainer.appendChild(tile);
            rowDiv.appendChild(tileContainer);
        }
        sandboxGridDom.appendChild(rowDiv);
    }
}

// Sandbox Solver Logic and UI Rendering
function startNewSandbox() {
    sandboxRow = 0;
    sandboxCol = 0;
    sandboxBoardState = Array(ROWS).fill().map(() => Array(COLS).fill(""));
    sandboxBoardFeedback = Array(ROWS).fill().map(() => Array(COLS).fill("0"));
    sandboxRemainingWords = [...TARGET_WORDS];
    sandboxPath = [];
    isSandboxOver = false;
    sandboxKeyboardState = {};
    
    // Draw sandbox grid
    drawSandboxGrid();
    
    // Reset keyboard if in sandbox
    if (activeTab === "sandbox") {
        restoreKeyboardColors("sandbox");
    }
    
    updateSandboxSolverUI();
    saveSandboxState();
}

function drawSandboxGrid() {
    sandboxGridDom.innerHTML = "";
    for (let r = 0; r < ROWS; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "grid-row";
        rowDiv.id = `sandbox-row-${r}`;
        
        for (let c = 0; c < COLS; c++) {
            const tileContainer = document.createElement("div");
            tileContainer.className = "tile-container";
            tileContainer.id = `sandbox-tile-container-${r}-${c}`;
            
            const tile = document.createElement("div");
            tile.className = "tile";
            
            const front = document.createElement("div");
            front.className = "tile-front";
            front.id = `sandbox-tile-front-${r}-${c}`;
            
            const back = document.createElement("div");
            back.className = "tile-back";
            back.id = `sandbox-tile-back-${r}-${c}`;
            
            tile.appendChild(front);
            tile.appendChild(back);
            tileContainer.appendChild(tile);
            rowDiv.appendChild(tileContainer);
        }
        sandboxGridDom.appendChild(rowDiv);
    }
}

function addSandboxLetter(letter) {
    if (sandboxCol >= COLS || sandboxRow >= ROWS) return;
    sandboxBoardState[sandboxRow][sandboxCol] = letter;
    
    const front = document.getElementById(`sandbox-tile-front-${sandboxRow}-${sandboxCol}`);
    front.textContent = letter;
    front.classList.add("populated");
    
    sandboxCol++;
    saveSandboxState();
}

function deleteSandboxLetter() {
    if (sandboxCol <= 0 || sandboxRow >= ROWS) return;
    sandboxCol--;
    sandboxBoardState[sandboxRow][sandboxCol] = "";
    
    const front = document.getElementById(`sandbox-tile-front-${sandboxRow}-${sandboxCol}`);
    front.textContent = "";
    front.className = "tile-front";
    sandboxBoardFeedback[sandboxRow][sandboxCol] = "0";
    saveSandboxState();
}

function fillSandboxWord(word) {
    while (sandboxCol > 0) {
        deleteSandboxLetter();
    }
    for (let i = 0; i < 5; i++) {
        addSandboxLetter(word[i]);
    }
}

function submitSandboxStep() {
    if (sandboxCol < COLS) {
        showToast("Not enough letters");
        shakeSandboxRow(sandboxRow);
        return;
    }
    
    const guess = sandboxBoardState[sandboxRow].join("").toLowerCase();
    if (!VALID_GUESSES.includes(guess)) {
        showToast("Not in word list");
        shakeSandboxRow(sandboxRow);
        return;
    }
    
    const feedback = sandboxBoardFeedback[sandboxRow].join("");
    
    revealSandboxRowFeedback(sandboxRow, feedback);
    
    sandboxPath.push({ guess, feedback });
    
    // Filter remaining sandbox words
    sandboxRemainingWords = sandboxRemainingWords.filter(w => getFeedback(guess, w) === feedback);
    
    if (feedback === "22222") {
        isSandboxOver = true;
        showToast("Word Solved!");
    } else if (sandboxRow === ROWS - 1) {
        isSandboxOver = true;
        showToast("Sandbox completed!");
    }
    
    sandboxRow++;
    sandboxCol = 0;
    
    updateSandboxSolverUI();
    saveSandboxState();
}

function shakeSandboxRow(rowNum) {
    const row = document.getElementById(`sandbox-row-${rowNum}`);
    if (row) {
        row.classList.add("shake");
        setTimeout(() => {
            row.classList.remove("shake");
        }, 500);
    }
}

function revealSandboxRowFeedback(rowNum, feedback) {
    const guess = sandboxBoardState[rowNum].join("").toLowerCase();
    for (let c = 0; c < COLS; c++) {
        const val = feedback[c];
        const container = document.getElementById(`sandbox-tile-container-${rowNum}-${c}`);
        const back = document.getElementById(`sandbox-tile-back-${rowNum}-${c}`);
        
        back.textContent = guess[c];
        if (val === '2') back.className = "tile-back correct";
        else if (val === '1') back.className = "tile-back present";
        else back.className = "tile-back absent";
        
        if (isAnimationDisabled) {
            container.classList.add("flipped");
            updateSandboxKeyboardColors(guess[c], val);
        } else {
            setTimeout(() => {
                container.classList.add("flipped");
                updateSandboxKeyboardColors(guess[c], val);
            }, c * 200);
        }
    }
}

function updateSandboxKeyboardColors(char, val) {
    const keyBtn = document.querySelector(`.key[data-key="${char}"]`);
    if (!keyBtn) return;
    
    let finalClass = "absent";
    if (val === '2') {
        keyBtn.className = "key correct";
        finalClass = "correct";
    } else if (val === '1') {
        if (!keyBtn.classList.contains("correct")) {
            keyBtn.className = "key present";
            finalClass = "present";
        } else {
            finalClass = "correct";
        }
    } else {
        if (!keyBtn.classList.contains("correct") && !keyBtn.classList.contains("present")) {
            keyBtn.className = "key absent";
            finalClass = "absent";
        } else {
            finalClass = keyBtn.classList.contains("correct") ? "correct" : "present";
        }
    }
    sandboxKeyboardState[char] = finalClass;
    saveSandboxState();
}

function getSandboxRecommendedGuess() {
    if (sandboxRemainingWords.length === 0) return null;
    if (sandboxRemainingWords.length === 1) return sandboxRemainingWords[0];
    
    // Check if we followed the tree starting with our computed best start word ("raise")
    let node = SOLVER_TREE;
    let sDeviated = false;
    
    for (const step of sandboxPath) {
        if (!sDeviated && node && node.guess === step.guess && node.branches && node.branches[step.feedback]) {
            node = node.branches[step.feedback];
        } else {
            sDeviated = true;
            node = null;
        }
    }
    
    if (!sDeviated && node && node.guess) {
        return node.guess;
    }
    
    // Recalculate best entropy on-the-fly dynamically
    return findBestGuessDynamic(sandboxRemainingWords);
}

function updateSandboxSolverUI() {
    const countVal = sandboxRemainingWords.length;
    sandboxPossibleCount.textContent = countVal.toLocaleString();
    sandboxPossibleListCount.textContent = countVal.toLocaleString();
    
    const rec = getSandboxRecommendedGuess();
    sandboxRecommendedGuess.textContent = rec ? rec.toUpperCase() : "N/A";
    
    sandboxPathDom.innerHTML = "";
    if (sandboxPath.length === 0) {
        sandboxPathDom.innerHTML = `<div class="path-placeholder">Enter a guess on the board to start...</div>`;
    } else {
        sandboxPath.forEach((step, idx) => {
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
            sandboxPathDom.appendChild(stepDiv);
        });
    }
    
    sandboxRemainingWordsListDom.innerHTML = "";
    if (countVal > 0) {
        const visibleWords = sandboxRemainingWords.slice(0, 150);
        visibleWords.forEach(word => {
            const badge = document.createElement("span");
            badge.className = "word-badge";
            badge.dataset.word = word;
            badge.textContent = word;
            sandboxRemainingWordsListDom.appendChild(badge);
        });
        
        if (countVal > 150) {
            const extra = document.createElement("span");
            extra.style.fontSize = "0.8rem";
            extra.style.color = "var(--text-muted)";
            extra.style.padding = "4px 8px";
            extra.textContent = `+ ${countVal - 150} more...`;
            sandboxRemainingWordsListDom.appendChild(extra);
        }
    } else {
        sandboxRemainingWordsListDom.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-muted); width: 100%; text-align: center;">No possible words left. (Check your feedback colors!)</span>`;
    }
    updateTreeLayout();
}