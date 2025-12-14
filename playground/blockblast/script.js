const boardElement = document.getElementById('board');
const scoreDisplay = document.getElementById('score-display');
const blockOptionsContainer = document.getElementById('block-options');
const comboDisplay = document.getElementById('combo-display');
const container = document.querySelector('.container');
const boardWidth = 8;
const boardHeight = 8;
let board = [];
let score = 0;
let availableBlocks = [];
let currentDraggingBlock = null;
let dragOverCells = [];
const lineClearAnimationDuration = 300;
let currentCombo = 0;
let linesClearedOnPreviousTurn = false;
let turnsWithoutClear = 0;
let draggablePreviewElement = null;

const blockShapes = [
    // xxxx
    [['x', 'x', 'x', 'x']],

    // x
    // x
    // x
    // x
    [['x'], ['x'], ['x'], ['x']],

    // xx
    // xx
    [['x', 'x'], ['x', 'x']],

    // xxx
    //  x
    [['x', 'x', 'x'], [null, 'x', null]],
    // x
    // xx
    // x
    [['x', null], ['x', 'x'], ['x', null]],
    //  x
    // xxx
    [[null, 'x', null], ['x', 'x', 'x']],
    //   x
    //  xx
    //   x
    [[null, 'x'], ['x', 'x'], [null, 'x']],

    // xx
    //  x
    //  x
    [['x', 'x'], [null, 'x'], [null, 'x']],
    //  x
    //  x
    // xx
    [[null, 'x'], [null, 'x'], ['x', 'x']],
    // xx
    // x
    // x
    [['x', 'x'], ['x', null], ['x', null]],
    // x
    // x
    // xx
    [['x', null], ['x', null], ['x', 'x']],

    // xxx
    //   x
    [['x', 'x', 'x'], [null, null, 'x']],
    // xxx
    // x  
    [['x', 'x', 'x'], ['x', null, null]],
    //   x
    // xxx
    [[null, null, 'x'], ['x', 'x', 'x']],
    // x
    // xxx
    [['x', null, null], ['x', 'x', 'x']],

    // x
    // xx
    //  x
    [['x', null], ['x', 'x'], [null, 'x']],
    //  x
    // xx
    // x
    [[null, 'x'], ['x', 'x'], ['x', null]],

    // xx
    //  xx
    [['x', 'x', null], [null, 'x', 'x']],
    //  xx
    // xx
    [[null, 'x', 'x'], ['x', 'x', null]],

    // xx
    //  x
    [['x', 'x'], [null, 'x']],
    // xx
    // x
    [['x', 'x'], ['x', null]],
    // x
    // xx
    [['x', null], ['x', 'x']],
    //  x
    // xx
    [[null, 'x'], ['x', 'x']],

    // x
    //  x
    [['x', null], [null, 'x']],
    //  x
    // x
    [[null, 'x'], ['x', null]],

    //   x
    //  x
    // x
    [[null, null, 'x'], [null, 'x', null], ['x', null, null]],
    // x
    //  x
    //   x
    [['x', null, null], [null, 'x', null], [null, null, 'x']],

    // x
    // x
    // x
    [['x'], ['x'], ['x']],
    // xxx
    [['x', 'x', 'x']],

    // xxx
    // xxx
    // xxx
    [['x', 'x', 'x'],['x', 'x', 'x'],['x', 'x', 'x']]
];

const blockColours = [
    'rgb(255, 0, 0)',
    'rgb(177, 0, 226)',
    'rgb(214, 210, 0)',
    'rgb(0, 0, 255)',
    'rgb(0, 142, 9)'
]

function applyScale() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const scaleX = windowWidth / containerWidth;
    const scaleY = windowHeight / containerHeight;
    let scale = Math.min(scaleX, scaleY);

    scale = Math.min(scale, 1.5);

    container.style.transform = `scale(${scale})`;
    container.style.transformOrigin = 'center center'; /* Centre the scaling origin */
}

function createBoard() {
    board = Array(boardHeight).fill(null).map(() => Array(boardWidth).fill(null));
    renderBoard();
}

