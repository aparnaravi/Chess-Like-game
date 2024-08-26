const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the "public" directory
app.use(express.static('public'));

// Define initial game state
let gameState = {
    grid: Array(5).fill(null).map(() => Array(5).fill(null)),
    players: {
        A: { characters: ['P1', 'H1', 'P2', 'H2', 'P3'], turn: true, team: 'A' },
        B: { characters: ['P1', 'H1', 'P2', 'H2', 'P3'], turn: false, team: 'B' }
    },
    currentPlayer: 'A',
    winner: null,
    moveHistory: [],
    capturedHistory: []
};

// Helper function to initialize the characters on the grid
function initializeCharacters() {
    gameState.grid[0] = ['A-P1', 'A-H1', 'A-P2', 'A-H2', 'A-P3'];
    gameState.grid[4] = ['B-P1', 'B-H1', 'B-P2', 'B-H2', 'B-P3'];
}

initializeCharacters();

// Function to validate moves
function validateMove(player, character, move) {
    const position = findCharacterPosition(player, character);
    if (!position) return false;

    const [row, col] = position;
    let targetRow = row, targetCol = col;

    switch (character) {
        case 'P1':
        case 'P2':
        case 'P3':
            switch (move) {
                case 'L':
                    targetCol -= 1;
                    break;
                case 'R':
                    targetCol += 1;
                    break;
                case 'F':
                    targetRow += (player === 'A' ? 1 : -1);
                    break;
                case 'B':
                    targetRow += (player === 'A' ? -1 : 1);
                    break;
                default:
                    return false;
            }
            break;

        case 'H1':
            switch (move) {
                case 'L':
                    targetCol -= 2;
                    break;
                case 'R':
                    targetCol += 2;
                    break;
                case 'F':
                    targetRow += (player === 'A' ? 2 : -2);
                    break;
                case 'B':
                    targetRow += (player === 'A' ? -2 : 2);
                    break;
                default:
                    return false;
            }
            break;

        case 'H2':
            switch (move) {
                case 'FL':
                    targetRow += (player === 'A' ? 2 : -2);
                    targetCol -= 2;
                    break;
                case 'FR':
                    targetRow += (player === 'A' ? 2 : -2);
                    targetCol += 2;
                    break;
                case 'BL':
                    targetRow += (player === 'A' ? -2 : 2);
                    targetCol -= 2;
                    break;
                case 'BR':
                    targetRow += (player === 'A' ? -2 : 2);
                    targetCol += 2;
                    break;
                default:
                    return false;
            }
            break;

        default:
            return false;
    }

    if (targetRow < 0 || targetRow > 4 || targetCol < 0 || targetCol > 4) {
        return false;
    }

    const target = gameState.grid[targetRow][targetCol];
    
    // Pawns cannot capture, so return false if the target is occupied by an opponent's character
    if (character.startsWith('P') && target && !target.startsWith(player)) {
        return false;
    }

    // Heroes (H1, H2) can capture opponent characters
    if ((character === 'H1' || character === 'H2') && target && target.startsWith(player)) {
        return false;
    }

    return { targetRow, targetCol };
}

// Find the position of a character on the grid
function findCharacterPosition(player, character) {
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            if (gameState.grid[row][col] === `${player}-${character}`) {
                return [row, col];
            }
        }
    }
    return null;
}

// Broadcast the game state to all clients
function broadcastGameState() {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'update', data: gameState }));
        }
    });
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.send(JSON.stringify({ type: 'init', data: gameState }));

    ws.on('message', (message) => {
        const { player, character, move } = JSON.parse(message);
        if (gameState.currentPlayer !== player || !gameState.players[player].characters.includes(character)) {
            ws.send(JSON.stringify({ type: 'invalid', message: 'Invalid move or not your turn.' }));
            return;
        }

        const validation = validateMove(player, character, move);
        if (!validation) {
            ws.send(JSON.stringify({ type: 'invalid', message: 'Invalid move.' }));
            return;
        }

        const { targetRow, targetCol } = validation;
        const [row, col] = findCharacterPosition(player, character);

        // Perform the move
        gameState.grid[row][col] = null;
        if (gameState.grid[targetRow][targetCol]) {
            const opponent = gameState.grid[targetRow][targetCol].split('-')[0];
            const capturedCharacter = gameState.grid[targetRow][targetCol];
            gameState.players[opponent].characters = gameState.players[opponent].characters.filter(c => c !== capturedCharacter.split('-')[1]);

            // Track the captured character
            gameState.capturedHistory.push(`${player} captured ${capturedCharacter}`);

            if (gameState.players[opponent].characters.length === 0) {
                gameState.winner = player;
            }
        }
        gameState.grid[targetRow][targetCol] = `${player}-${character}`;

        // Track the move
        gameState.moveHistory.push(`${player}-${character}:${move}`);

        // Switch turns
        gameState.currentPlayer = player === 'A' ? 'B' : 'A';

        // Broadcast the updated game state
        broadcastGameState();
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start the server
server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
