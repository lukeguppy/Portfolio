
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
        console.log("Initializing Chess Animation...");
        game = new Chess();

        // 1. Explicitly load the starting position
        const loadedFen = game.load(startFen);
        if (!loadedFen) {
            console.error("Failed to load starting FEN:", startFen);
            return;
        }

        console.log("FEN loaded. Parsing moves manually...");

        // 2. Manual Move Parsing
        // The PGN string contains "1. Qe2 dxc4 2. Nxc4 ..."
        // We want a clean list of SAN moves: ["Qe2", "dxc4", "Nxc4", ...]
        const pgnMoves = `1. Qe2 dxc4 2. Nxc4 Nb8 3. e5 Ne8 4. Ne3 c6 5. Na3 Nd7 6. Rad1 Ng7 7. c4 Nb6 8. f4 Nf5 9. Nxf5 gxf5 10. Nc2 Kh8 11. Kh1 f6 12. g4 fxg4 13. a4 a5 14. exf6 Bxf6 15. Be4 Rf7 16. Ne3 Bd7 17. Nxg4 Rg7 18. Rg1 Be8 19. Qf3 Bh5 20. Qh3 Bxg4 21. Rxg4 Qe7 22. Rxg7 Qxg7 23. Rg1 Qe7 24. Qc3 Rd8 25. Rg3 Bxd4 26. Qd3 Bf6 27. Qf3 Rg8 28. Qb3 Qb4 29. Qd1 Qxc4 30. Qe1 Nd5 31. Rh3 Rg7 32. Rg3 Qd4 33. b4 Rxg3 34. hxg3 Qxb4 35. Qxb4 axb4 36. g4 Nxf4 37. Bc2 b6 38. Bd3 Nxd3 39. Kg2 Kg7 40. Kf1 Bg5 41. a5 b3 42. Ke2 b2 43. Kxd3 b1=Q+ 44. Ke2 bxa5 45. Kf2 Qd1 46. Kg2 Qe2+ 47. Kh3 Kf6 48. Kg3 Qf1 49. Kh2 Bf4#`;

        // Regex to match move SANs (ignoring move numbers like "1.")
        // \d+\. matches "1."
        // We just split by space and filter out anything ending in "."
        // But better: match non-space sequences that don't end in dot?
        // Let's just do a rough clean.

        let moves = pgnMoves
            .replace(/\d+\.+/g, '') // Remove move numbers "1." "23."
            .replace(/\s+/g, ' ')   // Normalize spaces
            .trim()
            .split(' ');

        // Verify moves by running them on a ghost board
        const verifiedHistory = [];

        for (let san of moves) {
            if (!san) continue;

            // Try to make the move
            const move = game.move(san);
            if (move) {
                // If verbose is needed later, we can reconstruct or just use the move object returned
                // We need to store the FULL move object for performance (capture flags etc)
                verifiedHistory.push(move);
            } else {
                console.error(`Invalid move encountered: ${san}`);
                // Debug current FEN to see why it failed
                console.log("Current FEN at fail:", game.fen());
                return;
            }
        }

        console.log(`Successfully parsed ${verifiedHistory.length} moves. Starting animation.`);

        // Reset board to start for the animation visualizer (since we just played them all internally)
        game.load(startFen);

        // Start Animation Loop
        playHistory(verifiedHistory);
    }

    async function playHistory(history) {
        if (isAnimating) return;
        isAnimating = true;

        // Loop through move objects
        for (const move of history) {
            // Re-apply move to internal engine to keep state (e.g. for en passant checks if we needed engine)
            // But we have the full move object already. 
            // IMPORTANT: performMove interacts with DOM. 
            // We should also update the engine state just in case we rely on it?
            // Actually, performMove logic is purely DOM class swapping based on 'from' and 'to'.
            // It doesn't query the engine. So we are good.

            await new Promise(resolve => setTimeout(resolve, 1400)); // Delay between moves (matches 1.2s transition + buffer)

            await performMove(move);
        }

        console.log("Game finished. Waiting for reset...");
        await new Promise(resolve => setTimeout(resolve, 10000));

        resetGame();
    }

    function performMove(move) {
        return new Promise(resolve => {
            const fromSquare = move.from; // e.g., 'e2'
            const toSquare = move.to;     // e.g., 'e4'

            const piece = chessboard.querySelector(`.sq-${fromSquare}:not(.captured)`);

            if (!piece) {
                console.warn(`No piece found at ${fromSquare} for move ${move.san}`);
                resolve();
                return;
            }

            // Bring to top
            piece.classList.add('moving');

            // 2. Handle Castling
            if (move.flags.includes('k') || move.flags.includes('q')) {
                handleCastling(move);
            }

            // 3. Handle Capture
            // If there's a piece currently at 'toSquare', it behaves as captured.
            const capturedPiece = chessboard.querySelector(`.sq-${toSquare}:not(.captured)`);
            if (capturedPiece) {
                // Delay the capture fade-out so it happens when the piece arrives (approx 1.0s into 1.2s move)
                setTimeout(() => {
                    capturedPiece.classList.add('captured');
                    // DO NOT remove the position class (.sq-xy) or it will teleport to top-left before fading!
                }, 1000);
            }

            // 4. Handle En Passant
            if (move.flags.includes('e')) {
                const captureSquare = toSquare[0] + fromSquare[1];
                const epPawn = chessboard.querySelector(`.sq-${captureSquare}:not(.captured)`);
                if (epPawn) {
                    epPawn.classList.add('captured');
                    epPawn.classList.remove(`sq-${captureSquare}`);
                }
            }

            // 5. Move the Piece
            // We update the class from sq-{from} to sq-{to}
            piece.classList.remove(`sq-${fromSquare}`);
            piece.classList.add(`sq-${toSquare}`);

            // 6. Handle Promotion
            if (move.promotion) {
                const colorPrefix = move.color; // 'w' or 'b'
                const newType = move.promotion.toUpperCase(); // 'Q', 'R', etc.
                setTimeout(() => {
                    const newSrc = `/images/chess-pieces/${colorPrefix}${newType}.svg`;
                    piece.src = newSrc;
                }, 600); // Wait for half the transition? Or near end.
            }

            // Remove .moving class after transition
            setTimeout(() => {
                piece.classList.remove('moving');
                resolve();
            }, 1200);
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