function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            if (cell) {
                cellElement.style.backgroundColor = cell;
                cellElement.classList.add('filled');
                
                // Check adjacent cells for same colour to add connection classes
                const rightCell = colIndex < boardWidth - 1 ? board[rowIndex][colIndex + 1] : null;
                const leftCell = colIndex > 0 ? board[rowIndex][colIndex - 1] : null;
                const topCell = rowIndex > 0 ? board[rowIndex - 1][colIndex] : null;
                const bottomCell = rowIndex < boardHeight - 1 ? board[rowIndex + 1][colIndex] : null;
                
                if (rightCell === cell) {
                    cellElement.classList.add('connected-right');
                }
                if (leftCell === cell) {
                    cellElement.classList.add('connected-left');
                }
                if (topCell === cell) {
                    cellElement.classList.add('connected-top');
                }
                if (bottomCell === cell) {
                    cellElement.classList.add('connected-bottom');
                }
            }
            boardElement.appendChild(cellElement);
        });
    });
}

function generateAvailableBlocks() {
    updateComboDisplay();
    linesClearedOnPreviousTurn = false; // Reset for the new turn

    availableBlocks = [];
    for (let i = 0; i < 3; i++) {
        // Randomly select a shape
        const randomShapeIndex = Math.floor(Math.random() * blockShapes.length);
        const randomShape = blockShapes[randomShapeIndex];

        // Randomly select a colour
        const randomColourIndex = Math.floor(Math.random() * blockColours.length);
        const randomColour = blockColours[randomColourIndex];

        availableBlocks.push({
            shape: randomShape,
            colour: randomColour
        });
    }
    renderAvailableBlocks();
}

function renderAvailableBlocks() {
    blockOptionsContainer.innerHTML = '';
    availableBlocks.forEach((block, index) => {
        const blockOption = document.createElement('div');
        blockOption.classList.add('block-option');
        blockOption.dataset.blockIndex = index;
        blockOption.draggable = true;
        blockOption.addEventListener('dragstart', handleDragStart);

        const blockPreview = document.createElement('div');
        blockPreview.classList.add('block-preview');
        block.shape.forEach(row => {
            const previewRow = document.createElement('div');
            previewRow.style.display = 'flex';
            row.forEach(cell => {
                const previewCell = document.createElement('div');
                previewCell.classList.add('preview-cell');
                if (cell) {
                    previewCell.style.backgroundColor = block.colour;
                } else {
                    previewCell.style.backgroundColor = 'transparent';
                }
                previewRow.appendChild(previewCell);
            });
            blockPreview.appendChild(previewRow);
        });
        blockOption.appendChild(blockPreview);

        blockOptionsContainer.appendChild(blockOption);
    });
}

function handleDragStart(event) {
    const blockIndex = parseInt(event.currentTarget.dataset.blockIndex);
    currentDraggingBlock = availableBlocks[blockIndex];
    event.currentTarget.classList.add('dragging');

    // Create the draggable preview element
    draggablePreviewElement = document.createElement('div');
    draggablePreviewElement.classList.add('draggable-block-preview-container');
    draggablePreviewElement.style.position = 'absolute';
    draggablePreviewElement.style.pointerEvents = 'none'; // So it doesn't interfere with drop events
    draggablePreviewElement.style.opacity = 0.7;
    // Use CSS Grid for layout
    draggablePreviewElement.style.display = 'grid';
    draggablePreviewElement.style.gridTemplateColumns = `repeat(${currentDraggingBlock.shape[0].length}, ${getBoardCellWidth()}px)`;
    draggablePreviewElement.style.gridTemplateRows = `repeat(${currentDraggingBlock.shape.length}, ${getBoardCellWidth()}px)`;

    const cellWidth = getBoardCellWidth();
    const previewSquareSize = cellWidth + 1; // Add 1 pixel to the size (removes grid from highlight idk why???)

    currentDraggingBlock.shape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell) {
                const previewSquare = document.createElement('div');
                previewSquare.classList.add('draggable-block-preview-square', 'filled');
                previewSquare.style.backgroundColor = currentDraggingBlock.colour;
                previewSquare.style.width = previewSquareSize + 'px';
                previewSquare.style.height = previewSquareSize + 'px';
                previewSquare.style.gridColumnStart = colIndex + 1;
                previewSquare.style.gridRowStart = rowIndex + 1;
                draggablePreviewElement.appendChild(previewSquare);
            }
        });
    });

    document.body.appendChild(draggablePreviewElement);

    // Initial position - centre under mouse
    draggablePreviewElement.style.left = event.clientX - (draggablePreviewElement.offsetWidth / 2) + 'px';
    draggablePreviewElement.style.top = event.clientY - (draggablePreviewElement.offsetHeight / 2) + 'px';

    // Set a small, sized element as the drag image
    const dragImage = document.createElement('div');
    dragImage.style.width = cellWidth + 'px';
    dragImage.style.height = cellWidth + 'px';
    // Position the drag image so the mouse is roughly in the centre
    event.dataTransfer.setDragImage(dragImage, cellWidth / 2, cellWidth / 2);
}

