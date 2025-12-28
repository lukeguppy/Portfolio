
document.addEventListener('DOMContentLoaded', () => {
    // Wait a brief moment to ensure everything is loaded, although DOMContentLoaded is usually enough.
    // We want to verify Chess is available.
    if (typeof Chess === 'undefined') {
        console.error('Chess.js library not found!');
        return;
    }

    const chessboard = document.querySelector('.chessboard');
    if (!chessboard) return;

    // 1. Capture Initial State for Reset
    // We clone the innerHTML so we can easily restore it after the game loop ends.
    const initialBoardHTML = chessboard.innerHTML;

    // 2. Game Setup
    const startFen = "r1bq1rk1/ppp1bp1p/2n1pnp1/1N1pN2Q/2BPP3/2P3P1/PP3PBP/R4RK1 w - - 0 1";

    // The PGN provided by the user. 
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

        // 1. Explicitly load the starting position
        // Utilise startFen defined above
        const loadedFen = game.load(startFen);
        if (!loadedFen) {
            console.error("Failed to load starting FEN:", startFen);
            return;
        }

        console.log("FEN loaded. Starting animation loop...");
        isAnimating = true;
        playHistory();
    }

    async function playHistory() {
        // Clean up the PGN string to get a list of raw moves
        const moves = pgn.replace(/\d+\./g, '').replace(/\s+/g, ' ').trim().split(' ');

        for (const moveSan of moves) {
            if (!isAnimating) break; // Stop if reset occurs

            // Attempt to make the move in the engine to validate and get details
            const move = game.move(moveSan);
            if (!move) continue;

            // Wait before performing the move for visual pacing
            await new Promise(resolve => setTimeout(resolve, 1400));

            // Execute the visual update
            await performMove(move);
        }

        // Check for checkmate at the end of the sequence
        if (game.in_checkmate()) {
            highlightCheckmate();
        }

        // Pause before resetting the board
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Reset the cycle
        if (isAnimating) {
            resetGame();
        }
    }

    function performMove(move) {
        return new Promise(resolve => {
            const fromSquare = move.from;
            const toSquare = move.to;

            // Identify the pieces involved
            const piece = chessboard.querySelector(`.sq-${fromSquare}:not(.captured)`);
            const targetPiece = chessboard.querySelector(`.sq-${toSquare}:not(.captured)`);

            // Apply special handling for castling
            if (move.flags.includes('k') || move.flags.includes('q')) {
                handleCastling(move);
            }

            // Handle captures (fade out the captured piece)
            if (targetPiece) {
                targetPiece.classList.add('captured');
                // Note: We do not remove the square class to prevent layout shifts
            }

            // Move the active piece
            if (piece) {
                // Apply the movement class for z-index layering
                piece.classList.add('moving');

                // DIRECT CSS TRANSITION:
                // Instead of calculating transforms manually (which caused offsets/teleporting),
                // we simply swap the position classes. The CSS transition property on 'left' and 'top'
                // will handle the smooth animation to the new percentage coordinates automatically.
                piece.classList.remove(`sq-${fromSquare}`);
                piece.classList.add(`sq-${toSquare}`);
            }

            // Clean up after the animation completes
            setTimeout(() => {
                // Handle Promotion (Queen by default)
                if (move.promotion) {
                    const colorPrefix = move.color;
                    const newType = move.promotion.toUpperCase();

                    // Update the piece image
                    if (piece) {
                        const newSrc = `/Portfolio/images/chess-pieces/${colorPrefix}${newType}.svg`;
                        piece.src = newSrc;
                        // Important: Remove 'pawn' class to reset sizing to standard piece dimensions
                        piece.classList.remove('pawn');
                    }
                }

                if (piece) piece.classList.remove('moving');
                resolve(null);
            }, 1200); // Matches the CSS transition duration
        });
    }

    function handleCastling(move) {
        let rookFrom, rookTo;

        if (move.color === 'w') {
            if (move.flags.includes('k')) { // Kingside
                rookFrom = 'h1'; rookTo = 'f1';
            } else { // Queenside
                rookFrom = 'a1'; rookTo = 'd1';
            }
        } else {
            if (move.flags.includes('k')) { // Kingside
                rookFrom = 'h8'; rookTo = 'f8';
            } else { // Queenside
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
        const turn = game.turn(); // 'w' or 'b' - who is in checkmate?
        const kingColor = turn === 'w' ? 'w' : 'b';

        // Locate the king on the board
        const board = game.board();
        let kingSquare = null;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (p && p.type === 'k' && p.color === kingColor) {
                    kingSquare = p.square;
                    break;
                }
            }
            if (kingSquare) break;
        }

        if (kingSquare) {
            const kingPiece = document.querySelector(`.sq-${kingSquare}:not(.captured)`);
            if (kingPiece) {
                kingPiece.classList.add('checkmate-glow');
            }
        }
    }

    function resetGame() {
        isAnimating = false;
        // Restore HTML
        chessboard.innerHTML = initialBoardHTML;
        // Restart loop
        setTimeout(() => {
            initGame();
        }, 1000);
    }

    // Start
    setTimeout(initGame, 1000);
});
