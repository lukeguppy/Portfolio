function saveGameState() {
    const state = {
        secretWord,
        currentRow,
        currentCol,
        boardState,
        boardFeedback,
        guesses,
        isGameOver,
        playKeyboardState,
        deviated,
        solverPath
    };
    localStorage.setItem("wordle_game_state", JSON.stringify(state));
}

function loadGameState() {
    const saved = localStorage.getItem("wordle_game_state");
    if (!saved) return false;
    try {
        const state = JSON.parse(saved);
        secretWord = state.secretWord;
        currentRow = state.currentRow;
        currentCol = state.currentCol;
        boardState = state.boardState;
        boardFeedback = state.boardFeedback;
        guesses = state.guesses;
        isGameOver = state.isGameOver;
        playKeyboardState = state.playKeyboardState || {};
        deviated = state.deviated;
        solverPath = state.solverPath || [];
        
        // Reconstruct remaining words and solver tree node
        remainingWords = [...TARGET_WORDS];
        solverNode = SOLVER_TREE;
        for (const step of solverPath) {
            remainingWords = remainingWords.filter(word => getFeedback(step.guess, word) === step.feedback);
            if (!deviated && solverNode && solverNode.branches && solverNode.branches[step.feedback]) {
                solverNode = solverNode.branches[step.feedback];
            } else {
                deviated = true;
                solverNode = null;
            }
        }
        
        // Redraw grid, keyboard and solver UI
        redrawGridFromState();
        updateSolverUI();
        
        // If game is over, show the summary card
        if (isGameOver) {
            const win = guesses[guesses.length - 1] === secretWord;
            gameResultTitle.textContent = win ? "BRILLIANT!" : "GAME OVER";
            gameResultTitle.style.color = win ? "var(--color-correct)" : "#ef4444";
            gameSecretWord.textContent = secretWord.toUpperCase();
            
            let solverStatusStr = "";
            const guessCount = guesses.length;
            const solverTurns = solverPath.length;
            if (win) {
                if (guessCount < solverTurns) {
                    solverStatusStr = `Incredible! You beat the solver by ${solverTurns - guessCount} guess${solverTurns - guessCount > 1 ? 'es' : ''}!`;
                } else if (guessCount === solverTurns) {
                    solverStatusStr = `Nice! You solved it in ${guessCount} guesses, matching the optimal solver!`;
                } else {
                    solverStatusStr = `You solved it in ${guessCount} guesses. The solver would have solved it in ${solverTurns} guesses.`;
                }
            } else {
                solverStatusStr = `The solver solved this in ${solverTurns} guesses. Better luck next time!`;
            }
            solverMatchInfo.innerHTML = `<i data-lucide="cpu" class="inline-icon" style="color: var(--color-primary)"></i> ${solverStatusStr}`;
            lucide.createIcons();
            gameOverSummary.classList.remove("hidden");
        } else {
            gameOverSummary.classList.add("hidden");
        }
        
        return true;
    } catch (e) {
        console.error("Error loading game state:", e);
        return false;
    }
}

function redrawGridFromState() {
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
            
            const letter = boardState[r][c];
            const feedbackVal = boardFeedback[r][c];
            
            if (r < currentRow) {
                // Flipped state
                back.textContent = letter;
                if (feedbackVal === '2') back.classList.add("correct");
                else if (feedbackVal === '1') back.classList.add("present");
                else back.classList.add("absent");
                tileContainer.classList.add("flipped");
            } else {
                // Unflipped state
                front.textContent = letter;
                if (letter) front.classList.add("populated");
            }
            
            tile.appendChild(front);
            tile.appendChild(back);
            tileContainer.appendChild(tile);
            rowDiv.appendChild(tileContainer);
        }
        gridDom.appendChild(rowDiv);
    }
}

function recordGameResult(win, guessCount) {
    const stats = JSON.parse(localStorage.getItem("wordle_stats"));
    stats.played += 1;
    if (win) {
        stats.wins += 1;
        stats.streak += 1;
        stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
        stats.distribution[guessCount - 1] += 1;
    } else {
        stats.streak = 0;
    }
    localStorage.setItem("wordle_stats", JSON.stringify(stats));
}

