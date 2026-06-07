// Wordle Premium Engine & Autonomous Solver

// Game Constants
const ROWS = 6;
const COLS = 5;

// Keyboard Layout
const KEYBOARD_ROWS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
];

// Game State
let secretWord = "";
let currentRow = 0;
let currentCol = 0;
let boardState = Array(ROWS).fill().map(() => Array(COLS).fill(""));
let boardFeedback = Array(ROWS).fill().map(() => Array(COLS).fill("")); // '0', '1', '2'
let guesses = [];
let isGameOver = false;

// Tab switcher state
let activeTab = ""; // "play" or "sandbox" (initialized to empty for tab switcher sync)

// Sandbox Game State
let sandboxRow = 0;
let sandboxCol = 0;
let sandboxBoardState = Array(ROWS).fill().map(() => Array(COLS).fill(""));
let sandboxBoardFeedback = Array(ROWS).fill().map(() => Array(COLS).fill("0")); // '0', '1', '2'
let sandboxRemainingWords = [];
let sandboxPath = [];
let isSandboxOver = false;

// Keyboard State Cache per tab to restore key colors on tab switch
let playKeyboardState = {};
let sandboxKeyboardState = {};

// Solver State
let remainingWords = [];
let solverNode = null;
let isSolverEnabled = true;
let deviated = false;
let solverPath = []; // Array of { guess, feedback }

// // Autonomous Solve State
let isAutoPlaying = false;
let autoSolveTimeoutId = null;
let isAutoContinueEnabled = false;
let isAnimationDisabled = false;
let isAutoContinuing = false;
let isTreeVisible = false;
let postGameTimeoutId = null;

// DOM Elements
let gridDom = null;
let keyboardDom = null;
let btnHelp = null;
let btnStats = null;
let btnReset = null;
let modalHelp = null;
let modalStats = null;
let closeHelp = null;
let closeStats = null;
let toggleHelper = null;
let toggleContinue = null;
let toggleAnimations = null;
let toggleTreePlay = null;
let toggleTreeSandbox = null;

// Tab Elements
let tabPlay = null;
let tabSandbox = null;
let sandboxGridDom = null;
let playSolverCard = null;
let sandboxSolverCard = null;

// Sandbox DOM Elements
let sandboxPossibleCount = null;
let sandboxRecommendedGuess = null;
let btnSubmitSandboxStep = null;
let btnResetSandbox = null;
let btnSandboxAutofill = null;
let sandboxPathDom = null;
let btnToggleSandboxWords = null;
let sandboxRemainingWordsListDom = null;
let sandboxPossibleListCount = null;
let possibleCount = null;
let recommendedGuess = null;
let progressBarFill = null;
let eliminationPercentage = null;
let btnAutoPlay = null;
let btnAutoStep = null;
let btnAutofill = null;
let solveSpeedSlider = null;
let solveSpeedVal = null;
let solverPathDom = null;
let btnToggleWords = null;
let remainingWordsListDom = null;
let possibleListCount = null;
let gameOverSummary = null;
let gameResultTitle = null;
let gameSecretWord = null;
let solverMatchInfo = null;
let btnPlayAgain = null;
