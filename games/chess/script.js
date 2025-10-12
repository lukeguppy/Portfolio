// Chess Game Logic

const boardElement = document.getElementById('board');
const turnIndicator = document.getElementById('turn-indicator');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');

let board = [];
let currentTurn = 'w'; // 'w' for white, 'b' for black
let selectedSquare = null;
let validMoves = [];

// Piece unicode
const pieces = {
    'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
    'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟'
};

// Initialize board
function initBoard() {
    board = [
        ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
        ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
        ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
    ];
    currentTurn = 'w';
    selectedSquare = null;
    validMoves = [];
    updateUI();
}

// Render board
function renderBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;

            if (board[row][col]) {
                const piece = document.createElement('div');
                piece.className = 'piece';
                piece.textContent = pieces[board[row][col]];
                square.appendChild(piece);
            }

            // Add coordinates
            if (col === 0) {
                const rankLabel = document.createElement('div');
                rankLabel.className = 'rank-label';
                rankLabel.textContent = 8 - row;
                square.appendChild(rankLabel);
            }
            if (row === 7) {
                const fileLabel = document.createElement('div');
                fileLabel.className = 'file-label';
                fileLabel.textContent = String.fromCharCode(97 + col);
                square.appendChild(fileLabel);
            }

            square.addEventListener('click', () => handleSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }
    highlightMoves();
}

// Handle square click
function handleSquareClick(row, col) {
    if (selectedSquare) {
        if (selectedSquare.row === row && selectedSquare.col === col) {
            // Deselect
            selectedSquare = null;
            validMoves = [];
        } else if (validMoves.some(move => move.row === row && move.col === col)) {
            // Move piece
            movePiece(selectedSquare, {row, col});
        } else {
            // Select new piece
            selectPiece(row, col);
        }
    } else {
        selectPiece(row, col);
    }
    updateUI();
}

// Select piece
function selectPiece(row, col) {
    const piece = board[row][col];
    if (piece && piece[0] === currentTurn) {
        selectedSquare = {row, col};
        validMoves = getValidMoves(row, col);
    } else {
        selectedSquare = null;
        validMoves = [];
    }
}

// Get valid moves for a piece
function getValidMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];

    const colour = piece[0];
    const type = piece[1];
    let moves = [];

    switch (type) {
        case 'P':
            moves = getPawnMoves(row, col, colour);
            break;
        case 'R':
            moves = getRookMoves(row, col, colour);
            break;
        case 'N':
            moves = getKnightMoves(row, col, colour);
            break;
        case 'B':
            moves = getBishopMoves(row, col, colour);
            break;
        case 'Q':
            moves = getQueenMoves(row, col, colour);
            break;
        case 'K':
            moves = getKingMoves(row, col, colour);
            break;
    }

    // Filter moves that don't put own king in check
    return moves.filter(move => {
        const newBoard = simulateMove({row, col}, move);
        return !isInCheck(colour, newBoard);
    });
}

// Simulate move
function simulateMove(from, to) {
    const newBoard = board.map(row => [...row]);
    newBoard[to.row][to.col] = newBoard[from.row][from.col];
    newBoard[from.row][from.col] = null;
    return newBoard;
}

// Pawn moves
function getPawnMoves(row, col, colour) {
    const moves = [];
    const direction = colour === 'w' ? -1 : 1;
    const startRow = colour === 'w' ? 6 : 1;

    // Forward
    if (!board[row + direction][col]) {
        moves.push({row: row + direction, col});
        if (row === startRow && !board[row + 2 * direction][col]) {
            moves.push({row: row + 2 * direction, col});
        }
    }

    // Captures
    for (let dc = -1; dc <= 1; dc += 2) {
        const newCol = col + dc;
        if (newCol >= 0 && newCol < 8) {
            const target = board[row + direction][newCol];
            if (target && target[0] !== colour) {
                moves.push({row: row + direction, col: newCol});
            }
        }
    }

    return moves;
}

// Rook moves
function getRookMoves(row, col, colour) {
    return getSlidingMoves(row, col, colour, [[0,1], [0,-1], [1,0], [-1,0]]);
}

// Bishop moves
function getBishopMoves(row, col, colour) {
    return getSlidingMoves(row, col, colour, [[1,1], [1,-1], [-1,1], [-1,-1]]);
}

// Queen moves
function getQueenMoves(row, col, colour) {
    return getSlidingMoves(row, col, colour, [[0,1], [0,-1], [1,0], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]]);
}

// Sliding moves
function getSlidingMoves(row, col, colour, directions) {
    const moves = [];
    for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
            const target = board[newRow][newCol];
            if (!target) {
                moves.push({row: newRow, col: newCol});
            } else {
                if (target[0] !== colour) {
                    moves.push({row: newRow, col: newCol});
                }
                break;
            }
        }
    }
    return moves;
}

