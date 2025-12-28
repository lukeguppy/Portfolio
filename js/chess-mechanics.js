
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Chess === 'undefined') {
        console.error('Chess.js library not found!');
        return;
    }

    const chessboard = document.querySelector('.chessboard');
    if (!chessboard) return;

    // Capture initial board state for reset
    const initialBoardHTML = chessboard.innerHTML;

    // Game setup
    const startFen = "r1bq1rk1/ppp1bp1p/2n1pnp1/1N1pN2Q/2BPP3/2P3P1/PP3PBP/R4RK1 w - - 0 1";

    // Complete game sequence in PGN format 
    const pgn = `[Variant "From Position"]
[FEN "r1bq1rk1/ppp1bp1p/2n1pnp1/1N1pN2Q/2BPP3/2P3P1/PP3PBP/R4RK1 w - - 0 1"]

1. Qe2 dxc4 2. Nxc4 Nb8 3. e5 Ne8 4. Ne3 c6 5. Na3 Nd7 6. Rad1 Ng7 7. c4 Nb6 8. f4 Nf5 9. Nxf5 gxf5 10. Nc2 Kh8 11. Kh1 f6 12. g4 fxg4 13. a4 a5 14. exf6 Bxf6 15. Be4 Rf7 16. Ne3 Bd7 17. Nxg4 Rg7 18. Rg1 Be8 19. Qf3 Bh5 20. Qh3 Bxg4 21. Rxg4 Qe7 22. Rxg7 Qxg7 23. Rg1 Qe7 24. Qc3 Rd8 25. Rg3 Bxd4 26. Qd3 Bf6 27. Qf3 Rg8 28. Qb3 Qb4 29. Qd1 Qxc4 30. Qe1 Nd5 31. Rh3 Rg7 32. Rg3 Qd4 33. b4 Rxg3 34. hxg3 Qxb4 35. Qxb4 axb4 36. g4 Nxf4 37. Bc2 b6 38. Bd3 Nxd3 39. Kg2 Kg7 40. Kf1 Bg5 41. a5 b3 42. Ke2 b2 43. Kxd3 b1=Q+ 44. Ke2 bxa5 45. Kf2 Qd1 46. Kg2 Qe2+ 47. Kh3 Kf6 48. Kg3 Qf1 49. Kh2 Bf4#`;

    let game;
    let isAnimating = false;

    // Initialize Game
    function initGame() {
        console.log("Initialising Chess Animation...");

        // Use the initial board state we captured
        game = new Chess();

        // Load starting position
        const loadedFen = game.load(startFen);
        if (!loadedFen) {
            console.error("Failed to load starting FEN:", startFen);
            return;
        }

        console.log('FEN loaded. Starting animation loop...');
        isAnimating = true;
        playHistory();
    }

    async function playHistory() {
        // Clean up the PGN string to get a list of raw moves
        const moves = pgn.replace(/\d+\./g, '').replace(/\s+/g, ' ').trim().split(' ');

        for (const moveSan of moves) {
            if (!isAnimating) break;

            const move = game.move(moveSan);
            if (!move) continue;

            await new Promise(resolve => setTimeout(resolve, 1400));

            await performMove(move);
        }

        // Check for checkmate at the end of the sequence
        if (game.in_checkmate()) {
            highlightCheckmate();
        }

        await new Promise(resolve => setTimeout(resolve, 10000));

        if (isAnimating) {
            resetGame();
        }
    }

    function performMove(move) {
        return new Promise(resolve => {
            const fromSquare = move.from;
            const toSquare = move.to;

            const piece = chessboard.querySelector(`.sq-${fromSquare}:not(.captured)`);
            const targetPiece = chessboard.querySelector(`.sq-${toSquare}:not(.captured)`);

            // Handle castling
            if (move.flags.includes('k') || move.flags.includes('q')) {
                handleCastling(move);
            }

            // Capture piece
            if (targetPiece) {
                targetPiece.classList.add('captured');
            }

            // Move piece via CSS class transition
            if (piece) {
                piece.classList.add('moving');
                piece.classList.remove(`sq-${fromSquare}`);
                piece.classList.add(`sq-${toSquare}`);
            }

            // Clean up after the animation completes
            setTimeout(() => {
                // Handle pawn promotion
                if (move.promotion) {
                    const colorPrefix = move.color;
                    const newType = move.promotion.toUpperCase();

                    if (piece) {
                        const newSrc = `/Portfolio/images/chess-pieces/${colorPrefix}${newType}.svg`;
                        piece.src = newSrc;
                        piece.classList.remove('pawn');
                    }
                }

                if (piece) piece.classList.remove('moving');
                resolve(null);
            }, 1200);
        });
    }

    function handleCastling(move) {
        let rookFrom, rookTo;

        if (move.color === 'w') {
            if (move.flags.includes('k')) {
                rookFrom = 'h1'; rookTo = 'f1';
            } else {
                rookFrom = 'a1'; rookTo = 'd1';
            }
        } else {
            if (move.flags.includes('k')) {
                rookFrom = 'h8'; rookTo = 'f8';
            } else {
                rookFrom = 'a8'; rookTo = 'd8';
            }
        }

        const rook = chessboard.querySelector(`.sq-${rookFrom}:not(.captured)`);
        if (rook) {
            rook.classList.remove(`sq-${rookFrom}`);
            rook.classList.add(`sq-${rookTo}`);
        }
    }

    function highlightCheckmate() {
        const turn = game.turn();
        const kingColor = turn === 'w' ? 'w' : 'b';

        // Locate the king on the board
        const board = game.board();
        let kingSquare = null;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (p && p.type === 'k' && p.color === kingColor) {
                    // Convert board coordinates to square notation
                    const file = String.fromCharCode(97 + c);
                    const rank = 8 - r;
                    kingSquare = file + rank;
                    break;
                }
            }
            if (kingSquare) break;
        }

        if (kingSquare) {
            // Square centers (these match piece positioning)
            const colMap = { 'a': 6.25, 'b': 18.75, 'c': 31.25, 'd': 43.75, 'e': 56.25, 'f': 68.75, 'g': 81.25, 'h': 93.75 };
            const rowMap = { '8': 6.25, '7': 18.75, '6': 31.25, '5': 43.75, '4': 56.25, '3': 68.75, '2': 81.25, '1': 93.75 };
            const col = kingSquare.charAt(0);
            const row = kingSquare.charAt(1);

            // Create glowing overlay on board square
            const glowOverlay = document.createElement('div');
            glowOverlay.className = 'checkmate-square-glow';
            const leftPos = colMap[col];
            const topPos = rowMap[row];
            glowOverlay.style.left = leftPos + '%';
            glowOverlay.style.top = topPos + '%';
            chessboard.appendChild(glowOverlay);
        }
    }

    function resetGame() {
        isAnimating = false;
        chessboard.innerHTML = initialBoardHTML;
        setTimeout(() => {
            initGame();
        }, 1000);
    }

    // Start animation
    setTimeout(initGame, 1000);
});