boardElement.addEventListener('dragover', handleDragOver);
boardElement.addEventListener('dragleave', handleDragLeave);
boardElement.addEventListener('drop', handleDrop);
document.addEventListener('dragend', handleDragEnd); // Listen for drag end on the document

let potentialDropPosition = null;

function handleDragOver(event) {
    event.preventDefault();
    const cellElement = event.target.closest('.cell');
    if (cellElement && currentDraggingBlock !== null) {
        const cellIndex = Array.from(boardElement.children).indexOf(cellElement);
        const hoverRow = Math.floor(cellIndex / boardWidth);
        const hoverCol = cellIndex % boardWidth;

        clearDragOverHighlight();
        dragOverCells = [];
        potentialDropPosition = null;

        const blockHeight = currentDraggingBlock.shape.length;
        const blockWidth = currentDraggingBlock.shape[0].length;
        const searchRadius = 1; // Adjust this value to control the search radius for predicted placement

        // Try aligning with the centre of the block
        let startRow = hoverRow - Math.floor(blockHeight / 2);
        let startCol = hoverCol - Math.floor(blockWidth / 2);

        if (canPlaceBlock(currentDraggingBlock.shape, startRow, startCol)) {
            potentialDropPosition = { row: startRow, col: startCol };
        } else {
            // If centre is invalid, search within the radius
            let closestValidPosition = null;
            let minDistanceSquared = Infinity;

            for (let rOffset = -searchRadius; rOffset <= searchRadius; rOffset++) {
                for (let cOffset = -searchRadius; cOffset <= searchRadius; cOffset++) {
                    const testRow = hoverRow + rOffset;
                    const testCol = hoverCol + cOffset;

                    if (testRow >= 0 && testRow < boardHeight && testCol >= 0 && testCol < boardWidth) {
                        // Try placing the block with its top-left at this offset
                        const testStartRow = testRow;
                        const testStartCol = testCol;

                        if (canPlaceBlock(currentDraggingBlock.shape, testStartRow, testStartCol)) {
                            const distanceSquared = rOffset * rOffset + cOffset * cOffset;
                            if (distanceSquared < minDistanceSquared) {
                                minDistanceSquared = distanceSquared;
                                closestValidPosition = { row: testStartRow, col: testStartCol };
                            }
                        }
                    }
                }
            }
            potentialDropPosition = closestValidPosition;
        }

        if (potentialDropPosition) {
            highlightDropArea(currentDraggingBlock.shape, potentialDropPosition.row, potentialDropPosition.col, currentDraggingBlock.colour);
        }
    }

    // Update draggable preview position
    if (draggablePreviewElement) {
        draggablePreviewElement.style.left = event.clientX - (draggablePreviewElement.offsetWidth / 2) + 'px';
        draggablePreviewElement.style.top = event.clientY - (draggablePreviewElement.offsetHeight / 2) + 'px';
    }
}

function handleDragLeave(event) {
    clearDragOverHighlight();
    dragOverCells = [];
    potentialDropPosition = null;
}

function handleDragEnd(event) {
    // Clean up the draggable preview element
    if (draggablePreviewElement) {
        draggablePreviewElement.remove();
        draggablePreviewElement = null;
    }
    const draggedOption = document.querySelector('.block-option.dragging');
    if (draggedOption) {
        draggedOption.classList.remove('dragging');
    }
}