// Core Game Functions
function startNewGame() {
    if (postGameTimeoutId) {
        clearTimeout(postGameTimeoutId);
        postGameTimeoutId = null;
    }
    // Select secret word randomly from Curated TARGET_WORDS
    const randIndex = Math.floor(Math.random() * TARGET_WORDS.length);
    secretWord = TARGET_WORDS[randIndex];
    console.log("Secret word selected: " + secretWord.toUpperCase());

    // Reset game state variables
    currentRow = 0;
    currentCol = 0;
    boardState = Array(ROWS).fill().map(() => Array(COLS).fill(""));
    boardFeedback = Array(ROWS).fill().map(() => Array(COLS).fill(""));
    guesses = [];
    isGameOver = false;
    playKeyboardState = {}; // Reset play keyboard cache
    
    // Reset solver variables
    remainingWords = [...TARGET_WORDS];
    solverNode = SOLVER_TREE;
    deviated = false;
    solverPath = [];

    // Clear and draw grid
    drawGrid();
    
    // Draw keyboard
    if (activeTab === "play") {
        drawKeyboard();
    } else {
        drawKeyboard();
        restoreKeyboardColors(activeTab);
    }

    // Reset solver panel
    updateSolverUI();

    // Hide summary panel
    gameOverSummary.classList.add("hidden");
    
    saveGameState();
}

function addLetter(letter) {
    if (currentCol >= COLS || currentRow >= ROWS) return;
    
    boardState[currentRow][currentCol] = letter;
    
    // Update DOM
    const front = document.getElementById(`tile-front-${currentRow}-${currentCol}`);
    front.textContent = letter;
    front.classList.add("populated");
    
    currentCol++;
    saveGameState();
}

function deleteLetter() {
    if (currentCol <= 0 || currentRow >= ROWS) return;
    currentCol--;
    
    boardState[currentRow][currentCol] = "";
    
    // Update DOM
    const front = document.getElementById(`tile-front-${currentRow}-${currentCol}`);
    front.textContent = "";
    front.classList.remove("populated");
    saveGameState();
}

function fillWord(word) {
    // Clear current word first
    while (currentCol > 0) {
        deleteLetter();
    }
    // Type new word
    for (let i = 0; i < 5; i++) {
        addLetter(word[i]);
    }
}

function submitGuess() {
    if (currentCol < COLS) {
        showToast("Not enough letters");
        shakeRow(currentRow);
        return false;
    }

    const guess = boardState[currentRow].join("").toLowerCase();
    
    // Check if valid guess
    if (!VALID_GUESSES.includes(guess)) {
        showToast("Not in word list");
        shakeRow(currentRow);
        return false;
    }

    // Lock board changes immediately
    const rowNum = currentRow;
    currentRow++;
    currentCol = 0;

    guesses.push(guess);

    // Calculate feedback
    const feedback = getFeedback(guess, secretWord);
    boardFeedback[rowNum] = feedback.split('');

    // Check if game is over synchronously so auto-solve loop knows immediately
    if (guess === secretWord) {
        isGameOver = true;
    } else if (rowNum === ROWS - 1) {
        isGameOver = true;
    }

    // Reveal feedbacks row by row
    revealRowFeedback(rowNum, feedback);
    
    saveGameState();

    return true;
}

function shakeRow(rowNum) {
    const row = document.getElementById(`row-${rowNum}`);
    row.classList.add("shake");
    setTimeout(() => {
        row.classList.remove("shake");
    }, 500);
}

function revealRowFeedback(rowNum, feedback) {
    const guess = guesses[rowNum];
    const sliderVal = parseInt(solveSpeedSlider.value);
    const isFastAuto = (isAutoPlaying && sliderVal <= 300) || isAnimationDisabled;
    
    for (let c = 0; c < COLS; c++) {
        const val = feedback[c];
        const container = document.getElementById(`tile-container-${rowNum}-${c}`);
        const back = document.getElementById(`tile-back-${rowNum}-${c}`);
        
        // Populate back side letter
        back.textContent = guess[c];
        
        // Add color status to back
        if (val === '2') {
            back.classList.add("correct");
        } else if (val === '1') {
            back.classList.add("present");
        } else {
            back.classList.add("absent");
        }

        if (isFastAuto) {
            // Flip instantly without delay for fast auto-play
            container.classList.add("flipped");
            updateSingleKeyColor(guess[c], val);
        } else {
            // Apply flip delay for premium look (200ms between each tile)
            setTimeout(() => {
                container.classList.add("flipped");
                updateSingleKeyColor(guess[c], val);
            }, c * 200);
        }
    }

    // Wait for the flips to finish:
    // 50ms for fast auto-play, 1000ms for normal play (exactly as the last tile reveals its feedback)
    const finishDelay = isFastAuto ? 50 : 1000;

    setTimeout(() => {
        // Update solver logic and tree visualization after flip animations complete
        processSolverStep(guess, feedback);
        saveGameState();

        if (guess === secretWord) {
            // Player wins!
            if (!isFastAuto) {
                triggerWinAnimation(rowNum);
            }
            endGame(true, rowNum + 1);
        } else if (rowNum === ROWS - 1) {
            // Player loses!
            endGame(false, ROWS);
        }
    }, finishDelay);
}

