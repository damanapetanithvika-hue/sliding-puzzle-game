class SlidingPuzzle {
  constructor() {
    this.gridSize = 4;
    this.tiles = [];
    this.moves = 0;
    this.startTime = null;
    this.timerInterval = null;
    this.isGameWon = false;
    this.bestKey = 'sliding-puzzle-best';

    this.gameBoard = document.getElementById('gameBoard');
    this.movesDisplay = document.getElementById('moves');
    this.timerDisplay = document.getElementById('timer');
    this.bestScoreDisplay = document.getElementById('bestScore');
    this.statusMessage = document.getElementById('status');
    this.newGameBtn = document.getElementById('newGameBtn');
    this.shuffleBtn = document.getElementById('shuffleBtn');
    this.solveBtn = document.getElementById('solveBtn');
    this.difficultySelect = document.getElementById('difficulty');

    this.attachEventListeners();
    this.updateBestDisplay();
    this.initGame();
    document.addEventListener('keydown', (event) => this.handleKeyboardMove(event));
  }

  attachEventListeners() {
    this.newGameBtn.addEventListener('click', () => this.initGame());
    this.shuffleBtn.addEventListener('click', () => this.shuffleBoard());
    this.solveBtn.addEventListener('click', () => this.giveHint());
    this.difficultySelect.addEventListener('change', (event) => {
      this.gridSize = Number(event.target.value);
      this.initGame();
    });
  }

  getBestKey() {
    return `${this.bestKey}-${this.gridSize}`;
  }

  updateBestDisplay() {
    const stored = localStorage.getItem(this.getBestKey());
    const best = stored ? JSON.parse(stored) : null;

    if (!best) {
      this.bestScoreDisplay.textContent = '--';
      return;
    }

    this.bestScoreDisplay.textContent = `${best.moves} / ${this.formatTime(best.seconds)}`;
  }

  initGame() {
    this.tiles = this.createSolvedBoard();
    this.moves = 0;
    this.isGameWon = false;
    this.clearTimer();
    this.startTime = null;
    this.timerDisplay.textContent = '0:00';
    this.updateDisplay();
    this.render();
    this.updateBestDisplay();
    this.setStatus('Ready to play. Start sliding tiles!', 'info');
    this.shuffleBoard(true);
  }

  createSolvedBoard() {
    const total = this.gridSize * this.gridSize;
    const solved = Array.from({ length: total }, (_, index) => index + 1);
    solved[total - 1] = 0;
    return solved;
  }

  shuffleBoard(isInitial = false) {
    const totalMoves = this.gridSize * this.gridSize * 20;
    const board = this.createSolvedBoard();
    let emptyIndex = board.indexOf(0);

    for (let i = 0; i < totalMoves; i += 1) {
      const neighbors = this.getNeighbors(emptyIndex);
      const randomIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
      [board[emptyIndex], board[randomIndex]] = [board[randomIndex], board[emptyIndex]];
      emptyIndex = randomIndex;
    }

    this.tiles = board;
    this.moves = 0;
    this.isGameWon = false;
    this.clearTimer();
    this.startTime = null;
    this.timerDisplay.textContent = '0:00';
    this.updateDisplay();
    this.render();

    if (!isInitial) {
      this.setStatus('Board shuffled. Go!', 'info');
    }
  }

  getNeighbors(index) {
    const row = Math.floor(index / this.gridSize);
    const col = index % this.gridSize;
    const neighbors = [];

    if (row > 0) neighbors.push(index - this.gridSize);
    if (row < this.gridSize - 1) neighbors.push(index + this.gridSize);
    if (col > 0) neighbors.push(index - 1);
    if (col < this.gridSize - 1) neighbors.push(index + 1);

    return neighbors;
  }

  moveTile(index) {
    if (this.isGameWon) return;

    const emptyIndex = this.tiles.indexOf(0);
    if (!this.getNeighbors(emptyIndex).includes(index)) return;

    [this.tiles[index], this.tiles[emptyIndex]] = [this.tiles[emptyIndex], this.tiles[index]];
    this.moves += 1;

    if (!this.startTime) {
      this.startTime = Date.now();
      this.startTimer();
    }

    this.updateDisplay();
    this.render();

    if (this.checkWin()) {
      this.winGame();
    }
  }

  checkWin() {
    const solved = this.createSolvedBoard();
    return JSON.stringify(this.tiles) === JSON.stringify(solved);
  }

  winGame() {
    this.isGameWon = true;
    this.clearTimer();

    const timeTaken = this.getElapsedSeconds();
    const best = this.readBest();
    const isNewBest = !best || timeTaken < best.seconds || (timeTaken === best.seconds && this.moves < best.moves);

    if (isNewBest) {
      localStorage.setItem(this.getBestKey(), JSON.stringify({ moves: this.moves, seconds: timeTaken }));
      this.updateBestDisplay();
      this.setStatus(`You solved it! New best: ${this.moves} moves in ${this.formatTime(timeTaken)}.`, 'success');
    } else {
      this.setStatus(`Solved! Final score: ${this.moves} moves in ${this.formatTime(timeTaken)}.`, 'success');
    }
  }

  readBest() {
    const saved = localStorage.getItem(this.getBestKey());
    return saved ? JSON.parse(saved) : null;
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timerDisplay.textContent = this.formatTime(this.getElapsedSeconds());
    }, 1000);
  }

  getElapsedSeconds() {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  updateDisplay() {
    this.movesDisplay.textContent = this.moves;
    this.timerDisplay.textContent = this.formatTime(this.getElapsedSeconds());
  }

  render() {
    this.gameBoard.innerHTML = '';
    this.gameBoard.style.gridTemplateColumns = `repeat(${this.gridSize}, minmax(0, 1fr))`;

    this.tiles.forEach((tile, index) => {
      const tileElement = document.createElement('button');
      tileElement.type = 'button';
      tileElement.className = 'tile';

      if (tile === 0) {
        tileElement.classList.add('empty');
        tileElement.setAttribute('aria-label', 'empty tile');
      } else {
        tileElement.textContent = tile;
        tileElement.setAttribute('aria-label', `Tile ${tile}`);
        tileElement.style.background = this.getTileColor(tile);
        tileElement.addEventListener('click', () => this.moveTile(index));
      }

      this.gameBoard.appendChild(tileElement);
    });
  }

  getTileColor(value) {
    const palette = [
      '#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#14b8a6', '#ef4444', '#f97316',
      '#38bdf8', '#84cc16', '#a855f7', '#f43f5e', '#22c55e', '#facc15', '#3b82f6', '#f472b6'
    ];
    return palette[(value - 1) % palette.length];
  }

  giveHint() {
    if (this.isGameWon) {
      this.setStatus('Already solved! Great job.', 'success');
      return;
    }

    const emptyIndex = this.tiles.indexOf(0);
    const neighbors = this.getNeighbors(emptyIndex);
    let bestMove = null;
    let bestScore = Infinity;

    for (const index of neighbors) {
      const candidate = [...this.tiles];
      [candidate[index], candidate[emptyIndex]] = [candidate[emptyIndex], candidate[index]];
      const score = this.manhattanScore(candidate);
      if (score < bestScore) {
        bestScore = score;
        bestMove = index;
      }
    }

    if (bestMove !== null) {
      this.moveTile(bestMove);
      this.setStatus('Hint used: a promising move was made.', 'warning');
    }
  }

  manhattanScore(board) {
    let total = 0;
    const solved = this.createSolvedBoard();

    board.forEach((tile, index) => {
      if (tile === 0) return;
      const targetIndex = solved.indexOf(tile);
      const currentRow = Math.floor(index / this.gridSize);
      const currentCol = index % this.gridSize;
      const targetRow = Math.floor(targetIndex / this.gridSize);
      const targetCol = targetIndex % this.gridSize;
      total += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
    });

    return total;
  }

  handleKeyboardMove(event) {
    if (this.isGameWon) return;

    const blankIndex = this.tiles.indexOf(0);
    const row = Math.floor(blankIndex / this.gridSize);
    const col = blankIndex % this.gridSize;
    const key = event.key;
    let targetIndex = null;

    if (key === 'ArrowLeft' && col < this.gridSize - 1) {
      targetIndex = blankIndex + 1;
    } else if (key === 'ArrowRight' && col > 0) {
      targetIndex = blankIndex - 1;
    } else if (key === 'ArrowUp' && row < this.gridSize - 1) {
      targetIndex = blankIndex + this.gridSize;
    } else if (key === 'ArrowDown' && row > 0) {
      targetIndex = blankIndex - this.gridSize;
    }

    if (targetIndex !== null) {
      event.preventDefault();
      this.moveTile(targetIndex);
    }
  }

  setStatus(message, tone) {
    this.statusMessage.textContent = message;
    this.statusMessage.className = `status-message ${tone}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SlidingPuzzle();
});
