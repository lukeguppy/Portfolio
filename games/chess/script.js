const boardElement = document.getElementById('chess-board');
const turnIndicator = document.getElementById('turn-indicator');
const resetBtn = document.getElementById('reset-btn');

let board = [];
let currentTurn = 'white';
let selectedSquare = null;
let possibleMoves = [];
let moveHistory = [];
let enPassantTarget = null;
let castlingRights = { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } };
let gameOver = false;

// Piece filenames matching lichess cburnett set
const pieceFiles = {
    'white': { 'k': 'wK', 'q': 'wQ', 'r': 'wR', 'b': 'wB', 'n': 'wN', 'p': 'wP' },
    'black': { 'k': 'bK', 'q': 'bQ', 'r': 'bR', 'b': 'bB', 'n': 'bN', 'p': 'bP' }
};

function getPieceSVG(piece) {
    if (!piece) return '';
    const colour = piece === piece.toUpperCase() ? 'white' : 'black';
    const type = piece.toLowerCase();
    const filename = pieceFiles[colour][type];
    return `pieces/${filename}.svg`;
}

function initialiseBoard() {
    board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    currentTurn = 'white';
    selectedSquare = null;
    possibleMoves = [];
    moveHistory = [];
    enPassantTarget = null;
    castlingRights = { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } };
    gameOver = false;
    renderBoard();
    updateTurnIndicator();
}

function renderBoard() {
    boardElement.innerHTML = '';
    
    // Find king positions to highlight if in check
    const whiteKingPos = findKing('white');
    const blackKingPos = findKing('black');
    const whiteInCheck = isKingInCheck('white');
    const blackInCheck = isKingInCheck('black');
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;

            // Highlight king in check
            if (whiteInCheck && whiteKingPos && whiteKingPos.row === row && whiteKingPos.col === col) {
                square.classList.add('check');
            }
            if (blackInCheck && blackKingPos && blackKingPos.row === row && blackKingPos.col === col) {
                square.classList.add('check');
            }

            if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
                square.classList.add('selected');
            }

            const isValidMove = possibleMoves.some(move => move.row === row && move.col === col);
            if (isValidMove) {
                const moveIndicator = document.createElement('div');
                moveIndicator.className = board[row][col] ? 'capture-indicator' : 'move-indicator';
                square.appendChild(moveIndicator);
            }

            const piece = board[row][col];
            if (piece) {
                const pieceImg = document.createElement('img');
                pieceImg.src = getPieceSVG(piece);
                pieceImg.className = 'piece';
                pieceImg.draggable = false;
                square.appendChild(pieceImg);
            }

            square.addEventListener('click', () => handleSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }
}

function handleSquareClick(row, col) {
    if (gameOver) return;
    
    if (selectedSquare) {
        if (selectedSquare.row === row && selectedSquare.col === col) {
            // Deselect
            selectedSquare = null;
            possibleMoves = [];
        } else if (possibleMoves.some(move => move.row === row && move.col === col)) {
            // Make the move
            const moveData = possibleMoves.find(move => move.row === row && move.col === col);
            makeMove(selectedSquare, moveData);
        } else {
            // Select different piece
            selectPiece(row, col);
        }
    } else {
        selectPiece(row, col);
    }
    renderBoard();
}

function selectPiece(row, col) {
    const piece = board[row][col];
    if (piece && isPieceColour(piece, currentTurn)) {
        selectedSquare = { row, col };
        possibleMoves = getLegalMoves(row, col);
    } else {
        selectedSquare = null;
        possibleMoves = [];
    }
}

function isPieceColour(piece, colour) {
    return (colour === 'white' && piece === piece.toUpperCase()) ||
           (colour === 'black' && piece === piece.toLowerCase());
}

function findKing(colour) {
    const kingPiece = colour === 'white' ? 'K' : 'k';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === kingPiece) {
                return { row, col };
            }
        }
    }
    return null;
}

