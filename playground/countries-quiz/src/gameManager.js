import { isCorrectAnswer } from './countriesData.js';
import { CONTINENTS } from './continentsData.js';
import confetti from 'canvas-confetti';

export class GameManager {
    constructor(mapManager) {
        this.mapManager = mapManager;
        this.queue = [];
        this.skipped = [];
        this.currentCountry = null;
        this.score = 0;
        this.totalCountries = 0;
        this.completedCount = 0;
        this.timerInterval = null;
        this.startTime = null;
        this.currentLives = 3;
        this.livesMap = new Map(); // Persistence for skips
        this.wrongCount = 0;
        this.currentSkippedCount = 0;
        this.skippedIds = new Set();
        this.perfectCount = 0;
        this.partialCount = 0;

        // Game Mode
        this.selectedMode = "World";
        this.livesEnabled = true;

        // UI Elements
        this.ui = {
            startOverlay: document.getElementById('start-overlay'),
            livesToggle: document.getElementById('lives-toggle'),
            gameControls: document.getElementById('game-controls'),
            gameControls: document.getElementById('game-controls'),
            topBar: document.getElementById('top-bar'),
            endOverlay: document.getElementById('end-overlay'),
            startBtn: document.getElementById('start-btn'),
            guessInput: document.getElementById('guess-input'),
            skipBtn: document.getElementById('skip-btn'),
            passBtn: document.getElementById('pass-btn'),
            scoreDisplay: document.getElementById('score'),
            timerDisplay: document.getElementById('timer'),
            scoreVal: document.getElementById('score-val'),
            finalScoreVal: document.getElementById('final-score-val'),
            finalTimeText: document.getElementById('final-time-text'),
            restartBtn: document.getElementById('restart-btn'),
            restartBtn: document.getElementById('restart-btn'),
            modeBtns: document.querySelectorAll('.mode-btn'),
            zenBtn: document.getElementById('lives-zen'),
            heartBtns: document.querySelectorAll('.heart-btn'),
            livesContainer: document.getElementById('lives-container'),
            feedbackDisplay: document.getElementById('feedback-display'),
            feedbackCountry: document.getElementById('feedback-country'),
            progressGreen: document.getElementById('progress-fill-green'),
            progressOrange: document.getElementById('progress-fill-orange'),
            progressPurple: document.getElementById('progress-fill-purple'),
            progressRed: document.getElementById('progress-fill-red'),
            progressEmpty: document.getElementById('progress-fill-empty')
        };

        this.bindEvents();
    }