function highlightDropArea(shape, startRow, startCol, colour) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const boardRow = startRow + row;
                const boardCol = startCol + col;
                if (boardRow >= 0 && boardRow < boardHeight && boardCol >= 0 && boardCol < boardWidth) {
                    const cellElement = boardElement.children[boardRow * boardWidth + boardCol];
                    if (cellElement && boardElement.contains(cellElement)) {
                        cellElement.style.backgroundColor = colour;
                        cellElement.style.opacity = 0.7;
                        dragOverCells.push(cellElement);
                    }
                }
            }
        }
    }
}

function clearDragOverHighlight() {
    dragOverCells.forEach(cell => {
        cell.style.backgroundColor = '';
        cell.style.opacity = 1;
    });
}

function handleDrop(event) {
    event.preventDefault();
    clearDragOverHighlight();
    dragOverCells = [];

    // Clean up the draggable preview element
    if (draggablePreviewElement) {
        draggablePreviewElement.remove();
        draggablePreviewElement = null;
    }

    const draggedOption = document.querySelector('.block-option.dragging');
    if (draggedOption) {
        draggedOption.classList.remove('dragging');
    }

    if (potentialDropPosition === null || currentDraggingBlock === null) {
        return;
    }

    let linesClearedThisDrop = 0;

    if (canPlaceBlock(currentDraggingBlock.shape, potentialDropPosition.row, potentialDropPosition.col)) {
        placeBlockOnBoard(currentDraggingBlock.shape, potentialDropPosition.row, potentialDropPosition.col, currentDraggingBlock.colour);
        updatePlaceScore();

        const blockIndex = availableBlocks.indexOf(currentDraggingBlock);
        if (blockIndex > -1) {
            availableBlocks.splice(blockIndex, 1);
            renderAvailableBlocks();
        }

        linesClearedThisDrop = checkAndClearLines();
        if (linesClearedThisDrop > 0) {
            turnsWithoutClear = 0;
            currentCombo++;
            linesClearedOnPreviousTurn = true;
            updateScore(linesClearedThisDrop);
        } else {
            turnsWithoutClear++;
            linesClearedOnPreviousTurn = false;
            if (turnsWithoutClear >= 3) {
                currentCombo = 0;
            }
        }

        if (availableBlocks.length === 0) {
            generateAvailableBlocks();
        }

        updateComboDisplay();

        setTimeout(() => {
            if (isGameOver()) {
                showGameOverScreen();
            }
        }, lineClearAnimationDuration + 50);

    } else {
        console.log("Invalid placement (shouldn't happen if highlight works correctly)");
    }

    potentialDropPosition = null;
    currentDraggingBlock = null;
}


function canPlaceBlock(shape, startRow, startCol) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const boardRow = startRow + row;
                const boardCol = startCol + col;

                if (boardRow < 0 || boardRow >= boardHeight || boardCol < 0 || boardCol >= boardWidth || board[boardRow][boardCol]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placeBlockOnBoard(shape, startRow, startCol, colour) {
    shape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell) {
                board[startRow + rowIndex][startCol + colIndex] = colour;
            }
        });
    });
    renderBoard();
}

function checkAndClearLines() {
    let linesCleared = 0;
    let clearedRows = [];
    let clearedCols = [];
    let boardChanged = false;

    // Check for horizontal lines
    for (let row = board.length - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== null)) {
            linesCleared++;
            clearedRows.push(row);
            boardChanged = true;
            // Add 'clearing' class for animation
            board[row].forEach((_, index) => {
                const cellIndex = row * boardWidth + index;
                if (boardElement.children[cellIndex]) {
                    boardElement.children[cellIndex].classList.add('clearing');
                }
            });
            // Clear the row after animation delay
            setTimeout(() => {
                board[row] = Array(boardWidth).fill(null);
                renderBoard();
            }, lineClearAnimationDuration);
        }
    }

    // Check for vertical lines
    for (let col = 0; col < boardWidth; col++) {
        let columnFilled = true;
        for (let row = 0; row < boardHeight; row++) {
            if (board[row][col] === null) {
                columnFilled = false;
                break;
            }
        }
        if (columnFilled) {
            linesCleared++;
            clearedCols.push(col);
            boardChanged = true;
            // Add 'clearing' class for animation
            for (let row = 0; row < boardHeight; row++) {
                const cellIndex = row * boardWidth + col;
                if (boardElement.children[cellIndex]) {
                    boardElement.children[cellIndex].classList.add('clearing');
                }
            }
            // Clear the column after animation delay
            setTimeout(() => {
                for (let row = 0; row < boardHeight; row++) {
                    board[row][col] = null;
                }
                renderBoard();
            }, lineClearAnimationDuration);
        }
    }

    return linesCleared;
}