// Generate all pseudo-legal moves (doesn't check for check)
function getPseudoLegalMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    
    const moves = [];
    const isWhite = piece === piece.toUpperCase();
    const pieceColour = isWhite ? 'white' : 'black';

    if (piece.toLowerCase() === 'p') {
        // Pawn moves
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        
        // Move forward one square
        if (row + direction >= 0 && row + direction < 8 && board[row + direction][col] === '') {
            moves.push({ row: row + direction, col });
            
            // Move forward two squares from starting position
            if (row === startRow && board[row + 2 * direction][col] === '') {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        
        // Capture diagonally
        for (let dc of [-1, 1]) {
            const newRow = row + direction;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = board[newRow][newCol];
                if (target && !isPieceColour(target, pieceColour)) {
                    moves.push({ row: newRow, col: newCol });
                }
                // En passant
                if (enPassantTarget && enPassantTarget.row === newRow && enPassantTarget.col === newCol) {
                    moves.push({ row: newRow, col: newCol, isEnPassant: true });
                }
            }
        }
    } else if (piece.toLowerCase() === 'n') {
        // Knight moves
        const knightOffsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        for (const [dr, dc] of knightOffsets) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = board[newRow][newCol];
                if (!target || !isPieceColour(target, pieceColour)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    } else if (piece.toLowerCase() === 'b') {
        // Bishop moves
        moves.push(...getSlidingMoves(row, col, [[1, 1], [1, -1], [-1, 1], [-1, -1]], pieceColour));
    } else if (piece.toLowerCase() === 'r') {
        // Rook moves
        moves.push(...getSlidingMoves(row, col, [[0, 1], [0, -1], [1, 0], [-1, 0]], pieceColour));
    } else if (piece.toLowerCase() === 'q') {
        // Queen moves
        moves.push(...getSlidingMoves(row, col, [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]], pieceColour));
    } else if (piece.toLowerCase() === 'k') {
        // King moves
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = board[newRow][newCol];
                if (!target || !isPieceColour(target, pieceColour)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        // Castling
        const rights = castlingRights[pieceColour];
        const baseRow = isWhite ? 7 : 0;
        const rookPiece = isWhite ? 'R' : 'r';
        
        if (row === baseRow && col === 4) {
            // Kingside castling
            if (rights.kingSide && 
                board[baseRow][5] === '' && 
                board[baseRow][6] === '' && 
                board[baseRow][7] === rookPiece) {
                moves.push({ row: baseRow, col: 6, isCastling: true, rookFrom: 7, rookTo: 5 });
            }
            
            // Queenside castling
            if (rights.queenSide && 
                board[baseRow][3] === '' && 
                board[baseRow][2] === '' && 
                board[baseRow][1] === '' && 
                board[baseRow][0] === rookPiece) {
                moves.push({ row: baseRow, col: 2, isCastling: true, rookFrom: 0, rookTo: 3 });
            }
        }
    }

    return moves;
}

function getSlidingMoves(row, col, directions, pieceColour) {
    const moves = [];
    for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
            
            const target = board[newRow][newCol];
            if (target === '') {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (!isPieceColour(target, pieceColour)) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
        }
    }
    return moves;
}