    bindEvents() {
        this.ui.startBtn.addEventListener('click', () => this.startGame());
        this.ui.restartBtn.addEventListener('click', () => this.resetGame());

        this.ui.guessInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleGuess();
        });

        this.ui.skipBtn.addEventListener('click', () => this.skipCountry());
        this.ui.passBtn.addEventListener('click', () => this.passCountry());

        this.ui.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.ui.modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedMode = btn.dataset.mode;
            });
        });

        // Difficulty Selection
        this.ui.zenBtn.addEventListener('click', () => this.setDifficulty(0));

        this.ui.heartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = parseInt(btn.dataset.val);
                this.setDifficulty(val);
            });
        });

        // Initialize default view (3 lives)
        this.setDifficulty(3);
    }

    setDifficulty(lives) {
        this.startingLives = lives;
        this.livesEnabled = (lives > 0);

        // Update Zen Button
        if (lives === 0) {
            this.ui.zenBtn.classList.add('active');
        } else {
            this.ui.zenBtn.classList.remove('active');
        }

        // Update Hearts
        this.ui.heartBtns.forEach(btn => {
            const val = parseInt(btn.dataset.val);
            if (val <= lives) {
                btn.classList.add('filled');
            } else {
                btn.classList.remove('filled');
            }
        });
    }

    resetGame() {
        this.ui.endOverlay.classList.add('hidden');
        this.ui.startOverlay.classList.remove('hidden');
        // Don't auto-start, let them pick mode again
    }

    startGame() {
        // Filter countries based on mode
        let allCountries = this.mapManager.countries;

        if (this.selectedMode !== "World") {
            allCountries = allCountries.filter(c => {
                const continent = CONTINENTS[c.id]; // c.id is now the Name (e.g. "France")
                return continent === this.selectedMode;
            });

            if (allCountries.length === 0) {
                console.warn(`No countries found for ${this.selectedMode} - Fallback to World`);
                allCountries = this.mapManager.countries;
            }
        }

        // Reset state
        this.queue = [...allCountries];
        this.queue = this.shuffle(this.queue);

        // limit to reasonable amount? user said "all countries" implied by "randomly ordered list"
        // But maybe let's limit to 20 for testing if it was huge? No, user implies full run.

        this.totalCountries = this.queue.length;
        this.skipped = [];
        this.skippedIds.clear();
        this.livesMap.clear(); // Reset lives memory

        // Value Counters
        this.score = 0;
        this.perfectCount = 0;
        this.partialCount = 0;
        this.wrongCount = 0;
        this.currentSkippedCount = 0;

        this.completedCount = 0;
        this.startTime = Date.now();

        // Reset UI
        this.ui.startOverlay.classList.add('hidden');
        this.ui.gameControls.classList.remove('hidden');
        this.ui.topBar.classList.remove('hidden');
        this.ui.guessInput.value = '';
        this.ui.guessInput.focus();

        this.startTimer();
        this.updateScoreUI();
        this.updateProgressBar();

        // Reset map colours
        this.mapManager.countries.forEach(c => this.mapManager.highlightCountry(c.id, 'default'));

        this.nextTurn();
    }

    shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            this.ui.timerDisplay.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    updateProgressBar() {
        if (this.totalCountries === 0) return;

        const remaining = Math.max(0, this.totalCountries - (this.perfectCount + this.partialCount + this.currentSkippedCount + this.wrongCount));


        // Use flex-grow for perfect fit (no rounding gaps)
        this.ui.progressGreen.style.flexGrow = this.perfectCount;
        this.ui.progressOrange.style.flexGrow = this.partialCount;
        this.ui.progressPurple.style.flexGrow = this.currentSkippedCount;
        this.ui.progressRed.style.flexGrow = this.wrongCount;
        this.ui.progressEmpty.style.flexGrow = remaining;
    }

    nextTurn() {
        // Check if we have anything in queue
        if (this.queue.length === 0) {
            // If queue is empty, check skipped
            if (this.skipped.length === 0) {
                this.endGame();
                return;
            } else {
                // Refill queue from skipped
                this.queue = [...this.skipped];
                this.skipped = [];
            }
        }

        this.currentCountry = this.queue.pop();

        // Check if this country was previously skipped (for progress bar logic)
        const currentStatus = this.mapManager.countryStates.get(this.currentCountry.id);
        this.isRetryingSkipped = (currentStatus === 'skipped');

        // Note: We do NOT decrement currentSkippedCount here anymore, so the bar stays full.
        // We will decrement it when the turn resolves (guess/pass).

        // Restore lives from memory or default to configured
        if (this.livesMap.has(this.currentCountry.id)) {
            this.currentLives = this.livesMap.get(this.currentCountry.id);
        } else {
            this.currentLives = this.startingLives;
        }

        this.updateLivesUI();

        // Highlight and Zoom
        this.mapManager.highlightCountry(this.currentCountry.id, 'selected');
        this.mapManager.zoomToCountry(this.currentCountry.id);

        this.ui.guessInput.value = '';
        // Small delay to focus to ensure transition is done or keyboard ready
        setTimeout(() => this.ui.guessInput.focus(), 100);
    }

    updateLivesUI() {
        // Hide if lives disabled (Zen) OR if strict 1 life (Sudden Death - no need to show 1 heart)
        if (!this.livesEnabled || this.startingLives === 1) {
            this.ui.livesContainer.style.display = 'none';
            return;
        }

        this.ui.livesContainer.style.display = 'flex';
        const hearts = this.ui.livesContainer.children;

        // Loop through all 3 potential heart slots
        for (let i = 0; i < 3; i++) {
            // First, determine if this heart slot should even exist
            if (i < this.startingLives) {
                // Yes, it exists. Show it.
                hearts[i].style.display = 'block';

                // Now check if it is "filled/alive" or "lost" based on CURRENT lives
                // currentLives counts down. So if we started with 2, currentLives=2 means both full.
                // currentLives=1 means 1 full, 1 lost.
                // The tricky part: visually we usually fill from left or right?
                // Let's assume standard: Heart 0 is first to be lost? No, usually last.
                // If lives = 2 (Start=2):
                // Heart 0: Alive
                // Heart 1: Alive
                // Heart 2: Hidden

                // If currentLives reduces to 1:
                // Heart 0: Alive
                // Heart 1: Lost

                // So if index < currentLives, it is ALIVE.
                if (i < this.currentLives) {
                    hearts[i].classList.remove('lost');
                } else {
                    hearts[i].classList.add('lost');
                }
            } else {
                // No, this slot is beyond our max lives for this run. Hide it.
                hearts[i].style.display = 'none';
            }
        }
    }

    handleGuess() {
        const guess = this.ui.guessInput.value;
        if (!guess) return;

        if (isCorrectAnswer(guess, this.currentCountry.name)) {
            // Correct!

            // Adjust counts if we are resolving a skip
            if (this.isRetryingSkipped) {
                this.currentSkippedCount = Math.max(0, this.currentSkippedCount - 1);
                this.skippedIds.delete(this.currentCountry.id);
            }

            // Score handling:
            // Check if we haven't lost ANY lives yet (First Try)
            if (this.currentLives === this.startingLives) {
                // Perfect
                this.score += 1;
                this.perfectCount++;
                this.mapManager.highlightCountry(this.currentCountry.id, 'correct'); // Explicit Green
            } else {
                // Partial (1 or 2 lives left)
                this.score += 0.5;
                this.partialCount++;
                this.mapManager.highlightCountry(this.currentCountry.id, 'partial'); // Explicit Orange
            }

            this.completedCount++;

            this.updateScoreUI();
            this.updateProgressBar();

            // Fun effect
            this.triggerConfetti();

            this.nextTurn();
        } else {
            // Incorrect guess
            this.currentLives--;
            this.livesMap.set(this.currentCountry.id, this.currentLives);

            this.updateLivesUI();

            this.ui.guessInput.classList.add('shake');
            setTimeout(() => this.ui.guessInput.classList.remove('shake'), 400);

            this.ui.guessInput.value = '';

            if (this.currentLives <= 0) {
                // Only fail if lives are enabled
                if (this.livesEnabled) {
                    this.passCountry(); // Game Over for this country
                }
                // If lives disabled, just keep infinite loop (user must Skip/Pass manually)
            }
        }
    }

    passCountry() {
        if (this.isTransitioning) return; // Prevent double trigger
        this.isTransitioning = true;

        // Adjust counts if we are resolving a skip
        if (this.isRetryingSkipped) {
            this.currentSkippedCount = Math.max(0, this.currentSkippedCount - 1);
            this.skippedIds.delete(this.currentCountry.id);
        }

        // Mark as wrong
        this.mapManager.highlightCountry(this.currentCountry.id, 'wrong');

        this.wrongCount++;
        this.completedCount++; // It's done, but wrong.
        this.updateProgressBar();

        // Show Feedback (Non-blocking toast)
        this.showFeedback(this.currentCountry.name);

        // Short Delay Next Turn to allow seeing the "Wrong" color briefly
        setTimeout(() => {
            this.isTransitioning = false;
            this.nextTurn();
        }, 600);

        // Hide feedback independently after longer delay
        setTimeout(() => {
            this.hideFeedback();
        }, 2000);
    }

    showFeedback(countryName) {
        this.ui.feedbackCountry.textContent = countryName;
        this.ui.feedbackDisplay.classList.remove('hidden');
        this.ui.feedbackDisplay.classList.remove('fade-out');
        // Do NOT disable input
    }

    hideFeedback() {
        this.ui.feedbackDisplay.classList.add('fade-out');
        setTimeout(() => {
            this.ui.feedbackDisplay.classList.add('hidden');
        }, 300);
    }

    skipCountry() {
        this.mapManager.highlightCountry(this.currentCountry.id, 'skipped');
        this.skipped.unshift(this.currentCountry);

        // Only increment skip count if it wasn't ALREADY skipped
        if (!this.isRetryingSkipped) {
            this.currentSkippedCount++;
        }

        this.updateProgressBar();

        this.nextTurn();
    }

    updateScoreUI() {
        // "give a mark of how many they got right... once we have no countries left"
        // Display score, format to remove .0 if integer, keep .5 if float
        this.ui.scoreDisplay.textContent = Number.isInteger(this.score) ? this.score : this.score.toFixed(1);
    }

    endGame() {
        clearInterval(this.timerInterval);
        this.ui.endOverlay.classList.remove('hidden');
        this.ui.gameControls.classList.add('hidden');
        this.ui.topBar.classList.add('hidden'); // Optional, keeps it even cleaner

        this.ui.finalScoreVal.textContent = `${this.score} / ${this.totalCountries}`;
        this.ui.finalTimeText.textContent = `Time: ${this.ui.timerDisplay.textContent}`;

        // Celebration
        if (this.score / this.totalCountries > 0.8) {
            this.triggerConfetti();
            setTimeout(() => this.triggerConfetti(), 500);
        }
    }

    triggerConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}
