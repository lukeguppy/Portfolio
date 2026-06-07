document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('playground-wordle-grid');
    const lettersContainer = document.getElementById('playground-wordle-floating-letters');
    if (!gridContainer || !lettersContainer) return;

    // 1. Initialise Floating Wordle Tile Background
    const lettersList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const colorClasses = ["green", "yellow", "gray"];
    const tileCount = 20;

    for (let i = 0; i < tileCount; i++) {
        const tile = document.createElement("div");
        tile.className = "floating-tile " + colorClasses[Math.floor(Math.random() * colorClasses.length)];
        tile.textContent = lettersList[Math.floor(Math.random() * lettersList.length)];

        // Random tile size: 45px - 95px
        const size = Math.floor(45 + Math.random() * 50);
        tile.style.width  = size + "px";
        tile.style.height = size + "px";
        tile.style.fontSize = Math.round(size * 0.55) + "px";
        tile.style.lineHeight = size + "px";
        tile.style.textAlign = "center";

        // Center tile on a random position using negative margins (so animation transform doesn't interfere)
        const leftPct = 6 + Math.random() * 86;
        const topPct  = 6 + Math.random() * 86;
        tile.style.left       = leftPct.toFixed(1) + "%";
        tile.style.top        = topPct.toFixed(1) + "%";
        tile.style.marginLeft = -(size / 2) + "px";
        tile.style.marginTop  = -(size / 2) + "px";

        // Three-waypoint float animation via CSS custom properties
        const rnd = (min, max) => (Math.random() * (max - min) + min).toFixed(1);
        tile.style.setProperty("--tx-a", rnd(-20, 20) + "px");
        tile.style.setProperty("--ty-a", rnd(-25, 5) + "px");
        tile.style.setProperty("--rot-a", rnd(-18, 18) + "deg");
        tile.style.setProperty("--op-a",  (0.15 + Math.random() * 0.18).toFixed(2));

        tile.style.setProperty("--tx-b", rnd(-20, 20) + "px");
        tile.style.setProperty("--ty-b", rnd(-30, 0) + "px");
        tile.style.setProperty("--rot-b", rnd(-18, 18) + "deg");
        tile.style.setProperty("--op-b",  (0.28 + Math.random() * 0.2).toFixed(2));

        tile.style.setProperty("--tx-c", rnd(-20, 20) + "px");
        tile.style.setProperty("--ty-c", rnd(-15, 10) + "px");
        tile.style.setProperty("--rot-c", rnd(-18, 18) + "deg");
        tile.style.setProperty("--op-c",  (0.2 + Math.random() * 0.15).toFixed(2));

        const duration = (10 + Math.random() * 12).toFixed(1) + "s";
        const delay    = (-Math.random() * 10).toFixed(1) + "s";
        tile.style.setProperty("--duration", duration);
        tile.style.setProperty("--delay", delay);

        lettersContainer.appendChild(tile);
    }

    // 2. Wordle Auto-Solve Simulation
    // Simulated solver paths: [Target, [Guesses, Feedbacks]]
    // Feedbacks: 2 = correct (green), 1 = present (yellow), 0 = absent (gray)
    const solvePaths = [
        {
            word: "SOLVE",
            guesses: ["RAISE", "CLOVE", "SOLVE"],
            feedbacks: [
                ["0", "0", "0", "1", "2"], // R A I S(y) E(g)
                ["0", "2", "2", "2", "2"], // C L(g) O(g) V(g) E(g)
                ["2", "2", "2", "2", "2"]  // S(g) O(g) L(g) V(g) E(g)
            ]
        },
        {
            word: "CHESS",
            guesses: ["RAISE", "SHEDS", "CHESS"],
            feedbacks: [
                ["0", "0", "0", "1", "1"], // R A I S(y) E(y)
                ["1", "1", "2", "0", "2"], // S(y) H(y) E(g) D A S(g) -> S H E D S
                ["2", "2", "2", "2", "2"]  // C(g) H(g) E(g) S(g) S(g)
            ]
        },
        {
            word: "TEAL",
            guesses: ["RAISE", "CLEAT", "TEAL"],
            feedbacks: [
                ["0", "1", "0", "0", "1"], // R A(y) I S E(y) -- target has E, A.
                ["0", "1", "2", "2", "1"], // C L(y) E(g) A(g) T(y)
                ["2", "2", "2", "2", ""]   // T(g) E(g) A(g) L(g)
            ]
        },
        {
            word: "WORDS",
            guesses: ["RAISE", "SNOUT", "WORDS"],
            feedbacks: [
                ["1", "0", "0", "1", "0"], // R(y) A I S(y) E
                ["1", "0", "2", "0", "0"], // S(y) N O(g) U T
                ["2", "2", "2", "2", "2"]  // W(g) O(g) R(g) D(g) S(g)
            ]
        }
    ];

    // Build the grid UI
    function buildGrid() {
        gridContainer.innerHTML = "";
        for (let r = 0; r < 6; r++) {
            const rowDiv = document.createElement("div");
            rowDiv.className = "wordle-row-mini";
            for (let c = 0; c < 5; c++) {
                const cell = document.createElement("div");
                cell.className = "wordle-cell-mini";
                cell.id = `mini-cell-${r}-${c}`;
                rowDiv.appendChild(cell);
            }
            gridContainer.appendChild(rowDiv);
        }
    }

    let currentPathIndex = 0;
    let currentRow = 0;
    let solveTimeoutId = null;

    function startSimulation() {
        buildGrid();
        currentRow = 0;
        runStep();
    }

    function runStep() {
        const path = solvePaths[currentPathIndex];
        if (currentRow >= path.guesses.length) {
            // Solved! Wait 4 seconds, then start next word
            currentPathIndex = (currentPathIndex + 1) % solvePaths.length;
            solveTimeoutId = setTimeout(startSimulation, 4000);
            return;
        }

        const guess = path.guesses[currentRow];
        const feedback = path.feedbacks[currentRow];
        const LETTER_DELAY = 130; // ms between each typed letter
        const FLIP_DELAY   = 120; // ms between each colour flip
        const PAUSE_BEFORE_FLIP = 300; // pause after last letter before flipping

        // Type letters one-by-one
        for (let c = 0; c < 5; c++) {
            ((col) => {
                solveTimeoutId = setTimeout(() => {
                    const cell = document.getElementById(`mini-cell-${currentRow}-${col}`);
                    if (cell) {
                        cell.textContent = guess[col];
                        cell.classList.add('typed');
                    }
                }, col * LETTER_DELAY);
            })(c);
        }

        // After all letters typed + short pause, flip tiles one-by-one
        const flipStart = 5 * LETTER_DELAY + PAUSE_BEFORE_FLIP;
        for (let c = 0; c < 5; c++) {
            ((col) => {
                setTimeout(() => {
                    const cell = document.getElementById(`mini-cell-${currentRow}-${col}`);
                    if (cell) {
                        cell.classList.remove('typed');
                        const fb = feedback[col];
                        if (fb === "2") {
                            cell.classList.add("correct");
                        } else if (fb === "1") {
                            cell.classList.add("present");
                        } else {
                            cell.classList.add("absent");
                        }
                    }
                }, flipStart + col * FLIP_DELAY);
            })(c);
        }

        // Advance to next row after all flips done + rest pause
        const totalRowTime = flipStart + 5 * FLIP_DELAY + 1800;
        solveTimeoutId = setTimeout(() => {
            currentRow++;
            runStep();
        }, totalRowTime);
    }


    // Start simulation loop
    startSimulation();
});
