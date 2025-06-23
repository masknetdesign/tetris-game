// Configurações do jogo
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Cores das peças
const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

// Definição das peças (tetrominós)
const PIECES = {
    I: [
        [1, 1, 1, 1]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1]
    ]
};

class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.board = this.createBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        this.initializeElements();
        this.bindEvents();
        this.generateNextPiece();
        this.spawnPiece();
        this.draw();
    }
    
    createBoard() {
        return Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.linesElement = document.getElementById('lines');
        this.levelElement = document.getElementById('level');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.restartBtn = document.getElementById('restartBtn');
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restartGame());
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        switch(e.code) {
            case 'ArrowLeft':
                e.preventDefault();
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.rotatePiece();
                break;
            case 'Space':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }
    
    generateNextPiece() {
        const pieces = Object.keys(PIECES);
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        this.nextPiece = {
            type: randomPiece,
            shape: PIECES[randomPiece],
            x: 0,
            y: 0
        };
        this.drawNextPiece();
    }
    
    spawnPiece() {
        if (this.nextPiece) {
            this.currentPiece = {
                ...this.nextPiece,
                x: Math.floor(BOARD_WIDTH / 2) - Math.floor(this.nextPiece.shape[0].length / 2),
                y: 0
            };
            
            if (this.isCollision(this.currentPiece, 0, 0)) {
                this.gameOver();
                return;
            }
            
            this.generateNextPiece();
        }
    }
    
    movePiece(dx, dy) {
        if (this.isCollision(this.currentPiece, dx, dy)) {
            if (dy > 0) {
                this.placePiece();
                this.clearLines();
                this.spawnPiece();
            }
            return false;
        }
        
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        return true;
    }
    
    rotatePiece() {
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (this.isCollision(this.currentPiece, 0, 0)) {
            this.currentPiece.shape = originalShape;
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        
        return rotated;
    }
    
    isCollision(piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    if (boardX < 0 || boardX >= BOARD_WIDTH || 
                        boardY >= BOARD_HEIGHT || 
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.type;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // Verificar a mesma linha novamente
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += this.calculateScore(linesCleared);
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
            this.updateUI();
        }
    }
    
    calculateScore(linesCleared) {
        const baseScore = [0, 40, 100, 300, 1200];
        return baseScore[linesCleared] * this.level;
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.linesElement.textContent = this.lines;
        this.levelElement.textContent = this.level;
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.gameLoop();
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? 'Continuar' : 'Pausar';
        
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden');
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }
    
    restartGame() {
        this.board = this.createBoard();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOverElement.classList.add('hidden');
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pausar';
        this.generateNextPiece();
        this.spawnPiece();
        this.updateUI();
        this.draw();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        const now = Date.now();
        if (now - this.dropTime > this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTime = now;
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    draw() {
        // Limpar canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar tabuleiro
        this.drawBoard();
        
        // Desenhar peça atual
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.ctx);
        }
        
        // Desenhar grade
        this.drawGrid();
    }
    
    drawBoard() {
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.ctx.fillStyle = COLORS[this.board[y][x]];
                    this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    this.ctx.strokeStyle = '#fff';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }
    
    drawPiece(piece, context) {
        context.fillStyle = COLORS[piece.type];
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const drawX = (piece.x + x) * BLOCK_SIZE;
                    const drawY = (piece.y + y) * BLOCK_SIZE;
                    context.fillRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
                    context.strokeStyle = '#fff';
                    context.lineWidth = 1;
                    context.strokeRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * BLOCK_SIZE, 0);
            this.ctx.lineTo(x * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * BLOCK_SIZE);
            this.ctx.lineTo(BOARD_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
            this.ctx.stroke();
        }
    }
    
    drawNextPiece() {
        if (!this.nextPiece) return;
        
        // Limpar canvas da próxima peça
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const piece = this.nextPiece;
        const blockSize = 20;
        const offsetX = (this.nextCanvas.width - piece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - piece.shape.length * blockSize) / 2;
        
        this.nextCtx.fillStyle = COLORS[piece.type];
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const drawX = offsetX + x * blockSize;
                    const drawY = offsetY + y * blockSize;
                    this.nextCtx.fillRect(drawX, drawY, blockSize, blockSize);
                    this.nextCtx.strokeStyle = '#fff';
                    this.nextCtx.lineWidth = 1;
                    this.nextCtx.strokeRect(drawX, drawY, blockSize, blockSize);
                }
            }
        }
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});