// Knight moves
function getKnightMoves(row, col, colour) {
    const moves = [];
    const deltas = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
    for (const [dr, dc] of deltas) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = board[newRow][newCol];
            if (!target || target[0] !== colour) {
                moves.push({row: newRow, col: newCol});
            }
        }
    }
    return moves;
}

// King moves
function getKingMoves(row, col, colour) {
    const moves = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = board[newRow][newCol];
                if (!target || target[0] !== colour) {
                    moves.push({row: newRow, col: newCol});
                }
            }
        }
    }
    return moves;
}

// Move piece
function movePiece(from, to) {
    board[to.row][to.col] = board[from.row][from.col];
    board[from.row][from.col] = null;
    selectedSquare = null;
    validMoves = [];

    // Switch turn
    currentTurn = currentTurn === 'w' ? 'b' : 'w';

    // Check for checkmate, etc.
    if (isInCheck(currentTurn)) {
        if (isCheckmate(currentTurn)) {
            statusElement.textContent = `${currentTurn === 'w' ? 'Black' : 'White'} wins by checkmate!`;
        } else {
            statusElement.textContent = `${currentTurn === 'w' ? 'White' : 'Black'} is in check!`;
        }
    } else {
        statusElement.textContent = '';
    }
}

// Is in check
function isInCheck(colour, testBoard = board) {
    // Find king
    let kingPos = null;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (testBoard[r][c] === colour + 'K') {
                kingPos = {row: r, col: c};
                break;
            }
        }
        if (kingPos) break;
    }

    // Check if any enemy piece can attack king
    const enemyColor = colour === 'w' ? 'b' : 'w';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (testBoard[r][c] && testBoard[r][c][0] === enemyColor) {
                const moves = getValidMovesForPiece(r, c, testBoard);
                if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Get valid moves for piece (similar but for test board)
function getValidMovesForPiece(row, col, testBoard) {
    const piece = testBoard[row][col];
    if (!piece) return [];
    const colour = piece[0];
    const type = piece[1];
    // Simplified, assume same as getValidMoves but without check filter
    // For simplicity, reuse but it's recursive, so implement separately
    // For now, return basic moves without check
    let moves = [];
    switch (type) {
        case 'P':
            const direction = colour === 'w' ? -1 : 1;
            if (row + direction >= 0 && row + direction < 8 && !testBoard[row + direction][col]) {
                moves.push({row: row + direction, col});
            }
            for (let dc = -1; dc <= 1; dc += 2) {
                const nc = col + dc;
                if (nc >= 0 && nc < 8 && testBoard[row + direction][nc] && testBoard[row + direction][nc][0] !== colour) {
                    moves.push({row: row + direction, col: nc});
                }
            }
            break;
        case 'R':
            moves = getSlidingMovesTest(row, col, colour, testBoard, [[0,1], [0,-1], [1,0], [-1,0]]);
            break;
        case 'N':
            const deltas = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
            for (const [dr, dc] of deltas) {
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                    const target = testBoard[nr][nc];
                    if (!target || target[0] !== colour) {
                        moves.push({row: nr, col: nc});
                    }
                }
            }
            break;
        case 'B':
            moves = getSlidingMovesTest(row, col, colour, testBoard, [[1,1], [1,-1], [-1,1], [-1,-1]]);
            break;
        case 'Q':
            moves = getSlidingMovesTest(row, col, colour, testBoard, [[0,1], [0,-1], [1,0], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]]);
            break;
        case 'K':
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = row + dr;
                    const nc = col + dc;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                        const target = testBoard[nr][nc];
                        if (!target || target[0] !== colour) {
                            moves.push({row: nr, col: nc});
                        }
                    }
                }
            }
            break;
    }
    return moves;
}

function getSlidingMovesTest(row, col, colour, testBoard, directions) {
    const moves = [];
    for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
            const nr = row + dr * i;
            const nc = col + dc * i;
            if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
            const target = testBoard[nr][nc];
            if (!target) {
                moves.push({row: nr, col: nc});
            } else {
                if (target[0] !== colour) {
                    moves.push({row: nr, col: nc});
                }
                break;
            }
        }
    }
    return moves;
}

// Is checkmate
function isCheckmate(colour) {
    // If in check and no valid moves
    if (!isInCheck(colour)) return false;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] && board[r][c][0] === colour) {
                if (getValidMoves(r, c).length > 0) return false;
            }
        }
    }
    return true;
}

// Highlight moves
function highlightMoves() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('highlight', 'selected');
    });
    if (selectedSquare) {
        const square = document.querySelector(`[data-row="${selectedSquare.row}"][data-col="${selectedSquare.col}"]`);
        square.classList.add('selected');
    }
    validMoves.forEach(move => {
        const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
        square.classList.add('highlight');
    });
}

// Update UI
function updateUI() {
    renderBoard();
    turnIndicator.textContent = `${currentTurn === 'w' ? 'White' : 'Black'}'s turn`;
}

// Reset game
resetBtn.addEventListener('click', initBoard);

// Initialize
initBoard();