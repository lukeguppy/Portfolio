function getFeedback(guess, secret) {
    const feedback = new Array(5).fill('0');
    const secretUsed = new Array(5).fill(false);
    const guessUsed = new Array(5).fill(false);

    // 1. Green matches
    for (let i = 0; i < 5; i++) {
        if (guess[i] === secret[i]) {
            feedback[i] = '2';
            secretUsed[i] = true;
            guessUsed[i] = true;
        }
    }

    // 2. Yellow matches
    for (let i = 0; i < 5; i++) {
        if (!guessUsed[i]) {
            for (let j = 0; j < 5; j++) {
                if (!secretUsed[j] && guess[i] === secret[j]) {
                    feedback[i] = '1';
                    secretUsed[j] = true;
                    break;
                }
            }
        }
    }

    return feedback.join('');
}

function triggerWinAnimation(rowNum) {
    if (isAnimationDisabled) return;
    for (let c = 0; c < COLS; c++) {
        const container = document.getElementById(`tile-container-${rowNum}-${c}`);
        setTimeout(() => {
            container.classList.add("bounce");
        }, c * 100);
    }
}

// Toast system
function showToast(message) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Automatically remove toast from DOM after animation completes (2.0s)
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
