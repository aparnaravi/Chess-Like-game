Turn-Based Chess-Like Game
Overview
This project implements a turn-based chess-like game with a server-client architecture. The game is played between two players on a 5x5 grid. Each player controls a team of 5 characters, which include Pawns (P1, P2, P3), Hero1 (H1), and Hero2 (H2). The game is developed using Node.js for the server, WebSocket for real-time communication, and plain HTML/CSS/JavaScript for the client interface.

Characters and Movement
Pawn (P1, P2, P3):

Moves one block in any direction (Left, Right, Forward, or Backward).
Move commands: L (Left), R (Right), F (Forward), B (Backward).
Hero1 (H1):

Moves two blocks straight in any direction. Kills any opponent's character in its path.
Move commands: L (Left), R (Right), F (Forward), B (Backward).
Hero2 (H2):

Moves two blocks diagonally in any direction. Kills any opponent's character in its path.
Move commands: FL (Forward-Left), FR (Forward-Right), BL (Backward-Left), BR (Backward-Right).
Game Flow
Initial Setup: Players start by arranging their characters on their respective starting rows.
Turns: Players alternate turns, making one move per turn.
Combat: If a character moves to a space occupied by an opponent's character, the opponent's character is removed from the game.
Winning: The game ends when one player eliminates all of their opponent's characters.
Setup Instructions
Prerequisites
Node.js installed on your machine.
Installation
Clone the repository:


git clone https://github.com/your-username/chess-like-game.git
cd chess-like-game
Install dependencies:

Navigate to the project directory and install the required Node.js packages.


npm install
Running the Game
Start the server:

Run the following command to start the server:


node server.js
The server will start on port 8080.

Open the game in a browser:

Open your web browser and navigate to:


http://localhost:8080
The game will load in your browser. You can now play the game by following the on-screen instructions.

Playing the Game
Click on a character to select it. The available moves for that character will be displayed as buttons.
Click on a move direction to move the character.
The move history and captured history will be displayed below the game board.


Project Structure
server.js: Main server-side code that handles game logic, WebSocket communication, and game state management.
public/index.html: The main HTML file for the client-side interface.
public/script.js: Client-side JavaScript that handles game interaction, rendering, and communication with the server.
public/style.css: (Optional) A file for custom styles, if needed.
