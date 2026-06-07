document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('playground-wordle-grid');
    const lettersContainer = document.getElementById('playground-wordle-floating-letters');
    if (!gridContainer || !lettersContainer) return;

    // 1. Initialise Floating Wordle Tile Background
    const lettersList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const colorClasses = ["green", "yellow", "gray"];
    const tileCount = 18;

    for (let i = 0; i < tileCount; i++) {
        const tile = document.createElement("div");
        tile.className = "floating-tile " + colorClasses[Math.floor(Math.random() * colorClasses.length)];
        tile.textContent = lettersList[Math.floor(Math.random() * lettersList.length)];

        // Random size for the tile square (40px - 90px)
        const size = Math.floor(40 + Math.random() * 50);
        tile.style.width = size + "px";
        tile.style.height = size + "px";
        tile.style.fontSize = Math.round(size * 0.52) + "px";
        tile.style.lineHeight = size + "px";
        tile.style.textAlign = "center";

        // Position within the container (keeping tiles inside, not in corners)
        // Use left/top as percentage-based center, with margins to keep inside bounds
        const marginPx = size + 20;
        const containerW = 100; // % based
        const containerH = 100;
        // Random position as percentage, but avoid placing near 0 or 100% edges tightly
        const leftPct = 5 + Math.random() * 88; // 5% to 93%
        const topPct  = 5 + Math.random() * 88;
        tile.style.left = leftPct.toFixed(1) + "%";
        tile.style.top  = topPct.toFixed(1) + "%";
        tile.style.transform = "translate(-50%, -50%)"; // center on position

        // Float animation: gentle translate + rotate using CSS vars
        const txStart = (Math.random() * 30 - 15).toFixed(1) + "px";
        const tyStart = (Math.random() * 30 - 15).toFixed(1) + "px";
        const txEnd   = (Math.random() * 40 - 20).toFixed(1) + "px";
        const tyEnd   = (Math.random() * 40 - 20).toFixed(1) + "px";
        const rotStart = (Math.random() * 30 - 15).toFixed(1) + "deg";
        const rotEnd   = (Math.random() * 30 - 15).toFixed(1) + "deg";
        const opStart  = (0.15 + Math.random() * 0.25).toFixed(2);
        const opEnd    = (0.3 + Math.random() * 0.35).toFixed(2);
        const duration = (8 + Math.random() * 14).toFixed(1) + "s";
        const delay    = (-Math.random() * 12).toFixed(1) + "s";
        const scale    = (0.85 + Math.random() * 0.3).toFixed(2);

        tile.style.setProperty("--tx-start", txStart);
        tile.style.setProperty("--ty-start", tyStart);
        tile.style.setProperty("--tx-end", txEnd);
        tile.style.setProperty("--ty-end", tyEnd);
        tile.style.setProperty("--rot-start", rotStart);
        tile.style.setProperty("--rot-end", rotEnd);
        tile.style.setProperty("--op-start", opStart);
        tile.style.setProperty("--op-end", opEnd);
        tile.style.setProperty("--duration", duration);
        tile.style.setProperty("--delay", delay);
        tile.style.setProperty("--scale", scale);

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

        // Type letters
        for (let c = 0; c < 5; c++) {
            const cell = document.getElementById(`mini-cell-${currentRow}-${c}`);
            if (cell) {
                cell.textContent = guess[c];
                cell.classList.add('typed');
            }
        }

        // Wait 600ms, then flip and color tiles
        solveTimeoutId = setTimeout(() => {
            for (let c = 0; c < 5; c++) {
                const cell = document.getElementById(`mini-cell-${currentRow}-${c}`);
                if (cell) {
                    cell.classList.remove('typed');
                    
                    const fb = feedback[c];
                    if (fb === "2") {
                        cell.classList.add("correct");
                    } else if (fb === "1") {
                        cell.classList.add("present");
                    } else {
                        cell.classList.add("absent");
                    }
                }
            }
            
            // Advance to next row after 2.0s
            currentRow++;
            solveTimeoutId = setTimeout(runStep, 2000);
        }, 600);
    }

    // Start simulation loop
    startSimulation();
});
