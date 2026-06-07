document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('playground-wordle-grid');
    const lettersContainer = document.getElementById('playground-wordle-floating-letters');
    if (!gridContainer || !lettersContainer) return;

    // 1. Initialise Floating 3D Background Letters
    const lettersList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const colorClasses = ["green", "yellow", "gray"];
    const letterCount = 15;

    for (let i = 0; i < letterCount; i++) {
        const span = document.createElement("span");
        span.className = "floating-letter " + colorClasses[Math.floor(Math.random() * colorClasses.length)];
        span.textContent = lettersList[Math.floor(Math.random() * lettersList.length)];
        
        // Random sizes
        const size = (1.2 + Math.random() * 4.5).toFixed(1) + "rem";
        span.style.fontSize = size;
        
        // Random positions and rotations for 3D translation
        const startX = (Math.random() * 100).toFixed(0) + "%";
        const startY = (Math.random() * 100).toFixed(0) + "%";
        const startZ = (-150 - Math.random() * 200).toFixed(0) + "px";
        
        const endX = (Math.random() * 100).toFixed(0) + "%";
        const endY = (Math.random() * 100).toFixed(0) + "%";
        const endZ = (50 + Math.random() * 150).toFixed(0) + "px";
        
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
        
        // Durations & negative delays so they are already moving on page load
        const duration = (15 + Math.random() * 20).toFixed(1) + "s";
        const delay = (-Math.random() * 15).toFixed(1) + "s";
        span.style.animationDuration = duration;
        span.style.animationDelay = delay;
        
        lettersContainer.appendChild(span);
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