// Check if a square is under attack by the opponent
function isSquareUnderAttack(row, col, byColour) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && isPieceColour(piece, byColour)) {
                const moves = getPseudoLegalMoves(r, c);
                // For castling checks, we don't want to consider enemy castling moves
                for (const move of moves) {
                    if (!move.isCastling && move.row === row && move.col === col) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function isKingInCheck(colour) {
    const kingPos = findKing(colour);
    if (!kingPos) return false;
    
    const enemyColour = colour === 'white' ? 'black' : 'white';
    return isSquareUnderAttack(kingPos.row, kingPos.col, enemyColour);
}

// Get all legal moves (filters out moves that leave king in check)
function getLegalMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    
    const pieceColour = isPieceColour(piece, 'white') ? 'white' : 'black';
    const pseudoLegalMoves = getPseudoLegalMoves(row, col);
    const legalMoves = [];
    
    for (const move of pseudoLegalMoves) {
        // Special handling for castling
        if (move.isCastling) {
            // Can't castle out of check
            if (isKingInCheck(pieceColour)) {
                continue;
            }
            
            // Check all squares the king moves through
            const kingCol = col;
            const targetCol = move.col;
            const direction = targetCol > kingCol ? 1 : -1;
            let canCastle = true;
            
            // Check each square from king's position to target (inclusive)
            for (let c = kingCol; c !== targetCol + direction; c += direction) {
                if (isSquareUnderAttack(row, c, pieceColour === 'white' ? 'black' : 'white')) {
                    canCastle = false;
                    break;
                }
            }
            
            if (canCastle) {
                legalMoves.push(move);
            }
        } else {
            // Regular move - check if it leaves king in check
            if (!doesMoveLeaveSelfInCheck(row, col, move)) {
                legalMoves.push(move);
            }
        }
    }
    
    return legalMoves;
}

function doesMoveLeaveSelfInCheck(fromRow, fromCol, move) {
    const piece = board[fromRow][fromCol];
    const pieceColour = isPieceColour(piece, 'white') ? 'white' : 'black';
    
    // Make the move temporarily
    const capturedPiece = board[move.row][move.col];
    const enPassantCaptured = move.isEnPassant ? board[fromRow][move.col] : null;
    
    board[move.row][move.col] = piece;
    board[fromRow][fromCol] = '';
    
    if (move.isEnPassant) {
        board[fromRow][move.col] = '';
    }
    
    // Check if king is in check after the move
    const inCheck = isKingInCheck(pieceColour);
    
    // Undo the move
    board[fromRow][fromCol] = piece;
    board[move.row][move.col] = capturedPiece;
    
    if (move.isEnPassant) {
        board[fromRow][move.col] = enPassantCaptured;
    }
    
    return inCheck;
}

function makeMove(from, moveData) {
    const piece = board[from.row][from.col];
    const to = { row: moveData.row, col: moveData.col };
    
    // Reset en passant target
    enPassantTarget = null;
    
    // Set en passant target if pawn moves two squares
    if (piece.toLowerCase() === 'p' && Math.abs(to.row - from.row) === 2) {
        enPassantTarget = { row: (from.row + to.row) / 2, col: from.col };
    }
    
    // Handle en passant capture
    if (moveData.isEnPassant) {
        board[from.row][to.col] = '';
    }
    
    // Handle castling
    if (moveData.isCastling) {
        board[to.row][moveData.rookTo] = board[to.row][moveData.rookFrom];
        board[to.row][moveData.rookFrom] = '';
    }
    
    // Move the piece
    board[to.row][to.col] = piece;
    board[from.row][from.col] = '';
    
    // Handle pawn promotion
    if (piece.toLowerCase() === 'p' && (to.row === 0 || to.row === 7)) {
        board[to.row][to.col] = piece === 'P' ? 'Q' : 'q';
    }
    
    // Update castling rights
    if (piece.toLowerCase() === 'k') {
        castlingRights[currentTurn].kingSide = false;
        castlingRights[currentTurn].queenSide = false;
    }
    if (piece.toLowerCase() === 'r') {
        const baseRow = currentTurn === 'white' ? 7 : 0;
        if (from.row === baseRow) {
            if (from.col === 0) castlingRights[currentTurn].queenSide = false;
            if (from.col === 7) castlingRights[currentTurn].kingSide = false;
        }
    }
    
    moveHistory.push({ from, to, piece });
    selectedSquare = null;
    possibleMoves = [];
    
    // Switch turns
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    
    // Check game state
    const inCheck = isKingInCheck(currentTurn);
    const hasLegalMoves = hasAnyLegalMoves(currentTurn);
    
    if (!hasLegalMoves) {
        gameOver = true;
        if (inCheck) {
            // Checkmate
            const winner = currentTurn === 'white' ? 'Black' : 'White';
            turnIndicator.textContent = `Checkmate! ${winner} wins!`;
            turnIndicator.style.color = '#ef4444';
        } else {
            // Stalemate
            turnIndicator.textContent = 'Stalemate! Draw!';
            turnIndicator.style.color = '#f59e0b';
        }
    } else {
        updateTurnIndicator(inCheck);
    }
}

function updateTurnIndicator(inCheck = false) {
    const turnText = `${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}'s Turn`;
    if (inCheck) {
        turnIndicator.textContent = `${turnText} - CHECK!`;
        turnIndicator.style.color = '#ef4444';
    } else {
        turnIndicator.textContent = turnText;
        turnIndicator.style.color = '#14b8a6';
    }
}

function hasAnyLegalMoves(colour) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && isPieceColour(piece, colour)) {
                const legalMoves = getLegalMoves(row, col);
                if (legalMoves.length > 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

resetBtn.addEventListener('click', initialiseBoard);
initialiseBoard();