function updatePlaceScore() {
    score += 4;
    scoreDisplay.textContent = score;
}

function updateScore(totalLinesCleared) {
    let baseScore = 0;
    if (totalLinesCleared === 1) {
        baseScore = 10;
    } else if (totalLinesCleared === 2) {
        baseScore = 20;
    } else if (totalLinesCleared === 3) {
        baseScore = 60;
    } else if (totalLinesCleared === 4) {
        baseScore = 120;
    } else if (totalLinesCleared === 5) {
        baseScore = 200;
    } else if (totalLinesCleared === 6) {
        baseScore = 300;
    } else {
        baseScore = 0;
    }

    const scoreToAdd = Math.round(baseScore * currentCombo);
    score += scoreToAdd;
    scoreDisplay.textContent = score;
}

function updateComboDisplay() {
    if (currentCombo >= 2) {
        comboDisplay.textContent = `${currentCombo - 1}x Combo!`;
    } else {
        comboDisplay.textContent = '';
    }
}

function isGameOver() {
    for (const block of availableBlocks) {
        for (let row = 0; row < boardHeight; row++) {
            for (let col = 0; col < boardWidth; col++) {
                if (canPlaceBlock(block.shape, row, col)) {
                    return false;
                }
            }
        }
    }
    return true;
}

function showGameOverScreen() {
    const gameOverOverlay = document.createElement('div');
    gameOverOverlay.classList.add('game-over-overlay');

    const gameOverBox = document.createElement('div');
    gameOverBox.classList.add('game-over-box');

    const gameOverText = document.createElement('h2');
    gameOverText.textContent = 'Game Over!';

    const scoreText = document.createElement('p');
    scoreText.textContent = `Your Score: ${score}`;

    const resetButton = document.createElement('button');
    resetButton.textContent = 'Play Again';
    resetButton.addEventListener('click', resetGame);

    gameOverBox.appendChild(gameOverText);
    gameOverBox.appendChild(scoreText);
    gameOverBox.appendChild(resetButton);
    gameOverOverlay.appendChild(gameOverBox);
    document.body.appendChild(gameOverOverlay);
}

function resetGame() {
    const gameOverOverlay = document.querySelector('.game-over-overlay');
    if (gameOverOverlay) {
        gameOverOverlay.remove();
    }
    createBoard();
    score = 0;
    scoreDisplay.textContent = score;
    currentCombo = 0;
    turnsWithoutClear = 0;
    updateComboDisplay();
    generateAvailableBlocks();
}

function getBoardCellWidth() {
    // Get the first cell to inspect its computed style
    const firstCell = boardElement.querySelector('.cell');
    if (!firstCell) {
        return 0; // If the board isn't rendered yet
    }

    const computedStyle = window.getComputedStyle(firstCell);
    const cellWidthIncludingBorder = parseFloat(computedStyle.width);
    const borderLeftWidth = parseFloat(computedStyle.borderLeftWidth);
    const borderRightWidth = parseFloat(computedStyle.borderRightWidth);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingRight = parseFloat(computedStyle.paddingRight);

    // Subtract the borders and padding to get the content width
    const contentWidth = cellWidthIncludingBorder - borderLeftWidth - borderRightWidth - paddingLeft - paddingRight;

    return contentWidth;
}

// Initial setup
createBoard();
generateAvailableBlocks();
updateComboDisplay();
// applyScale();
// window.addEventListener('resize', applyScale);