function updateSingleKeyColor(char, val) {
    const keyBtn = document.querySelector(`.key[data-key="${char}"]`);
    if (!keyBtn) return;

    let finalClass = "absent";
    if (val === '2') {
        keyBtn.className = "key correct";
        finalClass = "correct";
    } else if (val === '1') {
        // Green ('correct') overrides Yellow ('present')
        if (!keyBtn.classList.contains("correct")) {
            keyBtn.className = "key present";
            finalClass = "present";
        } else {
            finalClass = "correct";
        }
    } else {
        // Don't override correct/present
        if (!keyBtn.classList.contains("correct") && !keyBtn.classList.contains("present")) {
            keyBtn.className = "key absent";
            finalClass = "absent";
        } else {
            finalClass = keyBtn.classList.contains("correct") ? "correct" : "present";
        }
    }
    playKeyboardState[char] = finalClass;
    saveGameState();
}

function endGame(win, guessCount) {
    const wasAutoPlaying = isAutoPlaying;
    isGameOver = true;
    
    if (wasAutoPlaying) {
        const keepPaused = isAutoContinueEnabled;
        isAutoContinuing = keepPaused;
        stopAutoSolve(keepPaused);
    } else {
        isAutoContinuing = isAutoContinueEnabled;
    }
    
    recordGameResult(win, guessCount);
    
    // Prepare Modal Summary
    gameResultTitle.textContent = win ? "BRILLIANT!" : "GAME OVER";
    gameResultTitle.style.color = win ? "var(--color-correct)" : "#ef4444";
    gameSecretWord.textContent = secretWord.toUpperCase();
    
    // Determine solver comparison statement
    let solverStatusStr = "";
    if (win) {
        const solverTurns = solverPath.length;
        if (guessCount < solverTurns) {
            solverStatusStr = `Incredible! You beat the solver by ${solverTurns - guessCount} guess${solverTurns - guessCount > 1 ? 'es' : ''}!`;
        } else if (guessCount === solverTurns) {
            solverStatusStr = `Nice! You solved it in ${guessCount} guesses, matching the optimal solver!`;
        } else {
            solverStatusStr = `You solved it in ${guessCount} guesses. The solver would have solved it in ${solverTurns} guesses.`;
        }
    } else {
        const solverTurns = solverPath.length;
        solverStatusStr = `The solver solved this in ${solverTurns} guesses. Better luck next time!`;
    }
    
    solverMatchInfo.innerHTML = `<i data-lucide="cpu" class="inline-icon" style="color: var(--color-primary)"></i> ${solverStatusStr}`;
    lucide.createIcons();

    // Show panel summary
    gameOverSummary.classList.remove("hidden");

    saveGameState();

    // Automatically trigger stats modal or auto-continue
    // Dynamically scale the post-game transition delay:
    // 3000ms for manual play, 200ms for fast auto-play, and 800ms for moderate auto-play.
    const sliderVal = parseInt(solveSpeedSlider.value);
    const postGameDelay = wasAutoPlaying ? (sliderVal <= 300 ? 200 : 800) : 3000;

    if (postGameTimeoutId) {
        clearTimeout(postGameTimeoutId);
    }
    postGameTimeoutId = setTimeout(() => {
        postGameTimeoutId = null;
        if (activeTab === "play") {
            if (isAutoContinueEnabled && isAutoContinuing) {
                isAutoContinuing = false;
                startNewGame();
                if (wasAutoPlaying) {
                    startAutoSolve();
                }
            } else {
                if (!isAutoContinuing) {
                    updateStatsUI();
                    showModal(modalStats);
                }
            }
        }
    }, postGameDelay);
}
