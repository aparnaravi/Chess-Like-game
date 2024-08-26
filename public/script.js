const socket = new WebSocket('ws://localhost:8080');
let gameState = {};
let selectedCharacter = null;
let selectedPosition = null;

const boardElement = document.getElementById('board');
const controlsElement = document.getElementById('controls');
const statusElement = document.getElementById('status');
const historyListElement = document.getElementById('history-list');
const capturedListElement = document.getElementById('captured-list');

socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'init' || message.type === 'update') {
        gameState = message.data;
        renderBoard();
        updateStatus();
        renderHistory();
        renderCaptured();
    } else if (message.type === 'invalid') {
        alert(message.message);
    }
});

function renderBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (gameState.grid[row][col]) {
                const [player, character] = gameState.grid[row][col].split('-');
                cell.classList.add(player);
                cell.textContent = character;

                // Check if this cell is the selected one
                if (selectedPosition && selectedPosition.row === row && selectedPosition.col === col) {
                    cell.classList.add('selected');
                }

                // Only allow selecting if it's the current player's character
                if (player === gameState.currentPlayer) {
                    cell.addEventListener('click', () => selectCharacter(character, row, col));
                }
            }

            boardElement.appendChild(cell);
        }
    }
}

function selectCharacter(character, row, col) {
    selectedCharacter = character;
    selectedPosition = { row, col };
    renderBoard();
    renderControls();
}

function renderControls() {
    controlsElement.innerHTML = '';
    if (!selectedCharacter) return;

    const directions = ['L', 'R', 'F', 'B'];
    const diagonalDirections = ['FL', 'FR', 'BL', 'BR'];

    // Show diagonal directions for Hero2
    if (selectedCharacter === 'H2') {
        diagonalDirections.forEach(dir => {
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.textContent = dir;
            btn.addEventListener('click', () => makeMove(dir));
            controlsElement.appendChild(btn);
        });
    } else {
        directions.forEach(dir => {
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.textContent = dir;
            btn.addEventListener('click', () => makeMove(dir));
            controlsElement.appendChild(btn);
        });
    }
}

function makeMove(direction) {
    if (!selectedCharacter) return;

    socket.send(JSON.stringify({
        player: gameState.currentPlayer,
        character: selectedCharacter,
        move: direction
    }));

    // Clear selection after making a move
    selectedCharacter = null;
    selectedPosition = null;
}

function renderHistory() {
    historyListElement.innerHTML = '';
    gameState.moveHistory.forEach((move, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${move}`;
        historyListElement.appendChild(listItem);
    });
}

function renderCaptured() {
    capturedListElement.innerHTML = '';
    gameState.capturedHistory.forEach((capture, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${capture}`;
        capturedListElement.appendChild(listItem);
    });
}

function updateStatus() {
    if (gameState.winner) {
        statusElement.textContent = `Player ${gameState.winner} wins!`;
    } else {
        statusElement.textContent = `Current Turn: Player ${gameState.currentPlayer}`;
    }
}
